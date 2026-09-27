package com.spct.model;

/**
 * ENTITAS: SlotParkir
 * Merepresentasikan tabel 'slot_parkir' di Database.
 * Menjadi komponen terpenting untuk Algoritma A* dan Sensor IoT.
 * 
 * PSEUDOCODE / STRUKTUR ATRIBUT:
 * 
 * Tipe Tabel: Master Data & State Machine
 * 
 * 1. id_slot (Primary Key)
 *    - Tipe: String (Contoh: "B1-12", "B2-05")
 * 
 * 2. lantai
 *    - Tipe: Integer / String
 *    - Fungsi: Dasar pengelompokan pencarian prioritas kedekatan.
 * 
 * 3. node_id (Sangat Penting untuk A*)
 *    - Tipe: String (Foreign Key Logis ke struktur Graf Eksternal)
 *    - Fungsi: Titik koordinat matematika bagi Algoritma A* untuk menarik garis dari gerbang.
 * 
 * 4. status_slot
 *    - Tipe: Enum (KOSONG, DIPESAN, TERISI, RUSAK/MAINTENANCE)
 *    - Fungsi: State dari sensor IoT. 'DIPESAN' berguna agar slot tidak direbut mobil lain (Handling Race Condition).
 * 
 * 5. kendaraan_aktif_id (Foreign Key)
 *    - Tipe: FK ke DataKendaraan (Bisa NULL jika Kosong).
 *    - Fungsi: Mengetahui mobil mana yang *seharusnya* menempati slot ini.
 * 
 * 6. koordinat_x, koordinat_y (Untuk UI Frontend)
 *    - Tipe: Double/Float
 *    - Fungsi: Agar Dasbor Vue/React tahu di mana harus menggambar kotak merah/hijau secara presisi di layar monitor.
 */
public class SlotParkir {
    // Akan diisi anotas @Entity, @Id, @Column dari JPA
}