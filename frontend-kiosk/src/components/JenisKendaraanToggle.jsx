// Tombol pilihan jenis kendaraan (Mobil / Motor) di pojok kanan atas gerbang masuk & keluar.
// Tampilan gerbang identik, hanya label kamera (GATE_IN_01/02, PG_EXIT_01/02) dan antrean yang berbeda.
const OPSI = [
  { key: 'MOBIL', label: 'Mobil', icon: 'directions_car' },
  { key: 'MOTOR', label: 'Motor', icon: 'two_wheeler' },
];

export default function JenisKendaraanToggle({ jenis, onChange, accent = 'sky' }) {
  const warnaAktif = accent === 'red'
    ? 'bg-red-500/15 text-red-300 border-red-400/50'
    : 'bg-sky-500/15 text-sky-300 border-sky-400/50';

  return (
    <div
      role="tablist"
      aria-label="Pilih jenis kendaraan"
      className="flex items-center gap-1 bg-[#0B1526]/80 backdrop-blur-md p-1 rounded-full border border-slate-700/60"
    >
      {OPSI.map(o => {
        const aktif = o.key === jenis;
        return (
          <button
            key={o.key}
            id={`btn-jenis-${o.key.toLowerCase()}`}
            type="button"
            role="tab"
            aria-selected={aktif}
            onClick={() => !aktif && onChange(o.key)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm font-['Space_Grotesk'] transition-all duration-200 cursor-pointer ${
              aktif ? warnaAktif : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{o.icon}</span>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
