// Import modul StrictMode dari pustaka React untuk memeriksa praktik terbaik dan potensi masalah dalam aplikasi
import { StrictMode } from 'react'
// Import method createRoot dari react-dom/client untuk merender komponen root ke DOM
import { createRoot } from 'react-dom/client'
// Import stylesheet global index.css yang memuat konfigurasi Tailwind CSS dan variabel tema
import './index.css'
// Import komponen utama App dari file App.jsx
import App from './App.jsx'

// Mengambil tema tampilan awal yang tersimpan pada localStorage peramban atau fallback ke 'dark'
const initialTheme = localStorage.getItem('spct_theme') || 'dark';
// Jika preferensi tema pengguna adalah mode terang ('light'), maka:
if (initialTheme === 'light') {
  // Tambahkan kelas CSS 'light-theme' ke elemen root dokumen HTML
  document.documentElement.classList.add('light-theme');
} else {
  // Jika tidak, hapus kelas CSS 'light-theme' untuk menerapkan mode gelap default
  document.documentElement.classList.remove('light-theme');
}

// Inisialisasi root React pada elemen HTML dengan id 'root' dan render komponen aplikasi di dalamnya
createRoot(document.getElementById('root')).render(
  // Membungkus aplikasi ke dalam StrictMode untuk pemeriksaan kualitas kode saat tahap pengembangan
  <StrictMode>
    {/* Komponen utama aplikasi SPCT */}
    <App />
  </StrictMode>,
)
