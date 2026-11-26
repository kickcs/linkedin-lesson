#!/usr/bin/env node
// Reading pace of a built lesson: when each step starts, FADE, DUR and the times the build needs,
// checked against the lesson's timeline and the data-duration in index.html
import { existsSync, readFileSync, realpathSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { serve } from "./serve.mjs";
import { dumpDom, readOut } from "./chrome.mjs";

export const CPS = 16.5, TAIL = 0.7, TOL = 0.06;
const here = dirname(fileURLToPath(import.meta.url));

// data-duration of #root and #lesson; "\s" keeps data-composition-id="lesson" from matching
export function dataDurations(html) {
  const get = (id) => {
    const tag = html.match(new RegExp(`<[^>]*\\sid="${id}"[^>]*>`));
    const d = tag && tag[0].match(/data-duration="([\d.]+)"/);
    return d ? +d[1] : null;
  };
  return { root: get("root"), lesson: get("lesson") };
}

const f = (x) => x.toFixed(2);

// m is what pace.html reports; dd is dataDurations(index.html)
export function verdict(m, dd) {
  const lines = [], errors = [];
  if (m.error) errors.push(`the composition threw: ${m.error}`);
  m.calls.forEach((steps, k) => {
    if (m.calls.length > 1) lines.push(`Scene.pace call ${k + 1}`);
    steps.forEach((st, i) => lines.push(`${String(i).padStart(2)}  ${f(st.at).padStart(6)} → ${f(st.end).padStart(6)}  ${String(st.chars).padStart(3)} ch  ${st.label.slice(0, 44)}`));
  });
  if (!m.calls.length) lines.push("no Scene.pace call: the step times are set by hand");
  if (!m.conclusion) {
    errors.push("no Sketch.conclusion call");
    return { lines, errors };
  }
  const chars = m.conclusion.text.replace(/\*/g, "").length, hold = chars / CPS + 1;
  const paceFade = m.conclusion.at + hold;
  lines.push(`conclusion at ${f(m.conclusion.at)}, ${chars} ch, holds ${f(hold)} s: FADE ${f(paceFade)}, DUR ${f(paceFade + TAIL)}`);

  if (m.dur == null) {
    if (!m.error) errors.push('no timeline: window.__timelines["lesson"] is not registered');
  } else if (m.fade == null) errors.push("the lesson layer does not fade out by the end of the timeline");
  else {
    if (m.fade < paceFade - 0.1) errors.push(`the lesson fades at ${f(m.fade)}: the conclusion holds ${f(m.fade - m.conclusion.at)} s, it needs ${f(hold)} (FADE ${f(paceFade)})`);
    if (Math.abs(m.dur - (m.fade + TAIL)) > TOL) errors.push(`the timeline is ${f(m.dur)} s, DUR = FADE + 0.7 = ${f(m.fade + TAIL)}`);
  }
  const fade = m.fade ?? paceFade, dur = m.dur ?? paceFade + TAIL;
  for (const id of ["root", "lesson"]) {
    if (dd[id] == null) errors.push(`index.html: no data-duration on #${id}`);
    else if (Math.abs(dd[id] - dur) > TOL) errors.push(`index.html: data-duration on #${id} is ${dd[id]}, DUR is ${f(dur)}`);
  }
  const ends = m.calls.flat().map((st) => f(st.end));
  lines.push(`FADE ${f(fade)}, DUR ${f(dur)}`);
  lines.push(`snapshot --at 0,${[...ends, f(fade - 0.3)].join(",")}`);
  lines.push(`seam: snapshot --at 0,${f(dur - 0.05)}`);
  lines.push(`frame.png: select='lte(t,${f(fade - 0.3)})'`);
  return { lines, errors };
}

if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href) {
  const dir = resolve(process.argv[2] || ".");
  const missing = ["index.html", "compositions/lesson.html", "assets/kit/scene.js"].filter((p) => !existsSync(join(dir, p)));
  if (missing.length) {
    console.error(`usage: pace.mjs [lesson project folder]\nmissing in ${dir}: ${missing.join(", ")}`);
    process.exit(2);
  }
  const srv = await serve([["/__pace.html", join(here, "pace.html")], ["/", dir]]);
  let m;
  try {
    m = readOut(await dumpDom(`${srv.url}/__pace.html`));
  } catch (e) {
    console.error("✗ " + e.message);
    process.exitCode = 1;
  } finally {
    srv.close();
  }
  if (m) {
    const v = verdict(m, dataDurations(readFileSync(join(dir, "index.html"), "utf8")));
    for (const l of v.lines) console.log(l);
    for (const e of v.errors) console.error("✗ " + e);
    process.exitCode = v.errors.length ? 1 : 0;
  }
}
