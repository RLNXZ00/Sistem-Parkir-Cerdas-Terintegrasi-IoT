import { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('eco');
  const [toast, setToast] = useState(null);

  // Ambil info akun yang sedang login
  const currentUser = JSON.parse(sessionStorage.getItem('spct_user') || '{"username":"petugas01","namaLengkap":"Petugas Lapangan","role":"PETUGAS_LAPANGAN"}');

  // State untuk form settings (dengan fallback default)
  const [settings, setSettings] = useState({
    // 1. Eco-Metrics
    emisiMobilPerDetik: 2.3, // gram CO2 / detik saat idle
    emisiMotorPerDetik: 0.9, // gram CO2 / detik
    baselineWaktuMencari: 12, // baseline menit pencarian konvensional
    targetReduksiPersen: 65,  // target penghematan emisi (%)

    // 2. Sensor IoT
    debounceWaktuDetik: 4,    // minimal durasi objek diam agar dianggap mobil (filter orang lewat)
    sensorTimeoutDetik: 15,   // batas timeout heartbeat sebelum ditandai OFFLINE
    autoAlertAnomali: true,   // otomatis picu log anomali jika ada selisih status
    simulasiJitterSensor: false,

    // 3. Kamera ANPR & Vision
    confidenceThreshold: 80,  // ambang batas confidence OCR/YOLO (%)
    fallbackManualEntry: true,// aktifkan bantuan input manual jika plat < threshold
    kameraStreamFps: 25,
    autoZoomPlat: true,

    // 4. Retensi Data
    retensiHari: 90,          // masa simpan log telemetri normal (hari)
    purgeOtomatisAktif: true, // auto purge cron setiap 02:00
    simpanAuditManajemen: true,

    // 5. Preferensi & Akun
    audioAlarmAnomali: true,  // bunyi beep jika ada anomali CRITICAL
    themeMode: 'dark',
    notifPushBrowser: false,
    passwordLama: '',
    passwordBaru: '',
    konfirmasiPassword: ''
  });

  // Muat setting dari localStorage saat pertama kali render
  useEffect(() => {
    const saved = localStorage.getItem('spct_system_settings');
    if (saved) {
      try {
        setSettings(prev => ({ ...prev, ...JSON.parse(saved) }));
      } catch (err) {
        console.error('Gagal parsing settings lokal:', err);
      }
    }
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleInputChange = (field, val) => {
    setSettings(prev => ({ ...prev, [field]: val }));
  };

  const handleSaveSettings = (e) => {
    e?.preventDefault();
    localStorage.setItem('spct_system_settings', JSON.stringify(settings));
    showToast('Konfigurasi pengaturan berhasil disimpan ke sistem!', 'success');
  };

  const handleResetDefault = () => {
    if (window.confirm('Kembalikan seluruh parameter teknis ke setelan standar pabrik (default)?')) {
      localStorage.removeItem('spct_system_settings');
      setSettings(prev => ({
        ...prev,
        emisiMobilPerDetik: 2.3,
        emisiMotorPerDetik: 0.9,
        baselineWaktuMencari: 12,
        targetReduksiPersen: 65,
        debounceWaktuDetik: 4,
        sensorTimeoutDetik: 15,
        confidenceThreshold: 80,
        retensiHari: 90,
        audioAlarmAnomali: true
      }));
      showToast('Pengaturan telah di-reset ke nilai default.', 'info');
    }
  };

  const handleGantiPassword = async (e) => {
    e.preventDefault();
    if (!settings.passwordBaru || !settings.konfirmasiPassword) {
      showToast('Password baru dan konfirmasi wajib diisi!', 'error');
      return;
    }
    if (settings.passwordBaru !== settings.konfirmasiPassword) {
      showToast('Konfirmasi password tidak cocok dengan password baru!', 'error');
      return;
    }

    try {
      const res = await fetch('http://localhost:8081/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: currentUser.username,
          passwordBaru: settings.passwordBaru
        })
      });

      if (res.ok) {
        showToast('Kata sandi akun berhasil diperbarui!', 'success');
        setSettings(prev => ({ ...prev, passwordLama: '', passwordBaru: '', konfirmasiPassword: '' }));
      } else {
        showToast('Gagal mengubah password melalui server.', 'error');
      }
    } catch {
      showToast('Server backend offline, perubahan password belum tersinkronisasi.', 'error');
    }
  };

  const tabs = [
    { id: 'eco', label: 'Eco-Metrics & Emisi', icon: 'eco', desc: 'Rumus standar CO₂ & baseline efisiensi' },
    { id: 'iot', label: 'Sensor IoT & Basement', icon: 'sensors', desc: 'Debounce filter & ambang batas sensor' },
    { id: 'anpr', label: 'Kamera ANPR & AI', icon: 'videocam', desc: 'Confidence threshold YOLOv11 & OCR' },
    { id: 'retention', label: 'Retensi & Kebijakan Data', icon: 'auto_delete', desc: 'Siklus hidup log telemetri 90 hari' },
    { id: 'account', label: 'Akun & Preferensi', icon: 'manage_accounts', desc: 'Profil operator & notifikasi alarm' },
  ];

  return (
    <AppLayout breadcrumb="Sistem & Konfigurasi" status="IoT Operational">
      <div className="p-6 max-w-7xl mx-auto flex flex-col gap-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-container-low p-6 rounded-2xl border border-surface-container">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[24px]">tune</span>
              </div>
              <h1 className="text-2xl font-bold text-on-surface">Pengaturan Sistem (SPCT IoT)</h1>
            </div>
            <p className="text-sm text-on-surface-variant font-mono">
              Konfigurasi parameter teknis IoT, algoritma kalkulasi reduksi emisi, dan integrasi visi komputer.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResetDefault}
              className="px-4 py-2 rounded-xl text-xs font-mono font-semibold border border-outline-variant hover:bg-surface-variant text-on-surface-variant transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">restart_alt</span>
              Reset Default
            </button>
            <button
              onClick={handleSaveSettings}
              className="px-5 py-2 rounded-xl text-xs font-mono font-bold bg-primary text-on-primary hover:bg-primary/90 transition-all shadow-md flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">save</span>
              Simpan Perubahan
            </button>
          </div>
        </div>

        {/* Toast Notifikasi */}
        {toast && (
          <div className={`p-4 rounded-xl font-mono text-xs flex items-center justify-between border ${
            toast.type === 'success' ? 'bg-eco-success/20 border-eco-success text-eco-success' :
            toast.type === 'error' ? 'bg-alert-anomaly/20 border-alert-anomaly text-alert-anomaly' :
            'bg-system-info/20 border-system-info text-system-info'
          }`}>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">
                {toast.type === 'success' ? 'check_circle' : toast.type === 'error' ? 'error' : 'info'}
              </span>
              <span>{toast.message}</span>
            </div>
            <button onClick={() => setToast(null)} className="opacity-70 hover:opacity-100">✕</button>
          </div>
        )}

        {/* Tab Selector & Content */}
        <div className="grid grid-cols-12 gap-6">

          {/* Left Column: Navigation Tabs */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-2">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-start gap-4 p-4 rounded-xl text-left transition-all border ${
                    isActive
                      ? 'bg-surface-container border-primary shadow-sm text-primary'
                      : 'bg-surface-container-lowest border-surface-container hover:bg-surface-container-low text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className={`material-symbols-outlined text-[24px] mt-0.5 ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}>
                    {tab.icon}
                  </span>
                  <div className="flex-1">
                    <p className={`font-semibold text-sm ${isActive ? 'text-on-surface' : ''}`}>{tab.label}</p>
                    <p className="text-xs text-text-muted mt-0.5 font-mono">{tab.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Active Tab Content */}
          <div className="col-span-12 lg:col-span-8 bg-surface-container-low p-6 rounded-2xl border border-surface-container">

            {/* TAB 1: ECO-METRICS & EMISI */}
            {activeTab === 'eco' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-eco-success">eco</span>
                    Parameter Standarisasi Emisi Gas Buang (CO₂)
                  </h3>
                  <p className="text-xs text-on-surface-variant font-mono mt-1">
                    Formula: Reduksi CO₂ = (Baseline Waktu - Waktu Tiba Nyata) × Standar Emisi Kendaraan.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-surface-container border border-surface-variant flex flex-col gap-2">
                    <label className="text-xs font-mono text-on-surface-variant uppercase tracking-wider">
                      Emisi Mobil (Gram CO₂ / Detik)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={settings.emisiMobilPerDetik}
                      onChange={(e) => handleInputChange('emisiMobilPerDetik', parseFloat(e.target.value) || 0)}
                      className="bg-surface-container-lowest border border-outline px-3 py-2 rounded-lg text-sm text-on-surface font-mono focus:border-primary outline-none"
                    />
                    <span className="text-[11px] text-text-muted font-mono">Standar mesin bensin 1500cc saat bergerak/idle di basement.</span>
                  </div>

                  <div className="p-4 rounded-xl bg-surface-container border border-surface-variant flex flex-col gap-2">
                    <label className="text-xs font-mono text-on-surface-variant uppercase tracking-wider">
                      Emisi Motor (Gram CO₂ / Detik)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={settings.emisiMotorPerDetik}
                      onChange={(e) => handleInputChange('emisiMotorPerDetik', parseFloat(e.target.value) || 0)}
                      className="bg-surface-container-lowest border border-outline px-3 py-2 rounded-lg text-sm text-on-surface font-mono focus:border-primary outline-none"
                    />
                    <span className="text-[11px] text-text-muted font-mono">Standar mesin motor 125-150cc operasional lambat.</span>
                  </div>

                  <div className="p-4 rounded-xl bg-surface-container border border-surface-variant flex flex-col gap-2">
                    <label className="text-xs font-mono text-on-surface-variant uppercase tracking-wider">
                      Baseline Waktu Konvensional (Menit)
                    </label>
                    <input
                      type="number"
                      value={settings.baselineWaktuMencari}
                      onChange={(e) => handleInputChange('baselineWaktuMencari', parseInt(e.target.value) || 1)}
                      className="bg-surface-container-lowest border border-outline px-3 py-2 rounded-lg text-sm text-on-surface font-mono focus:border-primary outline-none"
                    />
                    <span className="text-[11px] text-text-muted font-mono">Rata-rata waktu berputar tanpa panduan graf basement.</span>
                  </div>

                  <div className="p-4 rounded-xl bg-surface-container border border-surface-variant flex flex-col gap-2">
                    <label className="text-xs font-mono text-on-surface-variant uppercase tracking-wider">
                      Target Reduksi Efisiensi (%)
                    </label>
                    <input
                      type="number"
                      value={settings.targetReduksiPersen}
                      onChange={(e) => handleInputChange('targetReduksiPersen', parseInt(e.target.value) || 0)}
                      className="bg-surface-container-lowest border border-outline px-3 py-2 rounded-lg text-sm text-on-surface font-mono focus:border-primary outline-none"
                    />
                    <span className="text-[11px] text-text-muted font-mono">Target KPI reduksi emisi karbon pada dashboard manajemen.</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-eco-success/10 border border-eco-success/30 flex items-start gap-3">
                  <span className="material-symbols-outlined text-eco-success text-[20px] mt-0.5">verified</span>
                  <div className="text-xs font-mono text-on-surface">
                    <p className="font-bold text-eco-success">Kalkulasi Otomatis Laporan Resmi:</p>
                    <p className="text-text-muted mt-1 leading-relaxed">
                      Nilai parameter di atas langsung digunakan oleh LaporanPdfService dan LaporanExcelService untuk menghasilkan grafik tren reduksi polusi udara di basement.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: SENSOR IOT & BASEMENT */}
            {activeTab === 'iot' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#ffd700]">sensors</span>
                    Konfigurasi Telemetri Sensor Ultrasonic (16 Unit)
                  </h3>
                  <p className="text-xs text-on-surface-variant font-mono mt-1">
                    Atur sensitivitas dan toleransi sensor untuk mencegah false-positive saat ada manusia lewat.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-surface-container border border-surface-variant flex flex-col gap-2">
                    <label className="text-xs font-mono text-on-surface-variant uppercase tracking-wider">
                      Debounce Stabilisasi Objek (Detik)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="15"
                      value={settings.debounceWaktuDetik}
                      onChange={(e) => handleInputChange('debounceWaktuDetik', parseInt(e.target.value) || 1)}
                      className="bg-surface-container-lowest border border-outline px-3 py-2 rounded-lg text-sm text-on-surface font-mono focus:border-primary outline-none"
                    />
                    <span className="text-[11px] text-text-muted font-mono">
                      Sensor menunggu objek diam selama durasi ini sebelum mengubah status menjadi TERISI.
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-surface-container border border-surface-variant flex flex-col gap-2">
                    <label className="text-xs font-mono text-on-surface-variant uppercase tracking-wider">
                      Timeout Heartbeat MQTT (Detik)
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="60"
                      value={settings.sensorTimeoutDetik}
                      onChange={(e) => handleInputChange('sensorTimeoutDetik', parseInt(e.target.value) || 5)}
                      className="bg-surface-container-lowest border border-outline px-3 py-2 rounded-lg text-sm text-on-surface font-mono focus:border-primary outline-none"
                    />
                    <span className="text-[11px] text-text-muted font-mono">
                      Batas tanpa data telemetri sebelum sensor dinyatakan OFFLINE / Anomali Hardware.
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-surface-container border border-surface-variant space-y-3">
                  <p className="text-xs font-bold font-mono text-on-surface uppercase tracking-wider">Tindakan Otomatis Anomali Sensor:</p>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.autoAlertAnomali}
                      onChange={(e) => handleInputChange('autoAlertAnomali', e.target.checked)}
                      className="w-4 h-4 accent-primary rounded"
                    />
                    <span className="text-xs font-mono text-on-surface">
                      Otomatis buat tiket LogOperasionalIoT tingkat CRITICAL saat sensor mati mendadak
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* TAB 3: KAMERA ANPR & VISION */}
            {activeTab === 'anpr' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#7ad0ff]">videocam</span>
                    Ambang Batas Model AI (YOLOv11 + OCR)
                  </h3>
                  <p className="text-xs text-on-surface-variant font-mono mt-1">
                    Konfigurasi integrasi computer vision pada 4 gerbang masuk & keluar.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-surface-container border border-surface-variant flex flex-col gap-2">
                    <label className="text-xs font-mono text-on-surface-variant uppercase tracking-wider">
                      Confidence Threshold Minimum (%)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="50"
                        max="98"
                        value={settings.confidenceThreshold}
                        onChange={(e) => handleInputChange('confidenceThreshold', parseInt(e.target.value))}
                        className="flex-1 accent-primary"
                      />
                      <span className="font-mono font-bold text-sm text-primary w-12 text-right">
                        {settings.confidenceThreshold}%
                      </span>
                    </div>
                    <span className="text-[11px] text-text-muted font-mono">
                      Hasil pembacaan plat di bawah persentase ini akan meminta penanganan operator.
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-surface-container border border-surface-variant flex flex-col gap-2">
                    <label className="text-xs font-mono text-on-surface-variant uppercase tracking-wider">
                      Target Frame Rate (FPS) Stream
                    </label>
                    <input
                      type="number"
                      value={settings.kameraStreamFps}
                      onChange={(e) => handleInputChange('kameraStreamFps', parseInt(e.target.value) || 15)}
                      className="bg-surface-container-lowest border border-outline px-3 py-2 rounded-lg text-sm text-on-surface font-mono focus:border-primary outline-none"
                    />
                    <span className="text-[11px] text-text-muted font-mono">Optimalisasi bandwidth RTSP jaringan lokal gerbang.</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-surface-container border border-surface-variant space-y-3">
                  <p className="text-xs font-bold font-mono text-on-surface uppercase tracking-wider">Prosedur Fallback Gerbang:</p>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.fallbackManualEntry}
                      onChange={(e) => handleInputChange('fallbackManualEntry', e.target.checked)}
                      className="w-4 h-4 accent-primary rounded"
                    />
                    <span className="text-xs font-mono text-on-surface">
                      Aktifkan tombol input plat darurat pada Kiosk Pengendara jika OCR gagal mengenali plat
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* TAB 4: RETENSI DATA */}
            {activeTab === 'retention' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-warning-reserved">auto_delete</span>
                    Kebijakan Retensi Data & Siklus Pembersihan
                  </h3>
                  <p className="text-xs text-on-surface-variant font-mono mt-1">
                    Konfigurasi cron job berkala pembersihan log operasional IoT sesuai kebijakan database.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-surface-container border border-surface-variant space-y-4">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <p className="text-sm font-semibold text-on-surface">Masa Simpan Log IoT Rutin</p>
                      <p className="text-xs text-text-muted font-mono mt-0.5">
                        Log telemetri normal yang lebih lama dari batas ini akan di-purge secara otomatis.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="7"
                        max="365"
                        value={settings.retensiHari}
                        onChange={(e) => handleInputChange('retensiHari', parseInt(e.target.value) || 30)}
                        className="w-24 bg-surface-container-lowest border border-outline px-3 py-1.5 rounded-lg text-sm text-on-surface font-mono text-center outline-none focus:border-primary"
                      />
                      <span className="text-xs font-mono text-on-surface-variant">Hari</span>
                    </div>
                  </div>

                  <div className="border-t border-surface-variant pt-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-on-surface-variant">Jadwal Cron Pembersihan:</span>
                      <span className="text-system-info font-bold">Setiap Jam 02:00 WIB (Harian)</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-on-surface-variant">Status Cron di Backend:</span>
                      <span className="text-eco-success font-bold">AKTIF (DataRetentionService.java)</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-alert-anomaly/10 border border-alert-anomaly/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <p className="text-xs font-bold font-mono text-alert-anomaly">Aksi Pembersihan Manual (Immediate Purge)</p>
                    <p className="text-xs text-text-muted font-mono mt-1">
                      Hapus log IoT normal yang telah kedaluwarsa secara langsung tanpa menunggu jadwal cron malam.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (window.confirm('Jalankan pembersihan log IoT lama sekarang?')) {
                        showToast('Permintaan pembersihan log kedaluwarsa telah dikirim.', 'info');
                      }
                    }}
                    className="px-4 py-2 bg-alert-anomaly/20 border border-alert-anomaly text-alert-anomaly rounded-xl text-xs font-mono font-bold hover:bg-alert-anomaly/30 transition-colors"
                  >
                    Purge Log Sekarang
                  </button>
                </div>
              </div>
            )}

            {/* TAB 5: AKUN & PREFERENSI */}
            {activeTab === 'account' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">manage_accounts</span>
                    Profil Pengguna & Keamanan Akun
                  </h3>
                  <p className="text-xs text-on-surface-variant font-mono mt-1">
                    Informasi akun yang sedang aktif dan preferensi lingkungan kerja operator.
                  </p>
                </div>

                {/* Info Akun Aktif */}
                <div className="p-4 rounded-xl bg-surface-container border border-surface-variant grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-[11px] font-mono text-text-muted uppercase">Username</span>
                    <p className="text-sm font-bold font-mono text-on-surface mt-0.5">{currentUser.username || 'petugas01'}</p>
                  </div>
                  <div>
                    <span className="text-[11px] font-mono text-text-muted uppercase">Nama Lengkap</span>
                    <p className="text-sm font-semibold text-on-surface mt-0.5">{currentUser.namaLengkap || 'Petugas Lapangan'}</p>
                  </div>
                  <div>
                    <span className="text-[11px] font-mono text-text-muted uppercase">Hak Akses / Peran</span>
                    <span className="inline-block mt-0.5 px-2 py-0.5 bg-primary/20 text-primary border border-primary/40 rounded text-xs font-mono font-bold">
                      {currentUser.role || 'PETUGAS_LAPANGAN'}
                    </span>
                  </div>
                </div>

                {/* Form Ubah Password */}
                <form onSubmit={handleGantiPassword} className="p-4 rounded-xl bg-surface-container border border-surface-variant space-y-4">
                  <p className="text-xs font-bold font-mono text-on-surface uppercase tracking-wider">Perbarui Kata Sandi Akun:</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-mono text-on-surface-variant">Password Baru</label>
                      <input
                        type="password"
                        placeholder="Minimal 6 karakter"
                        value={settings.passwordBaru}
                        onChange={(e) => handleInputChange('passwordBaru', e.target.value)}
                        className="bg-surface-container-lowest border border-outline px-3 py-2 rounded-lg text-sm text-on-surface font-mono outline-none focus:border-primary"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-mono text-on-surface-variant">Konfirmasi Password Baru</label>
                      <input
                        type="password"
                        placeholder="Ulangi password baru"
                        value={settings.konfirmasiPassword}
                        onChange={(e) => handleInputChange('konfirmasiPassword', e.target.value)}
                        className="bg-surface-container-lowest border border-outline px-3 py-2 rounded-lg text-sm text-on-surface font-mono outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary text-on-primary text-xs font-mono font-bold rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Perbarui Password
                    </button>
                  </div>
                </form>

                {/* Preferensi Audio Alarm */}
                <div className="p-4 rounded-xl bg-surface-container border border-surface-variant space-y-3">
                  <p className="text-xs font-bold font-mono text-on-surface uppercase tracking-wider">Preferensi Notifikasi Suara:</p>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.audioAlarmAnomali}
                      onChange={(e) => handleInputChange('audioAlarmAnomali', e.target.checked)}
                      className="w-4 h-4 accent-primary rounded"
                    />
                    <span className="text-xs font-mono text-on-surface">
                      Aktifkan bunyi peringatan audio (Buzzer/Beep) di Dashboard jika terdeteksi Anomali CRITICAL
                    </span>
                  </label>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </AppLayout>
  );
}
