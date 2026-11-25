#!/usr/bin/env bash
# Renders the four ?shot= scenes with headless Chrome and saves them as JPEGs in screenshots/.
# Needs the local server running: node serve.ts 8131
set -euo pipefail
cd "$(dirname "$0")/.."
CHROME="${CHROME:-/c/Program Files/Google/Chrome/Application/chrome.exe}"
PORT="${PORT:-8131}"
TMP="$(mktemp -d)"
shoot() {
  local name="$1" scene="$2"
  timeout 60 "$CHROME" --headless=new --disable-gpu --hide-scrollbars --user-data-dir="$TMP/profile-$scene" \
    --window-size=1280,900 --virtual-time-budget=2500 --screenshot="$TMP/$scene.png" \
    "http://localhost:$PORT/?shot=$scene&seed=7" >/dev/null 2>&1 || true
  python -c "import sys; from PIL import Image; Image.open(sys.argv[1]).convert('RGB').crop((0, 0, 1280, 720)).save(sys.argv[2], quality=90)" "$TMP/$scene.png" "screenshots/$name"
  echo "$name $(wc -c < "screenshots/$name") bytes"
}
shoot 1-rush.jpg rush
shoot 2-serve.jpg serve
shoot 3-title.jpg title
shoot 4-end.jpg end
