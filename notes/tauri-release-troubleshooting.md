# Tauri 2 多平台构建与发布 — 完整踩坑笔记

## 背景

OrangeNote 是一个基于 Tauri 2 的桌面便签应用，需要支持 Windows、macOS（Intel + Apple Silicon）、Linux（x64 + ARM64）五个平台的自动构建、打包、签名和自动更新。

本文档记录了从零搭建到完全跑通整个流程中遇到的所有问题和解决方案。

---

## 一、项目结构问题

### 问题：多余的 `app-frontend/` 嵌套

原始项目结构中，所有应用代码在 `app-frontend/` 子目录中，但 Tauri 标准结构要求 `src/`、`src-tauri/`、`package.json` 等在项目根目录。

### 解决

```bash
# 使用 git mv 移动所有文件到根目录
git mv app-frontend/package.json ./package.json
git mv app-frontend/src ./src
git mv app-frontend/src-tauri ./src-tauri
# ... 其他文件同理
```

### 注意事项

- 移动后需要更新所有路径引用（工作流、脚本、.gitignore）
- `tauri.conf.json` 中的相对路径（如 `../dist`）不需要修改
- `node_modules/` 和 `dist/` 用普通 `mv` 移动（不在 git 中）

---

## 二、GitHub Actions 工作流

### 2.1 构建矩阵设计

```yaml
matrix:
  include:
    - platform: windows-latest
      args: ''
    - platform: macos-latest
      args: '--target aarch64-apple-darwin'
    - platform: macos-latest
      args: '--target x86_64-apple-darwin'
    - platform: ubuntu-22.04
      args: ''
    - platform: ubuntu-24.04-arm
      args: ''
```

**关键点：**
- macOS 需要两个 job 分别构建 ARM64 和 x64
- Linux ARM64 使用 `ubuntu-24.04-arm` 原生 runner（不支持交叉编译 WebKitGTK）
- Windows 和 Linux 使用默认 target

### 2.2 macOS 交叉编译路径问题

**问题：** macOS 指定 `--target` 时，构建输出在 `target/aarch64-apple-darwin/release/bundle/` 而非 `target/release/bundle/`。

**解决：** 重命名脚本和上传步骤都需要处理两种路径：

```bash
BUNDLE="src-tauri/target/release/bundle"
if [ ! -d "$BUNDLE" ]; then
  BUNDLE=$(find src-tauri/target -maxdepth 3 -type d -name "bundle" | head -1)
fi
```

上传 glob 增加通配路径：
```yaml
files: |
  src-tauri/target/release/bundle/**/*.exe
  src-tauri/target/*/release/bundle/**/*.exe
```

### 2.3 "clean old release assets" 竞态条件

**问题：** 5 个并行 job 同时执行 `gh release view` + `gh release delete-asset`，导致 release 被意外删除。

**解决：** 完全移除此步骤。每个 tag 对应独立 release，不需要清理旧资产。

### 2.4 `softprops/action-gh-release` 文件上传

**问题：** `**/*.sig` glob 模式无法匹配嵌套目录中的签名文件。

**解决：** 先将所有文件收集到 `release/` 目录，再用 `release/*` 上传：

```bash
mkdir -p release
cp "$BUNDLE"/nsis/*.exe release/ 2>/dev/null || true
cp "$BUNDLE"/nsis/*.exe.sig release/ 2>/dev/null || true
# ... 其他类型同理
```

---

## 三、安装包命名

### 3.1 Tauri 默认命名

Tauri 生成的安装包名使用下划线分隔，且 MSI 包含 locale：
- `橙记_1.0.0_x64-setup.exe`
- `橙记_1.0.0_x64_en-US.msi`

### 3.2 重命名脚本

使用 sed 管道处理：

```bash
newbase=$(echo "$base" \
  | sed 's/_\([0-9]\)/-v\1/g' \    # _1 → -v1
  | sed 's/_/-/g' \                 # 剩余 _ → -
  | sed 's/-en-US//g' \            # 移除 locale
  | sed 's/\(-v[0-9][^-]*\)/\1-Windows/')  # 插入系统类型
```

**注意：** sed 的插入顺序很重要，必须先替换下划线再插入系统类型。

### 3.3 系统类型标识

最终命名格式：`OrangeNote-v{版本}-{系统}-{架构}.{ext}`

---

## 四、签名与自动更新

### 4.1 签名密钥生成

```bash
npx @tauri-apps/cli signer generate -w .tauri/key --password ""
```

生成两个文件：
- `.tauri/key` — 私钥（保密）
- `.tauri/key.pub` — 公钥（公开）

### 4.2 配置位置

| 配置项 | 位置 | 说明 |
|--------|------|------|
| 公钥 | `tauri.conf.json` → `plugins.updater.pubkey` | 客户端验证签名用 |
| 私钥 | GitHub Secret `TAURI_SIGNING_PRIVATE_KEY` | CI 构建签名用 |
| 密码 | GitHub Secret `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` | 可选 |

### 4.3 Tauri 构建不生成 .sig 文件

**问题：** 设置了 `TAURI_SIGNING_PRIVATE_KEY` 环境变量，但构建后没有 `.sig` 文件。

**根因：** `tauri-apps/tauri-action@v0` 可能不会自动传递环境变量给底层构建，或签名逻辑有差异。

**解决：** 在构建步骤后手动签名：

