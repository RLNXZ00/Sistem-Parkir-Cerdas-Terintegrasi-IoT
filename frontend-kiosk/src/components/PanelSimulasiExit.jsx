// Import hook React useEffect, useLayoutEffect, useRef, dan useState untuk manipulasi DOM dan state
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

// Konstanta kunci sessionStorage untuk menyimpan koordinat posisi panel yang dapat digeser
const KUNCI_POSISI = 'spct_kiosk_panel_exit_pos';
// Konstanta lebar default panel simulasi sebesar 288 pixel (setara kelas Tailwind w-72)
const LEBAR_PANEL = 288;

// Fungsi helper batasi untuk menjaga posisi panel tetap berada di dalam batas viewport peramban
const batasi = (pos, panel) => {
  // Mengambil lebar elemen panel aktual atau menggunakan konstanta default LEBAR_PANEL
  const lebar = panel?.offsetWidth || LEBAR_PANEL;
  // Mengambil tinggi elemen panel aktual atau menggunakan tinggi default 220 pixel
  const tinggi = panel?.offsetHeight || 220;
  // Mengembalikan objek koordinat x dan y yang telah dibatasi di dalam area jendela peramban
  return {
    // Membatasi koordinat x agar tidak keluar dari sisi kiri (0) maupun sisi kanan layar
    x: Math.min(Math.max(0, pos.x), Math.max(0, window.innerWidth - lebar)),
    // Membatasi koordinat y agar tidak keluar dari sisi atas (0) maupun sisi bawah layar
    y: Math.min(Math.max(0, pos.y), Math.max(0, window.innerHeight - tinggi)),
  };
};

