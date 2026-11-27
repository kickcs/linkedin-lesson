---
version: 2
name: LinkedIn lesson GIF
description: >
  A silent looping educational GIF for LinkedIn. One action per event and a conclusion, each held
  while its text is read; the loop is up to 500 frames after gifpack. This file is the contract every
  look keeps: the frame, the reading pace, the loop, the render and its budget. How the GIF is drawn
  — palette, fonts, zones, layouts, engine — is the look's (looks.md, looks/<id>/look.md).
unit: the frame — 1080×1350 (4:5, LinkedIn); the fallback 720×900 scales the same SVG
principle: frame 0 carries the title and the whole system · up to three key points per GIF · each fact in one place · color carries meaning · numbers only from the card · render(t) is a pure function · a loop without a seam

motion:
  rhythm: "first motion before 0.5 s, then one action per event at reading pace (pace), its caption before the action or with it (the lesson card, GIF events), fade 0.35 s; an event that changes before it is read, the viewer reads as “hard and fast”; motion only where it shows a cause, an order or where to look"
  question: "pause question: the question next to the object it is about or in the caption band, holds for its characters / 16.5 + 1 s, then the answer; while it is up, a counter the answer fills shows `? s`. An answer that repeats what the viewer has already seen (the same wait as before) comes at once as the result (`10.0 s`), its caption tied to the earlier case (“As long as Anna: 10 s”); only a value shown for the first time counts up"
  comfort: "no more than three flashes (outlines, blinks) per second; no camera zooms"
  pace: "the next event starts after max(text appearance + characters / 16.5, end of motion + 0.5) s. Characters — the new text the viewer reads in the event: its caption and the labels the caption does not say (a state, a note, a method name it leaves out). A chip, tag or panel row that repeats the caption is read at a glance and not counted (`GET /balance` under “It asks the bank for Anna's balance”, `5 fails → open` under “After 5 in a row, open”); neither are the names of what a caption counts (five names under “Five shoppers”) or text that stood before. The intro is not held for reading: the first event comes 0.5 s after the participants are drawn; the title and the part labels stand from frame 0 and are read along the way, so the intro step counts no characters. 16.5 characters per second sits just below the 17 cps Netflix allows for children's subtitles; 12–15 read as slow in a looping GIF. The conclusion holds for its characters / 16.5 + 1 s from its start"
  duration: "DUR = FADE + 0.7: the 0.35 s fade and as much again of the empty lesson before the seam. FADE = conclusion start + its characters / 16.5 + 1 s. Each look's engine computes the step times with its pace function, and look.json lists the DUR of its skeletons. A lesson at reading pace usually comes out at 30–100 s; there is no limit in seconds: frames are paid for with fps (render.budget); `bin/pace.mjs` prints FADE and DUR of a built lesson in any look and checks them"
  loop: "the frame after the fade = frame 0: what stands from frame 0 never fades, what the lesson adds is gone by DUR, nothing appears at zero itself"
  seek: "one paused timeline on the clock.t clock; render(t) is a pure function, seeking backward gives the same frame; gsap seek(t, false) runs onUpdate"
  determinism: "no Math.random, Date.now, performance.now in the composition or the kit: check 0.9.x fails on them"

render:
  gif: "npx --yes hyperframes@0.9.19 render --format gif --fps 15 --gif-loop 0 --output renders/<slug>.gif"
  pack: "node $R/bin/gifpack.mjs renders/<slug>.gif — right after the render: merges frames that change nothing into the previous one; pixels and duration stay the same"
  budget: "≤ 5 MB (target ≤ 4.5 MB) and ≤ 500 frames after gifpack (LinkedIn help, Media file types supported on LinkedIn: “The limit for a GIF is 500 frames or 36,152,320 pixels.”, linkedin.com/help/linkedin/answer/a564109, read 2026-11-25; the Images API and ads take 250: for them compare the `frames` field of the gifcheck JSON line with 250). Over 500 frames: render at ⌊fps × 500 / frames⌋, not below 12 (after gifpack the count follows fps almost in proportion). Under 500 with room for at least one more fps (after cuts or a re-time): render once more at ⌊fps × 500 / frames⌋ while the file stays under 4.5 MB, for smoother motion; fps and frames are always those of the last render. Over 4.5 MB, in order: --fps 12 → 720×900 frame (edits in Wiring) → MP4. Do not cut reading pauses: after gifpack they cost neither frames nor bytes"
  mp4: "last move: the same frame as MP4 (`render --format mp4 --output renders/<slug>.mp4`); warn the user that LinkedIn will show a player, not a loop"
  debug: "check or render failed — debug with the hyperframes-cli skill"
  check: "node $R/bin/gifcheck.mjs renders/<slug>.gif"
