// Import hook useState dari pustaka react untuk penanganan state lokal formulir
import { useState } from 'react';
// Import hook useNavigate dari react-router-dom untuk navigasi perpindahan halaman
import { useNavigate } from 'react-router-dom';
// Import komponen AuthBrand untuk identitas visual logo SPCT
import AuthBrand from '../components/AuthBrand';
// Import komponen AuthFooter untuk catatan kaki antarmuka autentikasi
import AuthFooter from '../components/AuthFooter';
// Import komponen AuthThemeToggle untuk tombol penyesuai tema gelap dan terang
import AuthThemeToggle from '../components/AuthThemeToggle';

// Mendefinisikan konstanta alamat dasar server backend Spring Boot (port 8081)
const API_BASE = 'http://localhost:8081';

// Deklarasi fungsi komponen publik ResetPasswordPage untuk penataan ulang kata sandi pengguna
export default function ResetPasswordPage() {
  // Inisialisasi state nip bertipe string untuk menampung nomor induk pegawai 8 digit
  const [nip, setNip] = useState('');
  // Inisialisasi state showNew bertipe boolean untuk visibilitas kata sandi baru
  const [showNew, setShowNew] = useState(false);
  // Inisialisasi state showConfirm bertipe boolean untuk visibilitas konfirmasi sandi
  const [showConfirm, setShowConfirm] = useState(false);
  // Inisialisasi state newPassword bertipe string untuk menyimpan kata sandi baru
  const [newPassword, setNewPassword] = useState('');
  // Inisialisasi state confirmPassword bertipe string untuk menyimpan konfirmasi kata sandi baru
  const [confirmPassword, setConfirmPassword] = useState('');
  // Inisialisasi state loading bertipe boolean untuk memantau status pemrosesan permintaan
  const [loading, setLoading] = useState(false);
  // Inisialisasi state error bertipe string untuk menampilkan pesan kegagalan validasi
  const [error, setError] = useState('');
  // Inisialisasi state success bertipe boolean untuk menampilkan banner sukses
  const [success, setSuccess] = useState(false);
  // Inisialisasi fungsi navigate menggunakan hook useNavigate
  const navigate = useNavigate();

  // Evaluasi boolean apakah panjang kata sandi baru minimal 8 karakter
  const hasLength = newPassword.length >= 8;
  // Evaluasi boolean apakah kata sandi baru mengandung kombinasi huruf dan angka
  const hasAlphaNum = /[A-Za-z]/.test(newPassword) && /\d/.test(newPassword);
  // Evaluasi boolean apakah kata sandi baru mengandung karakter simbol atau karakter khusus
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);

  // Deklarasi fungsi matchStatus untuk membandingkan kecocokan antara kata sandi dan konfirmasi
  const matchStatus = () => {
    // Jika kolom konfirmasi masih kosong, kembalikan teks panduan netral
    if (!confirmPassword) return { text: 'Ketik ulang kata sandi', cls: 'text-[#9bb0c1]' };
    // Jika kata sandi cocok, kembalikan indikator hijau
    if (newPassword === confirmPassword) return { text: '✓ Cocok', cls: 'text-[#7ed99e]' };
    // Jika belum cocok, kembalikan indikator merah oranye
    return { text: '✗ Belum cocok', cls: 'text-[#FF4500]' };
  };
  // Menyimpan hasil evaluasi status kecocokan sandi
  const match = matchStatus();

  // Deklarasi fungsi asinkron handleSubmit untuk memproses reset kata sandi ke backend
  const handleSubmit = async (e) => {
    // Mencegah reload halaman secara default
    e.preventDefault();
    // Mereset pesan galat menjadi kosong
    setError('');

    // Validasi kehadiran data NIP
    if (!nip.trim()) {
      setError('Nomor Induk Pegawai (NIP) wajib diisi.');
      return;
    }

    // Validasi format NIP agar tepat 8 digit angka numerik
    if (!/^\d{8}$/.test(nip.trim())) {
      setError('NIP harus terdiri dari 8 digit angka.');
      return;
    }

    // Validasi kelengkapan kedua kolom kata sandi
    if (!newPassword || !confirmPassword) {
      setError('Harap lengkapi kata sandi baru dan konfirmasinya.');
      return;
    }

    // Validasi kesesuaian antara kata sandi baru dan konfirmasi
    if (newPassword !== confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    // Validasi kriteria panjang minimal kata sandi
    if (!hasLength) {
      setError('Kata sandi minimal 8 karakter.');
      return;
    }

    // Validasi kehadiran angka dalam kata sandi
    if (!/\d/.test(newPassword)) {
      setError('Kata sandi harus mengandung kombinasi angka.');
      return;
    }

    // Validasi kehadiran karakter khusus dalam kata sandi
    if (!hasSpecial) {
      setError('Kata sandi harus mengandung kombinasi karakter khusus.');
      return;
    }

    // Mengaktifkan status proses pembaruan kata sandi
    setLoading(true);
    try {
      // Mengirimkan permintaan HTTP POST ke endpoint backend /api/auth/reset-password
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nip: nip.trim(),
          newPassword,
        }),
      });
      // Mengurai data respons JSON
      const data = await res.json();
      // Jika respons gagal, tampilkan pesan galat dari backend
      if (!res.ok) {
        setError(data.pesan || 'Gagal memperbarui kata sandi.');
        return;
      }
      // Mengubah status menjadi sukses
      setSuccess(true);
      // Mengarahkan kembali ke halaman login setelah 2 detik
      setTimeout(() => navigate('/'), 2000);
    } catch {
      // Menangkap galat koneksi jaringan backend
      setError('Tidak dapat terhubung ke server backend (port 8081).');
    } finally {
      // Mematikan status loading
      setLoading(false);
    }
  };

  // Komponen pembantu PillReq untuk menampilkan status pemenuhan syarat kata sandi
  const PillReq = ({ met, children }) => (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] font-mono transition-colors ${met ? 'bg-[#122820] border-[#23583c] text-[#7ed99e] auth-verified-badge' : 'bg-[#11171d] border-[#2d3a46] text-[#9bb0c1] auth-meta-badge'}`}>
      <span className="material-symbols-outlined text-[13px]">{met ? 'check_circle' : 'radio_button_unchecked'}</span>
      {children}
    </span>
  );

  // Mengembalikan elemen antarmuka JSX halaman pengaturan ulang kata sandi
  return (
    // Wadah utama layar penuh bertema gelap dengan penataan vertikal responsif
    <div className="min-h-screen bg-[#0c1014] text-[#dee3e8] auth-page-wrapper flex flex-col justify-between transition-colors duration-200 relative">
      {/* Tombol pengalih tema tampilan */}
      <AuthThemeToggle />

      {/* Bagian tengah kartu reset kata sandi */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Identitas merek logo SPCT */}
        <AuthBrand />

        {/* Kontainer kartu formulir reset password */}
        <main className="w-full max-w-md bg-[#182026] border border-[#2c3742] auth-card rounded-xl shadow-lg p-6 sm:p-8 transition-colors duration-200">

          {/* Baris header kartu berisikan ikon kunci gembok dan lencana enkripsi SSL */}
          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 rounded-lg bg-[#11171d] border border-[#2c3742] auth-header-icon flex items-center justify-center">
              <span className="material-symbols-outlined text-[#38bdf8] text-[26px]">lock_reset</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#11171d] border border-[#273540] auth-ssl-badge">
              <span className="w-2 h-2 rounded-full bg-[#34d399] auth-ssl-dot"></span>
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#34d399] auth-ssl-text">SSL ENCRYPTED</span>
            </div>
          </div>

          {/* Judul dan penjelasan instruksi reset kata sandi */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-white auth-title mb-1">Atur Ulang Kata Sandi</h1>
            <p className="text-sm text-[#bcc8d1] auth-subtitle leading-relaxed">
              Silakan masukkan 8 digit NIP Anda dan buat kata sandi baru untuk mengamankan akun SPCT Anda.
            </p>
          </div>

          {/* Tampilan pesan kesalahan jika validasi gagal */}
          {error && (
            <div className="mb-4 rounded-lg p-3 px-4 flex items-center gap-2 bg-red-950/40 border border-red-700/50 text-red-400 text-xs font-mono">
              <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Formulir masukan NIP dan kata sandi baru */}
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>

            {/* Kolom masukan NIP 8 digit */}
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

            {/* Kolom masukan Kata Sandi Baru */}
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
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-4 text-slate-400 auth-icon-btn hover:text-white transition-colors p-1 cursor-pointer">
                  <span className="material-symbols-outlined text-[20px]">{showNew ? 'visibility' : 'visibility_off'}</span>
                </button>
              </div>

              {/* Lencana verifikasi kekuatan kata sandi */}
              <div className="flex flex-wrap gap-2 pt-1">
                <PillReq met={hasLength}>8+ Karakter</PillReq>
                <PillReq met={hasAlphaNum}>Huruf & Angka</PillReq>
                <PillReq met={hasSpecial}>Karakter Spesial</PillReq>
              </div>
            </div>

            {/* Kolom masukan Konfirmasi Kata Sandi */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-xs font-medium text-slate-200 auth-label uppercase tracking-wider flex items-center justify-between" htmlFor="confirm-password">
                <span>Konfirmasi Kata Sandi</span>
                <span className={`font-mono text-[11px] ${match.cls}`}>{match.text}</span>
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-4 text-slate-400 auth-subtitle text-[20px] pointer-events-none">lock_clock</span>
                <input
                  id="confirm-password"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full h-12 pl-12 pr-12 bg-[#11171d] border border-[#323d47] auth-input text-white text-sm rounded-lg outline-none placeholder:text-slate-500 focus:border-[#38bdf8] transition-colors"
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 text-slate-400 auth-icon-btn hover:text-white transition-colors p-1 cursor-pointer">
                  <span className="material-symbols-outlined text-[20px]">{showConfirm ? 'visibility' : 'visibility_off'}</span>
                </button>
              </div>
            </div>

            {/* Kotak notifikasi sukses pembaruan kata sandi */}
            {success && (
              <div className="rounded-lg p-3 px-4 flex items-center gap-2 bg-[#0d2a1b] border border-[#1b6b3e] text-[#4ade80] text-xs font-mono">
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span>Kata sandi berhasil diperbarui. Mengalihkan ke login...</span>
              </div>
            )}

            {/* Tombol aksi submit dan tombol kembali */}
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
              <button type="button" onClick={() => navigate('/')} className="flex items-center justify-center gap-2 auth-link font-medium text-sm py-2 cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                <span>Kembali ke Masuk</span>
              </button>
            </div>
          </form>

          {/* Lencana keamanan enkripsi AES-256 GCM */}
          <div className="mt-6 flex items-center justify-between bg-[#11171d] border border-[#26313b] auth-meta-badge px-4 py-2 rounded-lg">
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
      {/* Catatan kaki autentikasi */}
      <AuthFooter />
    </div>
  );
}
