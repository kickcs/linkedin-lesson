import { test } from "node:test";
import assert from "node:assert/strict";
import { parseGif, verdict, LIMIT } from "../skills/linkedin-lesson/recipe/bin/gifcheck.mjs";

const le = (n) => { const b = Buffer.alloc(2); b.writeUInt16LE(n); return b; };
// minimal GIF89a: a global palette of 2 colors, 1×1 frames with a delay in hundredths of a second
function gif({ w = 1080, h = 1350, frames = 150, delay = 7, loop = 0 } = {}) {
  const parts = [Buffer.from("GIF89a", "latin1"), le(w), le(h), Buffer.from([0x80, 0, 0]), Buffer.alloc(6)];
  if (loop != null) parts.push(Buffer.from([0x21, 0xff, 0x0b]), Buffer.from("NETSCAPE2.0", "latin1"), Buffer.from([3, 1]), le(loop), Buffer.from([0]));
  for (let i = 0; i < frames; i++) {
    parts.push(Buffer.from([0x21, 0xf9, 4, 0]), le(delay), Buffer.from([0, 0]));
    parts.push(Buffer.from([0x2c]), le(0), le(0), le(1), le(1), Buffer.from([0, 2, 2, 0x4c, 0x01, 0]));
  }
  parts.push(Buffer.from([0x3b]));
  return Buffer.concat(parts);
}

test("parsing: frame size, frame count, duration, loop", () => {
  const g = parseGif(gif());
  assert.deepEqual([g.width, g.height, g.frames, g.duration, g.loop], [1080, 1350, 150, 10.5, 0]);
});
test("a good GIF has no errors", () => assert.deepEqual(verdict(parseGif(gif())).errors, []));
test("no loop is an error", () => assert.match(verdict(parseGif(gif({ loop: null }))).errors.join(), /no loop/));
test("a finite loop is an error", () => assert.match(verdict(parseGif(gif({ loop: 1 }))).errors.join(), /infinite/));
test("over 5 MB is an error, over 4.5 is a warning", () => {
  const base = parseGif(gif());
  assert.match(verdict({ ...base, bytes: LIMIT + 1 }).errors.join(), /over 5 MB/);
  const v = verdict({ ...base, bytes: 4_700_000 });
  assert.deepEqual(v.errors, []);
  assert.match(v.warnings.join(), /4.5/);
});
test("a foreign frame size and a short duration are errors", () => {
  assert.match(verdict(parseGif(gif({ w: 1080, h: 1080 }))).errors.join(), /1080×1080/);
  assert.match(verdict(parseGif(gif({ frames: 30 }))).errors.join(), /duration/);
});
test("500 frames are fine, more than 500 is an error", () => {
  assert.deepEqual(verdict(parseGif(gif({ frames: 500, delay: 20 }))).errors, []);
  assert.match(verdict(parseGif(gif({ frames: 501 }))).errors.join(), /501 frames, LinkedIn takes up to 500/);
});
test("the fallback frame size 720×900 is allowed", () => assert.deepEqual(verdict(parseGif(gif({ w: 720, h: 900 }))).errors, []));
test("not a GIF is a parse error", () => assert.throws(() => parseGif(Buffer.from("PNG....")), /not a GIF/));
test("a GIF cut in the middle of a block is a parse error, not a hang", () => {
  assert.throws(() => parseGif(gif().subarray(0, 38 + 23 * 100 + 20)), /corrupt GIF/);
});
