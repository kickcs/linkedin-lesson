#!/usr/bin/env node
// Merges frames that change nothing on screen into the previous one: reading pauses are long, and
// LinkedIn takes GIFs of up to 250 frames. Pixels are not re-encoded, the duration is the same.
import { readFileSync, writeFileSync, realpathSync } from "node:fs";
import { pathToFileURL } from "node:url";

// LZW frame data → palette indices
function decode(data, min, n) {
  const clear = 1 << min, end = clear + 1, out = new Uint8Array(n);
  const prefix = new Int16Array(4096), suffix = new Uint8Array(4096), stack = new Uint8Array(4097);
  for (let c = 0; c < clear; c++) suffix[c] = c;
  let size = min + 1, mask = (1 << size) - 1, avail = clear + 2, old = -1, first = 0, acc = 0, bits = 0, i = 0, o = 0;
  while (o < n) {
    while (bits < size) {
      if (i >= data.length) return out;
      acc |= data[i++] << bits;
      bits += 8;
    }
    const code = acc & mask;
    acc >>>= size;
    bits -= size;
    if (code === clear) { size = min + 1; mask = (1 << size) - 1; avail = clear + 2; old = -1; continue; }
    if (code === end) break;
    if (old === -1) { out[o++] = first = suffix[code]; old = code; continue; }
    let sp = 0, cur = code;
    if (code >= avail) { stack[sp++] = first; cur = old; }
    while (cur >= clear) { stack[sp++] = suffix[cur]; cur = prefix[cur]; }
    first = suffix[cur];
    stack[sp++] = first;
    while (sp && o < n) out[o++] = stack[--sp];
    if (avail < 4096) {
      prefix[avail] = old;
      suffix[avail++] = first;
      if ((avail & mask) === 0 && size < 12) mask = (1 << ++size) - 1;
    }
    old = code;
  }
  return out;
}

export function pack(buf) {
  const sig = buf.toString("latin1", 0, 6);
  if (sig !== "GIF89a" && sig !== "GIF87a") throw new Error("not a GIF");
  const packed = buf[10];
  let p = 13 + (packed & 0x80 ? 3 * (2 << (packed & 7)) : 0);
  const head = p, frames = [];
  let gce = null, start = p;
  const blocks = () => {
    const parts = [];
    while (buf[p] !== 0) {
      if (p >= buf.length) throw new Error("corrupt GIF: file truncated");
      parts.push(buf.subarray(p + 1, p + 1 + buf[p]));
      p += buf[p] + 1;
    }
    p += 1;
    return parts;
  };
  while (p < buf.length) {
    const b = buf[p++];
    if (b === 0x3b) { p--; break; }
    if (b === 0x21) {
      const label = buf[p++];
      if (label === 0xf9) gce = { at: p + 2, disp: (buf[p + 1] >> 2) & 7, tr: buf[p + 1] & 1, ti: buf[p + 4] };
      blocks();
    } else if (b === 0x2c) {
      const w = buf.readUInt16LE(p + 4), h = buf.readUInt16LE(p + 6), pk = buf[p + 8];
      p += 9 + (pk & 0x80 ? 3 * (2 << (pk & 7)) : 0);
      const min = buf[p++], data = Buffer.concat(blocks());
      frames.push({ start, end: p, gce, delay: gce ? buf.readUInt16LE(gce.at) : 0, n: w * h, min, data });
      gce = null;
      start = p;
    } else throw new Error(`corrupt GIF: byte ${b} at ${p - 1}`);
  }
  // a frame is empty if all its pixels are transparent and neither it nor the previous one clears the canvas
  const noop = (f, k) => f.gce?.tr && f.gce.disp < 2 && k.gce && k.gce.disp < 2 && k.delay + f.delay <= 0xffff
    && decode(f.data, f.min, f.n).every((v) => v === f.gce.ti);
  const kept = [];
  for (const f of frames) {
    const k = kept.at(-1);
    if (k && noop(f, k)) k.delay += f.delay;
    else kept.push({ ...f });
  }
  const parts = [buf.subarray(0, head)];
  for (const k of kept) {
    const chunk = Buffer.from(buf.subarray(k.start, k.end));
    if (k.gce) chunk.writeUInt16LE(k.delay, k.gce.at - k.start);
    parts.push(chunk);
  }
  parts.push(buf.subarray(start));
  return { buf: Buffer.concat(parts), before: frames.length, after: kept.length };
}

if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href) {
  const [file, outFile = file] = process.argv.slice(2);
  if (!file) { console.error("usage: gifpack.mjs <file.gif> [out.gif]"); process.exit(2); }
  let r;
  try { r = pack(readFileSync(file)); } catch (e) { console.error("✗ " + e.message); process.exit(1); }
  writeFileSync(outFile, r.buf);
  console.log(JSON.stringify({ before: r.before, after: r.after, bytes: r.buf.length }));
}
