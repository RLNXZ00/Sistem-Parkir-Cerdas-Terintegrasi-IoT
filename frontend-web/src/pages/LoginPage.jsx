import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthBrand from '../components/AuthBrand';
import AuthFooter from '../components/AuthFooter';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('management');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Hubungkan ke Spring Boot API endpoint POST /api/auth/login
    // Sementara redirect ke dashboard
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#0b0f13] text-[#dee3e8] flex flex-col justify-between">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <AuthBrand />

        <main className="w-full max-w-[450px]">
          <div className="bg-[#161c22] border border-[#2b3540] rounded-2xl shadow-2xl p-6 sm:p-8 flex flex-col gap-6">

            {/* Card Header */}
            <div className="flex items-center justify-between pb-5 border-b border-[#242e38]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1e2730] border border-[#323f4d] flex items-center justify-center text-[#7ad0ff]">
                  <span className="material-symbols-outlined text-[22px]">lock</span>
                </div>
                <div>
                  <div className="text-[11px] font-mono tracking-wider uppercase text-[#7ad0ff] font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00bfff]"></span>
                    AUTH-GATEWAY // SIGN IN
                  </div>
                  <div className="text-[10px] text-[#8fa0b0] font-mono tracking-wide">GATE NODE: PG-000A</div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[#122820] border border-[#23583c] text-[#7ed99e] font-mono text-[11px] font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2e8b57]"></span>
                SSL ENCRYPTED
              </span>
            </div>

            {/* Title */}
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-bold tracking-tight text-white">Selamat Datang</h1>
              <p className="text-xs text-[#9bb0c1] leading-relaxed">
                Masukkan kredensial Anda untuk mengakses Sistem Parkir Cerdas Terintegrasi IoT.
              </p>
            </div>

            {/* Form */}
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>

              {/* Role Selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-[#bcc8d1] uppercase tracking-wider font-mono flex items-center gap-1.5" htmlFor="role">
                  <span className="material-symbols-outlined text-[16px] text-[#ffb86e]">shield_person</span>
                  Access Role
                </label>
                <div className="relative">
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full appearance-none bg-[#0e1418] border border-[#2b3540] hover:border-[#3d4c5c] focus:border-[#7ad0ff] rounded-lg px-4 py-3 text-[#dee3e8] focus:outline-none font-mono text-sm transition-colors cursor-pointer"
                  >
                    <option value="management">Manajemen RS (Monitoring & Audit)</option>
                    <option value="field">Petugas Lapangan (Operasional Barrier)</option>
                    <option value="technician">Teknisi Green-IoT (Sensors & Gate)</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#8fa0b0] pointer-events-none">expand_more</span>
                </div>
              </div>

              {/* Username */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-[#bcc8d1] uppercase tracking-wider font-mono flex items-center gap-1.5" htmlFor="username">
                  <span className="material-symbols-outlined text-[16px] text-[#7ad0ff]">person</span>
                  Username
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#8fa0b0] text-[20px]">alternate_email</span>
                  <input
                    id="username"
                    type="text"
                    placeholder="Enter credentials"
                    required
                    className="w-full bg-[#0e1418] border border-[#2b3540] hover:border-[#3d4c5c] focus:border-[#7ad0ff] rounded-lg pl-10 pr-4 py-3 text-white placeholder-[#5d6f80] focus:outline-none font-mono text-sm transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-[#bcc8d1] uppercase tracking-wider font-mono flex items-center gap-1.5" htmlFor="password">
                    <span className="material-symbols-outlined text-[16px] text-[#ffd700]">lock</span>
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => navigate('/reset-password')}
                    className="text-sm text-[#7ad0ff] hover:text-primary transition-colors font-semibold"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#8fa0b0] text-[20px]">lock</span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    required
                    className="w-full bg-[#0e1418] border border-[#2b3540] hover:border-[#3d4c5c] focus:border-[#7ad0ff] rounded-lg pl-10 pr-10 py-3 text-white placeholder-[#5d6f80] focus:outline-none font-mono text-sm transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8fa0b0] hover:text-white transition-colors focus:outline-none"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="mt-2 w-full bg-[#ea580c] hover:bg-[#c2410c] text-white font-semibold text-base py-3.5 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-orange-950/30 active:scale-[0.99] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">login</span>
                Sign In
              </button>

              {/* System Status */}
              <div className="flex items-center justify-center gap-2 text-sm text-[#8fa0b0] font-mono">
                <span className="w-2 h-2 rounded-full bg-[#2e8b57] animate-pulse shadow-[0_0_8px_rgba(46,139,87,0.8)]"></span>
                System Online
              </div>
            </form>

            {/* Bottom Links */}
            <div className="flex items-center justify-between pt-4 border-t border-[#242e38] text-xs">
              <span className="text-[#8fa0b0]">Belum memiliki akun?</span>
              <button
                onClick={() => navigate('/registrasi')}
                className="text-[#7ad0ff] font-semibold hover:text-white flex items-center gap-1 transition-colors"
              >
                Daftar di sini
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </main>
      </div>
      <AuthFooter />
    </div>
  );
}
