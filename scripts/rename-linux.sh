#!/bin/bash
# Rename Linux AppImage and signature
# - Replaces underscores with hyphens
# - Adds 'v' prefix to version number
# - Adds 'Linux' system type to filename

# Find the bundle directory (handles --target cross-compilation)
BUNDLE_DIR="src-tauri/target/release/bundle"
if [ ! -d "$BUNDLE_DIR" ]; then
  BUNDLE_DIR=$(find src-tauri/target -maxdepth 3 -type d -name "bundle" 2>/dev/null | head -1)
fi

echo "=== Linux Rename Script ==="
echo "Bundle dir: $BUNDLE_DIR"
ls -la "$BUNDLE_DIR" 2>/dev/null || echo "Bundle dir not found!"

find_count=0
find "$BUNDLE_DIR" \( -name "*.AppImage" -o -name "*.AppImage.sig" \) 2>/dev/null | while read -r file; do
  [ -f "$file" ] || continue
  dir=$(dirname "$file")
  base=$(basename "$file")
  newbase=$(echo "$base" \
    | sed 's/_\([0-9]\)/-v\1/g' \
    | sed 's/_/-/g' \
    | sed 's/\(-v[0-9][^-]*\)/\1-Linux/')
  if [ "$base" != "$newbase" ]; then
    mv "$file" "$dir/$newbase"
    echo "Renamed: $base -> $newbase"
  else
    echo "Skipped (no change): $base"
  fi
  find_count=$((find_count + 1))
done

echo "Total files processed: $find_count"
