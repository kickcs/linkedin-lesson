// Cards engine checks; done() is the last call
(async () => {
  const K = window.Cards;
  await Promise.all([`900 98px ${K.SANS}`, `800 40px ${K.SANS}`, `500 28px ${K.SANS}`, '400 27px "JetBrains Mono"'].map((f) => document.fonts.load(f)));
  check("fonts loaded", () => ok(document.fonts.check(`800 40px ${K.SANS}`) && document.fonts.check(`900 98px ${K.SANS}`)));
  const NS = "http://www.w3.org/2000/svg";
  function fresh(build, o) {
    o = o || {};
    const svg = document.createElementNS(NS, "svg");
    for (const [k, v] of Object.entries({ viewBox: "0 0 1080 1350", width: 1080, height: 1350 })) svg.setAttribute(k, v);
    document.body.appendChild(svg);
    const s = K.stage(svg, { fade: 10 });
    const made = s.chrome(o.title || "Cache aside", o.chrome || { sub: "Where a read goes first", series: "7/30", sign: "Ann Author" });
    const out = build ? build(s) : null;
    return { s, svg, made, out };
  }
  // a part from frame 0, a link, a caption, chips, a dot, a ring, a tap, a steps panel and the conclusion
  function sample(s) {
    const C = s.C;
    s.card(40, 470, 1000, 336, 50);
    s.tx(142, 528, "Profile service", { size: 36, w: 800 }, s.layers.cards);
    s.link(250, 806, 250, 862, C.violet);
    s.say(["The service asks the cache first.", "It has no copy: a miss."], 1, 3);
    s.chip(300, 376, "GET /profile", { color: C.violet }, 1.5, 4);
    s.chip(300, 862, "1 row", { reply: true }, 4.2);
    s.packet(116, 420, 116, 450, C.violet, 2, 0.5);
    s.ring(586, 920, 245, 54, C.violet, 2.5, 5);
    s.tap(116, 329, C.violet, 1);
    const p = s.steps(80, 576, 404, "Service steps");
    p.row("GET cache", 616);
    p.hl(616, 2, 3);
    p.done(616, 3);
    return s.conclusion("Read the cache first.", 6);
  }
  const html = (svg) => svg.innerHTML.replace(/ style=""/g, "");
  // drawn shapes and text that a viewer sees: no hidden ancestor and no zero opacity
  const seen = (svg) => [...svg.querySelectorAll("path, text, rect, circle, line, ellipse, polyline, polygon")].map((e, i) => {
    let a = 1;
    for (let n = e; n && n !== svg; n = n.parentNode) {
      if (n.style.display === "none") return null;
      if (n.style.opacity !== "") a *= +n.style.opacity;
    }
    return a > 0 ? i : null;
  }).filter((i) => i !== null).join(",");

  check("render(t) does not depend on seek order", () => {
    const { s, svg } = fresh(sample);
    s.render(5);
    const a = html(svg);
    for (const t of [0, 11, 2.5, 7, 0.3]) s.render(t);
    s.render(5);
    eq(html(svg), a);
  });
  check("two identical builds give the same frame", () => {
    const a = fresh(sample), b = fresh(sample);
    a.s.render(3.3); b.s.render(3.3);
    eq(html(a.svg), html(b.svg));
  });
  check("what the lesson adds is gone 0.35 s after the fade, what stands from frame 0 stays", () => {
    const { s, svg } = fresh(sample);
    s.render(0);
    const zero = seen(svg);
    s.render(4.5);
    ok(seen(svg) !== zero, "nothing changed in the lesson");
    s.render(10.36);
    eq(seen(svg), zero);
  });
  check("a part hidden in the lesson comes back with BACK", () => {
    const { s, out: el } = fresh((s) => s.showW(s.tx(64, 600, "before", {}, s.layers.cards), [[-1, 2, 0, 0.3], s.BACK]));
    const vis = (t) => { s.render(t); return el.style.display !== "none"; };
    ok(vis(0), "visible at frame 0");
    ok(!vis(5), "hidden in the lesson");
    ok(vis(10.36) && el.style.opacity === "", "back at full opacity after the fade");
  });
  check("chrome: one title line at 98 over the subtitle, two lines at 84 without one", () => {
    const one = fresh(null).made;
    eq(one.title.length, 1);
    eq([+one.title[0].getAttribute("font-size"), +one.title[0].getAttribute("y"), +one.sub.getAttribute("y")].join(), "98,150,208");
    const two = fresh(null, { title: "Short|transactions", chrome: {} }).made;
    eq(two.title.map((n) => `${n.getAttribute("font-size")}@${n.getAttribute("y")}`).join(), "84@126,84@212");
  });
  check("a title with a subtitle is one line; three title lines throw", () => {
    let e1 = null, e2 = null;
    try { fresh(null, { title: "a|b", chrome: { sub: "x" } }); } catch (e) { e1 = e.message; }
    try { fresh(null, { title: "a|b|c", chrome: {} }); } catch (e) { e2 = e.message; }
    ok(/one line/.test(e1 || ""), `got ${e1}`);
    ok(/two lines/.test(e2 || ""), `got ${e2}`);
  });
  check("asterisks are dropped: this look has no accent", () => eq(fresh(null, { title: "Short *transactions*" }).made.title[0].textContent, "Short transactions"));
  check("a long title shrinks to 956 wide once the fonts are in", () => {
    const { s, made } = fresh(null, { title: "Why every short transaction keeps the pool free" });
    s.render(0);
    const n = made.title[0];
    ok(+n.getAttribute("font-size") < 98, `font size ${n.getAttribute("font-size")}`);
    ok(n.getComputedTextLength() <= 956.5, `width ${n.getComputedTextLength()}`);
  });
  check("series: the day in words and a tick per day, the first ones filled", () => {
    const { svg, made } = fresh(null);
    eq(made.series.textContent, "Day 7 of 30");
    const ticks = [...svg.querySelectorAll('rect[y="32"]')];
    eq(ticks.length, 30);
    eq(ticks.filter((r) => r.getAttribute("fill") === K.C.ink).length, 7);
  });
  check("a chip is as wide as chipW says, centered on its point", () => {
    const { svg } = fresh((s) => s.chip(400, 500, "SELECT user 42", { color: s.C.violet }, 1));
    const box = svg.querySelector("g g path").getBBox();
    const w = K.stage(document.createElementNS(NS, "svg")).chipW("SELECT user 42");
    ok(Math.abs(box.width - w) < 0.5 && Math.abs(box.x + box.width / 2 - 400) < 0.5, `box ${box.x} ${box.width}, chipW ${w}`);
  });
  check("an icon is drawn from icons.js in clean strokes; an unknown name throws", () => {
    const { svg } = fresh((s) => s.icon("database", 100, 100, 48));
    const shapes = svg.querySelectorAll('g[transform^="translate(100 100)"] > *');
    ok(shapes.length >= 3, `shapes ${shapes.length}`);
    ok([...shapes].every((e) => e.getAttribute("stroke-linecap") === "round" && e.getAttribute("fill") === "none"));
    let err = null;
    try { fresh((s) => s.icon("no-such-icon", 0, 0, 24)); } catch (e) { err = e.message; }
    ok(/no such icon/.test(err || ""), `got ${err}`);
  });
  check("a caption is one to three lines; the conclusion one or two", () => {
    const three = fresh((s) => s.say(["a", "b", "c"], 1, 2)).out;
    eq(three.map((n) => n.getAttribute("font-size")).join(), "44,44,44");
    const errs = [];
    for (const f of [(s) => s.say(["a", "b", "c", "d"], 1, 2), (s) => s.conclusion("a|b|c", 1)]) {
      try { fresh(f); errs.push(null); } catch (e) { errs.push(e.message); }
    }
    ok(errs.every(Boolean), `did not throw: ${errs}`);
    eq(fresh((s) => s.conclusion("Wait outside|the transaction.", 1)).out.map((n) => n.getAttribute("y")).join(), "1152,1234");
  });
  check("the conclusion reports its text, second and node to LessonPace; the key frame does not", () => {
    window.LessonPace = { calls: [], conclusion: null };
    fresh((s) => s.conclusion("Read the cache first."));
    eq(window.LessonPace.conclusion, null);
    const { out } = fresh((s) => s.conclusion("Wait *outside*|the transaction.", 6));
    const c = window.LessonPace.conclusion;
    eq(`${c.text}@${c.at}`, "Wait outside the transaction.@6");
    ok(c.node === out[0], "node is the first line");
  });
  check("the conclusion stays until the fade and is gone 0.35 s after it", () => {
    const { s, out } = fresh(sample);
    s.render(9.99);
    ok(out[0].style.display === "" && out[0].style.opacity === "", "full at the fade");
    s.render(10.36);
    // the band keeps its lines laid out (keep), so a gone line has opacity 0
    eq(+out[0].style.opacity, 0);
  });
  check("pace: the next step comes max(lead + characters / 16.5, motion + 0.5) later; DUR = FADE + 0.7", () => {
    window.LessonPace = { calls: [], conclusion: null };
    const r = K.pace([K.step(["a".repeat(33)], 0.5, 0.1), K.step(["b"], 2, 0)], 0.2, 16.5);
    eq(r.map((x) => `${x.at.toFixed(2)}-${x.end.toFixed(2)}/${x.chars}`).join(), "0.20-2.30/33,2.30-4.80/1");
    ok(window.LessonPace.calls[0] === r, "the steps are reported");
    // "Wait outside the transaction." is 29 characters: FADE 4.8 + 29 / 16.5 + 1
    const tm = K.timing(4.8, "Wait *outside*|the transaction.");
    eq(`${tm.END} ${tm.FADE} ${tm.DUR}`, "4.8 7.56 8.26");
  });
  done();
})();
