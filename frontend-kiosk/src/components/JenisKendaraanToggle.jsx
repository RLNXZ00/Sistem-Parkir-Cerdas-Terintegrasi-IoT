// Definisi konstanta array OPSI untuk daftar opsi jenis kendaraan yang didukung sistem (Mobil dan Motor)
const OPSI = [
  // Objek opsi jenis kendaraan MOBIL dengan label 'Mobil' dan ikon Material Symbols 'directions_car'
  { key: 'MOBIL', label: 'Mobil', icon: 'directions_car' },
  // Objek opsi jenis kendaraan MOTOR dengan label 'Motor' dan ikon Material Symbols 'two_wheeler'
  { key: 'MOTOR', label: 'Motor', icon: 'two_wheeler' },
];

// Deklarasi fungsi komponen publik JenisKendaraanToggle dengan parameter props jenis, onChange, dan accent
export default function JenisKendaraanToggle({ jenis, onChange, accent = 'sky' }) {
  // Menentukan kelas CSS warna aktif berdasarkan nilai prop accent (merah untuk exit, sky untuk entry)
  const warnaAktif = accent === 'red'
    ? 'bg-red-500/15 text-red-300 border-red-400/50'
    : 'bg-sky-500/15 text-sky-300 border-sky-400/50';

  // Mengembalikan elemen JSX antarmuka tombol sakelar jenis kendaraan berbentuk kapsul
  return (
    // Kontainer pembungkus tablist dengan latar belakang gelap transparan dan efek backdrop blur
    <div
      role="tablist"
      aria-label="Pilih jenis kendaraan"
      className="flex items-center gap-1 bg-[#0B1526]/80 backdrop-blur-md p-1 rounded-full border border-slate-700/60"
    >
      {/* Looping untuk merender masing-masing tombol opsi jenis kendaraan */}
      {OPSI.map(o => {
        // Memeriksa apakah opsi saat ini adalah jenis yang sedang aktif
        const aktif = o.key === jenis;
        // Mengembalikan elemen tombol untuk opsi jenis kendaraan
        return (
          <button
            key={o.key}
            id={`btn-jenis-${o.key.toLowerCase()}`}
            type="button"
            role="tab"
            aria-selected={aktif}
            // Menjalankan fungsi callback onChange jika tombol yang diklik belum aktif
            onClick={() => !aktif && onChange(o.key)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm font-['Space_Grotesk'] transition-all duration-200 cursor-pointer ${
              aktif ? warnaAktif : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
            }`}
          >
            {/* Menampilkan ikon kendaraan dari Material Symbols */}
            <span className="material-symbols-outlined text-[18px]">{o.icon}</span>
            {/* Menampilkan label teks nama jenis kendaraan */}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
