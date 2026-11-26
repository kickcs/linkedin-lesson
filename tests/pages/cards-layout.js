// Mounts a cards lesson as HyperFrames does (?src=/layouts/system.html or /examples/pool/lesson.html) and checks it
(async () => {
  const q = new URLSearchParams(location.search), src = q.get("src");
  const html = await (await fetch(src)).text();
  const tpl = new DOMParser().parseFromString(html, "text/html").querySelector("template");
  const host = document.getElementById("host");
  for (const node of [...tpl.content.childNodes]) {
    if (node.nodeName === "SCRIPT") {
      const sc = document.createElement("script");
      sc.textContent = node.textContent;
      host.appendChild(sc);
    } else host.appendChild(document.importNode(node, true));
  }
  await Promise.all(['900 98px "Overpass"', '800 40px "Overpass"', '500 28px "Overpass"', '400 27px "JetBrains Mono"'].map((f) => document.fonts.load(f)));
  const tl = window.__timelines.lesson, dur = tl.duration();
  // suppressEvents=false: otherwise GSAP does not call onUpdate on seek
  const seek = (t) => tl.seek(t, false);
  if (q.has("t")) { seek(q.get("t") === "end" ? dur : +q.get("t")); done({ dur }); return; }

  const svg = host.querySelector("svg.lesson");
  const opacity = (e) => {
    let a = 1;
    for (let n = e; n && n !== svg; n = n.parentNode) {
      const cs = getComputedStyle(n);
      if (cs.display === "none" || cs.visibility === "hidden") return 0;
      a *= +cs.opacity;
    }
    return a;
  };
  // boxes in frame pixels and the size as drawn: a drawing such as the phone scales the text in it
  const texts = () => {
    const b = svg.getBoundingClientRect(), k = 1080 / b.width;
    // a chip that is popping in (scale 0 → 1.1 → 1) is measured once it stands
    const popping = (e) => e.closest('[transform*=") translate("]');
    return [...svg.querySelectorAll("text")].filter((e) => e.textContent.trim() && opacity(e) > 0 && !popping(e)).map((e) => {
      const r = e.getBoundingClientRect();
      return { s: e.textContent, size: +e.getAttribute("font-size") * e.getCTM().a, x0: (r.left - b.left) * k, y0: (r.top - b.top) * k, x1: (r.right - b.left) * k, y1: (r.bottom - b.top) * k };
    });
  };
  const bad = [];
  for (let i = 0; i * 0.25 <= dur + 1e-9; i++) {
    const t = i * 0.25;
    seek(t);
    for (const r of texts()) {
      if (r.x0 < 30 || r.y0 < 10 || r.x1 > 1050 || r.y1 > 1340) bad.push(`t=${t} past the edge: "${r.s}"`);
      if (r.size < 23) bad.push(`t=${t} smaller than 23: "${r.s}" (${r.size})`);
    }
  }
  check("text stays in the frame and is not smaller than 23", () => ok(bad.length === 0, bad.slice(0, 6).join("; ")));
  check("title stands at frame 0 and is not shrunk below 70", () => {
    seek(0);
    const t = [...svg.querySelectorAll('text[data-role="title"]')];
    ok(t.length && t.every((e) => opacity(e) === 1), "no visible title at frame 0");
    ok(t.every((e) => +e.getAttribute("font-size") >= 70), `title sizes ${t.map((e) => e.getAttribute("font-size"))}`);
  });
  check("seeking forward and back gives the same frames", () => {
    // the order of declarations in style="" follows which one was set first; it does not change the frame
    const norm = () => svg.innerHTML.replace(/ style="([^"]*)"/g, (m, css) => {
      const d = css.split(";").map((x) => x.trim()).filter(Boolean).sort();
      return d.length ? ` style="${d.join("; ")}"` : "";
    });
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
  // motion.pace: the conclusion stays up characters / 16.5 + 1 s from its start (the second the lesson gives it, as
  // bin/pace.mjs counts it; its lines come in just after), then fades by DUR
  check("conclusion stays up characters / 16.5 + 1 s and is gone by the end", () => {
    const lines = [...svg.querySelectorAll('text[data-role="conclusion"]')];
    ok(lines.length, "no conclusion (s.conclusion)");
    ok(lines.every((e) => +e.getAttribute("font-size") >= 60), `conclusion sizes ${lines.map((e) => e.getAttribute("font-size"))}`);
    const chars = lines.map((e) => e.textContent).join(" ").length, STEP = 0.05;
    let start = null, fade = null;
    for (let i = 0; i * STEP <= dur + 1e-9; i++) {
      const t = i * STEP;
      seek(t);
      const a = opacity(lines[0]);
      if (start === null && a > 0) start = t;
      if (start !== null && fade === null && a === 1) fade = -1;
      if (fade === -1 && a < 1) fade = t;
    }
    ok(start !== null && fade > 0, `did not find the start (${start}) or the fade (${fade})`);
    const at = window.LessonPace && window.LessonPace.conclusion && window.LessonPace.conclusion.at;
    ok(at != null && at <= start, `the conclusion is not reported or comes in before its second: at ${at}, seen from ${start}`);
    start = at;
    const need = chars / 16.5 + 1;
    ok(fade - start >= need - 2 * STEP, `conclusion (${chars} characters) from ${start.toFixed(2)} s, fades from ${fade.toFixed(2)} s: ${(fade - start).toFixed(2)} s, needs ${need.toFixed(2)} s`);
    seek(dur);
    eq(opacity(lines[0]), 0);
  });
  check("what the lesson adds is gone by the end: the end shows what frame 0 shows", () => {
    const shown = () => [...svg.querySelectorAll("path, text, rect, circle, line, ellipse, polyline, polygon")].map((e, i) => (opacity(e) > 0 ? i : -1)).filter((i) => i >= 0).join(",");
    seek(0);
    const zero = shown();
    seek(dur);
    eq(shown(), zero);
  });
  done({ dur });
})();
