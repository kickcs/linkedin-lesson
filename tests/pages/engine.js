// Sketch engine checks; done() is the last line of the file
const S = window.Sketch;
const num = (v) => parseFloat(v);
function fresh(build) {
  const svg = S.el("svg", { viewBox: "0 0 360 450", width: 360, height: 450 }, document.body);
  const s = S.stage(svg, { fade: 10 });
  if (build) build(s);
  return s;
}
function sample(s) {
  S.drawIn(s, s.rc.rectangle(20, 20, 100, 60, S.o(s, {})), 0.5, 1);
  S.drawIn(s, s.rc.rectangle(40, 100, 80, 40, S.o(s, { fill: S.C.yellow, fillStyle: "solid" })), 1, 1);
  S.text(s, 20, 200, [["hello ", S.C.ink], ["world", S.C.blue]], { size: 16 }, 2, 1);
  S.text(s, 20, 30, [["Title", S.C.ink]], { size: 24, w: 700 }, null, 0, s.chrome);
  S.vis(s, S.el("circle", { cx: 50, cy: 300, r: 5 }, s.root), 3, 4);
}
const html = (s) => s.svg.innerHTML;

// --- core
check("render(t) does not depend on seek order", () => {
  const s = fresh(sample);
  S.render(s, 5);
  const a = html(s);
  for (const t of [0, 11, 2.5, 7, 0.3]) S.render(s, t);
  S.render(s, 5);
  eq(html(s), a);
});
check("two identical builds give the same frame", () => {
  const a = fresh(sample), b = fresh(sample);
  S.render(a, 3.3); S.render(b, 3.3);
  eq(html(a), html(b));
});
check("erasing fades the lesson layer, never the chrome", () => {
  const s = fresh(sample);
  S.render(s, 10.2);
  ok(num(s.root.style.opacity) > 0 && num(s.root.style.opacity) < 1, "lesson fades");
  S.render(s, 11);
  eq(num(s.root.style.opacity), 0);
  eq(s.chrome.style.opacity, "");
  S.render(s, 0);
  eq(num(s.root.style.opacity), 1);
});
check("a still frame repaints in full: an invisible rect changes on every frame at 12–30 fps", () => {
  const s = fresh(sample);
  const r = s.svg.querySelector('[data-role="repaint"]');
  ok(r, "the repaint rect is there");
  eq(r.getAttribute("fill-opacity"), "0");
  for (const fps of [12, 13, 14, 15, 16, 17, 20, 24, 25, 30]) for (const t of [0, 3.3, 41.7, 99.9]) {
    S.render(s, t); const a = r.getAttribute("fill");
    S.render(s, t + 1 / fps); ok(r.getAttribute("fill") !== a, `same fill at ${t} s and the next frame at ${fps} fps`);
  }
});
check("text types out letter by letter, without at it stands whole", () => {
  const s = fresh();
  const t = S.text(s, 0, 20, [["abcd", S.C.ink], ["ef", S.C.red]], {}, 1, 1);
  const st = S.text(s, 0, 40, [["static", S.C.ink]], {}, null, 0, s.chrome);
  S.render(s, 0); eq(t.textContent, ""); eq(st.textContent, "static");
  S.render(s, 1.5); eq(t.textContent, "abc");
  S.render(s, 2); eq(t.textContent, "abcdef");
});
check("a stroke is hidden before its start and fully visible after", () => {
  const s = fresh();
  const g = S.drawIn(s, s.rc.line(0, 0, 100, 0, S.o(s, {})), 1, 1);
  const paths = [...g.querySelectorAll("path")];
  S.render(s, 0);
  ok(paths.every((p) => p.style.visibility === "hidden"), "hidden at zero");
  S.render(s, 2.5);
  ok(paths.every((p) => p.style.visibility === "visible" && num(p.style.strokeDashoffset) < 0.01), "fully visible");
});
check("fill appears from the first third of the time", () => {
  const s = fresh();
  const g = S.drawIn(s, s.rc.rectangle(0, 0, 50, 50, S.o(s, { fill: S.C.yellow, fillStyle: "solid" })), 1, 1);
  const fill = [...g.querySelectorAll("path")].find((p) => p.getAttribute("fill") !== "none");
  S.render(s, 1.2); eq(num(fill.style.opacity), 0);
  S.render(s, 1.5); eq(num(fill.style.opacity), 1);
});
check("vis: a node is visible only inside its window", () => {
  const s = fresh();
  const n = S.el("circle", { cx: 1, cy: 1, r: 1 }, s.root);
  S.vis(s, n, 1, 2);
  S.render(s, 0.5); eq(n.style.display, "none");
  S.render(s, 1.5); eq(n.style.display, "");
  S.render(s, 2); eq(n.style.display, "none");
});

