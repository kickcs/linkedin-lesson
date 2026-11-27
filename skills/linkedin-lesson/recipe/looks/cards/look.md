---
version: 1
name: Cards
description: >
  A light field where every part of the system is a white rounded card with its drawing and its
  current state: a phone with its screen, a service with its steps and its pool, a bank that thinks,
  a database row with its status. Requests and replies are chips on the links between the cards;
  one caption at a time in a band under them. Clean strokes with round ends, no sharp corners, no
  hand-drawn wobble. No brand theme: the palette carries meaning.
unit: the SVG canvas is the frame itself, viewBox 1080×1350
principle: the cards stand from frame 0 in their idle state · a step changes the state of a card and puts a chip on a link · one caption at a time · color names the flow

colors:
  field: "#e9eef3 (the frame background)"
  paper: "#ffffff (cards, a request chip, white marks on a colored button)"
  ink: "#14233b (text, outlines, drawings)"
  note: "#51617a (quiet text: subtitle, a part's note, the signature, a benefits heading)"
  mute: "#cfd6df (an idle link, empty slots, screen lines, separators)"
  dim: "#9aa7b8 (something switched off)"
  violet: "#6f3ff5, fill lviolet #e6dcff (the main flow: the request the lesson follows, the fix, the after label, the benefit rings)"
  teal: "#00a391, fill lteal #c4ece6, text tealInk #00695d (the second flow, a reply that succeeded, a saved state: approved)"
  orange: "#d14900, fill lorange #ffe6c9, text orangeInk #9a3700 (a wait or a failure: a full pool, a slow step, the before label, pending)"
  amber: "#ff9d2e (a part that is busy or thinking; the bracket of what a slow run holds)"
  yellow: "#ffe27a (a highlight that is neither good nor bad)"

typography:
  sans: "Overpass, variable 100–900 (SIL OFL), assets/kit/fonts — all text but code"
  mono: "JetBrains Mono 400 (SIL OFL) — requests, replies, code rows, database fields"
  floor: "text no smaller than 23 px (a pill or legend); captions 44–46"
  title:      { font: "Overpass 900", size: 98, y: 150, tracking: -2, note: "one line with a subtitle; two lines (“|” breaks) at 84, y 126 and 212, without one; shrinks to 956 wide by itself, the preview rejects anything below 70" }
  subtitle:   { font: "Overpass 500", size: 38, y: 208, color: note, note: "the question the GIF answers; shrinks to 952 by itself, the preview rejects anything below 30" }
  series:     { font: "Overpass 800", size: 26, y: 52, color: note, note: "“Day 7 of 30” top left, rounded ticks on the right" }
  caption:    { font: "Overpass 800", size: "46 (one or two lines, y 1120, pitch 56) or 44 (three lines, y 1108, pitch 54)", note: "the band under the cards; lines of one caption shrink together to 952" }
  fix:        { font: "Overpass 900 violet 40 heading at y 1104, lines 800 38 at 1156 + 48 per line" }
  benefits:   { font: "Overpass 800 note 34 heading at y 1104, lines 800 38 at x 114 after a teal check, 1156 + 48 per line" }
  conclusion: { font: "Overpass 900", size: 76, tracking: -1.5, note: "one line at y 1190 or two at 1152 and 1234; shrinks to 956, the preview rejects anything below 60" }
  sign:       { font: "Overpass 500", size: 29, y: 1312, color: note }
  parts:      { name: "Overpass 800 40 (a person) or 36 (a card title)", note: "Overpass 500 28 note", panel: "Overpass 800 30 heading, code rows mono 28", chip: "mono 27 in a pill 51 high", tag: "mono 24 in a pill 38 high", pill: "Overpass 800 23" }

strokes:
  outline: "ink, 7 wide, round caps and joins (s.outline); chips 5; rings 6; links 14 with round ends"
  corners: "every shape is rounded: cards r 46–50, chips and tags fully round, rr() draws quadratic corners"

