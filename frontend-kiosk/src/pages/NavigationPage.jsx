import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useMemo } from 'react';

// ─── Konfigurasi Denah Parkir (harus sinkron dengan AlokasiRuteService.java) ────
// Slot ganjil = baris ATAS, slot genap = baris BAWAH
// Kolom 1–8 bersesuaian dengan Node N-1 s/d N-8 di backend
const TOTAL_COLS = 8; // N-1 s/d N-8
const ALL_SLOTS = Array.from({ length: 15 }, (_, i) => `B1-${String(i + 1).padStart(2, '0')}`);

// Ukuran kanvas (px) – harus sesuai dengan mapToSvg di bawah
const MAP_W = 860;
const MAP_H = 320;
const GATE_X = 40;
const CORRIDOR_Y = MAP_H / 2;      // Y = 160 → garis tengah koridor
const COL_SPACING = 96;             // Jarak antar kolom slot (px)
const COL_OFFSET = 120;             // X awal kolom pertama
const SLOT_ABOVE_Y = CORRIDOR_Y - 68; // Y baris atas
const SLOT_BELOW_Y = CORRIDOR_Y + 68; // Y baris bawah

// Mapping: id slot (B1-01 s/d B1-15) → koordinat pusat slot di kanvas
function getSlotCoord(slotLabel) {
  const num = parseInt(slotLabel.replace('B1-', ''), 10);
  const col = Math.ceil(num / 2);   // 1–2 → col1, 3–4 → col2, dst.
  const isOdd = num % 2 !== 0;
  return {
    x: COL_OFFSET + (col - 1) * COL_SPACING,
    y: isOdd ? SLOT_ABOVE_Y : SLOT_BELOW_Y,
  };
}

// Peta jalan: Gate-A → N-1 → ... → N-8, semua di Y = CORRIDOR_Y
function getCorridorX(nodeId) {
  if (nodeId === 'Gate-A') return GATE_X;
  const n = parseInt(nodeId.replace('N-', ''), 10);
  return COL_OFFSET + (n - 1) * COL_SPACING;
}

