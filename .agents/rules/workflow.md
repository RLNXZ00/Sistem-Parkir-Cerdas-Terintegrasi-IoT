# SOP & Aturan Mutlak Pengembangan SPCT IoT

## 1. Prinsip Konsep & Implementasi
- Dokumen konseptual (`Tahap_V_SistemParkirCerdas.pdf`) bertindak sebagai **BluePrint / Panduan Acuan Dasar**.
- Implementasi teknis dilakukan secara pragmatis dan adaptif sesuai kebutuhan rekayasa perangkat lunak nyata di lapangan (tidak kaku jika memerlukan penyesuaian fungsional yang lebih baik).

---

## 2. Aturan Mutlak Git: Visual Network Graph & Hirarki Pemilihan Branch (STRICT)

> [!CAUTION]
> **DILARANG KERAS MELAKUKAN DIRECT COMMIT / PUSH LANGSUNG DI BRANCH `main`!**
> Branch `main` (garis putih utama di GitHub Network Graph) adalah branch produksi stabil yang **HANYA MURNI MENERIMA HASIL MERGE NON-FAST-FORWARD (`git merge --no-ff`)**.
> 
> **Target Visual GitHub Network Graph**:
> GitHub Network Graph wajib menampilkan struktur percabangan yang rapi, teratur, dan profesional yang mencerminkan pembagian arsitektur sistem (*Separation of Concerns*). Hindari *branch clutter* (penumpukan puluhan branch sekali pakai yang tidak perlu).

---

### 2.1. Hirarki & Strategi Pemilihan Branch (PENTING)

Branch baru **TIDAK HARUS selalu dibuat untuk setiap tugas**. Prioritaskan penggunaan kembali (*reuse*) branch layer utama yang sudah ada agar riwayat commit tetap mengalir di jalurnya masing-masing dan Network Graph tidak menjadi semrawut.

```
                    ┌─── back-end ────────(Logika Spring Boot, DB, Model, DTO)───┐
                    │                                                            │
main (Produksi) ────┼─── front-end ───────(Dashboard Web, Analitik, Pengaturan)──┼────> main (--no-ff)
                    │                                                            │
                    └─── front-end-kiosk ─(Kiosk Masuk, Navigasi, Kiosk Keluar)──┘
                           │
                           └── (Opsional) feat/fitur-terisolasi ─────────────────┘
```

#### PRIORITAS 1: Gunakan Branch Layer yang Sudah Ada (DEFAULT / SANGAT DIREKOMENDASIKAN)
Prioritaskan menggunakan 3 branch layer permanen yang sudah ada di repositori:
1. `back-end` $\rightarrow$ Untuk seluruh pengembangan, pemolesan, bugfix, dan integrasi di sisi Java Spring Boot, controller, service, repository, entity model, DTO, dan database PostgreSQL.
2. `front-end` $ightarrow$ Untuk seluruh pengembangan antarmuka web, perbaikan halaman dashboard manajer/petugas, visualisasi chart, filtering, styling Tailwind, dan penyesuaian SOP.
3. `front-end-kiosk` $ightarrow$ Untuk antarmuka anjungan mandiri (kiosk masuk gerbang, visualisasi denah rute navigasi, dan kiosk keluar cashless).

**Keuntungan**:
- Riwayat commit tersimpan kronologis di layer arsitekturnya masing-masing.
- Rekan tim yang bertugas di layer terkait dapat langsung melihat dan menarik progres terbaru.
- Menghindari penumpukan puluhan *stale/orphan branches* di GitHub.

#### PRIORITAS 2: Buat Branch Baru Terisolasi (OPSIONAL / HANYA JIKA DIPERLUKAN)
Pembuatan branch baru (`feat/<nama>`, `fix/<nama>`, `spike/<nama>`) **hanya dilakukan jika memenuhi kondisi berikut**:
- Pembaruan atau fitur baru yang **benar-benar independen, belum pernah ada jalurnya, dan memerlukan isolasi penuh** (misal: modul OCR YOLOv11 mandiri, integrasi payment gateway pihak ketiga).
- Eksperimen berisiko tinggi / *breaking changes* (misal: restrukturisasi database masif) yang jika gagal, cabangnya dapat langsung dibuang tanpa merusak branch layer utama.
- Tugas lintas layer (*cross-cutting*) yang bersifat sementara.

