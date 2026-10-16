import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';

export default function NavigationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Ambil data dari halaman sebelumnya
  const { slotData, platNomor } = location.state || {};
  const targetSlot = slotData?.idSlotDialokasikan || "B1-01";
  const ruteKoordinat = slotData?.urutan || []; // Array of TitikRuteDto {id, x, y}

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isParked, setIsParked] = useState(false);
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);

  // Stopwatch berjalan sejak masuk gerbang
  useEffect(() => {
    if (isParked) return;
    const interval = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isParked]);

  // Polling status slot dari backend untuk mendeteksi tembakan webhook sensor
  useEffect(() => {
    if (isParked) return;

    const checkSlotStatus = async () => {
      try {
        const res = await fetch('/api/monitoring/slots');
        if (res.ok) {
          const slots = await res.json();
          const target = slots.find(s => s.idSlot === targetSlot);
          if (target && target.statusSlot === 'TERISI') {
            setIsParked(true);
          }
        }
      } catch (e) {
        console.error("Gagal polling status slot:", e);
      }
    };

    const pollInterval = setInterval(checkSlotStatus, 1500);
    return () => clearInterval(pollInterval);
  }, [targetSlot, isParked]);

  // Format detik ke MM:SS
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const curlCommand = `curl -X POST "http://localhost:8081/api/monitoring/webhook?idSlot=${targetSlot}&statusSensor=TERISI"`;

  const copyCurl = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const triggerWebhookDirectly = async () => {
    try {
      await fetch(`/api/monitoring/webhook?idSlot=${encodeURIComponent(targetSlot)}&statusSensor=TERISI`, {
        method: 'POST'
      });
      setIsParked(true);
    } catch (e) {
      console.error("Gagal trigger webhook langsung:", e);
    }
  };

  // Generate 16 Slot Statis untuk digambar di Peta sebagai latar belakang (B1-01 s.d. B1-16)
  const allSlots = Array.from({length: 16}, (_, i) => {
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
    <div className="bg-[#050B14] h-screen w-screen flex flex-col overflow-hidden select-none text-slate-100 font-['Outfit']">
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
        
        {/* Right Info: Live Timer & Plat */}
        <div className="flex items-center gap-4">
          {/* Live Timer */}
          <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border ${isParked ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300' : 'bg-amber-950/60 border-amber-500/50 text-amber-300 animate-pulse'}`}>
            <span className="material-symbols-outlined text-lg">timer</span>
            <span className="font-mono font-bold text-sm tracking-widest">{formatTime(elapsedSeconds)}</span>
            <span className="text-xs uppercase">{isParked ? '(PARKIR TIBA)' : '(BERJALAN)'}</span>
          </div>

          <div className="text-slate-100 font-medium flex items-center bg-sky-900/40 border border-sky-500/30 px-5 py-1.5 rounded-full shadow-[0_0_15px_rgba(14,165,233,0.2)]">
            <span className="tracking-wider text-sm">Plat: <strong className="text-sky-300">{platNomor || "D 1234 SPCT"}</strong> | Slot: <strong className="text-green-400">{targetSlot}</strong></span>
          </div>

          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-full border border-slate-600 transition-colors text-xs font-['Space_Grotesk'] cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">close</span>
            <span>Kembali</span>
          </button>
        </div>
      </header>

      {/* Main Content Canvas (Map) */}
      <main className="flex-1 relative overflow-hidden flex items-center justify-center p-6">
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
                  fill={slot.isTarget ? (isParked ? "rgba(16,185,129,0.4)" : "rgba(74,222,128,0.2)") : "rgba(30,41,59,0.8)"}
                  stroke={slot.isTarget ? (isParked ? "#10b981" : "#4ade80") : "rgba(100,116,139,0.5)"}
                  strokeWidth={slot.isTarget ? "1.5" : "0.5"}
                  className={slot.isTarget ? "pulse-glow" : ""}
                />
                {/* Teks ID Slot */}
                <text 
                  x={slot.x} 
                  y={slot.y === 30 ? 26 : 76} 
                  fontSize="3" 
                  fill={slot.isTarget ? (isParked ? "#10b981" : "#4ade80") : "#64748b"} 
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

          {/* Ikon Mobil Navigasi Bergerak */}
          {ruteKoordinat && ruteKoordinat.length > 0 && (
            <div className="absolute car-anim w-4 h-4 rounded-full bg-white shadow-[0_0_10px_white] z-50 pointer-events-none flex items-center justify-center mix-blend-screen" style={{ marginTop: '-2px', marginLeft: '-2px' }}>
                <span className="material-symbols-outlined text-green-500 text-[10px]">my_location</span>
            </div>
          )}

        </div>
      </main>

      {/* Bottom Prominent Status & Webhook Helper Bar */}
      <footer className="w-full pb-6 pt-2 flex flex-col items-center gap-3 relative z-10 px-6">
        {isParked ? (
          /* State 1: Kendaraan Sudah Tiba (Webhook Ditembak) */
          <div className="w-full max-w-4xl bg-emerald-500/20 border border-emerald-400/60 text-emerald-300 py-3.5 px-6 rounded-2xl flex items-center justify-between shadow-[0_0_25px_rgba(16,185,129,0.3)] backdrop-blur-xl animate-fade-in">
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-3xl text-emerald-400">check_circle</span>
              <div>
                <div className="text-lg font-bold">KENDARAAN TELAH TIBA DI SLOT {targetSlot}!</div>
                <div className="text-xs text-emerald-200/80">
                  Waktu tempuh aktual: <strong>{elapsedSeconds} detik</strong> ({formatTime(elapsedSeconds)} menit) telah dicatat ke database & diakumulasikan ke metrik reduksi CO2.
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate('/')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-5 py-2 rounded-xl text-sm transition-all shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <span>Selesai (Kembali)</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        ) : (
          /* State 2: Sedang Berjalan Menuju Slot (Menunggu Webhook) */
          <div className="w-full max-w-4xl flex flex-col gap-2">
            <div className="bg-green-500/20 border border-green-400/50 text-green-300 py-2.5 px-6 rounded-2xl flex items-center justify-between shadow-[0_0_20px_rgba(74,222,128,0.2)] backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-2xl animate-bounce" style={{ fontVariationSettings: "'FILL' 1" }}>arrow_forward</span>
                <span className="text-lg font-bold tracking-wider">SILAKAN IKUTI RUTE HIJAU MENUJU {targetSlot}</span>
              </div>
              <div className="flex items-center gap-2 text-xs bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-700/80">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                <span>Waktu berjalan: <strong className="text-amber-300 font-mono text-sm">{formatTime(elapsedSeconds)}</strong></span>
              </div>
            </div>

            {/* Webhook Instruction Box */}
            <div className="bg-slate-900/80 border border-slate-700/70 rounded-xl px-4 py-2 flex items-center justify-between gap-4 text-xs backdrop-blur-md">
              <div className="flex items-center gap-2 overflow-hidden text-slate-300">
                <span className="material-symbols-outlined text-sky-400 text-sm">terminal</span>
                <span className="text-slate-400 font-['Space_Grotesk'] font-semibold shrink-0">cURL Webhook:</span>
                <code className="text-sky-300 font-mono truncate bg-black/40 px-2 py-0.5 rounded border border-slate-800">
                  {curlCommand}
                </code>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={copyCurl}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1 rounded-lg border border-slate-600 transition-colors flex items-center gap-1 cursor-pointer font-['Space_Grotesk']"
                  title="Salin Perintah cURL"
                >
                  <span className="material-symbols-outlined text-xs">{copied ? "done" : "content_copy"}</span>
                  <span>{copied ? "Tersalin!" : "Salin"}</span>
                </button>
                <button
                  onClick={triggerWebhookDirectly}
                  className="bg-sky-600 hover:bg-sky-500 text-white px-3 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer font-['Space_Grotesk'] font-semibold shadow-sm"
                  title="Klik untuk simulasi tiba tanpa buka terminal"
                >
                  <span className="material-symbols-outlined text-xs">sensors</span>
                  <span>Simulasi Tiba (Sensor)</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </footer>
    </div>
  );
}