// --- motion
check("pairs: points separated by space and by comma", () => eq(JSON.stringify(S.pairs("4 17 10,11 4 5")), "[[4,17],[10,11],[4,5]]"));
check("icons: each one is drawn in strokes", () => {
  const s = fresh();
  for (const n of Object.keys(ICONS)) ok(S.icon(s, n, 0, 0, 24).querySelectorAll("path").length > 0, n);
});
check("icon: an unknown name throws", () => {
  const s = fresh();
  let threw = false;
  try { S.icon(s, "no-such-icon", 0, 0, 24); } catch (e) { threw = true; }
  ok(threw, "expected an error");
});
check("arrow: a line and two barbs", () => {
  const s = fresh();
  eq(S.arrow(s, [[0, 0], [100, 0]], {}).childNodes.length, 3);
  eq(S.arrow(s, [[0, 0], [50, 30], [100, 0]], {}).childNodes.length, 3);
});
check("cursor: the first segment is after zero, otherwise an error", () => {
  const s = fresh();
  let threw = false;
  try { S.cursor(s, [S.At(0, 1, 10, 10)], S.C.ink); } catch (e) { threw = true; }
  ok(threw, "expected an error");
});
check("cursor is hidden until its first segment and follows the path", () => {
  const s = fresh();
  const c = S.cursor(s, [S.At(0.5, 1, 10, 10), S.Ln(2, 3, 10, 10, 110, 10)], S.C.ink, "you");
  S.render(s, 0); eq(c.g.style.display, "none");
  S.render(s, 2.5); eq(c.g.style.display, ""); eq(c.g.getAttribute("transform"), "translate(60,10)");
  eq(c.g.getAttribute("class"), "cursor");
});
check("cursor flies smoothly between segments", () => {
  const s = fresh();
  const c = S.cursor(s, [S.At(0.5, 1, 0, 0), S.At(2, 3, 100, 0)], S.C.ink);
  S.render(s, 1.5);
  eq(c.g.getAttribute("transform"), "translate(50,0)");
});
check("cursor label: at the right edge it goes left of the tip, otherwise right", () => {
  const s = fresh();
  const far = S.cursor(s, [S.At(0.5, 1, 340, 100)], S.C.orange, "test-runner");
  const near = S.cursor(s, [S.At(0.5, 1, 100, 200)], S.C.violet, "you");
  S.render(s, 0.75);
  const o = s.svg.getBoundingClientRect();
  const box = (n) => { const r = n.getBoundingClientRect(); return { x0: r.left - o.left, x1: r.right - o.left }; };
  const a = box(far.chip), b = box(near.chip);
  ok(a.x0 >= 0 && a.x1 <= 352, `at the edge: ${a.x0}…${a.x1}`);
  ok(a.x1 <= 340, "at the edge: label left of the tip");
  ok(Math.abs(b.x0 - 110) < 0.5, `not at the edge: label right of the tip, x0=${b.x0}`);
  S.render(s, 0); S.render(s, 0.75);
  eq(JSON.stringify(box(far.chip)), JSON.stringify(a), "seeking does not move the label");
});
check("laser: trail only inside its window", () => {
  const s = fresh();
  const cur = S.cursor(s, [S.Ln(1, 2, 0, 0, 100, 0)], S.C.ink);
  const p = S.laser(s, cur, 1, 2);
  S.render(s, 0.5); eq(p.getAttribute("d"), "");
  S.render(s, 1.5); ok(p.getAttribute("d").startsWith("M"), "trail is there");
  S.render(s, 2.5); eq(p.getAttribute("d"), "");
});
check("ripple: a circle for 0.4 s after the click", () => {
  const s = fresh();
  const c = S.ripple(s, 10, 10, 1);
  S.render(s, 0.9); eq(num(c.getAttribute("r")), 0);
  S.render(s, 1.2); ok(num(c.getAttribute("r")) > 4, "growing");
  S.render(s, 1.5); eq(num(c.getAttribute("r")), 0);
});
check("flight: hidden before start, keep leaves it at the end", () => {
  const s = fresh();
  const a = S.el("g", {}), b = S.el("g", {});
  S.fly(s, a, 1, 1, [0, 0], [50, -50], [100, 0]);
  S.fly(s, b, 1, 1, [0, 0], [50, -50], [100, 0], true);
  S.render(s, 0.5); eq(a.style.display, "none"); eq(b.style.display, "none");
  S.render(s, 3); eq(a.style.display, "none"); eq(b.style.display, ""); eq(b.getAttribute("transform"), "translate(100,0)");
});
check("scale: label from format, hidden before start", () => {
  const s = fresh();
  const m = S.meter(s, 10, 10, 100, 10, [[1, 0], [2, 0.5], [3, 0.9]], (v) => Math.round(v * 100) + "%");
  S.render(s, 0); eq(m.label.style.display, "none"); eq(m.bar.style.display, "none");
  S.render(s, 2); eq(m.label.textContent, "50%"); eq(m.label.style.display, "");
  S.render(s, 3); eq(m.label.textContent, "90%"); eq(m.bar.getAttribute("fill"), S.C.red);
});
check("scale without format has no label", () => {
  const s = fresh();
  eq(S.meter(s, 10, 10, 100, 10, [[1, 0], [2, 0.3]], null).label, null);
});
check("counter grows from a to b", () => {
  const s = fresh();
  const n = S.counter(s, S.el("text", {}, s.root), 1, 1, 0, 50, " KB");
  S.render(s, 1.5); eq(n.textContent, "25 KB");
  S.render(s, 3); eq(n.textContent, "50 KB");
});
check("counter: digits sets decimal places, without it an integer", () => {
  const s = fresh();
  const d = S.counter(s, S.el("text", {}, s.root), 1, 1, 0, 1.5, " s", 1);
  const i = S.counter(s, S.el("text", {}, s.root), 1, 1, 0, 1.5, " s");
  S.render(s, 1.5); eq(d.textContent, "0.8 s"); eq(i.textContent, "1 s");
  S.render(s, 3); eq(d.textContent, "1.5 s"); eq(i.textContent, "2 s");
});

