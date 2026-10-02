import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function NavigationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [pathD, setPathD] = useState('');
  const [startPoint, setStartPoint] = useState({x: -100, y: -100});
  const [endPoint, setEndPoint] = useState({x: -100, y: -100});

  const slotData = location.state?.slotData;
  const platNomor = location.state?.platNomor || 'Unknown';
  const slotId = slotData?.slotDialokasikan || '---';
  const idTransaksi = slotData?.idTransaksi || '000';
  const jalur = slotData?.jalurRuteGraf || [];

  // Konversi koordinat dari Backend (skala 0-160) ke kanvas SVG Frontend (800x600)
  const mapToSvg = (x, y) => {
    // X digeser ke kanan (+100) dan dikalikan skala 4
    const scaledX = 100 + (x * 4);
    // Y (tengah koridor = 50) dipusatkan di SVG Y=300, skala 4
    const scaledY = 300 + ((y - 50) * 4);
    return { x: scaledX, y: scaledY };
  };

  useEffect(() => {
    if (jalur && jalur.length > 0) {
      const pathString = jalur.map((titik, index) => {
        const { x, y } = mapToSvg(titik.x, titik.y);
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
      }).join(' ');

      setPathD(pathString);
      setStartPoint(mapToSvg(jalur[0].x, jalur[0].y));
      setEndPoint(mapToSvg(jalur[jalur.length - 1].x, jalur[jalur.length - 1].y));
    }
  }, [jalur]);

  // Auto redirect kembali ke scan setelah beberapa detik untuk simulasi
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/success'); // Pindah ke success gate out untuk demo flow lengkap
    }, 8000); // 8 detik agar sempat melihat animasi rute
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="bg-bg-primary h-screen w-screen flex flex-col overflow-hidden select-none cursor-pointer" onClick={() => navigate('/success')}>
      <style>{`
        .map-grid {
            background-image: 
                linear-gradient(to right, #30363a 1px, transparent 1px),
                linear-gradient(to bottom, #30363a 1px, transparent 1px);
            background-size: 40px 40px;
        }
        .glowing-route {
            filter: drop-shadow(0 0 12px #2E8B57);
            stroke-dasharray: 2000;
            stroke-dashoffset: 2000;
            animation: dash 4s ease-out forwards;
        }
        @keyframes dash {
            to { stroke-dashoffset: 0; }
        }
        .glowing-pulse {
            animation: pulse-glow 2s infinite;
        }
        @keyframes pulse-glow {
            0% { box-shadow: 0 0 0 0 rgba(46, 139, 87, 0.7); }
            70% { box-shadow: 0 0 0 15px rgba(46, 139, 87, 0); }
            100% { box-shadow: 0 0 0 0 rgba(46, 139, 87, 0); }
        }
      `}</style>

      {/* TopAppBar Component */}
      <header className="bg-surface-dim flex justify-between items-center w-full px-container-margin py-4 border-b border-outline-variant relative z-10">
        <div className="flex items-center gap-gutter text-primary-fixed-dim font-bold">
          <span className="material-symbols-outlined text-primary-fixed-dim" style={{ fontVariationSettings: "'FILL' 1" }}>terminal</span>
          <span className="text-tech-mono font-bold tracking-wider">BASENET TERMINAL</span>
        </div>
        <div className="text-on-surface font-medium flex items-center bg-surface-variant px-4 py-2 rounded">
          <span>Tujuan Anda: Slot {slotId} | ID Transaksi: {idTransaksi}</span>
        </div>
        <div className="flex items-center gap-4 text-primary">
          <span className="material-symbols-outlined font-tech-mono text-sm tracking-widest bg-black/50 px-2 py-1 rounded border border-primary/30">{platNomor}</span>
          <span className="material-symbols-outlined">wifi</span>
          <span className="material-symbols-outlined">sensors</span>
          <span className="material-symbols-outlined">schedule</span>
        </div>
      </header>

      {/* Main Content Canvas (Map) */}
      <main className="flex-1 relative bg-bg-surface overflow-hidden">
        <div className="absolute inset-0 map-grid flex items-center justify-center pointer-events-none">
          {/* Map Container */}
          <div className="relative w-[800px] h-[600px] bg-surface-container rounded-xl border border-outline-variant p-8 overflow-hidden shadow-2xl">
            {/* Driveway / Path */}
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
              {/* Garis Koridor Dasar (Background) */}
              <path d="M 100 300 L 740 300" fill="none" stroke="#30363a" strokeLinecap="round" strokeWidth="40"></path>
              
              {/* Garis Rute Dinamis (Glowing Neon Green) */}
              {pathD && (
                <path 
                  className="glowing-route" 
                  d={pathD} 
                  fill="none" 
                  stroke="#2E8B57" 
                  strokeLinecap="square" 
                  strokeLinejoin="miter" 
                  strokeWidth="12"
                ></path>
              )}
            </svg>
            
            {/* Start Point (Entrance Gate) */}
            {jalur.length > 0 && (
              <div 
                className="absolute flex flex-col items-center"
                style={{ left: startPoint.x - 12, top: startPoint.y - 12 }}
              >
                <div className="w-6 h-6 rounded-full bg-surface-variant border-4 border-outline z-10 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-outline"></div>
                </div>
                <span className="text-tech-mono text-[12px] text-text-muted mt-2 bg-surface-container-high px-2 py-1 rounded whitespace-nowrap -ml-4">ENTRANCE</span>
              </div>
            )}
            
            {/* Destination Point (Slot Dinamis) */}
            {jalur.length > 0 && (
              <div 
                className="absolute flex flex-col items-center"
                style={{ left: endPoint.x - 16, top: endPoint.y - 16 }}
              >
                <div className="w-8 h-8 rounded-full bg-eco-success glowing-pulse z-10 flex items-center justify-center shadow-[0_0_15px_#2E8B57]">
                  <span className="material-symbols-outlined text-white text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
                </div>
                <span className="text-tech-mono text-[14px] text-eco-success font-bold z-10 mt-2 bg-black/60 px-2 py-1 rounded whitespace-nowrap -ml-2">{slotId}</span>
              </div>
            )}

            {/* Environmental Details */}
            <div className="absolute bottom-20 right-20 text-text-muted opacity-50">
              <span className="material-symbols-outlined text-[48px]">local_parking</span>
              <span className="font-tech-mono text-xs block mt-2">SEKTOR B1</span>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Prominent Status */}
      <footer className="w-full bg-bg-surface p-container-margin flex justify-center pb-12 relative z-10">
        <div className="w-full max-w-4xl bg-eco-success text-white py-6 px-8 rounded-xl flex items-center justify-center gap-6 shadow-[0_0_30px_rgba(46,139,87,0.4)] glowing-pulse">
          <span className="material-symbols-outlined text-[48px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          <span className="text-[32px] font-extrabold uppercase tracking-wide text-center">PALANG DIBUKA - SILAKAN MASUK</span>
        </div>
      </footer>
    </div>
  );
}
