import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthBrand from '../components/AuthBrand';
import AuthFooter from '../components/AuthFooter';

const API_BASE = 'http://localhost:8081';

const ROLE_CONFIG = {
  rs: { label: 'Level 2 - Pengawas', className: 'bg-[#102438] border-[#1b4363] text-[#7ad0ff]' },
  field: { label: 'Level 1 - Barrier Ctrl', className: 'bg-[#122820] border-[#23583c] text-[#7ed99e]' }
};

export default function RegistrasiPage() {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [role, setRole] = useState('rs');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validasi input
    if (!fullName.trim() || !username.trim() || !password || !confirmPassword) {
      setError('Harap lengkapi semua kolom pendaftaran.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    if (password.length < 8) {
      setError('Kata sandi minimal 8 karakter sesuai ketentuan sistem.');
      return;
    }

    if (!/\d/.test(password)) {
      setError('Kata sandi harus mengandung kombinasi angka.');
      return;
    }

    if (!agreeTerms) {
      setError('Anda harus menyetujui Ketentuan Layanan dan Kebijakan Privasi.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          username: username.trim(),
          password,
          role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.pesan || 'Registrasi gagal. Silakan coba lagi.');
        return;
      }

      setSuccess(true);
      setTimeout(() => navigate('/'), 2000);
    } catch {
      setError('Tidak dapat terhubung ke server. Pastikan backend berjalan di port 8081.');
    } finally {
      setIsLoading(false);
    }
  };

  const roleCfg = ROLE_CONFIG[role];

  return (
    <div className="min-h-screen bg-[#0b0f13] text-[#dee3e8] flex flex-col justify-between">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <AuthBrand />

        <main className="w-full max-w-[480px] bg-[#161c22] border border-[#2b3540] rounded-2xl shadow-2xl p-6 sm:p-8">

          {/* Card Header */}
          <div className="flex items-center justify-between pb-5 border-b border-[#242e38] mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1e2730] border border-[#323f4d] flex items-center justify-center text-[#7ed99e]">
                <span className="material-symbols-outlined text-[22px]">person_add</span>
              </div>
              <div>
                <div className="text-[11px] font-mono tracking-wider uppercase text-[#7ad0ff] font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00bfff]"></span>
                  AUTH-GATEWAY // REG
                </div>
                <div className="text-[10px] text-[#8fa0b0] font-mono tracking-wide">GATE NODE: PG-000B</div>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-[#122820] border border-[#23583c] text-[#7ed99e] font-mono text-[11px] font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2e8b57]"></span>
              SSL ENCRYPTED
            </span>
          </div>

          {/* Title */}
          <div className="flex flex-col gap-1.5 mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-white">Registrasi Pengguna Baru</h1>
            <p className="text-xs text-[#9bb0c1] leading-relaxed">
              Daftarkan kredensial operator atau pengawas untuk akses ke sistem terminal parkir terintegrasi.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="flex items-center gap-2 bg-red-950/40 border border-red-700/50 rounded-lg px-4 py-3 text-sm text-red-400 font-mono mb-4">
              <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>

            {/* Full Name */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-xs uppercase tracking-wider text-[#bcc8d1] font-semibold flex items-center gap-1.5" htmlFor="fullName">
                <span className="material-symbols-outlined text-[16px] text-[#7ad0ff]">badge</span>
                Nama Lengkap
              </label>
              <input
                id="fullName"
                type="text"
                placeholder="Contoh: Antonius Pratama"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full bg-[#0f1419] border border-[#2c3743] hover:border-[#3d4c5c] focus:border-[#7ad0ff] text-white text-sm px-3.5 py-2.5 rounded-lg focus:outline-none placeholder:text-[#5d6f80] transition-colors"
              />
            </div>

            {/* Role Selector */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="font-mono text-xs uppercase tracking-wider text-[#bcc8d1] font-semibold flex items-center gap-1.5" htmlFor="roleSelector">
                  <span className="material-symbols-outlined text-[16px] text-[#ffb86e]">shield_person</span>
                  Hak Akses (Role)
                </label>
                <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border font-medium ${roleCfg.className}`}>
                  {roleCfg.label}
                </span>
              </div>
              <div className="relative">
                <select
                  id="roleSelector"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full appearance-none bg-[#0f1419] border border-[#2c3743] hover:border-[#3d4c5c] focus:border-[#7ad0ff] text-white text-sm px-3.5 py-2.5 rounded-lg focus:outline-none pr-10 cursor-pointer transition-colors"
                >
                  <option value="rs">Manajemen RS (Monitoring & Audit)</option>
                  <option value="field">Petugas Lapangan (Operasional Barrier)</option>
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#7d90a1]">
                  <span className="material-symbols-outlined text-[18px]">expand_more</span>
                </div>
              </div>
            </div>

            {/* Username */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-xs uppercase tracking-wider text-[#bcc8d1] font-semibold flex items-center gap-1.5" htmlFor="username">
                <span className="material-symbols-outlined text-[16px] text-[#7ed99e]">alternate_email</span>
                Nama Pengguna (Username)
              </label>
              <div className="relative flex items-center">
                {/* Input teks nama pengguna tanpa prefix tambahan */}
                <input
                  id="username"
                  type="text"
                  placeholder="apratama"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full bg-[#0f1419] border border-[#2c3743] hover:border-[#3d4c5c] focus:border-[#7ad0ff] text-white font-mono text-sm px-3.5 py-2.5 rounded-lg focus:outline-none placeholder:text-[#5d6f80] transition-colors"
                />
              </div>
            </div>

            {/* Password Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-xs uppercase tracking-wider text-[#bcc8d1] font-semibold flex items-center gap-1.5" htmlFor="password">
                  <span className="material-symbols-outlined text-[16px] text-[#ffd700]">lock</span>
                  Kata Sandi
                </label>
                <div className="relative flex items-center">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-[#0f1419] border border-[#2c3743] hover:border-[#3d4c5c] focus:border-[#7ad0ff] text-white font-mono text-sm pl-3 pr-9 py-2.5 rounded-lg focus:outline-none placeholder:text-[#5d6f80] transition-colors"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 text-[#7d90a1] hover:text-white p-1 focus:outline-none cursor-pointer">
                    <span className="material-symbols-outlined text-[16px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-xs uppercase tracking-wider text-[#bcc8d1] font-semibold flex items-center gap-1.5" htmlFor="confirmPassword">
                  <span className="material-symbols-outlined text-[16px] text-[#ffd700]">lock_reset</span>
                  Konfirmasi
                </label>
                <div className="relative flex items-center">
                  <input
                    id="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full bg-[#0f1419] border border-[#2c3743] hover:border-[#3d4c5c] focus:border-[#7ad0ff] text-white font-mono text-sm pl-3 pr-9 py-2.5 rounded-lg focus:outline-none placeholder:text-[#5d6f80] transition-colors"
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-2 text-[#7d90a1] hover:text-white p-1 focus:outline-none cursor-pointer">
                    <span className="material-symbols-outlined text-[16px]">{showConfirm ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="p-3 rounded-lg bg-[#0f1419] border border-[#232c36] flex flex-col gap-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#8fa0b0] font-semibold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px] text-[#7ad0ff]">verified_user</span>
                Ketentuan Kredensial Parkir
              </span>
              <div className="grid grid-cols-3 gap-1 text-[11px] text-[#9bb0c1]">
                <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#2e8b57]"></span>Min. 8 karakter</span>
                <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#2e8b57]"></span>Kombinasi angka</span>
                <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#2e8b57]"></span>Kombinasi karakter khusus</span>
              </div>
            </div>

            {/* Terms Checkbox */}
            <label className="flex items-start gap-2.5 cursor-pointer mt-0.5 group">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                required
                className="mt-0.5 w-4 h-4 rounded cursor-pointer accent-[#2e8b57]"
              />
              <span className="text-xs text-[#9bb0c1] leading-snug group-hover:text-white transition-colors">
                Saya menyetujui <a href="#" className="text-[#7ad0ff] hover:underline font-semibold">Ketentuan Layanan</a> dan <a href="#" className="text-[#7ad0ff] hover:underline font-semibold">Kebijakan Privasi</a> SPCT.
              </span>
            </label>

            {/* Success Message */}
            {success && (
              <div className="rounded-lg bg-[#122820] border border-[#23583c] p-3 text-[#7ed99e] flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[20px]">check_circle</span>
                <span className="font-mono text-xs">Registrasi berhasil diajukan! Mengalihkan ke portal login...</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || success}
              className="w-full mt-2 py-3 px-4 rounded-lg bg-[#f97316] hover:bg-[#ea580c] active:bg-[#c2410c] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-orange-950/40 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                  <span>Mendaftarkan Akun...</span>
                </>
              ) : (
                <>
                  <span>Daftar Akun</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {/* Bottom Links */}
          <div className="flex flex-col items-center gap-4 pt-5 mt-5 border-t border-[#242e38]">
            <div className="flex items-center justify-between w-full text-xs">
              <span className="text-[#8fa0b0]">Sudah memiliki akun aktif?</span>
              <button onClick={() => navigate('/')} className="text-[#7ad0ff] font-semibold hover:text-white flex items-center gap-1 transition-colors">
                <span>Masuk di sini</span>
                <span className="material-symbols-outlined text-[14px]">login</span>
              </button>
            </div>
            <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-[#10151a] border border-[#252f3a] text-[11px] font-mono text-[#8fa0b0]">
              <span className="w-2 h-2 rounded-full bg-[#2e8b57] animate-pulse"></span>
              <span className="text-[#7ed99e] font-semibold">● System Online</span>
              <span className="text-[#384654]">|</span>
              <span>Node Ping: 14ms</span>
            </div>
          </div>
        </main>
      </div>
      <AuthFooter />
    </div>
  );
}
