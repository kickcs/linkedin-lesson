// Layout snapshots at key seconds in tests/out/, for checking by eye
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { ROOT, shot } from "../tests/helpers.mjs";

const out = join(ROOT, "tests", "out");
mkdirSync(out, { recursive: true });
const MOMENTS = { actors: [0, 2.0, 3.9, 6.2, 9.0, 12.4],
  stage: [0, 3.9, 5.6, 6.9, 9.8, 14.6, 18.9, 25.6, 26.68],
  system: [0, 5, 9, 14, 19, 24, 25.61] };
// Board's skeletons mount through layout.html, the Cards skeleton through cards-layout.html
const PAGES = { system: ["cards", (t) => `/cards-layout.html?src=/layouts/system.html&t=${t}`] };
// node tools/snaps.mjs [layout …]: with no names, snaps all of them
const only = process.argv.slice(2);
for (const [name, ts] of Object.entries(MOMENTS)) {
  if (only.length && !only.includes(name)) continue;
  for (const t of ts) {
    const f = join(out, `${name}-${t}.png`);
    const [look, url] = PAGES[name] || ["board", (t) => `/layout.html?layout=${name}&t=${t}`];
    await shot(url(t), f, look);
    console.log(f);
  }
}