spacing:
  margin: "x 62–66 for text; cards from x 40 to 1040"
  header: "series y 32–52, title y 150 (one line) or 126 / 212 (two), subtitle y 208"
  parts: "people at the top: a phone at (64, 240) or (911, 240) scale 1.25, the name at y 292 and the note at y 328 beside it, their chips at y 376; the main card (40, 470, 1000, 336, r 50) with its steps panel on the left (x 80, y 576, w 404, rows from y 616) and its state on the right from x 544 after a separator at x 510; the bottom row (40, 862, 480, 170) and (560, 862, 480, 170), r 46, or one card across"
  links: "x 116.5 and 963.5 from the phones (y 416–448, head at 464), x 250 and 800 to the bottom row (y 806–862); a chip on a link sits on its end, at the edge of the card it goes to"
  band: "captions y 1100–1250; signature y 1312"

skeletons: "DUR / FADE: system 20.51 / 19.81 (how a cache-aside read works). The pool example (skill's examples/pool) is a whole “why” lesson: DUR 88.48"
---

## Overview

The system is drawn as it is: the people and the parts stand from frame 0 as white cards on a light
field, each in its idle state, with real names. A step changes the state of a card: a step row lights
up, a pool slot is taken, the bank's note turns amber, a database row gets its status, a phone's
button spins. Requests and replies are chips on the links between the cards, a dot runs along the
link when one is sent. The caption band under the cards holds one caption at a time, then the fix,
the benefits and the conclusion. The sample frame is the skill's `examples/pool/frame.png`.

## The Frame

The SVG `viewBox="0 0 1080 1350"` is the frame itself: coordinates are frame pixels. Top to bottom:
the series (y 32–52), the title (y 150, or two lines at 126 and 212), the subtitle (y 208), the cards
(y 240–1032), the caption band (y 1100–1250) and the signature (y 1312). Text starts at x 62–66,
cards span x 40–1040.

## Layouts

One layout, **system** (`layouts/system.html`), for every lesson type: the parts as cards in rows,
links between them, the caption band under them.

- **“why”** — the main card carries a steps panel with a `before` pill (`panel.label`): its rows are
  the steps before, a bracket and a legend under them show what a run holds (“connection taken: 2 s”).
  The failure plays on the cards, the pause question stands in the band. The fix comes as the fix
  list in the band (`s.fix`): the `before` rows leave, the rows after come one by one under an
  `after` pill, each with its line. The replay runs the same scenario on the new steps; the benefits
  list (`s.benefits`) takes the band, each benefit outlined on the cards (`s.ring`) before its line.
  The skill's `examples/pool` is this flow.
- **“how it works”** — the parts in order: each step highlights a row or a card, sends a chip and
  shows the reply. The skeleton is this flow.
- **“how they differ”** — two columns of cards, x 40–520 and 560–1040, each with its name at the top;
  the rows of one axis stand at the same height in both, so the eye compares them across.

Zones for the lesson card:

- **Parts** — the cards that stand from frame 0 with their idle state: names, notes, drawings, the
  steps panel, slots, rows. A part hidden during the lesson comes back with the `BACK` window.
- **States and chips** — what a step changes: a highlighted row, a done check, a taken slot, a status
  tag, a chip on a link, a ring. Each leaves when its action is over or at the fade.
- **Band** — one caption per step (`s.say`), then the fix list, the benefits list and the conclusion.

## Text

Overpass carries all text but code; JetBrains Mono carries requests, replies, code rows and database
fields. Sizes are in the front matter; captions 44–46 read on a phone at 400 px. There is no accent:
`*asterisks*` in a title or conclusion are dropped. The title is one line with a subtitle, or two
lines (“|” breaks) without one.

A request is a chip outlined in its flow's color on white; a reply is a chip on `lteal` with a teal
outline; a load of requests is a violet badge on its corner (“×10”), while events the mechanism
counts are drawn one by one with their owners (the lesson card, GIF events). A chip's width comes
from its characters (`s.chipW`), so a chip is never measured. A database field is a tag (`s.tag`): `status:
pending` on `lorange` in `orangeInk`, `status: approved` on `lteal` in `tealInk`. Names and notes
beside a part, card titles and panel rows are in ink or note color, never in a light color.

## Composition Rules

