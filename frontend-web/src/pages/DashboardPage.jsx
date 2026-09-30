import { useState } from 'react';
import AppLayout from '../components/AppLayout';

// Data dummy slot parkir - nanti diganti dari WebSocket/API
const ROWS = ['A', 'B', 'C'];
const COLS = Array.from({ length: 10 }, (_, i) => String(i + 1).padStart(2, '0'));

const DUMMY_STATUS = {
  'A01': 'occupied', 'A02': 'occupied', 'A03': 'empty', 'A04': 'reserved',
  'A05': 'empty', 'A06': 'occupied', 'A07': 'occupied', 'A08': 'occupied',
  'A09': 'occupied', 'A10': 'occupied',
  'B01': 'empty', 'B02': 'anomaly', 'B03': 'occupied', 'B04': 'occupied',
  'B05': 'occupied', 'B06': 'empty', 'B07': 'empty', 'B08': 'reserved',
  'B09': 'occupied', 'B10': 'occupied',
  'C01': 'occupied', 'C02': 'occupied', 'C03': 'occupied', 'C04': 'occupied',
  'C05': 'anomaly', 'C06': 'occupied', 'C07': 'reserved', 'C08': 'empty',
  'C09': 'empty', 'C10': 'occupied',
};

const SLOT_STYLES = {
  occupied: 'bg-eco-success/20 border border-eco-success text-eco-success',
  reserved: 'bg-warning-reserved/20 border border-warning-reserved text-warning-reserved',
  empty: 'border border-outline border-dashed text-outline',
  anomaly: 'bg-alert-anomaly/20 border-2 border-alert-anomaly text-alert-anomaly pulse-anomaly cursor-pointer hover:bg-alert-anomaly/30 group relative',
};

const ALERTS = [
  { id: 1, slot: 'B02', type: 'UNAUTHORIZED', time: '10:42 AM', desc: 'Vehicle parked in reserved slot without active session.', extra: 'Plate: UNK-442', action: 'Acknowledge', resolved: false },
  { id: 2, slot: 'C05', type: 'SENSOR ERROR', time: '10:15 AM', desc: 'Ultrasonic sensor offline. Visual verification required.', extra: 'HW-ID: US-992', action: 'Dispatch', resolved: false },
  { id: 3, slot: 'Gate N1', type: 'OCR MISMATCH', time: '09:12 AM', desc: 'Resolved by Officer JD.', extra: '', action: '', resolved: true },
];

