import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ROOT, page } from "./helpers.mjs";
import { KIT, contrast, installKit, palette, readTheme, writeTheme } from "../skills/linkedin-lesson/recipe/bin/kit.mjs";

const tmp = mkdtempSync(join(tmpdir(), "theme-"));
copyFileSync(join(KIT, "fonts/jetbrains-mono-400.woff2"), join(tmp, "My.woff2"));
let n = 0;
const theme = (t) => { const f = join(tmp, `t${n++}.json`); writeFileSync(f, typeof t === "string" ? t : JSON.stringify(t)); return f; };
const errorsOf = (t) => readTheme(theme(t)).errors.join("\n");

test("the default palette passes the contrast check", () => assert.deepEqual(readTheme(theme({})).warnings, []));
test("contrast follows WCAG", () => assert.equal(contrast("#000000", "#ffffff").toFixed(0), "21"));
test("a valid theme is normalized", () => {
  const r = readTheme(theme({ colors: { field: "#1B1F3B" }, fonts: { sans: { family: "My Sans", file: "My.woff2", weight: "200 800" } }, rough: 0 }));
  assert.deepEqual(r.errors, []);
  assert.deepEqual(r.theme, { colors: { field: "#1b1f3b" }, fonts: { sans: { family: "My Sans", file: "theme-sans.woff2", weight: "200 800" } }, rough: 0 });
});
test("unknown key", () => assert.match(errorsOf({ layout: {} }), /unknown key "layout"/));
test("unknown color lists the known ones", () => assert.match(errorsOf({ colors: { background: "#000000" } }), /unknown color "background", known: ink/));
test("color must be #rrggbb", () => assert.match(errorsOf({ colors: { field: "navy" } }), /must be #rrggbb/));
test("unknown font role", () => assert.match(errorsOf({ fonts: { serif: { family: "X", file: "My.woff2" } } }), /unknown font role "serif"/));
test("missing font file", () => assert.match(errorsOf({ fonts: { sans: { family: "X", file: "nope.woff2" } } }), /not found: nope.woff2/));
test("font file must be a font", () => {
  writeFileSync(join(tmp, "x.txt"), "");
  assert.match(errorsOf({ fonts: { sans: { family: "X", file: "x.txt" } } }), /must be .woff2/);
});
test("font family without quotes", () => assert.match(errorsOf({ fonts: { sans: { family: 'X"; }', file: "My.woff2" } } }), /must be a font name/));
test("font weight format", () => assert.match(errorsOf({ fonts: { sans: { family: "X", file: "My.woff2", weight: "bold" } } }), /weight/));
test("rough from 0 to 2", () => assert.match(errorsOf({ rough: 3 }), /rough is a number/));
test("broken JSON", () => assert.match(errorsOf("{ colors: "), /^theme: /));
test("low contrast is a warning, not an error", () => {
  const r = readTheme(theme({ colors: { field: "#eeeeee" } }));
  assert.deepEqual(r.errors, []);
  assert.match(r.warnings.join("\n"), /contrast white on field 1\.\d:1, needs 4\.5:1 \(title, subtitle, conclusion\)/);
});
test("writeTheme writes theme.js and copies the font", () => {
  const dest = join(tmp, "kit");
  writeTheme(dest, theme({ colors: { chalk: "#7ee0ff" }, fonts: { hand: { family: "My Hand", file: "My.woff2" } } }));
  assert.match(readFileSync(join(dest, "theme.js"), "utf8"), /window\.LessonTheme = \{"colors":\{"chalk":"#7ee0ff"\},"fonts":\{"hand":\{"family":"My Hand","file":"theme-hand\.woff2"\}\}\};/);
  assert.ok(existsSync(join(dest, "fonts/theme-hand.woff2")));
});
test("installKit without a theme keeps the empty theme", () => {
  const dest = join(tmp, "plain");
  installKit(dest);
  assert.match(readFileSync(join(dest, "theme.js"), "utf8"), /window\.LessonTheme = \{\};/);
});
test("installKit refuses an invalid theme before touching the folder", () => {
  const dest = join(tmp, "plain");
  assert.throws(() => installKit(dest, theme({ colors: { field: "navy" } })), /must be #rrggbb/);
  assert.ok(existsSync(join(dest, "gsap.min.js")), "the old kit stays");
});
test("palette() reads the engine's own colors", () => assert.equal(palette().field, "#0e4a40"));

const r = await page("/theme.html");
test("theme page reported", () => assert.ok(r.results.length > 0));
for (const x of r.results) test(x.name, () => assert.ok(x.ok, x.error));

const bin = join(ROOT, "skills/linkedin-lesson/recipe/bin/preview.mjs");
const run = (...args) => spawnSync(process.execPath, [bin, ...args], { encoding: "utf8" });
test("preview with a theme: the frame is taken, warnings go to stderr", () => {
  const r = run("--title", "Short", "--end", "Short.", "--theme", theme({ colors: { field: "#eeeeee" }, fonts: { sans: { family: "My Sans", file: "My.woff2" } } }), "--out", join(tmp, "themed.png"));
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stderr, /^! contrast white on field/m);
  assert.ok(existsSync(join(tmp, "themed.png")));
});
test("preview with an invalid theme: exit 2 and the reason", () => {
  const r = run("--title", "Short", "--theme", theme({ rough: -1 }), "--out", join(tmp, "bad.png"));
  assert.equal(r.status, 2);
  assert.match(r.stderr, /rough is a number/);
});
