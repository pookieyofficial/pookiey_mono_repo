import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import translation files
import en from '../locales/en.json';
import hi from '../locales/hi.json';
import bn from '../locales/bn.json';
import ta from '../locales/ta.json';
import ne from '../locales/ne.json';
import ur from '../locales/ur.json';
import zh from '../locales/zh.json';
import es from '../locales/es.json';
import ar from '../locales/ar.json';
import fr from '../locales/fr.json';
import ru from '../locales/ru.json';
import pt from '../locales/pt.json';
import id from '../locales/id.json';
import de from '../locales/de.json';
import ja from '../locales/ja.json';
import ko from '../locales/ko.json';
import tr from '../locales/tr.json';
import it from '../locales/it.json';
import nl from '../locales/nl.json';
import vi from '../locales/vi.json';
import th from '../locales/th.json';

const LANGUAGE_KEY = 'app-language';

// Initialize i18n synchronously with default language
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      bn: { translation: bn },
      ta: { translation: ta },
      ne: { translation: ne },
      ur: { translation: ur },
      zh: { translation: zh },
      es: { translation: es },
      ar: { translation: ar },
      fr: { translation: fr },
      ru: { translation: ru },
      pt: { translation: pt },
      id: { translation: id },
      de: { translation: de },
      ja: { translation: ja },
      ko: { translation: ko },
      tr: { translation: tr },
      it: { translation: it },
      nl: { translation: nl },
      vi: { translation: vi },
      th: { translation: th },
    },
    lng: 'en', // Default language
    fallbackLng: 'en',
    compatibilityJSON: 'v4',
    interpolation: {
      escapeValue: false,
    },
  });

// Load saved language after initialization
AsyncStorage.getItem(LANGUAGE_KEY).then((savedLanguage) => {
  if (savedLanguage && i18n.hasResourceBundle(savedLanguage, 'translation')) {
    i18n.changeLanguage(savedLanguage);
  }
}).catch((error) => {
  console.error('Error loading saved language:', error);
});

// Function to change language
export const changeLanguage = async (language: string) => {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, language);
    await i18n.changeLanguage(language);
  } catch (error) {
    console.error('Error changing language:', error);
  }
};

export default i18n;

