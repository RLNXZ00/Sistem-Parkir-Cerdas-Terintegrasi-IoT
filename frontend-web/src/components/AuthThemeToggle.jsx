import { useState, useEffect } from 'react';

/**
 * Komponen AuthThemeToggle
 * Tombol pengubah tema (Dark Mode / Light Mode) khusus halaman autentikasi (Login, Register, Lupa Password).
 * Pilihan tema ini disimpan ke localStorage 'spct_theme' dan disinkronkan ke document.documentElement ('light-theme')
 * sehingga saat pengguna login masuk ke dashboard, tema yang dipilih tetap aktif secara konsisten.
 */
export default function AuthThemeToggle() {
  const [theme, setTheme] = useState(() => localStorage.getItem('spct_theme') || 'dark');

  useEffect(() => {
    const current = localStorage.getItem('spct_theme') || 'dark';
    setTheme(current);
    if (current === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('spct_theme', nextTheme);
    if (nextTheme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
  };

  const isLight = theme === 'light';

  return (
    <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-30 select-none">
      <button
        type="button"
        onClick={toggleTheme}
        title={isLight ? 'Beralih ke Mode Gelap (Dark Mode)' : 'Beralih ke Mode Terang (Light Mode)'}
        className={`flex items-center gap-2 px-3.5 py-2 rounded-full border text-xs font-mono font-medium shadow-md transition-all duration-200 cursor-pointer backdrop-blur-md ${
          isLight
            ? 'bg-white/95 border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-slate-400 shadow-slate-300/50'
            : 'bg-[#161c22]/90 border-[#2b3540] text-slate-200 hover:bg-[#1f2730] hover:border-[#7ad0ff] shadow-black/40'
        }`}
      >
        <span
          className={`material-symbols-outlined text-[18px] transition-transform duration-300 ${
            isLight ? 'text-amber-500 rotate-0' : 'text-[#7ad0ff] -rotate-12'
          }`}
        >
          {isLight ? 'light_mode' : 'dark_mode'}
        </span>
        <span className="font-semibold tracking-wide">
          {isLight ? 'Mode Terang' : 'Mode Gelap'}
        </span>
      </button>
    </div>
  );
}
