// Import komponen routing dari react-router-dom untuk deklarasi navigasi client-side
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import komponen halaman gerbang masuk: pemindaian kamera ANPR
import ScanPage from './pages/ScanPage';
// Import komponen halaman alokasi rute: animasi pencarian rute terdekat
import AllocatingSlotPage from './pages/AllocatingSlotPage';
// Import komponen halaman navigasi: visualisasi peta vektor rute A* dan sensor
import NavigationPage from './pages/NavigationPage';
// Import komponen halaman sukses masuk: konfirmasi penerbitan tiket masuk
import SuccessPage from './pages/SuccessPage';
// Import komponen halaman gagal masuk: notifikasi kapasitas penuh atau kendala sistem
import FailedPage from './pages/FailedPage';

// Import komponen halaman gerbang keluar: pemindaian plat nomor dan antrean keluar
import ExitScanPage from './pages/ExitScanPage';
// Import komponen halaman sukses keluar: konfirmasi pembayaran lunas dan pembukaan palang
import ExitSuccessPage from './pages/ExitSuccessPage';
// Import komponen halaman gagal keluar: notifikasi saldo e-wallet kurang
import ExitFailedPage from './pages/ExitFailedPage';

// Fungsi komponen publik App sebagai deklarasi router utama terminal kios SPCT
export default function App() {
  // Mengembalikan elemen antarmuka JSX dengan pembungkus BrowserRouter
  return (
    // Membungkus seluruh hierarki rute dengan BrowserRouter
    <BrowserRouter>
      {/* Wadah deklarasi kumpulan rute aplikasi kios */}
      <Routes>
        {/* === Alur Gerbang Masuk (Entry Flow) === */}
        {/* Rute gerbang masuk mobil utama */}
        <Route path="/" element={<ScanPage key="masuk-mobil" jenis="MOBIL" />} />
        {/* Rute gerbang masuk khusus kendaraan motor */}
        <Route path="/motor" element={<ScanPage key="masuk-motor" jenis="MOTOR" />} />
        {/* Rute animasi proses komputasi alokasi slot rute A* */}
        <Route path="/allocating" element={<AllocatingSlotPage />} />
        {/* Rute panduan peta navigasi interaktif dari gerbang ke slot tujuan */}
        <Route path="/navigation" element={<NavigationPage />} />
        
        {/* === Alur Gerbang Keluar & Terminal Pembayaran (Exit Flow) === */}
        {/* Rute gerbang keluar mobil dan pemrosesan tarif */}
        <Route path="/exit" element={<ExitScanPage key="keluar-mobil" jenis="MOBIL" />} />
        {/* Rute gerbang keluar khusus motor */}
        <Route path="/exit/motor" element={<ExitScanPage key="keluar-motor" jenis="MOTOR" />} />
        {/* Rute konfirmasi pembayaran lunas dan palang barrier terangkat */}
        <Route path="/exit/success" element={<ExitSuccessPage />} />
        {/* Rute notifikasi pembayaran gagal akibat saldo tidak mencukupi */}
        <Route path="/exit/failed" element={<ExitFailedPage />} />

        {/* Rute fallback untuk mengalihkan URL yang tidak valid kembali ke beranda masuk */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
