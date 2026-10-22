import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import JenisKendaraanToggle from '../components/JenisKendaraanToggle';
import PanelSimulasiExit from '../components/PanelSimulasiExit';

// Gerbang keluar: jenis = 'MOBIL' (PG_EXIT_01) atau 'MOTOR' (PG_EXIT_02). Tampilan sama, antrean FIFO terpisah per jenis.
export default function ExitScanPage({ jenis = 'MOBIL' }) {
  const navigate = useNavigate();
  const isMotor = jenis === 'MOTOR';
  const labelKamera = isMotor ? 'PG_EXIT_02' : 'PG_EXIT_01';
  const [isScanning, setIsScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  
  // Antrean kendaraan yang sedang aktif parkir di basement (FIFO)
  const [antrean, setAntrean] = useState([]);
  const [isLoadingAntrean, setIsLoadingAntrean] = useState(true);

  // Untuk simulasi, kita bisa atur saldo e-wallet dan durasi parkir
  const [saldo, setSaldo] = useState(50000); 
  const [durasiSimulasi, setDurasiSimulasi] = useState(60); // Default 60 menit (Tarif Flat Rp 5.000)

  // Fetch antrean kendaraan secara periodik (setiap 2 detik) - hanya jenis kendaraan gerbang ini
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

  const kendaraanTerdepan = antrean.length > 0 ? antrean[0] : null;

  const simulateExitArrival = async () => {
    if (isScanning) return;
    if (!kendaraanTerdepan && antrean.length === 0) {
      setErrorMsg("Tidak ada kendaraan yang sedang parkir di dalam area parkir.");
      return;
    }

    setIsScanning(true);
    setErrorMsg(null);
    
    // Gunakan plat nomor antrean terdepan (FIFO)
    const platKeluar = kendaraanTerdepan ? kendaraanTerdepan.platNomor : "QUEUE";

    try {
      // Panggil API Deteksi Plat Keluar 
      // Kita kirim body JSON (dengan saldo dan durasi menit untuk simulasi)
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
        // Gagal Bayar
        navigate('/exit/failed', { state: { data, jenisKendaraan: jenis } });
        return;
      }
      
      if (!response.ok) {
        setErrorMsg(data.pesan || data.pesanKeterangan || `Server error: ${response.status}`);
        setIsScanning(false);
        return;
      }
      
      // Sukses Bayar
      navigate('/exit/success', { state: { data, jenisKendaraan: jenis } });

    } catch (error) {
      console.error("Gagal terhubung ke server:", error);
      setErrorMsg("Koneksi ke Server SPCT Gagal.");
      setIsScanning(false);
    }
  };

  return (
    <div className="bg-[#050B14] min-h-screen flex flex-col items-center justify-center relative overflow-hidden text-slate-100">
      {/* Top IoT Status Bar */}
      <header className="absolute top-0 left-0 w-full px-container-margin py-gutter flex justify-between items-start z-10 mt-4 px-8">
        <div className="flex items-center gap-3 bg-[#0B1526]/80 backdrop-blur-md px-4 py-2 rounded-full border border-slate-700/50">
          <span className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></span>
          <span className="font-['Space_Grotesk'] text-green-400 uppercase text-[14px] font-semibold tracking-wider">System Ready (EXIT)</span>
        </div>
        <div className="flex items-center gap-4">
          <JenisKendaraanToggle jenis={jenis} accent="red" onChange={(j) => navigate(j === 'MOTOR' ? '/exit/motor' : '/exit')} />
          <button 
            onClick={() => navigate(isMotor ? '/motor' : '/')}
            className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 px-4 py-1.5 rounded-full border border-slate-600 transition-colors cursor-pointer text-sm font-['Space_Grotesk'] tracking-wider"
          >
            <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
            Switch to Entrance
          </button>
          <div className="flex items-center gap-2 text-slate-400 font-['Space_Grotesk'] text-[14px] bg-[#0B1526]/50 px-3 py-1 rounded-full border border-slate-800 tracking-wider">
            <span className="material-symbols-outlined text-[18px]">videocam</span>
            <span>{labelKamera}</span>
          </div>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="flex flex-col items-center justify-center w-full max-w-lg mx-auto px-container-margin z-10 relative">
        
        {/* Panel simulasi saldo & durasi: bisa digeser, default di tengah layar */}
        <PanelSimulasiExit
          saldo={saldo}
          setSaldo={setSaldo}
          durasi={durasiSimulasi}
          setDurasi={setDurasiSimulasi}
        />

        {/* Dynamic Scanner Reticle UI dengan Indikator Kendaraan Antrean Keluar */}
        <div className="relative w-full max-w-[320px] aspect-[16/9] border border-slate-700/50 rounded-xl bg-[#0B1526]/30 backdrop-blur-sm mb-12 flex items-center justify-center shadow-lg">
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-red-400 rounded-tl-xl opacity-80"></div>
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-red-400 rounded-tr-xl opacity-80"></div>
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-red-400 rounded-bl-xl opacity-80"></div>
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-red-400 rounded-br-xl opacity-80"></div>
          
          {isScanning && <div className="absolute top-1/3 left-0 w-full h-[2px] bg-red-400 shadow-[0_0_15px_rgba(248,113,113,0.9)] animate-[pulse_1s_ease-in-out_infinite]"></div>}
          <div className="absolute inset-0 bg-gradient-to-b from-red-500/5 via-transparent to-transparent rounded-xl"></div>
          
          {/* Konten Reticle: Info Kendaraan Terdepan Antrean Keluar */}
          {isLoadingAntrean ? (
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
                Posisi Slot: <strong className="text-emerald-400 font-bold">{kendaraanTerdepan.idSlot}</strong>
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1 z-10 text-center px-4">
              <span className="material-symbols-outlined text-[42px] text-slate-600 mb-1">{isMotor ? 'two_wheeler' : 'no_crash'}</span>
              <span className="font-mono text-xs text-slate-400 tracking-wider">AREA PARKIR KOSONG</span>
              <span className="text-[10px] text-slate-500">Semua kendaraan sudah keluar</span>
            </div>
          )}
        </div>

        {/* Typography Display */}
        <div className="text-center flex flex-col gap-6 w-full">
          <h1 className="text-[48px] font-bold text-slate-100 tracking-tight drop-shadow-md text-glow">
            {isScanning ? "MEMPROSES..." : "PINTU KELUAR"}
          </h1>
          
          {errorMsg && (
            <p className="text-red-400 font-semibold bg-red-900/20 px-4 py-2 rounded-lg border border-red-500/30">
              {errorMsg}
            </p>
          )}

          {/* SIMULATION BUTTON - Terhubung ke antrean FIFO */}
          <button 
            onClick={simulateExitArrival}
            disabled={isScanning || (!kendaraanTerdepan && antrean.length === 0)}
            className={`px-8 py-4 rounded-xl mt-4 w-full max-w-sm mx-auto flex items-center justify-center gap-3 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.5)] ${
              !kendaraanTerdepan && antrean.length === 0
                ? 'bg-slate-800/40 border border-slate-700/40 text-slate-500 cursor-not-allowed'
                : 'bg-[#0f1b2e] hover:bg-[#1a2c47] border border-slate-700 text-red-400 cursor-pointer active:scale-95'
            }`}
          >
            <span className="material-symbols-outlined font-light">
              {isScanning ? "sync" : "qr_code_scanner"}
            </span>
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

      <footer className="absolute bottom-0 left-0 w-full pb-8 px-container-margin flex justify-center items-center z-10">
        <div className="flex items-center gap-4 border-t border-slate-700/50 pt-4 w-full max-w-md justify-center">
          <span className="font-['Space_Grotesk'] text-slate-500 text-[12px] uppercase tracking-widest font-semibold">Powered by PARK-TECH</span>
        </div>
      </footer>
    </div>
  );
}
