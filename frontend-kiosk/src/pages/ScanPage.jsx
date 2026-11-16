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
  // Penentuan label kamera siaran langsung berdasarkan tipe gerbang masuk
  const labelKamera = isMotor ? 'GATE_IN_02_LIVE' : 'GATE_IN_01_LIVE';
  
  // Inisialisasi state isScanning bertipe boolean untuk status proses pemindaian aktif
  const [isScanning, setIsScanning] = useState(false);
  // Inisialisasi state errorMsg bertipe string atau null untuk menyimpan pesan galat
  const [errorMsg, setErrorMsg] = useState(null);
  // Inisialisasi state teks status saat pemindaian berlangsung
  const [scanStatusText, setScanStatusText] = useState('MEMINDAI...');

  // State mode pemindaian: 'ALPR' (Kamera Laptop On-Demand) atau 'VIRTUAL' (Simulasi Plat Acak)
  const [scanMode, setScanMode] = useState(() => localStorage.getItem('spct_scan_mode') || 'ALPR');
  // State alamat URL Edge ALPR microservice laptop (default dari localStorage atau kosong untuk memakai konfigurasi backend)
  const [laptopUrl, setLaptopUrl] = useState(() => localStorage.getItem('spct_laptop_url') || '');
  // State untuk menampilkan modal konfigurasi IP laptop
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Inisialisasi state customPlate bertipe string dengan nilai acak awal berformat plat nomor Indonesia
  const [customPlate, setCustomPlate] = useState(() => `B ${Math.floor(1000 + Math.random() * 9000)} SPCT`);

  // Deklarasi fungsi generateNewPlate untuk menghasilkan nomor plat simulasi baru secara acak
  const generateNewPlate = () => {
    const newPlate = `B ${Math.floor(1000 + Math.random() * 9000)} SPCT`;
    setCustomPlate(newPlate);
    return newPlate;
  };

  // Fungsi untuk mengganti mode pemindaian dan menyimpannya di localStorage
  const toggleScanMode = (mode) => {
    setScanMode(mode);
    localStorage.setItem('spct_scan_mode', mode);
    setErrorMsg(null);
  };

  // Fungsi untuk menyimpan pengaturan alamat IP laptop
  const simpanPengaturanLaptop = (e) => {
    e.preventDefault();
    localStorage.setItem('spct_laptop_url', laptopUrl.trim());
    setShowConfigModal(false);
  };

  // Deklarasi fungsi asinkron simulateCarArrival untuk memicu kedatangan kendaraan
  const simulateCarArrival = async () => {
    if (isScanning) return;
    setIsScanning(true);
    setErrorMsg(null);

    // ─────────────────────────────────────────────────────────────────
    // SKENARIO 1: MODE EDGE ALPR MICROSERVICE (KAMERA LAPTOP ON-DEMAND)
    // ─────────────────────────────────────────────────────────────────
    if (scanMode === 'ALPR') {
      setScanStatusText("KAMERA LAPTOP DIAKTIFKAN... SILAKAN HADAPKAN PLAT");

      try {
        const response = await fetch('/api/gate/trigger-scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gerbang: 'MASUK',
            jenisKendaraan: jenis,
            laptopUrl: laptopUrl.trim() || undefined
          })
        });

        const resData = await response.json();
        console.log("[ALPR RESPONSE]", resData);

        // Jika deteksi dan alokasi slot berhasil
        if (response.ok && resData.status === 'SUKSES' && resData.data) {
          const deteksiData = resData.data;
          navigate('/allocating', { 
            state: { 
              platNomor: deteksiData.platNomor,
              jenisKendaraan: jenis,
              slotDialokasikan: deteksiData.slotDialokasikan,
              slotData: {
                idSlotDialokasikan: deteksiData.slotDialokasikan,
                urutan: deteksiData.jalurRuteGraf
              }
            } 
          });
          return;
        }

        // Penanganan kasus batas waktu kamera habis (Timeout 15 detik)
        if (resData.status === 'TIMEOUT') {
          setErrorMsg("Waktu pemindaian kamera habis (15 detik). Plat nomor tidak terdeteksi oleh webcam laptop. Silakan coba lagi.");
          setIsScanning(false);
          return;
        }

        // Penanganan kasus Edge ALPR microservice di laptop belum menyala / beda Wi-Fi
        if (resData.status === 'MICROSERVICE_UNREACHABLE') {
          setErrorMsg(resData.pesan || "Kamera laptop belum terhubung. Pastikan 'jalankan_microservice_alpr.bat' di laptop sudah dijalankan.");
          setIsScanning(false);
          return;
        }

        // Penanganan kasus basement penuh
        if (resData.status === 'BASEMENT_PENUH') {
          setErrorMsg("Maaf, seluruh slot parkir sedang penuh.");
          setIsScanning(false);
          return;
        }

        setErrorMsg(resData.pesan || resData.pesanKeterangan || `Gagal memproses kedatangan: ${resData.status}`);
        setIsScanning(false);

      } catch (err) {
        console.error("Gagal terhubung ke server:", err);
        setErrorMsg("Koneksi ke backend Spring Boot gagal. Pastikan server aktif.");
        setIsScanning(false);
      }
      return;
    }

    // ─────────────────────────────────────────────────────────────────
    // SKENARIO 2: MODE SIMULASI VIRTUAL (PLAT ACAK TANPA KAMERA LAPTOP)
    // ─────────────────────────────────────────────────────────────────
    setScanStatusText("MEMINDAI PLAT SIMULASI...");
    const activePlate = customPlate || `B ${Math.floor(1000 + Math.random() * 9000)} SPCT`;

    try {
      const response = await fetch(`/api/gate/masuk?platNomor=${encodeURIComponent(activePlate)}&jenisKendaraan=${jenis}&confidence=1.0`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Response dari Backend:", data);
      
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
      console.error("Gagal terhubung ke server:", error);
      setErrorMsg("Koneksi ke Server SPCT Gagal. Pastikan Backend menyala.");
      setIsScanning(false);
    }
  };

  // Mengembalikan elemen JSX antarmuka pemindaian kamera gerbang masuk
  return (
    <div className="bg-[#050B14] min-h-screen flex flex-col items-center justify-center relative overflow-hidden text-slate-100">
      {/* Header bagian atas berisi status operasional sistem IoT dan kontrol navigasi */}
      <header className="absolute top-0 left-0 w-full px-container-margin py-gutter flex justify-between items-start z-10 mt-4 px-8">
        {/* Indikator status kesiapan sistem dengan animasi denyut cahaya biru */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#0B1526]/80 backdrop-blur-md px-4 py-2 rounded-full border border-slate-700/50">
            <span className="w-3 h-3 rounded-full bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.6)] animate-pulse"></span>
            <span className="font-['Space_Grotesk'] text-sky-400 uppercase text-[14px] font-semibold">System Ready</span>
          </div>

          {/* Toggle Pilihan Mode: Kamera ALPR Laptop vs Simulasi Virtual */}
          <div className="flex items-center bg-slate-900/80 p-1 rounded-full border border-slate-700/60 backdrop-blur-md text-xs font-['Space_Grotesk']">
            <button
              type="button"
              onClick={() => toggleScanMode('ALPR')}
              className={`px-3 py-1 rounded-full flex items-center gap-1.5 transition-all ${
                scanMode === 'ALPR' 
                  ? 'bg-sky-500 text-white font-bold shadow-[0_0_10px_rgba(14,165,233,0.5)]' 
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
                  ? 'bg-slate-700 text-sky-300 font-bold' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">shuffle</span>
              <span>Plat Acak</span>
            </button>
          </div>
        </div>

        {/* Bagian kontrol switch jenis kendaraan, tombol keluar, dan label kamera */}
        <div className="flex items-center gap-4">
          {/* Tombol Konfigurasi IP Laptop (hanya tampil jika mode ALPR) */}
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

          {/* Komponen pengganti jenis kendaraan mobil atau motor */}
          <JenisKendaraanToggle jenis={jenis} onChange={(j) => navigate(j === 'MOTOR' ? '/motor' : '/')} />
          {/* Tombol navigasi untuk berpindah ke gerbang keluar */}
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
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-sky-400 rounded-tl-xl opacity-80"></div>
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-sky-400 rounded-tr-xl opacity-80"></div>
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-sky-400 rounded-bl-xl opacity-80"></div>
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-sky-400 rounded-br-xl opacity-80"></div>
          
          {/* Garis pemindai horizontal aktif */}
          {isScanning && <div className="absolute top-1/3 left-0 w-full h-[2px] bg-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.9)] animate-[pulse_1s_ease-in-out_infinite]"></div>}
          
          <div className="absolute inset-0 bg-gradient-to-b from-sky-500/5 via-transparent to-transparent rounded-xl"></div>
          
          <span className="material-symbols-outlined text-[64px] text-sky-500/30" style={{ fontVariationSettings: "'FILL' 1" }}>
            {isMotor ? 'two_wheeler' : 'directions_car'}
          </span>
        </div>

        {/* Bagian teks instruksi dan tombol aksi */}
        <div className="text-center flex flex-col gap-6 w-full">
          {/* Judul status instruksi kedatangan */}
          <h1 className="text-[40px] font-bold text-slate-100 tracking-tight drop-shadow-md text-glow">
            {isScanning ? scanStatusText : "SILAKAN MAJU"}
          </h1>
          
          {/* Tampilan pesan galat */}
          {errorMsg && (
            <div className="text-red-300 font-semibold bg-red-950/60 p-4 rounded-xl border border-red-500/40 text-sm flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-red-400">warning</span>
                <span>{errorMsg}</span>
              </div>
              {/* Opsi tombol cepat beralih ke simulasi acak jika microservice laptop offline */}
              {scanMode === 'ALPR' && (
                <button
                  type="button"
                  onClick={() => { toggleScanMode('VIRTUAL'); }}
                  className="mt-1 text-xs bg-red-800/80 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg border border-red-400/50 transition-all font-mono"
                >
                  Gunakan Mode Plat Acak (Offline)
                </button>
              )}
            </div>
          )}

          {/* Kartu lencana plat nomor simulasi (hanya tampil jika mode VIRTUAL) */}
          {scanMode === 'VIRTUAL' && (
            <div className="flex items-center justify-between bg-slate-900/60 border border-slate-700/60 rounded-xl px-4 py-2.5 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sky-400 text-sm">tag</span>
                <span className="text-xs uppercase tracking-wider text-slate-400 font-['Space_Grotesk']">Plat Simulasi:</span>
                <span className="font-mono font-bold text-sky-300 text-sm">{customPlate}</span>
              </div>
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
          )}

          {/* Tombol pemicu pemindaian kendaraan */}
          <button 
            onClick={simulateCarArrival}
            disabled={isScanning}
            className="glass-button px-8 py-4 rounded-xl w-full flex items-center justify-center gap-3 cursor-pointer shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:shadow-[0_0_30px_rgba(14,165,233,0.6)] transition-all"
          >
            <span className={`material-symbols-outlined ${isScanning ? 'animate-spin' : ''}`}>
              {scanMode === 'ALPR' ? 'photo_camera' : 'radar'}
            </span>
            <span className="font-['Space_Grotesk'] font-bold text-base tracking-wide">
              {isScanning 
                ? "Memindai Plat Kendaraan..." 
                : (scanMode === 'ALPR'
                    ? (isMotor ? "Tekan Tombol / Scan Motor (Kamera)" : "Tekan Tombol / Scan Mobil (Kamera)")
                    : (isMotor ? "Simulasi Motor Datang (Acak)" : "Simulasi Mobil Datang (Acak)"))
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
                <span className="material-symbols-outlined text-sky-400">lan</span>
                <h3 className="font-['Space_Grotesk'] font-bold text-lg">Konfigurasi Kamera Laptop</h3>
              </div>
              <button 
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Jika kamera dijalankan di laptop lain dalam satu Wi-Fi, masukkan alamat IP laptop tersebut (port 5001). Contoh: <code className="text-sky-300 font-mono">http://192.168.1.15:5001</code>.
            </p>

            <form onSubmit={simpanPengaturanLaptop} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-mono text-slate-300 block mb-1">URL Edge ALPR Laptop:</label>
                <input
                  type="text"
                  placeholder="http://127.0.0.1:5001 (Kosongkan untuk default)"
                  value={laptopUrl}
                  onChange={(e) => setLaptopUrl(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm font-mono text-sky-300 focus:outline-none focus:border-sky-400"
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
                  className="px-5 py-2 rounded-xl text-xs font-['Space_Grotesk'] font-bold bg-sky-500 hover:bg-sky-400 text-white shadow-lg"
                >
                  Simpan Pengaturan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bagian catatan kaki dengan identitas tim SPCT */}
      <footer className="absolute bottom-0 left-0 w-full pb-8 px-container-margin flex justify-center items-center z-10">
        <div className="flex items-center gap-4 border-t border-slate-700/50 pt-4 w-full max-w-md justify-center">
          <span className="font-['Space_Grotesk'] text-slate-500 text-[12px] uppercase tracking-widest">Powered by SPCT IoT Team</span>
        </div>
      </footer>
    </div>
  );
}
