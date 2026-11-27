import { test } from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dataDurations, verdict } from "../skills/linkedin-lesson/recipe/bin/pace.mjs";
import { installKit, look } from "../skills/linkedin-lesson/recipe/bin/kit.mjs";

const recipe = fileURLToPath(new URL("../skills/linkedin-lesson/recipe/", import.meta.url));
const steps = [{ at: 0.2, end: 5, chars: 60, label: "Anna" }, { at: 5, end: 9.5, chars: 70, label: "Ben" }];
// conclusion of 33 characters at 9.5: FADE 9.5 + 2 + 1 = 12.5, DUR 13.2
const good = { calls: [steps], conclusion: { text: "Wait *outside* the transaction, ok.", at: 9.5 }, fade: 12.5, dur: 13.2, error: null };
const dd = { root: 13.2, lesson: 13.2 };

test("a lesson at reading pace has no errors and prints the build times", () => {
  const v = verdict(good, dd);
  assert.deepEqual(v.errors, []);
  const out = v.lines.join("\n");
  assert.match(out, /FADE 12\.50, DUR 13\.20/);
  assert.match(out, /snapshot --at 0,5\.00,9\.50,12\.20/);
  assert.match(out, /seam: snapshot --at 0,13\.15/);
  assert.match(out, /lte\(t,12\.20\)/);
});
test("data-duration in index.html that differs from DUR is an error", () => {
  assert.match(verdict(good, { root: 12.4, lesson: 13.2 }).errors.join(), /#root is 12\.4, DUR is 13\.20/);
  assert.match(verdict(good, { root: 13.2, lesson: null }).errors.join(), /no data-duration on #lesson/);
});
test("a timeline that is not FADE + 0.7 is an error", () => assert.match(verdict({ ...good, dur: 14 }, { root: 14, lesson: 14 }).errors.join(), /timeline is 14\.00 s, DUR = FADE \+ 0\.7 = 13\.20/));
test("a fade before the conclusion is read is an error", () => assert.match(verdict({ ...good, fade: 11.5, dur: 12.2 }, { root: 12.2, lesson: 12.2 }).errors.join(), /holds 2\.00 s, it needs 3\.00/));
test("a composition that threw is an error and data-duration is compared with the pace", () => {
  const v = verdict({ ...good, dur: null, fade: null, error: "DUR = FADE + 0.7 = 13.20" }, { root: 12.4, lesson: 12.4 });
  assert.match(v.errors[0], /threw: DUR = FADE \+ 0\.7 = 13\.20/);
  assert.match(v.errors.join(), /#lesson is 12\.4, DUR is 13\.20/);
});
test("data-duration is read from #root and #lesson", () => assert.deepEqual(dataDurations(readFileSync(join(recipe, "looks/board/layouts/index.html"), "utf8")), { root: 12.4, lesson: 12.4 }));

// the real tool on the skeletons, mounted from a bare project as the skill builds one
const run = (dir) => new Promise((ok) => execFile(process.execPath, [join(recipe, "bin/pace.mjs"), dir], (err, stdout, stderr) => ok({ code: err ? err.code : 0, stdout, stderr })));
function project(layout, dur, edit = (s) => s, lookId = "board", src = join(recipe, `looks/${lookId}/layouts/${layout}.html`)) {
  const dir = mkdtempSync(join(tmpdir(), `pace-${layout}-`));
  installKit(join(dir, "assets/kit"), null, lookId);
  mkdirSync(join(dir, "compositions"));
  writeFileSync(join(dir, "index.html"), readFileSync(join(recipe, `looks/${lookId}/layouts/index.html`), "utf8").replaceAll('data-duration="12.4"', `data-duration="${dur}"`));
  writeFileSync(join(dir, "compositions/lesson.html"), edit(readFileSync(src, "utf8")));
  return dir;
}

test("stage skeleton: five steps, DUR 26.68, exit 0", async () => {
  const r = await run(project("stage", 26.68));
  assert.equal(r.code, 0, r.stderr);
  assert.match(r.stdout, /FADE 25\.98, DUR 26\.68/);
  assert.equal(r.stdout.split("\n").filter((l) => /→/.test(l)).length, 5);
});
test("stage skeleton with the index.html of actors: exit 1 names DUR", async () => {
  const r = await run(project("stage", 12.4));
  assert.equal(r.code, 1);
  assert.match(r.stderr, /#root is 12\.4, DUR is 26\.68/);
});
test("a wrong DUR in the composition: exit 1 with its own error", async () => {
  const r = await run(project("stage", 30, (s) => s.replace("const DUR = 26.68;", "const DUR = 30;")));
  assert.equal(r.code, 1);
  assert.match(r.stderr, /threw: .*DUR = FADE \+ 0\.7 = 26\.68/);
});
test("actors skeleton: hand-set times, exit 0", async () => {
  const r = await run(project("actors", 12.4));
  assert.equal(r.code, 0, r.stderr);
  assert.match(r.stdout, /no pace call/);
  assert.match(r.stdout, /DUR 12\.40/);
});
test("cards system skeleton: five steps, DUR from look.json, exit 0", async () => {
  const dur = look("cards").layouts.system;
  const r = await run(project("system", dur, undefined, "cards"));
  assert.equal(r.code, 0, r.stderr);
  assert.match(r.stdout, new RegExp(`DUR ${dur.toFixed(2).replace(".", "\\.")}`));
  assert.equal(r.stdout.split("\n").filter((l) => /→/.test(l)).length, 5);
});
test("cards pool example: DUR 88.48, exit 0", async () => {
  const src = fileURLToPath(new URL("../skills/linkedin-lesson/examples/pool/lesson.html", import.meta.url));
  const r = await run(project("pool", 88.48, undefined, "cards", src));
  assert.equal(r.code, 0, r.stderr);
  assert.match(r.stdout, /DUR 88\.48/);
});
test("a cards lesson that fades a second early: exit 1, the conclusion is not read", async () => {
  const r = await run(project("system", 20.51, (s) => s.replace('{ fade: FADE }', "{ fade: FADE - 1 }"), "cards"));
  assert.equal(r.code, 1);
  assert.match(r.stderr, /holds [\d.]+ s, it needs [\d.]+/);
});
test("a folder without a lesson: exit 2", async () => assert.equal((await run(mkdtempSync(join(tmpdir(), "pace-empty-")))).code, 2));
