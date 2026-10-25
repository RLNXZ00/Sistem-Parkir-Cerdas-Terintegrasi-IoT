// Import hook useState dari pustaka react untuk penanganan state formulir pendaftaran
import { useState } from 'react';
// Import hook useNavigate dari react-router-dom untuk navigasi antar halaman
import { useNavigate } from 'react-router-dom';
// Import komponen AuthBrand untuk identitas visual logo SPCT Green-IoT
import AuthBrand from '../components/AuthBrand';
// Import komponen AuthFooter untuk catatan kaki halaman registrasi
import AuthFooter from '../components/AuthFooter';
// Import komponen AuthThemeToggle untuk tombol pengubah tema gelap dan terang
import AuthThemeToggle from '../components/AuthThemeToggle';

// Mendefinisikan konstanta alamat dasar server backend Spring Boot (port 8081)
const API_BASE = 'http://localhost:8081';

// Konfigurasi lencana tampilan untuk masing-masing tingkatan peran hak akses pengguna
const ROLE_CONFIG = {
  rs: { label: 'Level 2 - Pengawas', className: 'bg-[#102438] border-[#1b4363] text-[#7ad0ff] auth-role-badge-rs' },
  field: { label: 'Level 1 - Barrier Ctrl', className: 'bg-[#122820] border-[#23583c] text-[#7ed99e] auth-role-badge-field' }
};

