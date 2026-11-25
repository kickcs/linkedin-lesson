---
version: 1
name: LinkedIn lesson GIF
description: >
  A silent looping educational GIF for LinkedIn. 4–5 events and a conclusion, each held while its
  text is read; the loop is up to 250 frames after gifpack. The frame is a school chalkboard: the
  green field holds what stays and accumulates (series, title, subtitle, board, conclusion, author
  signature), the white sheet on it holds the scene, which draws itself: rough.js strokes appear,
  hand-drawn Lucide icons play roles, objects fly and count. The title stands from frame 0, the
  conclusion is the last event. The stage layout is a cheat sheet that assembles itself: the scaffold
  stays, the step scene changes, the board accumulates, and by the conclusion the whole lesson is on
  screen; actors — participants and the path between them.
unit: the frame — 1080×1350 (4:5, LinkedIn), logical SVG canvas 360×450, scale ×3
principle: frame 0 carries the title and the whole system · up to three key points per GIF · the field holds what is permanent, the sheet holds the scene · the scaffold stays, the step scene changes, the board accumulates · each fact in one place · color carries meaning · numbers only from the card · render(t) is a pure function · a loop without a seam

colors:
  field: "#0e4a40 (chalkboard field: the frame background)"
  paper: "#ffffff (the sheet with the scene)"
  white: "#ffffff (text on the field: series, title, subtitle, board lines, conclusion)"
  chalk: "#ffd43b (chalk line under the accent of the title and conclusion; nowhere else)"
  soft: "#bfd6d0 (quiet text on the field: the heading above the board, the author signature)"
  dim: "#3f7a6e (on the field: empty board cells, unfilled series ticks)"
  onfield: "#ff9d9d / #8ce99a (on the field: a filled cell and a “bad” score, a “good” score; Sketch.C.fred, fgreen. The sheet's red and green do not read on the field)"
  ink: "#1e1e1e (text and outlines on the sheet)"
  sub: "#495057 (on the sheet: section label, panel and actor labels; Scene.sub)"
  gray: "#868e96 / #adb5bd (gray, lgray; on the sheet: logs, an empty reply, prompt sheet lines; not for step explanations: 3.3:1 on white, unreadable in the feed)"
  blue: "#1971c2, fill #a5d8ff (keyword, “you”)"
  violet: "#6965db, fill #e0dfff (agent)"
  red: "#e03131 (on the sheet: price, bad, laser)"
  green: "#2f9e44 (on the sheet: good, check mark)"
  orange: "#e8590c (second participant, when blue is taken)"
  yellow: "#ffec99 (sticker, summary, findings)"
  light: "#ffc9c9 / #b2f2bb (lred, lgreen: fill of a red and a green object, a made-up answer, an honest answer; Scene.lred, Scene.lgreen)"
  rule: "#ced4da / #adb5bd (rule, hollow: lines on the sheet, hollow outlines)"

typography:
  sans: "Bricolage Grotesque, variable 200–800 (SIL OFL), assets/kit/fonts — all content: title, subtitle, conclusion, series, board, step captions and participant labels, question, rule, model answer"
  hand: "Shantell Sans, variable 300–800 (SIL OFL) — only the author's hand: a note in the scene margin (“2 of 6 rules found”), the signature at the bottom of the frame"
  mono: "JetBrains Mono 400 (SIL OFL) — only a method, file or command name and a request or response on a line (`POST #42 $100`, `200 paid`)"
  floor: "text no smaller than 10 logical units (30 px in a 1080 frame)"
  title:      { font: "Bricolage 800", size: 35, tracking: "-0.01em", note: "white on the field, one or two lines (“|” is a line break), up to ~20 characters per line; longer — the font size shrinks by itself (Sketch.fit, width 318), the preview rejects anything below 26" }
  subtitle:   { font: "Bricolage 600", size: 15, y: 97, note: "white on the field under the title: the question or problem the GIF answers, up to ~40 characters; only with a one-line title (which moves to y 70); shrinks by itself, the preview rejects anything below 12" }
  conclusion: { font: "Bricolage 800", size: 21, y: 412, note: "white on the field, one line, up to 8 words and ~30 characters; shrinks by itself, the preview rejects anything below 17" }
  series:     { font: "Bricolage 700", size: 10.5, note: "“Day 7 of 30” top left, a tick strip on the right" }
  sign:       { font: "Shantell Sans 500", size: 10.5, y: 436 }
  label:      { font: "Bricolage 500/700", size: "12.5–17: phase label 16, actor label 12.5, result 14.5–17" }
  chip:       { font: "Bricolage 700", size: 10, note: "cursor name" }
  stage:      { quote: "Bricolage 500 11–11.5", card: "Bricolage 500 10", kicker: "Bricolage 700 10–10.5, normal case", step: "Bricolage 700 11.5", board: "Bricolage 700 12.5 white, score 800 15", note: "Shantell Sans 600 11.5–12" }

