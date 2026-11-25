---
name: linkedin-lesson
description: >-
  Use when the user asks for a LinkedIn lesson, a LinkedIn post with a GIF, or an animated
  explainer: a short English post with a GIF that teaches one technical concept from AI or backend
  to a mixed feed.
---

# LinkedIn lesson

Orchestrator: a short educational post in English and a GIF lesson built with this skill's recipe
(`recipe/`). `brand-profile` and `voice-builder` provide the voice, `hook-writer` and `no-ai-slop` the text,
`hyperframes` with the recipe the GIF. At each step, load the named skill with your agent's skill
mechanism (in Claude Code, the Skill tool) and follow it; this file records only what ties them
together. `brand-profile`, `voice-builder` and `hook-writer` come from the same repository as this skill
(`npx skills add kickcs/linkedin-lesson`). `hyperframes` and `no-ai-slop` are installed separately: `npx skills add heygen-com/hyperframes` and
`npx skills add petergyang/no-ai-slop`. If a required skill is missing, give the user the install
command and stop at this step.

The viewer is the mixed LinkedIn feed: an engineer and a person who does not know the topic. Either
of them understands the lesson's key points, while the real parts of the system and the terms stay in
the frame and are explained in plain words.

The user has three checkpoints: the topic (step 2, if they did not bring an idea), the story (step 3)
and the lesson card with the hook choice (step 6). The exception is the first run: step 1 asks for
the brand name and whatever is missing from the profile. Do everything else yourself.

Paths:

- `$S` — this skill's folder (where this `SKILL.md` lives);
- `$R` — the recipe `$S/recipe/`: engine, skeletons, checks in `bin/`, the GIF look in `frame.md`;
- `$B` — the brand `~/.media/brands/<brand>/`;
- `$P` — posts: `posts/` in the current folder, unless the user named another one.

## Step 1. Foundation

Brand files in `$B`:

- `brand-profile.md` — who, for whom, how it sounds, what it does not say;
- `voice.md` — the voice taken from real texts;
- `linkedin.md` — the log: date, folder, idea, layout, hook, accepted or rejected, reach;
- `ideas.md` — the idea bank.

If the folder exists, load the files and summarize the profile and the voice in two lines. If there
are several brands, ask which one the post is for.

If `brand-profile.md` does not exist, ask for the brand name (the folder name in Latin letters) and
call `brand-profile`; the profile goes to `$B/brand-profile.md`, not into the current folder. Build
the draft from what is already known: the agent's memory, the instructions file (`AGENTS.md`,
`CLAUDE.md`), past posts. Ask only for what is missing. In
Guardrails write: posts in English, no emoji, a question only as the hook (no closing question to
the reader), only verified numbers. Under Operational defaults, next to Visual identity, add
`- **Frame signature:** <name>`, the name signed at the bottom of every GIF; ask for it, and leave the
line out if the user wants none. Create `linkedin.md` with the table header and an empty `ideas.md`.

