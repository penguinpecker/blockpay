#!/usr/bin/env bash
#
# Build blockpay.zip for upload via WP admin > Plugins > Add New > Upload Plugin.
#
# Usage:
#   bash build.sh
#
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC_DIR="$HERE/blockpay"
OUT_ZIP="$HERE/blockpay.zip"

if [ ! -d "$SRC_DIR" ]; then
  echo "build.sh: source directory not found: $SRC_DIR" >&2
  exit 1
fi

# Copy LICENSE into the plugin folder so it ships inside the zip too.
if [ -f "$HERE/LICENSE" ]; then
  cp "$HERE/LICENSE" "$SRC_DIR/LICENSE"
fi

# Remove any previous build.
rm -f "$OUT_ZIP"

if ! command -v zip >/dev/null 2>&1; then
  echo "build.sh: 'zip' command not found on PATH; cannot build $OUT_ZIP" >&2
  echo "          Install zip (e.g. 'brew install zip' on macOS) and re-run." >&2
  exit 2
fi

# Build the zip with the top-level 'blockpay/' folder preserved.
cd "$HERE"
zip -r -q "$OUT_ZIP" "blockpay" \
  -x "blockpay/.DS_Store" \
  -x "blockpay/**/.DS_Store" \
  -x "blockpay/node_modules/*" \
  -x "blockpay/.git/*"

echo "Built $OUT_ZIP"
ls -lh "$OUT_ZIP"
