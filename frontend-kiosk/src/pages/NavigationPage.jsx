import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

export default function NavigationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Ambil data dari halaman sebelumnya
  const { slotData, platNomor } = location.state || {};
  const targetSlot = slotData?.idSlot || "B1-01";

  // Auto redirect kembali ke scan setelah beberapa detik
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/');
    }, 12000);
    return () => clearTimeout(timer);
  }, [navigate]);

  // Generate slots data
  const topSlots = [1, 3, 5, 7, 9, 11, 13, 15].map(num => `B1-${num.toString().padStart(2, '0')}`);
  const bottomSlots = [2, 4, 6, 8, 10, 12, 14].map(num => `B1-${num.toString().padStart(2, '0')}`);

  return (
    <div className="bg-[#040810] h-screen w-screen flex flex-col overflow-hidden select-none font-['Inter'] cursor-pointer" onClick={() => navigate('/')}>
      <style>{`
        .map-grid-bg {
            background-image: 
                linear-gradient(to right, rgba(14,165,233,0.05) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(14,165,233,0.05) 1px, transparent 1px);
            background-size: 30px 30px;
        }
      `}</style>

      {/* Map Background Pattern */}
      <div className="absolute inset-0 map-grid-bg pointer-events-none"></div>

      {/* TopAppBar */}
      <header className="flex justify-between items-center w-full px-12 py-8 relative z-10">
        <div className="flex items-center gap-3 text-sky-400">
          <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>map</span>
          <span className="font-['Space_Grotesk'] text-[18px] font-bold tracking-[0.2em] text-sky-200">PETA ALOKASI A* GRAPH</span>
        </div>
        <div className="text-slate-300 font-medium text-[15px] flex items-center bg-[#071324] border border-sky-900/50 px-6 py-2 rounded-full">
          <span>Plat: <strong className="text-sky-300">{platNomor || "D 1234 SPCT"}</strong> | Menuju: <strong className="text-green-400">{targetSlot}</strong></span>
        </div>
      </header>

      {/* Main Content Canvas (Map) */}
      <main className="flex-1 relative flex items-center justify-center -mt-12 z-10">
        
        {/* Container Peta (Border melengkung) */}
        <div className="relative w-[900px] h-[450px] bg-[#0A101C] border border-[#1E293B] rounded-[2rem] flex flex-col items-center justify-center shadow-2xl">
          
          {/* Lorong Tengah (Driveway Hitam transparan) */}
          <div className="absolute w-[80%] h-[50px] bg-[#1E293B]/40 rounded-full left-[10%] top-1/2 -translate-y-1/2 flex items-center">
             {/* Lingkaran Gate */}
             <div className="absolute -left-2 flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-sky-500 flex items-center justify-center shadow-[0_0_20px_rgba(14,165,233,0.5)] border-4 border-[#0A101C] z-20">
                  <div className="w-4 h-4 rounded-full bg-sky-200"></div>
                </div>
                <span className="absolute top-[110%] text-[11px] font-bold text-sky-400 tracking-wider">GATE</span>
             </div>
          </div>

          {/* Grid Layout untuk Slot */}
          <div className="absolute inset-0 px-24 py-16 flex flex-col justify-between">
            
            {/* BARIS ATAS (Top Slots) */}
            <div className="flex justify-between w-full z-10">
              {topSlots.map(slot => {
                const isTarget = slot === targetSlot;
                return (
                  <div key={slot} className="relative flex flex-col items-center">
                    {/* Kotak Slot */}
                    <div className={`w-[60px] h-[90px] rounded-md flex items-center justify-center border-2 transition-all duration-500
                      ${isTarget 
                        ? 'border-green-500 bg-green-500/10 shadow-[0_0_20px_rgba(34,197,94,0.3)]' 
                        : 'border-[#1E293B] bg-[#0F172A]/80'}`}>
                      <span className={`text-[12px] font-bold ${isTarget ? 'text-green-400' : 'text-slate-500'}`}>{slot}</span>
                    </div>
                    {/* Garis penghubung ke lorong */}
                    <div className="w-[30px] h-[25px] bg-[#1E293B]/40 mt-1 rounded-sm"></div>
                  </div>
                )
              })}
            </div>

            {/* BARIS BAWAH (Bottom Slots) */}
            <div className="flex justify-between w-full pl-[95px] pr-2 z-10">
              {bottomSlots.map(slot => {
                const isTarget = slot === targetSlot;
                return (
                  <div key={slot} className="relative flex flex-col items-center">
                    {/* Garis penghubung ke lorong */}
                    <div className="w-[30px] h-[25px] bg-[#1E293B]/40 mb-1 rounded-sm"></div>
                    {/* Kotak Slot */}
                    <div className={`w-[60px] h-[90px] rounded-md flex items-center justify-center border-2 transition-all duration-500
                      ${isTarget 
                        ? 'border-green-500 bg-green-500/10 shadow-[0_0_20px_rgba(34,197,94,0.3)]' 
                        : 'border-[#1E293B] bg-[#0F172A]/80'}`}>
                      <span className={`text-[12px] font-bold ${isTarget ? 'text-green-400' : 'text-slate-500'}`}>{slot}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      </main>

      {/* Bottom Button */}
      <footer className="w-full pb-16 flex justify-center z-10">
        <button className="bg-[#0B1E13] border border-green-500/40 text-green-400 py-4 px-24 rounded-full flex items-center gap-4 hover:bg-[#112F1D] transition-colors shadow-[0_4px_20px_rgba(34,197,94,0.15)]">
          <span className="material-symbols-outlined font-light">arrow_forward</span>
          <span className="text-[16px] font-bold tracking-[0.15em] uppercase">SILAKAN IKUTI RUTE HIJAU</span>
        </button>
      </footer>
    </div>
  );
}
