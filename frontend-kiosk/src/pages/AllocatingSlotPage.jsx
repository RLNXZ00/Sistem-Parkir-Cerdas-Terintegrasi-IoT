import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function AllocatingSlotPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [slot, setSlot] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Ambil plat nomor dari state yang dikirim oleh ScanPage
  const platNomor = location.state?.platNomor || "D 1234 SPCT";

  useEffect(() => {
    let isMounted = true;

    const fetchSlot = async () => {
      try {
        // 1. Panggil API Alokasi Rute dari Backend Spring Boot
        const response = await fetch(`/api/alokasi-rute/proses?platNomor=${encodeURIComponent(platNomor)}&jenisKendaraan=MOBIL`, {
          method: 'POST'
        });

        if (!response.ok) {
          throw new Error('Gagal mendapatkan slot parkir');
        }

        const data = await response.json();
        
        if (isMounted) {
          setSlot(data);
          // 2. Setelah dapat slot, tunggu 3 detik biar user bisa baca, lalu pindah ke peta navigasi
          setTimeout(() => {
            navigate('/navigation', { state: { slotData: data, platNomor } });
          }, 3000);
        }

      } catch (error) {
        console.error(error);
        if (isMounted) {
          setErrorMsg("Maaf, parkiran penuh atau terjadi kesalahan server.");
          // Kembali ke halaman awal setelah 3 detik jika error
          setTimeout(() => navigate('/'), 3000);
        }
      }
    };

    fetchSlot();

    return () => { isMounted = false; };
  }, [navigate, platNomor]);

  return (
    <div className="bg-[#050B14] h-screen w-screen overflow-hidden flex items-center justify-center font-['Outfit'] text-slate-100">
      <main className="flex flex-col items-center justify-center text-center space-y-12 p-8 w-full max-w-7xl mx-auto z-10">
        
        {/* Top Status */}
        <div className="text-sky-400 font-['Space_Grotesk'] uppercase tracking-[0.3em] font-semibold animate-pulse">
          {errorMsg ? "SYSTEM ERROR" : (slot ? "SLOT DITEMUKAN" : "MENCARI SLOT TERDEKAT...")}
        </div>

        {/* Center Main Display */}
        <div className="flex flex-col items-center justify-center space-y-6">
          {errorMsg ? (
             <h1 className="text-[64px] leading-none font-bold tracking-tighter text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]">
                {errorMsg}
             </h1>
          ) : (
            <>
              <h1 className="text-[140px] leading-none font-extrabold tracking-tighter text-green-400 drop-shadow-[0_0_30px_rgba(74,222,128,0.6)] animate-pulse">
                {slot ? slot.idSlot : "..."}
              </h1>
              <h2 className="text-2xl text-slate-300 tracking-[0.2em] uppercase font-light">
                SLOT PARKIR ANDA
              </h2>
            </>
          )}
        </div>

        {/* Sub Info */}
        {slot && (
          <div className="glass-panel px-10 py-6 rounded-2xl">
            <p className="font-['Space_Grotesk'] text-sky-300 text-xl tracking-widest font-semibold">
              PLAT NOMOR: {platNomor}
            </p>
          </div>
        )}

        {/* Bottom Loading */}
        {!errorMsg && (
          <div className="flex items-center space-x-3 text-slate-400 font-['Space_Grotesk'] text-sm mt-16 opacity-70">
            <span className="material-symbols-outlined text-xl animate-spin" style={{ fontVariationSettings: "'FILL' 0" }}>
              sync
            </span>
            <span className="tracking-widest uppercase">{slot ? "Menyiapkan rute peta..." : "Sinkronisasi Database..."}</span>
          </div>
        )}
      </main>

      {/* Background Decor */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-sky-900/20 via-[#050B14] to-[#050B14] pointer-events-none"></div>
    </div>
  );
}