strokes:
  rough: "rough.js: roughness 0.75, bowing 0.5, one pass (Sketch.o default); icons 0.45 and two passes; chalk line 1.1, bowing 1.4, two passes"
  seed: "each shape has its own fixed seed; the scene starts at 5 and grows in build order"
  width: "strokeWidth 1.4 by default, 1.3 for scene objects (Scene.ro, Scene.box); icons 1.9 in icon units, ×1.2 at sizes above 30"
  flat: "the field is flat: the sheet, board cells and series ticks are without rough.js; the sketchy stroke is only on the sheet and in the chalk line"

spacing:
  margin: "22 logical units on the field; sheet 12,114 336×274 (stage — 336×172), corner radius 9; text on the sheet is inset 12 from its edge: x 24…336"
  field: "series y 27, tick strip y 19–27 up to x 338; title y 79 (one line) or 62 and 96 (two), x 21; with a subtitle, title y 70, subtitle y 97; conclusion y 412; author signature y 436"
  actors: "phase label y 140, actors on the line y≈227 at size 54, labels y 272, meter y 284, phase result y 344"
  tall: "“why” on the tall sheet: participants y 128–160, labels y 182; boxes y 204–284; step caption y 322 + 19 per line (14); benefits: heading y 310 (12, sub), lines 334 / 356 / 378 in dark (13.5)"
  stage: "on the sheet: participants at 24 on the left (y 122 and 167), content column from x 76; question y 123–150, findings y 167–203, prompt sheet 26–60 × 216–260, step scene x 76…336, y 216–280. On the field: board heading y 306, lines 328 / 351 / 374, cells from x 200, score up to x 338"

components:
  drawIn: "the stroke appears along its length (stroke-dashoffset), the fill from one third of the time"
  text: "letter-by-letter typing, segments in different colors; without at — all at once"
  cursor: "Excalidraw arrow with a name chip; a chip near the right edge moves to the left of the tip by itself; segments At, Ln, El and a smooth flight; the first segment after zero"
  laser: "red trail behind the cursor, 0.35 s"
  ripple: "click circle, 0.4 s"
  fly: "flight along a quadratic curve, keep — stay at the end"
  meter: "the meter is green up to half, red above; caption format(v) with numbers from the card"
  counter: "the number grows from a to b; digits — digits after the point, integer by default"
  board: "the chalkboard (chrome.*): field, sheet, series “Day N of M” with a tick strip, title with a chalk line, subtitle (opt.sub), author signature; stands from frame 0 and never fades"
  fit: "Sketch.fit(s, lines, width) — shrinks the font size by one factor for all lines until the longest one fits; measures in the frame once the font is loaded; no lower limit, the author keeps the 10 threshold"
  chalk: "Sketch.chalk — a yellow line under a line's accent; the title and the conclusion add it by themselves"
  scene: "Scene (kit/scene.js): pop — an object pops out with a bounce; place — moves along keys and is visible inside a window; out — the step scene fades out in 0.25 s; seal — a stamp with text; under — underlines a segment of a line, measures the width in the frame; cells — a row of board cells: total empty, n filled; t / h / kick — grotesque, the author's hand, section label; pace — step pace; pic — mini pictograms, everything else is Lucide icons"

