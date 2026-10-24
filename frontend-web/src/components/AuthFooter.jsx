// Komponen Footer yang muncul di semua halaman autentikasi
export default function AuthFooter() {
  return (
    <footer className="w-full py-4 px-6 border-t border-[#182028] auth-footer-border flex flex-col sm:flex-row items-center justify-between text-xs text-[#6e8294] transition-colors">
      <span>© 2026 SPCT IoT Systems — Universitas Sanata Dharma. All rights reserved.</span>
      <div className="flex items-center gap-4 mt-2 sm:mt-0 font-mono text-[11px]">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2e8b57] animate-pulse"></span>
          Node Status: Active
        </span>
        <span className="text-[#2b3540]">|</span>
        <span>Basement Hub v2.4</span>
      </div>
    </footer>
  );
}