export default function NavigationPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const slotData   = location.state?.slotData;
  const platNomor  = location.state?.platNomor || 'Unknown';
  const slotId     = slotData?.slotDialokasikan || '---';
  const idTransaksi = slotData?.idTransaksi || '000';
  const jalur      = slotData?.jalurRuteGraf || [];

  // ─── Bangun string path SVG dari array koordinat backend ───────────────────
  const { pathD, routeLen } = useMemo(() => {
    if (!jalur || jalur.length === 0) return { pathD: '', routeLen: 0 };

    // Backend mengirimkan titik-titik (Gate-A, N-1, …, NODE_B1_x)
    // Kita mapping ID-nya ke koordinat kanvas kita
    const points = jalur.map(titik => {
      const id = titik.id || '';
      if (id === 'Gate-A') return { x: GATE_X, y: CORRIDOR_Y };
      if (id.startsWith('N-'))  return { x: getCorridorX(id), y: CORRIDOR_Y };
      // Slot node: NODE_B1_1 s/d NODE_B1_15 → konversi ke "B1-01" format
      if (id.startsWith('NODE_B1_')) {
        const num  = parseInt(id.replace('NODE_B1_', ''), 10);
        const label = `B1-${String(num).padStart(2, '0')}`;
        return getSlotCoord(label);
      }
      return { x: titik.x * 5, y: titik.y * 3 }; // fallback koordinat backend mentah
    });

    const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    // Perkiraan panjang rute agar animasi dash tepat
    const approxLen = points.reduce((acc, p, i) => {
      if (i === 0) return 0;
      const prev = points[i - 1];
      return acc + Math.hypot(p.x - prev.x, p.y - prev.y);
    }, 0);
    return { pathD: d, routeLen: Math.ceil(approxLen) + 50 };
  }, [jalur]);

  // Auto-redirect ke halaman sukses setelah 10 detik
  useEffect(() => {
    const t = setTimeout(() => navigate('/success'), 10000);
    return () => clearTimeout(t);
  }, [navigate]);

  const targetCoord = slotId !== '---' ? getSlotCoord(slotId) : null;

  return (
    <div
      className="bg-[#070d12] h-screen w-screen flex flex-col overflow-hidden select-none"
      onClick={() => navigate('/success')}
    >
      <style>{`
        :root {
          --neon: #00e5ff;
          --green: #2ECC71;
          --green-glow: rgba(46,204,113,0.55);
          --slot-border: #1e3040;
          --slot-bg: #0c1922;
          --corridor-bg: rgba(0,229,255,0.06);
        }

        /* Scan-line overlay */
        .scanline::after {
          content: '';
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0,0,0,0.18) 2px,
            rgba(0,0,0,0.18) 4px
          );
          pointer-events: none;
          z-index: 50;
        }

        /* Animasi garis rute */
        .route-line {
          stroke-dasharray: var(--route-len, 3000);
          stroke-dashoffset: var(--route-len, 3000);
          animation: drawRoute 3.5s cubic-bezier(.4,0,.2,1) forwards;
          filter: drop-shadow(0 0 8px var(--green)) drop-shadow(0 0 2px #fff);
        }
        @keyframes drawRoute { to { stroke-dashoffset: 0; } }

        /* Pulsing gate dot */
        .gate-pulse {
          animation: gatePulse 1.6s ease-in-out infinite;
        }
        @keyframes gatePulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(0,229,255,.7), 0 0 12px rgba(0,229,255,.4); }
          60%      { box-shadow: 0 0 0 10px rgba(0,229,255,0), 0 0 20px rgba(0,229,255,.6); }
        }

        /* Destination slot blink */
        .dest-slot {
          animation: destBlink 1.2s ease-in-out infinite;
        }
        @keyframes destBlink {
          0%,100% { box-shadow: 0 0 0 0 var(--green-glow), inset 0 0 12px var(--green-glow); border-color: var(--green); }
          50%      { box-shadow: 0 0 18px 6px var(--green-glow), inset 0 0 24px var(--green-glow); border-color: #a7f3c0; }
        }

        /* Footer bar glow */
        .footer-glow {
          animation: footerGlow 2s ease-in-out infinite;
        }
        @keyframes footerGlow {
          0%,100% { box-shadow: 0 0 20px 4px var(--green-glow); }
          50%      { box-shadow: 0 0 40px 12px var(--green-glow); }
        }
      `}</style>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="flex justify-between items-center w-full px-6 py-3 border-b border-[#0e2030] bg-[#050b10] z-10 shrink-0">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[var(--neon)] text-xl">table_chart</span>
          <span className="font-mono font-bold tracking-widest text-[var(--neon)] text-sm">PETA ALOKASI A* GRAPH</span>
        </div>
        <div className="font-mono text-sm bg-[#0c1922] border border-[#1e3040] px-4 py-1.5 rounded text-white">
          Plat: <span className="text-[var(--neon)]">{platNomor}</span>
          &nbsp;|&nbsp;Menuju: <span className="text-[var(--green)] font-bold">{slotId}</span>
        </div>
      </header>

      {/* ── Map Canvas ─────────────────────────────────────────────────── */}
      <main className="flex-1 flex items-center justify-center overflow-hidden relative scanline">
        {/* Subtle grid bg */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'linear-gradient(#0e2030 1px,transparent 1px),linear-gradient(90deg,#0e2030 1px,transparent 1px)', backgroundSize: '48px 48px' }} />

        {/* Map card */}
        <div
          className="relative rounded-xl border border-[#0e2030] bg-[#080f16] shadow-2xl overflow-visible"
          style={{ width: MAP_W + 40, padding: '24px 20px 24px 20px' }}
        >

          {/* ─ SVG Overlay: corridor + route ─────────────────── */}
          <svg
            style={{ position: 'absolute', left: 20, top: 24, width: MAP_W, height: MAP_H, pointerEvents: 'none', zIndex: 10 }}
            viewBox={`0 0 ${MAP_W} ${MAP_H}`}
          >
            {/* Corridor shadow band */}
            <rect x={GATE_X - 16} y={CORRIDOR_Y - 22} width={MAP_W - GATE_X + 16} height={44}
              rx="8" fill="rgba(0,229,255,0.04)" />

            {/* Corridor dashed guideline */}
            <line x1={GATE_X} y1={CORRIDOR_Y} x2={MAP_W - 10} y2={CORRIDOR_Y}
              stroke="#0e2a3a" strokeWidth="2" strokeDasharray="6 6" />

            {/* Vertical connectors from corridor to each slot column */}
            {Array.from({ length: TOTAL_COLS }, (_, ci) => {
              const cx = COL_OFFSET + ci * COL_SPACING;
              return (
                <g key={ci}>
                  <line x1={cx} y1={CORRIDOR_Y - 20} x2={cx} y2={SLOT_ABOVE_Y + 26}
                    stroke="#0e2a3a" strokeWidth="1.5" />
                  {ci < 7 && (
                    <line x1={cx} y1={CORRIDOR_Y + 20} x2={cx} y2={SLOT_BELOW_Y - 26}
                      stroke="#0e2a3a" strokeWidth="1.5" />
                  )}
                </g>
              );
            })}

            {/* ── Glowing Route from backend ────────────────── */}
            {pathD && (
              <path
                className="route-line"
                d={pathD}
                fill="none"
                stroke="var(--green)"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ '--route-len': routeLen }}
              />
            )}
          </svg>

          {/* ─ Layout HTML: Gate + Slots ──────────────────────────────── */}
          <div style={{ position: 'relative', width: MAP_W, height: MAP_H }}>

            {/* Gate marker */}
            <div style={{ position: 'absolute', left: GATE_X - 18, top: CORRIDOR_Y - 18, zIndex: 20 }}
              className="flex flex-col items-center">
              <div className="gate-pulse w-9 h-9 rounded-full bg-[var(--neon)]/20 border-2 border-[var(--neon)] flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-[var(--neon)]" />
              </div>
              <span className="font-mono text-[9px] text-[var(--neon)] mt-1 tracking-widest">GATE</span>
            </div>

            {/* Slot grid */}
            {ALL_SLOTS.map((label) => {
              const { x, y } = getSlotCoord(label);
              const isTarget = label === slotId;
              return (
                <div
                  key={label}
                  style={{
                    position: 'absolute',
                    left: x - 28,
                    top: y - 32,
                    width: 56,
                    height: 64,
                    zIndex: 20,
                  }}
                  className={`
                    flex flex-col items-center justify-center rounded-md border font-mono text-[11px] font-bold
                    transition-all duration-300
                    ${isTarget
                      ? 'dest-slot bg-[var(--green)]/15 text-[var(--green)] border-[var(--green)]'
                      : 'bg-[var(--slot-bg)] text-[#3a6070] border-[var(--slot-border)] hover:border-[#1e4060]'
                    }
                  `}
                >
                  {isTarget && (
                    <span className="material-symbols-outlined text-[14px] mb-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
                      location_on
                    </span>
                  )}
                  <span className={isTarget ? 'text-[var(--green)]' : 'text-[#3a6070]'}>{label}</span>
                </div>
              );
            })}

          </div>{/* end layout div */}
        </div>{/* end map card */}
      </main>

      {/* ── Footer CTA ─────────────────────────────────────────────────── */}
      <footer className="shrink-0 flex justify-center items-center pb-8 pt-4 bg-[#050b10] z-10">
        <div className="footer-glow flex items-center gap-4 bg-[var(--green)]/90 text-white rounded-xl px-10 py-4 font-bold text-2xl tracking-widest uppercase">
          <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>arrow_forward</span>
          SILAKAN IKUTI RUTE HIJAU
        </div>
      </footer>
    </div>
  );
}
