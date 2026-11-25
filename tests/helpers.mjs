// Test pages in headless Chrome; URLs as in a HyperFrames project
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { serve } from "../skills/linkedin-lesson/recipe/bin/serve.mjs";
import { dumpDom, readOut, screenshot } from "../skills/linkedin-lesson/recipe/bin/chrome.mjs";
import { gsapPath } from "../skills/linkedin-lesson/recipe/bin/kit.mjs";

const here = dirname(fileURLToPath(import.meta.url));
export const ROOT = join(here, "..");
const recipe = join(ROOT, "skills/linkedin-lesson/recipe");
const ROUTES = [["/assets/kit/gsap.min.js", gsapPath()], ["/assets/kit/", join(recipe, "kit")], ["/layouts/", join(recipe, "layouts")], ["/", join(here, "pages")]];

export async function page(path) {
  const srv = await serve(ROUTES);
  try { return readOut(await dumpDom(srv.url + path)); } finally { srv.close(); }
}

export async function shot(path, out) {
  const srv = await serve(ROUTES);
  try { await screenshot(srv.url + path, out, { width: 1080, height: 1350 }); } finally { srv.close(); }
}
