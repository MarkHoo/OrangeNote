import React from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store/useStore';
import type { ViewMode } from '../types';

const Sidebar: React.FC = () => {
  const { t } = useTranslation();
  const { viewMode, setViewMode, setShowSettings, setShowTagManager, notes, tags } = useStore();

  const navItems: { key: ViewMode; icon: string; label: string; count?: number }[] = [
    { key: 'notes', icon: '📝', label: t('nav.notes'), count: notes.length },
    { key: 'tags', icon: '🏷️', label: t('nav.tags'), count: tags.length },
  ];

  return (
    <aside className="sidebar w-56 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🍊</span>
          <div>
            <h1 className="text-lg font-bold text-orange-600">{t('app.name')}</h1>
            <p className="text-xs text-gray-500">{t('app.slogan')}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => setViewMode(item.key)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
              viewMode === item.key
                ? 'bg-orange-100 text-orange-700 font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="flex-1 text-left">{item.label}</span>
            {item.count !== undefined && (
              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                {item.count}
              </span>
            )}
          </button>
        ))}

        {/* Tag Manager shortcut */}
        <button
          onClick={() => setShowTagManager(true)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-all"
        >
          <span className="text-lg">⚙️</span>
          <span className="flex-1 text-left">{t('tag.manage')}</span>
        </button>
      </nav>

      {/* Settings */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setShowSettings(true)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-all"
        >
          <span className="text-lg">🔧</span>
          <span>{t('nav.settings')}</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
