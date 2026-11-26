// Test pages in headless Chrome; URLs as in a HyperFrames project
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { serve } from "../skills/linkedin-lesson/recipe/bin/serve.mjs";
import { dumpDom, readOut, screenshot } from "../skills/linkedin-lesson/recipe/bin/chrome.mjs";
import { gsapPath } from "../skills/linkedin-lesson/recipe/bin/kit.mjs";

const here = dirname(fileURLToPath(import.meta.url));
export const ROOT = join(here, "..");
const recipe = join(ROOT, "skills/linkedin-lesson/recipe");
// the kit and layouts of one look, as kit.mjs and the skeleton copy put them into a project
const routes = (look) => [
  ["/assets/kit/gsap.min.js", gsapPath()], ["/assets/kit/", join(recipe, `looks/${look}/kit`)], ["/layouts/", join(recipe, `looks/${look}/layouts`)],
  ["/examples/", join(ROOT, "skills/linkedin-lesson/examples")], ["/", join(here, "pages")],
];

export async function page(path, look = "board") {
  const srv = await serve(routes(look));
  try { return readOut(await dumpDom(srv.url + path)); } finally { srv.close(); }
}

export async function shot(path, out, look = "board") {
  const srv = await serve(routes(look));
  try { await screenshot(srv.url + path, out, { width: 1080, height: 1350 }); } finally { srv.close(); }
}
