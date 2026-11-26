# Third-party material

## Bundled skills

`skills/brand-profile`, `skills/voice-builder` and `skills/hook-writer` are copied unmodified from
[social-media-skills/skills](https://github.com/social-media-skills/skills) at commit
`f28cef2b7067ec64e79c9d85421c022c06659e03` (2026-10-15). MIT License, Copyright (c) 2026 Frank
Heijdenrijk; the license text is in each skill folder as `LICENSE`. They mention sibling skills from
that repository that are not bundled here; install the full set from there if you want them.

## Skills installed separately

- [hyperframes](https://github.com/heygen-com/hyperframes) (Apache-2.0) renders the GIF:
  `npx skills add heygen-com/hyperframes`.
- [no-ai-slop](https://github.com/petergyang/no-ai-slop) (MIT) edits the post text:
  `npx skills add petergyang/no-ai-slop`.

## Recipe kit

Each look's kit in `skills/linkedin-lesson/recipe/looks/<look>/kit/` lists its fonts and code with
their licenses in its `LICENSES.md`: Bricolage Grotesque, Shantell Sans, JetBrains Mono, rough.js and
Lucide icons in Board; Overpass, JetBrains Mono and Lucide icons in Cards. GSAP is not included: `recipe/bin/kit.mjs` downloads the pinned
version from npm when a lesson is built. GSAP is under GreenSock's Standard "No Charge" license,
<https://gsap.com/standard-license>.
