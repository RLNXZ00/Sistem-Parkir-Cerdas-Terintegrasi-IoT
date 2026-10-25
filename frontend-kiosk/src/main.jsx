// Import komponen StrictMode dari pustaka React untuk mendeteksi potensi masalah pada aplikasi
import { StrictMode } from 'react'
// Import fungsi createRoot dari pustaka react-dom/client untuk inisialisasi root DOM React
import { createRoot } from 'react-dom/client'
// Import berkas styling CSS global untuk menerapkan utilitas dan token Tailwind CSS
import './index.css'
// Import komponen utama App yang mendefinisikan seluruh konfigurasi rute kios
import App from './App.jsx'

// Menginisialisasi root React pada elemen kontainer DOM dengan id 'root' dan merender komponen App
createRoot(document.getElementById('root')).render(
  // Membungkus aplikasi dalam StrictMode untuk pemeriksaan kualitas kode saat tahap pengembangan
  <StrictMode>
    {/* Merender komponen utama aplikasi kios */}
    <App />
  </StrictMode>,
)
