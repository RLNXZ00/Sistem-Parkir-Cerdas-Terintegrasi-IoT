// Deklarasi fungsi komponen publik AuthFooter untuk catatan kaki pada seluruh halaman autentikasi
export default function AuthFooter() {
  // Mengembalikan elemen antarmuka JSX catatan kaki sistem
  return (
    // Wadah footer di bagian bawah layar dengan batas garis atas dan penataan fleksibel responsif
    <footer className="w-full py-4 px-6 border-t border-[#182028] auth-footer-border flex flex-col sm:flex-row items-center justify-between text-xs text-[#6e8294] transition-colors">
      {/* Teks hak cipta sistem SPCT IoT Universitas Sanata Dharma */}
      <span>© 2026 SPCT IoT Systems — Universitas Sanata Dharma. All rights reserved.</span>
      {/* Bagian penunjuk status operasional node dan versi perangkat lunak */}
      <div className="flex items-center gap-4 mt-2 sm:mt-0 font-mono text-[11px]">
        {/* Status node aktif dengan animasi denyut hijau */}
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2e8b57] animate-pulse"></span>
          Node Status: Active
        </span>
        {/* Garis pemisah status */}
        <span className="text-[#2b3540]">|</span>
        {/* Identitas versi simpul operasional */}
        <span>Basement Hub v2.4</span>
      </div>
    </footer>
  );
}
