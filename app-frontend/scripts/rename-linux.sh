#!/bin/bash
# Rename Linux AppImage and signature
# OrangeNote_1.0.0_amd64.AppImage -> OrangeNote-v1.0.0-amd64.AppImage
BUNDLE_DIR="app-frontend/src-tauri/target/release/bundle/appimage"

if [ -d "$BUNDLE_DIR" ]; then
  for file in "$BUNDLE_DIR"/*.AppImage; do
    [ -f "$file" ] || continue
    newname=$(echo "$file" | sed 's/_\([0-9]\)/-v\1/g' | sed 's/_/-/g')
    if [ "$file" != "$newname" ]; then
      mv "$file" "$newname"
      echo "Renamed: $(basename "$file") -> $(basename "$newname")"
    fi
  done
  for file in "$BUNDLE_DIR"/*.AppImage.sig; do
    [ -f "$file" ] || continue
    newname=$(echo "$file" | sed 's/_\([0-9]\)/-v\1/g' | sed 's/_/-/g')
    if [ "$file" != "$newname" ]; then
      mv "$file" "$newname"
      echo "Renamed: $(basename "$file") -> $(basename "$newname")"
    fi
  done
fi
