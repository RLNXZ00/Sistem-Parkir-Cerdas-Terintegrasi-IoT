// Import hook useNavigate dari react-router-dom untuk navigasi antar halaman
import { useNavigate } from 'react-router-dom';
// Import hook useState dan useEffect dari react untuk manajemen state dan efek samping
import { useState, useEffect } from 'react';
// Import komponen JenisKendaraanToggle dari folder components untuk seleksi jenis kendaraan
import JenisKendaraanToggle from '../components/JenisKendaraanToggle';
// Import komponen PanelSimulasiExit untuk mengatur parameter simulasi saldo dan durasi parkir
import PanelSimulasiExit from '../components/PanelSimulasiExit';

// Deklarasi fungsi komponen publik ExitScanPage untuk memproses pemindaian gerbang keluar
export default function ExitScanPage({ jenis = 'MOBIL' }) {
  // Inisialisasi fungsi navigate menggunakan hook useNavigate
  const navigate = useNavigate();
  // Evaluasi boolean apakah jenis kendaraan yang aktif adalah motor
  const isMotor = jenis === 'MOTOR';
  // Penentuan identitas label kamera gerbang keluar berdasarkan tipe kendaraan
  const labelKamera = isMotor ? 'PG_EXIT_02' : 'PG_EXIT_01';
  // Inisialisasi state isScanning bertipe boolean dengan nilai awal false
  const [isScanning, setIsScanning] = useState(false);
  // Inisialisasi state errorMsg bertipe string atau null untuk menyimpan pesan kesalahan
  const [errorMsg, setErrorMsg] = useState(null);
  
  // Inisialisasi state antrean bertipe array kosong untuk menampung daftar antrean kendaraan di dalam parkiran
  const [antrean, setAntrean] = useState([]);
  // Inisialisasi state isLoadingAntrean bertipe boolean dengan nilai awal true
  const [isLoadingAntrean, setIsLoadingAntrean] = useState(true);

  // Inisialisasi state saldo bertipe number dengan nilai awal Rp 50.000 untuk simulasi saldo e-wallet
  const [saldo, setSaldo] = useState(50000); 
  // Inisialisasi state durasiSimulasi bertipe number dengan nilai awal 60 menit untuk durasi parkir
  const [durasiSimulasi, setDurasiSimulasi] = useState(60);

  // Hook useEffect untuk memuat data antrean kendaraan keluar secara periodik setiap 2 detik
  useEffect(() => {
    // Deklarasi fungsi asinkron fetchAntrean untuk mengambil antrean FIFO dari backend
    const fetchAntrean = async () => {
      try {
        // Mengirimkan permintaan HTTP GET ke endpoint antrean keluar sesuai jenis kendaraan
        const res = await fetch(`/api/gate/antrean-keluar?jenisKendaraan=${jenis}`);
        // Jika respons berhasil diterima, perbarui state antrean
        if (res.ok) {
          // Mengurai data JSON hasil respons antrean
          const data = await res.json();
          // Memperbarui state antrean dengan data kendaraan aktif
          setAntrean(data);
        }
      } catch (err) {
        // Menampilkan pesan kesalahan jika gagal memuat antrean kendaraan keluar
        console.error("Gagal memuat antrean kendaraan keluar:", err);
      } finally {
        // Mengubah status loading antrean menjadi false setelah proses fetch selesai
        setIsLoadingAntrean(false);
      }
    };

    // Memanggil fungsi fetchAntrean pertama kali saat komponen dimuat
    fetchAntrean();
    // Memasang interval timer untuk menjalankan fetchAntrean setiap 2000 milidetik (2 detik)
    const interval = setInterval(fetchAntrean, 2000);
    // Membersihkan interval timer saat komponen di-unmount atau dependensi jenis berubah
    return () => clearInterval(interval);
  }, [jenis]);

  // Mengambil kendaraan antrean terdepan indeks ke-0 (prinsip antrean FIFO) jika ada
  const kendaraanTerdepan = antrean.length > 0 ? antrean[0] : null;

  // Deklarasi fungsi asinkron simulateExitArrival untuk memproses kepulangan kendaraan dan pembayaran
  const simulateExitArrival = async () => {
    // Jika sedang dalam proses pemindaian, hentikan eksekusi
    if (isScanning) return;
    // Jika tidak terdapat kendaraan dalam antrean parkir aktif, tampilkan pesan peringatan
    if (!kendaraanTerdepan && antrean.length === 0) {
      setErrorMsg("Tidak ada kendaraan yang sedang parkir di dalam area parkir.");
      return;
    }

    // Mengaktifkan status proses pemindaian
    setIsScanning(true);
    // Mereset pesan galat menjadi null
    setErrorMsg(null);
    
    // Menetapkan nomor plat kendaraan terdepan dari antrean
    const platKeluar = kendaraanTerdepan ? kendaraanTerdepan.platNomor : "QUEUE";

    try {
      // Mengirimkan permintaan HTTP POST ke endpoint /api/gate/keluar beserta parameter simulasi JSON
      const response = await fetch('/api/gate/keluar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            platNomor: platKeluar,
            jenisKendaraan: jenis,
            saldoEwallet: Number(saldo),
            durasiMenit: Number(durasiSimulasi)
        })
      });
      
      // Mengurai data respons transaksi keluar dari backend
      const data = await response.json();
      // Menampilkan log data keluaran backend ke konsol
      console.log("Response dari Backend (Exit):", data);

      // Jika kode status adalah 402 (Payment Required) atau status transaksi SALDO_KURANG
      if (response.status === 402 || data.status === "SALDO_KURANG") {
        // Navigasikan pengguna ke halaman kegagalan transaksi keluar (/exit/failed)
        navigate('/exit/failed', { state: { data, jenisKendaraan: jenis } });
        return;
      }
      
      // Jika status respons tidak sukses (non-2xx), tampilkan pesan kesalahan
      if (!response.ok) {
        setErrorMsg(data.pesan || data.pesanKeterangan || `Server error: ${response.status}`);
        setIsScanning(false);
        return;
      }
      
      // Jika pembayaran dan validasi berhasil, arahkan ke halaman transaksi berhasil (/exit/success)
      navigate('/exit/success', { state: { data, jenisKendaraan: jenis } });

    } catch (error) {
      // Menangkap dan menampilkan galat koneksi jaringan ke konsol
      console.error("Gagal terhubung ke server:", error);
      // Menampilkan pesan galat kegagalan koneksi di antarmuka
      setErrorMsg("Koneksi ke Server SPCT Gagal.");
      // Menonaktifkan status pemindaian
      setIsScanning(false);
    }
  };

  // Mengembalikan elemen antarmuka JSX untuk halaman pemindaian gerbang keluar
  return (
    // Wadah utama layar kiosk keluar dengan latar belakang gelap dan posisi terpusat
    <div className="bg-[#050B14] min-h-screen flex flex-col items-center justify-center relative overflow-hidden text-slate-100">
      {/* Header bar informasi status sistem IoT dan navigasi antar gerbang */}
      <header className="absolute top-0 left-0 w-full px-container-margin py-gutter flex justify-between items-start z-10 mt-4 px-8">
        {/* Indikator status gerbang keluar siap beroperasi dengan warna hijau */}
        <div className="flex items-center gap-3 bg-[#0B1526]/80 backdrop-blur-md px-4 py-2 rounded-full border border-slate-700/50">
          <span className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></span>
          <span className="font-['Space_Grotesk'] text-green-400 uppercase text-[14px] font-semibold tracking-wider">System Ready (EXIT)</span>
        </div>
        {/* Kelompok tombol navigasi toggle kendaraan, ganti ke gerbang masuk, dan info kamera */}
        <div className="flex items-center gap-4">
          {/* Komponen toggle jenis kendaraan dengan aksen warna merah untuk gerbang keluar */}
          <JenisKendaraanToggle jenis={jenis} accent="red" onChange={(j) => navigate(j === 'MOTOR' ? '/exit/motor' : '/exit')} />
          {/* Tombol navigasi untuk berpindah ke kiosk gerbang masuk */}
          <button 
            onClick={() => navigate(isMotor ? '/motor' : '/')}
            className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 px-4 py-1.5 rounded-full border border-slate-600 transition-colors cursor-pointer text-sm font-['Space_Grotesk'] tracking-wider"
          >
            <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
            Switch to Entrance
          </button>
          {/* Label penanda feed video kamera gerbang keluar aktif */}
          <div className="flex items-center gap-2 text-slate-400 font-['Space_Grotesk'] text-[14px] bg-[#0B1526]/50 px-3 py-1 rounded-full border border-slate-800 tracking-wider">
            <span className="material-symbols-outlined text-[18px]">videocam</span>
            <span>{labelKamera}</span>
          </div>
        </div>
      </header>

      {/* Konten utama antarmuka kiosk keluar */}
      <main className="flex flex-col items-center justify-center w-full max-w-lg mx-auto px-container-margin z-10 relative">
        
        {/* Panel komponen simulasi saldo e-wallet dan durasi menit parkir */}
        <PanelSimulasiExit
          saldo={saldo}
          setSaldo={setSaldo}
          durasi={durasiSimulasi}
          setDurasi={setDurasiSimulasi}
        />

        {/* Bingkai visual bidikan kamera pemindai gerbang keluar dengan indikator kendaraan antrean */}
        <div className="relative w-full max-w-[320px] aspect-[16/9] border border-slate-700/50 rounded-xl bg-[#0B1526]/30 backdrop-blur-sm mb-12 flex items-center justify-center shadow-lg">
          {/* Penanda sudut kiri atas reticle */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-red-400 rounded-tl-xl opacity-80"></div>
          {/* Penanda sudut kanan atas reticle */}
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-red-400 rounded-tr-xl opacity-80"></div>
          {/* Penanda sudut kiri bawah reticle */}
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-red-400 rounded-bl-xl opacity-80"></div>
          {/* Penanda sudut kanan bawah reticle */}
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-red-400 rounded-br-xl opacity-80"></div>
          
          {/* Garis pemindai horizontal aktif dengan animasi denyut merah */}
          {isScanning && <div className="absolute top-1/3 left-0 w-full h-[2px] bg-red-400 shadow-[0_0_15px_rgba(248,113,113,0.9)] animate-[pulse_1s_ease-in-out_infinite]"></div>}
          {/* Lapisan gradien halus merah untuk estetika sensor keluar */}
          <div className="absolute inset-0 bg-gradient-to-b from-red-500/5 via-transparent to-transparent rounded-xl"></div>
          
          {/* Konten reticle: menampilkan status loading, informasi kendaraan antrean terdepan, atau pesan parkiran kosong */}
          {isLoadingAntrean ? (
            <span className="text-xs font-mono text-slate-400 animate-pulse">Mendeteksi kendaraan...</span>
          ) : kendaraanTerdepan ? (
            <div className="flex flex-col items-center gap-1.5 z-10 px-4 text-center">
              {/* Lencana penanda urutan antrean FIFO */}
              <span className="text-[10px] tracking-widest uppercase font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                Antrean 1 dari {antrean.length}
              </span>
              {/* Nomor plat kendaraan terdepan */}
              <span className="font-mono text-2xl font-bold tracking-widest text-slate-100 drop-shadow-[0_0_12px_rgba(255,255,255,0.4)] flex items-center gap-2">
                <span className="material-symbols-outlined text-[26px] text-red-400/80" style={{ fontVariationSettings: "'FILL' 1" }}>{isMotor ? 'two_wheeler' : 'directions_car'}</span>
                {kendaraanTerdepan.platNomor}
              </span>
              {/* Informasi kode slot parkir kendaraan yang akan keluar */}
              <span className="text-xs font-mono text-slate-400">
                Posisi Slot: <strong className="text-emerald-400 font-bold">{kendaraanTerdepan.idSlot}</strong>
              </span>
            </div>
          ) : (
            // Tampilan saat tidak ada kendaraan yang terparkir di area
            <div className="flex flex-col items-center gap-1 z-10 text-center px-4">
              <span className="material-symbols-outlined text-[42px] text-slate-600 mb-1" style={{ fontVariationSettings: "'FILL' 0" }}>{isMotor ? 'two_wheeler' : 'directions_car'}</span>
              <span className="font-mono text-xs text-slate-400 tracking-wider">AREA PARKIR KOSONG</span>
              <span className="text-[10px] text-slate-500">Semua kendaraan sudah keluar</span>
            </div>
          )}
        </div>

        {/* Bagian judul instruksi dan tombol pemroses keluar */}
        <div className="text-center flex flex-col gap-6 w-full">
          {/* Teks judul instruksi pintu keluar */}
          <h1 className="text-[48px] font-bold text-slate-100 tracking-tight drop-shadow-md text-glow">
            {isScanning ? "MEMPROSES..." : "PINTU KELUAR"}
          </h1>
          
          {/* Tampilan pesan galat jika proses pemrosesan mengalami kendala */}
          {errorMsg && (
            <p className="text-red-400 font-semibold bg-red-900/20 px-4 py-2 rounded-lg border border-red-500/30">
              {errorMsg}
            </p>
          )}

          {/* Tombol aksi pemrosesan keluar kendaraan terhubung dengan antrean FIFO */}
          <button 
            onClick={simulateExitArrival}
            disabled={isScanning || (!kendaraanTerdepan && antrean.length === 0)}
            className={`px-8 py-4 rounded-xl mt-4 w-full max-w-sm mx-auto flex items-center justify-center gap-3 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.5)] ${
              !kendaraanTerdepan && antrean.length === 0
                ? 'bg-slate-800/40 border border-slate-700/40 text-slate-500 cursor-not-allowed'
                : 'bg-[#0f1b2e] hover:bg-[#1a2c47] border border-slate-700 text-red-400 cursor-pointer active:scale-95'
            }`}
          >
            {/* Ikon status pemindaian atau pemrosesan */}
            <span className="material-symbols-outlined font-light">
              {isScanning ? "sync" : "qr_code_scanner"}
            </span>
            {/* Teks label tombol sesuai kondisi antrean dan pemindaian */}
            <span className="font-semibold tracking-wide text-sm font-mono">
              {isScanning 
                ? "Memproses Pembayaran..." 
                : kendaraanTerdepan 
                  ? `Keluar: ${kendaraanTerdepan.platNomor} (${kendaraanTerdepan.idSlot})`
                  : "Tidak Ada Kendaraan di Parkiran"
              }
            </span>
          </button>
        </div>
      </main>

      {/* Footer merek dagang sistem parkir terintegrasi */}
      <footer className="absolute bottom-0 left-0 w-full pb-8 px-container-margin flex justify-center items-center z-10">
        <div className="flex items-center gap-4 border-t border-slate-700/50 pt-4 w-full max-w-md justify-center">
          <span className="font-['Space_Grotesk'] text-slate-500 text-[12px] uppercase tracking-widest font-semibold">Powered by PARK-TECH</span>
        </div>
      </footer>
    </div>
  );
}
