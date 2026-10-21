# SOP & Aturan Mutlak Pengembangan SPCT IoT

## 1. Prinsip Konsep & Implementasi
- Dokumen konseptual (`Tahap_V_SistemParkirCerdas.pdf`) bertindak sebagai **BluePrint / Panduan Acuan Dasar**.
- Implementasi dilakukan secara **fleksibel** dan pragmatis sesuai kebutuhan rekayasa perangkat lunak nyata di lapangan (tidak kaku atau mutlak jika memerlukan penyesuaian/improvisasi yang lebih baik).

## 2. Aturan Mutlak Workflow & Git
1. **Ambil Pembaruan Terkini dari `main`:**
   - Sebelum memulai pekerjaan/implementasi baru, selalu sinkronisasi dan tarik perubahan terbaru dari `main` (`git pull origin main`).
2. **Commit Berkala dengan Standar & Bahasa Indonesia:**
   - Setiap penyelesaian fitur, perbaikan bug, atau logika bisnis, lakukan commit berkala.
   - Format standar: `<tipe>: <deskripsi pesan commit>` (contoh: `feat: ...`, `fix: ...`, `refactor: ...`, `docs: ...`, `chore: ...`).
   - Wajib menggunakan **Bahasa Indonesia**.
3. **Branching Fleksibel & Push ke Branch Terkait:**
   - Selalu periksa pembaruan lokal.
   - Arahkan ke branch terkait yang sudah ada di remote (`back-end`, `front-end`, `front-end-kiosk`, dll.) atau buat branch fitur baru sesuai konteks tugas.
4. **Auto Merge ke `main` & Push:**
   - Setelah commit dan push ke branch kerja/fitur, lakukan merge kembali ke `main` dan pastikan remote `main` terbarui secara terintegrasi.
5. **Menjaga Keutuhan Folder & Isi Lokal:**
   - Selalu pertahankan integritas dan struktur folder di lingkungan lokal. Hindari menghapus direktori atau file penting tanpa konfirmasi dan alasan teknis yang kuat.
