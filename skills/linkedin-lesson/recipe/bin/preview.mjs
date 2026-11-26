#!/usr/bin/env node
// Key frame before the build in the chosen look: layout frame, title, subtitle and conclusion from the card;
// measures whether the lines fit
import { parseArgs } from "node:util";
import { cpSync, existsSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { serve } from "./serve.mjs";
import { dumpDom, readOut, screenshot } from "./chrome.mjs";
import { DEFAULT_LOOK, look, lookIds, writeTheme } from "./kit.mjs";

const usage = (why) => {
  console.error(`${why ? why + "\n" : ""}usage: preview.mjs [--look ${lookIds().join("|")}] [--layout <one of the look's layouts>] --title "line 1|line 2 with an *accent*" [--sub "question under the title"] --end "…*accent*…|line 2 where the look takes it" [--series 7/30] [--sign "Author name"] [--theme <brand>/theme.json] --out frame.png`);
  process.exit(2);
};
let a;
try {
  ({ values: a } = parseArgs({
    options: {
      look: { type: "string", default: DEFAULT_LOOK }, layout: { type: "string" }, title: { type: "string" }, sub: { type: "string", default: "" }, end: { type: "string", default: "" },
      series: { type: "string", default: "" }, sign: { type: "string", default: "" }, theme: { type: "string" }, out: { type: "string" },
    },
  }));
} catch (e) {
  usage(e.message);
}
if (!a.title || !a.out) usage();
let L;
try { L = look(a.look); } catch (e) { usage(e.message); }
// font size below which a line is not shrunk: the title and conclusion must stay readable in the feed
const MIN = L.min, layouts = Object.keys(L.layouts);
a.layout = a.layout || layouts[0];
if (!layouts.includes(a.layout)) usage(`unknown layout of ${L.name}: ${a.layout}, known: ${layouts.join(", ")}`);
if (a.theme && !L.theme) usage(`the ${L.name} look takes no brand theme`);
if (a.title.split("|").length > 2) usage("title: at most two lines, break with \"|\"");
if (a.end.split("|").length > L.endLines) usage(L.endLines === 1 ? `conclusion: one line in ${L.name}, no "|"` : `conclusion: at most ${L.endLines} lines in ${L.name}`);
if (a.sub && a.title.includes("|")) usage("with a subtitle the title is one line: two lines and a question do not fit above the diagram");
if (a.series && !/^\d+\/\d+$/.test(a.series)) usage(`series is "day/total", e.g. 7/30, got: ${a.series}`);
// an accent is a pair of asterisks within one line
for (const line of [...a.title.split("|"), a.end]) if ((line.split("*").length - 1) % 2) usage(`unpaired "*" in line: ${line}`);

const out = resolve(a.out);
// a theme goes into a temporary copy of the kit, as kit.mjs puts it into a project
const kit = a.theme ? mkdtempSync(join(tmpdir(), "preview-kit-")) : L.kit;
if (a.theme) {
  cpSync(L.kit, kit, { recursive: true });
  try {
    for (const w of writeTheme(kit, resolve(a.theme))) console.error("! " + w);
  } catch (e) {
    rmSync(kit, { recursive: true, force: true });
    usage(e.message);
  }
}
const srv = await serve([["/", kit]]);
try {
  const query = { layout: a.layout, title: a.title, end: a.end, ...(a.sub && { sub: a.sub }), ...(a.series && { series: a.series }), ...(a.sign && { sign: a.sign }) };
  const url = `${srv.url}/preview.html?${new URLSearchParams(query)}`;
  const m = readOut(await dumpDom(url));
  if (!m.fontsOk) {
    console.error(`fonts did not load: line measurements are wrong (check looks/${L.id}/kit/fonts)`);
    process.exit(1);
  }
  // Chrome exits 0 silently on an unwritable path, so the folder is created up front and the old file removed
  try {
    mkdirSync(dirname(out), { recursive: true });
    rmSync(out, { force: true });
  } catch (e) {
    console.error(`screenshot not written: ${e.message}`);
    process.exit(1);
  }
  await screenshot(url, out, { width: 1080, height: 1350 });
  if (!existsSync(out)) {
    console.error(`screenshot not written: ${out}`);
    process.exit(1);
  }
  // lines shrink on their own; below MIN is too small: shorten the line or break it
  console.log(`title ${m.title} (min ${MIN.title})${m.sub == null ? "" : `, sub ${m.sub} (min ${MIN.sub})`}${m.end == null ? "" : `, end ${m.end} (min ${MIN.end})`}${a.series ? `, series ${a.series}` : ""} → ${a.out}`);
  const over = [["title", m.title], ["sub", m.sub], ["end", m.end]].filter(([k, size]) => size != null && size < MIN[k]).map(([k]) => k);
  if (over.length) {
    console.error(`does not fit on its line: ${over.join(", ")}`);
    process.exitCode = 3;
  }
} finally {
  srv.close();
  if (kit !== L.kit) rmSync(kit, { recursive: true, force: true });
}