motion:
  rhythm: "first motion before 0.5 s, 4–5 events at reading pace (pace), fade 0.35 s; an event that changes before it is read, the viewer reads as “hard and fast”; one motion at a time, and only where it shows a cause, an order or where to look"
  question: "pause question: the question on the scene next to the object it is about, holds for its characters / 16.5 + 1.5 s, then the answer"
  comfort: "no more than three flashes (outlines, blinks) per second; no camera zooms"
  pace: "the next event starts after max(text appearance + characters / 16.5, end of motion + 0.5) s. Characters — all new text of the event: step, caption, method name. The intro is not held for reading: the first event comes 0.5 s after the participants are drawn; the title stands from frame 0, participant labels are read together with the first step. 16.5 characters per second sits just below the 17 cps Netflix allows for children's subtitles; 12–15 read as slow in a looping GIF. The conclusion holds for its characters / 16.5 + 1 s from the start of typing"
  duration: "skeleton DUR and FADE: actors 12.4 / 11.7, stage 26.68 / 25.98. DUR = FADE + 0.7: the 0.35 s fade and as much again of empty lesson layer before the seam. FADE = conclusion start + its characters / 16.5 + 1 s (pace); the actors demo skeleton rounds it up to 0.1 s, stage computes it from `Scene.pace` without rounding. The actors skeleton is shorter, it has demo events; stage is a whole lesson (why a RAG bot makes things up); a lesson at reading pace usually comes out at 25–50 s (the outbox example is 50 s), there is no limit in seconds"
  loop: "the frame after the fade = frame 0: the chrome never fades, the lesson layer is empty at zero, cursors appear after zero; when the font finishes loading, the engine redraws the current frame, so the font size and the chalk line in frame 0 are the same as at the end"
  seek: "one paused timeline on the clock.t clock; Sketch.render(s, t) is a pure function, seeking backward gives the same frame"
  determinism: "no Math.random, Date.now, performance.now (in kit/rough.js Math.random is replaced by a seeded generator: check 0.9.x fails on it); the rough.js seed follows build order"

render:
  gif: "npx --yes hyperframes@0.9.19 render --format gif --fps 15 --gif-loop 0 --output renders/<slug>.gif"
  pack: "node $R/bin/gifpack.mjs renders/<slug>.gif — right after the render: merges frames that change nothing into the previous one; pixels and duration stay the same"
  budget: "≤ 5 MB (target ≤ 4.5 MB) and ≤ 250 frames after gifpack (LinkedIn Images API: “GIF format supports up to 250 frames”, learn.microsoft.com, read 2026-10-15); otherwise, in order: --fps 12 → 720×900 frame (edits in Wiring) → MP4. Do not cut reading pauses: after gifpack they cost neither frames nor bytes"
  mp4: "last move: the same frame as MP4 (`render --format mp4 --output renders/<slug>.mp4`); warn the user that LinkedIn will show a player, not a loop"
  debug: "check or render failed — debug with the hyperframes-cli skill"
  check: "node $R/bin/gifcheck.mjs renders/<slug>.gif"
---

## Overview

One scene on a school chalkboard, looping. Colors, fonts and stroke roughness are the defaults below;
a brand theme replaces them (`theme.md`), the geometry stays. In the composition, take colors by
name from `C` and `K` (`C.paper`, `K.lred`), not as hex: a hex color ignores the theme. The field holds what stays and accumulates: series,
title, subtitle, board, conclusion and author signature. The white sheet on it is the lesson scene;
it draws itself and changes. The title stands from frame 0: in the LinkedIn feed it is seen before
the GIF starts to move. Then strokes appear by hand, arrows are placed, icons fly and count. The last
event is the conclusion on the field below the sheet. Each event holds while its text reads
comfortably (`motion.pace`), so a lesson usually loops in 25–50 s. No sound. Before the build,
`bin/preview.mjs` takes the key frame (chalkboard, title, subtitle, conclusion): it also checks that
the lines fit without a small font size.

## The Frame

SVG with `viewBox="0 0 360 450"` over the whole 1080×1350 frame; the `<svg>` itself is 100 % of its
container, so the fallback 720×900 frame does not touch the engine. Top to bottom: on the field, the
series (y 27), the title (y 62–96) or the title and subtitle (y 70 and 97), the sheet with the scene
(y 114–388, in stage down to 286, with the board on the field below it), the conclusion (y 412) and
the author signature (y 436). Margins are 22 on the field and 12 from the sheet edge; text on the
sheet stays within x 24…336.

## Layouts

The lesson type chooses the layout: “why” — stage, “how it works” — actors, “how they differ” —
actors with two panels, so that both sides are on screen the whole time. A “why” lesson where the
board gets its first line only in the last third of the GIF goes on the tall sheet (below); otherwise
the field below the stage sheet stays empty for most of the GIF.

