#!/usr/bin/env bash
# End-to-end recipe check: a HyperFrames project from a look's skeleton, check, GIF render, gifpack, gifcheck and the loop seam
# usage: smoke-render.sh [dir] [look/layout, e.g. board/stage, board/actors, cards/system; a bare layout is Board's] [theme.json]
set -euo pipefail
here="$(cd "$(dirname "$0")/.." && pwd)"
R="$here/skills/linkedin-lesson/recipe"
HF="npx --yes hyperframes@0.9.19"
dir="${1:-$(mktemp -d)/smoke}"
spec="${2:-board/stage}"
theme="${3:-}"
case "$spec" in */*) look="${spec%%/*}" layout="${spec#*/}" ;; *) look=board layout="$spec" ;; esac
# the skeleton's DUR is in its look.json
dur=$(node -e 'const l = require(process.argv[1]).layouts[process.argv[2]]; if (!l) process.exit(1); console.log(l)' "$R/looks/$look/look.json" "$layout" 2>/dev/null) \
  || { echo "unknown look or layout: $spec" >&2; exit 2; }
[ -n "$theme" ] && theme="$(cd "$(dirname "$theme")" && pwd)/$(basename "$theme")"
mkdir -p "$dir/assets" "$dir/compositions" "$dir/renders"
cd "$dir"
node "$R/bin/kit.mjs" assets/kit --look "$look" ${theme:+--theme "$theme"}
cp "$R/looks/$look/layouts/index.html" index.html
perl -pi -e "s/data-duration=\"12.4\"/data-duration=\"$dur\"/g" index.html
cp "$R/looks/$look/layouts/$layout.html" compositions/lesson.html
node "$R/bin/pace.mjs" .
$HF check
$HF render --format gif --fps 15 --gif-loop 0 --output renders/smoke.gif
node "$R/bin/gifpack.mjs" renders/smoke.gif
node "$R/bin/gifcheck.mjs" renders/smoke.gif
end=$(awk "BEGIN { print $dur - 0.05 }")
$HF snapshot --at "0,$end"
d=$(ls -td .hyperframes/artifacts/snapshots/*/ | head -1)
cmp "${d}frame-00-at-0s.png" "${d}frame-01-at-${end}s.png"
echo "ok: $look/$layout in $dir/renders/smoke.gif, seam matches"
