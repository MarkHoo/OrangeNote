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
git mv app-frontend/package.json ./package.json
git mv app-frontend/src ./src
git mv app-frontend/src-tauri ./src-tauri
# ... 其他文件同理
rm -rf app-frontend
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

**解决：**

```bash
BUNDLE="src-tauri/target/release/bundle"
if [ ! -d "$BUNDLE" ]; then
  BUNDLE=$(find src-tauri/target -maxdepth 3 -type d -name "bundle" | head -1)
fi
```

### 2.3 "clean old release assets" 竞态条件

**问题：** 5 个并行 job 同时执行 `gh release view` + `gh release delete-asset`，导致 release 被意外删除。

**解决：** 完全移除此步骤。每个 tag 对应独立 release，不需要清理。

### 2.4 文件上传问题

**问题：** `softprops/action-gh-release` 的 `**/*.sig` glob 无法匹配嵌套目录中的签名文件。

**解决：** 先将所有文件收集到 `release/` 目录再上传：

```bash
mkdir -p release
cp "$BUNDLE"/nsis/*.exe release/ 2>/dev/null || true
cp "$BUNDLE"/nsis/*.exe.sig release/ 2>/dev/null || true
cp "$BUNDLE"/msi/*.msi release/ 2>/dev/null || true
# ... 其他类型同理
```

### 2.5 `gh release download` 不可靠

**问题：** 多个 `--pattern` 参数行为不一致，导致文件下载失败。

**解决：** 改用 GitHub API + curl：

```bash
RELEASE_JSON=$(curl -sH "Authorization: token $TOKEN" "$API_URL")
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

---

## 三、安装包命名

### 3.1 Tauri 默认命名

Tauri 生成的安装包名使用下划线分隔，且 MSI 包含 locale：
- `橙记_1.0.0_x64-setup.exe`
- `橙记_1.0.0_x64_en-US.msi`

### 3.2 重命名脚本

```bash
newbase=$(echo "$base" \
  | sed 's/_\([0-9]\)/-v\1/g' \
  | sed 's/_/-/g' \
  | sed 's/-en-US//g' \
  | sed 's/\(-v[0-9][^-]*\)/\1-Windows/')
```

**注意：** sed 的插入顺序很重要。

---

## 四、签名与自动更新

### 4.1 签名密钥生成

```bash
npx @tauri-apps/cli signer generate -w .tauri/key --password ""
```

### 4.2 配置位置

| 配置项 | 位置 | 说明 |
|--------|------|------|
| 公钥 | `tauri.conf.json` → `plugins.updater.pubkey` | 客户端验证签名用 |
| 私钥 | GitHub Secret `TAURI_SIGNING_PRIVATE_KEY` | CI 构建签名用 |
| 密码 | GitHub Secret `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` | 可选 |

### 4.3 Tauri 构建不生成 .sig 文件

**问题：** 设置了 `TAURI_SIGNING_PRIVATE_KEY` 环境变量，但构建后没有 `.sig` 文件。

**解决：** 在构建步骤后手动签名：

```yaml
- name: sign installers (Tauri updater)
  run: |
    find "$BUNDLE" \( -name "*.exe" -o -name "*.dmg" -o -name "*.AppImage" \) | while read f; do
      npx tauri signer sign "$f" --private-key "$TAURI_SIGNING_PRIVATE_KEY" --password "$TAURI_SIGNING_PRIVATE_KEY_PASSWORD"
    done
```

### 4.4 latest.json 生成

使用 GitHub API 获取资产列表，curl 下载，读取签名内容构建 JSON。

### 4.5 签名文件缺失时的处理

签名为空时仍生成条目，updater 可下载但跳过验证。

---

## 五、版本管理

### 5.1 版本号同步

每次发布前必须同步三个文件：
- `src-tauri/tauri.conf.json` → `"version"`
- `src-tauri/Cargo.toml` → `version`
- `package.json` → `"version"`

### 5.2 Release Body 版本

使用 `${{ github.ref_name }}` 动态引用 tag 名。

---

## 六、前端代码问题

### 6.1 版本号硬编码

**问题：** 设置页面版本号硬编码为 `v1.0.0`。

**解决：** 使用 Tauri API 动态获取：

```tsx
import { getVersion } from '@tauri-apps/api/app';

