import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import zhCN from './locales/zh-CN';
import zhTW from './locales/zh-TW';
import en from './locales/en';
import type { Language } from '../types';

const savedLang = (typeof window !== 'undefined' ? localStorage.getItem('language') : null) as Language | null;

// Detect system language on first install
function detectSystemLanguage(): Language {
  const nav = navigator.language;
  if (nav.startsWith('zh-CN') || nav.startsWith('zh-Hans')) return 'zh-CN';
  if (nav.startsWith('zh-TW') || nav.startsWith('zh-Hant') || nav.startsWith('zh-HK')) return 'zh-TW';
  return 'en';
}

const defaultLang = savedLang || detectSystemLanguage();

i18n.use(initReactI18next).init({
  resources: {
    'zh-CN': { translation: zhCN },
    'zh-TW': { translation: zhTW },
    en: { translation: en },
  },
  lng: defaultLang,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
export type { Language };
