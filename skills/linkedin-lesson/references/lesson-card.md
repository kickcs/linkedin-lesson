# Lesson card

Template for `~/.media/brands/<brand>/drafts/<slug>-LESSON.md`. Notes are in the user's language,
frame and post texts in English. The sections from “Lesson type” to “Transfer” carry over from the
story the user understood at step 3. The GIF contract is the recipe's `frame.md`; the look picked at
step 4 — field, fonts, palette, layouts, zone coordinates — is its `looks/<look>/look.md` (in Board,
with the brand's `theme.json`).

## Lesson type

“why” | “how it works” | “how they differ” — and one line on why.

## Key points

1–3 claims that the viewer takes away from the GIF without reading the post.

## Scenario

One case on the real parts of the system, in one or two sentences. Up to three participants; flying
objects and arrows do not count:

- <name in the frame> — <a plain-words explanation, as it stands in the frame: “carries notes to the bank”>

## Mechanism

The steps the user confirmed at step 3, one line per action, in the words of the frame: in “why”,
before and after; in “how it works”, the parts in order; in “how they differ”, each side. The
prototype in `research/` runs these steps, and the GIF events draw them.

## Analogy

The analogy the user picked and where it breaks — or “no analogy”. Into the post per step 6 of the
skill; the GIF has none.

## Transfer

The same trick on another case, in one sentence. Into the post per step 6 of the skill.

## Layout

The look from step 4 and its layout for the lesson type, as the look's `look.md` (Layouts) says:

- **Board:** “why” → `stage`, “how it works” → `actors`, “how they differ” → `actors` with two
  `Sketch.frame` panels. If in “why” the first board line appears only in the last third of the GIF
  (benefits after the fix), use the tall sheet `chrome.actors`: in `stage` the field below the sheet
  stays empty until then. Step captions then sit below the diagram, and the benefits take their
  place as a list.
- **Cards:** `system` for every type; which parts are cards, in which row, and what the main card
  holds (a steps panel, a pool, a cache); in “how they differ”, the two columns.

What we do not draw, though it is true: one line, so that the diagram holds only the key points. A
side branch of the mechanism (a failed retry, a second cycle) goes here too. If the GIF then shows a
path the recorded run did not take, re-run the prototype with a parameter that takes it (the bank
comes back before the first trial) and cite that run in “Facts”.

## Facts

- <fact> — source: <run in `research/`: script, command, file and line | URL, section, date,
  quote> — verified: <how>

Numbers without a source do not go here.

## Frame

- **Title:** the technique's name on one line, up to ~20 characters: `Transactional *outbox*`. The
  accent in `*asterisks*` gets a chalk line in Board; Cards has no accent and drops the asterisks.
  Stands from frame 0.
- **Subtitle:** the question or problem the GIF answers, up to ~40 characters:
  `How a transfer survives a crash`. Stands from frame 0 under the title.
- **Conclusion:** what the technique gives, up to 8 words and ~30 characters, the accent in
  `*asterisks*` in Board: one line in Board, one or two (“|”) in Cards. The last event.
- **Series** (if the post is from a numbered series): `1/30`, the number and the series length — in
  the GIF, “Day 1 of 30” and a tick strip.
- **Frame signature:** the “Frame signature” line of the brand profile; if there is no such line, no
  signature.
- **Look:** the look from step 4 (`board` or another id from `looks.md`) and its layout.
- **Theme:** in a look that takes one (Board), `$B/theme.json` if the brand has one; otherwise the
  look's own palette.
- **Duration:** DUR = FADE + 0.7 by reading pace, no limit in seconds; fade 0.35 s; the conclusion
  holds for its characters / 16.5 + 1 s from the start of typing. After `gifpack`, up to 500 frames.

## Zones

The zones of the look and layout (`look.md`, Layouts: in Board's stage — scaffold, scenes, board; in
Cards — parts, states and chips, band), each with what of this lesson goes into it: what stands from
frame 0, what each step changes and when it leaves, what accumulates. Each fact lives in one zone.

## Texts in the frame

In a silent GIF the captions carry what a voice would say in a video, so they are complete sentences:

- a step caption is in plain words, in a dark color, a complete thought with a quoted example
  (“any open bugs?” plus a list of tools); the method or command name goes small under it
  (`tools/list`);
- a term appears together with its object or later, and in the same frame gets a plain-words
  explanation: “Worker — carries notes to the bank”;
- a caption stands next to the object it is about;
- pause questions go on the scene, next to the object they ask about;
- a backend lesson shows the data a step changes: the status field under the database row
  (`status: pending` → `done`), the request on the line to the service (`POST #42 $100`), the
  response back (`200 paid`) and the response to the client (`202 accepted`). The viewer sees where
  the transfer became `pending` and what went to the bank, not only how the money moves.

## GIF events

The flow follows the lesson type (step 3 of the skill). The whole system is drawn first, then the GIF
moves to the parts. One line per action plus the conclusion: second — what appears — the look's
engine function, with the character count next to it.

An action is one thing the viewer watches happen: a person taps, a request flies, a reply comes back,
a row changes its status, a connection is taken or given back. Each action has its own caption, and
the caption appears before the action or with it: a viewer reads first, then watches. The caption
says what the person or service does and what a reply means: “The bank answers: 340 on the card.”
next to the chip `200 balance 340`. A chip flies about 1 s. The first pass through the scenario goes
one action at a time; a replay (ten payments after one) can put several actions under one caption,
because the viewer has already seen each of them.

Three shortcuts keep the GIF on its main path. A usual day that only sets the scene (a payment that
goes through) takes two captions, the request and the answer; the steps the failure comes from stay
one action per caption. Two results of one event in a row (the breaker closes, the payment is marked
paid) share one caption. A montage of identical events under one caption (five shoppers failing in
turn) moves on every 0.25 s, because each event keeps its name on the scene.

When the mechanism counts events toward a threshold (five failures open the breaker), draw each event
with its owner's name from the run: the counter's slots fill with the names, the person's name
changes with each event, and the caption says whose events count (“5 failures in a row, whoever
paid”). A `×5` badge on one person reads as that person failing five times.

In “why”, the fix is drawn as a change of the mechanism: the steps before stand on the scene (a
service steps panel with a `before` label), and the steps after appear one by one in their place,
each with its caption, under an `after` label. A new result on the same scene does not show what
changed; the steps do.

Pace: drawing starts no later than 0.5 s; the first event with text comes 0.5 s after the
participants are drawn; the next one comes when the current text has been read at 16.5 characters
per second from its appearance, and no earlier than the end of the motion + 0.5 s. The characters
next to each line are counted as `motion.pace` in `frame.md` says: a chip that repeats its caption
counts none, and neither does the intro. The pause question and its answer follow
`motion.question` there: an answer the viewer has already seen comes at once. In a “why” lesson each
benefit is first visible on the scene, then its line appears.

- 0.1 — <what> — <in Board: drawIn | text | cursor | fly | meter | counter | Scene.pop | place | out | seal | …;
  in Cards: say | chip | packet | enter | hl | done | ring | fix | benefits | …>

## Post text

Hook variants — 3–4 first sentences on different `hook-writer` mechanisms, each with a line: the
mechanism and which problem it names. The user chooses at step 7; the chosen one goes into the text
below. Three paragraphs, up to 700 characters including hashtags; order and rules — step 6 of the
skill.

1. <hook> — <mechanism>: <which problem it names>

```
<observation: a hook up to 80 characters — for a series post “Day N/30 of explaining AI. <hook>”, up to 80 together —
and what surfaces from it in production>

<problem: the scenario from the GIF and its outcome in plain words>

<solution: “To solve this, we can use <technique>.”, how it works and what it costs>

<hashtags, up to three, on one last line, if needed: the series hashtag, if the post is from a series>
```

## Pre-approval check

- [ ] Every event serves a key point; the rest, side branches included, is cut or recorded in “what
      we do not draw”.
- [ ] The whole system is visible at once before the GIF moves to the parts.
- [ ] Each part keeps its place from start to end: what stood on the left stays on the left.
- [ ] Each term appears with its object and explanation; each caption is next to its object.
- [ ] The meaning of a color is backed by a caption or a sign: the red $0 is labeled “crash”.
- [ ] On the first pass every event line holds one action: count the requests, replies, taps and
      status changes in each line. Its caption comes before the action or with it.
- [ ] Each motion shows a cause, an order or where to look; no more than three flashes or outlines
      per second, no camera zooms.
- [ ] A “why” lesson has one failure and one fix; each benefit is visible on the scene before its line.
- [ ] In “why”, the steps after appear on the scene one by one, in the words of “Mechanism”.
- [ ] In Board, the field below the sheet does not stay empty until the last third of the GIF:
      otherwise the layout is the tall sheet.
- [ ] The pause question comes before the outcome and holds according to the pace; an answer the
      viewer has already seen comes at once, not counted up again.
- [ ] Events the mechanism counts are drawn one by one, each with its owner's name from the run.
- [ ] A backend lesson shows the row status, the request and the response at every step where they
      change.
- [ ] Every number in the frame and the text has a line in “Facts”.

## After publishing

The GIF loops in the feed, the text on a phone is not cut under “…see more”,
<what else to check for this lesson>.
