// Import hook useState dari pustaka react untuk manajemen state lokal komponen
import { useState } from 'react';
// Import hook useNavigate dari react-router-dom untuk perpindahan antar halaman
import { useNavigate } from 'react-router-dom';
// Import komponen AuthBrand untuk identitas visual logo SPCT
import AuthBrand from '../components/AuthBrand';
// Import komponen AuthFooter untuk catatan kaki halaman autentikasi
import AuthFooter from '../components/AuthFooter';
// Import komponen AuthThemeToggle untuk tombol pengalih tema terang dan gelap
import AuthThemeToggle from '../components/AuthThemeToggle';

// Mendefinisikan konstanta alamat dasar server backend Spring Boot (port 8081)
const API_BASE = 'http://localhost:8081';

// Deklarasi fungsi komponen publik LoginPage untuk antarmuka masuk akun petugas atau manajer
export default function LoginPage() {
  // Inisialisasi state showPassword bertipe boolean dengan nilai awal false untuk status visibilitas kata sandi
  const [showPassword, setShowPassword] = useState(false);
  // Inisialisasi state username bertipe string dengan nilai awal string kosong
  const [username, setUsername] = useState('');
  // Inisialisasi state password bertipe string dengan nilai awal string kosong
  const [password, setPassword] = useState('');
  // Inisialisasi state isLoading bertipe boolean dengan nilai awal false untuk indikator loading proses login
  const [isLoading, setIsLoading] = useState(false);
  // Inisialisasi state error bertipe string dengan nilai awal string kosong untuk menampilkan pesan galat
  const [error, setError] = useState('');
  // Inisialisasi fungsi navigate menggunakan hook useNavigate
  const navigate = useNavigate();

  // Deklarasi fungsi asinkron handleSubmit untuk memvalidasi dan mengirim kredensial login ke backend
  const handleSubmit = async (e) => {
    // Mencegah perilaku default pengiriman formulir HTML (refresh halaman)
    e.preventDefault();
    // Mengaktifkan status loading saat proses otentikasi berlangsung
    setIsLoading(true);
    // Mereset pesan galat sebelumnya menjadi string kosong
    setError('');

    try {
      // Mengirimkan permintaan HTTP POST ke endpoint backend /api/auth/login dengan body JSON
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      // Mengonversi data respons backend ke format objek JSON
      const data = await res.json();

      // Jika respons HTTP tidak berhasil (misalnya kode 401 Unauthorized atau 403 Forbidden)
      if (!res.ok) {
        // Tampilkan pesan galat dari backend atau pesan peringatan standar
        setError(data.pesan || 'Login gagal. Periksa Username / NIP dan kata sandi Anda.');
        return;
      }

      // Menyimpan data sesi login pengguna ke dalam sessionStorage peramban
      sessionStorage.setItem('spct_user', JSON.stringify(data));

      // Mereset filter denah slot parkir agar kembali ke konfigurasi bawaan Mobil Lantai 1
      sessionStorage.removeItem('spct_peta_slot');

      // Mengarahkan rute pengguna berdasarkan peran otorisasi (Role-Based Access Control)
      if (data.role === 'ADMIN' || data.role === 'Manajemen RS') {
        // Jika peran administrator atau manajemen rumah sakit, arahkan ke dashboard manajemen
        navigate('/dashboard-management');
      } else {
        // Jika peran petugas lapangan biasa, arahkan ke dashboard operasional lapangan
        navigate('/dashboard');
      }
    } catch {
      // Menangkap kegagalan jaringan jika server backend tidak dapat dihubungi
      setError('Tidak dapat terhubung ke server. Pastikan backend berjalan di port 8081.');
    } finally {
      // Mematikan status loading setelah proses otentikasi selesai dieksekusi
      setIsLoading(false);
    }
  };

  // Mengembalikan elemen antarmuka JSX halaman autentikasi masuk (Login)
  return (
    // Wadah utama layar penuh dengan tata letak vertikal responsif
    <div className="min-h-screen bg-[#0b0f13] text-[#dee3e8] auth-page-wrapper flex flex-col justify-between transition-colors duration-200 relative">
      {/* Tombol pengalih tema tampilan mode gelap dan terang */}
      <AuthThemeToggle />

      {/* Area tengah pembungkus kartu login */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Komponen logo dan header merek SPCT Green-IoT */}
        <AuthBrand />

        {/* Kontainer utama kartu otentikasi */}
        <main className="w-full max-w-[450px]">
          <div className="bg-[#161c22] border border-[#2b3540] auth-card rounded-2xl shadow-2xl p-6 sm:p-8 flex flex-col gap-6 transition-colors duration-200">

            {/* Bagian header kartu dengan lencana enkripsi SSL */}
            <div className="flex items-center justify-between pb-5 border-b border-[#242e38] auth-card-header">
              <div className="flex items-center gap-3">
                {/* Wadah ikon gembok login */}
                <div className="w-10 h-10 rounded-xl bg-[#1e2730] border border-[#323f4d] auth-header-icon flex items-center justify-center text-[#7ad0ff]">
                  <span className="material-symbols-outlined text-[22px]">lock</span>
                </div>
                <div>
                  <div className="text-[11px] font-mono tracking-wider uppercase text-[#7ad0ff] font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00bfff]"></span>
                    AUTH-GATEWAY // SIGN IN
                  </div>
                  <div className="text-[10px] text-[#8fa0b0] auth-subtitle font-mono tracking-wide">GATE NODE: PG-000A</div>
                </div>
              </div>
              {/* Lencana status keamanan koneksi SSL */}
              <span className="px-2.5 py-1 rounded-full bg-[#122820] border border-[#23583c] auth-ssl-badge text-[#7ed99e] font-mono text-[11px] font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2e8b57] auth-ssl-dot"></span>
                <span className="auth-ssl-text">SSL ENCRYPTED</span>
              </span>
            </div>

            {/* Bagian judul selamat datang dan petunjuk pengisian */}
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-bold tracking-tight text-white auth-title">Selamat Datang</h1>
              <p className="text-xs text-[#9bb0c1] auth-subtitle leading-relaxed">
                Masukkan kredensial atau NIP Anda untuk mengakses Sistem Parkir Cerdas Terintegrasi IoT.
              </p>
            </div>

            {/* Tampilan spanduk pesan galat jika login gagal */}
            {error && (
              <div className="flex items-center gap-2 bg-red-950/40 border border-red-700/50 rounded-lg px-4 py-3 text-sm text-red-400 font-mono">
                <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
                {error}
              </div>
            )}

            {/* Formulir masukan data login */}
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>

              {/* Kolom isian Username atau Nomor Induk Pegawai (NIP) */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-[#bcc8d1] auth-label uppercase tracking-wider font-mono flex items-center gap-1.5" htmlFor="username">
                    <span className="material-symbols-outlined text-[16px] text-[#7ad0ff]">badge</span>
                    Username / NIP
                  </label>
                  <span className="text-[11px] font-mono text-[#7ad0ff]">Username atau 8 digit NIP</span>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#8fa0b0] auth-subtitle text-[20px]">badge</span>
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

              {/* Kolom isian Kata Sandi (Password) */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-[#bcc8d1] auth-label uppercase tracking-wider font-mono flex items-center gap-1.5" htmlFor="password">
                    <span className="material-symbols-outlined text-[16px] text-[#ffd700]">lock</span>
                    Password
                  </label>
                  {/* Tombol navigasi lupa kata sandi */}
                  <button
                    type="button"
                    onClick={() => navigate('/reset-password')}
                    className="text-sm text-[#7ad0ff] hover:text-primary transition-colors font-semibold"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#8fa0b0] auth-subtitle text-[20px]">lock</span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-[#0e1418] border border-[#2b3540] hover:border-[#3d4c5c] focus:border-[#7ad0ff] auth-input rounded-lg pl-10 pr-10 py-3 text-white placeholder-[#5d6f80] focus:outline-none font-mono text-sm transition-colors"
                  />
                  {/* Tombol untuk memperlihatkan atau menyembunyikan karakter kata sandi */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8fa0b0] auth-icon-btn hover:text-white transition-colors focus:outline-none"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Tombol pemicu proses login */}
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

              {/* Indikator status sistem IoT online */}
              <div className="flex items-center justify-center gap-2 text-sm text-[#8fa0b0] auth-subtitle font-mono">
                <span className="w-2 h-2 rounded-full bg-[#2e8b57] animate-pulse shadow-[0_0_8px_rgba(46,139,87,0.8)]"></span>
                System Online
              </div>
            </form>

            {/* Bagian tautan menuju halaman pendaftaran akun baru */}
            <div className="flex items-center justify-between pt-4 border-t border-[#242e38] auth-card-header text-xs">
              <span className="text-[#8fa0b0] auth-subtitle">Belum memiliki akun?</span>
              <button
                onClick={() => navigate('/registrasi')}
                className="auth-link font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Daftar di sini</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </main>
      </div>
      {/* Komponen footer merek dagang dan status simpul */}
      <AuthFooter />
    </div>
  );
}
