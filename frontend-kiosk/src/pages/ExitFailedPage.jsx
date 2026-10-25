// Import hook useLocation dan useNavigate dari react-router-dom untuk membaca parameter dan navigasi
import { useLocation, useNavigate } from 'react-router-dom';
// Import hook useEffect dari React untuk mengatur timer otomatis kembali ke standby
import { useEffect } from 'react';

// Deklarasi fungsi komponen publik ExitFailedPage untuk menampilkan antarmuka notifikasi pembayaran gagal
export default function ExitFailedPage() {
  // Inisialisasi hook location untuk mengambil data respon kesalahan dari state rute
  const location = useLocation();
  // Inisialisasi hook navigate untuk mengarahkan pengguna
  const navigate = useNavigate();
  // Mengambil data respon kegagalan dari location state
  const data = location.state?.data || {};
  // Menentukan jalur rute gerbang asal berdasarkan jenis kendaraan ('/exit/motor' atau '/exit')
  const jalurKembali = location.state?.jenisKendaraan === 'MOTOR' ? '/exit/motor' : '/exit';

  // Hook useEffect untuk timer pengalihan kembali otomatis ke layar standby
  useEffect(() => {
    // Mengatur timer 15 detik sebelum otomatis kembali ke terminal standby keluar
    const timer = setTimeout(() => {
      navigate(jalurKembali);
    }, 15000);

    // Membersihkan timer saat komponen di-unmount
    return () => clearTimeout(timer);
  }, [navigate, jalurKembali]);

  // Mengembalikan elemen JSX antarmuka kesalahan pembayaran saldo kurang
  return (
    // Kontainer layar penuh berlatar gelap pekat dengan posisi relatif
    <div className="bg-[#121212] text-[#dee3e8] h-screen w-screen overflow-hidden flex flex-col items-center justify-center relative">
      
      {/* Elemen latar belakang dekoratif gradasi radial merah menyala */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-10" 
           style={{ backgroundImage: 'radial-gradient(circle at center, rgba(255, 69, 0, 0.3) 0%, transparent 70%)' }}></div>
      {/* Garis-garis pemindai CRT dekoratif */}
      <div className="absolute inset-0 z-0 pointer-events-none" 
           style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)' }}></div>

      {/* Kontainer konten utama di tengah layar */}
      <main className="w-full max-w-5xl mx-auto flex flex-col items-center justify-center gap-12 mt-24 px-6 z-10 relative">
        
        {/* Ikon peringatan tanda seru berukuran besar */}
        <div className="relative">
          {/* Efek pendaran merah blur berdenyut di latar ikon */}
          <div className="absolute inset-0 bg-[#FF4500] opacity-20 blur-3xl rounded-full scale-150 animate-pulse"></div>
          {/* Ikon error merah dari Material Symbols */}
          <span className="material-symbols-outlined text-[120px] text-[#FF4500] relative z-10" style={{ fontVariationSettings: "'FILL' 1" }}>
            error
          </span>
        </div>

        {/* Teks status peringatan utama */}
        <div className="text-center flex flex-col gap-4">
          {/* Judul peringatan merah SALDO KURANG */}
          <h2 className="font-['Inter'] text-[48px] font-bold text-[#FF4500] animate-[pulse_1s_cubic-bezier(0.4,0,0.6,1)_infinite] uppercase tracking-widest drop-shadow-[0_0_15px_rgba(255,69,0,0.8)]">
            SALDO KURANG
          </h2>
          {/* Instruksi bagi pengemudi untuk mengisi saldo atau mengganti metode bayar */}
          <p className="font-['Inter'] text-[24px] font-semibold text-white opacity-90 max-w-2xl mx-auto leading-relaxed">
            Mohon lakukan pengisian saldo atau gunakan metode pembayaran lain
          </p>
        </div>

        {/* Kartu rincian identitas kendaraan, total tagihan, dan aksi pengemudi */}
        <div className="rounded-xl p-8 w-full max-w-xl flex flex-col items-center gap-6 mt-8" 
             style={{ background: 'rgba(30, 30, 30, 0.7)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 69, 0, 0.2)', boxShadow: '0 0 40px rgba(255, 69, 0, 0.4)' }}>
          <span className="font-['Space_Grotesk'] text-[16px] text-[#9E9E9E] uppercase tracking-wider">
            Detected License Plate
          </span>
          {/* Kotak penampilan plat nomor kendaraan */}
          <div className="rounded-lg px-8 flex items-center justify-center w-full bg-[#dee3e8]/5 border border-[#dee3e8]/10 py-6">
            <span className="font-['Space_Grotesk'] text-[40px] font-bold tracking-[0.2em] text-white">
              {data.platNomor || "AB 1234 CD"}
            </span>
          </div>

          {/* Informasi rincian nominal tagihan biaya dan durasi parkir */}
          <div className="w-full text-center mt-2 flex flex-col gap-2">
            <p className="text-lg text-slate-300">Biaya: Rp {data.totalBiaya?.toLocaleString()}</p>
            <p className="text-sm text-slate-400">Durasi: {data.durasiJam} Jam</p>
          </div>

          {/* Tombol aksi pemulihan transaksi */}
          <div className="flex w-full gap-4 mt-4">
            {/* Tombol coba ulang scan kartu e-toll / QRIS */}
            <button 
              onClick={() => navigate(jalurKembali)}
              className="flex-1 hover:bg-[#343a3e] text-[#dee3e8] font-['Inter'] text-[16px] py-4 rounded-lg transition-colors border border-[#3d4850] flex items-center justify-center gap-2 bg-white/10"
            >
              <span className="material-symbols-outlined">refresh</span>
              <span className="font-['Space_Grotesk'] uppercase tracking-widest font-semibold">RETRY CARD</span>
            </button>
            {/* Tombol panggil bantuan petugas pos keluar rumah sakit */}
            <button className="flex-1 bg-[#FF4500]/20 hover:bg-[#FF4500]/30 text-[#FF4500] font-['Inter'] text-[16px] py-4 rounded-lg transition-colors border border-[#FF4500] flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">support_agent</span>
              <span className="font-['Space_Grotesk'] uppercase tracking-widest font-semibold">CALL ASSISTANCE</span>
            </button>
          </div>
        </div>
      </main>

      {/* Indikator status sistem online di bagian footer */}
      <div className="absolute bottom-8 flex items-center gap-2 text-[#bcc8d1]">
        <span className="material-symbols-outlined text-[#00BFFF]" style={{ fontSize: '18px' }}>cloud_done</span>
        <span className="font-['Space_Grotesk'] text-[14px] tracking-widest opacity-80 uppercase">SISTEM ONLINE</span>
      </div>
    </div>
  );
}
