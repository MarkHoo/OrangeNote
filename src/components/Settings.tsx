import React, { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getVersion } from '@tauri-apps/api/app';
import { useStore } from '../store/useStore';
import ColorPicker from './ColorPicker';
import type { Language } from '../types';
import { checkAndDownloadUpdate, getDownloadedUpdate, installDownloadedUpdate } from '../lib/updater';

const LANGUAGES: { key: Language; label: string; flag: string }[] = [
  { key: 'zh-CN', label: '简体中文', flag: '🇨🇳' },
  { key: 'zh-TW', label: '繁體中文', flag: '🇹🇼' },
  { key: 'en', label: 'English', flag: '🇬🇧' },
];

type UpdateStatus = 'idle' | 'checking' | 'found' | 'downloading' | 'downloaded' | 'already-downloaded' | 'up-to-date' | 'error' | 'skipped';

const Settings: React.FC = () => {
  const { t, i18n } = useTranslation();
  const {
    showSettings, setShowSettings,
    language, setLanguage: storeSetLanguage,
    defaultColor, setDefaultColor,
    autoUpdate, setAutoUpdate,
  } = useStore();

  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>('idle');
  const [foundVersion, setFoundVersion] = useState('');
  const [updateError, setUpdateError] = useState('');
  const [appVersion, setAppVersion] = useState('');

  useEffect(() => {
    getVersion().then(setAppVersion).catch(() => setAppVersion(''));
  }, []);

  const handleLanguageChange = (lang: Language) => {
    storeSetLanguage(lang);
    i18n.changeLanguage(lang);
  };

  const handleCheckUpdate = useCallback(async () => {
    setUpdateError('');
    setFoundVersion('');

    await checkAndDownloadUpdate((status, version) => {
      setUpdateStatus(status as UpdateStatus);
      if (version) setFoundVersion(version);
    });
  }, []);

  const handleInstallUpdate = useCallback(async () => {
    try {
      await installDownloadedUpdate();
      // 更新已安装，刷新页面
      window.location.reload();
    } catch (e) {
      setUpdateError(String(e));
      setUpdateStatus('error');
    }
  }, []);

  // 检查是否有已下载待安装的更新
  const downloadedUpdate = getDownloadedUpdate();

  if (!showSettings) return null;

  const statusMessages: Record<string, string> = {
    checking: t('update.checking'),
    found: `${t('update.available')} v${foundVersion}`,
    downloading: t('update.downloading'),
    downloaded: `${t('update.ready')} v${foundVersion}`,
    'already-downloaded': `${t('update.ready')} v${foundVersion}`,
    'up-to-date': t('update.notAvailable'),
    error: `${t('update.error')}${updateError ? ': ' + updateError : ''}`,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowSettings(false)}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
          <h2 className="text-lg font-semibold text-gray-800">⚙️ {t('settings.title')}</h2>
          <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">{t('settings.language')}</label>
            <div className="flex gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.key}
                  onClick={() => handleLanguageChange(lang.key)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm transition-all ${
                    language === lang.key
                      ? 'bg-orange-100 text-orange-700 ring-2 ring-orange-400 font-medium'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Default color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">{t('settings.defaultColor')}</label>
            <ColorPicker value={defaultColor} onChange={setDefaultColor} showLabels />
          </div>

          {/* Auto update toggle */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">{t('settings.autoUpdate')}</label>
            <button
              onClick={() => setAutoUpdate(!autoUpdate)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                autoUpdate ? 'bg-orange-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  autoUpdate ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Update section */}
          <div className="space-y-3">
            {/* 已下载待安装的更新 */}
            {downloadedUpdate && updateStatus === 'idle' && (
              <div className="p-3 bg-green-50 text-green-700 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span>🎉</span>
                  <span className="font-medium">v{downloadedUpdate.version} {t('update.ready')}</span>
                </div>
                <button
                  onClick={handleInstallUpdate}
                  className="w-full px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  🔄 {t('update.ready')}
                </button>
              </div>
            )}

            {/* 手动检查更新按钮 */}
            <button
              onClick={handleCheckUpdate}
              disabled={updateStatus === 'checking' || updateStatus === 'downloading'}
              className="w-full px-4 py-2.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {updateStatus === 'checking' || updateStatus === 'downloading' ? (
                <>
                  <span className="animate-spin">⏳</span>
                  {statusMessages[updateStatus]}
                </>
              ) : (
                <>🔄 {t('settings.checkUpdate')}</>
              )}
            </button>

            {/* Update status messages */}
            {updateStatus !== 'idle' && updateStatus !== 'skipped' && updateStatus !== 'checking' && updateStatus !== 'downloading' && (
              <div className={`p-3 rounded-lg text-sm ${
                updateStatus === 'found' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                updateStatus === 'downloaded' || updateStatus === 'already-downloaded' ? 'bg-green-50 text-green-700 border border-green-200' :
                updateStatus === 'up-to-date' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                'bg-red-50 text-red-700 border border-red-200'
              }`}>
                <div className="flex items-center gap-2">
                  {updateStatus === 'found' && <span>📥</span>}
                  {(updateStatus === 'downloaded' || updateStatus === 'already-downloaded') && <span>✅</span>}
                  {updateStatus === 'up-to-date' && <span>ℹ️</span>}
                  {updateStatus === 'error' && <span>❌</span>}
                  <span>{statusMessages[updateStatus]}</span>
                </div>

                {/* 已下载完成，显示安装按钮 */}
                {(updateStatus === 'downloaded' || updateStatus === 'already-downloaded') && (
                  <button
                    onClick={handleInstallUpdate}
                    className="mt-2 w-full px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    🔄 {t('update.ready')}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* About */}
          <div className="pt-4 border-t border-gray-100">
            <div className="text-center space-y-2">
              <div className="text-3xl">🍊</div>
              <h3 className="text-lg font-bold text-orange-600">{t('app.name')}</h3>
              <p className="text-sm text-gray-500">{t('app.slogan')}</p>
              <p className="text-xs text-gray-400">{t('settings.version')} v{appVersion}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
