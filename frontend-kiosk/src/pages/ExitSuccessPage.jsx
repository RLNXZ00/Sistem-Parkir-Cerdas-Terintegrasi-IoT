// Import hook useLocation dan useNavigate dari react-router-dom untuk membaca parameter dan navigasi
import { useLocation, useNavigate } from 'react-router-dom';
// Import hook useEffect dan useState dari React untuk mengelola state waktu dan timer
import { useEffect, useState } from 'react';

// Deklarasi fungsi komponen publik ExitSuccessPage untuk menampilkan konfirmasi sukses pembayaran keluar
export default function ExitSuccessPage() {
  // Inisialisasi hook location untuk membaca data navigasi yang dikirim dari halaman sebelumnya
  const location = useLocation();
  // Inisialisasi hook navigate untuk mengarahkan pengguna kembali ke halaman utama
  const navigate = useNavigate();
  // Mengambil data respon transaksi pembayaran dari state location
  const data = location.state?.data || {};
  // Menentukan rute gerbang kembali berdasarkan jenis kendaraan ('/exit/motor' atau '/exit')
  const jalurKembali = location.state?.jenisKendaraan === 'MOTOR' ? '/exit/motor' : '/exit';
  
  // Inisialisasi state currentTime bertipe string untuk menyimpan jam terkini
  const [currentTime, setCurrentTime] = useState('');

  // Hook useEffect untuk timer redirect otomatis dan interval jam
  useEffect(() => {
    // Mengatur timer untuk otomatis mengembalikan kios ke layar standby setelah 10 detik
    const timer = setTimeout(() => {
      // Mengarahkan kembali ke terminal standby keluar
      navigate(jalurKembali);
    }, 10000);

    // Mengatur interval untuk memperbarui teks jam setiap detik
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour12: false }));
    }, 1000);

    // Membersihkan timer dan interval saat komponen di-unmount
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [navigate, jalurKembali]);

  // Mengembalikan elemen JSX antarmuka bukti bayar lunas
  return (
    // Kontainer layar penuh berlatar gelap dengan motif radial gradasi hijau emerald
    <div className="bg-[#121212] text-white min-h-screen flex flex-col items-center justify-center relative overflow-hidden" 
         style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(46, 139, 87, 0.05) 0%, transparent 50%)' }}>
      
      {/* Kontainer konten utama di tengah layar */}
      <main className="relative z-10 flex flex-col items-center justify-center w-full max-w-4xl px-6 py-8 h-screen gap-8">
        
        {/* Indikator status terminal di bagian atas */}
        <div className="absolute top-8 flex items-center gap-2">
          {/* Titik indikator hijau menyala berdenyut */}
          <div className="w-3 h-3 rounded-full bg-[#2E8B57] shadow-[0_0_10px_#2E8B57] animate-pulse"></div>
          {/* Teks label status terminal keluar */}
          <span className="font-['Space_Grotesk'] text-sm text-[#bcc8d1] tracking-widest opacity-80 uppercase">EXIT TERMINAL</span>
        </div>

        {/* Status kelulusan pembayaran di bagian tengah */}
        <div className="flex flex-col items-center justify-center mb-12 text-center">
          {/* Ikon centang hijau sukses berukuran 80px */}
          <span className="material-symbols-outlined text-[#2E8B57] mb-4" style={{ fontSize: '80px', fontVariationSettings: "'FILL' 1" }}>
            check_circle
          </span>
          {/* Judul teks LUNAS dengan efek pendaran hijau ganda */}
          <h1 className="font-['Inter'] text-[64px] font-extrabold leading-tight tracking-tight uppercase text-[#2E8B57]" 
              style={{ textShadow: '0 0 15px rgba(46, 139, 87, 0.4), 0 0 40px rgba(46, 139, 87, 0.4)' }}>
            LUNAS
          </h1>
          {/* Instruksi bagi pengemudi untuk melajukan kendaraan melewati palang */}
          <p className="font-['Inter'] text-2xl font-medium tracking-widest mt-2 uppercase text-white">
            Silakan Jalan
          </p>
        </div>

        {/* Kartu rincian identitas kendaraan dan biaya parkir */}
        <div className="w-full space-y-4 max-w-[540px]">
          {/* Kotak penampil plat nomor kendaraan yang terdeteksi */}
          <div className="bg-[#252b2f] border border-[#3d4850] rounded-xl p-6 flex flex-col items-center py-10">
            <p className="font-['Space_Grotesk'] text-sm text-[#bcc8d1] mb-3 uppercase tracking-widest">Detected Plate</p>
            <div className="bg-[#0e1418] border-2 border-[#2E8B57]/50 rounded-lg px-12 py-6">
              <span className="font-['Space_Grotesk'] text-5xl font-bold text-white tracking-[0.2em]">
                {data.platNomor || "AB 1234 CD"}
              </span>
            </div>
            {/* Keterangan biaya parkir: menampilkan bebas biaya jika grace period, atau total tarif terpotong */}
            {data.totalBiaya !== undefined && (
              <p className="text-emerald-400 font-mono text-sm mt-4 font-semibold">
                {data.totalBiaya === 0 ? "Bebas Biaya (Grace Period ≤ 10 Menit)" : `Total Biaya: Rp ${Number(data.totalBiaya).toLocaleString('id-ID')} (LUNAS)`}
              </p>
            )}
          </div>
          
          {/* Kotak penampilan jam waktu pembayaran keluar */}
          <div className="bg-[#252b2f] border border-[#3d4850] rounded-xl p-8 flex justify-between items-center px-6">
            <span className="font-['Space_Grotesk'] text-sm text-[#bcc8d1] uppercase tracking-widest">Time</span>
            <span className="font-['Space_Grotesk'] text-2xl font-bold text-white tracking-wider">
              {currentTime}
            </span>
          </div>
        </div>

        {/* Indikator status sistem online di bagian bawah */}
        <div className="absolute bottom-8 flex items-center gap-2 text-[#bcc8d1]">
          <span className="material-symbols-outlined text-[#00BFFF]" style={{ fontSize: '18px' }}>cloud_done</span>
          <span className="font-['Space_Grotesk'] text-sm tracking-widest opacity-80 uppercase">SISTEM ONLINE</span>
        </div>
      </main>
    </div>
  );
}
