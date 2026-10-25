// Import hook useState dan useEffect dari pustaka react untuk manajemen state lokal dan siklus hidup komponen
import { useState, useEffect } from 'react';

// Deklarasi fungsi komponen publik AuthThemeToggle untuk tombol pengubah tema (Dark/Light) pada halaman autentikasi
export default function AuthThemeToggle() {
  // Inisialisasi state theme bertipe string dengan nilai awal dari localStorage 'spct_theme' atau default 'dark'
  const [theme, setTheme] = useState(() => localStorage.getItem('spct_theme') || 'dark');

  // Hook useEffect untuk menyelaraskan kelas tema pada elemen root HTML (document.documentElement) saat awal render
  useEffect(() => {
    // Membaca preferensi tema tersimpan dari penyimpanan lokal
    const current = localStorage.getItem('spct_theme') || 'dark';
    // Memperbarui state theme dengan nilai tema tersimpan
    setTheme(current);
    // Jika tema aktif adalah light, maka tambahkan kelas CSS 'light-theme' ke tag <html>
    if (current === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      // Jika tidak, hapus kelas CSS 'light-theme' untuk mengaktifkan tema gelap default
      document.documentElement.classList.remove('light-theme');
    }
  }, []);

  // Deklarasi fungsi toggleTheme untuk membalik status tema antara mode gelap dan terang
  const toggleTheme = () => {
    // Menentukan tema berikutnya dengan operasi ternary
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    // Memperbarui nilai state theme
    setTheme(nextTheme);
    // Menyimpan preferensi tema baru ke localStorage
    localStorage.setItem('spct_theme', nextTheme);
    // Jika tema baru adalah light, tambahkan kelas 'light-theme' pada elemen root HTML
    if (nextTheme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      // Jika tema baru adalah dark, hapus kelas 'light-theme' dari elemen root HTML
      document.documentElement.classList.remove('light-theme');
    }
  };

  // Evaluasi boolean apakah tema aktif saat ini adalah mode terang
  const isLight = theme === 'light';

  // Mengembalikan elemen antarmuka JSX tombol floating pengubah tema
  return (
    // Wadah tombol mengambang di pojok kanan atas layar dengan indeks z tinggi
    <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-30 select-none">
      {/* Tombol pemicu penggantian tema dengan efek blur latar belakang dan transisi halus */}
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
        {/* Ikon matahari atau bulan dinamis sesuai status tema aktif */}
        <span
          className={`material-symbols-outlined text-[18px] transition-transform duration-300 ${
            isLight ? 'text-amber-500 rotate-0' : 'text-[#7ad0ff] -rotate-12'
          }`}
        >
          {isLight ? 'light_mode' : 'dark_mode'}
        </span>
        {/* Label teks penjelas mode tampilan aktif */}
        <span className="font-semibold tracking-wide">
          {isLight ? 'Mode Terang' : 'Mode Gelap'}
        </span>
      </button>
    </div>
  );
}
