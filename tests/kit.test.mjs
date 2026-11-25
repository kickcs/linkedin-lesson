import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import vm from "node:vm";

const kit = (p) => new URL(`../skills/linkedin-lesson/recipe/kit/${p}`, import.meta.url);

// hyperframes 0.9.x check fails on Math.random in composition code
test("rough.js without Math.random", () => assert.doesNotMatch(readFileSync(kit("rough.js"), "utf8"), /Math\.random/));
test("rough.js draws the same thing with the same seed", () => {
  const sets = () => {
    const rc = {};
    vm.runInNewContext(readFileSync(kit("rough.js"), "utf8"), rc);
    const gen = rc.rough.generator();
    return JSON.stringify(gen.rectangle(0, 0, 40, 20, { seed: 5, fill: "#000", fillStyle: "hachure" }).sets);
  };
  assert.equal(sets(), sets());
});
test("board fonts and their licenses are in place", () => {
  for (const f of ["fonts/bricolage-grotesque.woff2", "fonts/shantell-sans.woff2", "fonts/OFL-BricolageGrotesque.txt", "fonts/OFL-ShantellSans.txt"]) assert.ok(existsSync(kit(f)), f);
  const lic = readFileSync(kit("LICENSES.md"), "utf8");
  assert.match(lic, /Bricolage Grotesque/);
  assert.match(lic, /Shantell Sans/);
});
test("skeletons and preview load only fonts that exist in kit", () => {
  const pages = ["actors", "stage"].map((n) => [new URL(`../skills/linkedin-lesson/recipe/layouts/${n}.html`, import.meta.url), /url\("assets\/kit\/(fonts\/[^"]+)"\)/g]);
  pages.push([kit("preview.html"), /url\("(fonts\/[^"]+)"\)/g]);
  for (const [file, re] of pages) {
    const found = [...readFileSync(file, "utf8").matchAll(re)].map((m) => m[1]);
    for (const role of ["bricolage", "shantell", "jetbrains-mono"]) assert.ok(found.some((f) => f.includes(role)), `${file}: no ${role}`);
    for (const f of found) assert.ok(existsSync(kit(f)), `${file}: ${f}`);
  }
});
test("index.html loads theme.js, then sketch.js, then scene.js", () => {
  const html = readFileSync(new URL("../skills/linkedin-lesson/recipe/layouts/index.html", import.meta.url), "utf8");
  const [t, a, b] = ["theme.js", "sketch.js", "scene.js"].map((f) => html.indexOf(`assets/kit/${f}`));
  assert.ok(t > 0 && a > t && b > a, "theme.js, sketch.js, scene.js");
});
test("preview.html loads theme.js before sketch.js", () => {
  const html = readFileSync(kit("preview.html"), "utf8");
  assert.ok(html.indexOf('src="theme.js"') > 0 && html.indexOf('src="sketch.js"') > html.indexOf('src="theme.js"'));
});
test("the kit ships an empty theme", () => assert.match(readFileSync(kit("theme.js"), "utf8"), /window\.LessonTheme = \{\};/));
// a hex color in a composition ignores the brand theme; the only one allowed is the --field fallback
test("layouts and the example take colors from the palette", () => {
  const files = ["recipe/layouts/index.html", "recipe/layouts/stage.html", "recipe/layouts/actors.html", "examples/outbox/lesson.html", "recipe/kit/scene.js"];
  for (const f of files) {
    const src = readFileSync(new URL(`../skills/linkedin-lesson/${f}`, import.meta.url), "utf8").replaceAll("var(--field, #0e4a40)", "");
    assert.deepEqual(src.match(/#[0-9a-f]{3,6}\b/gi), null, f);
  }
});
