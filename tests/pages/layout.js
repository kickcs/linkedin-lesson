// Mounts the skeleton as HyperFrames does: <template> content into the page, scripts re-created, time via __timelines.lesson
(async () => {
  const q = new URLSearchParams(location.search), name = q.get("layout");
  const html = await (await fetch(`/layouts/${name}.html`)).text();
  const tpl = new DOMParser().parseFromString(html, "text/html").querySelector("template");
  const host = document.getElementById("host");
  for (const node of [...tpl.content.childNodes]) {
    if (node.nodeName === "SCRIPT") {
      const sc = document.createElement("script");
      sc.textContent = node.textContent;
      host.appendChild(sc);
    } else host.appendChild(document.importNode(node, true));
  }
  await Promise.all(['500 16px "Bricolage Grotesque"', '800 16px "Bricolage Grotesque"', '600 16px "Shantell Sans"', '400 12px "JetBrains Mono"'].map((f) => document.fonts.load(f)));
  const tl = window.__timelines.lesson, dur = tl.duration();
  // suppressEvents=false: otherwise GSAP does not call onUpdate on seek
  const seek = (t) => tl.seek(t, false);
  if (q.has("t")) { seek(q.get("t") === "end" ? dur : +q.get("t")); done({ dur }); return; }

  const svg = host.querySelector("svg.lesson"), chromeLayer = svg.querySelector('[data-layer="chrome"]');
  const shown = (e) => {
    for (let n = e; n && n !== svg; n = n.parentNode) {
      const cs = getComputedStyle(n);
      if (cs.display === "none" || cs.visibility === "hidden" || +cs.opacity === 0) return false;
    }
    return true;
  };
  // the untyped tail of a centered line is transparent (fill-opacity 0): its letters are not visible
  const typed = (e) => {
    const sp = [...e.querySelectorAll("tspan")];
    return (sp.length ? sp.filter((t) => t.getAttribute("fill-opacity") !== "0").map((t) => t.textContent).join("") : e.textContent).trim();
  };
  const boxes = () => {
    const b = svg.getBoundingClientRect(), k = b.width / 360;
    return [...svg.querySelectorAll("text")].filter((e) => typed(e) && shown(e)).map((e) => {
      const r = e.getBoundingClientRect();
      return { s: e.textContent, cur: !!e.closest(".cursor"), size: +e.getAttribute("font-size"), fixed: e.hasAttribute("textLength"), x0: (r.left - b.left) / k, y0: (r.top - b.top) / k, x1: (r.right - b.left) / k, y1: (r.bottom - b.top) / k };
    });
  };
  const bad = [];
  const sheetRect = chromeLayer.querySelector('rect[fill="#ffffff"]');
  const [sx, sy, sw, sh] = ["x", "y", "width", "height"].map((k) => +sheetRect.getAttribute(k));
  for (let i = 0; i * 0.25 <= dur + 1e-9; i++) {
    const t = i * 0.25;
    seek(t);
    const rs = boxes();
    for (const r of rs) if (r.x0 < 8 || r.y0 < 4 || r.x1 > 352 || r.y1 > 446) bad.push(`t=${t} past the edge: "${r.s}"${r.cur ? " (cursor label)" : ""}`);
    for (const r of rs) if (r.size < 10) bad.push(`t=${t} smaller than 10: "${r.s}" (${r.size})`);
    // a line is either on the sheet or on the field; a cursor label and a stamp carry their own backing and frame
    for (const r of rs) {
      if (r.cur || r.fixed) continue;
      const inside = r.x0 >= sx - 0.5 && r.x1 <= sx + sw + 0.5 && r.y0 >= sy - 0.5 && r.y1 <= sy + sh + 0.5;
      const outside = r.x1 <= sx + 0.5 || r.x0 >= sx + sw - 0.5 || r.y1 <= sy + 0.5 || r.y0 >= sy + sh - 0.5;
      if (!inside && !outside) bad.push(`t=${t} on the sheet edge: "${r.s}"`);
    }
    // neighbouring lines touch by their boxes; overlap means more than 40 % of the height
    for (let a = 0; a < rs.length; a++) for (let c = a + 1; c < rs.length; c++) {
      const p = rs[a], r = rs[c];
      if (p.cur && r.cur) continue; // two cursor labels are not checked against each other
      const w = Math.min(p.x1, r.x1) - Math.max(p.x0, r.x0), h = Math.min(p.y1, r.y1) - Math.max(p.y0, r.y0);
      if (w > 1 && h > 0.4 * Math.min(p.y1 - p.y0, r.y1 - r.y0)) bad.push(`t=${t} overlap: "${p.s}"${p.cur ? " (cursor)" : ""} and "${r.s}"${r.cur ? " (cursor)" : ""}`);
    }
  }
  check("text is in frame, not smaller than 10, not on the sheet edge and not overlapping other text", () => ok(bad.length === 0, bad.slice(0, 6).join("; ")));
  // skeletons with demo events are short; stage is a whole lesson at reading pace
  const maxDur = name === "stage" ? 40 : 13;
  check(`duration 8–${maxDur} s`, () => ok(dur >= 8 && dur <= maxDur, `dur ${dur}`));
  check("title stands at frame 0", () => {
    seek(0);
    const t = [...chromeLayer.querySelectorAll('text[data-role="title"]')].filter((e) => e.textContent.trim() && shown(e));
    ok(t.length, "no visible title in the chrome layer at frame 0");
    ok(t.every((e) => +e.getAttribute("font-size") >= 26), `title shrunk below 26: ${t.map((e) => e.getAttribute("font-size"))}`);
    ok(chromeLayer.querySelector('rect[fill="#0e4a40"]') && chromeLayer.querySelector('rect[fill="#ffffff"]'), "no board at frame 0: field and sheet");
  });
  check("seeking forward and back gives the same frames", () => {
    // an empty style="" is left by removed properties and does not change the frame
    const norm = () => svg.innerHTML.replace(/ style=""/g, "");
    const ts = [];
    for (let t = 0; t < dur; t += 1) ts.push(t);
    ts.push(dur);
    const fwd = ts.map((t) => { seek(t); return norm(); });
    const back = ts.slice().reverse().map((t) => { seek(t); return norm(); }).reverse();
    const i = ts.findIndex((t, j) => fwd[j] !== back[j]);
    if (i < 0) return;
    let k = 0;
    while (fwd[i][k] === back[i][k]) k++;
    ok(false, `frame t=${ts[i]} depends on seek order: …${fwd[i].slice(Math.max(0, k - 40), k + 60)} | …${back[i].slice(Math.max(0, k - 40), k + 60)}`);
  });
  // motion.pace: the conclusion stays up characters / 16.5 + 1 s from the start of typing
  check("conclusion stays up characters / 16.5 + 1 s before erasing", () => {
    const layer = svg.querySelector('[data-layer="lesson"]'), out = layer.querySelector('text[data-role="conclusion"]');
    ok(out, "no conclusion in the lesson layer (S.conclusion)");
    ok(+out.getAttribute("font-size") >= 17, `conclusion shrunk below 17: ${out.getAttribute("font-size")}`);
    seek(dur);
    const full = out.textContent.length;
    ok(full > 0, "conclusion is empty at the end of the loop");
    const STEP = 0.05;
    let start = null, fade = null;
    for (let i = 0; i * STEP <= dur + 1e-9; i++) {
      const t = i * STEP;
      seek(t);
      if (start === null && out.textContent.length > 0) start = t;
      if (fade === null && +getComputedStyle(layer).opacity < 1) fade = t;
    }
    ok(start !== null && fade !== null, `did not find the typing start (${start}) or the erasing start (${fade})`);
    const need = full / 16.5 + 1;
    ok(fade - start >= need - 2 * STEP, `conclusion (${full} characters) from ${start.toFixed(2)} s, erasing from ${fade.toFixed(2)} s: stays up ${(fade - start).toFixed(2)} s, needs ${need.toFixed(2)} s`);
  });
  check("the lesson layer is erased by the end of the loop", () => {
    seek(dur);
    eq(+getComputedStyle(svg.querySelector('[data-layer="lesson"]')).opacity, 0);
  });
  done({ dur });
})();
