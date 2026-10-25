// Deklarasi fungsi komponen publik AuthBrand untuk logo dan identitas merek pada seluruh halaman autentikasi
export default function AuthBrand() {
  // Mengembalikan elemen JSX header identitas sistem Smart Parking Green-IoT
  return (
    // Wadah header di posisi atas kartu autentikasi dengan penataan vertikal terpusat
    <header className="mb-6 flex flex-col items-center text-center select-none">
      {/* Baris logo ikon daun ramah lingkungan dan nama produk */}
      <div className="flex items-center gap-2 mb-2">
        {/* Lingkaran pembungkus ikon bernuansa hijau ekologis */}
        <div className="w-8 h-8 rounded-full bg-[#122820] border border-[#23583c] flex items-center justify-center">
          {/* Ikon daun Material Symbols penanda efisiensi emisi hijau */}
          <span className="material-symbols-outlined text-[#7ed99e] text-[20px]">eco</span>
        </div>
        {/* Nama merek utama aplikasi */}
        <span className="font-bold text-xl tracking-tight text-white auth-brand-text transition-colors">Smart Parking</span>
      </div>
      {/* Lencana status integrasi teknologi Green-IoT */}
      <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#161c22] border border-[#2b3540] auth-brand-badge shadow-sm transition-colors">
        {/* Titik indikator berwarna hijau */}
        <span className="w-1.5 h-1.5 rounded-full bg-[#2e8b57]"></span>
        {/* Teks label lencana berhuruf kapital bergaya monospace */}
        <span className="font-mono text-xs uppercase tracking-widest text-[#7ed99e] font-medium">
          GREEN-IOT INTEGRATED
        </span>
      </div>
    </header>
  );
}
