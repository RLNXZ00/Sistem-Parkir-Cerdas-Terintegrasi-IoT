// Import hook useNavigate dari react-router-dom untuk navigasi antar halaman
import { useNavigate } from 'react-router-dom';
// Import hook useState dari react untuk mengelola state lokal komponen
import { useState } from 'react';
// Import komponen JenisKendaraanToggle dari folder components untuk tombol pengubah tipe kendaraan
import JenisKendaraanToggle from '../components/JenisKendaraanToggle';

// Deklarasi fungsi komponen publik ScanPage untuk antarmuka pemindaian gerbang masuk
export default function ScanPage({ jenis = 'MOBIL' }) {
  // Inisialisasi fungsi navigate menggunakan hook useNavigate
  const navigate = useNavigate();
  // Evaluasi kondisi boolean apakah jenis kendaraan yang dipilih adalah motor
  const isMotor = jenis === 'MOTOR';
  // Penentuan label kamera siaran langsung berdasarkan tipe gerbang masuk (kamera motor atau mobil)
  const labelKamera = isMotor ? 'GATE_IN_02_LIVE' : 'GATE_IN_01_LIVE';
  // Inisialisasi state isScanning bertipe boolean dengan nilai awal false untuk status proses pemindaian
  const [isScanning, setIsScanning] = useState(false);
  // Inisialisasi state errorMsg bertipe string atau null untuk menyimpan pesan galat jika koneksi gagal
  const [errorMsg, setErrorMsg] = useState(null);

  // Inisialisasi state customPlate bertipe string dengan nilai acak awal berformat plat nomor Indonesia
  const [customPlate, setCustomPlate] = useState(() => `B ${Math.floor(1000 + Math.random() * 9000)} SPCT`);

  // Deklarasi fungsi generateNewPlate untuk menghasilkan nomor plat simulasi baru secara acak
  const generateNewPlate = () => {
    // Membuat string plat nomor baru dengan format 4 digit angka acak
    const newPlate = `B ${Math.floor(1000 + Math.random() * 9000)} SPCT`;
    // Memperbarui state customPlate dengan nomor plat yang baru dibuat
    setCustomPlate(newPlate);
    // Mengembalikan nilai plat nomor baru
    return newPlate;
  };

  // Deklarasi fungsi asinkron simulateCarArrival untuk memicu kedatangan kendaraan dan integrasi API backend
  const simulateCarArrival = async () => {
    // Jika proses pemindaian sedang berjalan, hentikan eksekusi fungsi
    if (isScanning) return;
    // Mengubah state isScanning menjadi true untuk menampilkan indikator loading pemindaian
    setIsScanning(true);
    // Mereset pesan galat menjadi null
    setErrorMsg(null);
    
    // Menetapkan plat nomor aktif dari state customPlate atau fallback ke plat acak baru
    const activePlate = customPlate || `B ${Math.floor(1000 + Math.random() * 9000)} SPCT`;

    try {
      // Mengirimkan permintaan HTTP POST ke endpoint backend /api/gate/masuk melalui proxy Vite
      const response = await fetch(`/api/gate/masuk?platNomor=${encodeURIComponent(activePlate)}&jenisKendaraan=${jenis}&confidence=1.0`, {
        method: 'POST',
      });
      
      // Jika respons HTTP tidak berhasil (status code bukan 2xx), lempar pengecualian Error
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Mengonversi data respons backend ke dalam format JSON
      const data = await response.json();
      // Menampilkan log data respons backend ke konsol pengembang
      console.log("Response dari Backend:", data);
      
      // Menyiapkan format plat nomor acak berikutnya untuk simulasi pemindaian mendatang
      const nextPlate = `B ${Math.floor(1000 + Math.random() * 9000)} SPCT`;
      
      // Navigasikan pengguna ke halaman alokasi rute (/allocating) dengan membawa data state hasil backend
      navigate('/allocating', { 
        state: { 
          platNomor: activePlate,
          jenisKendaraan: jenis,
          slotDialokasikan: data.slotDialokasikan,
          slotData: {
            idSlotDialokasikan: data.slotDialokasikan,
            urutan: data.jalurRuteGraf
          }
        } 
      });

    } catch (error) {
      // Menampilkan pesan galat ke konsol jika koneksi atau pemrosesan permintaan API gagal
      console.error("Gagal terhubung ke server:", error);
      // Memperbarui state errorMsg untuk menampilkan pesan peringatan di antarmuka kiosk
      setErrorMsg("Koneksi ke Server SPCT Gagal. Pastikan Backend menyala.");
      // Mengembalikan status isScanning menjadi false karena proses pemindaian terhenti
      setIsScanning(false);
    }
  };

  // Mengembalikan elemen JSX antarmuka pemindaian kamera gerbang masuk
  return (
    // Wadah utama layar kiosk dengan tema gelap futuristik dan penataan fleksibel di tengah layar
    <div className="bg-[#050B14] min-h-screen flex flex-col items-center justify-center relative overflow-hidden text-slate-100">
      {/* Header bagian atas berisi status operasional sistem IoT dan kontrol navigasi */}
      <header className="absolute top-0 left-0 w-full px-container-margin py-gutter flex justify-between items-start z-10 mt-4 px-8">
        {/* Indikator status kesiapan sistem dengan animasi denyut cahaya biru */}
        <div className="flex items-center gap-3 bg-[#0B1526]/80 backdrop-blur-md px-4 py-2 rounded-full border border-slate-700/50">
          <span className="w-3 h-3 rounded-full bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.6)] animate-pulse"></span>
          <span className="font-['Space_Grotesk'] text-sky-400 uppercase text-[14px] font-semibold">System Ready</span>
        </div>
        {/* Bagian kontrol switch jenis kendaraan, tombol keluar, dan label kamera */}
        <div className="flex items-center gap-4">
          {/* Komponen pengganti jenis kendaraan mobil atau motor */}
          <JenisKendaraanToggle jenis={jenis} onChange={(j) => navigate(j === 'MOTOR' ? '/motor' : '/')} />
          {/* Tombol navigasi untuk berpindah ke gerbang keluar (exit kiosk) */}
          <button 
            onClick={() => navigate(isMotor ? '/exit/motor' : '/exit')}
            className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 px-4 py-1.5 rounded-full border border-slate-600 transition-colors cursor-pointer text-sm font-['Space_Grotesk']"
          >
            <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
            Switch to Exit
          </button>
          {/* Indikator nama feed video kamera gerbang masuk aktif */}
          <div className="flex items-center gap-2 text-slate-400 font-['Space_Grotesk'] text-[14px] bg-[#0B1526]/50 px-3 py-1 rounded-full border border-slate-800">
            <span className="material-symbols-outlined text-[18px]">videocam</span>
            <span>{labelKamera}</span>
          </div>
        </div>
      </header>

      {/* Konten utama antarmuka pemindaian plat nomor */}
      <main className="flex flex-col items-center justify-center w-full max-w-lg mx-auto px-container-margin z-10 relative">
        {/* Bingkai visual bidikan kamera (scanner reticle UI) */}
        <div className="relative w-full max-w-[320px] aspect-[16/9] border border-slate-700/50 rounded-xl bg-[#0B1526]/30 backdrop-blur-sm mb-12 flex items-center justify-center shadow-lg">
          {/* Sudut bidik kiri atas */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-sky-400 rounded-tl-xl opacity-80"></div>
          {/* Sudut bidik kanan atas */}
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-sky-400 rounded-tr-xl opacity-80"></div>
          {/* Sudut bidik kiri bawah */}
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-sky-400 rounded-bl-xl opacity-80"></div>
          {/* Sudut bidik kanan bawah */}
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-sky-400 rounded-br-xl opacity-80"></div>
          
          {/* Garis pemindai horizontal yang muncul dengan animasi denyut saat proses scan berlangsung */}
          {isScanning && <div className="absolute top-1/3 left-0 w-full h-[2px] bg-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.9)] animate-[pulse_1s_ease-in-out_infinite]"></div>}
          
          {/* Lapisan gradien halus pada latar bidikan kamera */}
          <div className="absolute inset-0 bg-gradient-to-b from-sky-500/5 via-transparent to-transparent rounded-xl"></div>
          
          {/* Ikon kendaraan di tengah bidikan scanner */}
          <span className="material-symbols-outlined text-[64px] text-sky-500/30" style={{ fontVariationSettings: "'FILL' 1" }}>{isMotor ? 'two_wheeler' : 'directions_car'}</span>
        </div>

        {/* Bagian teks instruksi dan tombol aksi */}
        <div className="text-center flex flex-col gap-6 w-full">
          {/* Judul status instruksi kedatangan */}
          <h1 className="text-[48px] font-bold text-slate-100 tracking-tight drop-shadow-md text-glow">
            {isScanning ? "MEMINDAI..." : "SILAKAN MAJU"}
          </h1>
          
          {/* Tampilan pesan galat jika terjadi kendala komunikasi dengan server backend */}
          {errorMsg && (
            <p className="text-red-400 font-semibold bg-red-900/20 px-4 py-2 rounded-lg border border-red-500/30">
              {errorMsg}
            </p>
          )}

          {/* Kartu lencana plat nomor simulasi */}
          <div className="flex items-center justify-between bg-slate-900/60 border border-slate-700/60 rounded-xl px-4 py-2.5 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sky-400 text-sm">tag</span>
              <span className="text-xs uppercase tracking-wider text-slate-400 font-['Space_Grotesk']">Plat Simulasi:</span>
              <span className="font-mono font-bold text-sky-300 text-sm">{customPlate}</span>
            </div>
            {/* Tombol untuk mengacak plat simulasi lainnya */}
            <button
              type="button"
              onClick={generateNewPlate}
              className="text-xs text-slate-400 hover:text-sky-300 flex items-center gap-1 transition-colors px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700"
              title="Acak Plat Lain"
            >
              <span className="material-symbols-outlined text-xs">autorenew</span>
              <span>Acak</span>
            </button>
          </div>

          {/* Tombol pemicu simulasi kedatangan kendaraan */}
          <button 
            onClick={simulateCarArrival}
            disabled={isScanning}
            className="glass-button px-8 py-4 rounded-xl w-full flex items-center justify-center gap-3 cursor-pointer"
          >
            <span className="material-symbols-outlined animate-spin">radar</span>
            <span>{isScanning ? "Menghubungi Server..." : (isMotor ? "Simulasi Motor Datang" : "Simulasi Mobil Datang")}</span>
          </button>
        </div>
      </main>

      {/* Bagian catatan kaki dengan identitas tim SPCT */}
      <footer className="absolute bottom-0 left-0 w-full pb-8 px-container-margin flex justify-center items-center z-10">
        <div className="flex items-center gap-4 border-t border-slate-700/50 pt-4 w-full max-w-md justify-center">
          <span className="font-['Space_Grotesk'] text-slate-500 text-[12px] uppercase tracking-widest">Powered by SPCT IoT Team</span>
        </div>
      </footer>
    </div>
  );
}
