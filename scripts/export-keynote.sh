#!/bin/bash
# Slide pipeline, step 1 of 2 (macOS only — drives Keynote.app).
# Exports a .key deck to per-slide PNGs, then hands off to optimize-slides.mjs.
#
# Usage: scripts/export-keynote.sh <path/to/Lecture01.key> <deck-slug>
# Example: scripts/export-keynote.sh ../lectures_latest_keynote/lectures/Lecture01.key lecture-01
set -euo pipefail

KEY="$(cd "$(dirname "$1")" && pwd)/$(basename "$1")"
DECK="$2"
TMP="$(mktemp -d)/png"
mkdir -p "$TMP"

osascript <<EOF
tell application "Keynote"
  set theDoc to open POSIX file "$KEY"
  delay 1
  export theDoc to POSIX file "$TMP" as slide images with properties {image format:PNG, skipped slides:false}
  close theDoc saving no
end tell
EOF

node "$(dirname "$0")/optimize-slides.mjs" "$TMP" "$DECK"
rm -rf "$TMP"
