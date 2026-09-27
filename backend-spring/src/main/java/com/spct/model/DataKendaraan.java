package com.spct.model;

/**
 * ENTITAS: DataKendaraan
 * Merepresentasikan tabel 'data_kendaraan' di Database Relasional.
 * Merupakan basis dari seluruh operasional sistem.
 * 
 * PSEUDOCODE / STRUKTUR ATRIBUT:
 * 
 * Tipe Tabel: Master Data
 * 
 * 1. id_kendaraan (Primary Key)
 *    - Tipe: String / UUID / Long (Auto-increment)
 *    - Fungsi: Identitas unik referensi antar tabel.
 * 
 * 2. plat_nomor (Unique)
 *    - Tipe: String (Contoh: "AB1234XY")
 *    - Fungsi: Untuk pencocokan OCR YOLO di gerbang keluar dan masuk.
 * 
 * 3. jenis_kendaraan
 *    - Tipe: Enum (MOBIL, MOTOR)
 *    - Fungsi: Penentu dimensi ukuran slot parkir yang dialokasikan dan tarif awal.
 * 
 * 4. waktu_registrasi_pertama
 *    - Tipe: Timestamp (DateTime)
 *    - Fungsi: Menyimpan jejak rekam sejak kapan sistem mengenali kendaraan ini.
 * 
 * RELASI ERD:
 * - One-to-Many ke tabel TransaksiParkir (Satu kendaraan bisa parkir berkali-kali).
 * - One-to-One ke tabel SlotParkir (Saat kendaraan sedang berada di dalam gedung).
 */
public class DataKendaraan {
    // Akan diisi anotas @Entity, @Id, @Column dari JPA
}