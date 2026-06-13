#!/bin/bash
# Rename macOS DMG and signature
# OrangeNote_1.0.0_aarch64.dmg -> OrangeNote-v1.0.0-aarch64.dmg
# OrangeNote_1.0.0_x64.dmg -> OrangeNote-v1.0.0-x64.dmg
BUNDLE_DIR="app-frontend/src-tauri/target/release/bundle/dmg"

if [ -d "$BUNDLE_DIR" ]; then
  for file in "$BUNDLE_DIR"/*.dmg; do
    [ -f "$file" ] || continue
    newname=$(echo "$file" | sed 's/_\([0-9]\)/-v\1/g' | sed 's/_/-/g')
    if [ "$file" != "$newname" ]; then
      mv "$file" "$newname"
      echo "Renamed: $(basename "$file") -> $(basename "$newname")"
    fi
  done
  for file in "$BUNDLE_DIR"/*.dmg.sig; do
    [ -f "$file" ] || continue
    newname=$(echo "$file" | sed 's/_\([0-9]\)/-v\1/g' | sed 's/_/-/g')
    if [ "$file" != "$newname" ]; then
      mv "$file" "$newname"
      echo "Renamed: $(basename "$file") -> $(basename "$newname")"
    fi
  done
fi