// Deklarasi fungsi komponen publik PanelSimulasiExit untuk mengatur parameter simulasi saldo dan durasi
export default function PanelSimulasiExit({ saldo, setSaldo, durasi, setDurasi }) {
  // Inisialisasi ref panelRef untuk mereferensikan elemen DOM kontainer panel
  const panelRef = useRef(null);
  // Inisialisasi ref dragRef untuk menyimpan jarak offset kursor mouse saat mulai digeser
  const dragRef = useRef(null);
  // Inisialisasi state pos untuk menyimpan koordinat posisi x dan y panel
  const [pos, setPos] = useState(null);
  // Inisialisasi state sedangGeser bertipe boolean untuk menandai aktivitas dragging
  const [sedangGeser, setSedangGeser] = useState(false);

  // Hook useLayoutEffect untuk menghitung posisi awal panel sebelum render pertama tampil
  useLayoutEffect(() => {
    // Inisialisasi variabel awal dengan nilai null
    let awal = null;
    // Blok try-catch untuk membaca koordinat tersimpan dari sessionStorage
    try {
      // Membaca data posisi tersimpan dari sessionStorage
      awal = JSON.parse(sessionStorage.getItem(KUNCI_POSISI) || 'null');
    } catch {
      // Jika terjadi kegagalan parsing JSON, setel awal ke null
      awal = null;
    }
    // Jika tidak ada data tersimpan, hitung posisi tengah layar secara otomatis:
    if (!awal || typeof awal.x !== 'number' || typeof awal.y !== 'number') {
      const el = panelRef.current;
      // Menghitung koordinat x dan y agar panel berada tepat di tengah layar
      awal = {
        x: (window.innerWidth - (el?.offsetWidth || LEBAR_PANEL)) / 2,
        y: (window.innerHeight - (el?.offsetHeight || 220)) / 2,
      };
    }
    // Menyimpan koordinat yang telah dibatasi ke dalam state pos
    setPos(batasi(awal, panelRef.current));
  }, []);

  // Hook useEffect untuk menyesuaikan posisi panel saat ukuran jendela peramban diubah (resize)
  useEffect(() => {
    // Handler event resize untuk memastikan panel tidak terpotong keluar layar
    const onResize = () => setPos(prev => (prev ? batasi(prev, panelRef.current) : prev));
    // Mendaftarkan event listener resize pada objek window
    window.addEventListener('resize', onResize);
    // Membersihkan event listener saat komponen di-unmount
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Fungsi handler mulaiGeser saat pengguna menekan pointer pada header panel
  const mulaiGeser = (e) => {
    // Jika posisi belum terhitung, batalkan aksi
    if (!pos) return;
    // Mengunci event pointer ke elemen header
    e.currentTarget.setPointerCapture(e.pointerId);
    // Menyimpan selisih jarak kursor mouse terhadap posisi sudut kiri atas panel
    dragRef.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y };
    // Mengaktifkan status sedangGeser
    setSedangGeser(true);
  };

  // Fungsi handler geser saat pointer digerakkan
  const geser = (e) => {
    // Jika tidak dalam kondisi menggeser, abaikan event
    if (!dragRef.current) return;
    // Memperbarui posisi koordinat panel secara dinamis mengikuti pergerakan pointer
    setPos(batasi({ x: e.clientX - dragRef.current.dx, y: e.clientY - dragRef.current.dy }, panelRef.current));
  };

  // Fungsi handler selesaiGeser saat pointer dilepaskan
  const selesaiGeser = (e) => {
    // Jika ref drag kosong, abaikan event
    if (!dragRef.current) return;
    // Mereset referensi drag ke null
    dragRef.current = null;
    // Menonaktifkan status sedangGeser
    setSedangGeser(false);
    // Melepaskan pointer capture jika masih aktif
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    // Menyimpan posisi terakhir panel ke sessionStorage agar persisten selama sesi
    setPos(prev => {
      if (prev) sessionStorage.setItem(KUNCI_POSISI, JSON.stringify(prev));
      return prev;
    });
  };

  // Mengembalikan elemen JSX antarmuka panel kontrol simulasi
  return (
    // Elemen kontainer fixed panel dengan posisi dinamis
    <div
      id="panel-simulasi-exit"
      ref={panelRef}
      style={{
        position: 'fixed',
        left: pos ? pos.x : 0,
        top: pos ? pos.y : 0,
        width: LEBAR_PANEL,
        visibility: pos ? 'visible' : 'hidden',
      }}
      className={`p-4 border bg-slate-900/95 backdrop-blur-md rounded-xl shadow-xl z-30 ${
        sedangGeser ? 'border-amber-400/60 shadow-[0_0_25px_rgba(251,191,36,0.2)]' : 'border-slate-700'
      }`}
    >
      {/* Header panel sebagai pegangan drag untuk memindahkan posisi panel */}
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
        {/* Ikon instrumen penyetelan */}
        <span className="material-symbols-outlined text-amber-400 text-sm">tune</span>
        {/* Judul teks header panel */}
        <span className="text-xs font-semibold text-slate-300 font-['Space_Grotesk'] tracking-wider">PANEL SIMULASI EXIT</span>
        {/* Ikon indikator drag pegangan */}
        <span className="material-symbols-outlined text-slate-500 text-sm ml-auto">drag_indicator</span>
      </div>

      {/* Label input simulasi saldo e-wallet */}
      <label className="text-[11px] text-slate-400 block mb-1">Simulasi Saldo E-Wallet (Rp)</label>
      {/* Input nomor untuk mengisi nilai saldo e-wallet */}
      <input
        type="number"
        value={saldo}
        onChange={e => setSaldo(e.target.value)}
        className="bg-slate-800 text-white p-2 rounded border border-slate-600 w-full text-sm font-mono mb-3 focus:outline-none focus:border-red-400"
        placeholder="Contoh: 2000 atau 50000"
      />

      {/* Label dropdown simulasi durasi parkir */}
      <label className="text-[11px] text-slate-400 block mb-1">Simulasi Durasi Parkir</label>
      {/* Dropdown pilihan skenario durasi waktu tinggal parkir */}
      <select
        value={durasi}
        onChange={e => setDurasi(Number(e.target.value))}
        className="bg-slate-800 text-white p-2 rounded border border-slate-600 w-full text-xs font-mono focus:outline-none focus:border-red-400"
      >
        {/* Opsi durasi waktu nyata */}
        <option value="0">Real-time (Waktu Sebenarnya)</option>
        {/* Opsi durasi 1 jam tarif flat */}
        <option value="60">1 Jam (Tarif Flat Rp 5.000)</option>
        {/* Opsi durasi 5 menit bebas biaya grace period */}
        <option value="5">5 Menit (Grace Period / Gratis Rp 0)</option>
        {/* Opsi durasi 5 jam tarif flat */}
        <option value="300">5 Jam (Tarif Flat Rp 5.000)</option>
        {/* Opsi durasi 10 jam dengan biaya jam tambahan */}
        <option value="600">10 Jam (Tarif Rp 9.000)</option>
        {/* Opsi durasi 14 jam tarif rawat inap maksimal */}
        <option value="800">14 Jam (Rawat Inap / Rp 10.000)</option>
      </select>
    </div>
  );
}