---

## Overview

One scene, looping, no sound. The title stands from frame 0: in the LinkedIn feed it is seen before
the GIF starts to move. Then the system is drawn and the GIF moves to its parts, one action per event;
the last event is the conclusion. Each event holds while its text reads comfortably (`motion.pace`),
so a lesson usually loops in 30–100 s. Before the build, `bin/preview.mjs` takes the key frame
(title, subtitle, conclusion in the chosen look): it also checks that the lines fit without a small
font size.

The look is chosen per lesson at step 4 of the skill from `looks.md`. Its `look.md` sets the palette,
fonts, zones, layouts and the engine's API; take colors by name from the engine's palette, not as hex.

## The Frame

1080×1350. The composition draws into one SVG that is 100 % of its container, so the fallback 720×900
frame does not touch the engine; the `viewBox` is the look's.

## Text

English, short. The title names the technique, the subtitle the question or problem the GIF answers
(“How a transfer survives a crash”), the conclusion what the technique gives. Every number in the
frame is in the lesson card with a source.

A caption on an arrow or a step is in plain words (“list your tools”), the method or command name is
mono next to it or under it (`tools/list`). An explanation that must be read is in the look's ink
color, not a light one, and is a complete thought with a quoted example, without shorthand like
“X + Y”. A backend lesson shows the data a step changes: a database row's status field, the request on
the line to the service, the response back; the look says how each is drawn.

Subtitle, series (“day/total”, a numbered series of posts: “Day 7 of 30” and a strip of ticks) and the
author signature (the brand profile's “Frame signature”) go into the look's `chrome` call and stand
from frame 0.

## Composition Rules

Frame 0: the title and the whole system; the GIF then moves to the parts. First motion before 0.5 s,
then one action per event at reading pace (`motion.pace`). The diagram has up to three key points and
up to three participants; anything not needed for the conclusion is not drawn. Each part has its
place: what stood on the left at the start stays on the left. Color carries meaning and never alone:
the red $0 is also labeled. The character counts given to the look's pace function follow
`motion.pace`; `lead` is when the first text appears in the step: characters are read from that
point. The conclusion holds for its
characters / 16.5 + 1 s, then the lesson fades out in 0.35 s and the loop returns to frame 0 without
a jump.

## Wiring

Commands run from the project root; `$R` is the skill's `recipe/` folder, `$B` the brand folder and
`$L` the chosen look's folder `$R/looks/<look>`. Steps 1–3 work on a bare project and are repeatable;
repeating step 3 brings back the sample lesson instead of the card, so do it once. The project is
built bare: no `hyperframes init`, `skills update` or saving preferences; they touch the user's
global skills and settings.

0. The key frame before the build (optional, but measure the title here):
   `node $R/bin/preview.mjs --look <look> [--layout <layout>] --title "Transactional *outbox*" [--sub "How a transfer survives a crash"] --end "Nothing lost, *nothing paid twice*." [--series 7/30] [--sign "<signature>"] [--theme $B/theme.json] --out frame.png`.
   Without `--layout` it takes the look's first layout (`look.json`). Prints the font sizes after
   shrinking and the look's minimum for each: `title 35 (min 26), sub 15 (min 12), end 21 (min 17)`.
   Exit 0 — it fits; 3 — a line shrank below its threshold (stderr names the line: shorten it or
   break the title with “|”); 1 — the PNG was not written or the fonts did not load; 2 — bad
   arguments (including an unknown look or layout, a theme for a look that takes none, three title
   lines, a subtitle with a two-line title, more conclusion lines than the look takes — `endLines`
   in `look.json` — and a series not in the form “day/total”).
1. `mkdir -p assets compositions renders && node $R/bin/kit.mjs assets/kit --look <look> [--theme $B/theme.json]`
   — the look's engine, icons, fonts, GSAP and, for a look that takes one, the brand theme. GSAP is
   not in the recipe (its license is not MIT): `kit.mjs` takes the pinned version from npm and caches
   it in `~/.cache/linkedin-lesson`.
2. `cp $L/layouts/index.html index.html` and set `data-duration` on `#root` and `#lesson` to the
   lesson's `DUR` (the skeletons' DUR is in `$L/look.json`). Once the events are written,
   `node $R/bin/pace.mjs` prints DUR and exits 1 if `index.html` disagrees. GSAP loads from
   `assets/kit`, not from a CDN.
