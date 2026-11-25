#!/usr/bin/env node
// GIF check before delivery: file size, frame size, frame count, duration, infinite loop
import { readFileSync, realpathSync } from "node:fs";
import { pathToFileURL } from "node:url";

export const LIMIT = 5_000_000, TARGET = 4_500_000, MAX_FRAMES = 250; // frames: the LinkedIn limit for GIF
const SIZES = [[1080, 1350], [720, 900]];

export function parseGif(buf) {
  const sig = buf.toString("latin1", 0, 6);
  if (sig !== "GIF89a" && sig !== "GIF87a") throw new Error("not a GIF");
  const width = buf.readUInt16LE(6), height = buf.readUInt16LE(8), packed = buf[10];
  let p = 13 + (packed & 0x80 ? 3 * (2 << (packed & 7)) : 0);
  let frames = 0, delay = 0, loop = null;
  const skipBlocks = () => {
    while (buf[p] !== 0) {
      if (p >= buf.length) throw new Error("corrupt GIF: file truncated"); // otherwise p becomes NaN and the loop never ends
      p += buf[p] + 1;
    }
    p += 1;
  };
  while (p < buf.length) {
    const b = buf[p++];
    if (b === 0x3b) break;
    if (b === 0x21) {
      const label = buf[p++];
      if (label === 0xf9) delay += buf.readUInt16LE(p + 2);
      else if (label === 0xff && buf.toString("latin1", p + 1, p + 12) === "NETSCAPE2.0") loop = buf.readUInt16LE(p + 14);
      skipBlocks();
    } else if (b === 0x2c) {
      frames++;
      const pk = buf[p + 8];
      p += 9 + (pk & 0x80 ? 3 * (2 << (pk & 7)) : 0) + 1; // descriptor, local palette, LZW code size
      skipBlocks();
    } else throw new Error(`corrupt GIF: byte ${b} at ${p - 1}`);
  }
  return { width, height, frames, duration: delay / 100, loop, bytes: buf.length };
}

const mb = (n) => (n / 1e6).toFixed(2);
export function verdict(g) {
  const errors = [], warnings = [];
  if (g.bytes > LIMIT) errors.push(`${mb(g.bytes)} MB is over 5 MB`);
  else if (g.bytes > TARGET) warnings.push(`${mb(g.bytes)} MB, target is 4.5 MB or less`);
  if (g.loop !== 0) errors.push(g.loop == null ? "no loop (NETSCAPE2.0)" : `loop count ${g.loop}, need infinite (0)`);
  if (!SIZES.some(([w, h]) => g.width === w && g.height === h)) errors.push(`frame ${g.width}×${g.height}, expected 1080×1350 or 720×900`);
  if (g.frames > MAX_FRAMES) errors.push(`${g.frames} frames, LinkedIn takes up to ${MAX_FRAMES}: run gifpack, then --fps 12`);
  // no upper limit: duration follows the time it takes to read the text
  if (g.duration < 8) errors.push(`duration ${g.duration} s is under 8`);
  return { errors, warnings };
}

if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href) {
  const file = process.argv[2];
  if (!file) { console.error("usage: gifcheck.mjs <file.gif>"); process.exit(2); }
  let g;
  try { g = parseGif(readFileSync(file)); } catch (e) { console.error("✗ " + e.message); process.exit(1); }
  const v = verdict(g);
  console.log(JSON.stringify(g));
  for (const w of v.warnings) console.error("! " + w);
  for (const e of v.errors) console.error("✗ " + e);
  process.exitCode = v.errors.length ? 1 : 0;
}