const [appVersion, setAppVersion] = useState('');
useEffect(() => {
  getVersion().then(setAppVersion).catch(() => {});
}, []);
```

### 6.2 TypeScript 编译错误

**问题：** 未使用的 `getName` 导入导致 `TS6133` 错误。

**解决：** 移除未使用的导入：

```tsx
// 错误
import { getName, getVersion } from '@tauri-apps/api/app';
// 正确
import { getVersion } from '@tauri-apps/api/app';
```

**预防：** 发布前运行 `npx tsc -b` 检查编译。

---

## 七、tauri.conf.json 配置问题

### 7.1 WiX 配置格式错误

**问题：** `majorUpgradeStrategy` 使用了对象格式 `{"installScope": "perMachine"}`，但 Tauri v2 要求字符串格式。

**解决：** 使用正确的字符串值：

```json
{
  "bundle": {
    "windows": {
      "wix": {
        "majorUpgradeStrategy": "installSameVersion"
      }
    }
  }
}
```

可用值：`"downgradeErrorMessage"`（默认）、`"installSameVersion"`

### 7.2 NSIS 配置位置错误

**问题：** `bundle.windows.nsis.installMode` 可能不是 Tauri v2 的有效配置。

**解决：** 移除不确定的配置，使用默认值。配置前验证 schema。

### 7.3 JSON 格式错误

**问题：** 尾逗号导致 JSON 解析失败。

**解决：** 发布前验证 JSON：

```bash
python -m json.tool src-tauri/tauri.conf.json > /dev/null
```

---

## 八、Windows SmartScreen 警告

### 问题

运行安装包时显示"Windows 已保护你的电脑"，因为安装包未代码签名。

### 解决

1. 购买代码签名证书（推荐 Sectigo/DigiCert，约 $200/年）
2. Base64 编码证书：
   ```bash
   base64 -i certificate.pfx -o certificate.txt
   ```
3. 添加 GitHub Secrets：
   - `WINDOWS_CERTIFICATE` — 编码后的证书
   - `WINDOWS_CERTIFICATE_PASSWORD` — 证书密码
4. 工作流自动使用 `signtool.exe` 签名

---

## 九、MSI 更新提示问题

### 问题

MSI 安装包更新时显示"确定要卸载本软件吗？"，用户体验差。

### 原因

WiX 的 `MajorUpgrade` 默认行为是先卸载旧版本再安装新版本。

### 解决

1. 推荐使用 NSIS 安装包（`.exe`），支持原地更新
2. 或配置 WiX：`"majorUpgradeStrategy": "installSameVersion"`

---

## 十、调试技巧

### 10.1 查看 CI 构建状态

```bash
curl -s "https://api.github.com/repos/{owner}/{repo}/actions/runs?per_page=3"
curl -s "https://api.github.com/repos/{owner}/{repo}/actions/runs/{run_id}/jobs"
```

### 10.2 验证 latest.json

```bash
curl -sL -H 'Accept: application/octet-stream' \
  "https://github.com/{owner}/{repo}/releases/download/{tag}/latest.json"
```

### 10.3 重新触发构建

```bash
git tag -d v1.0.0 && git push origin --delete v1.0.0
git tag v1.0.0 && git push origin v1.0.0
```

### 10.4 本地验证

```bash
# TypeScript 编译
npx tsc -b

# JSON 格式
python -m json.tool src-tauri/tauri.conf.json > /dev/null

# Rust 编译
cd src-tauri && cargo check
```

---

## 十一、完整发布流程 Checklist

```
1. [ ] 修改版本号（tauri.conf.json + Cargo.toml + package.json）
2. [ ] npx tsc -b 编译通过
3. [ ] python -m json.tool src-tauri/tauri.conf.json JSON 有效
4. [ ] git add -A && git commit -m "chore: 发布 vX.Y.Z"
5. [ ] git push origin main
6. [ ] git tag vX.Y.Z && git push origin vX.Y.Z
7. [ ] 等待 CI 构建完成（约 8-10 分钟）
8. [ ] 验证 Release：6 个安装包 + 6 个 .sig + latest.json
9. [ ] latest.json 包含 5 个平台且签名非空
10. [ ] 测试自动更新：旧版本点击"检查更新"
```

---

## 十二、版本时间线

| 版本 | 主要变更 |
|------|---------|
| v1.0.0 | 初始版本 |
| v1.0.1-v1.0.3 | 重构目录结构，修复 MSI locale，添加 Linux ARM64 |
| v1.0.4-v1.0.8 | 修复 latest.json 为空，修复 release 被删除 |
| v1.0.9 | latest.json 首次成功生成 5 个平台（无签名） |
| v1.1.0-v1.1.3 | 配置签名密钥，修复 .sig 文件缺失 |
| v1.1.4 | 签名文件首次成功生成，自动更新完全可用 |
| v1.1.5 | 验证版本 |
| v1.1.6 | 修复版本号动态获取、WiX 配置、TypeScript 编译 |
