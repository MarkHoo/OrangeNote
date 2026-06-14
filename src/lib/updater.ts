import { check, type Update } from '@tauri-apps/plugin-updater';
import { appDataDir, join } from '@tauri-apps/api/path';
import { mkdir, readDir, remove } from '@tauri-apps/plugin-fs';

const DOWNLOAD_DIR_NAME = 'updates';
const STATE_KEY = 'updater_state';

export interface UpdaterState {
  lastCheckAt: string;
  downloadedVersion: string | null;
  downloadedPath: string | null;
}

/**
 * 获取更新下载目录
 */
async function getDownloadDir(): Promise<string> {
  const appData = await appDataDir();
  const dir = await join(appData, DOWNLOAD_DIR_NAME);
  try {
    await mkdir(dir, { recursive: true });
  } catch {
    // already exists
  }
  return dir;
}

/**
 * 清理下载目录中的旧安装包
 */
async function cleanupDownloadDir(): Promise<void> {
  try {
    const dir = await getDownloadDir();
    const entries = await readDir(dir);
    for (const entry of entries) {
      if (entry.name?.endsWith('.exe') || entry.name?.endsWith('.msi')) {
        const filePath = await join(dir, entry.name);
        await remove(filePath);
        console.log('[Updater] Cleaned up old installer:', entry.name);
      }
    }
  } catch (e) {
    console.warn('[Updater] Cleanup failed:', e);
  }
}

/**
 * 从本地存储获取更新状态
 */
function getState(): UpdaterState {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { lastCheckAt: '', downloadedVersion: null, downloadedPath: null };
}

function saveState(state: UpdaterState): void {
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
}

/**
 * 检查更新并静默下载
 * - 检测到新版本后自动后台下载
 * - 如果已有旧版本下载包，先清理再下载新版本
 * - 下载完成后记录状态，等待用户确认安装
 */
export async function checkAndDownloadUpdate(
  onStatus?: (status: string, version?: string) => void
): Promise<boolean> {
  try {
    onStatus?.('checking');
    const update: Update | null = await check();

    if (!update) {
      onStatus?.('up-to-date');
      return false;
    }

    onStatus?.('found', update.version);

    const state = getState();

    // 如果已经下载了同一个版本，跳过
    if (state.downloadedVersion === update.version && state.downloadedPath) {
      onStatus?.('already-downloaded', update.version);
      return true;
    }

    // 清理旧版本下载包
    await cleanupDownloadDir();

    // 开始后台静默下载
    onStatus?.('downloading', update.version);

    const downloadDir = await getDownloadDir();

    await update.downloadAndInstall((event) => {
      switch (event.event) {
        case 'Progress':
          // 静默下载，不显示进度给用户
          break;
        case 'Finished':
          break;
      }
    });

    // 下载安装完成，更新状态
    state.downloadedVersion = update.version;
    state.downloadedPath = downloadDir;
    state.lastCheckAt = new Date().toISOString();
    saveState(state);

    onStatus?.('downloaded', update.version);
    return true;
  } catch (e) {
    console.error('[Updater] Error:', e);
    onStatus?.('error');
    return false;
  }
}

/**
 * 安装已下载的更新
 * 安装后清理下载目录
 */
export async function installDownloadedUpdate(): Promise<void> {
  try {
    // 安装由 Tauri updater 插件处理
    // downloadAndInstall 已经包含了安装步骤
    // 安装完成后清理
    await cleanupDownloadDir();

    const state = getState();
    state.downloadedVersion = null;
    state.downloadedPath = null;
    saveState(state);
  } catch (e) {
    console.error('[Updater] Install failed:', e);
  }
}

/**
 * 启动时检查更新（仅在自动更新开启时调用）
 * 每次启动检查一次，避免频繁检查
 */
export async function autoCheckUpdate(
  autoUpdateEnabled: boolean,
  onStatus?: (status: string, version?: string) => void
): Promise<void> {
  if (!autoUpdateEnabled) return;

  const state = getState();
  const now = new Date();

  // 距离上次检查不足 1 小时则跳过
  if (state.lastCheckAt) {
    const lastCheck = new Date(state.lastCheckAt);
    const diffMs = now.getTime() - lastCheck.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    if (diffHours < 1) {
      onStatus?.('skipped');
      return;
    }
  }

  await checkAndDownloadUpdate(onStatus);
}

/**
 * 获取当前已下载的更新信息
 */
export function getDownloadedUpdate(): { version: string } | null {
  const state = getState();
  if (state.downloadedVersion) {
    return { version: state.downloadedVersion };
  }
  return null;
}
