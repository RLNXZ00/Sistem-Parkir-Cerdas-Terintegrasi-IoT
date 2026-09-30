import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function AllocatingSlotPage() {
  const navigate = useNavigate();

  // Simulasi auto-redirect ke halaman navigasi setelah beberapa detik
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/navigation');
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="bg-surface h-screen w-screen overflow-hidden flex items-center justify-center font-body-base text-on-surface cursor-pointer" onClick={() => navigate('/navigation')}>
      <style>{`
        .terminal-glow { text-shadow: 0 0 20px rgba(46, 139, 87, 0.6); }
      `}</style>
      
      <main className="flex flex-col items-center justify-center text-center space-y-12 p-container-margin w-full max-w-7xl mx-auto">
        {/* Top Status */}
        <div className="text-text-muted font-tech-mono uppercase tracking-widest opacity-80 animate-pulse">
          MENDAPATKAN SLOT...
        </div>

        {/* Center Main Display */}
        <div className="flex flex-col items-center justify-center space-y-6">
          <h1 className="text-[128px] leading-none font-extrabold tracking-tighter font-terminal-status text-eco-success terminal-glow">
            B1-10
          </h1>
          <h2 className="font-headline-md text-2xl text-text-high-contrast tracking-wide uppercase">
            SLOT PARKIR ANDA
          </h2>
        </div>

        {/* Sub Info */}
        <div className="bg-surface-container-high px-8 py-4 rounded-xl border border-outline-variant shadow-lg backdrop-blur-sm">
          <p className="font-tech-mono text-system-info text-xl">
            ID Parkir: 021
          </p>
        </div>

        {/* Bottom Loading */}
        <div className="flex items-center space-x-3 text-on-surface-variant font-tech-mono text-sm mt-16 opacity-70">
          <span className="material-symbols-outlined text-xl animate-spin" style={{ fontVariationSettings: "'FILL' 0" }}>
            sync
          </span>
          <span>Menyiapkan rute navigasi...</span>
        </div>
      </main>
    </div>
  );
}
