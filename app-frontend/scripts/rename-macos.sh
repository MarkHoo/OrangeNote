#!/bin/bash
# Rename macOS DMG and signature
# OrangeNote_1.0.0_aarch64.dmg -> OrangeNote-v1.0.0-aarch64.dmg
# OrangeNote_1.0.0_x64.dmg -> OrangeNote-v1.0.0-x64.dmg
BUNDLE_DIR="app-frontend/src-tauri/target/release/bundle"

if [ -d "$BUNDLE_DIR" ]; then
  find "$BUNDLE_DIR" -name "*.dmg" -o -name "*.dmg.sig" | while read -r file; do
    [ -f "$file" ] || continue
    dir=$(dirname "$file")
    base=$(basename "$file")
    newbase=$(echo "$base" | sed 's/_\([0-9]\)/-v\1/g' | sed 's/_/-/g')
    if [ "$base" != "$newbase" ]; then
      mv "$file" "$dir/$newbase"
      echo "Renamed: $base -> $newbase"
    fi
  done
fi