**Standar Penamaan Jika Membuat Branch Baru (Kebab-Case)**:
- Fitur spesifik: `feat/<nama-fitur-kebab-case>`
- Perbaikan bug terisolasi: `fix/<nama-bug-kebab-case>`
- Dokumentasi/SOP: `docs/<nama-dokumen>` atau `chore/<nama-tugas>`

---

### 2.2. SOP 6 Langkah Wajib Alur Kerja Git

Setiap AI Agent dan pengembang **WAJIB** mengeksekusi urutan perintah terminal berikut secara disiplin:

#### Skenario A: Alur Utama Menggunakan Branch Layer yang Ada (PRIORITAS UTAMA)

##### Langkah 1: Pindah ke Branch Layer Terkait & Tarik Update Terkini dari `main`
Sebelum menulis kode, pastikan branch layer yang akan dikerjakan sinkron dengan `main`:
```bash
git checkout <back-end | front-end | front-end-kiosk>
git pull origin <back-end | front-end | front-end-kiosk>
git merge main
```

##### Langkah 2: Implementasi Kode & Commit di Branch Layer
- Sertakan **komentar penjelasan per baris kode** dengan mengadopsi gaya pembahasaan dari `Modul_8/9` dan `Modul_12`.
- Lakukan commit berkala di branch layer tersebut:
```bash
git add <file-terkait>
git commit -m "tipe(cakupan): deskripsi perubahan dalam bahasa indonesia"
```
*Format tipe*: `feat`, `fix`, `refactor`, `style`, `docs`, `chore`. Wajib menggunakan Bahasa Indonesia formal.

##### Langkah 3: Push Branch Layer ke Remote GitHub
```bash
git push origin <back-end | front-end | front-end-kiosk>
```

##### Langkah 4: Merge ke `main` Menggunakan Flag `--no-ff` (Non-Fast-Forward)
Pindah ke branch `main`, lakukan merge dengan bendera `--no-ff` agar simpul grafik percabangan tercipta secara permanen, lalu push ke `origin/main`:
```bash
git checkout main
git pull origin main
git merge --no-ff <nama-branch-layer> -m "merge: integrasikan pembaruan <nama-branch-layer> ke main"
git push origin main
```

##### Langkah 5: Sinkronisasi Silang ke Seluruh Layer Branches
Agar branch layer lainnya tidak tertinggal perubahan dari `main`, sinkronkan `main` ke branch layer lainnya:
```bash
git checkout <branch-layer-lain>
git merge main
git push origin <branch-layer-lain>
```

##### Langkah 6: Kembalikan Posisi Head ke `main` dalam Kondisi Bersih
```bash
git checkout main
git status
```

---

#### Skenario B: Alur Opsional Pembuatan Branch Baru (Hanya untuk Fitur Terisolasi / Eksperimen)

Jika fitur memang harus diisolasi sendiri:
```bash
# 1. Pastikan main sinkron, lalu buat branch baru
git checkout main
git pull origin main
git checkout -b <feat|fix>/<nama-fitur-kebab-case>

# 2. Koding, beri komentar per baris, dan commit
git add <file-terkait>
git commit -m "tipe(cakupan): deskripsi perubahan"

# 3. Push branch baru ke GitHub
git push -u origin <nama-branch-baru>

# 4. Merge ke main dengan flag --no-ff
git checkout main
git pull origin main
git merge --no-ff <nama-branch-baru> -m "merge: integrasikan <nama-branch-baru> ke main"
git push origin main

# 5. Sinkronkan hasil merge ke branch layer terkait
git checkout <back-end | front-end | front-end-kiosk>
git merge main
git push origin <nama-layer>

# 6. Kembali ke main
git checkout main
```

---

## 3. Logika Inti & Arsitektur SPCT IoT yang Wajib Dipertahankan (INVARIANTS)

