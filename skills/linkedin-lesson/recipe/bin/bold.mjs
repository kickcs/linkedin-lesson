#!/usr/bin/env node
// **phrase** → Unicode sans-serif bold, in place: a LinkedIn post has no markup of its own
import { readFileSync, writeFileSync, realpathSync } from "node:fs";
import { pathToFileURL } from "node:url";

// letters and digits only: quotes, spaces, $ and punctuation stay as they are
export function boldChars(s) {
  return [...s].map((c) => {
    const p = c.codePointAt(0);
    if (p >= 65 && p <= 90) return String.fromCodePoint(0x1d5d4 + p - 65);
    if (p >= 97 && p <= 122) return String.fromCodePoint(0x1d5ee + p - 97);
    if (p >= 48 && p <= 57) return String.fromCodePoint(0x1d7ec + p - 48);
    return c;
  }).join("");
}

export const bold = (text) => text.replace(/\*\*(.+?)\*\*/g, (_, s) => boldChars(s));

if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href) {
  const file = process.argv[2];
  if (!file) { console.error("usage: bold.mjs <post.txt>"); process.exit(2); }
  writeFileSync(file, bold(readFileSync(file, "utf8")));
}
