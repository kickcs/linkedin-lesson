// Static http server on a free port: URL prefix → folder
import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const TYPES = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css",
  ".woff2": "font/woff2", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png",
};

export function serve(routes) {
  const server = http.createServer(async (req, res) => {
    const path = decodeURIComponent(new URL(req.url, "http://x").pathname);
    const route = routes.find(([prefix]) => path.startsWith(prefix));
    const rel = route ? normalize(path.slice(route[0].length)) : "";
    if (!route || rel.startsWith("..")) { res.writeHead(404).end(); return; }
    try {
      // a route can point at one file: then the prefix is the whole path
      const body = await readFile(rel === "." ? route[1] : join(route[1], rel));
      res.writeHead(200, { "content-type": TYPES[extname(rel)] || "application/octet-stream" }).end(body);
    } catch {
      res.writeHead(404).end();
    }
  });
  return new Promise((ok) => server.listen(0, "127.0.0.1", () => ok({
    url: `http://127.0.0.1:${server.address().port}`,
    close: () => server.close(),
  })));
}
