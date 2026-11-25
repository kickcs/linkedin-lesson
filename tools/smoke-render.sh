#!/usr/bin/env bash
# End-to-end recipe check: a HyperFrames project from the skeleton, check, GIF render, gifpack, gifcheck and the loop seam
# usage: smoke-render.sh [dir] [stage|actors] [theme.json]
set -euo pipefail
here="$(cd "$(dirname "$0")/.." && pwd)"
R="$here/skills/linkedin-lesson/recipe"
HF="npx --yes hyperframes@0.9.19"
dir="${1:-$(mktemp -d)/smoke}"
layout="${2:-stage}"
theme="${3:-}"
case "$layout" in actors) dur=12.4 ;; stage) dur=26.68 ;; *) echo "unknown layout: $layout" >&2; exit 2 ;; esac
[ -n "$theme" ] && theme="$(cd "$(dirname "$theme")" && pwd)/$(basename "$theme")"
mkdir -p "$dir/assets" "$dir/compositions" "$dir/renders"
cd "$dir"
node "$R/bin/kit.mjs" assets/kit ${theme:+--theme "$theme"}
cp "$R/layouts/index.html" index.html
perl -pi -e "s/data-duration=\"12.4\"/data-duration=\"$dur\"/g" index.html
cp "$R/layouts/$layout.html" compositions/lesson.html
$HF check
$HF render --format gif --fps 15 --gif-loop 0 --output renders/smoke.gif
node "$R/bin/gifpack.mjs" renders/smoke.gif
node "$R/bin/gifcheck.mjs" renders/smoke.gif
end=$(awk "BEGIN { print $dur - 0.05 }")
$HF snapshot --at "0,$end"
d=$(ls -td .hyperframes/artifacts/snapshots/*/ | head -1)
cmp "${d}frame-00-at-0s.png" "${d}frame-01-at-${end}s.png"
echo "ok: $dir/renders/smoke.gif, seam matches"
