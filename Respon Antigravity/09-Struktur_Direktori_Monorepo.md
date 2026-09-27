# Rancangan Arsitektur Folder (Monorepo) SPCT IoT

Untuk mencegah tercampurnya kode-kode dari berbagai modul teknologi yang berbeda (seperti *Backend Java*, *AI Python*, dan *Frontend Web*), disarankan untuk menggunakan arsitektur **Monorepo**.

Di bawah ini adalah rancangan struktur *folder* independen yang akan digunakan ke depannya jika implementasi telah benar-benar berjalan:

```text
Sistem Parkir Cerdas Terintegrasi IoT/
│
├── backend-spring/          <-- 🟢 FOLDER KHUSUS BACKEND JAVA
│   └── src/main/java/com/spct/
│       ├── config/
│       ├── controller/      (Berisi TerminalMasukController, dll)
│       ├── dto/
│       ├── model/           (Berisi SlotParkir, Transaksi, dll)
│       ├── repository/
│       └── service/         (Berisi AlokasiRuteService, dll)
│
├── ai-yolo/                 <-- 🟠 FOLDER KHUSUS PYTHON & AI
│   (Digunakan untuk meletakkan script YOLOv11 dan skrip OCR)
│
├── frontend-web/            <-- 🔵 FOLDER KHUSUS DASHBOARD UI/UX
│   (Digunakan untuk kode React.js/Vue.js dan TailwindCSS)
│
└── iot-gateway/             <-- 🔌 FOLDER KHUSUS SENSOR/HARDWARE
    (Digunakan untuk skrip C++/Python pengirim MQTT dari Raspberry Pi)
```

## Keuntungan Struktur Ini
1. **Independensi Layanan:** *Error* atau masalah yang terjadi pada modul AI (YOLO) di *folder* `ai-yolo` sama sekali tidak akan mengganggu berjalannya layanan *database* atau logika bisnis di *folder* `backend-spring`.
2. **Kerapian Repository:** Karena saat ini di dalam folder *root* banyak sekali dokumen PDF, `.md`, dan diagram, pembuatan folder per-layanan ini mencegah penumpukan file *source code* secara berantakan.
3. **Kemudahan Deployment:** Saat sistem siap dipasang ke *server* fisik, setiap *folder* bisa di-*build* (dikompilasi) secara terpisah sesuai lingkungannya masing-masing.

*(Catatan: Folder fisik `src` dan lainnya belum dibuat dan akan dibuat secara bertahap saat masuk ke tahap pemrograman sebenarnya).*
