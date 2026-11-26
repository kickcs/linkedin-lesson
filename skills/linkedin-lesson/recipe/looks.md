# Looks

A look is how the GIF is drawn: its palette, fonts, the zones of the frame, its layouts and the
engine that draws them. Every look keeps the contract of `frame.md` (the frame, reading pace, loop,
render and budget), so the story, the lesson card and the checks do not depend on it. The user picks
the look for each lesson at step 4 of the skill; the first one in this list is the default.

1. **Board** (`board`) — a school chalkboard: a dark green field holds the title, a board of results
   and the conclusion; a white sheet on it holds a hand-drawn scene (rough.js strokes, Lucide icons
   that pop, fly and count). Suits a lesson that accumulates results run by run, and a brand with its
   own theme: this look takes `theme.json` (`looks/board/theme.md`). Layouts: `stage`, `actors`.
   Sample frame: `$S/examples/outbox/frame.png`.
2. **Cards** (`cards`) — a light field where each part of the system is a white rounded card with its
   drawing and current state; requests and replies are chips on the links between the cards, one
   caption at a time in a band under them. Clean strokes, no theme. Suits a backend lesson where
   requests travel between services and a state changes. Layout: `system`. Sample frame:
   `$S/examples/pool/frame.png`.

Each look lives in `looks/<id>/`: `look.md` (the look and its engine; read it before writing the
card's frame sections and before the build), `look.json` (its name, layouts with their skeleton's DUR,
the preview's minimum font sizes, how many lines the conclusion takes, whether it takes a theme), `kit/` (copied into the project by
`bin/kit.mjs --look <id>`) and `layouts/` (`index.html` and a skeleton per layout).
