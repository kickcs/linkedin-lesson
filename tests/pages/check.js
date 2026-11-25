// Mini checks on the page; tests/helpers.mjs reads the result from <pre id="out">
const results = [];
function check(name, fn) {
  try { fn(); results.push({ name, ok: true }); } catch (e) { results.push({ name, ok: false, error: String((e && e.message) || e) }); }
}
function eq(a, b, msg) { if (a !== b) throw new Error(`${msg || ""} expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`); }
function ok(v, msg) { if (!v) throw new Error(msg || "false"); }
function done(extra) {
  const out = document.createElement("pre");
  out.id = "out";
  out.style.display = "none";
  out.textContent = JSON.stringify(Object.assign({ results }, extra || {}));
  document.body.appendChild(out);
}
