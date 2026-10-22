import { useEffect, useLayoutEffect, useRef, useState } from 'react';

const KUNCI_POSISI = 'spct_kiosk_panel_exit_pos';
const LEBAR_PANEL = 288; // setara w-72

// Menjaga panel tetap berada di dalam viewport
const batasi = (pos, panel) => {
  const lebar = panel?.offsetWidth || LEBAR_PANEL;
  const tinggi = panel?.offsetHeight || 220;
  return {
    x: Math.min(Math.max(0, pos.x), Math.max(0, window.innerWidth - lebar)),
    y: Math.min(Math.max(0, pos.y), Math.max(0, window.innerHeight - tinggi)),
  };
};

// Panel simulasi gerbang keluar yang bisa digeser (drag lewat header).
// Posisi default: tengah layar. Posisi terakhir diingat selama sesi (dipakai bersama gerbang keluar mobil & motor).
export default function PanelSimulasiExit({ saldo, setSaldo, durasi, setDurasi }) {
  const panelRef = useRef(null);
  const dragRef = useRef(null);
  const [pos, setPos] = useState(null);
  const [sedangGeser, setSedangGeser] = useState(false);

  // Tentukan posisi awal: dari sesi tersimpan, atau tengah layar
  useLayoutEffect(() => {
    let awal = null;
    try {
      awal = JSON.parse(sessionStorage.getItem(KUNCI_POSISI) || 'null');
    } catch {
      awal = null;
    }
    if (!awal || typeof awal.x !== 'number' || typeof awal.y !== 'number') {
      const el = panelRef.current;
      awal = {
        x: (window.innerWidth - (el?.offsetWidth || LEBAR_PANEL)) / 2,
        y: (window.innerHeight - (el?.offsetHeight || 220)) / 2,
      };
    }
    setPos(batasi(awal, panelRef.current));
  }, []);

  // Jaga panel tetap terlihat saat ukuran jendela berubah
  useEffect(() => {
    const onResize = () => setPos(prev => (prev ? batasi(prev, panelRef.current) : prev));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const mulaiGeser = (e) => {
    if (!pos) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y };
    setSedangGeser(true);
  };

  const geser = (e) => {
    if (!dragRef.current) return;
    setPos(batasi({ x: e.clientX - dragRef.current.dx, y: e.clientY - dragRef.current.dy }, panelRef.current));
  };

  const selesaiGeser = (e) => {
    if (!dragRef.current) return;
    dragRef.current = null;
    setSedangGeser(false);
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    setPos(prev => {
      if (prev) sessionStorage.setItem(KUNCI_POSISI, JSON.stringify(prev));
      return prev;
    });
  };

  return (
    <div
      id="panel-simulasi-exit"
      ref={panelRef}
      style={{
        position: 'fixed',
        left: pos ? pos.x : 0,
        top: pos ? pos.y : 0,
        width: LEBAR_PANEL,
        visibility: pos ? 'visible' : 'hidden', // sembunyikan sampai posisi tengah terhitung
      }}
      className={`p-4 border bg-slate-900/95 backdrop-blur-md rounded-xl shadow-xl z-30 ${
        sedangGeser ? 'border-amber-400/60 shadow-[0_0_25px_rgba(251,191,36,0.2)]' : 'border-slate-700'
      }`}
    >
      {/* Header = pegangan untuk menggeser panel */}
      <div
        onPointerDown={mulaiGeser}
        onPointerMove={geser}
        onPointerUp={selesaiGeser}
        onPointerCancel={selesaiGeser}
        style={{ touchAction: 'none' }}
        className={`flex items-center gap-2 mb-2 pb-1 border-b border-slate-800 select-none ${
          sedangGeser ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        title="Tarik untuk memindahkan panel"
      >
        <span className="material-symbols-outlined text-amber-400 text-sm">tune</span>
        <span className="text-xs font-semibold text-slate-300 font-['Space_Grotesk'] tracking-wider">PANEL SIMULASI EXIT</span>
        <span className="material-symbols-outlined text-slate-500 text-sm ml-auto">drag_indicator</span>
      </div>

      <label className="text-[11px] text-slate-400 block mb-1">Simulasi Saldo E-Wallet (Rp)</label>
      <input
        type="number"
        value={saldo}
        onChange={e => setSaldo(e.target.value)}
        className="bg-slate-800 text-white p-2 rounded border border-slate-600 w-full text-sm font-mono mb-3 focus:outline-none focus:border-red-400"
        placeholder="Contoh: 2000 atau 50000"
      />

      <label className="text-[11px] text-slate-400 block mb-1">Simulasi Durasi Parkir</label>
      <select
        value={durasi}
        onChange={e => setDurasi(Number(e.target.value))}
        className="bg-slate-800 text-white p-2 rounded border border-slate-600 w-full text-xs font-mono focus:outline-none focus:border-red-400"
      >
        <option value="0">Real-time (Waktu Sebenarnya)</option>
        <option value="60">1 Jam (Tarif Flat Rp 5.000)</option>
        <option value="5">5 Menit (Grace Period / Gratis Rp 0)</option>
        <option value="300">5 Jam (Tarif Flat Rp 5.000)</option>
        <option value="600">10 Jam (Tarif Rp 9.000)</option>
        <option value="800">14 Jam (Rawat Inap / Rp 10.000)</option>
      </select>
    </div>
  );
}