Each part keeps its card from start to end; a step changes what is on the card, it does not move the
card. One action per step on the first pass: a tap, a chip, a reply, a status change; a replay may put
several under one caption. A chip flies about 1 s: it pops in at the sender, a dot runs the link, the
reply pops in at the same spot. Color names the flow and is backed by a word: an orange row has its
clock and “2 s”, an orange count “10 of 10 taken”.

The fade: everything the lesson adds has a window that ends at the fade; a window without its end
(`[from]`, or a chip, ring or `enter` without `to`) lasts until the fade and leaves in 0.35 s with
the conclusion. What stands from frame 0 never fades, so the frame after the fade equals frame 0. A
part hidden during the lesson (the `before` rows) comes back with `BACK`.

## Building

In the skeleton (`layouts/system.html`) replace the texts in `T`, the parts and the steps with the
card's; keep `@font-face`, `data-composition-id="lesson"` and the tail with the timeline. In order:

- `K.pace([K.step(text, motion, lead), …], 0.2, 16.5)` — the steps; `bin/pace.mjs` reads them;
- `K.timing(lastStep.end, T.end)` gives `END`, `FADE` and `DUR`; `DUR` goes into `data-duration`
  of `index.html` (`pace.mjs` prints it);
- `K.stage(svg, { fade: FADE })` gives the drawing context `s`;
- `s.chrome(T.title, { sub, series: "7/30", sign })` — the field, header and signature, then the
  layers `links`, `cards`, `over`, `caps` (`s.layers`) in this order: links lie under the cards,
  chips and rings over them, the band on top;
- the parts, then the steps in time order, then `s.conclusion(T.end, END)`.

Do not measure widths in the composition: the captions, fix and benefits lines, title, subtitle and
conclusion shrink by themselves; wrap a name or note that may not fit in `s.fit([node], width)`. Check
every step on a snapshot: nothing may cover a name, and a chip must not run off its card.

## Engine

The global `Cards` from `assets/kit/cards.js`: `C` (palette), `SANS`, `MONO`, `CPS`, `pace`, `step`,
`timing`, `stage(svg, { fade })`. The context `s` that `stage` returns:

- time: `show(el, from, to, { in, out })`, `showW(el, [[from, to, in, out], …], { except, keep })`
  (windows read at render time), `pop`, `enter(cx, cy, from, to, build, parent, out)`, `draw(path,
  from, dur)`, `packet(x1, y1, x2, y2, color, from, dur)`, `tap(cx, cy, color, from)`, `fit`,
  `prog`, `eio`, `acts`, `render`, `BACK`;
- shapes: `add`, `g`, `at`, `rr`, `tx`, `outline`, `solid`;
- frame: `chrome`, `series`, `layers`;
- parts and links: `card(x, y, w, h, r)`, `link(x1, y1, x2, y2, color)`, `head(x, y, color, dir)`,
  `stop(x, y)`;
- chips and marks: `chip(cx, cy, label, { reply, color, badge }, from, to, out)`, `chipW`, `badge`,
  `tag`, `pill`, `ring(x, y, w, h, color, from, to, out)`;
- drawings: `phone` (84×136), `bank` (120×110), `db` (84×92), `server` (42×38), each `(x, y, k,
  parent)`; `gear(cx, cy, r)`, `check`, `clock`, `stopwatch`, `icon(name, x, y, size, { color, sw,
  fill })` — a Lucide icon from `assets/kit/icons.js` in clean strokes;
- the steps panel `steps(x, y, w, title)`: `label`, `row`, `hl`, `done`, `waits`, `bracket`,
  `legend`;
- the band: `say(lines, from, to)`, `fix(heading, from, [[line, at], …], to)`,
  `benefits(heading, from, [[line, at], …], to)`, `conclusion(text, at)`.

## Known Gaps

Tested with hyperframes 0.9.19: the `system` skeleton renders at 15 fps to 308 frames, after gifpack
95 frames and 0.56 MB. The pool example passes `check`, renders at 14 fps to 1239 frames and after
gifpack to 477 frames and 2.72 MB; at 15 fps it comes to 508, over the limit, so a lesson of about
90 s renders at 14. Both seams match byte for byte. `check` gives the same expected warnings as
any look (`frame.md`).
