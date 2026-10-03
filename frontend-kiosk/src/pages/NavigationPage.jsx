import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

export default function NavigationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Ambil data dari halaman sebelumnya
  const { slotData, platNomor } = location.state || {};
  const targetSlot = slotData?.idSlot || "B1-10";

  // Auto redirect kembali ke scan setelah beberapa detik untuk simulasi masuk selesai
  useEffect(() => {
    const timer = setTimeout(() => {
      // Dalam sistem nyata, setelah navigasi selesai (mobil sampai), kembali ke layar standby (ScanPage)
      navigate('/');
    }, 8000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="bg-[#050B14] h-screen w-screen flex flex-col overflow-hidden select-none text-slate-100 font-['Outfit'] cursor-pointer" onClick={() => navigate('/')}>
      <style>{`
        .map-grid {
            background-image: 
                linear-gradient(to right, rgba(14,165,233,0.1) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(14,165,233,0.1) 1px, transparent 1px);
            background-size: 40px 40px;
        }
        .glowing-route {
            filter: drop-shadow(0 0 10px #4ade80);
            stroke-dashoffset: 1000;
            animation: dash 3s linear forwards;
        }
        @keyframes dash {
            to { stroke-dashoffset: 0; }
        }
        .pulse-glow {
            animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
        }
        @keyframes pulse-ring {
            0% { box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.7); }
            70% { box-shadow: 0 0 0 20px rgba(74, 222, 128, 0); }
            100% { box-shadow: 0 0 0 0 rgba(74, 222, 128, 0); }
        }
      `}</style>

      {/* TopAppBar Component */}
      <header className="glass-panel flex justify-between items-center w-full px-8 py-4 border-b border-sky-500/20 relative z-10">
        <div className="flex items-center gap-4 text-sky-400 font-bold">
          <span className="material-symbols-outlined text-sky-400" style={{ fontVariationSettings: "'FILL' 1" }}>terminal</span>
          <span className="font-['Space_Grotesk'] font-bold tracking-[0.2em]">SPCT NAVIGATION SYSTEM</span>
        </div>
        <div className="text-slate-100 font-medium flex items-center bg-sky-900/40 border border-sky-500/30 px-6 py-2 rounded-full shadow-[0_0_15px_rgba(14,165,233,0.2)]">
          <span className="tracking-wider">Plat: <strong className="text-sky-300">{platNomor || "D 1234 SPCT"}</strong> | Tujuan: <strong className="text-green-400">{targetSlot}</strong></span>
        </div>
        <div className="flex items-center gap-4 text-sky-400">
          <span className="material-symbols-outlined">wifi</span>
          <span className="material-symbols-outlined">sensors</span>
          <span className="material-symbols-outlined animate-spin-slow">radar</span>
        </div>
      </header>

      {/* Main Content Canvas (Map) */}
      <main className="flex-1 relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 map-grid flex items-center justify-center pointer-events-none"></div>
        
        {/* Map Container */}
        <div className="relative w-[800px] h-[600px] glass-panel rounded-3xl p-8 overflow-hidden z-10 border border-sky-500/30">
          
          {/* Driveway / Path */}
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            {/* Base Paths */}
            <path d="M 100 500 L 100 400 Q 100 350 150 350 L 600 350 Q 650 350 650 300 L 650 150" fill="none" stroke="rgba(14,165,233,0.1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="40"></path>
            {/* Glowing Route (Nature Green) */}
            <path className="glowing-route" d="M 100 500 L 100 400 Q 100 350 150 350 L 600 350 Q 650 350 650 300 L 650 150" fill="none" stroke="#4ade80" strokeDasharray="1000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="6"></path>
          </svg>
          
          {/* Start Point (Entrance Gate) */}
          <div className="absolute bottom-12 left-20 flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-sky-900 border-4 border-sky-400 z-10 flex items-center justify-center shadow-[0_0_15px_rgba(56,189,248,0.5)]">
              <div className="w-2 h-2 rounded-full bg-sky-300"></div>
            </div>
            <span className="font-['Space_Grotesk'] text-[12px] text-sky-300 mt-2 bg-sky-900/60 border border-sky-500/30 px-3 py-1 rounded-full uppercase font-bold tracking-widest">GATE IN</span>
          </div>
          
          {/* Destination Point */}
          <div className="absolute top-24 right-24 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-green-500 pulse-glow z-10 flex items-center justify-center shadow-[0_0_20px_#4ade80]">
              <span className="material-symbols-outlined text-white text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
            </div>
          </div>

          {/* Parking Slots Representation */}
          <div className="absolute top-16 right-36 flex gap-3">
            <div className="w-20 h-28 border border-slate-600 bg-slate-800/50 rounded-lg flex items-center justify-center backdrop-blur-sm"><span className="font-['Space_Grotesk'] text-[12px] text-slate-500 font-bold">A-01</span></div>
            <div className="w-20 h-28 border border-slate-600 bg-slate-800/50 rounded-lg flex items-center justify-center backdrop-blur-sm"><span className="font-['Space_Grotesk'] text-[12px] text-slate-500 font-bold">A-02</span></div>
            <div className="w-20 h-28 border-2 border-green-400 bg-green-900/30 rounded-lg flex items-center justify-center relative overflow-hidden backdrop-blur-md shadow-[0_0_15px_rgba(74,222,128,0.3)]">
              <div className="absolute inset-0 bg-green-400 opacity-20 animate-pulse"></div>
              <span className="font-['Space_Grotesk'] text-[16px] text-green-400 font-extrabold z-10">{targetSlot}</span>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Prominent Status */}
      <footer className="w-full p-8 flex justify-center relative z-10">
        <div className="w-full max-w-4xl bg-green-500/20 border border-green-400/50 text-green-300 py-6 px-8 rounded-2xl flex items-center justify-center gap-6 shadow-[0_0_30px_rgba(74,222,128,0.2)] backdrop-blur-xl">
          <span className="material-symbols-outlined text-[48px] animate-bounce" style={{ fontVariationSettings: "'FILL' 1" }}>arrow_circle_up</span>
          <span className="text-[32px] font-extrabold uppercase tracking-[0.2em] text-center drop-shadow-md">SILAKAN IKUTI RUTE HIJAU</span>
        </div>
      </footer>
    </div>
  );
}
