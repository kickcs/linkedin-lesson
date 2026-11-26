import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import vm from "node:vm";
import { page, shot } from "./helpers.mjs";
import { look } from "../skills/linkedin-lesson/recipe/bin/kit.mjs";

const CARDS = look("cards");
const kit = (p) => join(CARDS.kit, p);

const engine = await page("/cards-engine.html", "cards");
test("engine: page reported", () => assert.ok(engine.results.length > 0));
for (const x of engine.results) test(`engine: ${x.name}`, () => assert.ok(x.ok, x.error));

// the skeleton and the whole example lesson, each with the DUR it is built for
const tmp = mkdtempSync(join(tmpdir(), "cards-"));
for (const [name, src, dur] of [["system", "/layouts/system.html", CARDS.layouts.system], ["pool example", "/examples/pool/lesson.html", 100.99]]) {
  const r = await page(`/cards-layout.html?src=${src}`, "cards");
  test(`${name}: page reported`, () => assert.ok(r.results.length > 0));
  for (const x of r.results) test(`${name}: ${x.name}`, () => assert.ok(x.ok, x.error));
  test(`${name}: the timeline is DUR ${dur}`, () => assert.equal(Math.round(r.dur * 100) / 100, dur));
  test(`${name}: loop without a seam — the end matches frame 0`, async () => {
    const a = join(tmp, `${name}-0.png`), b = join(tmp, `${name}-end.png`);
    await shot(`/cards-layout.html?src=${src}&t=0`, a, "cards");
    await shot(`/cards-layout.html?src=${src}&t=end`, b, "cards");
    assert.ok(readFileSync(a).equals(readFileSync(b)), `frames differ: ${a} and ${b}`);
  });
}

// hyperframes 0.9.x check fails on Math.random in composition code
test("cards.js without Math.random, Date.now or performance.now", () => assert.doesNotMatch(readFileSync(kit("cards.js"), "utf8"), /Math\.random|Date\.now|performance\.now/));
test("cards fonts and their licenses are in place", () => {
  for (const f of ["fonts/overpass.woff2", "fonts/OFL-Overpass.txt", "fonts/jetbrains-mono-400.woff2", "fonts/OFL-JetBrainsMono.txt"]) assert.ok(existsSync(kit(f)), f);
  const lic = readFileSync(kit("LICENSES.md"), "utf8");
  for (const name of ["Overpass", "JetBrains Mono", "Lucide", "GSAP"]) assert.match(lic, new RegExp(name));
});
test("skeleton, example and preview load only fonts that exist in kit", () => {
  const pages = [[join(CARDS.layoutDir, "system.html"), /url\("assets\/kit\/(fonts\/[^"]+)"\)/g]];
  pages.push([new URL("../skills/linkedin-lesson/examples/pool/lesson.html", import.meta.url), /url\("assets\/kit\/(fonts\/[^"]+)"\)/g]);
  pages.push([kit("preview.html"), /url\("(fonts\/[^"]+)"\)/g]);
  for (const [file, re] of pages) {
    const found = [...readFileSync(file, "utf8").matchAll(re)].map((m) => m[1]);
    for (const role of ["overpass", "jetbrains-mono"]) assert.ok(found.some((f) => f.includes(role)), `${file}: no ${role}`);
    for (const f of found) assert.ok(existsSync(kit(f)), `${file}: ${f}`);
  }
});
test("index.html loads GSAP, icons.js, then cards.js from assets/kit", () => {
  const html = readFileSync(join(CARDS.layoutDir, "index.html"), "utf8");
  const [a, b, c] = ["gsap.min.js", "icons.js", "cards.js"].map((f) => html.indexOf(`assets/kit/${f}`));
  assert.ok(a > 0 && b > a && c > b, "gsap.min.js, icons.js, cards.js");
});
test("the icons of both looks are one file", () => assert.ok(readFileSync(kit("icons.js")).equals(readFileSync(join(look("board").kit, "icons.js")))));

// both engines pace the steps and time the conclusion by the same formula, so pace.mjs reads them alike
test("Cards.pace and Scene.pace give the same steps, Cards.timing the same FADE and DUR as the board skeleton", () => {
  const ctx = {};
  ctx.window = ctx;
  vm.createContext(ctx);
  for (const f of ["board/kit/theme.js", "board/kit/rough.js", "board/kit/icons.js", "board/kit/sketch.js", "board/kit/scene.js", "cards/kit/cards.js"]) {
    vm.runInContext(readFileSync(new URL(`../skills/linkedin-lesson/recipe/looks/${f}`, import.meta.url), "utf8"), ctx);
  }
  const steps = [{ text: ["Anna", "Ben", "a longer caption of the first step"], motion: 0.5, lead: 0.1 }, { text: ["x"], motion: 2.4 }, { text: ["two", "lines of text"], motion: 1, lead: 0.3 }];
  const strip = (r) => JSON.stringify(r);
  assert.equal(strip(ctx.Cards.pace(steps, 0.2, 16.5)), strip(ctx.Scene.pace(steps, 0.2, 16.5)));
  // FADE = end + characters / 16.5 + 1, as frame.md and pace.mjs count it
  const end = 9.5, text = "Wait *outside* the transaction, ok.", chars = text.replace(/\*/g, "").length;
  const t = ctx.Cards.timing(end, text);
  assert.equal(t.FADE, Math.round((end + chars / 16.5 + 1) * 100) / 100);
  assert.equal(t.DUR, Math.round((t.FADE + 0.7) * 100) / 100);
});
