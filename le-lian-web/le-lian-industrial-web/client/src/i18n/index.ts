import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import zh from './zh';
import en from './en';
import th from './th';
import id from './id';
import vi from './vi';

i18n.use(initReactI18next).init({
  resources: {
    zh: { translation: zh },
    en: { translation: en },
    th: { translation: th },
    id: { translation: id },
    vi: { translation: vi },
  },
  lng: localStorage.getItem('lang') || 'zh',
  fallbackLng: 'zh',
  interpolation: { escapeValue: false },
});

export default i18n;
