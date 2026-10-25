// Import hook useNavigate dan useLocation dari react-router-dom untuk manipulasi dan akses state navigasi
import { useNavigate, useLocation } from 'react-router-dom';
// Import hook useEffect, useState, dan useRef dari react untuk lifecycle, state, dan referensi mutable
import { useEffect, useState, useRef } from 'react';

// Deklarasi fungsi komponen publik NavigationPage untuk visualisasi rute graf A* dan panduan slot parkir
export default function NavigationPage() {
  // Inisialisasi fungsi navigate menggunakan hook useNavigate
  const navigate = useNavigate();
  // Inisialisasi objek lokasi menggunakan hook useLocation untuk membaca parameter perpindahan rute
  const location = useLocation();
  
  // Destrukturisasi data state navigasi meliputi slotData, platNomor, dan jenisKendaraan (default: 'MOBIL')
  const { slotData, platNomor, jenisKendaraan = 'MOBIL' } = location.state || {};
  // Menentukan kode slot target yang dialokasikan atau fallback ke nilai default 'B1-01'
  const targetSlot = slotData?.idSlotDialokasikan || "B1-01";
  // Mengekstraksi prefix kode zona lantai (contoh: 'B1' atau 'M1') dari kode slot target
  const prefixZona = targetSlot.split('-')[0] || 'B1';
  // Menentukan URL rute kembali ke kiosk gerbang masuk asal sesuai jenis kendaraan
  const jalurKembali = jenisKendaraan === 'MOTOR' ? '/motor' : '/';
  // Mengambil daftar titik koordinat rute graf dari data alokasi rute algoritma A*
  const ruteKoordinat = slotData?.urutan || [];

  // Inisialisasi state elapsedSeconds bertipe number dengan nilai awal 0 untuk menghitung waktu tempuh perjalanan
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  // Inisialisasi state isParked bertipe boolean dengan nilai awal false untuk status kedatangan kendaraan di slot
  const [isParked, setIsParked] = useState(false);
  // Inisialisasi state copied bertipe boolean dengan nilai awal false untuk status penyalinan teks curl
  const [copied, setCopied] = useState(false);
  // Inisialisasi ref timerRef menggunakan hook useRef untuk menyimpan referensi instance timer
  const timerRef = useRef(null);

  // Hook useEffect untuk menjalankan timer stopwatch perhitungan durasi perjalanan menuju slot parkir
  useEffect(() => {
    // Jika kendaraan sudah dinyatakan parkir, hentikan penambahan waktu
    if (isParked) return;
    // Mengaktifkan interval pencatat waktu setiap 1000 milidetik (1 detik)
    const interval = setInterval(() => {
      // Menambahkan nilai detik sebelumnya sebanyak 1 satuan
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    // Membersihkan interval timer saat komponen di-unmount atau kendaraan telah parkir
    return () => clearInterval(interval);
  }, [isParked]);

  // Hook useEffect untuk polling status slot ke backend guna mendeteksi sinyal sensor IoT secara berkala
  useEffect(() => {
    // Jika kendaraan sudah terdeteksi parkir, jangan lakukan polling lebih lanjut
    if (isParked) return;

    // Deklarasi fungsi asinkron checkSlotStatus untuk mengecek status slot parkir saat ini
    const checkSlotStatus = async () => {
      try {
        // Mengirimkan permintaan HTTP GET ke endpoint monitoring seluruh slot parkir
        const res = await fetch('/api/monitoring/slots');
        // Jika respons berhasil, periksa apakah slot target sudah berstatus 'TERISI'
        if (res.ok) {
          // Mengurai data JSON daftar slot
          const slots = await res.json();
          // Mencari data slot yang sesuai dengan ID targetSlot
          const target = slots.find(s => s.idSlot === targetSlot);
          // Jika slot target ditemukan dan status sensor berubah menjadi TERISI
          if (target && target.statusSlot === 'TERISI') {
            // Memperbarui state isParked menjadi true
            setIsParked(true);
          }
        }
      } catch (e) {
        // Menampilkan pesan kesalahan jika polling slot mengalami kegagalan
        console.error("Gagal polling status slot:", e);
      }
    };

    // Menjalankan polling setiap 1500 milidetik (1.5 detik)
    const pollInterval = setInterval(checkSlotStatus, 1500);
    // Membersihkan interval polling saat komponen di-unmount
    return () => clearInterval(pollInterval);
  }, [targetSlot, isParked]);

  // Deklarasi fungsi pembantu formatTime untuk mengubah jumlah total detik ke format string MM:SS
  const formatTime = (secs) => {
    // Menghitung jumlah menit pembulatan ke bawah
    const mins = Math.floor(secs / 60);
    // Menghitung sisa detik setelah dikurangi menit
    const remainingSecs = secs % 60;
    // Mengembalikan representasi waktu dengan penambahan angka nol di depan (padding 2 digit)
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  // Membuat string perintah cURL webhook untuk simulasi penembakan sinyal sensor IoT secara manual
  const curlCommand = `curl -X POST "http://localhost:8081/api/monitoring/webhook?idSlot=${targetSlot}&statusSensor=TERISI"`;

  // Deklarasi fungsi copyCurl untuk menyalin perintah cURL ke clipboard sistem
  const copyCurl = () => {
    // Menulis perintah teks curl ke clipboard pengguna
    navigator.clipboard.writeText(curlCommand);
    // Mengubah state copied menjadi true untuk menampilkan label konfirmasi tersalin
    setCopied(true);
    // Mengembalikan status copied menjadi false setelah jeda 2500 milidetik
    setTimeout(() => setCopied(false), 2500);
  };

  // Deklarasi fungsi asinkron triggerWebhookDirectly untuk menembak webhook backend secara langsung dari UI
  const triggerWebhookDirectly = async () => {
    try {
      // Mengirim permintaan HTTP POST langsung ke endpoint webhook sensor IoT
      await fetch(`/api/monitoring/webhook?idSlot=${encodeURIComponent(targetSlot)}&statusSensor=TERISI`, {
        method: 'POST'
      });
      // Mengubah status kendaraan menjadi sudah parkir (isParked = true)
      setIsParked(true);
    } catch (e) {
      // Menampilkan log galat ke konsol jika trigger webhook gagal
      console.error("Gagal trigger webhook langsung:", e);
    }
  };

  // Membuat daftar 16 slot parkir statis sebagai latar belakang denah visualisasi denah parkir
  const allSlots = Array.from({length: 16}, (_, i) => {
    // Nomor urut indeks slot dari 1 hingga 16
    const id = i + 1;
    // Menghitung posisi kolom koordinat horizontal slot
    const col = Math.floor((id + 1) / 2);
    // Koordinat sumbu X pada canvas SVG denah
    const x = 20 * col;
    // Koordinat sumbu Y (baris atas nilai 30, baris bawah nilai 70)
    const y = (id % 2 !== 0) ? 30 : 70;
    // Format penggabungan ID slot (contoh: B1-01, B1-02, dst.)
    const slotId = `${prefixZona}-${id.toString().padStart(2, '0')}`;
    // Mengembalikan objek slot berisikan identitas, koordinat, dan tanda apakah slot tersebut adalah target
    return { id: slotId, x, y, isTarget: slotId === targetSlot };
  });

  // Deklarasi fungsi buildSvgPath untuk membentuk string perintah 'd' lintasan SVG dari koordinat rute graf
  const buildSvgPath = () => {
    // Jika tidak ada data koordinat rute, kembalikan string kosong
    if (!ruteKoordinat || ruteKoordinat.length === 0) return "";
    // Memetakan array koordinat menjadi instruksi jalur SVG Move to (M) dan Line to (L)
    return `M ${ruteKoordinat.map(p => `${p.x} ${p.y}`).join(' L ')}`;
  };

  // Mengembalikan elemen antarmuka JSX untuk denah peta navigasi dan panduan pengemudi
  return (
    // Wadah layar penuh halaman peta navigasi dengan styling futuristik gelap
    <div className="bg-[#050B14] h-screen w-screen flex flex-col overflow-hidden select-none text-slate-100 font-['Outfit']">
      {/* Definisi styling CSS kustom untuk grid denah, animasi garis bercahaya, dan pergerakan mobil */}
      <style>{`
        .map-grid {
            background-image: 
                linear-gradient(to right, rgba(14,165,233,0.05) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(14,165,233,0.05) 1px, transparent 1px);
            background-size: 20px 20px;
        }
        .glowing-route {
            filter: drop-shadow(0 0 6px #4ade80);
            stroke-dasharray: 500;
            stroke-dashoffset: 500;
            animation: dash 3s ease-out forwards;
        }
        @keyframes dash {
            to { stroke-dashoffset: 0; }
        }
        .pulse-glow {
            animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
        }
        @keyframes pulse-ring {
            0% { box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.7); }
            70% { box-shadow: 0 0 0 8px rgba(74, 222, 128, 0); }
            100% { box-shadow: 0 0 0 0 rgba(74, 222, 128, 0); }
        }
        .car-anim {
            offset-path: path('${buildSvgPath()}');
            animation: move-car 4s ease-in-out forwards;
        }
        @keyframes move-car {
            0% { offset-distance: 0%; opacity: 0; }
            5% { opacity: 1; }
            100% { offset-distance: 100%; opacity: 1; }
        }
      `}</style>

      {/* Header navigasi dengan judul peta alokasi, stopwatch durasi, nomor plat, dan target slot */}
      <header className="glass-panel flex justify-between items-center w-full px-8 py-4 border-b border-sky-500/20 relative z-10">
        {/* Judul dan ikon fitur peta rute graf A* */}
        <div className="flex items-center gap-4 text-sky-400 font-bold">
          <span className="material-symbols-outlined text-sky-400" style={{ fontVariationSettings: "'FILL' 1" }}>map</span>
          <span className="font-['Space_Grotesk'] font-bold tracking-[0.2em]">PETA ALOKASI A* GRAPH</span>
        </div>
        
        {/* Informasi stopwatch waktu riil, plat nomor kendaraan, dan slot target */}
        <div className="flex items-center gap-4">
          {/* Lencana penampil stopwatch waktu tempuh perjalanan */}
          <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border ${isParked ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300' : 'bg-amber-950/60 border-amber-500/50 text-amber-300 animate-pulse'}`}>
            <span className="material-symbols-outlined text-lg">timer</span>
            <span className="font-mono font-bold text-sm tracking-widest">{formatTime(elapsedSeconds)}</span>
            <span className="text-xs uppercase">{isParked ? '(PARKIR TIBA)' : '(BERJALAN)'}</span>
          </div>

          {/* Kotak informasi plat kendaraan dan target slot tujuan */}
          <div className="text-slate-100 font-medium flex items-center bg-sky-900/40 border border-sky-500/30 px-5 py-1.5 rounded-full shadow-[0_0_15px_rgba(14,165,233,0.2)]">
            <span className="tracking-wider text-sm">Plat: <strong className="text-sky-300">{platNomor || "D 1234 SPCT"}</strong> | Slot: <strong className="text-green-400">{targetSlot}</strong></span>
          </div>

          {/* Tombol navigasi untuk kembali ke halaman gerbang masuk */}
          <button
            onClick={() => navigate(jalurKembali)}
            className="flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-full border border-slate-600 transition-colors text-xs font-['Space_Grotesk'] cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">close</span>
            <span>Kembali</span>
          </button>
        </div>
      </header>

      {/* Konten utama denah visualisasi SVG interaktif */}
      <main className="flex-1 relative overflow-hidden flex items-center justify-center p-6">
        {/* Pola grid latar belakang denah parkir */}
        <div className="absolute inset-0 map-grid flex items-center justify-center pointer-events-none"></div>
        
        {/* Wadah pembungkus canvas peta dengan efek kaca (glassmorphism) */}
        <div className="relative w-full max-w-5xl aspect-video glass-panel rounded-3xl p-4 overflow-hidden z-10 border border-sky-500/30 flex items-center justify-center bg-[#071324]/80">
          
          {/* Elemen SVG vektor untuk merender koridor jalan, slot parkir, dan lintasan rute optimal */}
          <svg className="w-full h-full overflow-visible" viewBox="-10 10 190 80" xmlns="http://www.w3.org/2000/svg">
            
            {/* Menggambar garis koridor jalan raya utama di lantai parkir */}
            <path d="M 0 50 L 160 50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="15" strokeLinecap="round" />
            
            {/* Melakukan iterasi untuk menggambar seluruh kotak slot parkir beserta garis konektor */}
            {allSlots.map(slot => (
              <g key={slot.id}>
                {/* Garis penghubung koridor jalan ke masing-masing slot */}
                <line x1={slot.x} y1={50} x2={slot.x} y2={slot.y} stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                {/* Kotak persegi penanda area parkir slot */}
                <rect 
                  x={slot.x - 6} 
                  y={slot.y === 30 ? 15 : 65} 
                  width="12" 
                  height="20" 
                  rx="1"
                  fill={slot.isTarget ? (isParked ? "rgba(16,185,129,0.4)" : "rgba(74,222,128,0.2)") : "rgba(30,41,59,0.8)"}
                  stroke={slot.isTarget ? (isParked ? "#10b981" : "#4ade80") : "rgba(100,116,139,0.5)"}
                  strokeWidth={slot.isTarget ? "1.5" : "0.5"}
                  className={slot.isTarget ? "pulse-glow" : ""}
                />
                {/* Label teks identitas ID slot parkir */}
                <text 
                  x={slot.x} 
                  y={slot.y === 30 ? 26 : 76} 
                  fontSize="3" 
                  fill={slot.isTarget ? (isParked ? "#10b981" : "#4ade80") : "#64748b"} 
                  textAnchor="middle" 
                  fontFamily="Space Grotesk" 
                  fontWeight="bold"
                >
                  {slot.id}
                </text>
              </g>
            ))}

            {/* Titik lingkaran penanda posisi gerbang masuk utama (GATE) */}
            <circle cx="0" cy="50" r="3" fill="#0ea5e9" stroke="#38bdf8" strokeWidth="1" />
            <text x="0" y="56" fontSize="3" fill="#38bdf8" textAnchor="middle" fontWeight="bold">GATE</text>

            {/* Jalur rute lintasan A* bercahaya hijau dari gerbang menuju slot parkir tujuan */}
            {ruteKoordinat && ruteKoordinat.length > 0 && (
              <path 
                className="glowing-route" 
                d={buildSvgPath()} 
                fill="none" 
                stroke="#4ade80" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2"
              />
            )}
          </svg>

          {/* Ikon penunjuk mobil navigasi yang bergerak otomatis menyusuri lintasan SVG */}
          {ruteKoordinat && ruteKoordinat.length > 0 && (
            <div className="absolute car-anim w-4 h-4 rounded-full bg-white shadow-[0_0_10px_white] z-50 pointer-events-none flex items-center justify-center mix-blend-screen" style={{ marginTop: '-2px', marginLeft: '-2px' }}>
                <span className="material-symbols-outlined text-green-500 text-[10px]">my_location</span>
            </div>
          )}

        </div>
      </main>

      {/* Bagian bawah antarmuka yang menampilkan status kedatangan atau kotak bantuan webhook simulasi */}
      <footer className="w-full pb-6 pt-2 flex flex-col items-center gap-3 relative z-10 px-6">
        {/* Kondisi percabangan tampilan footer: apakah kendaraan sudah tiba atau masih dalam perjalanan */}
        {isParked ? (
          // Kondisi 1: Tampilan konfirmasi kendaraan telah terdeteksi parkir di slot
          <div className="w-full max-w-4xl bg-emerald-500/20 border border-emerald-400/60 text-emerald-300 py-3.5 px-6 rounded-2xl flex items-center justify-between shadow-[0_0_25px_rgba(16,185,129,0.3)] backdrop-blur-xl animate-fade-in">
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-3xl text-emerald-400">check_circle</span>
              <div>
                <div className="text-lg font-bold">KENDARAAN TELAH TIBA DI SLOT {targetSlot}!</div>
                <div className="text-xs text-emerald-200/80">
                  Waktu tempuh aktual: <strong>{elapsedSeconds} detik</strong> ({formatTime(elapsedSeconds)} menit) telah dicatat ke database & diakumulasikan ke metrik reduksi CO2.
                </div>
              </div>
            </div>
            {/* Tombol kembali ke beranda setelah selesai parkir */}
            <button
              onClick={() => navigate(jalurKembali)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-5 py-2 rounded-xl text-sm transition-all shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <span>Selesai (Kembali)</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        ) : (
          // Kondisi 2: Tampilan instruksi mengikuti rute dan kotak bantuan pengujian sensor webhook
          <div className="w-full max-w-4xl flex flex-col gap-2">
            <div className="bg-green-500/20 border border-green-400/50 text-green-300 py-2.5 px-6 rounded-2xl flex items-center justify-between shadow-[0_0_20px_rgba(74,222,128,0.2)] backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-2xl animate-bounce" style={{ fontVariationSettings: "'FILL' 1" }}>arrow_forward</span>
                <span className="text-lg font-bold tracking-wider">SILAKAN IKUTI RUTE HIJAU MENUJU {targetSlot}</span>
              </div>
              <div className="flex items-center gap-2 text-xs bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-700/80">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                <span>Waktu berjalan: <strong className="text-amber-300 font-mono text-sm">{formatTime(elapsedSeconds)}</strong></span>
              </div>
            </div>

            {/* Kotak bantuan pengembang berisikan perintah cURL webhook untuk simulasi sensor parkir */}
            <div className="bg-slate-900/80 border border-slate-700/70 rounded-xl px-4 py-2 flex items-center justify-between gap-4 text-xs backdrop-blur-md">
              <div className="flex items-center gap-2 overflow-hidden text-slate-300">
                <span className="material-symbols-outlined text-sky-400 text-sm">terminal</span>
                <span className="text-slate-400 font-['Space_Grotesk'] font-semibold shrink-0">cURL Webhook:</span>
                <code className="text-sky-300 font-mono truncate bg-black/40 px-2 py-0.5 rounded border border-slate-800">
                  {curlCommand}
                </code>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {/* Tombol salin perintah cURL */}
                <button
                  onClick={copyCurl}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1 rounded-lg border border-slate-600 transition-colors flex items-center gap-1 cursor-pointer font-['Space_Grotesk']"
                  title="Salin Perintah cURL"
                >
                  <span className="material-symbols-outlined text-xs">{copied ? "done" : "content_copy"}</span>
                  <span>{copied ? "Tersalin!" : "Salin"}</span>
                </button>
                {/* Tombol memicu webhook langsung dari antarmuka web */}
                <button
                  onClick={triggerWebhookDirectly}
                  className="bg-sky-600 hover:bg-sky-500 text-white px-3 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer font-['Space_Grotesk'] font-semibold shadow-sm"
                  title="Klik untuk simulasi tiba tanpa buka terminal"
                >
                  <span className="material-symbols-outlined text-xs">sensors</span>
                  <span>Simulasi Tiba (Sensor)</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </footer>
    </div>
  );
}
