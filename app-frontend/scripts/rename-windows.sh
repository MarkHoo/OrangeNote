#!/bin/bash
# Rename Windows NSIS installer and signature
# OrangeNote_1.0.0_x64-setup.exe -> OrangeNote-v1.0.0-x64-setup.exe
BUNDLE_DIR="app-frontend/src-tauri/target/release/bundle/nsis"

if [ -d "$BUNDLE_DIR" ]; then
  for file in "$BUNDLE_DIR"/*.exe; do
    [ -f "$file" ] || continue
    newname=$(echo "$file" | sed 's/_\([0-9]\)/-v\1/g' | sed 's/_/-/g')
    if [ "$file" != "$newname" ]; then
      mv "$file" "$newname"
      echo "Renamed: $(basename "$file") -> $(basename "$newname")"
    fi
  done
  for file in "$BUNDLE_DIR"/*.exe.sig; do
    [ -f "$file" ] || continue
    newname=$(echo "$file" | sed 's/_\([0-9]\)/-v\1/g' | sed 's/_/-/g')
    if [ "$file" != "$newname" ]; then
      mv "$file" "$newname"
      echo "Renamed: $(basename "$file") -> $(basename "$newname")"
    fi
  done
fi
