// Import hook createContext, useContext, useState, useEffect, dan useCallback dari pustaka react
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
// Import kamus terjemahan translations dari modul i18n
import { translations } from '../i18n/translations';

// Membuat objek context LanguageContext untuk mendistribusikan preferensi bahasa ke seluruh pohon komponen
const LanguageContext = createContext();

// Konstanta kunci penyimpanan lokal peramban (localStorage) untuk preferensi bahasa sistem
export const STORAGE_KEY_LANG = 'spct_language';

// Deklarasi fungsi komponen publik LanguageProvider untuk membungkus komponen turunan dengan context bahasa
export function LanguageProvider({ children }) {
  // Inisialisasi state lang bertipe string dengan nilai awal dari localStorage atau default 'id'
  const [lang, setLangState] = useState(() => {
    return localStorage.getItem(STORAGE_KEY_LANG) || 'id';
  });

  // Deklarasi fungsi callback setLanguage untuk mengubah bahasa aktif ('id' atau 'en')
  const setLanguage = useCallback((newLang) => {
    // Validasi apakah kode bahasa yang dimasukkan adalah 'id' atau 'en'
    if (newLang !== 'id' && newLang !== 'en') return;
    // Memperbarui nilai state lang
    setLangState(newLang);
    // Menyimpan preferensi bahasa ke localStorage peramban
    localStorage.setItem(STORAGE_KEY_LANG, newLang);
    // Memancarkan event kustom 'spct_language_change' agar komponen pendengar mengetahui perubahan bahasa
    window.dispatchEvent(new Event('spct_language_change'));
  }, []);

  // Hook useEffect untuk mendengarkan perubahan preferensi bahasa antar tab dan event internal
  useEffect(() => {
    // Fungsi penanganan perubahan storage pada tab peramban yang berbeda
    const handleStorageChange = (e) => {
      // Jika perubahan terjadi pada kunci STORAGE_KEY_LANG dan bernilai valid
      if (e.key === STORAGE_KEY_LANG && (e.newValue === 'id' || e.newValue === 'en')) {
        // Sinkronkan state bahasa dengan nilai baru
        setLangState(e.newValue);
      }
    };
    // Fungsi penanganan event kustom perubahan bahasa dalam tab yang sama
    const handleCustomChange = () => {
      // Mengambil nilai bahasa terbaru dari localStorage
      const stored = localStorage.getItem(STORAGE_KEY_LANG);
      // Jika nilai tersimpan valid, perbarui state bahasa
      if (stored && (stored === 'id' || stored === 'en')) {
        setLangState(stored);
      }
    };

    // Mendaftarkan event listener pada objek window peramban
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('spct_language_change', handleCustomChange);
    // Membersihkan event listener saat komponen LanguageProvider di-unmount
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('spct_language_change', handleCustomChange);
    };
  }, []);

  // Deklarasi fungsi pembantu penerjemahan teks t dengan memoize useCallback
  const t = useCallback((key, fallback) => {
    // Mengambil kamus aktif sesuai bahasa terpilih atau fallback ke bahasa Indonesia
    const currentDict = translations[lang] || translations.id;
    // Jika kata kunci ditemukan pada kamus aktif, kembalikan terjemahannya
    if (currentDict && currentDict[key] !== undefined) {
      return currentDict[key];
    }
    // Jika tidak ditemukan, periksa kamus default bahasa Indonesia
    const defaultDict = translations.id;
    if (defaultDict && defaultDict[key] !== undefined) {
      return defaultDict[key];
    }
    // Jika tetap tidak ditemukan, kembalikan teks fallback atau nama key itu sendiri
    return fallback !== undefined ? fallback : key;
  }, [lang]);

  // Mengembalikan penyedia context LanguageContext dengan nilai bahasa, fungsi pengubah, dan helper terjemahan
  return (
    <LanguageContext.Provider value={{ lang, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Deklarasi kustom hook useLanguage untuk mempermudah akses ke LanguageContext di seluruh komponen
export function useLanguage() {
  // Mengambil konteks LanguageContext menggunakan hook useContext
  const context = useContext(LanguageContext);
  // Jika hook dipanggil di luar cakupan LanguageProvider, sediakan fallback yang aman
  if (!context) {
    // Mengambil bahasa fallback dari localStorage atau 'id'
    const fallbackLang = localStorage.getItem(STORAGE_KEY_LANG) || 'id';
    // Mengembalikan objek dummy dengan helper penerjemahan mandiri
    return {
      lang: fallbackLang,
      setLanguage: () => {},
      t: (key, fallback) => {
        const dict = translations[fallbackLang] || translations.id;
        return dict?.[key] ?? (fallback ?? key);
      }
    };
  }
  // Mengembalikan konteks bahasa aktif
  return context;
}
