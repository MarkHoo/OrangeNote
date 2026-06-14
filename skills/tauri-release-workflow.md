# Tauri 2 多平台构建与自动更新 — 技能速查

## 核心流程

```
代码修改 → 版本同步 → TypeScript 编译检查 → git tag → GitHub Actions 自动构建
→ 签名 → 重命名 → 上传 Release → 生成 latest.json → 用户端自动更新
```

---

## 1. 版本同步（必须在打 tag 前完成）

三个文件的版本号必须一致：

| 文件 | 字段 |
|------|------|
| `src-tauri/tauri.conf.json` | `"version": "x.y.z"` |
| `src-tauri/Cargo.toml` | `version = "x.y.z"` |
| `package.json` | `"version": "x.y.z"` |

版本号必须与 git tag 一致（去掉 `v` 前缀）。

---

## 2. 发布命令

```bash
# 1. 修改版本号（三个文件）
# 2. TypeScript 编译检查
npx tsc -b
# 3. 提交
git add -A && git commit -m "chore: 发布 vX.Y.Z"
# 4. 推送代码
git push origin main
# 5. 打 tag 并推送（触发 CI 构建）
git tag vX.Y.Z && git push origin vX.Y.Z
```

---

## 3. GitHub Actions 工作流结构

文件：`.github/workflows/release.yml`

### 构建矩阵（5 个平台）

| Runner | 平台 | 架构 | 产物 |
|--------|------|------|------|
| `windows-latest` | Windows | x64 | `.exe` + `.msi` |
| `macos-latest` | macOS | ARM64 | `.dmg` |
| `macos-latest` | macOS | x64 | `.dmg` |
| `ubuntu-22.04` | Linux | x86_64 | `.AppImage` |
| `ubuntu-24.04-arm` | Linux | ARM64 | `.AppImage` |

### 构建步骤

```
checkout → setup rust → rust cache → setup node → install deps → npm ci
→ tauri build → rename installers → sign installers (Tauri updater)
→ Windows code signing → collect release files → upload
```

### 关键配置

- **交叉编译路径**：`--target` 指定时，输出在 `target/<arch>/release/bundle/`
- **签名**：构建后用 `npx tauri signer sign` 手动生成 `.sig` 文件
- **上传**：先收集到 `release/` 目录再统一上传

---

## 4. 安装包命名规范

格式：`OrangeNote-v{版本}-{系统}-{架构}-{类型}.{ext}`

| 系统 | 示例 |
|------|------|
| Windows | `OrangeNote-v1.1.6-Windows-x64-setup.exe` |
| Windows | `OrangeNote-v1.1.6-Windows-x64.msi` |
| macOS | `OrangeNote-v1.1.6-macOS-aarch64.dmg` |
| macOS | `OrangeNote-v1.1.6-macOS-x64.dmg` |
| Linux | `OrangeNote-v1.1.6-Linux-amd64.AppImage` |
| Linux | `OrangeNote-v1.1.6-Linux-aarch64.AppImage` |

---

## 5. 签名密钥配置

### 生成密钥对

```bash
npx @tauri-apps/cli signer generate -w .tauri/key --password ""
```

### 配置

| 位置 | 内容 |
|------|------|
| `src-tauri/tauri.conf.json` → `plugins.updater.pubkey` | 公钥 |
| GitHub Secret `TAURI_SIGNING_PRIVATE_KEY` | 私钥 |
| GitHub Secret `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` | 密码（可选） |

### 注意

- 私钥文件 `.tauri/key` 必须加入 `.gitignore`
- 公钥放在 `tauri.conf.json` 中可公开

---

## 6. Windows 代码签名（消除 SmartScreen 警告）

| Secret 名称 | 内容 |
|-------------|------|
| `WINDOWS_CERTIFICATE` | Base64 编码的 `.pfx` 证书 |
| `WINDOWS_CERTIFICATE_PASSWORD` | 证书密码 |

```bash
# 编码证书
base64 -i certificate.pfx -o certificate.txt
```

---

## 7. 自动更新机制（latest.json）

### 更新器端点

```
https://github.com/{owner}/{repo}/releases/latest/download/latest.json
```

### latest.json 结构

