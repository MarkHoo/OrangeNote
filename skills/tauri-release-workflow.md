# Tauri 2 多平台构建与自动更新 — 技能速查

## 核心流程

```
代码修改 → 版本同步 → git tag → GitHub Actions 自动构建 → 重命名安装包 → 签名 → 上传 Release → 生成 latest.json
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
# 2. 提交
git add -A && git commit -m "chore: 发布 vX.Y.Z"
# 3. 推送代码
git push origin main
# 4. 打 tag 并推送（触发 CI 构建）
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
→ tauri build → rename installers → sign installers → collect files → upload
```

### 关键配置

- **交叉编译路径**：`--target` 指定时，输出在 `target/<arch>/release/bundle/` 而非 `target/release/bundle/`
- **签名**：构建后用 `npx tauri signer sign` 手动生成 `.sig` 文件
- **上传**：先收集到 `release/` 目录再统一上传，避免 glob 路径问题

---

## 4. 安装包命名规范

格式：`OrangeNote-v{版本}-{系统}-{架构}-{类型}.{ext}`

| 系统 | 示例 |
|------|------|
| Windows | `OrangeNote-v1.1.5-Windows-x64-setup.exe` |
| Windows | `OrangeNote-v1.1.5-Windows-x64.msi` |
| macOS | `OrangeNote-v1.1.5-macOS-aarch64.dmg` |
| macOS | `OrangeNote-v1.1.5-macOS-x64.dmg` |
| Linux | `OrangeNote-v1.1.5-Linux-amd64.AppImage` |
| Linux | `OrangeNote-v1.1.5-Linux-aarch64.AppImage` |

重命名脚本（`scripts/`）处理 Tauri 默认命名：
- 下划线 → 连字符
- 添加 `v` 前缀
- 移除 locale（如 `-en-US`）
- 添加系统类型标识

---

## 5. 签名密钥配置

### 生成密钥对

```bash
npx @tauri-apps/cli signer generate -w .tauri/key --password ""
```

### 配置

| 位置 | 内容 |
|------|------|
| `src-tauri/tauri.conf.json` → `plugins.updater.pubkey` | 公钥（`.tauri/key.pub` 内容） |
| GitHub Secret `TAURI_SIGNING_PRIVATE_KEY` | 私钥（`.tauri/key` 内容） |
| GitHub Secret `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` | 密码（空则不设置） |

### Windows 代码签名（消除 SmartScreen 警告）

| Secret 名称 | 内容 |
|-------------|------|
| `WINDOWS_CERTIFICATE` | Base64 编码的 `.pfx` 证书文件 |
| `WINDOWS_CERTIFICATE_PASSWORD` | 证书密码 |

获取证书后编码：
```bash
base64 -i certificate.pfx -o certificate.txt
```

### 注意事项

- 私钥文件 `.tauri/key` 必须加入 `.gitignore`，绝不能提交
- 公钥可以公开，放在 `tauri.conf.json` 中
- 私钥泄露后必须重新生成

---

## 6. 自动更新机制（latest.json）

### 更新器端点

```
https://github.com/{owner}/{repo}/releases/latest/download/latest.json
```

### latest.json 结构

```json
{
  "version": "1.1.5",
  "notes": "橙记 v1.1.5 — 更新说明",
  "pub_date": "2026-06-14T12:00:00Z",
  "platforms": {
    "windows-x86_64": {
      "signature": "base64签名",
      "url": "https://github.com/.../OrangeNote-v1.1.5-Windows-x64-setup.exe"
    },
    "darwin-aarch64": { "signature": "...", "url": "...dmg" },
    "darwin-x86_64": { "signature": "...", "url": "...dmg" },
    "linux-x86_64": { "signature": "...", "url": "...AppImage" },
    "linux-aarch64": { "signature": "...", "url": "...AppImage" }
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

1. 通过 GitHub API 获取 release 资产列表
2. 用 curl 逐个下载二进制文件和 `.sig` 签名文件
3. 按文件名模式匹配平台（如 `*Windows*.exe`）
4. 读取签名内容，构建 JSON
5. 上传到 release

---

## 7. Dependabot 配置

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

## 8. .gitignore 要点

```gitignore
# 构建产物
node_modules/
dist/
src-tauri/target/

# 签名密钥（绝不能提交）
.tauri/

# 本地生成的 latest.json
latest.json
```

---

## 9. 常见问题速查

| 问题 | 原因 | 解决 |
|------|------|------|
| macOS DMG 缺失 | `--target` 输出到 `target/<arch>/release/bundle/` | 重命名脚本自动检测 bundle 目录 |
| latest.json platforms 为空 | `.sig` 文件未上传 | 构建后手动生成签名 |
| Release 被删除 | "clean old release assets" 竞态条件 | 移除该步骤 |
| 安装包版本与 tag 不一致 | 配置文件版本未同步 | 打 tag 前同步三个文件版本号 |
| 安装包名含 locale | Tauri 默认命名含 `en-US` | 重命名脚本 sed 移除 |
| `gh release download` 不可靠 | 多 `--pattern` 兼容问题 | 改用 GitHub API + curl |
| `find` 命令在 CI 失败 | 路径不存在导致 exit 1 | 先检测目录再 find |
| updater-manifest 找不到文件 | `gh release download` 行为不一致 | 改用 API 获取资产列表再 curl 下载 |

---

## 10. 完整发布检查清单

- [ ] 三个配置文件版本号一致
- [ ] 版本号与计划的 tag 一致
- [ ] `TAURI_SIGNING_PRIVATE_KEY` GitHub Secret 已配置
- [ ] `.tauri/` 在 `.gitignore` 中
- [ ] 代码已提交并推送到 main
- [ ] tag 已推送并触发构建
- [ ] 构建完成后验证：6 个安装包 + 6 个 .sig + latest.json
- [ ] latest.json 包含 5 个平台且签名非空
- [ ] Release body 中的安装包名与实际一致