3. `cp $L/layouts/<layout>.html compositions/lesson.html`. The skeleton is a sample lesson: replace
   its texts, parts and events with the card's as `$L/look.md` (Building) says; keep `@font-face`,
   `data-composition-id="lesson"` and the tail with the timeline.
4. Check: `npx --yes hyperframes@0.9.19 check` (the warnings listed in Known Gaps are expected),
   snapshots `npx --yes hyperframes@0.9.19 snapshot --at 0,<event ends>` (`bin/pace.mjs` prints the
   list): the second when an event's drawing is finished (start + duration), not its start,
   otherwise the frame has an empty spot. Snapshots land in `.hyperframes/artifacts/snapshots/<id>/`;
   each run has its own id. Use them to check that text stays within its zone. Always check the loop
   seam: `snapshot --at 0,<DUR−0.05>`; the first two PNGs must match byte for byte:
   `d=$(ls -td .hyperframes/artifacts/snapshots/*/ | head -1); cmp "$d"frame-00-at-0s.png "$d"frame-01-at-<DUR−0.05>s.png`,
   otherwise something is left on screen at the loop point. Do not compare the timeline-end frame
   that `snapshot` adds by itself.
5. Render per `render.gif`, merge empty frames per `render.pack`, check per `render.check`.

`bin/pace.mjs` works for every look: it loads the scripts of `index.html`, mounts the composition
and reads the steps and the conclusion that the look's engine reports, then finds the second the
conclusion starts to fade.

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

## Known Gaps

Tested with hyperframes 0.9.19; each look's `look.md` lists its own numbers and gaps.
`npx hyperframes` without a version takes the latest one, so the version is pinned.

- **`dead_stretch` “Nothing on screen changes for … s” (warning) — a false alarm.** All motion
  runs as one tween of the `clock.t` clock inside the lesson SVG, and the check cannot see it. Do not
  set `data-hold`.
- **`film_silent` (warning) — expected:** the GIF has no sound.
- **`composition_file_too_large` (warning) — expected over 300 lines:** a lesson with one action
  per event outgrows it. Its hint to split scenes into files does not apply: the lesson is one SVG on
  one clock.
- **The lesson SVG is marked `data-layout-ignore` on purpose:** without it the contrast check fails
  on the Board sheet's palette (its `look.md`); every look's skeleton keeps the mark, so `check`
  reads all looks the same way. Do not set `--strict` (it fails on the expected warnings) or
  `data-no-timeline` (it would weaken the seek check).
- **`data-layout-ignore` also hides text overflowing the frame and contrast from `check`**
  (`0/0 text checks`). Before the build, `bin/preview.mjs` guards the title and the conclusion, the
  look's `fit` guards the rest of the text in the frame, and after the build the eye checks all of
  this on `snapshot --at` snapshots.
- **A pause that `gifpack` does not merge.** On frames with the same DOM, Chrome can repaint part of
  the canvas and alternate two antialiasing variants, so a still pause stays one frame per tick.
  Every look's `stage` draws an invisible full-frame rect (`data-role="repaint"`) whose fill changes
  on every frame, which forces a full repaint; keep it. If `gifpack`'s `after` still stays near
  `before`, count the frames that change during a pause before going down the fps ladder: a change
  on every tick is this flicker, and the other GPU mode (`--no-browser-gpu`, or without it) is the
  next try.
