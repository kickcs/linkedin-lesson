#!/usr/bin/env node
// Post text check: three paragraphs, hook, length, two or three bold phrases, no emoji or links, a question only in the
// hook, the series hashtag on the last line
import { readFileSync, realpathSync } from "node:fs";
import { pathToFileURL } from "node:url";

export const HOOK_MAX = 80, POST_MAX = 450, TAGS_MAX = 1, PARAS = 3, BOLD_MIN = 2, BOLD_MAX = 3;
const len = (s) => [...s].length;
const LABEL = /^Day \d+\/\d+ of [^.]*\.\s+/;
// a phrase in bold.mjs's letters: quotes, spaces and punctuation between them stay in the phrase
const B = "[\\u{1D5D4}-\\u{1D607}\\u{1D7EC}-\\u{1D7F5}]";
const BOLD = new RegExp(`${B}+(?:[^\\p{L}\\p{N}\\n]*${B}+)*`, "gu");

// the hook is the first sentence of the first paragraph; in a series post it includes the "Day N/30 of …" label
export function hookOf(para) {
  const label = para.match(LABEL)?.[0] ?? "";
  const rest = para.slice(label.length);
  return label + (rest.match(/^.*?[.!?]["”’)]?(?=\s|$)/s)?.[0] ?? rest);
}

export function checkPost(text) {
  const errors = [];
  const body = text.replace(/\r/g, "").trim();
  const lines = body.split("\n");
  const last = lines[lines.length - 1].trim();
  const tags = /^(#[\p{L}\p{N}_]+\s*)+$/u.test(last) ? (lines.pop(), last.split(/\s+/)) : [];
  // paragraphs are split by a blank line; a single line break inside a paragraph does not split it
  const paras = lines.join("\n").split(/\n\s*\n/).map((p) => p.replace(/\s*\n\s*/g, " ").trim()).filter(Boolean);
  const hook = hookOf(paras[0] || "");
  if (len(hook) > HOOK_MAX) errors.push(`hook ${len(hook)} characters, max ${HOOK_MAX}`);
  if (len(body) > POST_MAX) errors.push(`post ${len(body)} characters, max ${POST_MAX}`);
  if (paras.length !== PARAS) errors.push(`${paras.length} paragraphs: need ${PARAS} — observation, problem, solution`);
  if (/\p{Extended_Pictographic}/u.test(text)) errors.push("emoji in text");
  // a question is allowed only in the hook: a closing question to the reader is comment bait
  if ([(paras[0] || "").slice(hook.length), ...paras.slice(1)].some((p) => p.includes("?")))
    errors.push("question outside the hook: no closing question to the reader");
  if (/https?:\/\/|www\./i.test(text)) errors.push("link in text: it goes in the first comment");
  if (tags.length > TAGS_MAX) errors.push(`${tags.length} hashtags, max ${TAGS_MAX}: the series hashtag only`);
  if (paras.some((p) => /(^|\s)#[\p{L}\p{N}_]/u.test(p))) errors.push("hashtags only on the last line");
  if (text.includes("**")) errors.push("** marks left: run bold.mjs on the file");
  const bolds = (body.match(BOLD) || []).length;
  if (bolds < BOLD_MIN || bolds > BOLD_MAX) errors.push(`${bolds} bold phrases: need ${BOLD_MIN}–${BOLD_MAX}, marked **like this** and converted by bold.mjs`);
  return errors;
}

if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href) {
  const file = process.argv[2];
  if (!file) { console.error("usage: postcheck.mjs <post.txt>"); process.exit(2); }
  const text = readFileSync(file, "utf8"), errors = checkPost(text);
  console.log(`${len(text.trim())} characters`);
  for (const e of errors) console.error("✗ " + e);
  process.exitCode = errors.length ? 1 : 0;
}
