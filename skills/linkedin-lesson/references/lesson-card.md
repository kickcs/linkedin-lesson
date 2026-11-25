# Lesson card

Template for `~/.media/brands/<brand>/drafts/<slug>-LESSON.md`. Notes are in the user's language,
frame and post texts in English. The sections from “Lesson type” to “Transfer” carry over from the
story the user understood at step 3. The GIF look — field, fonts, palette, zone coordinates — is set
by the recipe's `frame.md` and the brand's `theme.json`.

## Lesson type

“why” | “how it works” | “how they differ” — and one line on why.

## Key points

1–3 claims that the viewer takes away from the GIF without reading the post.

## Scenario

One case on the real parts of the system, in one or two sentences. Up to three participants; flying
objects and arrows do not count:

- <name in the frame> — <a plain-words explanation, as it stands in the frame: “carries notes to the bank”>

## Analogy

The analogy the user picked and where it breaks — or “no analogy”. Into the post per step 5 of the
skill; the GIF has none.

## Transfer

The same trick on another case, in one sentence. Into the post per step 5 of the skill.

## Layout

By lesson type: “why” → `stage`, “how it works” → `actors`, “how they differ” → `actors` with two
`Sketch.frame` panels. If in “why” the first board line appears only in the last third of the GIF
(benefits after the fix), use the tall sheet `chrome.actors`: in `stage` the field below the sheet
stays empty until then. Step captions then sit below the diagram, and the benefits take their place
as a list. What we do not draw, though it is true: one line, so that the diagram holds only the key
points.

## Facts

- <fact> — source: <run in `research/`: script, command, file and line | URL, section, date,
  quote> — verified: <how>

Numbers without a source do not go here.

## Frame

- **Title:** the technique's name on one line, up to ~20 characters: `Transactional *outbox*`. The
  accent in `*asterisks*` gets a chalk line. Stands from frame 0.
- **Subtitle:** the question or problem the GIF answers, up to ~40 characters:
  `How a transfer survives a crash`. Stands from frame 0 under the title.
- **Conclusion:** what the technique gives, in one line, up to 8 words and ~30 characters, the
  accent in `*asterisks*`. The last event.
- **Series** (if the post is from a numbered series): `1/30`, the number and the series length — in
  the GIF, “Day 1 of 30” and a tick strip.
- **Frame signature:** the “Frame signature” line of the brand profile; if there is no such line, no
  signature.
- **Theme:** `$B/theme.json` if the brand has one, otherwise the recipe's chalkboard.
- **Duration:** DUR = FADE + 0.7 by reading pace, no limit in seconds; fade 0.35 s; the conclusion
  holds for its characters / 16.5 + 1 s from the start of typing. After `gifpack`, up to 500 frames.

## Zones (stage and “why” on the tall sheet)

- **Scaffold** — stays until the conclusion: participants, question, findings, the prompt sheet with
  stickers.
- **Scenes** — one per step, each leaves at the start of the next: which objects carry the step's
  fact (replies, cards, a quote, a stamp), no digits.
- **Board** — one line per step or per benefit: the caption (the same as on the scene), cells by the
  number of runs and the score from “Facts”. The score lives only on the board. On the tall sheet,
  the benefits are a dark list in place of the step captions, without cells.

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
moves to the parts. 4–5 lines plus the conclusion: second — what appears — Sketch or Scene primitive,
with the character count next to it.

Pace: drawing starts no later than 0.5 s; the first event with text comes 0.5 s after the
participants are drawn; the next one comes when the current text has been read at 16.5 characters
per second from its appearance, and no earlier than the end of the motion + 0.5 s. The pause question
holds for its characters / 16.5 + 1.5 s, then the answer comes. In a “why” lesson each benefit is
first visible on the scene, then its line appears.

- 0.1 — <what> — <drawIn | text | cursor | fly | meter | counter | Scene.pop | place | out | seal | …>

## Post text

Hook variants — 3–4 first sentences on different `hook-writer` mechanisms, each with a line: the
mechanism and which problem it names. The user chooses at step 6; the chosen one goes into the text
below. Three paragraphs, up to 700 characters including hashtags; order and rules — step 5 of the
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

- [ ] Every event serves a key point; the rest is cut or recorded in “what we do not draw”.
- [ ] The whole system is visible at once before the GIF moves to the parts.
- [ ] Each part keeps its place from start to end: what stood on the left stays on the left.
- [ ] Each term appears with its object and explanation; each caption is next to its object.
- [ ] The meaning of a color is backed by a caption or a sign: the red $0 is labeled “crash”.
- [ ] One motion at a time, and each shows a cause, an order or where to look; no more than three
      flashes or outlines per second, no camera zooms.
- [ ] A “why” lesson has one failure and one fix; each benefit is visible on the scene before its line.
- [ ] The field below the sheet does not stay empty until the last third of the GIF: otherwise the
      layout is the tall sheet.
- [ ] The pause question comes before the outcome and holds according to the pace.
- [ ] A backend lesson shows the row status, the request and the response at every step where they
      change.
- [ ] Every number in the frame and the text has a line in “Facts”.

## After publishing

The GIF loops in the feed, the text on a phone is not cut under “…see more”,
<what else to check for this lesson>.
