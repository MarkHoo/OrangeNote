构建Windows的报错信息：

```text
       Built application at: D:\a\OrangeNote\OrangeNote\app-frontend\src-tauri\target\release\orange-note.exe
        Info Patching D:\a\OrangeNote\OrangeNote\app-frontend\src-tauri\target\release\orange-note.exe with bundle type information: msi
        Info Verifying wix package
 Downloading https://github.com/wixtoolset/wix3/releases/download/wix3141rtm/wix314-binaries.zip
        Info validating hash
        Info extracting WIX
        Info Target: x64
     Running candle for "D:\\a\\OrangeNote\\OrangeNote\\app-frontend\\src-tauri\\target\\release\\wix\\x64\\main.wxs"
     Running light to produce D:\a\OrangeNote\OrangeNote\app-frontend\src-tauri\target\release\bundle\msi\橙记_1.0.0_x64_en-US.msi
failed to bundle project `failed to run C:\Users\runneradmin\AppData\Local\tauri\WixTools314\light.exe`
       Error failed to bundle project `failed to run C:\Users\runneradmin\AppData\Local\tauri\WixTools314\light.exe`
Error: Command "tauri ["build"]" failed with exit code 1
```

构建macOS aarch64的报错信息：

```text
error: proc macro panicked
  --> src/lib.rs:47:14
   |
47 |         .run(tauri::generate_context!())
   |              ^^^^^^^^^^^^^^^^^^^^^^^^^^
   |
   = help: message: icon /Users/runner/work/OrangeNote/OrangeNote/app-frontend/src-tauri/icons/32x32.png is not RGBA

error: could not compile `orange-note` (lib) due to 1 previous error
failed to build app: failed to build app
       Error failed to build app: failed to build app
Error: Command "tauri ["build","--target","aarch64-apple-darwin"]" failed with exit code 1
```

构建macOS x86_64的报错信息：

```text
error: proc macro panicked
  --> src/lib.rs:47:14
   |
47 |         .run(tauri::generate_context!())
   |              ^^^^^^^^^^^^^^^^^^^^^^^^^^
   |
   = help: message: icon /Users/runner/work/OrangeNote/OrangeNote/app-frontend/src-tauri/icons/32x32.png is not RGBA

error: could not compile `orange-note` (lib) due to 1 previous error
failed to build app: failed to build app
       Error failed to build app: failed to build app
Error: Command "tauri ["build","--target","x86_64-apple-darwin"]" failed with exit code 1
```


构建ubuntu-22.04的报错信息：

```text
error: proc macro panicked
  --> src/lib.rs:47:14
   |
47 |         .run(tauri::generate_context!())
   |              ^^^^^^^^^^^^^^^^^^^^^^^^^^
   |
   = help: message: icon /home/runner/work/OrangeNote/OrangeNote/app-frontend/src-tauri/icons/32x32.png is not RGBA

error: could not compile `orange-note` (lib) due to 1 previous error
failed to build app: failed to build app
       Error failed to build app: failed to build app
Error: Command "tauri ["build"]" failed with exit code 1
```
