import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function ExitScanPage() {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  
  // Untuk simulasi, kita bisa atur saldo e-wallet
  const [saldo, setSaldo] = useState(50000); 

  const simulateExitArrival = async () => {
    if (isScanning) return;
    setIsScanning(true);
    setErrorMsg(null);
    
    // Plat nomor dummy yang sama saat masuk ("D 1234 SPCT")
    const dummyPlate = "D 1234 SPCT";

    try {
      // Panggil API Deteksi Plat Keluar 
      // Kita kirim body JSON (dengan saldo untuk simulasi)
      const response = await fetch('/api/gate/keluar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            platNomor: dummyPlate,
            saldoEwallet: saldo // simulasi
        })
      });
      
      const data = await response.json();
      console.log("Response dari Backend (Exit):", data);

      if (response.status === 402 || data.status === "SALDO_KURANG") {
        // Gagal Bayar
        navigate('/exit/failed', { state: { data } });
        return;
      }
      
      if (!response.ok) {
        setErrorMsg(data.pesan || data.pesanKeterangan || `Server error: ${response.status}`);
        setIsScanning(false);
        return;
      }
      
      // Sukses Bayar
      navigate('/exit/success', { state: { data } });

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
        <div className="flex items-center gap-2 text-slate-400 font-['Space_Grotesk'] text-[14px] bg-[#0B1526]/50 px-3 py-1 rounded-full border border-slate-800 tracking-wider">
          <span className="material-symbols-outlined text-[18px]">videocam</span>
          <span>PG_EXIT_001</span>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="flex flex-col items-center justify-center w-full max-w-lg mx-auto px-container-margin z-10 relative">
        
        {/* Simulasi Input Saldo */}
        <div className="absolute top-0 right-0 -mt-20 p-4 border border-slate-700 bg-slate-900 rounded-xl">
            <label className="text-xs text-slate-400 block mb-1">Simulasi Saldo E-Wallet (Rp)</label>
            <input type="number" value={saldo} onChange={e => setSaldo(e.target.value)} className="bg-slate-800 text-white p-2 rounded border border-slate-600 w-full" />
        </div>

        {/* Static Scanner Reticle UI */}
        <div className="relative w-full max-w-[320px] aspect-[16/9] border border-slate-700/50 rounded-xl bg-[#0B1526]/30 backdrop-blur-sm mb-12 flex items-center justify-center shadow-lg">
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-red-400 rounded-tl-xl opacity-80"></div>
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-red-400 rounded-tr-xl opacity-80"></div>
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-red-400 rounded-bl-xl opacity-80"></div>
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-red-400 rounded-br-xl opacity-80"></div>
          
          {isScanning && <div className="absolute top-1/3 left-0 w-full h-[2px] bg-red-400 shadow-[0_0_15px_rgba(248,113,113,0.9)] animate-[pulse_1s_ease-in-out_infinite]"></div>}
          <div className="absolute inset-0 bg-gradient-to-b from-red-500/5 via-transparent to-transparent rounded-xl"></div>
          
          <span className="material-symbols-outlined text-[64px] text-red-500/30" style={{ fontVariationSettings: "'FILL' 1" }}>exit_to_app</span>
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

          {/* SIMULATION BUTTON */}
          <button 
            onClick={simulateExitArrival}
            disabled={isScanning}
            className="bg-[#0f1b2e] hover:bg-[#1a2c47] border border-slate-700 text-red-400 px-8 py-4 rounded-xl mt-4 w-full max-w-sm mx-auto flex items-center justify-center gap-3 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
          >
            <span className="material-symbols-outlined font-light">
              {isScanning ? "sync" : "qr_code_scanner"}
            </span>
            <span className="font-semibold tracking-wide">
              {isScanning ? "Processing Payment..." : "Simulasi Keluar / Tap Kartu"}
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