// --- chrome: board
const LAYOUTS = ["actors", "stage"];
check("segs: a word in asterisks is an accent, color only if given", () => {
  eq(JSON.stringify(S.segs("Run in a *subagent*.")), JSON.stringify([["Run in a ", null, false], ["subagent", null, true], [".", null, false]]));
  eq(JSON.stringify(S.segs("*Two* words", S.C.orange)), JSON.stringify([["Two", S.C.orange, true], [" words", null, false]]));
});
check("board of both layouts: field, sheet and title whole at frame 0", () => {
  for (const name of LAYOUTS) {
    const s = fresh();
    const made = S.chrome[name](s, "Hello|*world*");
    S.render(s, 0);
    eq(made.title.map((t) => t.textContent).join(" "), "Hello world", name);
    ok(made.title.every((t) => t.parentNode === s.chrome && t.getAttribute("data-role") === "title"), name + ": in the chrome layer");
    ok(s.chrome.querySelector(`rect[fill="${S.C.field}"]`), name + ": field");
    const sheet = s.chrome.querySelector(`rect[fill="${S.C.paper}"]`);
    eq(num(sheet.getAttribute("height")), name === "stage" ? S.SHEET.stage : S.SHEET.h, name + ": sheet height");
  }
});
check("title: one line centered in the block, two at 62 and 96, three is an error", () => {
  const ys = (v) => S.chrome.actors(fresh(), v).title.map((t) => num(t.getAttribute("y")));
  eq(JSON.stringify(ys("One line")), "[79]");
  eq(JSON.stringify(ys("Two|lines")), "[62,96]");
  eq(JSON.stringify(ys(S.segs("Ready *segs*"))), "[79]");
  let threw = false;
  try { S.chrome.actors(fresh(), "a|b|c"); } catch (e) { threw = true; }
  ok(threw, "expected an error");
});
check("title shrinks to one font size for both lines until the longer one fits 318", () => {
  const s = fresh();
  const [a, b] = S.chrome.actors(s, "A very long first line of the title is here|short").title;
  S.render(s, 0);
  const size = num(a.getAttribute("font-size"));
  ok(size < 35, `font size ${size}`);
  eq(num(b.getAttribute("font-size")), size, "both lines share one font size");
  ok(a.getComputedTextLength() <= 318.5, `width ${a.getComputedTextLength()}`);
  eq(num(S.chrome.actors(fresh(), "Short").title[0].getAttribute("font-size")), 35, "a short one is left alone");
});
check("subtitle: one line under the title, in the chrome layer; without sub there is none", () => {
  const s = fresh();
  const made = S.chrome.stage(s, "Transactional *outbox*", { sub: "How a transfer survives a crash" });
  S.render(s, 0);
  eq(num(made.title[0].getAttribute("y")), 70, "title raised");
  eq(num(made.sub.getAttribute("y")), 97);
  eq(made.sub.textContent, "How a transfer survives a crash");
  ok(made.sub.parentNode === s.chrome && made.sub.getAttribute("data-role") === "subtitle", "in the chrome layer");
  eq(num(made.sub.getAttribute("font-size")), 15, "a short one is not shrunk");
  eq(S.chrome.actors(fresh(), "Plain").sub, undefined, "without sub");
});
check("subtitle with a two-line title is an error", () => {
  let threw = false;
  try { S.chrome.actors(fresh(), "Two|lines", { sub: "Why?" }); } catch (e) { threw = true; }
  ok(threw, "expected an error");
});
check("a long subtitle shrinks on its own font size and leaves the title alone", () => {
  const s = fresh();
  const made = S.chrome.actors(s, "Short", { sub: "A very long subtitle question that cannot fit in one line of the frame" });
  S.render(s, 0);
  ok(num(made.sub.getAttribute("font-size")) < 15, "font size shrunk");
  ok(made.sub.getComputedTextLength() <= 318.5, `width ${made.sub.getComputedTextLength()}`);
  eq(num(made.title[0].getAttribute("font-size")), 35, "title unchanged");
});
check("frame: box and side name in the chrome layer, a long name shrinks to fit the box", () => {
  const s = fresh();
  S.chrome.actors(s, "Backend dev vs *AI engineer*");
  const a = S.frame(s, 18, 72, 324, 86, "Backend engineer");
  const b = S.frame(s, 18, 168, 150, 120, "A very long side name for a narrow frame", S.C.blue);
  S.render(s, 0);
  ok(a.box.parentNode === s.chrome && a.name.parentNode === s.chrome, "in the chrome layer");
  eq(num(a.name.getAttribute("y")), 90, "name inside at the top");
  eq(num(a.name.getAttribute("font-size")), 15, "a short one is not shrunk");
  ok(b.name.getComputedTextLength() <= 130.5, `width ${b.name.getComputedTextLength()}`);
});
check("fit: one factor from the longest line, measures the full text of a partly typed one", () => {
  const s = fresh();
  const a = S.text(s, 0, 20, [["a long line of text here", S.C.ink]], { size: 20 }, 1, 1), b = S.text(s, 0, 40, [["short", S.C.ink]], { size: 10 });
  S.fit(s, [a, b], 60);
  S.render(s, 0);
  const k = num(a.getAttribute("font-size")) / 20;
  ok(k < 1, `factor ${k}`);
  ok(Math.abs(num(b.getAttribute("font-size")) / 10 - k) < 0.01, "same factor");
  S.render(s, 3);
  ok(a.getComputedTextLength() <= 60.5, `width ${a.getComputedTextLength()}`);
  const wide = S.fit(s, S.text(s, 0, 60, [["short", S.C.ink]], { size: 10 }), 300);
  S.render(s, 0);
  eq(num(wide.getAttribute("font-size")), 10, "it fits: font size unchanged");
});
check("conclusion types out in the lesson layer, without at it stands whole", () => {
  const s = fresh();
  const a = S.conclusion(s, "Only the *note*.", 1, 1), b = S.conclusion(s, "Static.");
  S.render(s, 0); eq(a.textContent, ""); eq(b.textContent, "Static.");
  S.render(s, 2); eq(a.textContent, "Only the note.");
  ok(a.parentNode === s.root && a.getAttribute("data-role") === "conclusion", "in the lesson layer");
});
check("chalk underline under the accent: on the title from frame 0, on the conclusion after typing", () => {
  const s = fresh();
  const title = S.chrome.actors(s, "Hello|*world*").title;
  const end = S.conclusion(s, "Only the *note*.", 1, 1);
  const under = (node) => node.previousSibling;
  S.render(s, 0);
  eq(under(title[1]).style.display, "", "title underlined at frame 0");
  ok(under(title[1]).getAttribute("transform").startsWith("translate("), "the underline sits under the accent");
  eq(under(end).style.display, "none", "conclusion not typed yet");
  S.render(s, 1.5); eq(under(end).style.display, "none", "conclusion is typing");
  S.render(s, 2.5); eq(under(end).style.display, "", "conclusion underlined");
});
check("chalk underline lies under the accent: from its start to its end and below the line", () => {
  const s = fresh();
  const end = S.conclusion(s, "Only the *note* crosses.");
  S.render(s, 0);
  const acc = end.querySelector("tspan[data-accent]"), line = end.previousSibling.getBoundingClientRect(), box = acc.getBoundingClientRect(), k = s.svg.getBoundingClientRect().width / 360;
  ok(Math.abs(line.left - box.left) < 4 * k && Math.abs(line.right - box.right) < 5 * k, `underline ${line.left.toFixed(1)}…${line.right.toFixed(1)}, accent ${box.left.toFixed(1)}…${box.right.toFixed(1)}`);
  const base = s.svg.getBoundingClientRect().top + 412 * k;
  ok(line.top > base - 2 * k && line.bottom < base + 12 * k, `underline height ${((line.top - base) / k).toFixed(1)}…${((line.bottom - base) / k).toFixed(1)} from the baseline`);
});
check("conclusion without dur stands whole at at, and the underline arrives with it", () => {
  const s = fresh();
  const end = S.conclusion(s, "Only the *note*.", 1);
  S.render(s, 0.5); eq(end.textContent, ""); eq(end.previousSibling.style.display, "none");
  S.render(s, 1.5); eq(end.textContent, "Only the note."); eq(end.previousSibling.style.display, "");
});
check("an unpaired asterisk is an error, not an accent to the end of the line", () => {
  let threw = false;
  try { S.segs("Run *tests"); } catch (e) { threw = true; }
  ok(threw, "segs");
  threw = false;
  try { S.chrome.actors(fresh(), "Run *tests|in a* subagent"); } catch (e) { threw = true; }
  ok(threw, "accent across a line break");
});
check("the font finished loading: the current frame is shown again", () => {
  const s = fresh();
  const a = S.text(s, 0, 20, [["hello", S.C.ink]], {}, 1, 1);
  S.render(s, 3);
  a.firstChild.textContent = "";
  document.fonts.dispatchEvent(new Event("loadingdone"));
  eq(a.textContent, "hello");
});

