---
version: 1
name: Board
description: >
  A school chalkboard: the green field holds what stays and accumulates (series, title, subtitle,
  board, conclusion, author signature), the white sheet on it holds the scene, which draws itself:
  rough.js strokes appear, hand-drawn Lucide icons play roles, objects fly and count. The stage
  layout is a cheat sheet that assembles itself: the scaffold stays, the step scene changes, the
  board accumulates, and by the conclusion the whole lesson is on screen; actors — participants and
  the path between them. Takes a brand theme (theme.md).
unit: logical SVG canvas 360×450 over the 1080×1350 frame, scale ×3
principle: the field holds what is permanent, the sheet holds the scene · the scaffold stays, the step scene changes, the board accumulates · each fact in one place

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

skeletons: "DUR / FADE: actors 12.4 / 11.7, stage 26.68 / 25.98. The actors demo skeleton rounds FADE up to 0.1 s, stage computes it from Scene.pace without rounding; stage is a whole lesson (why a RAG bot makes things up), actors has demo events"
---

## Overview

One scene on a school chalkboard. Colors, fonts and stroke roughness are the defaults above; a brand
theme replaces them (`theme.md` next to this file), the geometry stays. In the composition, take
colors by name from `C` and `K` (`C.paper`, `K.lred`), not as hex: a hex color ignores the theme. The
field holds what stays and accumulates: series, title, subtitle, board, conclusion and author
signature. The white sheet on it is the lesson scene; it draws itself and changes. Strokes appear by
hand, arrows are placed, icons fly and count. The last event is the conclusion on the field below the
sheet. The sample frame is the skill's `examples/outbox/frame.png`.

## The Frame

SVG with `viewBox="0 0 360 450"` over the whole frame. Top to bottom: on the field, the series
(y 27), the title (y 62–96) or the title and subtitle (y 70 and 97), the sheet with the scene
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

Zones for the lesson card (stage and “why” on the tall sheet):

- **Scaffold** — stays until the conclusion: participants, question, findings, the prompt sheet with
  stickers.
- **Scenes** — one per step, each leaves at the start of the next: which objects carry the step's
  fact (replies, cards, a quote, a stamp), no digits.
- **Board** — one line per step or per benefit: the caption (the same as on the scene), cells by the
  number of runs and the score from “Facts”. The score lives only on the board. On the tall sheet,
  the benefits are a dark list in place of the step captions, without cells.

## Text

Fonts by role (defaults; a theme may replace them). Sans, Bricolage Grotesque, carries all content:
title, subtitle, conclusion, step caption, board line, the client's question, rule, model answer.
Hand, Shantell Sans, is only the author's hand: a note in the scene margin and the signature at the
bottom of the frame. Mono is only for a method, file or command name and a request or response on a
line. Text no smaller than 10. No caps, no lines joined with “·” and no mono in small labels: a
section label is in normal case (`Scene.kick`).

The title is one or two lines: `"Why RAG bots|*make things up*"`, “|” is a line break; with a
subtitle, one line. The accent is a word or line in `*asterisks*`: the text stays white, a chalk line
lies under it; one accent per title and one per conclusion. The engine shrinks a line wider than the
field by itself (`Sketch.fit`), both title lines with one font size; the preview rejects a title
smaller than 26, a subtitle smaller than 12 and a conclusion smaller than 17 — then shorten.

Step caption 11.5–14.5, participant, card and section labels 10–10.5, mono no smaller than 10. Print
centered captions with `anchor: "middle"`: the engine keeps the untyped tail transparent, so the
center does not jitter.

Data on the scene of a backend lesson: a database row field is a size-10 line under the row's text,
the key in sub color, the value in the state color (`pending` in orange, `done` and `yes` in green,
`no` in sub color). A request and a response are a chip with mono 10 in ink, 6 per character + 10
wide, that moves along the line via `Scene.place`; the response sits on a `Scene.lgreen` fill with a
green outline, the request on white with an ink outline (the skill's `examples/outbox`).

## Composition Rules

In stage each fact lives in one place: the score only on the board; on the scene, objects (replies,
cards), not digits. A board line is a caption, cells by the number of runs (`Scene.cells`) and a
score: a cell is a run. On the field, use the light red and green (`C.fred`, `C.fgreen`); on the
sheet, the regular ones. The same prompt line is captioned the same on the scene and on the board: one
string in the code (`T.L` in the skeleton), with a length that fits the board column (172 up to the
cells; longer — `Sketch.fit` shrinks all board lines with one font size), and it carries the line's
whole meaning: do not drop a condition for length. The step scene leaves via `Scene.out` at the start
of the next step; the scaffold and the board are not erased until the conclusion.

Frame 0: the title and the chrome, the lesson layer is empty. The conclusion is typed on the field;
at FADE the whole lesson layer fades out in 0.35 s, the chrome never fades. Cursors appear after
zero. When the font finishes loading, the engine redraws the current frame, so the font size and the
chalk line in frame 0 are the same as at the end. The stage skeleton fails with an error by itself if
`DUR` is not FADE + 0.7.

## Building

In the skeleton (`layouts/stage.html` or `layouts/actors.html`) replace the title, events and numbers
with the card's; keep the chrome, `@font-face`, `data-composition-id="lesson"` and the tail with the
timeline. The title, subtitle, series and signature go into
`chrome.<layout>(s, "Line one|*line two*", { sub: "<question>", series: "7/30", sign: "<signature>" })`,
the conclusion into `Sketch.conclusion(s, "Text with an *accent*.", at, dur)`, the steps into
`Scene.pace([...], 0.2, 16.5)`: `bin/pace.mjs` reads both calls. In `stage`, set `DUR` = FADE + 0.7.

Do not measure widths in the composition with `measureText` and do not hard-code them as numbers: at
build time the font is not loaded yet. Wrap a line that may not fit in `Sketch.fit(s, line, width)`;
use `Scene.under` on a segment of the line for an underline: both measure in the frame. Call `fit`
before `under` on the same line and check the result on a snapshot: `fit` has no lower limit, and
text smaller than 10 does not read — then shorten. Stamp — `Scene.seal`: the border is sized by the
number of letters, the text is in caps, 4–10 letters. Board cells — `Scene.cells`.

## Engine

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

- **`non_deterministic_code` on `Math.random` in rough.js** — `check` 0.9.x fails on it, so in
  the kit rough.js takes its numbers from a seeded generator (`kit/LICENSES.md`), and a drawing with a
  given seed is the same. Copy the kit whole with `bin/kit.mjs`; do not drop in rough.js from npm.
  This error in a project means `assets/kit` has the wrong rough.js: run `kit.mjs` again.
- **The sheet palette fails the contrast check:** gray `#868e96` and green `#2f9e44` give 3.1–3.5:1
  against a 4.5 threshold, which is why the lesson SVG is marked `data-layout-ignore`
  (`frame.md`, Known Gaps).