export default function DashboardPage() {
  const [alerts, setAlerts] = useState(ALERTS);

  const handleAcknowledge = (id) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, resolved: true } : a));
  };

  return (
    <AppLayout breadcrumb="Field Operations">
      <style>{`
        .pulse-anomaly { animation: pulse-red 2s infinite; }
        @keyframes pulse-red {
          0% { box-shadow: 0 0 0 0 rgba(255,69,0,0.7); border-color: #FF4500; }
          70% { box-shadow: 0 0 0 10px rgba(255,69,0,0); border-color: transparent; }
          100% { box-shadow: 0 0 0 0 rgba(255,69,0,0); border-color: #FF4500; }
        }
      `}</style>

      <div className="p-6 grid grid-cols-12 gap-4 bg-background min-h-full">

        {/* LEFT: Interactive Map */}
        <div className="col-span-12 xl:col-span-8 flex flex-col gap-4">
          <div className="bg-bg-primary rounded-xl border border-surface-variant p-5 flex flex-col">

            {/* Map Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-xl text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">map</span>
                Sector Alpha Map
              </h2>
              <div className="flex gap-4 text-sm font-mono">
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-eco-success rounded-sm"></div>Occupied</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-warning-reserved rounded-sm"></div>Reserved</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 border border-outline rounded-sm"></div>Empty</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-alert-anomaly rounded-sm pulse-anomaly"></div>Anomaly</div>
              </div>
            </div>

            {/* Slot Grid */}
            <div className="bg-surface-container-lowest rounded-lg border border-surface-variant p-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none opacity-30"></div>
              <div className="grid grid-cols-10 gap-2 relative z-10">
                {ROWS.map(row => (
                  <>
                    {COLS.map(col => {
                      const id = `${row}${col}`;
                      const status = DUMMY_STATUS[id] || 'empty';
                      return (
                        <div
                          key={id}
                          className={`h-10 rounded flex items-center justify-center font-mono text-xs relative ${SLOT_STYLES[status]}`}
                        >
                          {id}
                          {status === 'anomaly' && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-surface-container-high border border-alert-anomaly p-3 rounded shadow-lg hidden group-hover:block z-50 text-left">
                              <p className="text-xs text-alert-anomaly font-bold mb-1">UNAUTHORIZED</p>
                              <p className="text-xs text-on-surface-variant font-mono">Plate: UNK-442</p>
                              <p className="text-xs text-on-surface-variant font-mono">Duration: 12m</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    <div key={`${row}-separator`} className="col-span-10 flex items-center justify-center text-outline-variant font-mono text-xs py-1.5 border-y border-surface-variant my-1">
                      DRIVEWAY {row === 'A' ? 'ALPHA' : row === 'B' ? 'BETA' : 'GAMMA'}
                    </div>
                  </>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Alerts + OCR Feed */}
        <div className="col-span-12 xl:col-span-4 flex flex-col gap-4">

          {/* Active Alerts */}
          <div className="bg-bg-primary rounded-xl border border-surface-variant p-5 flex flex-col flex-1">
            <div className="flex justify-between items-center mb-4 border-b border-surface-variant pb-3">
              <h2 className="font-semibold text-lg text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-alert-anomaly">warning</span>
                Active Alerts
              </h2>
              <span className="bg-error-container text-on-error-container px-2 py-0.5 rounded text-xs font-bold">
                {alerts.filter(a => !a.resolved).length} Critical
              </span>
            </div>
            <div className="flex flex-col gap-3 overflow-y-auto pr-1">
              {alerts.map(alert => (
                <div
                  key={alert.id}
                  className={`border-l-4 p-3 rounded shadow-sm transition-colors ${
                    alert.resolved
                      ? 'bg-surface-container border-outline-variant opacity-60'
                      : 'bg-surface-container border-alert-anomaly hover:bg-surface-container-high'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={`font-mono text-sm font-bold ${alert.resolved ? 'text-on-surface-variant line-through' : 'text-alert-anomaly'}`}>
                      SLOT {alert.slot} - {alert.type}
                    </span>
                    <span className="text-xs text-on-surface-variant font-mono">{alert.time}</span>
                  </div>
                  <p className="text-xs text-on-surface mb-2">{alert.desc}</p>
                  {!alert.resolved && alert.action && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono text-outline">{alert.extra}</span>
                      <button
                        onClick={() => handleAcknowledge(alert.id)}
                        className="bg-alert-anomaly hover:bg-alert-anomaly/80 text-white px-3 py-1.5 rounded text-xs font-bold transition-colors"
                      >
                        {alert.action}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Live Gate Monitor */}
          <div className="bg-bg-primary rounded-xl border border-surface-variant p-5 flex flex-col h-64">
            <h2 className="font-semibold text-lg text-on-surface flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-primary">videocam</span>
              Live Gate Monitor
            </h2>
            <div className="relative flex-1 bg-surface-container-lowest rounded overflow-hidden border border-surface-variant">
              {/* Simulated CCTV look */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#1a2830] via-[#0e1418] to-[#1a1f24] flex items-center justify-center">
                <span className="material-symbols-outlined text-[80px] text-surface-variant opacity-30">local_parking</span>
              </div>
              {/* HUD Top */}
              <div className="absolute top-2 left-2 flex items-center gap-2 z-10">
                <div className="w-2 h-2 bg-alert-anomaly rounded-full animate-pulse"></div>
                <span className="font-mono text-xs text-white bg-black/50 px-1 rounded">CAM-GATE-S1</span>
              </div>
              {/* HUD Bottom */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm p-2 border-t border-primary/30 flex justify-between items-center z-10">
                <div className="font-mono">
                  <span className="text-xs text-outline block">Last Read:</span>
                  <span className="text-primary font-bold tracking-widest text-sm">XYZ-7890</span>
                </div>
                <span className="text-eco-success text-xs font-bold border border-eco-success px-2 py-0.5 rounded">MATCHED</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
