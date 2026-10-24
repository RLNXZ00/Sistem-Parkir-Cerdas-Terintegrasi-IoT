import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthBrand from '../components/AuthBrand';
import AuthFooter from '../components/AuthFooter';
import AuthThemeToggle from '../components/AuthThemeToggle';

const API_BASE = 'http://localhost:8081';

export default function ResetPasswordPage() {
  const [nip, setNip] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const hasLength = newPassword.length >= 8;
  const hasAlphaNum = /[A-Za-z]/.test(newPassword) && /\d/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);

  const matchStatus = () => {
    if (!confirmPassword) return { text: 'Ketik ulang kata sandi', cls: 'text-[#9bb0c1]' };
    if (newPassword === confirmPassword) return { text: '✓ Cocok', cls: 'text-[#7ed99e]' };
    return { text: '✗ Belum cocok', cls: 'text-[#FF4500]' };
  };
  const match = matchStatus();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validasi NIP 8 digit angka
    if (!nip.trim()) {
      setError('Nomor Induk Pegawai (NIP) wajib diisi.');
      return;
    }

    if (!/^\d{8}$/.test(nip.trim())) {
      setError('NIP harus terdiri dari 8 digit angka.');
      return;
    }

    // Validasi kata sandi
    if (!newPassword || !confirmPassword) {
      setError('Harap lengkapi kata sandi baru dan konfirmasinya.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    if (!hasLength) {
      setError('Kata sandi minimal 8 karakter.');
      return;
    }

    if (!/\d/.test(newPassword)) {
      setError('Kata sandi harus mengandung kombinasi angka.');
      return;
    }

    if (!hasSpecial) {
      setError('Kata sandi harus mengandung kombinasi karakter khusus.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nip: nip.trim(),
          newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.pesan || 'Gagal memperbarui kata sandi.');
        return;
      }
      setSuccess(true);
      setTimeout(() => navigate('/'), 2000);
    } catch {
      setError('Tidak dapat terhubung ke server backend (port 8081).');
    } finally {
      setLoading(false);
    }
  };

  const PillReq = ({ met, children }) => (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] font-mono transition-colors ${met ? 'bg-[#122820] border-[#23583c] text-[#7ed99e]' : 'bg-[#11171d] border-[#2d3a46] text-[#9bb0c1] auth-subcard auth-subtitle'}`}>
      <span className="material-symbols-outlined text-[13px]">{met ? 'check_circle' : 'radio_button_unchecked'}</span>
      {children}
    </span>
  );

  return (
    <div className="min-h-screen bg-[#0c1014] text-[#dee3e8] auth-page-wrapper flex flex-col justify-between transition-colors duration-200 relative">
      <AuthThemeToggle />

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <AuthBrand />

        <main className="w-full max-w-md bg-[#182026] border border-[#2c3742] auth-card rounded-xl shadow-lg p-6 sm:p-8 transition-colors duration-200">

          {/* Header Row */}
          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 rounded-lg bg-[#11171d] border border-[#2c3742] auth-subcard flex items-center justify-center">
              <span className="material-symbols-outlined text-[#38bdf8] text-[26px]">lock_reset</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#11171d] border border-[#273540] auth-subcard">
              <span className="w-2 h-2 rounded-full bg-[#34d399]"></span>
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#34d399]">SSL ENCRYPTED</span>
            </div>
          </div>

          {/* Title */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-white auth-title mb-1">Atur Ulang Kata Sandi</h1>
            <p className="text-sm text-[#bcc8d1] auth-subtitle leading-relaxed">
              Silakan masukkan 8 digit NIP Anda dan buat kata sandi baru untuk mengamankan akun SPCT Anda.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 rounded-lg p-3 px-4 flex items-center gap-2 bg-red-950/40 border border-red-700/50 text-red-400 text-xs font-mono">
              <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>

            {/* NIP (Nomor Induk Pegawai) */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-xs font-medium text-slate-200 auth-label uppercase tracking-wider flex items-center justify-between" htmlFor="nip">
                <span>Nomor Induk Pegawai (NIP)</span>
                <span className="text-[#38bdf8] text-[11px] font-normal tracking-normal font-mono">8 digit angka</span>
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-4 text-slate-400 text-[20px] pointer-events-none">id_card</span>
                <input
                  id="nip"
                  type="text"
                  inputMode="numeric"
                  maxLength={8}
                  placeholder="Contoh: 10000001"
                  required
                  value={nip}
                  onChange={(e) => setNip(e.target.value.replace(/\D/g, '').slice(0, 8))}
                  className="w-full h-12 pl-12 pr-4 bg-[#11171d] border border-[#323d47] auth-input text-white font-mono text-sm rounded-lg outline-none placeholder:text-slate-500 focus:border-[#38bdf8] transition-colors"
                />
              </div>
            </div>

            {/* New Password */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-xs font-medium text-slate-200 auth-label uppercase tracking-wider flex items-center justify-between" htmlFor="new-password">
                <span>Kata Sandi Baru</span>
                <span className="font-mono text-[11px] font-semibold text-amber-400">Minimal 8 karakter</span>
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-4 text-slate-400 text-[20px] pointer-events-none">lock</span>
                <input
                  id="new-password"
                  type={showNew ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  minLength={8}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full h-12 pl-12 pr-12 bg-[#11171d] border border-[#323d47] auth-input text-white text-sm rounded-lg outline-none placeholder:text-slate-500 focus:border-[#38bdf8] transition-colors"
                />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-4 text-slate-400 hover:text-white transition-colors p-1 cursor-pointer">
                  <span className="material-symbols-outlined text-[20px]">{showNew ? 'visibility' : 'visibility_off'}</span>
                </button>
              </div>

              {/* Password Strength Pills */}
              <div className="flex flex-wrap gap-2 pt-1">
                <PillReq met={hasLength}>8+ Karakter</PillReq>
                <PillReq met={hasAlphaNum}>Huruf & Angka</PillReq>
                <PillReq met={hasSpecial}>Karakter Spesial</PillReq>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-xs font-medium text-slate-200 auth-label uppercase tracking-wider flex items-center justify-between" htmlFor="confirm-password">
                <span>Konfirmasi Kata Sandi</span>
                <span className={`font-mono text-[11px] ${match.cls}`}>{match.text}</span>
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-4 text-slate-400 text-[20px] pointer-events-none">lock_clock</span>
                <input
                  id="confirm-password"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full h-12 pl-12 pr-12 bg-[#11171d] border border-[#323d47] auth-input text-white text-sm rounded-lg outline-none placeholder:text-slate-500 focus:border-[#38bdf8] transition-colors"
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 text-slate-400 hover:text-white transition-colors p-1 cursor-pointer">
                  <span className="material-symbols-outlined text-[20px]">{showConfirm ? 'visibility' : 'visibility_off'}</span>
                </button>
              </div>
            </div>

            {/* Success Alert */}
            {success && (
              <div className="rounded-lg p-3 px-4 flex items-center gap-2 bg-[#0d2a1b] border border-[#1b6b3e] text-[#4ade80] text-xs font-mono">
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span>Kata sandi berhasil diperbarui. Mengalihkan ke login...</span>
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-col gap-3 pt-1">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-lg bg-[#f97316] hover:bg-[#ea580c] transition-all duration-200 text-white text-sm font-bold flex items-center justify-center gap-2 border border-[#ea580c] active:scale-[0.99] cursor-pointer disabled:opacity-75"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <span>Atur Ulang Kata Sandi</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </>
                )}
              </button>
              <button type="button" onClick={() => navigate('/')} className="flex items-center justify-center gap-2 text-[#38bdf8] hover:text-[#7dd3fc] font-medium transition-colors text-sm py-2">
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                <span>Kembali ke Masuk</span>
              </button>
            </div>
          </form>

          {/* Security Footer Badge */}
          <div className="mt-6 flex items-center justify-between bg-[#11171d] border border-[#26313b] auth-subcard px-4 py-2 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#34d399]"></span>
              <span className="font-mono text-[11px] font-medium text-slate-300 auth-subcard-text">Node Security active</span>
            </div>
            <div className="flex items-center gap-1 font-mono text-[11px] font-medium text-slate-300 auth-subcard-text">
              <span className="material-symbols-outlined text-[15px] text-[#34d399]">shield</span>
              <span>AES-256 GCM</span>
            </div>
          </div>
        </main>
      </div>
      <AuthFooter />
    </div>
  );
}
