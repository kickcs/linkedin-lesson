import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import vm from "node:vm";
import { DEFAULT_LOOK, installKit, look, lookIds } from "../skills/linkedin-lesson/recipe/bin/kit.mjs";

const kit = (p) => new URL(`../skills/linkedin-lesson/recipe/looks/board/kit/${p}`, import.meta.url);

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
  const pages = ["actors", "stage"].map((n) => [new URL(`../skills/linkedin-lesson/recipe/looks/board/layouts/${n}.html`, import.meta.url), /url\("assets\/kit\/(fonts\/[^"]+)"\)/g]);
  pages.push([kit("preview.html"), /url\("(fonts\/[^"]+)"\)/g]);
  for (const [file, re] of pages) {
    const found = [...readFileSync(file, "utf8").matchAll(re)].map((m) => m[1]);
    for (const role of ["bricolage", "shantell", "jetbrains-mono"]) assert.ok(found.some((f) => f.includes(role)), `${file}: no ${role}`);
    for (const f of found) assert.ok(existsSync(kit(f)), `${file}: ${f}`);
  }
});
test("index.html loads theme.js, then sketch.js, then scene.js", () => {
  const html = readFileSync(new URL("../skills/linkedin-lesson/recipe/looks/board/layouts/index.html", import.meta.url), "utf8");
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
  const files = ["recipe/looks/board/layouts/index.html", "recipe/looks/board/layouts/stage.html", "recipe/looks/board/layouts/actors.html", "examples/outbox/lesson.html", "recipe/looks/board/kit/scene.js"];
  for (const f of files) {
    const src = readFileSync(new URL(`../skills/linkedin-lesson/${f}`, import.meta.url), "utf8").replaceAll("var(--field, #0e4a40)", "");
    assert.deepEqual(src.match(/#[0-9a-f]{3,6}\b/gi), null, f);
  }
});

// every look is a folder with look.json, a kit and the layouts it names; looks.md lists them, the default first
test("looks.md lists every look, the default first", () => {
  const md = readFileSync(new URL("../skills/linkedin-lesson/recipe/looks.md", import.meta.url), "utf8");
  const listed = [...md.matchAll(/^\d+\. \*\*[^*]+\*\* \(`([a-z0-9-]+)`\)/gm)].map((m) => m[1]);
  assert.deepEqual([...listed].sort(), lookIds());
  assert.equal(listed[0], DEFAULT_LOOK);
});
for (const id of lookIds()) {
  test(`${id}: look.json, its layouts, preview and sample frame are in place`, () => {
    const l = look(id);
    assert.equal(typeof l.name, "string");
    assert.ok(Object.keys(l.layouts).length > 0);
    for (const [name, dur] of Object.entries(l.layouts)) {
      assert.ok(existsSync(join(l.layoutDir, `${name}.html`)), name);
      assert.ok(dur > 0, `${name}: DUR ${dur}`);
    }
    for (const k of ["title", "sub", "end"]) assert.ok(l.min[k] > 0, `min.${k}`);
    assert.ok([1, 2].includes(l.endLines), `endLines ${l.endLines}`);
    assert.equal(typeof l.theme, "boolean");
    for (const f of ["layouts/index.html", "kit/preview.html", "kit/icons.js", "kit/LICENSES.md", "look.md"]) assert.ok(existsSync(join(l.dir, f)), f);
  });
}
test("an unknown look names the known ones", () => assert.throws(() => look("grid"), /unknown look "grid", known: board, cards/));
test("the cards kit goes into a project with GSAP; a theme for it is refused", () => {
  const dest = join(mkdtempSync(join(tmpdir(), "kit-cards-")), "assets/kit");
  assert.deepEqual(installKit(dest, null, "cards"), []);
  for (const f of ["cards.js", "icons.js", "gsap.min.js", "fonts/overpass.woff2"]) assert.ok(existsSync(join(dest, f)), f);
  assert.ok(!existsSync(join(dest, "sketch.js")), "no board engine in a cards project");
  const theme = join(dest, "..", "theme.json");
  writeFileSync(theme, "{}");
  assert.throws(() => installKit(dest, theme, "cards"), /Cards look takes no brand theme/);
});
