# Cetak Biru (Blueprint) Implementasi Backend SPCT IoT

Dokumen ini adalah kerangka kerja teknis (*Technical Roadmap*) untuk membangun *backend* Sistem Parkir Cerdas Terintegrasi IoT menggunakan **Java Spring Boot**. Rancangan ini memadukan konsep *Microservices/Modular Monolith*, integrasi AI (YOLO), telemetri IoT, dan koneksi *Real-Time*.

---

## 1. Struktur Direktori Proyek (Package Architecture)
Agar kode tetap bersih dan mudah dirawat oleh tim, proyek akan dibagi menjadi *package* fungsional standar arsitektur berlapis (*Layered Architecture*):

```text
com.spct.backend
│
├── config/           # Konfigurasi sistem (Database, MQTT, WebSocket, Security/CORS)
├── controller/       # Pintu gerbang REST API (Endpoint untuk YOLO, Frontend, Payment Gateway)
├── dto/              # Data Transfer Object (Format JSON untuk Request/Response antar sistem)
├── model/            # Entitas Database (@Entity JPA) seperti SlotParkir, Kendaraan, Transaksi
├── repository/       # Antarmuka (Interface) Spring Data JPA untuk kueri ke PostgreSQL
├── service/          # Otak logika bisnis (Algoritma Rute, Kalkulasi Tarif, Deteksi Anomali)
├── exception/        # Penanganan error global (Misal: Pesan JSON jika "Parkir Penuh")
└── utils/            # Fungsi bantuan (Kalkulator CO2, Generator Format Laporan)
```

---

## 2. Modul Inti & Logika Bisnis (*Core Services*)

### A. Modul Gate & Alokasi Rute (`AlokasiRuteService`)
- **Fungsi:** Menangani kendaraan masuk.
- **Logika:** Menerima data plat nomor dari modul Python (YOLO) -> Mencari `SlotParkir` terdekat yang "Kosong" -> Mengubah statusnya jadi "Dipesan" -> Menghitung rute (A*/Dijkstra) -> Mengembalikan respons ke Kios Layar.

### B. Modul Monitoring IoT & Anomali (`MonitoringFisikService`)
- **Fungsi:** Menjaga sinkronisasi lapangan dan *database*.
- **Logika:** *Subscribe* ke *broker* MQTT untuk mendengarkan perubahan fisik sensor. Jika sensor mendeteksi "Terisi", sistem mengecek *database*. Jika di *database* statusnya "Kosong" (bukan "Dipesan"), sistem langsung men- *trigger* status "Anomali" dan membunyikan alarm ke dasbor petugas.

### C. Modul Transaksi & Pembayaran (`TransaksiService`)
- **Fungsi:** Menghitung tagihan saat kendaraan keluar.
- **Logika:** Saat YOLO mendeteksi plat keluar, sistem menghitung durasi (Waktu Keluar - Waktu Masuk). Mengaplikasikan logika *Grace Period* (< 10 menit gratis) atau tarif progresif per jam. Setelah *Payment Gateway* konfirmasi lunas, palang dibuka.

### D. Modul Analytics & Eco-Metrics (`LaporanService`)
- **Fungsi:** Menyediakan data untuk *Dashboard* Manajemen.
- **Logika:** Melakukan agregasi data harian/bulanan. Menghitung total reduksi emisi CO2 berdasarkan rumus selisih waktu parkir konvensional vs cerdas.

---

## 3. Titik Integrasi Eksternal (*Integration Points*)

1. **Komunikasi dengan AI/Python (YOLOv11):**
   - Menggunakan **HTTP REST API**.
   - Skrip Python mengirim JSON (berisi teks plat nomor dan jenis kendaraan) melalui metode `POST` ke endpoint `http://localhost:8080/api/v1/gate/scan-masuk`.
2. **Komunikasi dengan Sensor IoT (Raspberry Pi/NodeMCU):**
   - Menggunakan protokol **MQTT** (seperti *Mosquitto Broker*).
   - Sensor *publish* data (0 atau 1) ke topik `spct/basement/B1-12`. *Backend* Java akan *subscribe* ke topik ini secara terus-menerus di *background*.
3. **Komunikasi dengan Frontend (Dashboard Live):**
   - Menggunakan **WebSocket (STOMP/SockJS)**.
   - Dibandingkan REST API biasa yang mengharuskan browser me- *refresh* halaman, WebSocket memungkinkan *Backend* secara aktif "mendorong" (push) perubahan warna slot (Hijau/Merah) ke peta denah secara *real-time*.

---

## 4. Peta Jalan Implementasi (Tahapan Pengerjaan)

Karena kita menggunakan pendekatan *Agile*, berikut adalah urutan *coding* yang disarankan:

- **Sprint 1 (Fondasi & Database):**
  - Setup Spring Boot Initializr (Dependencies: Web, JPA, PostgreSQL, Lombok).
  - Bikin kelas `@Entity` untuk *Database* (Kendaraan, SlotParkir, Transaksi).
  - Setup koneksi ke PostgreSQL dan biarkan *Hibernate* membuat tabel otomatis (*Auto DDL*).
- **Sprint 2 (Fitur Inti Masuk & Keluar):**
  - Buat algoritma pencarian slot kosong sederhana.
  - Buat `GateController` untuk menerima data dari Python YOLO. Uji coba dengan *Postman* atau Python langsung.
- **Sprint 3 (Implementasi IoT & Rute):**
  - Tambahkan konfigurasi MQTT di Spring Boot.
  - Integrasikan algoritma *Graph/Routing* (*A-Star/Dijkstra*) ke dalam *Service* alokasi.
- **Sprint 4 (Live Dashboard):**
  - Tambahkan konfigurasi WebSocket.
  - Hubungkan *event* perubahan dari MQTT agar langsung di- *broadcast* ke WebSocket *Dashboard*.
- **Sprint 5 (Pembayaran & Laporan):**
  - Integrasikan logika kalkulasi biaya parkir.
  - Buat *endpoint* untuk menarik laporan operasional format Excel/PDF.
