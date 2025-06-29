import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Language = 'en' | 'rw';

interface Translations {
  [key: string]: {
    en: string;
    rw: string;
  };
}

const translations: Translations = {
  // Navigation
  home: { en: 'Home', rw: 'Ahabanza' },
  map: { en: 'Map', rw: 'Ikarita' },
  buses: { en: 'Buses', rw: 'Amatenge' },
  settings: { en: 'Settings', rw: 'Amagenamiterere' },
  
  // Authentication
  login: { en: 'Login', rw: 'Injira' },
  signup: { en: 'Sign Up', rw: 'Iyandikishe' },
  email: { en: 'Email', rw: 'Imeyili' },
  password: { en: 'Password', rw: 'Ijambobanga' },
  name: { en: 'Name', rw: 'Amazina' },
  phone: { en: 'Phone', rw: 'Telefone' },
  logout: { en: 'Logout', rw: 'Sohoka' },
  
  // Home
  welcome: { en: 'Welcome to Ridra', rw: 'Murakaze kuri Ridra' },
  nearbyBuses: { en: 'Nearby Buses', rw: 'Amatenge ari hafi' },
  eta: { en: 'ETA', rw: 'Igihe cyo kugera' },
  showInterest: { en: 'Show Interest', rw: 'Erekana ubushake' },
  
  // Settings
  language: { en: 'Language', rw: 'Ururimi' },
  darkMode: { en: 'Dark Mode', rw: 'Ifata ryijimye' },
  profile: { en: 'Profile', rw: 'Umwirondoro' },
  
  // Bus related
  busRoute: { en: 'Bus Route', rw: 'Inzira ya Busi' },
  destination: { en: 'Destination', rw: 'Icyerekezo' },
  departure: { en: 'Departure', rw: 'Kugenda' },
  arrival: { en: 'Arrival', rw: 'Kugeza' },
  
  // Common
  save: { en: 'Save', rw: 'Bika' },
  cancel: { en: 'Cancel', rw: 'Kuraho' },
  confirm: { en: 'Confirm', rw: 'Emeza' },
  loading: { en: 'Loading...', rw: 'Biracyashyirwaho...' },
  error: { en: 'Error', rw: 'Ikosa' },
  success: { en: 'Success', rw: 'Byagenze neza' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    loadLanguagePreference();
  }, []);

  const loadLanguagePreference = async () => {
    try {
      const storedLanguage = await AsyncStorage.getItem('language');
      if (storedLanguage && (storedLanguage === 'en' || storedLanguage === 'rw')) {
        setLanguageState(storedLanguage as Language);
      }
    } catch (error) {
      console.error('Error loading language preference:', error);
    }
  };

  const setLanguage = async (lang: Language) => {
    try {
      setLanguageState(lang);
      await AsyncStorage.setItem('language', lang);
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
  };

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Translation not found for key: ${key}`);
      return key;
    }
    return translation[language];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}