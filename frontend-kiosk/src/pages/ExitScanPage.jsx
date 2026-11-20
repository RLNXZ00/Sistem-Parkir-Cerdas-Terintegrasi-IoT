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
  // Inisialisasi state teks status saat pemindaian keluar berlangsung
  const [scanStatusText, setScanStatusText] = useState('MEMPROSES...');

  // State mode pemindaian keluar: 'ALPR' (Kamera Laptop On-Demand) atau 'VIRTUAL' (Antrean FIFO)
  const [scanMode, setScanMode] = useState(() => localStorage.getItem('spct_scan_mode') || 'ALPR');
  // State alamat URL Edge ALPR microservice laptop
  const [laptopUrl, setLaptopUrl] = useState(() => localStorage.getItem('spct_laptop_url') || '');
  // State untuk modal konfigurasi IP laptop
  const [showConfigModal, setShowConfigModal] = useState(false);
  
  // Inisialisasi state antrean bertipe array kosong untuk menampung daftar antrean kendaraan di dalam parkiran
  const [antrean, setAntrean] = useState([]);
  // Inisialisasi state isLoadingAntrean bertipe boolean dengan nilai awal true
  const [isLoadingAntrean, setIsLoadingAntrean] = useState(true);

  // Inisialisasi state saldo bertipe number dengan nilai awal Rp 50.000 untuk simulasi saldo e-wallet
  const [saldo, setSaldo] = useState(50000); 
  // Inisialisasi state durasiSimulasi bertipe number dengan nilai default 0 (Real-time / Waktu Sebenarnya)
  const [durasiSimulasi, setDurasiSimulasi] = useState(() => {
    // Membaca preferensi durasi simulasi yang tersimpan di localStorage browser
    const durasiTersimpan = localStorage.getItem('spct_exit_durasi_simulasi');
    // Jika ada nilai tersimpan kembalikan nilai tersebut, jika tidak gunakan default 0 (Real-time)
    return durasiTersimpan !== null ? Number(durasiTersimpan) : 0;
  });

  // Fungsi handler ubahDurasiSimulasi untuk menyimpan nilai durasi terpilih ke state dan localStorage
  const ubahDurasiSimulasi = (nilaiDurasi) => {
    // Mengubah state durasiSimulasi dengan nilai durasi baru
    setDurasiSimulasi(Number(nilaiDurasi));
    // Menyimpan pilihan durasi ke localStorage agar persisten antar navigasi gerbang
    localStorage.setItem('spct_exit_durasi_simulasi', String(nilaiDurasi));
  };

  // Fungsi toggle mode pemindaian keluar
  const toggleScanMode = (mode) => {
    setScanMode(mode);
    localStorage.setItem('spct_scan_mode', mode);
    setErrorMsg(null);
  };

  // Fungsi menyimpan konfigurasi alamat IP laptop
  const simpanPengaturanLaptop = (e) => {
    e.preventDefault();
    localStorage.setItem('spct_laptop_url', laptopUrl.trim());
    setShowConfigModal(false);
  };

  // Hook useEffect untuk memuat data antrean kendaraan keluar secara periodik setiap 2 detik
  useEffect(() => {
    const fetchAntrean = async () => {
      try {
        const res = await fetch(`/api/gate/antrean-keluar?jenisKendaraan=${jenis}`);
        if (res.ok) {
          const data = await res.json();
          setAntrean(data);
        }
      } catch (err) {
        console.error("Gagal memuat antrean kendaraan keluar:", err);
      } finally {
        setIsLoadingAntrean(false);
      }
    };

    fetchAntrean();
    const interval = setInterval(fetchAntrean, 2000);
    return () => clearInterval(interval);
  }, [jenis]);

  // Mengambil kendaraan antrean terdepan indeks ke-0 (prinsip antrean FIFO) jika ada
  const kendaraanTerdepan = antrean.length > 0 ? antrean[0] : null;

  // Deklarasi fungsi asinkron simulateExitArrival untuk memproses kepulangan kendaraan dan pembayaran
  const simulateExitArrival = async () => {
    if (isScanning) return;
    setIsScanning(true);
    setErrorMsg(null);

    // ─────────────────────────────────────────────────────────────────
    // SKENARIO 1: MODE EDGE ALPR MICROSERVICE (KAMERA LAPTOP ON-DEMAND)
    // ─────────────────────────────────────────────────────────────────
    if (scanMode === 'ALPR') {
      setScanStatusText("KAMERA LAPTOP DIAKTIFKAN... MEMINDAI PLAT KELUAR");

      try {
        const response = await fetch('/api/gate/trigger-scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gerbang: 'KELUAR',
            jenisKendaraan: jenis,
            saldoEwallet: Number(saldo),
            durasiMenit: Number(durasiSimulasi),
            laptopUrl: laptopUrl.trim() || undefined
          })
        });

        const resData = await response.json();
        console.log("[ALPR EXIT RESPONSE]", resData);

        // Jika transaksi keluar dan pembayaran berhasil
        if (response.ok && resData.status === 'SUKSES' && resData.data) {
          navigate('/exit/success', { state: { data: resData.data, jenisKendaraan: jenis } });
          return;
        }

        // Jika saldo e-wallet tidak mencukupi (HTTP 402)
        if (response.status === 402 || resData.status === 'SALDO_KURANG') {
          navigate('/exit/failed', { state: { data: resData.data || resData, jenisKendaraan: jenis } });
          return;
        }

        // Jika jenis kendaraan tidak cocok dengan gerbang keluar
        if (resData.status === 'JENIS_KENDARAAN_MISMATCH') {
          setErrorMsg(resData.pesan || `Ketidaksesuaian gerbang: Kendaraan tidak cocok dengan gerbang keluar ${jenis}.`);
          setIsScanning(false);
          return;
        }

        // Jika integritas slot anomali
        if (resData.status === 'ANOMALI_SLOT_TIDAK_VALID' || resData.status === 'ANOMALI_SLOT_MISMATCH') {
          setErrorMsg(resData.pesan || "Anomali slot terdeteksi: Data slot kendaraan tidak cocok dengan data tiket masuk.");
          setIsScanning(false);
          return;
        }

        // Jika plat tidak ditemukan di database aktif
        if (resData.status === 'KENDARAAN_TIDAK_DITEMUKAN') {
          setErrorMsg(resData.pesan || "Plat nomor tidak ditemukan di dalam area parkir aktif (mungkin belum masuk atau sudah lunas).");
          setIsScanning(false);
          return;
        }

        // Jika kamera gerbang keluar offline di sistem
        if (resData.status === 'KAMERA_OFFLINE') {
          setErrorMsg(resData.pesan || "Kamera ANPR gerbang keluar sedang NON-AKTIF / OFFLINE di Dashboard. Silakan aktifkan kamera terlebih dahulu.");
          setIsScanning(false);
          return;
        }

        // Jika batas waktu 15 detik habis
        if (resData.status === 'TIMEOUT') {
          setErrorMsg("Waktu pemindaian kamera habis (15 detik). Plat keluar tidak terdeteksi oleh webcam laptop.");
          setIsScanning(false);
          return;
        }

        // Jika laptop offline / belum menjalankan python
        if (resData.status === 'MICROSERVICE_UNREACHABLE') {
          setErrorMsg(resData.pesan || "Kamera laptop belum terhubung. Pastikan 'jalankan_microservice_alpr.bat' di laptop sudah dijalankan.");
          setIsScanning(false);
          return;
        }

        setErrorMsg(resData.pesan || `Gagal memproses keluar: ${resData.status}`);
        setIsScanning(false);

      } catch (err) {
        console.error("Gagal terhubung ke server:", err);
        setErrorMsg("Koneksi ke backend Spring Boot gagal.");
        setIsScanning(false);
      }
      return;
    }

    // ─────────────────────────────────────────────────────────────────
    // SKENARIO 2: MODE SIMULASI VIRTUAL (ANTREAN FIFO DARI PARKIRAN)
    // ─────────────────────────────────────────────────────────────────
    if (!kendaraanTerdepan && antrean.length === 0) {
      setErrorMsg("Tidak ada kendaraan yang sedang parkir di dalam area parkir.");
      setIsScanning(false);
      return;
    }

    setScanStatusText("MEMPROSES KELUAR (FIFO)...");
    const platKeluar = kendaraanTerdepan ? kendaraanTerdepan.platNomor : "QUEUE";

    try {
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
      
      const data = await response.json();
      console.log("Response dari Backend (Exit):", data);

      if (response.status === 402 || data.status === "SALDO_KURANG") {
        navigate('/exit/failed', { state: { data, jenisKendaraan: jenis } });
        return;
      }
      
      if (!response.ok) {
        setErrorMsg(data.pesan || data.pesanKeterangan || `Server error: ${response.status}`);
        setIsScanning(false);
        return;
      }
      
      navigate('/exit/success', { state: { data, jenisKendaraan: jenis } });

    } catch (error) {
      console.error("Gagal terhubung ke server:", error);
      setErrorMsg("Koneksi ke Server SPCT Gagal.");
      setIsScanning(false);
    }
  };

  // Mengembalikan elemen antarmuka JSX untuk halaman pemindaian gerbang keluar
  return (
    <div className="bg-[#050B14] min-h-screen flex flex-col items-center justify-center relative overflow-hidden text-slate-100">
      {/* Header bar informasi status sistem IoT dan navigasi antar gerbang */}
      <header className="absolute top-0 left-0 w-full px-container-margin py-gutter flex justify-between items-start z-10 mt-4 px-8">
        <div className="flex items-center gap-3">
          {/* Indikator status gerbang keluar siap beroperasi */}
          <div className="flex items-center gap-2 bg-[#0B1526]/80 backdrop-blur-md px-4 py-2 rounded-full border border-slate-700/50">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></span>
            <span className="font-['Space_Grotesk'] text-emerald-400 uppercase text-[14px] font-semibold tracking-wider">System Ready (EXIT)</span>
          </div>

          {/* Toggle Pilihan Mode Keluar: Kamera ALPR Laptop vs Antrean FIFO Virtual */}
          <div className="flex items-center bg-slate-900/80 p-1 rounded-full border border-slate-700/60 backdrop-blur-md text-xs font-['Space_Grotesk']">
            <button
              type="button"
              onClick={() => toggleScanMode('ALPR')}
              className={`px-3 py-1 rounded-full flex items-center gap-1.5 transition-all ${
                scanMode === 'ALPR' 
                  ? 'bg-red-500 text-white font-bold shadow-[0_0_10px_rgba(239,68,68,0.5)]' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">videocam</span>
              <span>Kamera ALPR (Laptop)</span>
            </button>
            <button
              type="button"
              onClick={() => toggleScanMode('VIRTUAL')}
              className={`px-3 py-1 rounded-full flex items-center gap-1.5 transition-all ${
                scanMode === 'VIRTUAL' 
                  ? 'bg-slate-700 text-red-300 font-bold' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">queue</span>
              <span>Antrean FIFO</span>
            </button>
          </div>
        </div>

        {/* Bagian kontrol switch jenis kendaraan, tombol keluar, dan label kamera */}
        <div className="flex items-center gap-4">
          {/* Tombol Konfigurasi IP Laptop */}
          {scanMode === 'ALPR' && (
            <button
              type="button"
              onClick={() => setShowConfigModal(true)}
              className="flex items-center gap-1.5 bg-[#0B1526]/70 hover:bg-slate-800 text-slate-300 px-3 py-1.5 rounded-full border border-slate-700 text-xs font-['Space_Grotesk'] transition-all"
              title="Atur Alamat IP Laptop"
            >
              <span className="material-symbols-outlined text-[16px]">settings_ethernet</span>
              <span>{laptopUrl ? laptopUrl.replace(/https?:\/\//, '') : 'IP Laptop: Default'}</span>
            </button>
          )}

          {/* Komponen toggle jenis kendaraan dengan aksen merah */}
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
          setDurasi={ubahDurasiSimulasi}
        />

        {/* Bingkai visual bidikan kamera pemindai gerbang keluar */}
        <div className="relative w-full max-w-[320px] aspect-[16/9] border border-slate-700/50 rounded-xl bg-[#0B1526]/30 backdrop-blur-sm mb-12 flex items-center justify-center shadow-lg">
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-red-400 rounded-tl-xl opacity-80"></div>
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-red-400 rounded-tr-xl opacity-80"></div>
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-red-400 rounded-bl-xl opacity-80"></div>
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-red-400 rounded-br-xl opacity-80"></div>
          
          {/* Garis pemindai horizontal aktif */}
          {isScanning && <div className="absolute top-1/3 left-0 w-full h-[2px] bg-red-400 shadow-[0_0_15px_rgba(248,113,113,0.9)] animate-[pulse_1s_ease-in-out_infinite]"></div>}
          <div className="absolute inset-0 bg-gradient-to-b from-red-500/5 via-transparent to-transparent rounded-xl"></div>
          
          {/* Tampilan reticle di mode ALPR vs mode VIRTUAL */}
          {scanMode === 'ALPR' ? (
            <div className="flex flex-col items-center gap-1.5 z-10 px-4 text-center">
              <span className="material-symbols-outlined text-[48px] text-red-400/80" style={{ fontVariationSettings: "'FILL' 1" }}>
                {isMotor ? 'two_wheeler' : 'directions_car'}
              </span>
              <span className="text-xs font-mono text-slate-300">
                {isScanning ? "Memindai Plat Nomor..." : "Siap Memindai via Webcam Laptop"}
              </span>
              <span className="text-[10px] text-slate-400">
                Validasi Berlipat: Plat Aktif & Kesesuaian Slot Parkir
              </span>
            </div>
          ) : (
            // Mode VIRTUAL (Antrean FIFO)
            isLoadingAntrean ? (
              <span className="text-xs font-mono text-slate-400 animate-pulse">Mendeteksi kendaraan...</span>
            ) : kendaraanTerdepan ? (
              <div className="flex flex-col items-center gap-1.5 z-10 px-4 text-center">
                <span className="text-[10px] tracking-widest uppercase font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                  Antrean 1 dari {antrean.length}
                </span>
                <span className="font-mono text-2xl font-bold tracking-widest text-slate-100 drop-shadow-[0_0_12px_rgba(255,255,255,0.4)] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[26px] text-red-400/80" style={{ fontVariationSettings: "'FILL' 1" }}>{isMotor ? 'two_wheeler' : 'directions_car'}</span>
                  {kendaraanTerdepan.platNomor}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Posisi Slot: <strong className="text-emerald-400 font-bold">{kendaraanTerdepan.idSlot ? kendaraanTerdepan.idSlot.replace(/^M(\d+)/, "B$1") : "-"}</strong>
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1 z-10 text-center px-4">
                <span className="material-symbols-outlined text-[42px] text-slate-600 mb-1" style={{ fontVariationSettings: "'FILL' 0" }}>{isMotor ? 'two_wheeler' : 'directions_car'}</span>
                <span className="font-mono text-xs text-slate-400 tracking-wider">AREA PARKIR KOSONG</span>
                <span className="text-[10px] text-slate-500">Semua kendaraan sudah keluar</span>
              </div>
            )
          )}
        </div>

        {/* Bagian judul instruksi dan tombol pemroses keluar */}
        <div className="text-center flex flex-col gap-6 w-full">
          <h1 className="text-[40px] font-bold text-slate-100 tracking-tight drop-shadow-md text-glow">
            {isScanning ? scanStatusText : "PINTU KELUAR"}
          </h1>
          
          {/* Tampilan pesan galat */}
          {errorMsg && (
            <div className="text-red-300 font-semibold bg-red-950/60 p-4 rounded-xl border border-red-500/40 text-sm flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-red-400">warning</span>
                <span>{errorMsg}</span>
              </div>
              {scanMode === 'ALPR' && (
                <button
                  type="button"
                  onClick={() => { toggleScanMode('VIRTUAL'); }}
                  className="mt-1 text-xs bg-red-800/80 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg border border-red-400/50 transition-all font-mono"
                >
                  Gunakan Mode Antrean FIFO (Offline)
                </button>
              )}
            </div>
          )}

          {/* Tombol aksi pemrosesan keluar kendaraan */}
          <button 
            onClick={simulateExitArrival}
            disabled={isScanning || (scanMode === 'VIRTUAL' && !kendaraanTerdepan && antrean.length === 0)}
            className={`px-8 py-4 rounded-xl mt-4 w-full max-w-sm mx-auto flex items-center justify-center gap-3 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.5)] ${
              (scanMode === 'VIRTUAL' && !kendaraanTerdepan && antrean.length === 0)
                ? 'bg-slate-800/40 border border-slate-700/40 text-slate-500 cursor-not-allowed'
                : 'bg-[#180a0a] hover:bg-[#281010] border border-red-500/50 text-red-400 cursor-pointer active:scale-95 shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)]'
            }`}
          >
            <span className={`material-symbols-outlined font-light ${isScanning ? 'animate-spin' : ''}`}>
              {scanMode === 'ALPR' ? 'photo_camera' : 'qr_code_scanner'}
            </span>
            <span className="font-semibold tracking-wide text-sm font-['Space_Grotesk']">
              {isScanning 
                ? "Memvalidasi Kendaraan..." 
                : (scanMode === 'ALPR'
                    ? (isMotor ? "Scan Plat Motor Keluar (Kamera)" : "Scan Plat Mobil Keluar (Kamera)")
                    : (kendaraanTerdepan 
                        ? `Keluar: ${kendaraanTerdepan.platNomor} (${kendaraanTerdepan.idSlot ? kendaraanTerdepan.idSlot.replace(/^M(\d+)/, "B$1") : "-"})`
                        : "Tidak Ada Kendaraan di Parkiran"))
              }
            </span>
          </button>
        </div>
      </main>

      {/* Modal Pengaturan Alamat IP Edge ALPR Laptop */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#0B1526] border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl text-slate-100">
            <div className="flex items-center justify-between mb-4 border-b border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-red-400">lan</span>
                <h3 className="font-['Space_Grotesk'] font-bold text-lg">Konfigurasi Kamera Laptop (Exit)</h3>
              </div>
              <button 
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Jika kamera dijalankan di laptop lain dalam satu Wi-Fi, masukkan alamat IP laptop tersebut (port 5001). Contoh: <code className="text-red-300 font-mono">http://192.168.1.15:5001</code>.
            </p>

            <form onSubmit={simpanPengaturanLaptop} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-mono text-slate-300 block mb-1">URL Edge ALPR Laptop:</label>
                <input
                  type="text"
                  placeholder="http://127.0.0.1:5001 (Kosongkan untuk default)"
                  value={laptopUrl}
                  onChange={(e) => setLaptopUrl(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm font-mono text-red-300 focus:outline-none focus:border-red-400"
                />
              </div>

              <div className="flex justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-['Space_Grotesk'] bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-['Space_Grotesk'] font-bold bg-red-600 hover:bg-red-500 text-white shadow-lg"
                >
                  Simpan Pengaturan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer merek dagang sistem parkir terintegrasi */}
      <footer className="absolute bottom-0 left-0 w-full pb-8 px-container-margin flex justify-center items-center z-10">
        <div className="flex items-center gap-4 border-t border-slate-700/50 pt-4 w-full max-w-md justify-center">
          <span className="font-['Space_Grotesk'] text-slate-500 text-[12px] uppercase tracking-widest font-semibold">Powered by PARK-TECH</span>
        </div>
      </footer>
    </div>
  );
}