- **stage** — a “why” lesson and a multi-step lesson on numbers. Three zones with different
  lifetimes. The scaffold stays: the header with participants and the question, the findings, the
  prompt sheet that stickers only get stuck onto. The step scene changes: its own objects (a shelf
  with a magnifier, ten replies, a quote with a stamp) fade out when the next step starts. The board
  accumulates: one bar line per step, with a score. By the conclusion the whole lesson is on screen;
  the last frame reads as an infographic.
- **actors** — “how it works” and “how they differ”: large icons in roles, a “before” phase and an
  “after” phase, objects fly along arcs, the meter turns red or stays green. A protocol or a message
  exchange is a sequence diagram: two participants at the top, lifelines going down, message arrows
  go top to bottom and stay on the diagram. In “how they differ” each side lives in its own panel
  `Sketch.frame(s, x, y, w, h, "Backend engineer", C.ink)` with its own name color; the lines of one
  axis go in the same order in both panels.
- **“why” on the tall sheet** — the `layouts/stage.html` skeleton with `chrome.actors` instead of
  `chrome.stage`: the scaffold and step scenes on top, the step caption under the diagram; the
  benefits take the captions' place as a dark list, with an outline on the scene before each line.
  The field holds only the title, conclusion and signature (the skill's `examples/outbox`).

## Text

Fonts by role (defaults; a theme may replace them). Sans, Bricolage Grotesque, carries all content:
title, subtitle, conclusion, step caption, board line, the client's question, rule, model answer.
Hand, Shantell Sans, is only the author's hand: a note in the scene margin and the signature at the bottom of the frame. Mono is only for a
method, file or command name and a request or response on a line. Text no smaller than 10.
No caps, no lines joined with “·” and no mono in small labels: a section label is in normal case
(`Scene.kick`).

English, short. The title names the technique, the subtitle the question or problem the GIF answers
(“How a transfer survives a crash”), the conclusion what the technique gives. The title is one or two
lines: `"Why RAG bots|*make things up*"`, “|” is a line break; with a subtitle, one line. The accent
is a word or line in `*asterisks*`: the text stays white, a chalk line lies under it; one accent per
title and one per conclusion. The engine shrinks a line wider than the field by itself (`Sketch.fit`),
both title lines with one font size; the preview rejects a title smaller than 26, a subtitle smaller
than 12 and a conclusion smaller than 17 — then shorten. Every number in the frame is in the lesson
card with a source.

A caption on an arrow or a step is in plain words (“list your tools”), the method or command name is
small mono under it (`tools/list`). An explanation that must be read is in ink, not gray, and is a
complete thought with a quoted example, without shorthand like “X + Y”. Step caption 11.5–14.5,
participant, card and section labels 10–10.5, mono no smaller than 10. Print centered captions with
`anchor: "middle"`: the engine keeps the untyped tail transparent, so the center does not jitter.

Data on the scene of a backend lesson: a database row field is a size-10 line under the row's text,
the key in sub color, the value in the state color (`pending` in orange, `done` and `yes` in green,
`no` in sub color). A request and a response are a chip with mono 10 in ink, 6 per character + 10
wide, that moves along the line via `Scene.place`; the response sits on a `Scene.lgreen` fill with a
green outline, the request on white with an ink outline (the skill's `examples/outbox`).

Subtitle: `chrome.<layout>(s, title, { sub: "How a transfer survives a crash" })`, stands from frame 0.

Series (a numbered series of posts): `chrome.<layout>(s, title, { series: "7/30" })` — “day/total”. “Day 7 of 30”
appears top left, on the right a strip of 30 ticks with the first seven filled. Author signature —
`{ sign: "<name from the brand profile>" }`, handwritten at the bottom of the field. Both stand from
frame 0.

## Composition Rules

In stage each fact lives in one place: the score only on the board; on the scene, objects (replies,
cards), not digits. A board line is a caption, cells by the number of runs (`Scene.cells`) and a
score: a cell is a run. On the field, use the light red and green (`C.fred`, `C.fgreen`); on the
sheet, the regular ones. The same prompt line is captioned the same on the scene and on the board: one
string in the code (`T.L` in the skeleton), with a length that fits the board column (172 up to the
cells; longer — `Sketch.fit` shrinks all board lines with one font size), and it carries the line's
whole meaning: do not drop a condition for length. The step scene leaves via `Scene.out` at the start
of the next step; the scaffold and the board are not erased until the conclusion. The character counts
in `Scene.pace` are what the viewer reads in this step; text that stays on later or repeats on the
board is counted once; `lead` is when the first text appears in the step: characters are read from
that point.

Frame 0: the title and the chrome, the lesson layer is empty; the whole system is drawn first, then
the GIF moves to the parts. First motion before 0.5 s, 4–5 events at reading pace (`motion.pace`). The
diagram has up to three key points and up to three participants; anything not needed for the
conclusion is not drawn. Each part has its place: what stood on the left at the start stays on the
left. Color carries meaning and never alone: the red $0 is also labeled. The conclusion holds for its
characters / 16.5 + 1 s from the start of typing, then the lesson layer fades out in 0.35 s and the
loop returns to frame 0 without a jump. In the skeletons DUR = FADE + 0.7 (actors 12.4 / 11.7, stage
26.68 / 25.98); the stage skeleton fails with an error by itself if `DUR` is not FADE + 0.7.

## Wiring

Commands run from the project root; `$R` is the skill's `recipe/` folder and `$B` the brand folder.
Steps 1–3 work on a bare project and are repeatable; repeating step 3 brings back the sample lesson instead of the card, so do
it once. The project is built bare: no `hyperframes init`, `skills update` or saving preferences; they
touch the user's global skills and settings.

0. The key frame before the build (optional, but measure the title here):
   `node $R/bin/preview.mjs --layout <stage|actors> --title "Transactional *outbox*" [--sub "How a transfer survives a crash"] --end "Nothing lost, *nothing paid twice*." [--series 7/30] [--sign "<signature>"] [--theme $B/theme.json] --out frame.png`.
   Prints the font sizes after shrinking: `title 35 (min 26), sub 15 (min 12), end 21 (min 17)`.
   Exit 0 — it fits; 3 — a line shrank below its threshold (stderr names the line: shorten it or
   break the title with “|”);
   1 — the PNG was not written or the fonts did not load; 2 — bad arguments (including three title
   lines, a subtitle with a two-line title, and a series not in the form “day/total”).
1. `mkdir -p assets compositions renders && node $R/bin/kit.mjs assets/kit [--theme $B/theme.json]`
   — the engine, the scene (`scene.js`), rough.js, icons, fonts, GSAP and the brand theme, if the
   brand has `theme.json`. GSAP is not in the recipe (its license is not MIT): `kit.mjs` takes the
   pinned version from npm and caches it in `~/.cache/linkedin-lesson`.
2. `cp $R/layouts/index.html index.html` and set `data-duration`
   on `#root` and `#lesson` to the lesson's `DUR`: for your own events DUR = FADE + 0.7, with FADE by
   reading pace (`motion.pace`) (skeletons: stage 26.68, actors 12.4).
   GSAP loads from `assets/kit`, not from a CDN.
3. `cp $R/layouts/<stage|actors>.html compositions/lesson.html`.
   The skeleton is a sample lesson: replace the title, events and numbers with the card's; keep the
   chrome, `@font-face`, `data-composition-id="lesson"` and the tail with the timeline. The title,
   subtitle, series and signature go into
   `chrome.<layout>(s, "Line one|*line two*", { sub: "<question>", series: "7/30", sign: "<signature>" })`,
   the conclusion into `Sketch.conclusion(s, "Text with an *accent*.", at, dur)`. Do not measure widths in the
   composition with `measureText` and do not hard-code them as numbers: at build time the font is not
   loaded yet. Wrap a line that may not fit in `Sketch.fit(s, line, width)`; use `Scene.under` on a
   segment of the line for an underline: both measure in the frame. Call `fit` before `under` on the
   same line and check the result on a snapshot: `fit` has no lower limit, and text smaller than 10
   does not read — then shorten. Stamp — `Scene.seal`: the border is sized by the number of letters,
   the text is in caps, 4–10 letters.
4. Check: `npx --yes hyperframes@0.9.19 check` (the warnings `dead_stretch` and `film_silent` are
   expected, see Known Gaps), snapshots `npx --yes hyperframes@0.9.19 snapshot --at 0,<event ends>`:
   the second when an event's drawing is finished (start + duration), not its start, otherwise the
   frame has an empty spot. Snapshots land in `.hyperframes/artifacts/snapshots/<id>/`; each run has
   its own id. Use them to check that text stays within the sheet and the field. Always check the
   loop seam: `snapshot --at 0,<DUR−0.05>`; the first two PNGs must match byte for byte:
   `d=$(ls -td .hyperframes/artifacts/snapshots/*/ | head -1); cmp "$d"frame-00-at-0s.png "$d"frame-01-at-<DUR−0.05>s.png`,
   otherwise something is left on screen at the loop point. Do not compare the timeline-end frame
   that `snapshot` adds by itself.
5. Render per `render.gif`, merge empty frames per `render.pack`, check per `render.check`.

The fallback 720×900 frame (when the GIF is over 5 MB and `--fps 12` did not help). From the project
root, after step 3:

```
perl -pi -e 's/1080/720/g; s/1350/900/g' index.html
perl -pi -e 's/data-width="1080" data-height="1350"/data-width="720" data-height="900"/' compositions/lesson.html
```

In `index.html` this changes `<meta name="viewport">`, the CSS on `html, body` and
`data-width`/`data-height` on `#root` and `#lesson`; in `compositions/lesson.html`,
`data-width`/`data-height` on `#lesson-root`. `viewBox` and the `<svg>` size (100 %) stay. Do not
edit only the `data-*` attributes: `check` warns `root_dimensions_mismatch` (the page body stays at
the old size). `gifcheck` must show 720×900.

The engine is the global `Sketch` from `assets/kit/sketch.js`: `stage`, `render`, `drawIn`, `text`,
`vis`, `fit`, `chalk`, `icon`, `arrow`, `cursor` (`At`, `Ln`, `El`), `laser`, `ripple`,
`fly`, `meter`, `counter` (the last argument `digits` is the number of digits after the point, integer
by default), `segs`, `title`, `subtitle`, `series`, `sign`, `conclusion`, `frame`, `board`,
`chrome.actors|stage`; colors `C`, fonts `SANS`, `HAND`, `MONO`, sheet `SHEET`. The scene is the
global `Scene` from `assets/kit/scene.js` (`K` in the skeleton): `ro`, `g`, `box`, `line`, `mark`,
`t`, `lines`, `h`, `kick`, `under`, `pace`, `pop`, `stamp`, `seal`, `place`, `out`, `cells`,
`bubblePath`, `pic.box|headphones|gift|card|shield|truck|calendar`. Icons are Lucide names from
`assets/kit/icons.js`.

## Known Gaps

Tested with hyperframes 0.9.19: the stage skeleton passes `check` and renders to 222 frames and
0.92 MB after gifpack, the actors skeleton to 142 frames and 0.57 MB; both seams match byte for byte.
`npx hyperframes` without a version takes the latest one, so the version is pinned.

- **`dead_stretch` “Nothing on screen changes for … s” (warning) — a false alarm.** All motion
  runs as one tween of the `clock.t` clock inside the lesson SVG, and the check cannot see it. Do not
  set `data-hold`.
- **`film_silent` (warning) — expected:** the GIF has no sound.
- **`non_deterministic_code` on `Math.random` in rough.js** — `check` 0.9.x fails on it, so in
  the kit rough.js takes its numbers from a seeded generator (`LICENSES.md`), and a drawing with a
  given seed is the same. Copy the kit whole from the recipe; do not drop in rough.js from npm.
- **The lesson SVG is marked `data-layout-ignore` on purpose:** without it the contrast check fails on
  the sheet palette (gray `#868e96` and green `#2f9e44` give 3.1–3.5:1 against a 4.5 threshold). Do
  not set `--strict` (it fails on the expected warnings) or `data-no-timeline` (it would weaken the
  seek check).
- **`data-layout-ignore` also hides text overflowing the frame and contrast from `check`**
  (`0/0 text checks`). Before the build, `bin/preview.mjs` guards the title and the conclusion
  (exits 0 — fits, 3 — a line shrank below its threshold, 1 — the PNG was not written or the fonts
  did not load, 2 — bad arguments), `Sketch.fit` guards the rest of the text in the frame, and after
  the build the eye checks all of this on `snapshot --at` snapshots.
