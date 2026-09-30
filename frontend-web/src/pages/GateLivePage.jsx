import AppLayout from '../components/AppLayout';

// Data dummy aktivitas gate - nanti diganti dari WebSocket
const CAMERAS = [
  { id: 'cam1', label: 'Entry-Mobil (A)', plate: 'B 1234 XYZ', confidence: '98.5%', status: 'LUNAS', statusType: 'success' },
  { id: 'cam2', label: 'Entry-Motor (B)', plate: 'D 5678 KLO', confidence: '95.2%', status: 'LUNAS', statusType: 'success' },
  { id: 'cam3', label: 'Exit-Mobil', plate: 'AB 9012 DEF', confidence: '-', status: 'SALDO KURANG', statusType: 'anomaly' },
  { id: 'cam4', label: 'Exit-Motor', plate: null, confidence: null, status: 'IDLE', statusType: 'idle' },
];

const ACTIVITY = [
  { time: '14:02:45', plate: 'B 1234 XYZ', gate: 'Entry-Mobil (A)', result: 'SUCCESS', anomaly: false },
  { time: '14:01:12', plate: 'AB 9012 DEF', gate: 'Exit-Mobil', result: 'SALDO KURANG', anomaly: true },
  { time: '13:58:30', plate: 'D 5678 KLO', gate: 'Entry-Motor (B)', result: 'SUCCESS', anomaly: false },
  { time: '13:55:05', plate: 'L 9988 MN', gate: 'Exit-Mobil', result: 'SUCCESS', anomaly: false },
  { time: '13:50:22', plate: 'AG 3344 TY', gate: 'Entry-Mobil (A)', result: 'SUCCESS', anomaly: false },
];

const statusStyles = {
  success: { label: 'E-Toll LUNAS', cls: 'bg-eco-success/20 text-eco-success border border-eco-success/30', dot: 'bg-eco-success', border: 'border-outline-variant' },
  anomaly: { label: 'SALDO KURANG', cls: 'bg-alert-anomaly/20 text-alert-anomaly border border-alert-anomaly/30 animate-pulse', dot: 'bg-alert-anomaly', border: 'border-alert-anomaly/50' },
  idle: { label: 'IDLE', cls: 'bg-surface-variant text-on-surface-variant border border-outline-variant', dot: 'bg-outline-variant', border: 'border-outline-variant' },
};

function CameraCard({ cam }) {
  const style = statusStyles[cam.statusType];
  return (
    <div className={`relative bg-black rounded-lg border overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] ${style.border} ${cam.statusType === 'anomaly' ? 'shadow-[inset_0_0_20px_rgba(255,69,0,0.1)]' : ''}`}>
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a2830] via-[#0e1418] to-[#1a1f24] flex items-center justify-center">
        {cam.plate
          ? <span className="material-symbols-outlined text-[80px] text-surface-variant opacity-20">local_parking</span>
          : <span className="material-symbols-outlined text-[80px] text-text-muted opacity-20">videocam_off</span>
        }
      </div>
      {cam.statusType === 'anomaly' && <div className="absolute inset-0 bg-alert-anomaly/10 pointer-events-none"></div>}

      {/* Top HUD */}
      <div className="absolute top-0 left-0 w-full p-3 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent z-10">
        <div className="flex items-center gap-2">
          <span className={`material-symbols-outlined text-sm ${cam.statusType === 'anomaly' ? 'text-alert-anomaly' : cam.plate ? 'text-system-info' : 'text-text-muted'}`}>videocam</span>
          <span className={`font-mono text-xs font-bold tracking-widest ${cam.statusType === 'anomaly' ? 'text-alert-anomaly' : cam.plate ? 'text-system-info' : 'text-text-muted'}`}>{cam.label}</span>
        </div>
        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider backdrop-blur-sm flex items-center gap-1 ${style.cls}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>
          {cam.status}
        </span>
      </div>

      {/* Bottom HUD */}
      <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black via-black/80 to-transparent z-10">
        {cam.plate ? (
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] text-text-muted font-mono uppercase tracking-widest mb-1">
                {cam.statusType === 'anomaly' ? 'Detected Plate' : 'Detected Plate'}
              </p>
              <p className={`font-mono text-2xl font-bold tracking-widest drop-shadow-lg ${cam.statusType === 'anomaly' ? 'text-alert-anomaly' : 'text-primary'}`}>
                {cam.plate}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-text-muted font-mono uppercase tracking-widest mb-1">
                {cam.statusType === 'anomaly' ? 'Action Required' : 'Confidence'}
              </p>
              {cam.statusType === 'anomaly'
                ? <button className="bg-alert-anomaly text-white px-2 py-1 rounded text-xs font-mono font-bold">OVERRIDE</button>
                : <p className="font-mono text-sm text-eco-success">{cam.confidence}</p>
              }
            </div>
          </div>
        ) : (
          <p className="font-mono text-xs text-text-muted tracking-widest text-center">WAITING FOR VEHICLE...</p>
        )}
      </div>

      {/* Scan HUD */}
      {cam.plate && (
        <div className="absolute inset-0 border-[0.5px] border-system-info/20 m-6 rounded pointer-events-none"></div>
      )}
    </div>
  );
}

export default function GateLivePage() {
  return (
    <AppLayout breadcrumb="Gate OCR Feed">
      <div className="p-6 bg-bg-surface flex flex-col gap-6 min-h-full">

        {/* Header */}
        <div className="flex justify-between items-end border-b border-surface-container-highest pb-4">
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight">Live OCR Feed</h1>
            <p className="text-text-muted font-mono text-sm mt-1">GATE_A_CLUSTER // REAL-TIME MONITORING</p>
          </div>
          <div className="flex gap-2">
            <button className="bg-surface-container-high hover:bg-surface-container-highest text-on-surface border border-outline-variant px-3 py-1.5 rounded text-sm font-mono transition-colors">EXPORT</button>
            <button className="bg-primary-container text-on-primary-container hover:brightness-110 px-3 py-1.5 rounded text-sm font-mono font-bold transition-all">REFRESH FEED</button>
          </div>
        </div>

        {/* Quad Camera Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 h-[600px]">
          {CAMERAS.map(cam => <CameraCard key={cam.id} cam={cam} />)}
        </div>

        {/* Activity Stream */}
        <div className="bg-surface-container rounded-xl border border-surface-container-highest p-5">
          <div className="flex justify-between items-center border-b border-surface-container-highest pb-3 mb-3">
            <h3 className="font-mono text-sm text-on-surface font-bold tracking-wider">Activity Stream</h3>
            <span className="text-xs text-text-muted font-mono">LIVE UPDATES</span>
          </div>
          <div className="flex flex-col gap-1">
            {ACTIVITY.map((act, i) => (
              <div key={i} className={`flex items-center justify-between py-2 border-b border-surface-container-lowest hover:bg-surface-container-high px-2 rounded transition-colors ${act.anomaly ? 'bg-alert-anomaly/5 border-l-2 border-l-alert-anomaly' : ''}`}>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-xs text-text-muted">{act.time}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-mono border ${act.anomaly ? 'text-alert-anomaly border-alert-anomaly/30 bg-surface-container-highest' : 'text-primary border-surface-variant bg-surface-container-highest'}`}>
                    {act.plate}
                  </span>
                  <span className="text-xs text-on-surface-variant">{act.gate}</span>
                </div>
                <span className={`text-xs font-mono ${act.anomaly ? 'text-alert-anomaly' : 'text-eco-success'}`}>{act.result}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
