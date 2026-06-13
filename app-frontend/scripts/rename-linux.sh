#!/bin/bash
# Rename Linux AppImage and signature
# OrangeNote_1.0.0_amd64.AppImage -> OrangeNote-v1.0.0-amd64.AppImage
BUNDLE_DIR="app-frontend/src-tauri/target/release/bundle"

if [ -d "$BUNDLE_DIR" ]; then
  find "$BUNDLE_DIR" \( -name "*.AppImage" -o -name "*.AppImage.sig" \) | while read -r file; do
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
