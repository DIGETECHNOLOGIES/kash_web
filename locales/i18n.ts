import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import fr from './fr.json';

import LanguageDetector from 'i18next-browser-languagedetector';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            fr: { translation: fr },
        },
        fallbackLng: 'en',
        detection: {
            order: ['localStorage', 'cookie', 'htmlTag'],
            caches: ['localStorage', 'cookie'],
        },
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;