> [!WARNING]
> Penambahan fitur baru dilarang merusak atau mengubah logika bisnis fundamental berikut:

1. **Rumus Tarif Resmi (Single Source of Truth di `TransaksiPembayaranService`)**:
   - Grace period ≤ 10 menit = Rp 0 (Bebas Biaya / `GRACE_PERIOD_FREE`).
   - Parkir normal ≤ 8 jam = Tarif Flat Rp 5.000.
   - Jam ke-9 s.d. 12 = +Rp 2.000 per jam tambahan.
   - Rawat inap (> 12 jam) = Tarif Flat Maksimal Rp 10.000.
   - *Dilarang menulis ulang rumus tarif di tempat lain*. Semua controller dan service gerbang keluar wajib memanggil `transaksiPembayaranService.hitungTarif(minutes)`.

2. **Waktu Transaksi Keluar Selalu Real-Time (`LocalDateTime.now()`)**:
   - Waktu keluar dan waktu pembayaran **wajib dicatat pada waktu riil saat ini (`LocalDateTime.now()`)**.
   - Jika durasi simulasi digunakan pada kiosk keluar, **waktu masuk** yang dimundurkan ke belakang (`waktuMasuk = waktuKeluar.minusMinutes(durasiSimulasi)`), **TIDAK BOLEH** menambahkan durasi ke waktu masuk karena akan melempar waktu keluar ke esok hari / masa depan dan merusak kueri pendapatan harian.

3. **Status Siklus Hidup Slot Parkir**:
   - Transisi status slot: `KOSONG` ➔ `DIPESAN` (alokasi rute) ➔ `TERISI` (sensor mendeteksi kendaraan) ➔ `KOSONG` (pembebasan saat gerbang keluar bayar lunas via `transaksiPembayaranService.bebaskanSlotParkir`).
   - Slot bermasalah/sensor mati bertransisi ke `ANOMALI` dan tercatat di `log_operasional_iot`.

4. **Kapasitas Multi-Lantai & Peruntukan Slot**:
   - Alokasi rute A* memprioritaskan slot kosong sesuai `jenisKendaraan` (`MOBIL` / `MOTOR`) mulai dari lantai terendah (Lantai 1) sebelum naik ke lantai berikutnya.
   - Agregasi kapasitas analitik menggunakan penghitungan dinamis (`slotParkirRepository.count()`), bukan nilai statis hardcode.

5. **Kebijakan Retensi Data & Audit Trail (Fase 7 & PK-UC010)**:
   - Penghapusan log rutin normal dilakukan otomatis setelah batas retensi (90 hari) melalui cron `0 0 2 * * ?` atau endpoint purge manual. Log anomali tidak boleh dihapus secara otomatis.
   - Seluruh unduhan laporan (PDF & Excel) wajib mencatatkan riwayat audit ke tabel `log_audit_laporan`.

---

## 4. Menjaga Sumber Kebenaran Mutlak & Keutuhan Folder Lokal

> [!IMPORTANT]
> Lingkungan lokal adalah **sumber kebenaran mutlak**.

1. **Dilarang Menghapus Folder Internal**:
   - Dilarang keras menghapus, mengubah nama, atau merusak folder lokal yang tercantum di `.gitignore`, seperti:
     - `Modul_8/`, `Modul_9/`, `Modul_12/` (modul acuan penulisan & gaya komentar)
     - `alpr/` (model weights, dataset besar, skrip simulasi kamera Python)
     - `Rekayasa Perangkat Lunak/`, `Spesifikasi Sistem Parkir Cerdas/`, `Respon Antigravity/`, `School_Reminder/`
2. **Keamanan Penarikan (*Pull*)**:
   - Jangan melakukan `git pull` secara buta jika ada perubahan lokal yang belum tersimpan. Lakukan `git stash` atau commit ke branch kerja terlebih dahulu.
3. **Resolusi Konflik**:
   - Jika terjadi *conflict*, prioritaskan integritas logika lokal yang sudah teruji stabil (koneksi database PostgreSQL, auto-seeder, tarif resmi) dan hanya serap logika fitur baru dari kolaborator secara selektif.
