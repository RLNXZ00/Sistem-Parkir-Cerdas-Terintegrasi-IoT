import { useNavigate } from 'react-router-dom';

export default function ScanPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-bg-primary min-h-screen flex flex-col items-center justify-center relative overflow-hidden text-text-high-contrast" onClick={() => navigate('/allocating')}>
      {/* Top IoT Status Bar */}
      <header className="absolute top-0 left-0 w-full px-container-margin py-gutter flex justify-between items-start z-10">
        <div className="flex items-center gap-3 bg-surface-container/80 backdrop-blur-md px-4 py-2 rounded-full border border-surface-variant">
          <span className="w-3 h-3 rounded-full bg-secondary shadow-[0_0_8px_rgba(126,217,158,0.6)]"></span>
          <span className="font-tech-mono text-secondary uppercase text-[14px]">System Ready</span>
        </div>
        <div className="flex items-center gap-2 text-text-muted font-tech-mono text-[14px] bg-surface-container/50 px-3 py-1 rounded-full">
          <span className="material-symbols-outlined text-[18px]">videocam</span>
          <span>PG_005_LIVE</span>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="flex flex-col items-center justify-center w-full max-w-lg mx-auto px-container-margin z-10 relative">
        {/* Static Scanner Reticle UI */}
        <div className="relative w-full max-w-[320px] aspect-[16/9] border-2 border-surface-variant rounded-xl bg-surface/30 backdrop-blur-sm mb-12 flex items-center justify-center shadow-lg">
          {/* Reticle Target Corners */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-system-info rounded-tl-xl opacity-80"></div>
          <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-system-info rounded-tr-xl opacity-80"></div>
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-system-info rounded-bl-xl opacity-80"></div>
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-system-info rounded-br-xl opacity-80"></div>
          
          {/* Static Scan Line Overlay */}
          <div className="absolute top-1/3 left-0 w-full h-[2px] bg-system-info shadow-[0_0_15px_rgba(0,191,255,0.9)] animate-[pulse_2s_ease-in-out_infinite]"></div>
          
          {/* Subtle Gradient Fill */}
          <div className="absolute inset-0 bg-gradient-to-b from-system-info/5 via-transparent to-transparent rounded-xl"></div>
          
          {/* Center Icon Focus */}
          <span className="material-symbols-outlined text-[64px] text-system-info/30" style={{ fontVariationSettings: "'FILL' 1" }}>directions_car</span>
        </div>

        {/* Typography Display */}
        <div className="text-center flex flex-col gap-6">
          <h1 className="font-display-lg text-[48px] font-bold text-text-high-contrast tracking-tight drop-shadow-md">
            SILAKAN MAJU
          </h1>
          <div className="inline-flex items-center justify-center gap-3 bg-surface-container-high/80 px-6 py-3 rounded-full border border-surface-variant mx-auto">
            <span className="material-symbols-outlined text-system-info animate-spin">radar</span>
            <p className="font-headline-md text-system-info text-xl font-semibold">
              Scanning Vehicle...
            </p>
          </div>
        </div>
      </main>

      {/* Bottom Tech Branding */}
      <footer className="absolute bottom-0 left-0 w-full pb-container-margin px-container-margin flex justify-center items-center z-10">
        <div className="flex items-center gap-4 border-t border-surface-variant pt-4 w-full max-w-md justify-center">
          <span className="font-tech-mono text-text-muted text-[12px] uppercase tracking-widest">Powered by PARK-TECH</span>
        </div>
      </footer>
    </div>
  );
}
