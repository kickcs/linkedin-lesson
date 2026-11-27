// The cards look: every part of the system is a white rounded card with its drawing and current state; requests and
// replies are chips on the links between the cards. One clock: every element gets its time windows once, and
// render(t) is a pure function of t. Coordinates are the 1080×1350 frame.
(function (global) {
  const NS = "http://www.w3.org/2000/svg";
  const W = 1080, H = 1350, CPS = 16.5;
  const SANS = "Overpass", MONO = '"JetBrains Mono", monospace';
  // violet follows the main request, teal the second flow and successful replies, orange a wait or a failure
  const C = {
    field: "#e9eef3", paper: "#ffffff", ink: "#14233b", note: "#51617a", mute: "#cfd6df", dim: "#9aa7b8",
    violet: "#6f3ff5", lviolet: "#e6dcff",
    teal: "#00a391", lteal: "#c4ece6", tealInk: "#00695d",
    orange: "#d14900", amber: "#ff9d2e", lorange: "#ffe6c9", orangeInk: "#9a3700",
    yellow: "#ffe27a",
  };
  const r2 = (x) => Math.round(x * 100) / 100;
  // what the viewer reads in a title or conclusion: "|" breaks the line, "*" marks are dropped (this look has no accent)
  const plain = (str) => String(str).replace(/\*/g, "").split("|").map((l) => l.trim());
  // bin/pace.mjs reads the steps and the conclusion from here
  const report = () => (global.LessonPace = global.LessonPace || { calls: [], conclusion: null });

  // Reading pace: the next step comes max(lead + characters / cps, motion + 0.5) after the current one starts
  function pace(steps, start, cps) {
    let t = start;
    const r = steps.map((st) => {
      const chars = st.text.reduce((a, q) => a + q.length, 0), at = t;
      t += Math.max((st.lead || 0) + chars / (cps || CPS), (st.motion || 1) + 0.5);
      return Object.assign({}, st, { at, end: t, chars });
    });
    report().calls.push(r);
    return r;
  }
  const step = (text, motion, lead) => ({ text, motion, lead });
  // The conclusion comes when the last step ends and holds for its characters / 16.5 + 1 s; DUR = FADE + 0.7
  function timing(end, conclusion) {
    const FADE = r2(end + plain(conclusion).join(" ").length / CPS + 1);
    return { END: end, FADE, DUR: r2(FADE + 0.7) };
  }

  function stage(svg, opt) {
    const fade = opt && opt.fade != null ? opt.fade : 1e9;
    const add = (tag, a, parent) => { const e = document.createElementNS(NS, tag); for (const k in a) if (a[k] != null) e.setAttribute(k, a[k]); (parent || svg).appendChild(e); return e; };
    const g = (parent, a) => add("g", a || {}, parent);
    const at = (x, y, k, parent) => g(parent, { transform: `translate(${x} ${y}) scale(${k || 1})` });
    const rr = (x, y, w, h, r) => `M${x + r} ${y} H${x + w - r} Q${x + w} ${y} ${x + w} ${y + r} V${y + h - r} Q${x + w} ${y + h} ${x + w - r} ${y + h} H${x + r} Q${x} ${y + h} ${x} ${y + h - r} V${y + r} Q${x} ${y} ${x + r} ${y} Z`;
    const tx = (x, y, str, o, parent) => { o = o || {}; const e = add("text", { x, y, "font-size": o.size || 28, "font-weight": o.w || 500, fill: o.fill || C.ink, "text-anchor": o.anchor, "letter-spacing": o.ls, "font-family": o.font || SANS }, parent); e.textContent = str; return e; };
    // an outlined shape (ink, 7 wide, round joins) and a solid one
    const outline = (d, fill, o, parent) => add("path", { d, fill: fill || "none", stroke: (o && o.stroke) || C.ink, "stroke-width": (o && o.sw) || 7, "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-dasharray": o && o.dash }, parent);
    const solid = (d, fill, parent) => add("path", { d, fill }, parent);

    // ---- time
    const acts = [];
    const clamp = (v) => Math.max(0, Math.min(1, v));
    const prog = (t, from, dur) => (dur > 0 ? clamp((t - from) / dur) : t >= from ? 1 : 0);
    const eio = (u) => (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2);
    const back = (u) => 1 + 2.70158 * Math.pow(u - 1, 3) + 1.70158 * Math.pow(u - 1, 2);
    const alpha = (el, a, keep) => { el.style.display = a > 0.004 || keep ? "" : "none"; el.style.opacity = a > 0.996 ? "" : a.toFixed(2); };
    // visible inside the windows [from, to, fadeIn, fadeOut]; a window without to lasts until the fade and leaves with
    // it in 0.35 s. With o.except the element is visible outside the windows; o.keep leaves it laid out while hidden.
    // The list is read at render time: windows pushed into it later count.
    const showW = (el, wins, o) => {
      o = o || {};
      acts.push((t) => {
        let a = 0;
        for (const w of wins) {
          let [from, to, fi = 0.2, fo = 0.2] = w;
          if (to == null) { to = fade; if (w[3] == null) fo = 0.35; }
          a = Math.max(a, Math.min(prog(t, from, fi), 1 - prog(t, to, fo)));
        }
        alpha(el, o.except ? 1 - a : a, o.keep);
      });
      return el;
    };
    const show = (el, from, to, o) => showW(el, [[from, to, o && o.in, o && o.out]], o);
    // a part hidden during the lesson comes back with this window, so the frame after the fade equals frame 0
    const BACK = [fade, 1e9, 0.35, 0];
    // bounce: scale 0 → 1.1 → 1 around (cx, cy)
    const pop = (el, cx, cy, from, dur) => {
      acts.push((t) => { const u = prog(t, from, dur || 0.25); el.setAttribute("transform", u < 1 ? `translate(${cx} ${cy}) scale(${Math.max(0.01, back(u)).toFixed(3)}) translate(${-cx} ${-cy})` : ""); });
      return el;
    };
    // an object that pops in at from and leaves at to; build draws it into the given group
    const enter = (cx, cy, from, to, build, parent, out) => {
      const outer = g(parent), inner = g(outer);
      build(inner);
      show(outer, from, to, { in: 0, out: out == null ? (to == null ? 0.35 : 0.2) : out });
      pop(inner, cx, cy, from);
      return outer;
    };
    // a stroke that draws itself
    const draw = (path, from, dur) => {
      path.setAttribute("pathLength", 1); path.setAttribute("stroke-dasharray", "1 1");
      acts.push((t) => path.setAttribute("stroke-dashoffset", (1 - eio(prog(t, from, dur))).toFixed(3)));
      return path;
    };
    // lines of one caption shrink together to maxW, once the font is in
    const fit = (els, maxW) => {
      let done = false;
      acts.push(() => {
        if (done || !document.fonts.check(`800 40px ${SANS}`)) return;
        const w = Math.max(...els.map((e) => e.getComputedTextLength()));
        if (!w) return;
        if (w > maxW) els.forEach((e) => e.setAttribute("font-size", (+e.getAttribute("font-size") * maxW / w).toFixed(1)));
        done = true;
      });
      return els;
    };
    // an invisible rect that changes on every frame forces a full repaint: a partial one alternates two antialiasing
    // variants on a still frame, and gifpack cannot merge the pause
    const repaint = add("rect", { width: "100%", height: "100%", fill: "none", "fill-opacity": 0, "pointer-events": "none", "data-role": "repaint" });
    acts.push((t) => repaint.setAttribute("fill", `rgb(${Math.round(t * 1000) % 256},0,0)`));
    const render = (t) => { for (const a of acts) a(t); };

    // ---- frame: field, series, title, subtitle, signature; then the layers links → cards → over → caps
    const L = {};
    function chrome(title, o) {
      o = o || {};
      add("rect", { width: W, height: H, fill: C.field });
      const lines = plain(title);
      if (lines.length > 2) throw new Error("title: at most two lines");
      if (o.sub && lines.length > 1) throw new Error("with a subtitle the title is one line");
      const r = { series: series(o.series) };
      // one line stands at 150 with a subtitle under it; two lines are smaller and take the subtitle's place
      r.title = fit(lines.length > 1 ? lines.map((s, k) => tx(62, 126 + 86 * k, s, { size: 84, w: 900, ls: -1.5 })) : [tx(62, 150, lines[0], { size: 98, w: 900, ls: -2 })], W - 124);
      r.title.forEach((n) => n.setAttribute("data-role", "title"));
      if (o.sub) { r.sub = tx(66, 208, o.sub, { size: 38, fill: C.note }); r.sub.setAttribute("data-role", "subtitle"); fit([r.sub], W - 128); }
      if (o.sign) r.sign = tx(66, 1312, o.sign, { size: 29, fill: C.note });
      L.links = g(); L.cards = g(); L.over = g(); L.caps = g();
      return r;
    }
    // "7/30": "Day 7 of 30" top left and a strip of rounded ticks on the right, the first 7 filled
    function series(str) {
      if (!str) return undefined;
      const m = /^(\d+)\s*\/\s*(\d+)$/.exec(str);
      if (!m) throw new Error(`series: expected "day/total", e.g. 7/30, got "${str}"`);
      const day = +m[1], days = +m[2], pitch = Math.min(12, 690 / days), w = pitch * 0.6, x0 = W - 62 - ((days - 1) * pitch + w);
      for (let i = 0; i < days; i++) add("rect", { x: +(x0 + i * pitch).toFixed(2), y: 32, width: +w.toFixed(2), height: 20, rx: +(w / 2).toFixed(2), fill: i < day ? C.ink : C.mute });
      return tx(66, 52, `Day ${day} of ${days}`, { size: 26, w: 800, fill: C.note });
    }

    // ---- parts and links
    const card = (x, y, w, h, r, parent) => solid(rr(x, y, w, h, r || 46), C.paper, parent || L.cards);
    // a link between two cards; it lies under the cards, so only the gap between them shows
    const link = (x1, y1, x2, y2, color, parent) => add("line", { x1, y1, x2, y2, stroke: color, "stroke-width": 14, "stroke-linecap": "round" }, parent || L.links);
    // arrow head with its tip at (x, y)
    const HEADS = { down: [-13, -20, 13, -20], up: [-13, 20, 13, 20], right: [-20, -13, -20, 13], left: [20, -13, 20, 13] };
    const head = (x, y, color, dir, parent) => {
      const [ax, ay, bx, by] = HEADS[dir || "down"];
      return add("path", { d: `M${x} ${y} L${x + ax} ${y + ay} L${x + bx} ${y + by} Z`, fill: color, stroke: color, "stroke-width": 6, "stroke-linejoin": "round" }, parent || L.links);
    };
    // a bar across a link: the request cannot pass
    const stop = (x, y, half, parent) => add("line", { x1: x - (half || 30), y1: y, x2: x + (half || 30), y2: y, stroke: C.ink, "stroke-width": 10, "stroke-linecap": "round" }, parent || L.links);
    // a request on its way: a dot along the link
    const packet = (x1, y1, x2, y2, color, from, dur, parent) => {
      const c = add("circle", { r: 12, fill: color, stroke: C.paper, "stroke-width": 5 }, parent || L.over);
      dur = dur || 0.5;
      acts.push((t) => {
        const on = t > from && t < from + dur, u = eio(prog(t, from, dur));
        c.style.display = on ? "" : "none";
        // placed even while hidden, so the frame does not depend on the seek order
        c.setAttribute("cx", (x1 + (x2 - x1) * u).toFixed(1)); c.setAttribute("cy", (y1 + (y2 - y1) * u).toFixed(1));
      });
      return c;
    };
    // a tap on a screen: a ring that grows and fades in 0.5 s
    const tap = (cx, cy, color, from, parent) => {
      const c = add("circle", { cx, cy, fill: "none", stroke: color, "stroke-width": 5 }, parent || L.over);
      acts.push((t) => { const u = prog(t, from, 0.5); c.style.display = u > 0 && u < 1 ? "" : "none"; c.setAttribute("r", (12 + 34 * u).toFixed(1)); c.style.opacity = (1 - u).toFixed(2); });
      return c;
    };

    // ---- chips, tags, marks
    const chipW = (label, size) => label.length * (size || 27) * 0.6 + 38;
    const badge = (cx, cy, label, parent) => {
      add("circle", { cx, cy, r: 25, fill: C.violet }, parent);
      tx(cx, cy + 8, label, { size: 23, w: 800, fill: C.paper, anchor: "middle" }, parent);
    };
    // a request (outlined in its link's color) or a reply (o.reply: teal fill) on a link, centered on (cx, cy);
    // pops in at from; o.badge puts a count such as "×10" on its corner
    const chip = (cx, cy, label, o, from, to, out, parent) => enter(cx, cy, from, to, (q) => {
      const w = chipW(label), h = 51.3;
      outline(rr(cx - w / 2, cy - h / 2, w, h, h / 2), o.reply ? C.lteal : C.paper, { stroke: o.reply ? C.teal : o.color, sw: 5 }, q);
      tx(cx, cy + 9.5, label, { size: 27, w: 400, anchor: "middle", font: MONO }, q);
      if (o.badge) badge(cx + w / 2 + 14, cy - 6, o.badge, q);
    }, parent || L.over, out);
    // a field of a database row: monospace in a small pill, left edge at x
    const tag = (x, cy, label, fill, color, parent) => {
      const w = label.length * 14.4 + 30;
      solid(rr(x, cy - 19, w, 38, 19), fill, parent);
      tx(x + w / 2, cy + 8.5, label, { size: 24, w: 400, fill: color, anchor: "middle", font: MONO }, parent);
      return w;
    };
    // a short word in a pill ("before", "after", "crash")
    const pill = (x, cy, str, fill, color, parent) => {
      const w = str.length * 13.4 + 30;
      solid(rr(x, cy - 18, w, 36, 18), fill, parent);
      tx(x + w / 2, cy + 8, str, { size: 23, w: 800, fill: color, anchor: "middle" }, parent);
      return w;
    };
    // an outline that draws itself around what a line of text is about
    const ring = (x, y, w, h, color, from, to, out, parent) => showW(draw(outline(rr(x, y, w, h, Math.min(h / 2, 40)), null, { stroke: color, sw: 6 }, parent || L.over), from, 0.4), [[from, to, 0, out == null ? (to == null ? 0.35 : 0.2) : out]]);

    // ---- drawings, each at (x, y) scaled by k; the size is at k = 1
    const check = (x, y, color, parent, k) => add("path", { d: `M${x} ${y} l${9 * (k || 1)} ${9 * (k || 1)} l${16 * (k || 1)} ${-18 * (k || 1)}`, fill: "none", stroke: color, "stroke-width": 6 * (k || 1), "stroke-linecap": "round", "stroke-linejoin": "round" }, parent);
    const clock = (cx, cy, r, color, parent) => {
      add("circle", { cx, cy, r, fill: "none", stroke: color, "stroke-width": r * 0.38 }, parent);
      add("path", { d: `M${cx} ${cy - r * 0.55} V${cy} L${cx + r * 0.45} ${cy + r * 0.25}`, fill: "none", stroke: color, "stroke-width": r * 0.34, "stroke-linecap": "round", "stroke-linejoin": "round" }, parent);
    };
    // 44×44
    const stopwatch = (x, y, color, parent) => {
      const q = at(x, y, 1, parent);
      add("circle", { cx: 22, cy: 28, r: 16, fill: C.paper, stroke: color, "stroke-width": 6 }, q);
      solid(rr(17, 3, 10, 9, 3), color, q);
      add("path", { d: "M22 28 V18 M22 28 L29 32", fill: "none", stroke: color, "stroke-width": 5, "stroke-linecap": "round" }, q);
      return q;
    };
    // 84×136: an empty phone; the lesson draws the screen into the returned group
    const phone = (x, y, k, parent) => {
      const q = at(x, y, k, parent);
      outline(rr(0, 0, 84, 136, 20), C.paper, {}, q);
      solid(rr(31, 118, 22, 6, 3), C.mute, q);
      return q;
    };
    // 120×110
    const bank = (x, y, k, parent) => {
      const q = at(x, y, k, parent);
      outline("M10 40 L60 8 L110 40 Z", C.paper, {}, q);
      add("circle", { cx: 60, cy: 29, r: 6, fill: C.amber }, q);
      for (const xx of [24, 53, 82]) solid(rr(xx, 50, 14, 40, 7), C.ink, q);
      solid(rr(8, 94, 104, 14, 7), C.ink, q);
      return q;
    };
    // 84×92
    const db = (x, y, k, parent) => {
      const q = at(x, y, k, parent);
      outline("M4 18 V72 A38 14 0 0 0 80 72 V18 A38 14 0 0 0 4 18 Z", C.paper, {}, q);
      outline("M4 18 A38 14 0 0 0 80 18", null, {}, q);
      outline("M4 45 A38 14 0 0 0 80 45", null, {}, q);
      return q;
    };
    // 42×38
    const server = (x, y, k, parent) => {
      const q = at(x, y, k, parent);
      for (const yy of [0, 22]) { outline(rr(0, yy, 42, 16, 6), C.paper, { sw: 5 }, q); add("circle", { cx: 10, cy: yy + 8, r: 2.8, fill: C.ink }, q); solid(rr(20, yy + 6, 14, 4, 2), C.mute, q); }
      return q;
    };
    // a worker's gear around (cx, cy) of radius r
    const gear = (cx, cy, r, parent) => {
      let d = "";
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4, p = (da, rad) => `${(cx + Math.cos(a + da) * rad).toFixed(1)} ${(cy + Math.sin(a + da) * rad).toFixed(1)}`;
        d += `${i ? "L" : "M"}${p(-0.3, r * 0.74)} L${p(-0.17, r)} L${p(0.17, r)} L${p(0.3, r * 0.74)} `;
      }
      const q = g(parent);
      outline(d + "Z", C.paper, { sw: 5.5 }, q);
      add("circle", { cx, cy, r: r * 0.3, fill: C.ink }, q);
      return q;
    };
    // a Lucide icon (assets/kit/icons.js) in the look's stroke: size is its width, o.sw the stroke in the frame
    const icon = (name, x, y, size, o, parent) => {
      const shapes = global.ICONS && global.ICONS[name];
      if (!shapes) throw new Error("no such icon: " + name);
      o = o || {};
      const k = size / 24, q = at(x, y, k, parent);
      const st = { fill: o.fill || "none", stroke: o.color || C.ink, "stroke-width": +((o.sw || Math.max(4, size * 0.073)) / k).toFixed(3), "stroke-linecap": "round", "stroke-linejoin": "round" };
      const pts = (s) => s.trim().split(/[\s,]+/).join(" ");
      for (const e of shapes) {
        const a = { p: () => ["path", { d: e[1] }], r: () => ["rect", { x: e[1], y: e[2], width: e[3], height: e[4], rx: 2 }], c: () => ["circle", { cx: e[1], cy: e[2], r: e[3] }],
          e: () => ["ellipse", { cx: e[1], cy: e[2], rx: e[3], ry: e[4] }], l: () => ["line", { x1: e[1], y1: e[2], x2: e[3], y2: e[4] }],
          pl: () => ["polyline", { points: pts(e[1]) }], pg: () => ["polygon", { points: pts(e[1]) }] }[e[0]];
        if (!a) throw new Error("unknown shape: " + e[0]);
        const [tag, attrs] = a();
        add(tag, Object.assign(attrs, st), q);
      }
      return q;
    };

    // ---- a part's steps: rows of code, the current one highlighted, done ones checked, brackets for what a run holds.
    // (x, y) is the left edge and the heading's baseline, w the width; rows are placed by their center y
    function steps(x, y, w, title, o, parent) {
      o = o || {};
      parent = parent || L.cards;
      const heading = tx(x + 32, y, title, { size: 30, w: 800 }, parent);
      const HL = g(parent), labelX = o.labelX || x + 246;
      return {
        heading,
        // a pill next to the heading: "before" or "after", in a group shown by the lesson's windows
        label: (str, fill, color, grp) => { pill(labelX, y - 10, str, fill, color, grp); return grp; },
        row: (str, cy, grp) => tx(x + 54, cy + 10, str, { w: 400, font: MONO }, grp || parent),
        hl: (cy, from, to) => show(solid(rr(x + 32, cy - 21, w - 32, 42, 21), C.lorange, HL), from, to, { in: 0.12, out: 0.12 }),
        done: (cy, from, to, out, color) => show(check(x + w - 48, cy - 2, color || C.violet, parent), from, to, { in: 0.12, out: out || (to == null ? 0.35 : 0.25) }),
        // the row waits: a clock and how long
        waits: (cy, label, from, to) => { const q = g(parent); clock(x + w - 86, cy, 12, C.orange, q); tx(x + w - 64, cy + 10, label, { size: 27, w: 800, fill: C.orange }, q); return show(q, from, to, { in: 0.15, out: 0.15 }); },
        bracket: (y0, y1, color, from, to, out) => showW(draw(outline(`M${x + 20} ${y0} H${x + 8} Q${x} ${y0} ${x} ${y0 + 8} V${y1 - 8} Q${x} ${y1} ${x + 8} ${y1} H${x + 20}`, null, { stroke: color, sw: 7 }, parent), from, 0.35), [[from, to, 0, out]]),
        legend: (str, ly, color, from, to, fi, fo) => showW(tx(x, ly, str, { size: 23, w: 700, fill: color }, parent), [[from, to, fi, fo]]),
      };
    }

    // ---- the caption band under the cards: one caption at a time, then the fix, the benefits, the conclusion
    const lines = (arr, y0, size, pitch, from, to, o) => fit(arr.map((str, k) => showW(tx(64, y0 + pitch * k, str, Object.assign({ size, w: 800 }, o), L.caps), [[from + 0.3 * k, to, 0.25, 0.2]], { keep: true })), 952);
    // a step caption of one to three lines, from its step's start to the next one's
    const say = (arr, from, to) => {
      if (arr.length > 3) throw new Error("a caption is one to three lines");
      return arr.length === 3 ? lines(arr, 1108, 44, 54, from, to) : lines(arr, 1120, 46, 56, from, to);
    };
    // the fix: a violet heading, then the steps after line by line; items are [text, second]
    const fix = (title, from, items, to) => {
      const win = (s) => [[s, to, 0.25, 0.2]];
      const nodes = [showW(tx(64, 1104, title, { size: 40, w: 900, fill: C.violet }, L.caps), win(from), { keep: true })];
      items.forEach(([str, s], k) => nodes.push(showW(tx(64, 1156 + 48 * k, str, { size: 38, w: 800 }, L.caps), win(s), { keep: true })));
      return fit(nodes, 952);
    };
    // what the technique gives: a quiet heading, then a checked line per benefit; items are [text, second]
    const benefits = (title, from, items, to) => {
      const win = (s) => [[s, to, 0.3, 0.25]];
      const nodes = [showW(tx(64, 1104, title, { size: 34, w: 800, fill: C.note }, L.caps), win(from), { keep: true })];
      items.forEach(([str, s], k) => {
        const y = 1156 + 48 * k;
        showW(check(66, y - 14, C.teal, L.caps, 1.1), win(s));
        nodes.push(showW(tx(114, y, str, { size: 38, w: 800 }, L.caps), win(s), { keep: true }));
      });
      return fit(nodes, 900);
    };
    // the conclusion takes the band at at and stays until the fade; without at it stands from frame 0 (the key frame)
    const conclusion = (text, from) => {
      const ls = plain(text);
      if (ls.length > 2) throw new Error("conclusion: at most two lines");
      const ys = ls.length > 1 ? [1152, 1234] : [1190];
      const nodes = ls.map((str, k) => {
        const n = tx(62, ys[k], str, { size: 76, w: 900, ls: -1.5 }, L.caps || svg);
        return from == null ? n : showW(n, [[from + 0.25 + 0.3 * k, fade, 0.3, 0.35]], { keep: true });
      });
      nodes.forEach((n) => n.setAttribute("data-role", "conclusion"));
      fit(nodes, W - 124);
      if (from != null) report().conclusion = { text: ls.join(" "), at: from, node: nodes[0] };
      return nodes;
    };

    return {
      C, W, H, SANS, MONO, fade, BACK, acts, add, g, at, rr, tx, outline, solid, prog, eio, show, showW, pop, enter, draw, fit, render,
      chrome, series, layers: L, card, link, head, stop, packet, tap, chipW, chip, badge, tag, pill, ring,
      check, clock, stopwatch, phone, bank, db, server, gear, icon, steps, say, fix, benefits, conclusion,
    };
  }

  global.Cards = { C, W, H, SANS, MONO, CPS, pace, step, timing, stage };
})(window);
