import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function NavigationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Ambil data dari halaman sebelumnya
  const { slotData, platNomor } = location.state || {};
  const targetSlot = slotData?.slotDialokasikan || "B1-01";
  const ruteKoordinat = slotData?.jalurRuteGraf || []; // Array of TitikRuteDto {id, x, y}

  // Animasi Auto-redirect
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/');
    }, 10000); // Tahan layar selama 10 detik agar user bisa melihat rute
    return () => clearTimeout(timer);
  }, [navigate]);

  // Generate 15 Slot Statis untuk digambar di Peta sebagai latar belakang
  const allSlots = Array.from({length: 15}, (_, i) => {
    const id = i + 1;
    const col = Math.floor((id + 1) / 2);
    const x = 20 * col;
    const y = (id % 2 !== 0) ? 30 : 70;
    const isTarget = `B1-${id.toString().padStart(2, '0')}` === targetSlot;
    return { id: `B1-${id.toString().padStart(2, '0')}`, x, y, isTarget };
  });

  // Membangun SVG Path (garis rute siku-siku)
  const buildSvgPath = () => {
    if (!ruteKoordinat || ruteKoordinat.length === 0) return "";
    return `M ${ruteKoordinat.map(p => `${p.x} ${p.y}`).join(' L ')}`;
  };

  return (
    <div className="bg-[#050B14] h-screen w-screen flex flex-col overflow-hidden select-none text-slate-100 font-['Outfit'] cursor-pointer" onClick={() => navigate('/')}>
      <style>{`
        .map-grid {
            background-image: 
                linear-gradient(to right, rgba(14,165,233,0.05) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(14,165,233,0.05) 1px, transparent 1px);
            background-size: 20px 20px;
        }
        .glowing-route {
            filter: drop-shadow(0 0 6px #4ade80);
            stroke-dasharray: 500;
            stroke-dashoffset: 500;
            animation: dash 3s ease-out forwards;
        }
        @keyframes dash {
            to { stroke-dashoffset: 0; }
        }
        .pulse-glow {
            animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
        }
        @keyframes pulse-ring {
            0% { box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.7); }
            70% { box-shadow: 0 0 0 8px rgba(74, 222, 128, 0); }
            100% { box-shadow: 0 0 0 0 rgba(74, 222, 128, 0); }
        }
        .car-anim {
            offset-path: path('${buildSvgPath()}');
            animation: move-car 4s ease-in-out forwards;
        }
        @keyframes move-car {
            0% { offset-distance: 0%; opacity: 0; }
            5% { opacity: 1; }
            100% { offset-distance: 100%; opacity: 1; }
        }
      `}</style>

      {/* TopAppBar Component */}
      <header className="glass-panel flex justify-between items-center w-full px-8 py-4 border-b border-sky-500/20 relative z-10">
        <div className="flex items-center gap-4 text-sky-400 font-bold">
          <span className="material-symbols-outlined text-sky-400" style={{ fontVariationSettings: "'FILL' 1" }}>map</span>
          <span className="font-['Space_Grotesk'] font-bold tracking-[0.2em]">PETA ALOKASI A* GRAPH</span>
        </div>
        <div className="text-slate-100 font-medium flex items-center bg-sky-900/40 border border-sky-500/30 px-6 py-2 rounded-full shadow-[0_0_15px_rgba(14,165,233,0.2)]">
          <span className="tracking-wider">Plat: <strong className="text-sky-300">{platNomor || "D 1234 SPCT"}</strong> | Menuju: <strong className="text-green-400">{targetSlot}</strong></span>
        </div>
      </header>

      {/* Main Content Canvas (Map) */}
      <main className="flex-1 relative overflow-hidden flex items-center justify-center p-8">
        <div className="absolute inset-0 map-grid flex items-center justify-center pointer-events-none"></div>
        
        {/* Map Container */}
        <div className="relative w-full max-w-5xl aspect-video glass-panel rounded-3xl p-4 overflow-hidden z-10 border border-sky-500/30 flex items-center justify-center bg-[#071324]/80">
          
          {/* SVG Canvas for Grid and Routes (X: -10 to 180, Y: 10 to 90) */}
          <svg className="w-full h-full overflow-visible" viewBox="-10 10 190 80" xmlns="http://www.w3.org/2000/svg">
            
            {/* 1. Draw Static Corridors (Jalan Raya) */}
            <path d="M 0 50 L 160 50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="15" strokeLinecap="round" />
            
            {/* 2. Draw 15 Parking Slots */}
            {allSlots.map(slot => (
              <g key={slot.id}>
                {/* Garis parkir penghubung (connector) */}
                <line x1={slot.x} y1={50} x2={slot.x} y2={slot.y} stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                {/* Kotak Parkir */}
                <rect 
                  x={slot.x - 6} 
                  y={slot.y === 30 ? 15 : 65} 
                  width="12" 
                  height="20" 
                  rx="1"
                  fill={slot.isTarget ? "rgba(74,222,128,0.2)" : "rgba(30,41,59,0.8)"}
                  stroke={slot.isTarget ? "#4ade80" : "rgba(100,116,139,0.5)"}
                  strokeWidth="0.5"
                  className={slot.isTarget ? "pulse-glow" : ""}
                />
                {/* Teks ID Slot */}
                <text 
                  x={slot.x} 
                  y={slot.y === 30 ? 26 : 76} 
                  fontSize="3" 
                  fill={slot.isTarget ? "#4ade80" : "#64748b"} 
                  textAnchor="middle" 
                  fontFamily="Space Grotesk" 
                  fontWeight="bold"
                >
                  {slot.id}
                </text>
              </g>
            ))}

            {/* 3. Gate Entrance */}
            <circle cx="0" cy="50" r="3" fill="#0ea5e9" stroke="#38bdf8" strokeWidth="1" />
            <text x="0" y="56" fontSize="3" fill="#38bdf8" textAnchor="middle" fontWeight="bold">GATE</text>

            {/* 4. Glowing Active Route from Backend (A*) */}
            {ruteKoordinat && ruteKoordinat.length > 0 && (
              <path 
                className="glowing-route" 
                d={buildSvgPath()} 
                fill="none" 
                stroke="#4ade80" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2"
              />
            )}
          </svg>

          {/* Ikon Mobil Navigasi Bergerak (Jika browser support CSS offset-path) */}
          {ruteKoordinat && ruteKoordinat.length > 0 && (
            <div className="absolute car-anim w-4 h-4 rounded-full bg-white shadow-[0_0_10px_white] z-50 pointer-events-none flex items-center justify-center mix-blend-screen" style={{ marginTop: '-2px', marginLeft: '-2px' }}>
                <span className="material-symbols-outlined text-green-500 text-[10px]">my_location</span>
            </div>
          )}

        </div>
      </main>

      {/* Bottom Prominent Status */}
      <footer className="w-full pb-8 pt-2 flex justify-center relative z-10">
        <div className="w-full max-w-4xl bg-green-500/20 border border-green-400/50 text-green-300 py-4 px-8 rounded-2xl flex items-center justify-center gap-6 shadow-[0_0_20px_rgba(74,222,128,0.2)] backdrop-blur-xl">
          <span className="material-symbols-outlined text-[36px] animate-bounce" style={{ fontVariationSettings: "'FILL' 1" }}>arrow_forward</span>
          <span className="text-[24px] font-extrabold uppercase tracking-[0.2em] text-center drop-shadow-md">SILAKAN IKUTI RUTE HIJAU</span>
        </div>
      </footer>
    </div>
  );
}