// Deklarasi fungsi komponen publik RegistrasiPage untuk antarmuka pendaftaran akun pengguna baru
export default function RegistrasiPage() {
  // Inisialisasi state fullName bertipe string untuk menyimpan nama lengkap pengguna
  const [fullName, setFullName] = useState('');
  // Inisialisasi state nip bertipe string untuk nomor induk pegawai (wajib 8 digit)
  const [nip, setNip] = useState('');
  // Inisialisasi state username bertipe string untuk nama pengguna akun
  const [username, setUsername] = useState('');
  // Inisialisasi state password bertipe string untuk kata sandi utama
  const [password, setPassword] = useState('');
  // Inisialisasi state confirmPassword bertipe string untuk konfirmasi kata sandi
  const [confirmPassword, setConfirmPassword] = useState('');
  // Inisialisasi state showPassword bertipe boolean untuk visibilitas kata sandi utama
  const [showPassword, setShowPassword] = useState(false);
  // Inisialisasi state showConfirm bertipe boolean untuk visibilitas konfirmasi kata sandi
  const [showConfirm, setShowConfirm] = useState(false);
  // Inisialisasi state role bertipe string dengan nilai bawaan 'rs' (Manajemen RS)
  const [role, setRole] = useState('rs');
  // Inisialisasi state agreeTerms bertipe boolean untuk persetujuan syarat dan ketentuan
  const [agreeTerms, setAgreeTerms] = useState(false);
  // Inisialisasi state isLoading bertipe boolean untuk memantau status pengiriman data
  const [isLoading, setIsLoading] = useState(false);
  // Inisialisasi state error bertipe string untuk menampilkan pesan kesalahan validasi
  const [error, setError] = useState('');
  // Inisialisasi state success bertipe boolean untuk menampilkan banner sukses registrasi
  const [success, setSuccess] = useState(false);
  // Inisialisasi fungsi navigate menggunakan hook useNavigate
  const navigate = useNavigate();

  // Evaluasi kondisi boolean pemenuhan syarat kata sandi: panjang minimal 8 karakter
  const hasLength = password.length >= 8;
  // Evaluasi kondisi boolean pemenuhan syarat kata sandi: memiliki digit angka
  const hasNumber = /\d/.test(password);
  // Evaluasi kondisi boolean pemenuhan syarat kata sandi: memiliki karakter simbolik/khusus
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  // Deklarasi fungsi asinkron handleSubmit untuk memvalidasi formulir dan mengirim data pendaftaran ke server
  const handleSubmit = async (e) => {
    // Mencegah refresh halaman bawaan browser
    e.preventDefault();
    // Mereset pesan galat menjadi string kosong
    setError('');

    // Validasi kelengkapan seluruh kolom formulir
    if (!fullName.trim() || !nip.trim() || !username.trim() || !password || !confirmPassword) {
      setError('Harap lengkapi semua kolom pendaftaran.');
      return;
    }

    // Validasi format NIP agar tepat terdiri atas 8 digit angka numerik
    if (!/^\d{8}$/.test(nip.trim())) {
      setError('NIP harus terdiri dari tepat 8 digit angka.');
      return;
    }

    // Validasi kesesuaian antara kata sandi dan konfirmasi kata sandi
    if (password !== confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    // Validasi panjang karakter kata sandi
    if (password.length < 8) {
      setError('Kata sandi minimal 8 karakter sesuai ketentuan sistem.');
      return;
    }

    // Validasi kehadiran karakter angka pada kata sandi
    if (!/\d/.test(password)) {
      setError('Kata sandi harus mengandung kombinasi angka.');
      return;
    }

    // Validasi kehadiran karakter simbol khusus pada kata sandi
    if (!/[^A-Za-z0-9]/.test(password)) {
      setError('Kata sandi harus mengandung kombinasi karakter khusus.');
      return;
    }

    // Validasi kotak centang persetujuan ketentuan layanan
    if (!agreeTerms) {
      setError('Anda harus menyetujui Ketentuan Layanan dan Kebijakan Privasi.');
      return;
    }

    // Mengaktifkan status pemrosesan loading
    setIsLoading(true);

    try {
      // Mengirimkan permintaan HTTP POST ke endpoint backend /api/auth/register dengan body JSON
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          nip: nip.trim(),
          username: username.trim(),
          password,
          role,
        }),
      });

      // Mengurai data JSON dari respons server
      const data = await res.json();

      // Jika respons HTTP berstatus tidak berhasil (non-2xx)
      if (!res.ok) {
        // Tampilkan pesan galat dari backend
        setError(data.pesan || 'Registrasi gagal. Silakan coba lagi.');
        return;
      }

      // Mengubah status pendaftaran menjadi sukses
      setSuccess(true);
      // Mengarahkan pengguna kembali ke halaman portal login setelah jeda 2000 milidetik (2 detik)
      setTimeout(() => navigate('/'), 2000);
    } catch {
      // Menangkap kegagalan jaringan komunikasi server backend
      setError('Tidak dapat terhubung ke server. Pastikan backend berjalan di port 8081.');
    } finally {
      // Mematikan status loading
      setIsLoading(false);
    }
  };

  // Mengambil konfigurasi label dan styling peran terpilih dari ROLE_CONFIG
  const roleCfg = ROLE_CONFIG[role];

  // Mengembalikan elemen antarmuka JSX formulir registrasi
  return (
    // Wadah layar utama bertema gelap responsif
    <div className="min-h-screen bg-[#0b0f13] text-[#dee3e8] auth-page-wrapper flex flex-col justify-between transition-colors duration-200 relative">
      {/* Komponen pemilih tema tampilan gelap dan terang */}
      <AuthThemeToggle />

      {/* Area tengah pembungkus kartu registrasi */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Komponen identitas visual merek SPCT */}
        <AuthBrand />

        {/* Kontainer kartu pendaftaran pengguna */}
        <main className="w-full max-w-[480px] bg-[#161c22] border border-[#2b3540] auth-card rounded-2xl shadow-2xl p-6 sm:p-8 transition-colors duration-200">

          {/* Bagian header kartu dengan lencana SSL */}
          <div className="flex items-center justify-between pb-5 border-b border-[#242e38] auth-card-header mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1e2730] border border-[#323f4d] auth-header-icon flex items-center justify-center text-[#7ed99e]">
                <span className="material-symbols-outlined text-[22px]">person_add</span>
              </div>
              <div>
                <div className="text-[11px] font-mono tracking-wider uppercase text-[#7ad0ff] font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00bfff]"></span>
                  AUTH-GATEWAY // REG
                </div>
                <div className="text-[10px] text-[#8fa0b0] auth-subtitle font-mono tracking-wide">GATE NODE: PG-000B</div>
              </div>
            </div>
            {/* Lencana keamanan koneksi SSL */}
            <span className="px-2.5 py-1 rounded-full bg-[#122820] border border-[#23583c] auth-ssl-badge text-[#7ed99e] font-mono text-[11px] font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2e8b57] auth-ssl-dot"></span>
              <span className="auth-ssl-text">SSL ENCRYPTED</span>
            </span>
          </div>

          {/* Judul formulir registrasi */}
          <div className="flex flex-col gap-1.5 mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-white auth-title">Registrasi Pengguna Baru</h1>
            <p className="text-xs text-[#9bb0c1] auth-subtitle leading-relaxed">
              Daftarkan kredensial operator atau pengawas untuk akses ke sistem terminal parkir terintegrasi.
            </p>
          </div>

          {/* Banner notifikasi kesalahan jika validasi atau koneksi gagal */}
          {error && (
            <div className="flex items-center gap-2 bg-red-950/40 border border-red-700/50 rounded-lg px-4 py-3 text-sm text-red-400 font-mono mb-4">
              <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Formulir pendaftaran akun baru */}
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>

            {/* Kolom masukan Nama Lengkap */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-xs uppercase tracking-wider text-[#bcc8d1] auth-label font-semibold flex items-center gap-1.5" htmlFor="fullName">
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
                className="w-full bg-[#0f1419] border border-[#2c3743] hover:border-[#3d4c5c] focus:border-[#7ad0ff] auth-input text-white text-sm px-3.5 py-2.5 rounded-lg focus:outline-none placeholder:text-[#5d6f80] transition-colors"
              />
            </div>

            {/* Kolom masukan NIP (Wajib 8 Digit Angka) */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="font-mono text-xs uppercase tracking-wider text-[#bcc8d1] auth-label font-semibold flex items-center gap-1.5" htmlFor="nip">
                  <span className="material-symbols-outlined text-[16px] text-[#38bdf8]">id_card</span>
                  Nomor Induk Pegawai (NIP)
                </label>
                <span className="font-mono text-[10px] text-[#7ad0ff]">Wajib 8 Digit Angka</span>
              </div>
              <div className="relative flex items-center">
                <input
                  id="nip"
                  type="text"
                  inputMode="numeric"
                  maxLength={8}
                  placeholder="Contoh: 10000001"
                  value={nip}
                  onChange={(e) => setNip(e.target.value.replace(/\D/g, '').slice(0, 8))}
                  required
                  className="w-full bg-[#0f1419] border border-[#2c3743] hover:border-[#3d4c5c] focus:border-[#7ad0ff] auth-input text-white font-mono text-sm px-3.5 py-2.5 rounded-lg focus:outline-none placeholder:text-[#5d6f80] transition-colors"
                />
              </div>
            </div>

            {/* Kolom pemilihan Hak Akses (Role Selector) */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="font-mono text-xs uppercase tracking-wider text-[#bcc8d1] auth-label font-semibold flex items-center gap-1.5" htmlFor="roleSelector">
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
                  className="w-full appearance-none bg-[#0f1419] border border-[#2c3743] hover:border-[#3d4c5c] focus:border-[#7ad0ff] auth-input text-white text-sm px-3.5 py-2.5 rounded-lg focus:outline-none pr-10 cursor-pointer transition-colors"
                >
                  <option value="rs" className="text-black bg-white">Manajemen RS (Monitoring & Audit)</option>
                  <option value="field" className="text-black bg-white">Petugas Lapangan (Operasional Barrier)</option>
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#7d90a1]">
                  <span className="material-symbols-outlined text-[18px]">expand_more</span>
                </div>
              </div>
            </div>

            {/* Kolom masukan Nama Pengguna (Username) */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-xs uppercase tracking-wider text-[#bcc8d1] auth-label font-semibold flex items-center gap-1.5" htmlFor="username">
                <span className="material-symbols-outlined text-[16px] text-[#7ed99e]">alternate_email</span>
                Nama Pengguna (Username)
              </label>
              <div className="relative flex items-center">
                <input
                  id="username"
                  type="text"
                  placeholder="apratama"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full bg-[#0f1419] border border-[#2c3743] hover:border-[#3d4c5c] focus:border-[#7ad0ff] auth-input text-white font-mono text-sm px-3.5 py-2.5 rounded-lg focus:outline-none placeholder:text-[#5d6f80] transition-colors"
                />
              </div>
            </div>

            {/* Grid kolom masukan kata sandi dan konfirmasi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Kolom Kata Sandi */}
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-xs uppercase tracking-wider text-[#bcc8d1] auth-label font-semibold flex items-center gap-1.5" htmlFor="password">
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
                    className="w-full bg-[#0f1419] border border-[#2c3743] hover:border-[#3d4c5c] focus:border-[#7ad0ff] auth-input text-white font-mono text-sm pl-3 pr-9 py-2.5 rounded-lg focus:outline-none placeholder:text-[#5d6f80] transition-colors"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 text-[#7d90a1] auth-icon-btn hover:text-white p-1 focus:outline-none cursor-pointer">
                    <span className="material-symbols-outlined text-[16px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>
              {/* Kolom Konfirmasi Kata Sandi */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-mono text-xs uppercase tracking-wider text-[#bcc8d1] auth-label font-semibold flex items-center gap-1.5" htmlFor="confirmPassword">
                    <span className="material-symbols-outlined text-[16px] text-[#ffd700]">lock_reset</span>
                    Konfirmasi
                  </label>
                  {/* Indikator kecocokan kata sandi */}
                  {confirmPassword && (
                    <span className={`font-mono text-[10px] ${password === confirmPassword ? 'text-[#7ed99e]' : 'text-rose-400'}`}>
                      {password === confirmPassword ? '✓ Cocok' : '✗ Belum cocok'}
                    </span>
                  )}
                </div>
                <div className="relative flex items-center">
                  <input
                    id="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full bg-[#0f1419] border border-[#2c3743] hover:border-[#3d4c5c] focus:border-[#7ad0ff] auth-input text-white font-mono text-sm pl-3 pr-9 py-2.5 rounded-lg focus:outline-none placeholder:text-[#5d6f80] transition-colors"
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-2 text-[#7d90a1] auth-icon-btn hover:text-white p-1 focus:outline-none cursor-pointer">
                    <span className="material-symbols-outlined text-[16px]">{showConfirm ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Kotak daftar indikator ketentuan keamanan kata sandi */}
            <div className="p-3 rounded-lg bg-[#0f1419] border border-[#232c36] auth-subcard flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#8fa0b0] auth-subtitle font-semibold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px] text-[#7ad0ff]">shield_lock</span>
                  Ketentuan Kata Sandi
                </span>
                {/* Lencana terverifikasi jika semua kriteria sandi terpenuhi */}
                {hasLength && hasNumber && hasSpecial && (
                  <span className="text-[10px] font-mono text-[#7ed99e] auth-verified-badge flex items-center gap-1 bg-[#122820] border border-[#23583c] px-2 py-0.5 rounded-full">
                    <span className="material-symbols-outlined text-[12px]">verified</span>
                    Terverifikasi
                  </span>
                )}
              </div>
              {/* Tiga kriteria syarat kata sandi */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-[11px] font-mono">
                <span className={`flex items-center gap-1.5 transition-colors ${hasLength ? 'text-[#7ed99e]' : 'text-[#7d90a1]'}`}>
                  <span className="material-symbols-outlined text-[15px]">
                    {hasLength ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                  Min. 8 karakter
                </span>
                <span className={`flex items-center gap-1.5 transition-colors ${hasNumber ? 'text-[#7ed99e]' : 'text-[#7d90a1]'}`}>
                  <span className="material-symbols-outlined text-[15px]">
                    {hasNumber ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                  Kombinasi angka
                </span>
                <span className={`flex items-center gap-1.5 transition-colors ${hasSpecial ? 'text-[#7ed99e]' : 'text-[#7d90a1]'}`}>
                  <span className="material-symbols-outlined text-[15px]">
                    {hasSpecial ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                  Karakter khusus
                </span>
              </div>
            </div>

            {/* Kotak centang persetujuan ketentuan layanan dan kebijakan privasi */}
            <label className="flex items-start gap-2.5 cursor-pointer mt-0.5 group">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                required
                className="mt-0.5 w-4 h-4 rounded cursor-pointer accent-[#2e8b57]"
              />
              <span className="text-xs text-[#9bb0c1] auth-subtitle auth-terms-text leading-snug transition-colors">
                Saya menyetujui <a href="#" className="auth-link hover:underline font-semibold">Ketentuan Layanan</a> dan <a href="#" className="auth-link hover:underline font-semibold">Kebijakan Privasi</a> SPCT.
              </span>
            </label>

            {/* Kotak notifikasi sukses registrasi */}
            {success && (
              <div className="rounded-lg bg-[#122820] border border-[#23583c] p-3 text-[#7ed99e] flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[20px]">check_circle</span>
                <span className="font-mono text-xs">Registrasi berhasil diajukan! Mengalihkan ke portal login...</span>
              </div>
            )}

            {/* Tombol aksi submit pendaftaran akun */}
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

          {/* Tautan kembali ke halaman login */}
          <div className="flex flex-col items-center gap-4 pt-5 mt-5 border-t border-[#242e38] auth-card-header">
            <div className="flex items-center justify-between w-full text-xs">
              <span className="text-[#8fa0b0] auth-subtitle">Sudah memiliki akun aktif?</span>
              <button onClick={() => navigate('/')} className="auth-link font-semibold flex items-center gap-1 cursor-pointer">
                <span>Masuk di sini</span>
                <span className="material-symbols-outlined text-[14px]">login</span>
              </button>
            </div>
            {/* Indikator status simpul online dan latensi */}
            <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-[#10151a] border border-[#252f3a] auth-meta-badge text-[11px] font-mono text-[#8fa0b0]">
              <span className="w-2 h-2 rounded-full bg-[#2e8b57] animate-pulse"></span>
              <span className="text-[#7ed99e] font-semibold">● System Online</span>
              <span className="text-[#384654]">|</span>
              <span>Node Ping: 14ms</span>
            </div>
          </div>
        </main>
      </div>
      {/* Catatan kaki halaman autentikasi */}
      <AuthFooter />
    </div>
  );
}