```yaml
- name: sign installers
  env:
    TAURI_SIGNING_PRIVATE_KEY: ${{ secrets.TAURI_SIGNING_PRIVATE_KEY }}
    TAURI_SIGNING_PRIVATE_KEY_PASSWORD: ${{ secrets.TAURI_SIGNING_PRIVATE_KEY_PASSWORD }}
  run: |
    find "$BUNDLE" \( -name "*.exe" -o -name "*.dmg" -o -name "*.AppImage" \) | while read f; do
      npx tauri signer sign "$f" --private-key "$TAURI_SIGNING_PRIVATE_KEY" --password "$TAURI_SIGNING_PRIVATE_KEY_PASSWORD"
    done
```

### 4.4 latest.json 生成

**问题：** `gh release download` 行为不可靠，多个 `--pattern` 可能不生效。

**解决：** 使用 GitHub API + curl：

```bash
# 获取资产列表
RELEASE_JSON=$(curl -sH "Authorization: token $TOKEN" "$API_URL")

# 解析并下载
echo "$RELEASE_JSON" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for asset in data.get('assets', []):
    if asset['name'].endswith('.exe') or ...:
        print(f'{asset[\"name\"]}\t{asset[\"browser_download_url\"]}')
" | while IFS=$'\t' read -r name url; do
  curl -sL -o "assets/$name" "$url"
done
```

### 4.5 签名文件缺失时的处理

**问题：** 如果 `.sig` 文件不存在，updater-manifest 会跳过所有平台，导致 `platforms: {}`。

**解决：** 签名为空时仍生成条目：

```bash
if [ -f "$sig" ]; then
  sig_content=$(cat "$sig" | tr -d '\n\r')
else
  sig_content=""  # 空签名，updater 仍可下载
fi
```

---

## 五、版本管理

### 5.1 版本号同步

每次发布前必须同步三个文件：
- `src-tauri/tauri.conf.json` → `"version"`
- `src-tauri/Cargo.toml` → `version`
- `package.json` → `"version"`

**教训：** 版本不一致会导致安装包名与 tag 不匹配，latest.json 搜索文件失败。

### 5.2 Release Body 版本

**问题：** Release body 中硬编码了 `v1.0.0`。

**解决：** 使用 `${{ github.ref_name }}` 动态引用 tag 名：

```yaml
body: |
  | Windows | x64 | `OrangeNote-${{ github.ref_name }}-Windows-x64-setup.exe` |
```

---

## 六、Dependabot 配置

### 问题

项目重构后 Dependabot 仍查找旧的 `/app-frontend` 目录。

### 解决

创建 `.github/dependabot.yml` 明确指定目录：

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
  - package-ecosystem: "cargo"
    directory: "/src-tauri"
  - package-ecosystem: "github-actions"
    directory: "/"
```

---

## 七、.gitignore 与 .gitattributes

### .gitignore

```gitignore
node_modules/
dist/
src-tauri/target/
src-tauri/WixTools*/
.tauri/          # 签名密钥
latest.json      # 本地生成的更新清单
```

### .gitattributes

防止 Git 损坏二进制文件：

```gitattributes
* text=auto
*.png binary
*.ico binary
*.icns binary
*.exe binary
*.msi binary
*.dmg binary
*.AppImage binary
*.sig binary
```

---

## 八、调试技巧

### 8.1 查看 CI 构建状态

```bash
# 获取最近的 workflow runs
curl -s "https://api.github.com/repos/{owner}/{repo}/actions/runs?per_page=3"

# 获取某个 run 的 job 详情
curl -s "https://api.github.com/repos/{owner}/{repo}/actions/runs/{run_id}/jobs"

# 检查 release 资产
curl -s "https://api.github.com/repos/{owner}/{repo}/releases/tags/{tag}"
```

### 8.2 验证 latest.json

```bash
curl -sL -H 'Accept: application/octet-stream' \
  "https://github.com/{owner}/{repo}/releases/download/{tag}/latest.json"
```

### 8.3 重新触发构建

```bash
# 删除旧 tag
git tag -d v1.0.0 && git push origin --delete v1.0.0
# 重新打 tag
git tag v1.0.0 && git push origin v1.0.0
```

---

## 九、完整发布流程 Checklist

```
1. [ ] 修改版本号（tauri.conf.json + Cargo.toml + package.json）
2. [ ] git add -A && git commit -m "chore: 发布 vX.Y.Z"
3. [ ] git push origin main
4. [ ] git tag vX.Y.Z && git push origin vX.Y.Z
5. [ ] 等待 CI 构建完成（约 8-10 分钟）
6. [ ] 验证 Release：6 个安装包 + 6 个 .sig
7. [ ] 验证 latest.json：5 个平台，签名非空
8. [ ] 验证 Release body：安装包名与实际一致
9. [ ] 测试自动更新：旧版本点击"检查更新"
```

---

## 十、时间线与版本记录

| 版本 | 主要变更 |
|------|---------|
| v1.0.0 | 初始版本，目录在 app-frontend/ |
| v1.0.1-v1.0.3 | 重构目录结构，修复 MSI locale，添加 Linux ARM64 |
| v1.0.4-v1.0.8 | 修复 latest.json 为空，修复 release 被删除 |
| v1.0.9 | latest.json 首次成功生成 5 个平台（无签名） |
| v1.1.0-v1.1.3 | 配置签名密钥，修复 .sig 文件缺失 |
| v1.1.4 | 签名文件首次成功生成，自动更新完全可用 |
| v1.1.5 | 验证版本 |