The look of the GIF is the recipe's chalkboard by default. If the user wants their own colors, fonts
or a cleaner stroke, now or at any later lesson, write `$B/theme.json` following `$R/theme.md` (the
profile's Visual identity is a starting point), take a key frame with it (the step 6 command) and
show it before going on.

Build `$B/voice.md` with `voice-builder` once there are three or more texts that the user wrote or
edited themselves. Until then, the Voice section of the profile sets the voice.

Done when the profile is loaded and summarized, and `voice.md` is loaded or its absence is explained
in one line.

## Step 2. Topic — checkpoint

If the user brought an idea, take it and do not ask.

Otherwise offer 3–5 topics from `$B/ideas.md` and from AI and backend concepts that continue past
lessons in `linkedin.md`. A topic is one line: the concept and the lesson type (step 3). Filter out
what is already in `linkedin.md`. Append the topics not chosen to `ideas.md`.

A broad topic (“vector databases”, “what an AI engineer is”) is an area, not a lesson: offer
3–4 angles, each with its own scenario and lesson type, and let the user choose. Append the angles
not chosen to `ideas.md`.

Done when a topic or an angle is chosen.

## Step 3. Story — checkpoint

The story is the lesson, told to the user in plain words in the user's language before any card or
frame. Only the user confirms understanding: an approved card, the checks and a subagent's retelling
find frame errors, but they do not prove that the viewer will understand the lesson.

Decide five things:

- **Lesson type** — the question the GIF answers. The type sets the flow:
  - “why” (a pattern, a trick): the usual way → one failure → the fix, where the term is first named →
    2–3 benefits, each visible on the scene before its line. One failure and one fix per lesson;
  - “how it works” (a mechanism): the whole system at once → the parts in order → what this gives;
  - “how they differ” (a comparison): both sides on screen the whole time, compared on one axis at a
    time.
- **Key points** — up to three claims that the viewer takes away from the GIF without reading the
  post: why the technique is needed, what it gives, how it works.
- **Scenario** — one concrete case on the real parts of the system: “$100 to Anna”, “a shopper
  asks about open-ear headphones”. The parts go by their real names (Database, Worker). The
  scenario's outcome is clear without knowing the technique: “Anna got $0” is clear to everyone, the
  chain “timeout → rollback → retry” only to an engineer.
- **Pause question** — one question to the viewer before the outcome the lesson exists for: in “why”,
  before the failure's outcome (“How much does Anna get?”); in “how it works”, before the result of
  the last part; in “how they differ”, before the result of the second side. The viewer guesses
  first, then sees the answer.
- **Analogy** and **transfer** — for the story and, if needed, for the post text (step 5); the GIF
  has neither:
  - the analogy: three candidates from different areas (things, relationships between people,
    everyday tasks), each with a note on where it breaks. The analogy leads to the real parts and
    does not replace them; if none holds up, the lesson goes without one;
  - the transfer is the same trick on another case, in one sentence: “Same trick: the welcome email
    after signup.”

Show the user the text, without frames:

1. the lesson type;
2. the key points;
3. the scenario;
4. the GIF's flow — one line per step, the pause question in its place;
5. three analogies, each with the place where it breaks: the user picks one or none;
6. the transfer.

Ask whether the story makes it clear why the technique is needed. If not, rewrite the story: change
the scenario or the flow, not the wording.

Done when the user has said they understood why the technique is needed and has picked an analogy or
declined one.

## Step 4. Lesson card

Fill in `$B/drafts/<slug>-LESSON.md` following `$S/references/lesson-card.md`: the story sections
carry over as they are, the rest you write. The slug is 2–4 words in Latin letters, joined by
hyphens. The GIF look (field, fonts, palette, layout zones) is set by `$R/frame.md`; the card refers
to it and does not restate it.

Facts:

- Every number in the frame and in the text comes from a source recorded next to it in the card.
  Remove a number without a source or ask the user for one.
- A number from experience comes from a prototype run on real parts (database, model, server) in
  `$P/<YYYY-MM-DD>-<slug>/research/`: create the post folder at this step. The run repeats with one
  command; randomness comes from a recorded seed. In the card: script, command, output file and line
  or field.
- A model answer in the frame is a verbatim piece of the run; “in 9 of 10” is a count over runs of
  the same request.
- A database row field, a request and a response in the frame (`status: pending`, `POST #42 $100`,
  `200 paid`) are verbatim from the prototype code; in “Facts”, the code file and line.
- Zero and “nothing” are numbers too and also need an output line. Do not merge two sources of one
  number: take one and name it.
- Verify commands, flags and names: `--help`, the file, the documentation.
- A fact from documentation: the page URL, section, date read and a verbatim quote; a number from
  documentation counts only if the quote containing it is recorded.

Done when all card sections are filled in, every fact has a source and the card's “Pre-approval
check” section is passed.

## Step 5. Post text

The post is a practitioner's account in three paragraphs, up to 700 characters including hashtags.
The model is `$S/examples/outbox/post.txt` (the lesson's final frame `frame.png` and composition
`lesson.html` sit next to it); run numbers
and the transfer go into the post only if the paragraph is unclear without them.

1. **Observation** — what practice often leaves out at design time, and where it surfaces later:
   “A lot of problems come from edge cases and outages. We often don't plan for them when we design a
   service, and start thinking about them only after something breaks in production.” The first
   sentence is the hook. Each lesson has its own observation: the sentence above shows the
   paragraph's role, not text to copy.
2. **Problem** — the lesson's scenario, the same one as in the GIF, and its outcome in plain words:
   “…the bank never gets the request, and Anna gets $0.”
3. **Solution** — “To solve this, we can use <technique>.”, how it works in 2–3 sentences and what
   it costs. In “how it works” and “how they differ”, the paragraph opens with a sentence in the same
   role: what the mechanism does, which side to pick when.

The analogy and the transfer go in as one sentence, only if the paragraph is unclear without them.
Hashtags — up to three, on the last line, if needed.

Hook: call `hook-writer` — 3–4 variants of the first sentence, each on a different mechanism from its
taxonomy, each a practitioner's observation. The number of variants and the 80-character limit come
from this skill, not from `hook-writer`; for a series post the limit is 80 including the label
“Day N/30 of explaining AI.”, that is ~53 characters for the hook. The hook names the problem, not
the solution: the solution is in the third paragraph. It does not repeat the frame title verbatim. A
question is allowed only as the hook and only a concrete one, not yes/no (“What does your AI app send
to an MCP server before it runs a tool?”): the paragraphs below and the GIF answer it. Put the
variants, each with its mechanism, into the card, the recommended one first.

Run the text through `no-ai-slop` with the note “first sentence stays verbatim” (for a series post,
the label and the hook). A question passes only as the hook: after it, statements.

If the post is part of a numbered series, the first paragraph starts with a label like “Day 2/30 of
explaining AI.”, the hook is the next sentence, and the series hashtag goes on the last line. Take the
label and the hashtag from the previous post of the series (its folder is in `linkedin.md`), changing
only the number; for the first post of a series, ask for both.

Write the text with the recommended hook into the card and into `$B/drafts/<slug>-post.txt` and
check it (the body with each of the hook variants must pass too):

```bash
node $R/bin/postcheck.mjs $B/drafts/<slug>-post.txt
```

Do not show the user a text with `postcheck` errors: fix it and check again.

Done when the check passes without errors.

## Step 6. Approval — checkpoint

Take the key frame:

```bash
node $R/bin/preview.mjs --layout <stage|actors> --title "<title>" --sub "<subtitle>" \
  --end "<conclusion with an *accent*>" [--series <day>/<total>] [--sign "<signature from the profile>"] \
  [--theme $B/theme.json] --out $B/drafts/<slug>-frame.png
```

A “why” lesson on the tall sheet takes `--layout actors`. With a theme, `!` lines in stderr name text
colors with too little contrast: show them to the user along with the frame.

The preview prints the final font sizes: `title 35 (min 26), sub 15 (min 12), end 21 (min 17)`.
Exit code 3 — a line shrank below its threshold, and stderr names it: shorten it. Code 2 — bad
arguments: a two-line title together with a subtitle, three title lines, or a series not in the form
“day/total”. Code 1 — the PNG was not written or the fonts did not load; if the message says
“Chrome not found”, set `CHROME=/path/to/chrome`. If the frame could not be taken, show the card
without the frame and say so.

Show the user the card, the hook variants, the post text and the frame. Put edits into the card; do
not write the composition. Put the chosen hook into `post.txt` and check it with `postcheck`; if
none of the hooks suited the user, go through step 5 again and ask what is wrong: too dry, too
technical or not gripping.

Done when the user has approved the card and chosen a hook.

## Step 7. Build

The build starts after the card is approved. First `mkdir -p $P/<YYYY-MM-DD>-<slug>/ && cd
$P/<YYYY-MM-DD>-<slug>/`. The whole step runs from the project root: `mkdir`/`cp` from Wiring, the
ladder's `perl -pi` edits, `check`, `snapshot`, `render`.

Call `hyperframes` and hand it the card as a finished plan. In the request:

- the first line is “just build it, don't ask”: without it hyperframes asks its own questions and
  runs a second sketch review on top of step 6;
- the recipe is `$R`, the skill is `hyperframes`, the project is the current folder;
- the card is the plan: its key points and events become one scene in `compositions/lesson.html`;
- the title, subtitle, series and signature from the card go into
  `chrome.<layout>(s, "<title>", { sub: "<subtitle>", series: "<day>/<total>", sign: "<signature>" })`,
  the conclusion into `Sketch.conclusion(s, "<conclusion with an *accent*>", at, dur)`;
- build following the Wiring section of `$R/frame.md`: the kit goes into `assets/kit`
  (`$R/bin/kit.mjs` copies the kit, adds GSAP from npm and, with `--theme $B/theme.json`, the brand
  theme), `index.html` and the layout skeleton from `$R/layouts/`, `data-duration` in `index.html`
  equals the layout's DUR (Wiring step 2), no CDN; DUR = FADE + 0.7 from the card's events;
- the project is built bare: do not run `hyperframes init` or `skills update`, they update and clean
  the agent's global skills and write `AGENTS.md` and `CLAUDE.md` into the project; if the
  `hyperframes` skill insists on `init`, run it only with `HYPERFRAMES_SKIP_SKILLS=1`; do not save
  preferences: the values come from the recipe, and saving them would overwrite the user's defaults
  for other videos;
- the CLI version is pinned: `npx --yes hyperframes@0.9.19` in every command, also when `hyperframes`
  is installed as a plugin with its own launcher. Without a version `npx` takes the latest one, and a
  new check may fail on something the recipe has never been run against;
- render with `npx --yes hyperframes@0.9.19 render --format gif --fps 15 --gif-loop 0 --output renders/<slug>.gif`,
  immediately followed by `node $R/bin/gifpack.mjs renders/<slug>.gif`: it merges frames that change
  nothing; otherwise the reading pauses do not fit into LinkedIn's 250 frames.

`hyperframes` is a skill in the same session, not a separate executor: you build the project and edit
`compositions/lesson.html` yourself. Everything in the frame is drawn by the recipe's engine: Lucide
icons, rough.js strokes, the fonts and palette from `frame.md`; stock, game and generated images, and
your own frames made with Pillow or ffmpeg, do not go into the GIF. After editing, the file holds no
skeleton text or numbers that are not in the card: check by searching the file. In `stage`, set
`DUR` = FADE + 0.7 and the same number in `data-duration` of `index.html`: a skeleton with a
different DUR fails with an error that names the required number. Do not hard-code widths as
numbers: wrap a line that may not fit in `Sketch.fit`; use `Scene.under` for an underline,
`Scene.seal` for a stamp, `Scene.cells` for board cells.

`check` on 0.9.19 gives two expected warnings: `dead_stretch` (the motion runs as one clock tween
inside the SVG, and the check cannot see it) and `film_silent` (the GIF has no sound). The error
`non_deterministic_code` on `Math.random` means `assets/kit` has the wrong rough.js: run
`$R/bin/kit.mjs` again.

Move the card into the project as `LESSON.md` and the text as `post.txt`, and remove them from
`drafts/`. From then on, only `LESSON.md` changes.

Check the GIF:

```bash
node $R/bin/gifcheck.mjs renders/<slug>.gif
```

`gifcheck` checks the file size, the frame (1080×1350 or the fallback 720×900), the frame count (up
to 250, the LinkedIn limit), a duration of at least 8 s and the loop. `stat`, `open` and “looks fine”
do not replace it. A clean run prints one JSON line to stdout and nothing else: `!` and `✗` go to
stderr, so look at the exit code and stderr, not at the silence.

The 5 MB limit is hard (`✗`). The target is 4.5 MB: above it `gifcheck` prints `!` and still returns
0, but the ladder starts already at `!`. One move at a time, re-running render, `gifpack` and
`gifcheck` after each, until the `!` is gone: `--fps 12`; the 720×900 frame (two `perl -pi` edits
from the Wiring section of the recipe's `frame.md`, do not touch `viewBox`; after them gifcheck must
show 720×900, `data-width`/`data-height` alone are not enough: `check` gives
`root_dimensions_mismatch`). If it is still over 5 MB after that, deliver an MP4 of the same frame
and warn that the feed will show a player. Over 250 frames (`✗`) — `--fps 12`, then less motion:
fewer flights and less typing. Do not cut reading pauses for bytes or for frames: after `gifpack`
they cost neither.

Take snapshots with `npx --yes hyperframes@0.9.19 snapshot --at 0,<event ends>`: the times when each
event's drawing is finished, not their starts, otherwise the frame will be empty. Snapshots land in
`.hyperframes/artifacts/snapshots/<id>/`; each run has its own id. Frame 0 carries the title and the
subtitle; every number in the frame matches the card.

Always check the loop seam: `snapshot --at 0,<DUR−0.05>`; the first two PNGs (`frame-00` and
`frame-01`) must match byte for byte:

```bash
d=$(ls -td .hyperframes/artifacts/snapshots/*/ | head -1)
cmp "$d"frame-00-at-0s.png "$d"frame-01-at-<DUR−0.05>s.png
```

Otherwise something is left on screen at the loop point. `snapshot` adds the timeline-end frame by
itself; do not compare it.

The project's `frame.png` is the full final state of the GIF (all events and the conclusion), not the
empty preview frame from step 6. After the last render, take it from the GIF: the last frame no later
than `FADE − 0.3` (the lesson's FADE from `compositions/lesson.html`). `-ss` does not work: after
`gifpack` the pause before the fade is one long frame, and `-ss` lands on the first frame of the fade.

```bash
ffmpeg -loglevel error -y -i renders/<slug>.gif -vf "select='lte(t,<FADE−0.3>)'" -fps_mode passthrough -update 1 frame.png
```

The step 6 preview (`$B/drafts/<slug>-frame.png`) does not go into the project; it leaves `drafts/`
with the rest. Open `frame.png` and look: the title, subtitle, all events and the conclusion are in
place.

The GIF is watched on a phone, where the frame is about 400 px wide. Scale `frame.png` down and read
it:

```bash
ffmpeg -loglevel error -y -i frame.png -vf scale=400:-1 /tmp/<slug>-phone.png
```

Every caption on the scaled-down frame reads without zooming in; one that does not read gets
shortened or enlarged, and the build repeats from the render.

If `check` or the render fails, debug it with the `hyperframes-cli` skill if it is installed,
otherwise from `npx --yes hyperframes@0.9.19 <command> --help`.

Done when gifcheck passes without errors, frame 0 has the title and subtitle, the seam matched byte
for byte, the numbers are verified, and `frame.png` is taken from the GIF and read at 400 px.

## Step 8. Delivery

Reply to the user with:

- the GIF path and its size;
- the text from `post.txt`, ready to copy;
- upload it with the “photo” button (Media → Photo): uploaded as “video”, the GIF freezes;
- the link, if there is one, goes in the first comment;
- what to look at after publishing, from the card's “After publishing” section.

State the “photo” point as a fact, without “it should animate” or “check the preview”. MP4 is not a
workaround for a frozen GIF but the last move of the step 7 budget; a delivered MP4 is uploaded as a
video.

Append a line to `$B/linkedin.md`.

Done when the line is in the log.
