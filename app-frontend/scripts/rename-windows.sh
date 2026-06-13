#!/bin/bash
# Rename Windows NSIS/MSI installers and signatures
# OrangeNote_1.0.0_x64-setup.exe -> OrangeNote-v1.0.0-x64-setup.exe
# OrangeNote_1.0.0_x64_en-US.msi -> OrangeNote-v1.0.0-x64-en-US.msi
BUNDLE_DIR="app-frontend/src-tauri/target/release/bundle"

if [ -d "$BUNDLE_DIR" ]; then
  find "$BUNDLE_DIR" \( -name "*.exe" -o -name "*.exe.sig" -o -name "*.msi" -o -name "*.msi.sig" \) | while read -r file; do
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
