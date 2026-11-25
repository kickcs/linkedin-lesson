import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import vm from "node:vm";

const ctx = {};
vm.runInNewContext(readFileSync(new URL("../skills/linkedin-lesson/recipe/kit/icons.js", import.meta.url), "utf8"), ctx);
const ICONS = ctx.ICONS;
// every icon name the kit, the layouts and the example call
const SRC = ["recipe/kit/scene.js", ...readdirSync(new URL("../skills/linkedin-lesson/recipe/layouts/", import.meta.url)).map((f) => "recipe/layouts/" + f), "examples/outbox/lesson.html"]
  .map((f) => readFileSync(new URL("../skills/linkedin-lesson/" + f, import.meta.url), "utf8")).join("\n");
const NEEDED = [...new Set([...SRC.matchAll(/icon\([^,]+,\s*"([a-z0-9-]+)"/g)].map((m) => m[1]))];
const ARITY = { p: 1, r: 4, c: 3, e: 4, l: 4, pl: 1, pg: 1 };

test("icons the layouts and the example call are in place", () => {
  assert.ok(NEEDED.length >= 5, NEEDED.join());
  for (const n of NEEDED) assert.ok(ICONS[n], n);
});
test("the set has at least 40 icons", () => assert.ok(Object.keys(ICONS).length >= 40));
test("every shape is of a known kind with numbers", () => {
  for (const [name, shapes] of Object.entries(ICONS)) {
    assert.ok(shapes.length > 0, name);
    for (const e of shapes) {
      assert.ok(e[0] in ARITY, `${name}: ${e[0]}`);
      assert.equal(e.length, ARITY[e[0]] + 1, name);
      if (["p", "pl", "pg"].includes(e[0])) assert.equal(typeof e[1], "string", name);
      else for (const v of e.slice(1)) assert.ok(Number.isFinite(v), name);
      if (e[0] === "pl" || e[0] === "pg") assert.equal(e[1].trim().split(/[\s,]+/).length % 2, 0, name);
    }
  }
});

// rough.js cannot read glued arc flags ("0022"): every path builds without errors and without NaN
test("paths are read by the rough.js parser", () => {
  const rc = {};
  vm.runInNewContext(readFileSync(new URL("../skills/linkedin-lesson/recipe/kit/rough.js", import.meta.url), "utf8"), rc);
  const gen = rc.rough.generator();
  for (const [name, shapes] of Object.entries(ICONS)) {
    for (const e of shapes.filter((s) => s[0] === "p")) {
      for (const [, args] of e[1].matchAll(/[aA]([^a-zA-Z]*)/g)) {
        const t = args.trim().split(/[\s,]+/);
        assert.equal(t.length % 7, 0, `${name}: arc ${args}`);
        for (let i = 3; i < t.length; i += 7) assert.ok(/^[01]$/.test(t[i]) && /^[01]$/.test(t[i + 1]), `${name}: flags ${args}`);
      }
      assert.doesNotMatch(JSON.stringify(gen.path(e[1], { seed: 5 }).sets), /NaN|null/, name);
    }
  }
});
