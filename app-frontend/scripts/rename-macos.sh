#!/bin/bash
# Rename macOS DMG and signature
BUNDLE_DIR="app-frontend/src-tauri/target/release/bundle"

echo "=== macOS Rename Script ==="
echo "Bundle dir: $BUNDLE_DIR"
ls -la "$BUNDLE_DIR" 2>/dev/null || echo "Bundle dir not found!"

find_count=0
find "$BUNDLE_DIR" \( -name "*.dmg" -o -name "*.dmg.sig" \) 2>/dev/null | while read -r file; do
  [ -f "$file" ] || continue
  dir=$(dirname "$file")
  base=$(basename "$file")
  newbase=$(echo "$base" | sed 's/_\([0-9]\)/-v\1/g' | sed 's/_/-/g')
  if [ "$base" != "$newbase" ]; then
    mv "$file" "$dir/$newbase"
    echo "Renamed: $base -> $newbase"
  else
    echo "Skipped (no change): $base"
  fi
  find_count=$((find_count + 1))
done

echo "Total files processed: $find_count"
