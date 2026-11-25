import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { page, shot } from "./helpers.mjs";

const tmp = mkdtempSync(join(tmpdir(), "layouts-"));
for (const name of ["actors", "stage"]) {
  const r = await page(`/layout.html?layout=${name}`);
  test(`${name}: page reported`, () => assert.ok(r.results.length > 0));
  for (const x of r.results) test(`${name}: ${x.name}`, () => assert.ok(x.ok, x.error));
  test(`${name}: loop without a seam — the end matches frame 0`, async () => {
    const a = join(tmp, `${name}-0.png`), b = join(tmp, `${name}-end.png`);
    await shot(`/layout.html?layout=${name}&t=0`, a);
    await shot(`/layout.html?layout=${name}&t=end`, b);
    assert.ok(readFileSync(a).equals(readFileSync(b)), `frames differ: ${a} and ${b}`);
  });
}
