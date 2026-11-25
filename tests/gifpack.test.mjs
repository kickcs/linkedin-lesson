import { test } from "node:test";
import assert from "node:assert/strict";
import { pack } from "../skills/linkedin-lesson/recipe/bin/gifpack.mjs";
import { parseGif } from "../skills/linkedin-lesson/recipe/bin/gifcheck.mjs";

const le = (n) => { const b = Buffer.alloc(2); b.writeUInt16LE(n); return b; };
// GIF89a 2×2 with 1×1 frames; the frame pixel is index 1; ti is the transparent index, disp is the disposal method
function gif(frames) {
  const parts = [Buffer.from("GIF89a", "latin1"), le(2), le(2), Buffer.from([0x80, 0, 0]), Buffer.alloc(6)];
  parts.push(Buffer.from([0x21, 0xff, 0x0b]), Buffer.from("NETSCAPE2.0", "latin1"), Buffer.from([3, 1]), le(0), Buffer.from([0]));
  for (const { delay = 7, ti = null, disp = 1 } of frames) {
    parts.push(Buffer.from([0x21, 0xf9, 4, (disp << 2) | (ti == null ? 0 : 1)]), le(delay), Buffer.from([ti ?? 0, 0]));
    parts.push(Buffer.from([0x2c]), le(0), le(0), le(1), le(1), Buffer.from([0, 2, 2, 0x4c, 0x01, 0]));
  }
  parts.push(Buffer.from([0x3b]));
  return Buffer.concat(parts);
}

test("empty frames merge into the previous one, the duration is the same", () => {
  const src = gif([{}, { ti: 1 }, { ti: 1, delay: 6 }, {}, { ti: 1 }]);
  const r = pack(src);
  assert.deepEqual([r.before, r.after], [5, 2]);
  const a = parseGif(src), b = parseGif(r.buf);
  assert.deepEqual([b.frames, b.duration, b.loop], [2, a.duration, 0]);
});
test("a frame with a visible pixel stays", () => {
  assert.equal(pack(gif([{}, { ti: 0 }, {}])).after, 3);
});
test("a frame that clears the canvas is not merged", () => {
  assert.equal(pack(gif([{}, { ti: 1, disp: 2 }])).after, 2);
  assert.equal(pack(gif([{ disp: 2 }, { ti: 1 }])).after, 2);
});
test("without empty frames the file is the same", () => {
  const src = gif([{}, {}, {}]);
  assert.deepEqual(pack(src).buf, src);
});
test("not a GIF is an error", () => assert.throws(() => pack(Buffer.from("PNG....")), /not a GIF/));
