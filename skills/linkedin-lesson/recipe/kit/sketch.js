// Self-drawing scene engine: rough.js strokes reveal, text types out, cursors move.
// A frame is a pure function of time: render(s, t) can be called in any order, no state accumulates.
(function (global) {
  const NS = "http://www.w3.org/2000/svg";
  const C = {
    ink: "#1e1e1e", sub: "#495057", gray: "#868e96", lgray: "#adb5bd", blue: "#1971c2", lblue: "#a5d8ff",
    red: "#e03131", green: "#2f9e44", orange: "#e8590c", yellow: "#ffec99",
    violet: "#6965db", lviolet: "#e0dfff", paper: "#ffffff",
    // board: field, a muted and a light tone on it, chalk; red and green for the dark field
    field: "#0e4a40", dim: "#3f7a6e", soft: "#bfd6d0", chalk: "#ffd43b", white: "#ffffff", fred: "#ff9d9d", fgreen: "#8ce99a",
    // scene: table rules, hollow outlines, fills of a red and a green object
    rule: "#ced4da", hollow: "#adb5bd", lred: "#ffc9c9", lgreen: "#b2f2bb",
  };
  // The brand theme (assets/kit/theme.js, written and checked by bin/kit.mjs) overrides colors, fonts and roughness
  const T = global.LessonTheme || {}, F = T.fonts || {};
  Object.assign(C, T.colors);
  const ROUGH = T.rough == null ? 1 : T.rough;
  // The grotesque carries the content, the hand only the author's marks and signature
  const SANS = F.sans ? F.sans.family : "Bricolage Grotesque", HAND = F.hand ? F.hand.family : "Shantell Sans";
  const MONO = `"${F.mono ? F.mono.family : "JetBrains Mono"}", Menlo, monospace`;
  if (global.document) {
    document.documentElement.style.setProperty("--field", C.field);
    // theme font files lie in fonts/ next to this script, like the kit's own
    const src = document.currentScript && document.currentScript.src;
    const base = src ? src.replace(/[^/]*$/, "fonts/") : "assets/kit/fonts/";
    const faces = Object.values(F).map((f) => `@font-face { font-family: "${f.family}"; font-weight: ${f.weight || "100 900"}; src: url("${base}${f.file}"); }`);
    if (faces.length) document.head.appendChild(Object.assign(document.createElement("style"), { textContent: faces.join("\n") }));
  }
  const W = 360, H = 450, M = 22;
  // The white sheet on the board is the lesson scene; stage's is shorter: the scoreboard sits on the field below it
  const SHEET = { x: 12, y: 114, w: 336, h: 274, stage: 172 };
  // full text of a line and its segments: typing keeps only the typed part in the node
  const FULL = new WeakMap();

  function el(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) if (attrs[k] != null) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  const c01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
  const ease = (x) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
  const prog = (t, at, dur) => (dur > 0 ? c01((t - at) / dur) : t >= at ? 1 : 0);
  const lerp = (a, b, u) => a + (b - a) * u;

  // Two layers: the frame never fades, the lesson layer is erased over 0.35 s after fade
  function stage(svg, opt) {
    const s = { svg, rc: rough.svg(svg), acts: [], seed: 5 };
    s.chrome = el("g", { "data-layer": "chrome" }, svg);
    s.root = el("g", { "data-layer": "lesson" }, svg);
    // invisible twins of the lines, for measuring width
    s.probes = el("g", { "data-layer": "probes", visibility: "hidden" }, svg);
    // measurements (fit, chalk) depend on the font: once it has loaded, the current frame is shown again
    s.t = 0;
    s.fonts = new Set();
    document.fonts.addEventListener("loadingdone", () => render(s, s.t));
    const fade = opt && opt.fade;
    if (fade != null) s.acts.push((t) => { s.root.style.opacity = t > fade ? 1 - prog(t, fade, 0.35) : 1; });
    return s;
  }
  function render(s, t) { s.t = t; for (const f of s.acts) f(t); }
  function o(s, x) {
    const r = { stroke: C.ink, strokeWidth: 1.4, roughness: 0.75, bowing: 0.5, disableMultiStroke: true, seed: s.seed++ };
    for (const k in x) r[k] = x[k];
    // the theme's roughness scales every stroke: 0 draws clean lines
    if (ROUGH !== 1) { r.roughness *= ROUGH; r.bowing *= ROUGH; }
    return r;
  }

  // Strokes reveal by length as if drawn by hand; solid fills appear from the first third of the time
  function drawIn(s, node, at, dur, parent) {
    (parent || s.root).appendChild(node);
    const items = [...node.querySelectorAll("path")].reverse().map((p) => {
      const f = p.getAttribute("fill"), st = p.getAttribute("stroke");
      const solid = f && f !== "none" && (!st || st === "none");
      const L = solid ? 0 : p.getTotalLength();
      if (!solid) p.style.strokeDasharray = L + " " + (L + 2);
      return { p, L, solid };
    });
    const total = items.reduce((a, i) => a + i.L, 0) || 1;
    s.acts.push((t) => {
      const u = prog(t, at, dur);
      let len = u * total;
      for (const i of items) {
        if (i.solid) { i.p.style.opacity = u > 0.3 ? 1 : 0; continue; }
        const show = Math.max(0, Math.min(i.L, len));
        len -= i.L;
        i.p.style.strokeDashoffset = i.L - show;
        i.p.style.visibility = show > 0 ? "visible" : "hidden";
      }
    });
    return node;
  }

  // The first line using a font starts loading it, without waiting for layout
  function needFont(s, family, weight) {
    const spec = `${weight} 16px ${/[",]/.test(family) ? family : `"${family}"`}`;
    if (s.fonts.has(spec)) return;
    s.fonts.add(spec);
    document.fonts.load(spec);
  }
  // Text types out letter by letter; without at it stands whole from frame 0. A segment is [string, color, accent]
  function text(s, x, y, segs, st, at, dur, parent) {
    st = st || {};
    const t = el("text", { x, y, "font-family": st.f || SANS, "font-size": st.size || 15, "font-weight": st.w || 400, fill: st.c || C.ink, "text-anchor": st.anchor, "letter-spacing": st.ls }, parent || s.root);
    t.style.whiteSpace = "pre";
    needFont(s, st.f || SANS, st.w || 400);
    // a centered line's untyped tail stays transparent: the width is constant and the center does not jitter
    const pad = st.anchor === "middle" || st.anchor === "end";
    const spans = segs.map((g) => ({ ts: el("tspan", { fill: g[1], "data-accent": g[2] ? "" : null }, t), rest: pad ? el("tspan", { fill: g[1], "fill-opacity": 0 }, t) : null, full: g[0] }));
    const total = segs.reduce((a, g) => a + g[0].length, 0);
    FULL.set(t, segs.map((g) => g[0]).join(""));
    for (const sp of spans) FULL.set(sp.ts, sp.full);
    s.acts.push((tt) => {
      let n = at == null ? total : Math.round(prog(tt, at, dur) * total);
      for (const sp of spans) {
        const k = Math.max(0, Math.min(sp.full.length, n));
        n -= sp.full.length;
        sp.ts.textContent = sp.full.slice(0, k);
        if (sp.rest) sp.rest.textContent = sp.full.slice(k);
      }
    });
    return t;
  }
  function vis(s, node, from, to) { s.acts.push((t) => { node.style.display = t >= from && t < to ? "" : "none"; }); }

  // Shrinks the font size of the lines by one factor until the longest fits max. Width is measured when a frame
  // is shown, with the font loaded, on the twin with the full text: the line itself may be partly typed
  function fit(s, nodes, max) {
    const list = [].concat(nodes), sizes = list.map((n) => +n.getAttribute("font-size"));
    const probes = list.map((n) => {
      const p = n.cloneNode(false);
      p.removeAttribute("data-role");
      p.textContent = FULL.get(n);
      return s.probes.appendChild(p);
    });
    s.acts.push(() => {
      const w = Math.max(...probes.map((p) => p.getComputedTextLength())), k = w > max ? max / w : 1;
      list.forEach((n, i) => n.setAttribute("font-size", +(sizes[i] * k).toFixed(2)));
    });
    return nodes;
  }
  // Chalk underline under a line's accent; sits under the text. Without at it stands from frame 0, otherwise it is drawn from at
  function chalk(s, node, at, color) {
    const size = +node.getAttribute("font-size");
    return [...node.querySelectorAll("tspan[data-accent]")].map((ts) => {
      const full = FULL.get(ts), base = Math.max(20, full.length * size * 0.5), grp = el("g", {});
      node.parentNode.insertBefore(grp, node);
      const line = s.rc.line(0, 0, base, -0.6, o(s, { stroke: color || C.chalk, strokeWidth: 2.4 + size * 0.03, roughness: 1.1, bowing: 1.4, disableMultiStroke: false }));
      drawIn(s, line, at == null ? -1 : at, at == null ? 0.01 : 0.3, grp);
      s.acts.push((t) => {
        const on = ts.textContent.length === full.length && (at == null || t >= at);
        grp.style.display = on ? "" : "none";
        if (!on) return;
        const x0 = ts.getStartPositionOfChar(0).x, x1 = ts.getEndPositionOfChar(full.length - 1).x, cur = +node.getAttribute("font-size");
        grp.setAttribute("transform", `translate(${(x0 - 1).toFixed(2)} ${(+node.getAttribute("y") + 2 + cur * 0.15).toFixed(2)}) scale(${((x1 - x0 + 3) / base).toFixed(4)} 1)`);
      });
      return grp;
    });
  }

  // Lucide icon (ISC) in rough.js strokes; size is in logical units
  function icon(s, name, x, y, size, color, roughness) {
    const shapes = global.ICONS[name];
    if (!shapes) throw new Error("no such icon: " + name);
    const k = size / 24;
    const g = el("g", { transform: `translate(${x},${y}) scale(${k})` });
    const op = () => o(s, { stroke: color || C.ink, strokeWidth: (1.9 / k) * (size > 30 ? 1.2 : 1), roughness: roughness == null ? 0.45 : roughness, bowing: 1, disableMultiStroke: false });
    for (const e of shapes) g.appendChild(shape(s, e, op()));
    return g;
  }
  function shape(s, e, opt) {
    switch (e[0]) {
      case "p": return s.rc.path(e[1], opt);
      case "r": return s.rc.rectangle(e[1], e[2], e[3], e[4], opt);
      case "c": return s.rc.circle(e[1], e[2], e[3] * 2, opt);
      case "e": return s.rc.ellipse(e[1], e[2], e[3] * 2, e[4] * 2, opt);
      case "l": return s.rc.line(e[1], e[2], e[3], e[4], opt);
      case "pl": return s.rc.linearPath(pairs(e[1]), opt);
      case "pg": return s.rc.polygon(pairs(e[1]), opt);
      default: throw new Error("unknown shape: " + e[0]);
    }
  }
  // In Lucide polyline points are separated by spaces, in other sets by commas
  function pairs(str) {
    const n = str.trim().split(/[\s,]+/).map(Number), r = [];
    for (let i = 0; i + 1 < n.length; i += 2) r.push([n[i], n[i + 1]]);
    return r;
  }
  function arrow(s, pts, opt) {
    const g = el("g", {});
    g.appendChild(pts.length > 2 ? s.rc.curve(pts, o(s, opt)) : s.rc.line(pts[0][0], pts[0][1], pts[1][0], pts[1][1], o(s, opt)));
    const a = pts[pts.length - 2], b = pts[pts.length - 1], ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
    for (const q of [ang + Math.PI - 0.45, ang + Math.PI + 0.45]) g.appendChild(s.rc.line(b[0], b[1], b[0] + 11 * Math.cos(q), b[1] + 11 * Math.sin(q), o(s, opt)));
    return g;
  }

  // Cursor path: segments over time, a smooth flight between them
  const Ln = (t0, t1, x0, y0, x1, y1) => ({ t0, t1, fn: (u) => [lerp(x0, x1, u), lerp(y0, y1, u)] });
  const At = (t0, t1, x, y) => ({ t0, t1, fn: () => [x, y] });
  const El = (t0, t1, cx, cy, rx, ry) => ({ t0, t1, fn: (u) => { const a = u * Math.PI * 2.05; return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)]; } });
  function track(segs) {
    return (t) => {
      for (let i = 0; i < segs.length; i++) {
        const g = segs[i];
        if (t < g.t0) {
          if (i === 0) return g.fn(0);
          const pr = segs[i - 1], a = pr.fn(1), b = g.fn(0), u = ease(c01((t - pr.t1) / (g.t0 - pr.t1)));
          return [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
        }
        if (t <= g.t1) return g.fn(c01((t - g.t0) / (g.t1 - g.t0 || 1)));
      }
      return segs[segs.length - 1].fn(1);
    };
  }
  // The cursor lives in the lesson layer and appears after zero, so the loop end matches frame 0
  function cursor(s, segs, color, name) {
    if (!(segs[0].t0 > 0)) throw new Error("cursor: the first segment must start after zero");
    const g = el("g", { class: "cursor" }, s.root);
    el("path", { d: "M0 0 L0 16 L4.5 12 L7.5 19 L10 18 L7 11 L13 11 Z", fill: color, stroke: C.white, "stroke-width": 1.2, "stroke-linejoin": "round" }, g);
    // label width by letter count: textLength holds it without measuring the font
    const nameW = name ? name.length * 5.6 : 0, chipW = name ? nameW + 12 : 0;
    let chip = null;
    if (name) {
      chip = el("g", {}, g);
      el("rect", { x: 10, y: 18, width: chipW, height: 16, rx: 4, fill: color }, chip);
      el("text", { x: 16, y: 29.6, "font-family": SANS, "font-size": 10, "font-weight": 700, fill: C.white, textLength: nameW, lengthAdjust: "spacingAndGlyphs" }, chip).textContent = name;
    }
    const f = track(segs), from = segs[0].t0;
    s.acts.push((t) => {
      const p = f(t);
      g.setAttribute("transform", `translate(${p[0]},${p[1]})`);
      g.style.display = t >= from ? "" : "none";
      // near the right edge the label goes left of the tip, to stay within the 8 margin
      if (chip) chip.setAttribute("transform", `translate(${p[0] + 10 + chipW > W - 8 ? -14 - chipW : 0},0)`);
    });
    return { g, f, chip };
  }
  function laser(s, cur, from, to) {
    const p = el("path", { fill: "none", stroke: C.red, "stroke-width": 3, "stroke-linecap": "round", "stroke-linejoin": "round", opacity: 0.85 }, s.root);
    s.root.appendChild(cur.g); // cursor above the trail
    s.acts.push((t) => {
      if (t < from || t > to + 0.35) { p.setAttribute("d", ""); return; }
      let d = "";
      for (let k = 0; k <= 12; k++) {
        const q = cur.f(Math.max(from, Math.min(to, t - 0.35 + k * 0.03)));
        d += (k ? "L" : "M") + q[0] + " " + q[1];
      }
      p.setAttribute("d", d);
    });
    return p;
  }
  function ripple(s, x, y, at, color) {
    const c = el("circle", { cx: x, cy: y, r: 0, fill: "none", stroke: color || C.violet, "stroke-width": 2 }, s.root);
    s.acts.push((t) => {
      const u = prog(t, at, 0.4);
      c.setAttribute("r", u > 0 && u < 1 ? 4 + u * 12 : 0);
      c.setAttribute("opacity", 1 - u);
    });
    return c;
  }
  // Flight along a quadratic curve p0 → p2 through p1; keep stays at the end
  function fly(s, node, at, dur, p0, p1, p2, keep) {
    s.root.appendChild(node);
    s.acts.push((t) => {
      const u = prog(t, at, dur), e = ease(u);
      const x = (1 - e) * (1 - e) * p0[0] + 2 * (1 - e) * e * p1[0] + e * e * p2[0];
      const y = (1 - e) * (1 - e) * p0[1] + 2 * (1 - e) * e * p1[1] + e * e * p2[1];
      node.setAttribute("transform", `translate(${x},${y})`);
      node.style.display = t >= at && (keep || u < 1) ? "" : "none";
    });
    return node;
  }
  function level(keys, t) {
    let v = keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      if (t >= keys[i - 1][0]) v = t >= keys[i][0] ? keys[i][1] : lerp(keys[i - 1][1], keys[i][1], c01((t - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0])));
    }
    return v;
  }
  // Scale: keys are [second, fraction 0..1]; the lesson writes the label via format(v) with numbers from the card
  function meter(s, x, y, w, h, keys, format, opt) {
    opt = opt || {};
    const parent = opt.parent || s.root, from = keys[0][0];
    drawIn(s, s.rc.rectangle(x, y, w, h, o(s, { roughness: 0.8, strokeWidth: 1.2 })), from - 0.3, 0.3, parent);
    const bar = el("rect", { x: x + 1.5, y: y + 1.5, height: h - 3, width: 0 }, parent);
    const at = opt.at || [x + w + 6, y + h];
    const label = format ? el("text", { x: at[0], y: at[1], "font-family": SANS, "font-weight": 500, "font-size": opt.size || 11 }, parent) : null;
    s.acts.push((t) => {
      const v = level(keys, t), col = v > 0.5 ? C.red : C.green, shown = t >= from ? "" : "none";
      bar.setAttribute("width", Math.max(0, (w - 3) * v));
      bar.setAttribute("fill", col);
      bar.style.display = shown;
      if (label) { label.textContent = format(v); label.setAttribute("fill", col); label.style.display = shown; }
    });
    return { bar, label };
  }
  // digits is decimal places; without it an integer
  function counter(s, node, at, dur, a, b, suffix, digits) {
    s.acts.push((t) => {
      const v = lerp(a, b, prog(t, at, dur));
      node.textContent = (digits ? v.toFixed(digits) : Math.round(v)) + (suffix || "");
    });
    return node;
  }

  // "Run tests in a *subagent*" → segments; a word in asterisks is an accent: chalk underline in the title and conclusion,
  // color applies to lines on the sheet
  function segs(markup, color) {
    if ((markup.split("*").length - 1) % 2) throw new Error(`unpaired "*" in line: ${markup}`);
    return markup.split("*").map((part, i) => [part, i % 2 ? color : undefined, i % 2 === 1]).filter((g) => g[0]);
  }
  // Title is a string like "Why RAG bots|*make things up*" (| is a line break) or ready segments; up to two lines
  const titleLines = (v) => (typeof v === "string" ? v.split("|").map((m) => segs(m.trim())) : Array.isArray(v[0][0]) ? v : [v]);
  // sub is a question subtitle under the title; two title lines plus a subtitle do not fit above the sheet
  function title(s, v, sub) {
    const lines = titleLines(v);
    if (lines.length > 2) throw new Error("title: at most two lines");
    if (sub && lines.length > 1) throw new Error("with a subtitle the title is one line");
    const ys = lines.length > 1 ? [62, 96] : [sub ? 70 : 79];
    const nodes = lines.map((sg, i) => text(s, 21, ys[i], sg, { size: 35, w: 800, c: C.white, ls: "-0.01em" }, null, 0, s.chrome));
    for (const n of nodes) n.setAttribute("data-role", "title");
    fit(s, nodes, 318);
    for (const n of nodes) chalk(s, n);
    return nodes;
  }
  function subtitle(s, str) {
    if (!str) return undefined;
    const n = text(s, 21, 97, [[str, C.white]], { size: 15, w: 600 }, null, 0, s.chrome);
    n.setAttribute("data-role", "subtitle");
    fit(s, n, 318);
    return n;
  }
  // Series mark "7/30": "Day 7 of 30" and a tick strip, the first 7 filled
  function series(s, str) {
    if (!str) return undefined;
    const m = /^(\d+)\s*\/\s*(\d+)$/.exec(str);
    if (!m) throw new Error(`series: expected "day/total", e.g. 7/30, got "${str}"`);
    const day = +m[1], days = +m[2], pitch = Math.min(4, 230 / days), w = pitch * 0.6, x0 = W - M - ((days - 1) * pitch + w);
    for (let i = 0; i < days; i++) el("rect", { x: +(x0 + i * pitch).toFixed(2), y: 19, width: +w.toFixed(2), height: 8, rx: 0.6, fill: i < day ? C.white : C.dim }, s.chrome);
    return text(s, M, 27, [[`Day ${day} of ${days}`, C.white]], { size: 10.5, w: 700 }, null, 0, s.chrome);
  }
  // Author's signature at the bottom of the field
  function sign(s, str) { return str ? text(s, M, 436, [[str, C.soft]], { f: HAND, size: 10.5, w: 500 }, null, 0, s.chrome) : undefined; }
  // Conclusion in chalk on the field; without at it stands whole (the key frame before the build)
  function conclusion(s, v, at, dur) {
    const t = text(s, 21, 412, typeof v === "string" ? segs(v) : v, { size: 21, w: 800, c: C.white, ls: "-0.01em" }, at, dur);
    t.setAttribute("data-role", "conclusion");
    fit(s, t, 318);
    chalk(s, t, at == null ? null : at + (dur || 0));
    return t;
  }

  // The board stands from frame 0 and is never erased: field, sheet of height h, series, title, subtitle, signature
  function board(s, v, opt, h) {
    opt = opt || {};
    el("rect", { x: 0, y: 0, width: W, height: H, fill: C.field }, s.chrome);
    el("rect", { x: SHEET.x, y: SHEET.y, width: SHEET.w, height: h || SHEET.h, rx: 9, fill: C.paper }, s.chrome);
    return { series: series(s, opt.series), title: title(s, v, opt.sub), sub: subtitle(s, opt.sub), sign: sign(s, opt.sign) };
  }
  // Frame of one side in a "how they differ" lesson: stands from frame 0, the side's name inside at the top
  function frame(s, x, y, w, h, label, color) {
    const box = el("rect", { x, y, width: w, height: h, rx: 4, fill: "none", stroke: C.lgray, "stroke-width": 1.2 }, s.chrome);
    const name = text(s, x + 10, y + 18, [[label, color || C.ink]], { size: 15, w: 700 }, null, 0, s.chrome);
    fit(s, name, w - 20);
    return { box, name };
  }
  // Layout frame: the board; stage's sheet is shorter, with the scoreboard below it
  const chrome = {
    actors: (s, v, opt) => board(s, v, opt),
    // "scene and scoreboard": the sheet holds the frame and the step scene, the scoreboard accumulates on the field below it
    stage: (s, v, opt) => board(s, v, opt, SHEET.stage),
  };

  global.Sketch = { C, SANS, HAND, MONO, W, H, M, SHEET, el, c01, ease, prog, lerp, stage, render, o, drawIn, text, vis, fit, chalk,
    icon, pairs, arrow, Ln, At, El, track, cursor, laser, ripple, fly, meter, counter,
    segs, title, subtitle, series, sign, conclusion, frame, board, chrome };
})(window);
