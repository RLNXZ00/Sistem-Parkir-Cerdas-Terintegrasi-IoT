import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function ExitSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state?.data || {};
  
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    // Redirect back to standby after 10 seconds
    const timer = setTimeout(() => {
      navigate('/exit');
    }, 10000);

    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour12: false }));
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [navigate]);

  return (
    <div className="bg-[#121212] text-white min-h-screen flex flex-col items-center justify-center relative overflow-hidden" 
         style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(46, 139, 87, 0.05) 0%, transparent 50%)' }}>
      
      {/* Main Container */}
      <main className="relative z-10 flex flex-col items-center justify-center w-full max-w-4xl px-6 py-8 h-screen gap-8">
        
        {/* Top Indicator */}
        <div className="absolute top-8 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#2E8B57] shadow-[0_0_10px_#2E8B57] animate-pulse"></div>
          <span className="font-['Space_Grotesk'] text-sm text-[#bcc8d1] tracking-widest opacity-80 uppercase">EXIT TERMINAL</span>
        </div>

        {/* Central Status */}
        <div className="flex flex-col items-center justify-center mb-12 text-center">
          <span className="material-symbols-outlined text-[#2E8B57] mb-4" style={{ fontSize: '80px', fontVariationSettings: "'FILL' 1" }}>
            check_circle
          </span>
          <h1 className="font-['Inter'] text-[64px] font-extrabold leading-tight tracking-tight uppercase text-[#2E8B57]" 
              style={{ textShadow: '0 0 15px rgba(46, 139, 87, 0.4), 0 0 40px rgba(46, 139, 87, 0.4)' }}>
            LUNAS
          </h1>
          <p className="font-['Inter'] text-2xl font-medium tracking-widest mt-2 uppercase text-white">
            Silakan Jalan
          </p>
        </div>

        {/* Details Card */}
        <div className="w-full space-y-4 max-w-[540px]">
          <div className="bg-[#252b2f] border border-[#3d4850] rounded-xl p-6 flex flex-col items-center py-10">
            <p className="font-['Space_Grotesk'] text-sm text-[#bcc8d1] mb-3 uppercase tracking-widest">Detected Plate</p>
            <div className="bg-[#0e1418] border-2 border-[#2E8B57]/50 rounded-lg px-12 py-6">
              <span className="font-['Space_Grotesk'] text-5xl font-bold text-white tracking-[0.2em]">
                {data.platNomor || "AB 1234 CD"}
              </span>
            </div>
          </div>
          
          <div className="bg-[#252b2f] border border-[#3d4850] rounded-xl p-8 flex justify-between items-center px-6">
            <span className="font-['Space_Grotesk'] text-sm text-[#bcc8d1] uppercase tracking-widest">Time</span>
            <span className="font-['Space_Grotesk'] text-2xl font-bold text-white tracking-wider">
              {currentTime}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-8 flex items-center gap-2 text-[#bcc8d1]">
          <span className="material-symbols-outlined text-[#00BFFF]" style={{ fontSize: '18px' }}>cloud_done</span>
          <span className="font-['Space_Grotesk'] text-sm tracking-widest opacity-80 uppercase">SISTEM ONLINE</span>
        </div>
      </main>
    </div>
  );
}