check("centered text types out without shifting: the tail is transparent, the line width is constant", () => {
  const s = fresh();
  const t = S.text(s, 180, 20, [["list ", S.C.ink], ["tools", S.C.blue]], { anchor: "middle" }, 1, 1);
  S.render(s, 2.5);
  const full = t.getComputedTextLength();
  S.render(s, 1.4);
  eq(t.getComputedTextLength(), full);
  const shown = [...t.querySelectorAll("tspan")].filter((x) => x.getAttribute("fill-opacity") !== "0").map((x) => x.textContent).join("");
  eq(shown, "list");
  S.render(s, 2.5); eq(t.textContent, "list tools");
});
check("series: \"Day 7 of 30\" and a tick strip in the chrome layer, without the option there is none", () => {
  for (const name of LAYOUTS) {
    const s = fresh();
    const made = S.chrome[name](s, "Hello", { series: "7/30" });
    S.render(s, 0);
    ok(made.series && made.series.parentNode === s.chrome, name + ": in the chrome layer");
    eq(made.series.textContent, "Day 7 of 30", name);
    const ticks = [...s.chrome.querySelectorAll('rect[height="8"]')];
    eq(ticks.length, 30, name + ": ticks");
    eq(ticks.filter((r) => r.getAttribute("fill") === S.C.white).length, 7, name + ": filled");
    ok(ticks.every((r) => num(r.getAttribute("x")) >= 100 && num(r.getAttribute("x")) <= 338), name + ": strip right of the label");
    ok(num(made.series.getAttribute("y")) < num(made.title[0].getAttribute("y")) - 15, name + ": above the title");
    eq(S.chrome[name](fresh(), "x").series, undefined, name + ": without the option");
  }
});
check("series: a long strip stays inside the field, anything but \"day/total\" is an error", () => {
  const s = fresh();
  S.chrome.actors(s, "x", { series: "12/100" });
  const xs = [...s.chrome.querySelectorAll('rect[height="8"]')].map((r) => num(r.getAttribute("x")));
  eq(xs.length, 100);
  ok(Math.min(...xs) >= 100 && Math.max(...xs) <= 338, `strip ${Math.min(...xs)}…${Math.max(...xs)}`);
  let threw = false;
  try { S.chrome.actors(fresh(), "x", { series: "Day 1 of 30" }); } catch (e) { threw = true; }
  ok(threw, "expected an error");
});
check("author signature: handwritten, in the chrome layer, without the option there is none", () => {
  const s = fresh();
  const made = S.chrome.stage(s, "x", { sign: "Ann Author" });
  S.render(s, 0);
  eq(made.sign.textContent, "Ann Author");
  eq(made.sign.getAttribute("font-family"), S.HAND);
  ok(made.sign.parentNode === s.chrome, "in the chrome layer");
  eq(S.chrome.stage(fresh(), "x").sign, undefined);
});

