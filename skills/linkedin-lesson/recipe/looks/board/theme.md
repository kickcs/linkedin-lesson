# Theme

A brand's own colors, fonts and stroke roughness for the Board look. It lives in
`~/.media/brands/<brand>/theme.json` (`$B/theme.json`), so a skill update does not touch it. Without
it, the GIF uses the default chalkboard (`look.md`). Other looks take no theme. The geometry is not
themable: zones, font sizes and the 1080×1350 frame stay, because the preview thresholds and
`Sketch.fit` rely on them.

```json
{
  "colors": { "field": "#1b1f3b", "dim": "#3d4470", "chalk": "#7ee0ff", "soft": "#c9cde8" },
  "fonts": {
    "sans": { "family": "Inter", "file": "fonts/InterVariable.woff2", "weight": "100 900" },
    "hand": { "family": "Caveat", "file": "fonts/Caveat-Regular.ttf", "weight": "400" }
  },
  "rough": 0.4
}
```

- `colors` — keys of the palette in `look.md` (`colors:`), each `#rrggbb`; a key left out keeps its
  default. The ones that change the look most: `field` (background), `white` (title, subtitle,
  conclusion and board lines on the field), `chalk` (the accent line), `soft` (signature, board
  heading), `paper` (the sheet), `ink` and `sub` (text on the sheet). `dim` (empty board cells,
  series ticks) is a darker shade of the default field: a new `field` needs a new `dim`. An unknown
  key is an error that lists the known ones.
- `fonts` — by role: `sans` carries all content, `hand` the author's notes and signature, `mono`
  method names, requests and responses. `family` is any name, `file` a `.woff2`, `.woff`, `.ttf` or
  `.otf` path relative to `theme.json`, `weight` the weights the file covers: a range such as
  `"100 900"` for a variable font (the default), `"400"` for a static one, which the browser then
  thickens for bold. The font needs Latin glyphs and a license that allows embedding (SIL OFL fonts,
  such as most of Google Fonts, do).
- `rough` — scales the hand-drawn wobble of every stroke: 1 is the default, 0 draws clean lines, 2 at
  most.

Check a theme with the key frame before any build:

```bash
node $R/bin/preview.mjs --look board --layout stage --title "<title>" --sub "<subtitle>" --end "<conclusion>" \
  --theme $B/theme.json --out $B/drafts/theme-frame.png
```

An invalid file exits with 2 and names the problem. `!` lines in stderr name text colors with too
little contrast against their background (4.5:1 for text, 3:1 for colored words on the sheet): fix
them or show them to the user. A wider font shrinks long lines; exit 3 means a line fell below its
threshold. The build takes the theme through `$R/bin/kit.mjs assets/kit --look board --theme $B/theme.json`
(Wiring step 1 in `frame.md`).
