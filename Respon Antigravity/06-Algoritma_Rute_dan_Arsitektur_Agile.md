# Algoritma Rute dan Penyesuaian Arsitektur (Pendekatan Agile)

Melanjutkan proses perancangan *Sistem Parkir Cerdas Terintegrasi IoT (SPCT IoT)*, khususnya untuk mengatasi kompleksitas pencarian rute dan sinkronisasi antara konseptual dengan implementasi basis data.

## 1. Algoritma Pencarian dan Visualisasi Rute (Navigasi)
Karena sistem dirancang untuk memberikan panduan navigasi dalam ruang tertutup (*basement*), algoritma pencarian rute berbasis **Graf (Graph)** sangat dibutuhkan.

- **Pemetaan Node dan Edge:** 
  Area parkir (jalur jalan dan slot) harus dipetakan ke dalam bentuk titik (*Node*) dan garis penghubung antar titik (*Edge*). Setiap jarak antar titik harus dikonfigurasi bobot atau jaraknya.
- **Pilihan Algoritma Inti:**
  - **Dijkstra:** Digunakan untuk mencari rute terpendek secara mutlak dari Gerbang Masuk ke target Slot Kosong.
  - **A* (A-Star):** Direkomendasikan karena lebih cerdas dan cepat dengan menggunakan fungsi heuristik (memperkirakan arah tujuan) sehingga sangat ideal untuk navigasi.
- **Mekanisme Visualisasi UI/UX:**
  Backend (Java) bertugas menemukan urutan titik terpendek, lalu mengirimkan himpunan titik tersebut (Array Koordinat/Node) ke Frontend. Terminal kemudian menggunakan SVG atau Canvas HTML5 untuk menggambar jalur (seperti garis hijau) di atas peta denah interaktif.

## 2. Implementasi MVC ke Konteks Microservices (Spring Boot)
Diagram Kelas Desain (MVC) pada laporan merupakan rancangan **konseptual** yang sudah tepat. Ketidaksesuaian 100% antara rancangan ini dengan tabel fisik *database* adalah wajar dan memang akan selalu berkembang di fase *development*.

Pemetaan langsung ke kode Java:
- **Entity (Model):** Entitas dasar seperti `Data_Kendaraan`, `Slot_Parkir`, `Transaksi_Parkir`, dan `Log_Operasional_IoT` akan menjadi kelas-kelas `@Entity` (JPA/Hibernate) yang terikat langsung ke tabel PostgreSQL. Tambahan tabel seperti `users` atau `kamera` bisa ditambahkan sambil jalan.
- **Control:** Kelas-kelas seperti `DeteksiPlatController` atau `AlokasiRuteController` akan diwujudkan sebagai lapisan logika bisnis (`@Service`) dan pintu gerbang API (`@RestController`).
- **Boundary (View):** Dalam pola *Microservices*, *boundary* bukan lagi bagian dari Java, melainkan didelegasikan kepada klien *Frontend* (React/Vue), aplikasi Kios, atau perantara *hardware* IoT (MQTT).

## 3. Pendekatan "Perbaikan Sambil Jalan" (Agile Development)
Pilihan untuk langsung bergerak membangun *backend* dengan memanfaatkan templat rancangan yang ada sangat didukung. Alih-alih terjebak pada penyempurnaan desain awal (*Analysis Paralysis*), kita menerapkan metode **Agile**:
1. Bangun fondasi utama (Java Spring Boot + PostgreSQL).
2. Tulis *Entity* inti dan uji integrasinya.
3. Kembangkan fitur rute dan IoT secara bertahap (iteratif).
4. Perbarui diagram kelas atau basis data hanya ketika ada kebutuhan atribut baru yang mendesak di tengah implementasi.
