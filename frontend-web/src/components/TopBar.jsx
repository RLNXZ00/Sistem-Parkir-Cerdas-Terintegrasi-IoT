// TopBar: Header yang muncul di semua halaman fitur menu
export default function TopBar({ breadcrumb, status = 'IoT Connected' }) {
  return (
    <header className="bg-surface border-b border-surface-container flex justify-between items-center h-16 px-6 fixed top-0 right-0 z-10 left-20 lg:left-64">
      {/* Breadcrumb */}
      <nav className="flex text-on-surface-variant font-mono text-sm items-center gap-1">
        <span className="hover:text-primary transition-colors cursor-pointer">Dashboard</span>
        <span className="mx-1 opacity-50">/</span>
        <span className="text-primary font-semibold">{breadcrumb}</span>
      </nav>

      {/* Right Actions */}
      <div className="flex items-center gap-6">
        {/* IoT Status Badge */}
        <div className="hidden md:flex items-center gap-2 bg-surface-container-high px-3 py-1.5 rounded-full border border-outline-variant">
          <div className="w-2.5 h-2.5 rounded-full bg-eco-success shadow-[0_0_8px_rgba(46,139,87,0.8)] animate-pulse"></div>
          <span className="font-mono text-[12px] text-on-surface">{status}</span>
        </div>

        {/* Icon Buttons */}
        <div className="flex items-center gap-2">
          <button className="text-on-surface-variant hover:text-primary transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-high">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="text-on-surface-variant hover:text-primary transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-high">
            <span className="material-symbols-outlined">wifi</span>
          </button>
          <button className="text-eco-success hover:text-primary transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-high">
            <span className="material-symbols-outlined">eco</span>
          </button>
        </div>
      </div>
    </header>
  );
}
