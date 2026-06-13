#!/bin/bash
# Rename Windows NSIS/MSI installers and signatures
# OrangeNote_1.0.0_x64-setup.exe -> OrangeNote-v1.0.0-x64-setup.exe
# OrangeNote_1.0.0_x64_en-US.msi -> OrangeNote-v1.0.0-x64.msi

NSIS_DIR="app-frontend/src-tauri/target/release/bundle/nsis"
MSI_DIR="app-frontend/src-tauri/target/release/bundle/msi"

rename_files() {
  local dir="$1"
  local pattern="$2"
  [ -d "$dir" ] || return 0
  for file in "$dir"/$pattern; do
    [ -f "$file" ] || continue
    newname=$(echo "$file" | sed 's/_\([0-9]\)/-v\1/g' | sed 's/_/-/g')
    if [ "$file" != "$newname" ]; then
      mv "$file" "$newname"
      echo "Renamed: $(basename "$file") -> $(basename "$newname")"
    fi
  done
}

# NSIS installer
rename_files "$NSIS_DIR" "*.exe"
rename_files "$NSIS_DIR" "*.exe.sig"

# MSI installer
rename_files "$MSI_DIR" "*.msi"
rename_files "$MSI_DIR" "*.msi.sig"
