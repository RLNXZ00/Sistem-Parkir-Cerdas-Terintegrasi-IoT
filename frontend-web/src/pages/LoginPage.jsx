import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthBrand from '../components/AuthBrand';
import AuthFooter from '../components/AuthFooter';
import AuthThemeToggle from '../components/AuthThemeToggle';

const API_BASE = 'http://localhost:8081';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Server mengembalikan error (401/403)
        setError(data.pesan || 'Login gagal. Periksa Username / NIP dan kata sandi Anda.');
        return;
      }

      // Simpan sesi user ke sessionStorage agar bisa diakses halaman lain
      sessionStorage.setItem('spct_user', JSON.stringify(data));

      // Reset pilihan Peta Slot Parkir (jenis & lantai) agar default Mobil Lantai 1 setiap login
      sessionStorage.removeItem('spct_peta_slot');

      // Arahkan berdasarkan role
      if (data.role === 'ADMIN' || data.role === 'Manajemen RS') {
        navigate('/dashboard-management');
      } else {
        navigate('/dashboard');
      }
    } catch {
      setError('Tidak dapat terhubung ke server. Pastikan backend berjalan di port 8081.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f13] text-[#dee3e8] auth-page-wrapper flex flex-col justify-between transition-colors duration-200 relative">
      <AuthThemeToggle />

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <AuthBrand />

        <main className="w-full max-w-[450px]">
          <div className="bg-[#161c22] border border-[#2b3540] auth-card rounded-2xl shadow-2xl p-6 sm:p-8 flex flex-col gap-6 transition-colors duration-200">

            {/* Card Header */}
            <div className="flex items-center justify-between pb-5 border-b border-[#242e38] auth-card-header">
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
              <h1 className="text-2xl font-bold tracking-tight text-white auth-title">Selamat Datang</h1>
              <p className="text-xs text-[#9bb0c1] auth-subtitle leading-relaxed">
                Masukkan kredensial atau NIP Anda untuk mengakses Sistem Parkir Cerdas Terintegrasi IoT.
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="flex items-center gap-2 bg-red-950/40 border border-red-700/50 rounded-lg px-4 py-3 text-sm text-red-400 font-mono">
                <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
                {error}
              </div>
            )}

            {/* Form */}
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>

              {/* Username / NIP */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-[#bcc8d1] auth-label uppercase tracking-wider font-mono flex items-center gap-1.5" htmlFor="username">
                    <span className="material-symbols-outlined text-[16px] text-[#7ad0ff]">badge</span>
                    Username / NIP
                  </label>
                  <span className="text-[11px] font-mono text-[#7ad0ff]">Username atau 8 digit NIP</span>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#8fa0b0] text-[20px]">badge</span>
                  <input
                    id="username"
                    type="text"
                    placeholder="Masukkan Username atau 8 digit NIP"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full bg-[#0e1418] border border-[#2b3540] hover:border-[#3d4c5c] focus:border-[#7ad0ff] auth-input rounded-lg pl-10 pr-4 py-3 text-white placeholder-[#5d6f80] focus:outline-none font-mono text-sm transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-[#bcc8d1] auth-label uppercase tracking-wider font-mono flex items-center gap-1.5" htmlFor="password">
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-[#0e1418] border border-[#2b3540] hover:border-[#3d4c5c] focus:border-[#7ad0ff] auth-input rounded-lg pl-10 pr-10 py-3 text-white placeholder-[#5d6f80] focus:outline-none font-mono text-sm transition-colors"
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
                id="btn-login"
                type="submit"
                disabled={isLoading}
                className="mt-2 w-full bg-[#ea580c] hover:bg-[#c2410c] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-base py-3.5 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-orange-950/30 active:scale-[0.99] cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                    Authenticating...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">login</span>
                    Sign In
                  </>
                )}
              </button>

              {/* System Status */}
              <div className="flex items-center justify-center gap-2 text-sm text-[#8fa0b0] auth-subtitle font-mono">
                <span className="w-2 h-2 rounded-full bg-[#2e8b57] animate-pulse shadow-[0_0_8px_rgba(46,139,87,0.8)]"></span>
                System Online
              </div>
            </form>

            {/* Bottom Links */}
            <div className="flex items-center justify-between pt-4 border-t border-[#242e38] auth-card-header text-xs">
              <span className="text-[#8fa0b0] auth-subtitle">Belum memiliki akun?</span>
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
