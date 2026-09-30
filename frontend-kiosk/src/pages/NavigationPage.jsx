import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function NavigationPage() {
  const navigate = useNavigate();

  // Auto redirect kembali ke scan setelah beberapa detik untuk simulasi
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/success'); // Pindah ke success gate out untuk demo flow lengkap
    }, 6000);
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
            filter: drop-shadow(0 0 8px #2E8B57);
            stroke-dashoffset: 1000;
            animation: dash 3s linear forwards;
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
          <span>Tujuan Anda: Slot B1-10 | ID: 021</span>
        </div>
        <div className="flex items-center gap-4 text-primary">
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
              {/* Base Paths */}
              <path d="M 100 500 L 100 400 Q 100 350 150 350 L 600 350 Q 650 350 650 300 L 650 150" fill="none" stroke="#30363a" strokeLinecap="round" strokeLinejoin="round" strokeWidth="40"></path>
              {/* Glowing Route (Nature Green) */}
              <path className="glowing-route" d="M 100 500 L 100 400 Q 100 350 150 350 L 600 350 Q 650 350 650 300 L 650 150" fill="none" stroke="#2E8B57" strokeDasharray="1000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="8"></path>
            </svg>
            
            {/* Start Point (Entrance Gate) */}
            <div className="absolute bottom-12 left-20 flex flex-col items-center">
              <div className="w-6 h-6 rounded-full bg-surface-variant border-4 border-outline z-10 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-outline"></div>
              </div>
              <span className="text-tech-mono text-[12px] text-text-muted mt-2 bg-surface-container-high px-2 py-1 rounded">ENTRANCE</span>
            </div>
            
            {/* Destination Point (Slot B1-10) */}
            <div className="absolute top-24 right-24 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-eco-success glowing-pulse z-10 flex items-center justify-center shadow-[0_0_15px_#2E8B57]">
                <span className="material-symbols-outlined text-white text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
              </div>
            </div>

            {/* Parking Slots Representation */}
            <div className="absolute top-16 right-36 flex gap-2">
              <div className="w-16 h-24 border-2 border-outline-variant bg-slot-empty rounded flex items-center justify-center"><span className="text-tech-mono text-[10px] text-text-muted">B1-08</span></div>
              <div className="w-16 h-24 border-2 border-outline-variant bg-surface-variant rounded flex items-center justify-center"><span className="text-tech-mono text-[10px] text-text-muted">B1-09</span></div>
              <div className="w-16 h-24 border-2 border-eco-success bg-[rgba(46,139,87,0.1)] rounded flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-eco-success opacity-20 animate-pulse"></div>
                <span className="text-tech-mono text-[14px] text-eco-success font-bold z-10">B1-10</span>
              </div>
              <div className="w-16 h-24 border-2 border-outline-variant bg-slot-empty rounded flex items-center justify-center"><span className="text-tech-mono text-[10px] text-text-muted">B1-11</span></div>
            </div>

            {/* Environmental Details */}
            <div className="absolute bottom-20 right-20 text-text-muted opacity-50">
              <span className="material-symbols-outlined text-[48px]">local_parking</span>
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