```json
{
  "version": "1.1.6",
  "notes": "更新说明",
  "pub_date": "2026-06-14T12:00:00Z",
  "platforms": {
    "windows-x86_64": {"signature": "...", "url": "...exe"},
    "darwin-aarch64": {"signature": "...", "url": "...dmg"},
    "darwin-x86_64": {"signature": "...", "url": "...dmg"},
    "linux-x86_64": {"signature": "...", "url": "...AppImage"},
    "linux-aarch64": {"signature": "...", "url": "...AppImage"}
  }
}
```

### 平台标识符

| Tauri 平台 | 对应系统 |
|------------|---------|
| `windows-x86_64` | Windows x64 |
| `darwin-aarch64` | macOS Apple Silicon |
| `darwin-x86_64` | macOS Intel |
| `linux-x86_64` | Linux x64 |
| `linux-aarch64` | Linux ARM64 |

### updater-manifest 生成逻辑

1. GitHub API 获取 release 资产列表
2. curl 逐个下载二进制文件和 `.sig` 签名文件
3. 按文件名模式匹配平台
4. 读取签名内容，构建 JSON
5. 上传到 release

---

## 8. 前端版本号动态获取

```tsx
import { getVersion } from '@tauri-apps/api/app';

const [appVersion, setAppVersion] = useState('');
useEffect(() => {
  getVersion().then(setAppVersion).catch(() => {});
}, []);

// 显示
<p>{t('settings.version')} v{appVersion}</p>
```

---

## 9. tauri.conf.json 关键配置

```json
{
  "productName": "OrangeNote",
  "version": "1.1.6",
  "identifier": "com.orange-note.app",
  "bundle": {
    "active": true,
    "targets": ["nsis", "msi", "dmg", "appimage"],
    "icon": ["icons/32x32.png", "icons/128x128.png", "icons/128x128@2x.png", "icons/icon.icns", "icons/icon.ico"]
  },
  "plugins": {
    "updater": {
      "pubkey": "公钥内容",
      "endpoints": ["https://github.com/{owner}/{repo}/releases/latest/download/latest.json"]
    }
  }
}
```

**注意：** `bundle.windows` 下的 `nsis` 和 `wix` 配置需要验证 Tauri v2 schema，不正确的值会导致构建失败。

---

## 10. Dependabot 配置

文件：`.github/dependabot.yml`

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
  - package-ecosystem: "cargo"
    directory: "/src-tauri"
    schedule:
      interval: "weekly"
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
```

---

## 11. 常见问题速查

| 问题 | 原因 | 解决 |
|------|------|------|
| TypeScript 编译失败 | 未使用的导入 | 移除 `import { getName }` |
| macOS DMG 缺失 | `--target` 输出路径不同 | 脚本自动检测 bundle 目录 |
| latest.json platforms 为空 | `.sig` 文件未上传 | 构建后手动生成签名 |
| Release 被删除 | clean 步骤竞态条件 | 移除 clean 步骤 |
| 安装包版本与 tag 不一致 | 配置文件版本未同步 | 打 tag 前同步三个文件 |
| `gh release download` 不可靠 | 多 `--pattern` 兼容问题 | 改用 GitHub API + curl |
| WiX 构建失败 | `bundle.windows` 配置格式错误 | 验证 schema 或移除自定义配置 |
| SmartScreen 警告 | 安装包未代码签名 | 配置 WINDOWS_CERTIFICATE Secret |
| MSI 更新提示"卸载" | WiX 升级配置问题 | 使用 NSIS 或配置 WiX majorUpgrade |

---

## 12. 完整发布检查清单

- [ ] 三个配置文件版本号一致
- [ ] `npx tsc -b` 编译通过
- [ ] `python -m json.tool src-tauri/tauri.conf.json` JSON 有效
- [ ] `TAURI_SIGNING_PRIVATE_KEY` GitHub Secret 已配置
- [ ] `.tauri/` 在 `.gitignore` 中
- [ ] 代码已提交并推送到 main
- [ ] tag 已推送并触发构建
- [ ] 构建完成验证：6 个安装包 + 6 个 .sig + latest.json
- [ ] latest.json 包含 5 个平台且签名非空
- [ ] Release body 中的安装包名与实际一致
