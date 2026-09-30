import { useNavigate } from 'react-router-dom';

export default function FailedPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-bg-primary text-on-surface h-screen w-screen overflow-hidden flex flex-col items-center justify-center relative">
      <style>{`
        .glass-panel {
            background: rgba(30, 30, 30, 0.7);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 69, 0, 0.2);
        }
        .glow-red {
            box-shadow: 0 0 40px rgba(255, 69, 0, 0.4);
        }
      `}</style>
      
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-10" style={{ backgroundImage: 'radial-gradient(circle at center, rgba(255, 69, 0, 0.3) 0%, transparent 70%)' }}></div>
      <div className="absolute inset-0 z-0 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)' }}></div>

      {/* Main Content Area */}
      <main className="w-full max-w-5xl mx-auto flex flex-col items-center justify-center gap-12 px-container-margin z-10 relative">
        {/* Large Warning Icon */}
        <div className="relative">
          <div className="absolute inset-0 bg-alert-anomaly opacity-20 blur-3xl rounded-full scale-150 animate-pulse"></div>
          <span className="material-symbols-outlined text-[120px] text-alert-anomaly relative z-10" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
        </div>

        {/* Typography: Main Error State */}
        <div className="text-center flex flex-col gap-4">
          <h2 className="text-[48px] font-bold text-alert-anomaly animate-pulse uppercase tracking-widest drop-shadow-[0_0_15px_rgba(255,69,0,0.8)]">
            SALDO KURANG
          </h2>
          <p className="text-2xl font-semibold text-text-high-contrast opacity-90 max-w-2xl mx-auto leading-relaxed">
            Mohon lakukan pengisian saldo atau gunakan kartu lain
          </p>
        </div>

        {/* Details Card */}
        <div className="glass-panel glow-red rounded-xl p-8 w-full max-w-xl flex flex-col items-center gap-6 mt-8">
          <span className="text-text-muted uppercase tracking-wider font-tech-mono">Detected License Plate</span>
          
          <div className="rounded-lg px-8 flex items-center justify-center w-full bg-white/5 border border-white/10 py-6">
            <span className="font-tech-mono text-[40px] font-bold tracking-[0.2em] text-text-high-contrast">
              AB 1234 CD
            </span>
          </div>

          {/* Quick Actions */}
          <div className="flex w-full gap-4 mt-4">
            <button onClick={() => navigate('/')} className="flex-1 hover:bg-surface-bright text-on-surface py-4 rounded-lg transition-colors border border-outline-variant flex items-center justify-center gap-2 bg-white/10">
              <span className="material-symbols-outlined">refresh</span>
              <span className="font-tech-mono uppercase tracking-widest font-bold">RETRY CARD</span>
            </button>
            <button className="flex-1 bg-alert-anomaly/20 hover:bg-alert-anomaly/30 text-alert-anomaly py-4 rounded-lg transition-colors border border-alert-anomaly flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">support_agent</span>
              <span className="font-tech-mono uppercase tracking-widest font-bold">CALL ASSISTANCE</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer BottomNavBar */}
      <div className="absolute bottom-8 flex items-center gap-2 text-on-surface-variant z-10">
        <span className="material-symbols-outlined text-system-info" style={{ fontSize: '18px' }}>cloud_done</span>
        <span className="font-tech-mono text-sm tracking-widest opacity-80">SISTEM ONLINE</span>
      </div>
    </div>
  );
}
