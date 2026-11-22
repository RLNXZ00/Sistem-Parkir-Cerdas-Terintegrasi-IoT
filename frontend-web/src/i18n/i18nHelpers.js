// Modul pembantu penerjemahan nilai enum dan log dinamis dari backend agar selaras dengan bahasa antarmuka aktif (ID / EN)

// Pemetaan konstanta kode jenis kejadian IoT dari backend ke padanan ramah antarmuka dalam bahasa Indonesia dan Inggris
const EVENT_TYPE_MAP = {
  SENSOR_MENDETEKSI_MOBIL_MASUK: {
    id: 'SENSOR MENDETEKSI KENDARAAN MASUK',
    en: 'SENSOR DETECTED VEHICLE ARRIVAL',
  },
  SENSOR_MENDETEKSI_MOBIL_KELUAR: {
    id: 'SENSOR MENDETEKSI KENDARAAN KELUAR',
    en: 'SENSOR DETECTED VEHICLE DEPARTURE',
  },
  ANOMALI_PENYEROBOTAN_SLOT: {
    id: 'ANOMALI PENYEROBOTAN SLOT',
    en: 'SLOT OCCUPANCY ANOMALY',
  },
  SENSOR_OFFLINE_TIMEOUT: {
    id: 'SENSOR TERPUTUS (OFFLINE TIMEOUT)',
    en: 'SENSOR OFFLINE TIMEOUT',
  },
};

// Fungsi pembantu translateLogEventType untuk menerjemahkan kode enum jenis kejadian dari backend
export function translateLogEventType(jenisKejadian, lang = 'id') {
  // Jika jenis kejadian kosong, kembalikan tanda hubung
  if (!jenisKejadian) return '-';
  // Cari pemetaan kode kejadian pada objek EVENT_TYPE_MAP
  const mapped = EVENT_TYPE_MAP[jenisKejadian];
  // Jika ditemukan pada peta terjemahan, kembalikan label sesuai bahasa aktif
  if (mapped) {
    return lang === 'en' ? mapped.en : mapped.id;
  }
  // Jika tidak ada pemetaan khusus, ubah underscore menjadi spasi agar lebih rapi dibaca
  return String(jenisKejadian).replace(/_/g, ' ');
}

