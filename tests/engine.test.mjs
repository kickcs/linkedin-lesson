import { test } from "node:test";
import assert from "node:assert/strict";
import { page } from "./helpers.mjs";

const r = await page("/engine.html");
test("page reported", () => assert.ok(r.results.length > 0));
for (const x of r.results) test(x.name, () => assert.ok(x.ok, x.error));
