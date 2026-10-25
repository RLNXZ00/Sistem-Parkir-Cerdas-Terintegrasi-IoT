// Import hook useNavigate dan useLocation dari react-router-dom untuk navigasi dan membaca state rute
import { useNavigate, useLocation } from 'react-router-dom';
// Import hook useEffect dan useState dari React untuk mengelola siklus hidup komponen dan data slot
import { useEffect, useState } from 'react';

// Deklarasi fungsi komponen publik AllocatingSlotPage untuk menampilkan animasi alokasi slot rute A*
export default function AllocatingSlotPage() {
  // Inisialisasi hook navigate untuk mengarahkan pengguna ke halaman berikutnya
  const navigate = useNavigate();
  // Inisialisasi hook location untuk membaca parameter yang dikirim dari ScanPage
  const location = useLocation();
  // Inisialisasi state slot bertipe objek untuk menyimpan informasi slot parkir yang dialokasikan
  const [slot, setSlot] = useState(null);
  // Inisialisasi state errorMsg bertipe string untuk menyimpan pesan kesalahan jika ada
  const [errorMsg, setErrorMsg] = useState(null);

  // Mengambil data parameter yang dikirim dari ScanPage melalui location.state
  const { platNomor = "D 1234 SPCT", slotDialokasikan = null, jalurRuteGraf = null, error = null, jenisKendaraan = 'MOBIL' } = location.state || {};
  // Menentukan jalur rute gerbang kembali berdasarkan jenis kendaraan ('/motor' atau '/')
  const jalurKembali = jenisKendaraan === 'MOTOR' ? '/motor' : '/';

  // Hook useEffect untuk memproses data alokasi slot dan mengatur jeda transisi ke halaman navigasi
  useEffect(() => {
    // Flag penanda apakah komponen masih terpasang (mounted) di DOM
    let isMounted = true;

    // Jika terdapat pesan error dari halaman sebelumnya, tampilkan pesan error dan kembali setelah 3 detik
    if (error) {
      setErrorMsg(error);
      setTimeout(() => navigate(jalurKembali), 3000);
      return;
    }

    // Jika data slot yang dialokasikan tersedia, simpan ke state slot:
    if (slotDialokasikan) {
      setSlot({ idSlot: slotDialokasikan });
      
      // Mengatur timer jeda 3 detik untuk menampilkan kode slot sebelum berpindah ke peta rute
      const timer = setTimeout(() => {
        // Jika komponen masih terpasang, lanjutkan navigasi ke layar peta rute
        if (isMounted) {
          navigate('/navigation', { state: location.state });
        }
      }, 3000);
      
      // Membersihkan timer saat dependensi berubah atau komponen di-unmount
      return () => {
        clearTimeout(timer);
        isMounted = false;
      };
    } else {
      // Jika tidak terdapat data alokasi yang valid, alihkan kembali ke gerbang standby
      navigate(jalurKembali);
    }

    // Fungsi pembersih untuk menandai komponen telah di-unmount
    return () => { isMounted = false; };
  }, [navigate, slotDialokasikan, error, location.state, jalurKembali]);

  // Mengembalikan elemen antarmuka JSX layar alokasi slot
  return (
    // Kontainer layar penuh berlatar gelap pekat dengan perataan tengah
    <div className="bg-[#050B14] h-screen w-screen overflow-hidden flex items-center justify-center font-['Outfit'] text-slate-100">
      {/* Kontainer konten utama */}
      <main className="flex flex-col items-center justify-center text-center space-y-12 p-8 w-full max-w-7xl mx-auto z-10">
        
        {/* Indikator status sistem di bagian atas */}
        <div className="text-sky-400 font-['Space_Grotesk'] uppercase tracking-[0.3em] font-semibold animate-pulse">
          {errorMsg ? "SYSTEM ERROR" : (slot ? "SLOT DITEMUKAN" : "MENCARI SLOT TERDEKAT...")}
        </div>

        {/* Tampilan utama kode identitas slot parkir */}
        <div className="flex flex-col items-center justify-center space-y-6">
          {/* Jika terdapat error, tampilkan pesan error: */}
          {errorMsg ? (
             <h1 className="text-[64px] leading-none font-bold tracking-tighter text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]">
                {errorMsg}
             </h1>
          ) : (
            // Jika berhasil menemukan slot, tampilkan kode slot dengan ukuran besar 140px:
            <>
              <h1 className="text-[140px] leading-none font-extrabold tracking-tighter text-green-400 drop-shadow-[0_0_30px_rgba(74,222,128,0.6)] animate-pulse">
                {slot ? slot.idSlot : "..."}
              </h1>
              <h2 className="text-2xl text-slate-300 tracking-[0.2em] uppercase font-light">
                SLOT PARKIR ANDA
              </h2>
            </>
          )}
        </div>

        {/* Kotak sub-informasi nomor plat kendaraan pengemudi */}
        {slot && (
          <div className="glass-panel px-10 py-6 rounded-2xl">
            <p className="font-['Space_Grotesk'] text-sky-300 text-xl tracking-widest font-semibold">
              PLAT NOMOR: {platNomor}
            </p>
          </div>
        )}

        {/* Indikator loading sinkronisasi di bagian bawah */}
        {!errorMsg && (
          <div className="flex items-center space-x-3 text-slate-400 font-['Space_Grotesk'] text-sm mt-16 opacity-70">
            <span className="material-symbols-outlined text-xl animate-spin" style={{ fontVariationSettings: "'FILL' 0" }}>
              sync
            </span>
            <span className="tracking-widest uppercase">{slot ? "Menyiapkan rute peta..." : "Sinkronisasi Database..."}</span>
          </div>
        )}
      </main>

      {/* Dekorasi latar belakang gradasi radial */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-sky-900/20 via-[#050B14] to-[#050B14] pointer-events-none"></div>
    </div>
  );
}
