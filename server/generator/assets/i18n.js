import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import translationEn from './translations/translations_en.json';
import translationEs from './translations/translations_es.json';

export const languages = {
  es: 'es',
  en: 'en',
};

export const getGenericLanguage = lang => lang.split('-')[0];

export const languageCode = Localization.getLocales()[0].languageCode;
const currentLanguage = getGenericLanguage(languageCode);

const resources = {
  en: {
    translation: translationEn,
  },
  es: {
    translation: translationEs,
  },
};

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    interpolation: { escapeValue: false },
    nsSeparator: false,
    keySeparator: false,
    load: 'languageOnly',
    nonExplicitSupportedLngs: true,
    fallbackLng: 'en',
    lng: currentLanguage,
    resources,
  }).then(t => { t('key'); });

export default i18n;
