// Import hook useNavigate dari react-router-dom untuk navigasi antar halaman
import { useNavigate } from 'react-router-dom';
// Import hook useState dan useEffect dari React untuk mengelola waktu lokal
import { useState, useEffect } from 'react';

// Deklarasi fungsi komponen publik SuccessPage untuk menampilkan konfirmasi sukses
export default function SuccessPage() {
  // Inisialisasi fungsi navigasi React Router
  const navigate = useNavigate();
  // Inisialisasi state time bertipe string dengan nilai awal string kosong
  const [time, setTime] = useState('');

  // Hook useEffect untuk memperbarui waktu jam berjalan setiap detik
  useEffect(() => {
    // Fungsi pembantu untuk membaca waktu jam saat ini dalam format 24 jam
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: false }));
    };
    // Menjalankan fungsi pembaruan waktu pertama kali
    updateTime();
    // Mengatur interval timer pembaruan jam setiap 1000 milidetik (1 detik)
    const interval = setInterval(updateTime, 1000);
    // Membersihkan interval timer saat komponen di-unmount
    return () => clearInterval(interval);
  }, []);

  // Mengembalikan elemen JSX antarmuka konfirmasi sukses
  return (
    // Kontainer utama dengan latar gelap dan aksi klik untuk beralih halaman pengujian
    <div className="bg-bg-primary text-text-high-contrast min-h-screen flex flex-col items-center justify-center relative overflow-hidden cursor-pointer" onClick={() => navigate('/failed')}>
      {/* Definisi styling lokal untuk efek cahaya glow dan motif gradasi latar belakang */}
      <style>{`
        .glow-success {
            text-shadow: 0 0 20px rgba(46, 139, 87, 0.8), 0 0 40px rgba(46, 139, 87, 0.4);
        }
        .bg-pattern {
            background-image: radial-gradient(circle at 50% 50%, rgba(46, 139, 87, 0.05) 0%, transparent 50%);
        }
      `}</style>
      
      {/* Elemen dekorasi visual pola latar belakang radial */}
      <div className="absolute inset-0 bg-pattern pointer-events-none"></div>

      {/* Kontainer konten utama di tengah layar */}
      <main className="relative z-10 flex flex-col items-center justify-center w-full max-w-4xl px-container-margin py-8 h-screen gap-8">
        
        {/* Indikator status terminal di bagian atas */}
        <div className="absolute top-8 flex items-center gap-2">
          {/* Titik indikator hijau menyala berdenyut */}
          <div className="w-3 h-3 rounded-full bg-eco-success shadow-[0_0_10px_#2E8B57] animate-pulse"></div>
          {/* Teks label terminal keluar */}
          <span className="font-tech-mono text-sm text-on-surface-variant tracking-widest opacity-80">EXIT TERMINAL</span>
        </div>

        {/* Kontainer teks status pusat: LUNAS - Silakan Jalan */}
        <div className="flex flex-col items-center justify-center mb-12 text-center">
          {/* Ikon centang hijau sukses berukuran besar */}
          <span className="material-symbols-outlined text-eco-success mb-4" style={{ fontSize: '80px', fontVariationSettings: "'FILL' 1" }}>
            check_circle
          </span>
          {/* Judul teks status lunas dengan efek glow hijau */}
          <h1 className="text-[64px] font-extrabold leading-tight tracking-tight uppercase glow-success text-eco-success">
            LUNAS
          </h1>
          {/* Instruksi bagi pengemudi untuk melajukan kendaraan */}
          <p className="text-2xl font-medium tracking-widest mt-2 uppercase text-white">
            Silakan Jalan
          </p>
        </div>

        {/* Kartu rincian informasi transaksi kendaraan */}
        <div className="w-full space-y-4 max-w-[540px]">
          {/* Kotak penampilan plat nomor kendaraan yang terdeteksi kamera */}
          <div className="bg-surface-container-high border border-outline-variant rounded-xl flex flex-col items-center py-10">
            <p className="font-tech-mono text-sm text-on-surface-variant mb-3 uppercase tracking-widest">Detected Plate</p>
            <div className="bg-background border-2 border-eco-success/50 rounded-lg px-12 py-6">
              <span className="font-tech-mono text-5xl font-bold tracking-[0.2em]">AB 1234 CD</span>
            </div>
          </div>
          {/* Kotak penampilan jam waktu transaksi saat ini */}
          <div className="bg-surface-container-high border border-outline-variant rounded-xl flex justify-between items-center px-8 py-6">
            <span className="font-tech-mono text-sm text-on-surface-variant uppercase tracking-widest">Time</span>
            <span className="font-tech-mono text-2xl font-bold tracking-wider">{time}</span>
          </div>
        </div>

        {/* Bagian footer indikator status koneksi sistem online */}
        <div className="absolute bottom-8 flex items-center gap-2 text-on-surface-variant">
          <span className="material-symbols-outlined text-system-info" style={{ fontSize: '18px' }}>cloud_done</span>
          <span className="font-tech-mono text-sm tracking-widest opacity-80">SISTEM ONLINE</span>
        </div>
      </main>
    </div>
  );
}
