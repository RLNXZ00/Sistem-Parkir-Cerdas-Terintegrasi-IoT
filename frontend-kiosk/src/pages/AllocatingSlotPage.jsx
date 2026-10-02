import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function AllocatingSlotPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [slot, setSlot] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Ambil data dari halaman sebelumnya atau gunakan default (Simulasi)
  const platNomor = location.state?.platNomor || "B 1234 XYZ";
  const jenisKendaraan = location.state?.jenisKendaraan || "MOBIL";

  useEffect(() => {
    let isMounted = true;

    const fetchSlot = async () => {
      try {
        // Panggil API utama Gerbang Masuk (ALPR simulasi)
        const response = await fetch(`http://localhost:8081/api/gate/masuk?platNomor=${encodeURIComponent(platNomor)}&jenisKendaraan=${jenisKendaraan}&confidence=0.98`, {
          method: 'POST'
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.pesan || 'Gagal mendapatkan slot parkir');
        }

        if (isMounted) {
          setSlot(data);
          // Pindah ke halaman navigasi rute setelah 3 detik
          setTimeout(() => {
            navigate('/navigation', { state: { slotData: data, platNomor } });
          }, 3000);
        }
      } catch (error) {
        console.error(error);
        if (isMounted) {
          setErrorMsg(error.message || "Maaf, parkiran penuh atau server sibuk.");
          setTimeout(() => navigate('/'), 4000); // Kembali ke awal
        }
      }
    };

    fetchSlot();
    return () => { isMounted = false; };
  }, [navigate, platNomor, jenisKendaraan]);

  return (
    <div className="bg-surface h-screen w-screen overflow-hidden flex items-center justify-center font-body-base text-on-surface">
      <style>{`
        .terminal-glow { text-shadow: 0 0 20px rgba(46, 139, 87, 0.6); }
        .error-glow { text-shadow: 0 0 20px rgba(255, 69, 0, 0.6); }
      `}</style>
      
      <main className="flex flex-col items-center justify-center text-center space-y-12 p-container-margin w-full max-w-7xl mx-auto z-10">
        
        {/* Top Status */}
        <div className={`font-tech-mono uppercase tracking-widest opacity-80 animate-pulse ${errorMsg ? 'text-alert-anomaly' : 'text-text-muted'}`}>
          {errorMsg ? "SYSTEM ERROR" : (slot ? "SLOT DIALOKASIKAN" : "MENGHUBUNGI SERVER...")}
        </div>

        {/* Center Main Display */}
        <div className="flex flex-col items-center justify-center space-y-6">
          {errorMsg ? (
            <h1 className="text-[64px] leading-none font-bold tracking-tighter text-alert-anomaly error-glow">
              {errorMsg}
            </h1>
          ) : (
            <>
              <h1 className={`text-[128px] leading-none font-extrabold tracking-tighter font-terminal-status text-eco-success terminal-glow ${!slot ? 'animate-pulse opacity-50' : ''}`}>
                {slot ? slot.slotDialokasikan : "..."}
              </h1>
              <h2 className="font-headline-md text-2xl text-text-high-contrast tracking-wide uppercase">
                SLOT PARKIR ANDA
              </h2>
            </>
          )}
        </div>

        {/* Sub Info */}
        {slot && (
          <div className="bg-surface-container-high px-8 py-4 rounded-xl border border-outline-variant shadow-lg backdrop-blur-sm">
            <p className="font-tech-mono text-system-info text-xl">
              Plat Nomor: {platNomor}
            </p>
          </div>
        )}

        {/* Bottom Loading */}
        {!errorMsg && (
          <div className="flex items-center space-x-3 text-on-surface-variant font-tech-mono text-sm mt-16 opacity-70">
            <span className="material-symbols-outlined text-xl animate-spin" style={{ fontVariationSettings: "'FILL' 0" }}>
              sync
            </span>
            <span>{slot ? "Menyiapkan rute navigasi..." : "Sinkronisasi IoT..."}</span>
          </div>
        )}
      </main>
    </div>
  );
}
