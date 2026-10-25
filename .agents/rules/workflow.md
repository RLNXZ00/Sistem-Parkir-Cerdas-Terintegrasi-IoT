# SOP & Aturan Mutlak Pengembangan SPCT IoT

## 1. Prinsip Konsep & Implementasi
- Dokumen konseptual (`Tahap_V_SistemParkirCerdas.pdf`) bertindak sebagai **BluePrint / Panduan Acuan Dasar**.
- Implementasi teknis dilakukan secara pragmatis dan adaptif sesuai kebutuhan rekayasa perangkat lunak nyata di lapangan (tidak kaku jika memerlukan penyesuaian fungsional yang lebih baik).

---

## 2. Aturan Mutlak Git: Visual Network Graph & Larangan Direct Commit di `main` (STRICT)

> [!CAUTION]
> **DILARANG KERAS MELAKUKAN DIRECT COMMIT / PUSH LANGSUNG DI BRANCH `main`!**
> Branch `main` (garis putih utama di GitHub Network Graph) adalah branch produksi stabil yang **HANYA MURNI MENERIMA HASIL MERGE NON-FAST-FORWARD (`git merge --no-ff`)**.
> 
> **Target Visual GitHub Network Graph**:
> Setiap pekerjaan harus terlihat sebagai garis percabangan berwarna tersendiri yang keluar dari `main`, memiliki titik-titik commit di jalurnya sendiri, dan menyatu kembali ke `main` dengan simpul panah merge. Garis `main` tidak boleh memiliki commit pekerjaan langsung.

### Standar Penamaan Branch Kerja (Descriptive Kebab-Case)
Setiap tugas atau pembaruan fitur/bugfix wajib memiliki branch kerja tersendiri dengan penamaan topik yang jelas dan deskriptif:
- Fitur spesifik: `feat/<nama-fitur-kebab-case>` atau `<topik-fitur-kebab-case>` (contoh: `konsistensi-sidebar-header`, `detail-card-list`, `umpan-balik-database`, `memproses-kata-sandi`)
- Perbaikan bug: `fix/<nama-bug-kebab-case>` atau `<topik-bug-kebab-case>`
- Pembaruan layer umum: `back-end`, `front-end`, `front-end-kiosk`
- Dokumentasi/SOP: `docs/<nama-dokumen>` atau `chore/<nama-tugas>`

---

### SOP 6 Langkah Wajib Setiap Pengembangan Fitur / Perbaikan Bug

Setiap AI Agent dan pengembang **WAJIB** mengeksekusi urutan perintah terminal berikut secara disiplin tanpa melompati satu langkah pun:

#### Langkah 1: Sinkronisasi Terkini dari `main`
Sebelum memulai pengerjaan apa pun, pastikan branch `main` lokal sinkron dengan GitHub:
```bash
git checkout main
git pull origin main
```

#### Langkah 2: Buat Branch Baru atau Pindah ke Branch Kerja Terkait
DILARANG menulis kode saat berada di `main`. Buat branch baru dari `main` atau arahkan ke branch kerja:
```bash
# Opsi A: Buat branch fitur/perbaikan baru (SANGAT DIREKOMENDASIKAN untuk fitur/tugas baru)
git checkout -b <nama-branch-deskriptif>

# Opsi B: Pindah ke branch layer yang sudah ada dan sinkronkan dengan main
git checkout <back-end | front-end | front-end-kiosk>
git merge main
```

#### Langkah 3: Implementasi Kode & Commit di Branch Kerja
- Setiap kali menambahkan atau memperbarui kode, sertakan **komentar penjelasan per baris kode** dengan mengadopsi gaya pembahasaan dari `Modul_8/9` dan `Modul_12`.
- Lakukan commit berkala di branch kerja (BUKAN di `main`):
```bash
git add <file-terkait>
git commit -m "tipe(cakupan): deskripsi perubahan dalam bahasa indonesia"
```
*Format tipe*: `feat`, `fix`, `refactor`, `style`, `docs`, `chore`. Wajib menggunakan Bahasa Indonesia.

#### Langkah 4: Push Branch Kerja ke Remote GitHub (MANDATORY)
Branch kerja **WAJIB di-push ke GitHub** agar jalur percabangan berwarna dan label branch tercatat di GitHub Network Graph:
```bash
git push origin <nama-branch-kerja>
```

#### Langkah 5: Merge ke `main` Menggunakan Flag `--no-ff` & Push ke `origin/main`
Pindah ke branch `main`, lakukan merge dengan bendera `--no-ff` (Non-Fast-Forward) agar simpul grafik percabangan tercipta secara permanen, lalu push `main`:
```bash
git checkout main
git merge --no-ff <nama-branch-kerja> -m "merge: integrasikan pembaruan <nama-branch-kerja> ke main"
git push origin main
```

#### Langkah 6: Sinkronisasi Ulang Branch Kerja dengan `main`
Kembali ke branch kerja dan gabungkan hasil merge dari `main` agar branch kerja tetap sejajar:
```bash
git checkout <nama-branch-kerja>
git merge main
git push origin <nama-branch-kerja>
```
*(Branch kerja di remote dipertahankan agar riwayat visual di Network Graph GitHub tetap terpampang rapi dengan labelnya).*

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
