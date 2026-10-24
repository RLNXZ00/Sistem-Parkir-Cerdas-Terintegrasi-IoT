// Komponen brand header yang muncul di semua halaman autentikasi
export default function AuthBrand() {
  return (
    <header className="mb-6 flex flex-col items-center text-center select-none">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-[#122820] border border-[#23583c] flex items-center justify-center">
          <span className="material-symbols-outlined text-[#7ed99e] text-[20px]">eco</span>
        </div>
        <span className="font-bold text-xl tracking-tight text-white auth-brand-text transition-colors">Smart Parking</span>
      </div>
      <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#161c22] border border-[#2b3540] auth-brand-badge shadow-sm transition-colors">
        <span className="w-1.5 h-1.5 rounded-full bg-[#2e8b57]"></span>
        <span className="font-mono text-xs uppercase tracking-widest text-[#7ed99e] font-medium">
          GREEN-IOT INTEGRATED
        </span>
      </div>
    </header>
  );
}