// --- scene
const K = window.Scene;
check("scoreboard: total empty cells and n filled ones, hidden until at", () => {
  const s = fresh();
  const g = K.cells(s, 0, 0, 3, 10, 1);
  eq(g.querySelectorAll('rect[fill="none"]').length, 10);
  eq(g.querySelectorAll(`rect[fill="${S.C.fred}"]`).length, 3);
  S.render(s, 0.5); eq(g.style.display, "none");
  S.render(s, 2); eq(g.style.display, "");
});
check("section label is in normal case, the author mark is handwritten", () => {
  const s = fresh();
  const k = K.kick(s, 0, 10, "Store policy", null), h = K.h(s, 0, 30, "a note", 12, null);
  S.render(s, 0);
  eq(k.textContent, "Store policy");
  ok(!k.getAttribute("letter-spacing") && getComputedStyle(k).textTransform === "none", "no caps, no letter-spacing");
  eq(h.getAttribute("font-family"), S.HAND);
});
check("lines without at puts all lines whole at frame 0", () => {
  const s = fresh();
  const ls = K.lines(s, 0, 20, ["first line", "second line"], 12, null);
  S.render(s, 0);
  eq(ls.map((n) => n.textContent).join("|"), "first line|second line");
});
check("fit measuring twins are invisible and carry no line role", () => {
  const s = fresh();
  S.chrome.actors(s, "Hello|*world*");
  eq(s.svg.querySelectorAll('[data-role="title"]').length, 2);
  eq(s.probes.getAttribute("visibility"), "hidden");
});

done();
