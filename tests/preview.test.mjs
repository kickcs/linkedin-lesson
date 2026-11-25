import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ROOT } from "./helpers.mjs";

const bin = join(ROOT, "skills/linkedin-lesson/recipe/bin/preview.mjs");
const tmp = mkdtempSync(join(tmpdir(), "preview-"));
const run = (...args) => spawnSync(process.execPath, [bin, ...args], { encoding: "utf8" });

for (const layout of ["actors", "stage"]) {
  test(`preview ${layout}: screenshot and font sizes are fine`, () => {
    const out = join(tmp, `${layout}.png`);
    const r = run("--layout", layout, "--title", "Run tests|in a *subagent*", "--end", "Only the *summary* comes back.", "--out", out);
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stdout, /title 35 \(min 26\), end 21 \(min 17\)/);
    assert.ok(statSync(out).size > 10000, "screenshot is not empty");
  });
}
test("long title: exit 3 and the field name", () => {
  const r = run("--title", "This title is definitely far too long to fit in one single line", "--end", "Short.", "--out", join(tmp, "long.png"));
  assert.equal(r.status, 3);
  assert.match(r.stderr, /title/);
});
test("no title: usage hint and exit 2", () => {
  const r = run("--out", join(tmp, "x.png"));
  assert.equal(r.status, 2);
  assert.match(r.stderr, /usage/);
});
test("long conclusion: exit 3 and the end field name", () => {
  const r = run("--title", "Short", "--end", "This closing line is definitely far too long to fit in one single line", "--out", join(tmp, "end.png"));
  assert.equal(r.status, 3);
  assert.match(r.stderr, /end/);
  assert.doesNotMatch(r.stderr, /title/);
});
test("a \"|\" break fits a title that did not fit on one line", () => {
  assert.equal(run("--title", "Run all your tests in a subagent", "--out", join(tmp, "one.png")).status, 3, "does not fit on one line");
  const r = run("--title", "Run all your tests|in a *subagent*", "--out", join(tmp, "two.png"));
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /title (\d+(\.\d+)?) \(min 26\)/);
});
test("a title slightly wider than the line shrinks itself and passes", () => {
  const r = run("--title", "Why chatbots hallucinate|*made-up deadlines*", "--out", join(tmp, "fit.png"));
  assert.equal(r.status, 0, r.stderr);
  const size = Number(/title ([\d.]+)/.exec(r.stdout)[1]);
  assert.ok(size < 35 && size >= 26, `font size ${size}`);
});
test("three title lines: usage hint and exit 2", () => {
  const r = run("--title", "a|b|c", "--out", join(tmp, "x.png"));
  assert.equal(r.status, 2);
  assert.match(r.stderr, /usage/);
});
test("subtitle: its font size is in the preview output, without --layout the preview takes actors", () => {
  const r = run("--title", "Transactional *outbox*", "--sub", "How a transfer survives a crash", "--end", "Short.", "--out", join(tmp, "sub.png"));
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /title [\d.]+ \(min 26\), sub 15 \(min 12\), end 21 \(min 17\)/);
});
test("subtitle with a two-line title: usage hint and exit 2", () => {
  const r = run("--title", "Run tests|in a *subagent*", "--sub", "Why logs stay out", "--out", join(tmp, "x.png"));
  assert.equal(r.status, 2);
  assert.match(r.stderr, /title is one line/);
});
test("long subtitle: exit 3 and the sub field name", () => {
  const r = run("--title", "Short", "--sub", "This subtitle question is far too long to stay readable on a phone screen at all", "--out", join(tmp, "sub-long.png"));
  assert.equal(r.status, 3);
  assert.match(r.stderr, /sub/);
  assert.doesNotMatch(r.stderr, /title/);
});
test("unknown layout: usage hint and exit 2", () => {
  const r = run("--layout", "grid", "--title", "x", "--out", join(tmp, "x.png"));
  assert.equal(r.status, 2);
  assert.match(r.stderr, /usage/);
  assert.match(r.stderr, /grid/);
});
test("the screenshot folder is created, the file is in place", () => {
  const out = join(tmp, "new/sub/dir/frame.png");
  const r = run("--title", "Short", "--out", out);
  assert.equal(r.status, 0, r.stderr);
  assert.ok(existsSync(out), "screenshot written");
});
test("--series and --sign draw the series mark and the signature; a series that is not \"day/total\" is exit 2", () => {
  const r = run("--layout", "actors", "--title", "How *MCP* works", "--end", "Short.", "--series", "1/30", "--sign", "Ann Author", "--out", join(tmp, "series.png"));
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /series 1\/30/);
  const bad = run("--title", "Short", "--end", "Short.", "--series", "Day 1 of 30", "--out", join(tmp, "series-bad.png"));
  assert.equal(bad.status, 2);
  assert.match(bad.stderr, /7\/30/);
});
test("unknown flag and unpaired asterisk: usage hint and exit 2", () => {
  const flag = run("--title", "Short", "--size", "21", "--out", join(tmp, "x.png"));
  assert.equal(flag.status, 2, flag.stderr);
  assert.match(flag.stderr, /usage/);
  const star = run("--title", "Run *tests|in a* subagent", "--out", join(tmp, "x.png"));
  assert.equal(star.status, 2, star.stderr);
  assert.match(star.stderr, /\*/);
});
