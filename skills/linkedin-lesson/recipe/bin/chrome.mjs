// Headless Chrome: the DOM after the page loads, or a screenshot of it
import { execFile } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, rmSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";

export function findChrome() {
  const list = [process.env.CHROME, "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser",
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"];
  const shell = join(homedir(), ".cache/puppeteer/chrome-headless-shell");
  if (existsSync(shell)) for (const v of readdirSync(shell)) for (const sub of readdirSync(join(shell, v))) list.push(join(shell, v, sub, "chrome-headless-shell"));
  const found = list.find((p) => p && existsSync(p));
  if (!found) throw new Error("Chrome not found: set CHROME=/path/to/chrome");
  return found;
}

// A fresh profile per run, so it never attaches to the user's open Chrome
function run(args, budget) {
  const profile = mkdtempSync(join(tmpdir(), "lesson-chrome-"));
  const all = ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run", "--no-default-browser-check",
    "--force-device-scale-factor=1", `--user-data-dir=${profile}`, `--virtual-time-budget=${budget}`, ...args];
  return new Promise((ok, fail) => execFile(findChrome(), all, { maxBuffer: 64 << 20, timeout: 120000 }, (err, stdout, stderr) => {
    rmSync(profile, { recursive: true, force: true });
    if (err) fail(new Error(stderr || err.message)); else ok(stdout);
  }));
}

export const dumpDom = (url, budget = 15000) => run(["--dump-dom", url], budget);
export const screenshot = (url, out, { width, height, budget = 15000 }) =>
  run([`--screenshot=${out}`, `--window-size=${width},${height}`, url], budget);

// The page puts its result as JSON in <pre id="out">
export function readOut(html) {
  const m = html.match(/<pre id="out"[^>]*>([\s\S]*?)<\/pre>/);
  if (!m) throw new Error('no <pre id="out"> on the page: the script crashed or did not finish');
  return JSON.parse(m[1].replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&amp;/g, "&"));
}
