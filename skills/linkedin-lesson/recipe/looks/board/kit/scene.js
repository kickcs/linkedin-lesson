// Scene and scoreboard on top of Sketch: grotesque for content and quotes, hand for the author's marks, props
// that pop up, fly and leave the stage, and the reading pace. Loads after sketch.js, global Scene.
(function (g) {
  const S = g.Sketch, C = S.C;
  const SANS = S.SANS;
  const K = { SANS, sub: C.sub, rule: C.rule, hollow: C.hollow, lred: C.lred, lgreen: C.lgreen };

  const rr = (x, y, w, h, r) => `M${x + r} ${y} H${x + w - r} Q${x + w} ${y} ${x + w} ${y + r} V${y + h - r} Q${x + w} ${y + h} ${x + w - r} ${y + h} H${x + r} Q${x} ${y + h} ${x} ${y + h - r} V${y + r} Q${x} ${y} ${x + r} ${y} Z`;
  const typeDur = (str) => Math.max(0.15, str.length / 90);

  // Stroke for props on the sheet: lively, a single line
  K.ro = (s, x) => S.o(s, Object.assign({ strokeWidth: 1.3 }, x));
  K.g = (parent, s) => S.el("g", {}, parent || s.root);

  K.box = (s, x, y, w, h, opt, at, dur, parent) => {
    opt = opt || {};
    const node = s.rc.path(rr(x, y, w, h, opt.r == null ? 6 : opt.r), S.o(s, {
      stroke: opt.stroke || C.ink, strokeWidth: opt.sw || 1.3, roughness: opt.rough == null ? 0.75 : opt.rough,
      fill: opt.fill, fillStyle: opt.fill ? "solid" : undefined,
    }));
    return S.drawIn(s, node, at || 0, dur == null ? 0.4 : dur, parent);
  };
  K.line = (s, x1, y1, x2, y2, opt, at, dur, parent) => {
    opt = opt || {};
    return S.drawIn(s, s.rc.line(x1, y1, x2, y2, S.o(s, { stroke: opt.stroke || K.rule, strokeWidth: opt.sw || 1.1, roughness: opt.rough == null ? 0.5 : opt.rough })), at || 0, dur == null ? 0.3 : dur, parent);
  };
  // Fill under text, no outline
  K.mark = (s, x, y, w, h, color, at, parent) =>
    S.drawIn(s, s.rc.rectangle(x, y, w, h, S.o(s, { fill: color, fillStyle: "solid", stroke: "none", roughness: 0.5 })), at, 0.25, parent);

  // Plain text: segs is a string or [[string, color], …]; typed fast, reading time is counted by pace
  K.t = (s, x, y, segs, size, at, opt, parent) => {
    opt = opt || {};
    if (typeof segs === "string") segs = [[segs, opt.c || C.ink]];
    const str = segs.map((q) => q[0]).join("");
    return S.text(s, x, y, segs, { f: opt.f || SANS, size, w: opt.w || 500, anchor: opt.anchor, ls: opt.ls }, at, at == null ? 0 : opt.dur || typeDur(str), parent);
  };
  K.lines = (s, x, y, lines, size, at, opt, parent) => {
    opt = opt || {};
    const lh = opt.lh || size * 1.34;
    let t = at;
    return lines.map((ln, k) => {
      const str = typeof ln === "string" ? ln : ln.map((q) => q[0]).join("");
      const node = K.t(s, x, y + lh * k, ln, size, t, opt, parent);
      if (t != null) t += typeDur(str) + 0.05;
      return node;
    });
  };
  // Author's handwritten mark (Shantell Sans 600)
  K.h = (s, x, y, segs, size, at, opt, parent) => K.t(s, x, y, segs, size, at, Object.assign({ f: S.HAND, w: 600 }, opt), parent);
  // Section label: normal case, no letter-spacing
  K.kick = (s, x, y, str, at, opt, parent) => K.t(s, x, y, str, 10.5, at, Object.assign({ w: 700, c: K.sub }, opt), parent);

  // Underlines segment k of node's line; width is measured when the frame is shown, with the font already loaded
  K.under = (s, node, k, color, at, parent) => {
    const ts = [...node.querySelectorAll("tspan")].filter((e) => !e.hasAttribute("fill-opacity"))[k];
    const y = +node.getAttribute("y") + 3.2;
    const grp = S.el("g", {}, parent || s.root);
    S.drawIn(s, s.rc.line(0, 0, 100, 0, S.o(s, { stroke: color, strokeWidth: 1.6, roughness: 0.5, bowing: 0.4 })), at, 0.3, grp);
    s.acts.push((t) => {
      const n = ts.textContent.length;
      grp.style.display = t >= at && n ? "" : "none";
      if (t < at || !n) return;
      const x0 = ts.getStartPositionOfChar(0).x, x1 = ts.getEndPositionOfChar(n - 1).x;
      grp.setAttribute("transform", `translate(${x0.toFixed(2)} ${y}) scale(${((x1 - x0) / 100).toFixed(4)} 1)`);
    });
    return grp;
  };

  // Reading pace: the next step comes max(lead + characters / cps, motion + 0.5) after the current one starts;
  // lead is the second after the step starts when its first text appears
  K.pace = (steps, start, cps) => {
    let t = start;
    const r = steps.map((st) => {
      const chars = st.text.reduce((a, q) => a + q.length, 0);
      const at = t;
      t += Math.max((st.lead || 0) + chars / cps, (st.motion || 1) + 0.5);
      return Object.assign({}, st, { at, end: t, chars });
    });
    // bin/pace.mjs reads the steps from here
    (g.LessonPace = g.LessonPace || { calls: [], conclusion: null }).calls.push(r);
    return r;
  };

  // Bounce: scale 0 → 1.1 → 1 around (cx, cy); hidden before at
  const back = (u) => 1 + 2.70158 * Math.pow(u - 1, 3) + 1.70158 * Math.pow(u - 1, 2);
  K.pop = (s, grp, cx, cy, at, dur) => {
    dur = dur || 0.2;
    s.acts.push((t) => {
      const u = S.prog(t, at, dur);
      grp.style.display = t >= at ? "" : "none";
      grp.setAttribute("transform", u < 1 ? `translate(${cx} ${cy}) scale(${Math.max(0.01, back(u)).toFixed(3)}) translate(${-cx} ${-cy})` : "");
    });
    return grp;
  };
  // Stamp: drops in large and transparent, settles with rotation rot
  K.stamp = (s, grp, cx, cy, at, rot) => {
    s.acts.push((t) => {
      const u = S.prog(t, at, 0.22), k = 1 + 0.8 * (1 - S.ease(u));
      grp.style.display = t >= at ? "" : "none";
      grp.setAttribute("opacity", u < 1 ? u.toFixed(2) : 1);
      grp.setAttribute("transform", `translate(${cx} ${cy}) rotate(${rot || 0}) scale(${k.toFixed(3)}) translate(${-cx} ${-cy})`);
    });
    return grp;
  };
  // Stamp seal with an all-caps label: frame by letter count, textLength stretches the spacing to the frame without measuring
  K.seal = (s, cx, y, label, color, at, rot, parent) => {
    const grp = K.g(parent, s), tw = label.length * 7.6, w = tw + 14;
    grp.appendChild(s.rc.rectangle(cx - w / 2, y, w, 17.5, K.ro(s, { stroke: color, strokeWidth: 1.8, roughness: 0.6 })));
    const tx = S.text(s, cx, y + 12.5, [[label, color]], { f: SANS, size: 10.5, w: 800, anchor: "middle" }, null, 0, grp);
    tx.setAttribute("textLength", tw);
    tx.setAttribute("lengthAdjust", "spacing");
    return K.stamp(s, grp, cx, y + 8.75, at, rot);
  };
  // Position by keys [[second, x, y], …], smooth between keys; visible from from to to
  K.place = (s, grp, keys, from, to) => {
    s.acts.push((t) => {
      let x = keys[0][1], y = keys[0][2];
      for (let i = 1; i < keys.length; i++) {
        const [t0, x0, y0] = keys[i - 1], [t1, x1, y1] = keys[i];
        if (t >= t1) { x = x1; y = y1; continue; }
        if (t > t0) { const e = S.ease((t - t0) / (t1 - t0)); x = x0 + (x1 - x0) * e; y = y0 + (y1 - y0) * e; }
        break;
      }
      grp.setAttribute("transform", `translate(${x.toFixed(2)} ${y.toFixed(2)})`);
      grp.style.display = t >= (from == null ? -1e9 : from) && t < (to == null ? 1e9 : to) ? "" : "none";
    });
    return grp;
  };
  // Leaving the stage: fades over dur and disappears; stands as is before at
  K.out = (s, grp, at, dur) => {
    dur = dur || 0.25;
    s.acts.push((t) => {
      const u = S.prog(t, at, dur);
      grp.setAttribute("opacity", u > 0 && u < 1 ? (1 - u).toFixed(2) : 1);
      grp.style.display = t >= at + dur ? "none" : "";
    });
    return grp;
  };

  // Scoreboard row of cells on the field: total empty ones stand from at, the first n fill one by one; x is the left edge
  K.cells = (s, x, y, n, total, at, opt, parent) => {
    opt = opt || {};
    const size = opt.size || 8.6, pitch = opt.pitch || 10.6, grp = K.g(parent, s);
    for (let i = 0; i < total; i++) {
      S.el("rect", { x: x + i * pitch, y, width: size, height: size, rx: 1.6, fill: "none", stroke: C.dim, "stroke-width": 1.2 }, grp);
      if (i >= n) continue;
      const on = S.el("rect", { x: x + i * pitch, y, width: size, height: size, rx: 1.6, fill: opt.fill || C.fred }, grp);
      K.pop(s, on, x + i * pitch + size / 2, y + size / 2, at + 0.2 + i * 0.05, 0.18);
    }
    S.vis(s, grp, at, 1e9);
    return grp;
  };

  // Speech bubble: tail on the left in the middle ("left") or bottom left ("bl")
  K.bubblePath = (x, y, w, h, r, tail) => {
    const top = `M${x + r} ${y} H${x + w - r} Q${x + w} ${y} ${x + w} ${y + r} V${y + h - r} Q${x + w} ${y + h} ${x + w - r} ${y + h}`;
    if (tail === "left") {
      const cy = y + h / 2;
      return `${top} H${x + r} Q${x} ${y + h} ${x} ${y + h - r} V${cy + 4} L${x - 7} ${cy} L${x} ${cy - 4} V${y + r} Q${x} ${y} ${x + r} ${y} Z`;
    }
    return `${top} H${x + 9} L${x + 3} ${y + h + 5} L${x + 4} ${y + h} H${x + r} Q${x} ${y + h} ${x} ${y + h - r} V${y + r} Q${x} ${y} ${x + r} ${y} Z`;
  };

  // Mini pictograms ~18×14 centered at (0, 0), drawn into grp; the rest are Lucide icons via Sketch.icon
  const P = (grp, node) => grp.appendChild(node);
  K.pic = {
    box: (s, grp, c) => {
      P(grp, s.rc.rectangle(-7, -2, 14, 9, K.ro(s, { stroke: c })));
      P(grp, s.rc.linearPath([[-7, -2], [-11, -6]], K.ro(s, { stroke: c })));
      P(grp, s.rc.linearPath([[7, -2], [11, -6]], K.ro(s, { stroke: c })));
    },
    headphones: (s, grp, c) => {
      P(grp, s.rc.path("M-7 4 V1 A7 7 0 0 1 7 1 V4", K.ro(s, { stroke: c })));
      P(grp, s.rc.rectangle(-9, 1, 4, 7, K.ro(s, { stroke: c, fill: c, fillStyle: "solid" })));
      P(grp, s.rc.rectangle(5, 1, 4, 7, K.ro(s, { stroke: c, fill: c, fillStyle: "solid" })));
    },
    gift: (s, grp, c) => {
      P(grp, s.rc.rectangle(-7, -3, 14, 10, K.ro(s, { stroke: c })));
      P(grp, s.rc.line(0, -3, 0, 7, K.ro(s, { stroke: c })));
      P(grp, s.rc.line(-7, 1, 7, 1, K.ro(s, { stroke: c })));
      P(grp, s.rc.ellipse(-2.6, -5.4, 5, 3.4, K.ro(s, { stroke: c })));
      P(grp, s.rc.ellipse(2.6, -5.4, 5, 3.4, K.ro(s, { stroke: c })));
    },
    card: (s, grp, c) => {
      P(grp, s.rc.rectangle(-9, -5, 18, 12, K.ro(s, { stroke: c })));
      P(grp, s.rc.line(-9, -1.5, 9, -1.5, K.ro(s, { stroke: c, strokeWidth: 2.2 })));
      P(grp, s.rc.line(-6, 3.5, -1, 3.5, K.ro(s, { stroke: c })));
    },
    shield: (s, grp, c) => { grp.appendChild(S.icon(s, "shield-check", -7.5, -7, 15, c, 0.3)); },
    truck: (s, grp, c) => {
      P(grp, s.rc.rectangle(-10, -5, 12, 9, K.ro(s, { stroke: c })));
      P(grp, s.rc.rectangle(2, -1, 7, 5, K.ro(s, { stroke: c })));
      P(grp, s.rc.circle(-5, 6, 4, K.ro(s, { stroke: c, fill: C.paper, fillStyle: "solid" })));
      P(grp, s.rc.circle(5, 6, 4, K.ro(s, { stroke: c, fill: C.paper, fillStyle: "solid" })));
    },
    calendar: (s, grp, c) => {
      P(grp, s.rc.rectangle(-4.5, -3.5, 9, 8, K.ro(s, { stroke: c, strokeWidth: 1 })));
      P(grp, s.rc.line(-4.5, -0.8, 4.5, -0.8, K.ro(s, { stroke: c, strokeWidth: 1 })));
      P(grp, s.rc.line(-2, -5, -2, -2.5, K.ro(s, { stroke: c, strokeWidth: 1 })));
      P(grp, s.rc.line(2, -5, 2, -2.5, K.ro(s, { stroke: c, strokeWidth: 1 })));
    },
  };

  g.Scene = K;
})(window);
