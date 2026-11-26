#!/usr/bin/env node
// Copies the kit of a look into a project, adds GSAP and the brand theme. GSAP's license is not MIT, so this repo
// does not ship the file: it comes from npm (pinned version) and is cached in ~/.cache/linkedin-lesson.
import { copyFileSync, cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { homedir, tmpdir } from "node:os";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import vm from "node:vm";

export const GSAP_VERSION = "3.14.2";
const here = dirname(fileURLToPath(import.meta.url));
export const LOOKS = join(here, "..", "looks");
export const DEFAULT_LOOK = "board";
// the brand theme is the board's: its palette and font roles
export const KIT = join(LOOKS, "board", "kit");

// a look is a folder looks/<id> with look.json, kit/ and layouts/
export const lookIds = () => readdirSync(LOOKS).filter((d) => existsSync(join(LOOKS, d, "look.json"))).sort();
export function look(id = DEFAULT_LOOK) {
  if (!lookIds().includes(id)) throw new Error(`unknown look "${id}", known: ${lookIds().join(", ")}`);
  const dir = join(LOOKS, id);
  // layouts is look.json's map of skeleton → DUR; their folder is layoutDir
  return { ...JSON.parse(readFileSync(join(dir, "look.json"), "utf8")), id, dir, kit: join(dir, "kit"), layoutDir: join(dir, "layouts") };
}

// node_modules/gsap next to the repo (development), else the cache, else download it into the cache
export function gsapPath() {
  for (let d = here; ; d = dirname(d)) {
    const f = join(d, "node_modules", "gsap", "dist", "gsap.min.js");
    if (existsSync(f) && readFileSync(f, "utf8").includes(`GSAP ${GSAP_VERSION}`)) return f;
    if (dirname(d) === d) break;
  }
  const cached = join(homedir(), ".cache", "linkedin-lesson", `gsap-${GSAP_VERSION}.min.js`);
  if (existsSync(cached)) return cached;
  const tmp = mkdtempSync(join(tmpdir(), "gsap-"));
  try {
    const shell = process.platform === "win32";
    execFileSync("npm", ["pack", `gsap@${GSAP_VERSION}`, "--pack-destination", tmp, "--silent"], { stdio: ["ignore", "ignore", "inherit"], shell });
    execFileSync("tar", ["-xzf", join(tmp, `gsap-${GSAP_VERSION}.tgz`), "-C", tmp, "package/dist/gsap.min.js"], { shell });
    mkdirSync(dirname(cached), { recursive: true });
    copyFileSync(join(tmp, "package", "dist", "gsap.min.js"), cached);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
  return cached;
}

// The default palette comes from the engine itself, so the theme check and the frame never disagree
export function palette() {
  const w = {};
  vm.runInNewContext(readFileSync(join(KIT, "sketch.js"), "utf8"), { window: w });
  return { ...w.Sketch.C };
}

const ROLES = ["sans", "hand", "mono"];
// Text colors on their background and the WCAG contrast they need: the GIF is read on a phone
const PAIRS = [
  ["white", "field", 4.5, "title, subtitle, conclusion"], ["soft", "field", 4.5, "signature, board heading"],
  ["fred", "field", 3, "board scores"], ["fgreen", "field", 3, "board scores"],
  ["ink", "paper", 4.5, "text on the sheet"], ["sub", "paper", 4.5, "labels on the sheet"],
  ...["blue", "red", "green", "violet", "orange"].map((c) => [c, "paper", 3, "colored words on the sheet"]),
];
const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
export const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };

export function contrastWarnings(colors) {
  return PAIRS.filter(([fg, bg, need]) => contrast(colors[fg], colors[bg]) < need)
    .map(([fg, bg, need, what]) => `contrast ${fg} on ${bg} ${contrast(colors[fg], colors[bg]).toFixed(1)}:1, needs ${need}:1 (${what})`);
}

// theme.json: { colors: { <palette key>: "#rrggbb" }, fonts: { sans|hand|mono: { family, file, weight? } }, rough: 0…2 }
export function readTheme(file) {
  const errors = [], theme = {}, fonts = [];
  let t;
  try { t = JSON.parse(readFileSync(file, "utf8")); } catch (e) { return { errors: [`theme: ${e.message}`], warnings: [] }; }
  if (!t || typeof t !== "object" || Array.isArray(t)) return { errors: ["theme: expected a JSON object"], warnings: [] };
  for (const k of Object.keys(t)) if (!["colors", "fonts", "rough"].includes(k)) errors.push(`theme: unknown key "${k}" (colors, fonts, rough)`);
  const base = palette();
  if (t.colors) {
    theme.colors = {};
    for (const [k, v] of Object.entries(t.colors)) {
      if (!(k in base)) errors.push(`theme: unknown color "${k}", known: ${Object.keys(base).join(", ")}`);
      else if (!/^#[0-9a-f]{6}$/i.test(v)) errors.push(`theme: color ${k} must be #rrggbb, got ${JSON.stringify(v)}`);
      else theme.colors[k] = v.toLowerCase();
    }
  }
  if (t.fonts) {
    theme.fonts = {};
    for (const [role, f] of Object.entries(t.fonts)) {
      if (!ROLES.includes(role)) { errors.push(`theme: unknown font role "${role}" (${ROLES.join(", ")})`); continue; }
      if (!f || typeof f.family !== "string" || !f.family.trim() || /["\\;{}]/.test(f.family)) { errors.push(`theme: fonts.${role}.family must be a font name`); continue; }
      const src = resolve(dirname(file), String(f.file || ""));
      const ext = extname(src).toLowerCase();
      if (!f.file || !existsSync(src)) { errors.push(`theme: fonts.${role}.file not found: ${f.file}`); continue; }
      if (![".woff2", ".woff", ".ttf", ".otf"].includes(ext)) { errors.push(`theme: fonts.${role}.file must be .woff2, .woff, .ttf or .otf`); continue; }
      if (f.weight != null && !/^\d{3}( \d{3})?$/.test(String(f.weight))) { errors.push(`theme: fonts.${role}.weight is "400" or a range "200 800"`); continue; }
      const name = `theme-${role}${ext}`;
      fonts.push([src, name]);
      theme.fonts[role] = { family: f.family.trim(), file: name, ...(f.weight != null && { weight: String(f.weight) }) };
    }
  }
  if (t.rough != null) {
    if (typeof t.rough !== "number" || t.rough < 0 || t.rough > 2) errors.push("theme: rough is a number from 0 (clean lines) to 2, default 1");
    else theme.rough = t.rough;
  }
  const warnings = errors.length ? [] : contrastWarnings({ ...base, ...theme.colors });
  return { theme, fonts, errors, warnings };
}

// Writes theme.js and the theme fonts into an installed kit; throws on an invalid theme, returns contrast warnings
export function writeTheme(dest, file) {
  const r = readTheme(file);
  if (r.errors.length) throw new Error(r.errors.join("\n"));
  mkdirSync(join(dest, "fonts"), { recursive: true });
  for (const [src, name] of r.fonts) copyFileSync(src, join(dest, "fonts", name));
  writeFileSync(join(dest, "theme.js"), `// Brand theme, written by bin/kit.mjs from theme.json\nwindow.LessonTheme = ${JSON.stringify(r.theme)};\n`);
  return r.warnings;
}

export function installKit(dest, themeFile, lookId) {
  const l = look(lookId);
  if (themeFile && !l.theme) throw new Error(`the ${l.name} look takes no brand theme: build without --theme`);
  if (themeFile) { const r = readTheme(themeFile); if (r.errors.length) throw new Error(r.errors.join("\n")); }
  rmSync(dest, { recursive: true, force: true });
  cpSync(l.kit, dest, { recursive: true });
  copyFileSync(gsapPath(), join(dest, "gsap.min.js"));
  return themeFile ? writeTheme(dest, themeFile) : [];
}

if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href) {
  let a;
  try { a = parseArgs({ allowPositionals: true, options: { theme: { type: "string" }, look: { type: "string", default: DEFAULT_LOOK } } }); } catch (e) { a = null; }
  const dest = a && a.positionals[0];
  if (!dest) { console.error(`usage: kit.mjs <dest, e.g. assets/kit> [--look ${lookIds().join("|")}] [--theme <brand>/theme.json]`); process.exit(2); }
  try {
    const warnings = installKit(resolve(dest), a.values.theme && resolve(a.values.theme), a.values.look);
    for (const w of warnings) console.error("! " + w);
  } catch (e) {
    for (const line of e.message.split("\n")) console.error("✗ " + line);
    process.exit(1);
  }
  console.log(`kit ${a.values.look} → ${dest} (GSAP ${GSAP_VERSION}${a.values.theme ? `, theme ${a.values.theme}` : ""})`);
}
