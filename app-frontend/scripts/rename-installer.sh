#!/bin/bash
# Rename installer: 橙记-v_1.0.0_x64-setup.exe -> 橙记-v1.0.0-x64-setup.exe
BUNDLE_DIR="src-tauri/target/release/bundle/nsis"

if [ -d "$BUNDLE_DIR" ]; then
  for file in "$BUNDLE_DIR"/*.exe; do
    if [ -f "$file" ]; then
      # Remove "v_" prefix pattern to "v", then replace remaining "_" with "-"
      newname=$(echo "$file" | sed 's/-v_/-v/g' | sed 's/_/-/g')
      if [ "$file" != "$newname" ]; then
        mv "$file" "$newname"
        echo "Renamed: $(basename "$file") -> $(basename "$newname")"
      fi
    fi
  done
fi