// Fungsi pembantu translateLogDetail untuk menerjemahkan pesan log dinamis backend (Slot, Sensor, Anomali) ke bahasa Inggris
export function translateLogDetail(detail, lang = 'id') {
  // Jika teks detail kosong, kembalikan fallback default sesuai bahasa aktif
  if (!detail) {
    return lang === 'en' ? 'No additional details.' : 'Tidak ada catatan tambahan.';
  }
  // Jika bahasa aktif adalah Indonesia, kembalikan teks asli tanpa modifikasi
  if (lang !== 'en') {
    return detail;
  }

  // Inisialisasi salinan string detail dan ubah prefix slot motor M menjadi B agar konsisten dengan denah
  let translated = String(detail).replace(/\bM(\d+-\d+)\b/g, 'B$1');

  // Terjemahkan pola log: kendaraan yang dialokasikan telah tiba
  translated = translated.replace(
    /Slot ([^:]+): kendaraan yang dialokasikan telah tiba\. Status diubah menjadi TERISI\./gi,
    'Slot $1: allocated vehicle has arrived. Status updated to OCCUPIED.'
  );

  // Terjemahkan pola log: kendaraan telah keluar dan slot kembali kosong
  translated = translated.replace(
    /Slot ([^:]+): kendaraan telah keluar\. Status diubah menjadi KOSONG\./gi,
    'Slot $1: vehicle has departed. Status updated to VACANT.'
  );

  // Terjemahkan pola log: anomali penyerobotan slot saat status DB masih KOSONG
  translated = translated.replace(
    /ANOMALI! Slot ([^:]+): status DB=KOSONG tetapi sensor mendeteksi kendaraan\. Kemungkinan penyerobotan atau salah parkir\./gi,
    'ANOMALY! Slot $1: DB status is VACANT but sensor detected a vehicle. Possible poaching or misplacement.'
  );

  // Terjemahkan pola log: sensor ultrasonik terputus / OFFLINE
  translated = translated.replace(
    /Sensor ultrasonik ([^\s]+) pada slot ([^\s]+) terputus\/OFFLINE\. Slot dilewati dari alokasi kendaraan\./gi,
    'Ultrasonic sensor $1 on slot $2 disconnected/OFFLINE. Slot excluded from vehicle allocation.'
  );

  // Terjemahkan akhiran saat sensor kembali menyala online
  translated = translated.replace(
    /\[Sensor kembali pulih ON\]/gi,
    '[Sensor recovered ONLINE]'
  );

  // Terjemahkan label catatan petugas pada akhir deskripsi log
  translated = translated.replace(
    /\[Petugas:/gi,
    '[Operator:'
  );

  // Kembalikan string log yang sudah diterjemahkan ke Bahasa Inggris
  return translated;
}

// Fungsi pembantu translateResolutionStatus untuk menerjemahkan status penanganan anomali
export function translateResolutionStatus(status, lang = 'id') {
  // Evaluasi status apakah telah selesai divalidasi atau masih menunggu penanganan
  if (status === 'SELESAI_DIVALIDASI' || status === 'SUDAH_DITANGANI') {
    return lang === 'en' ? 'RESOLVED & VALIDATED' : 'SELESAI DIVALIDASI';
  }
  // Status belum ditangani
  return lang === 'en' ? 'UNRESOLVED' : 'BELUM DITANGANI';
}

// Fungsi pembantu translateVehicleType untuk menerjemahkan kategori kendaraan (MOBIL / MOTOR)
export function translateVehicleType(jenis, lang = 'id') {
  // Normalisasi teks ke huruf kapital untuk pencocokan yang konsisten
  const upper = String(jenis || '').toUpperCase();
  // Terjemahkan kategori mobil
  if (upper === 'MOBIL' || upper === 'CAR') {
    return lang === 'en' ? 'Car' : 'Mobil';
  }
  // Terjemahkan kategori motor
  if (upper === 'MOTOR' || upper === 'MOTORCYCLE') {
    return lang === 'en' ? 'Motorcycle' : 'Motor';
  }
  // Kembalikan nilai awal jika kategori lain
  return jenis || '-';
}

// Fungsi pembantu translateGateDirection untuk menerjemahkan arah gerbang (MASUK / KELUAR)
export function translateGateDirection(arah, lang = 'id') {
  // Normalisasi nilai arah gerbang ke huruf kapital
  const upper = String(arah || '').toUpperCase();
  // Terjemahkan arah gerbang masuk
  if (upper === 'MASUK' || upper === 'ENTRY') {
    return lang === 'en' ? 'ENTRY' : 'MASUK';
  }
  // Terjemahkan arah gerbang keluar
  if (upper === 'KELUAR' || upper === 'EXIT') {
    return lang === 'en' ? 'EXIT' : 'KELUAR';
  }
  // Kembalikan nilai asli bila tidak dikenal
  return arah || '-';
}

// Fungsi pembantu translateSlotStatus untuk menerjemahkan status slot parkir
export function translateSlotStatus(status, lang = 'id') {
  // Normalisasi status ke huruf kapital
  const upper = String(status || '').toUpperCase();
  // Jika bahasa Indonesia, pertahankan label standar bahasa Indonesia
  if (lang !== 'en') return upper || '-';
  // Petakan masing-masing status slot ke Bahasa Inggris
  if (upper === 'TERISI') return 'OCCUPIED';
  if (upper === 'DIPESAN') return 'RESERVED';
  if (upper === 'KOSONG') return 'VACANT';
  if (upper === 'ANOMALI') return 'ANOMALY';
  // Kembalikan status asli jika di luar daftar standar
  return upper || '-';
}

// Fungsi pembantu translateAnomalyCategory untuk menerjemahkan kategori detail anomali petugas
export function translateAnomalyCategory(category, lang = 'id') {
  // Jika kosong atau tanda hubung, kembalikan apa adanya
  if (!category || category === '-') return '-';
  // Jika bahasa Indonesia, kembalikan label asli
  if (lang !== 'en') return category;
  // Pemetaan kategori anomali ke Bahasa Inggris
  const map = {
    'Salah Parkir': 'Misplaced Vehicle',
    'Benda Asing': 'Foreign Object',
    'Keberadaan Manusia': 'Pedestrian / Human Presence',
    'SENSOR_OFFLINE': 'Sensor Offline',
    'False Positive': 'False Positive',
  };
  // Kembalikan hasil terjemahan atau nilai asli jika tidak terdaftar
  return map[category] || category;
}

// Fungsi pembantu translateDetectionResult untuk menerjemahkan hasil deteksi OCR gerbang
export function translateDetectionResult(result, lang = 'id') {
  // Normalisasi teks hasil deteksi ke huruf kapital
  const upper = String(result || '').toUpperCase();
  // Terjemahkan hasil deteksi berhasil
  if (upper === 'BERHASIL' || upper === 'SUCCESS') {
    return lang === 'en' ? 'SUCCESS' : 'BERHASIL';
  }
  // Terjemahkan hasil deteksi gagal
  if (upper === 'GAGAL' || upper === 'FAILED') {
    return lang === 'en' ? 'FAILED' : 'GAGAL';
  }
  // Kembalikan nilai awal jika di luar daftar
  return result || '-';
}

// Fungsi pembantu translateReportType untuk menerjemahkan tipe laporan pada tabel audit trail
export function translateReportType(jenis, lang = 'id') {
  // Normalisasi tipe laporan ke huruf kecil
  const lower = String(jenis || '').toLowerCase();
  // Kembalikan label jenis laporan sesuai bahasa aktif
  if (lower.includes('finansial') || lower.includes('financial')) {
    return lang === 'en' ? 'Financial' : 'Finansial';
  }
  if (lower.includes('operasional') || lower.includes('operational')) {
    return lang === 'en' ? 'Operational' : 'Operasional';
  }
  if (lower.includes('lingkungan') || lower.includes('eco') || lower.includes('environment')) {
    return lang === 'en' ? 'Environmental (Eco)' : 'Lingkungan (Eco)';
  }
  if (lower.includes('komprehensif') || lower.includes('comprehensive')) {
    return lang === 'en' ? 'Comprehensive' : 'Komprehensif';
  }
  // Kembalikan nilai awal jika tipe laporan tidak cocok
  return jenis || '-';
}
