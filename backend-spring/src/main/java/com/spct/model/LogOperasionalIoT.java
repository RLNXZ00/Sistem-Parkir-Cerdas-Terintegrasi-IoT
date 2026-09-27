package com.spct.model;

/**
 * ENTITAS: LogOperasionalIoT
 * Merepresentasikan tabel 'log_operasional_iot' di Database.
 * Bertanggung jawab mencatat semua pergerakan sensor perangkat keras.
 * 
 * PSEUDOCODE / STRUKTUR ATRIBUT:
 * 
 * Tipe Tabel: Log / History (Data sangat besar, mungkin butuh partisi bulanan)
 * 
 * 1. id_log (Primary Key)
 *    - Tipe: Long Auto-Increment atau UUID.
 * 
 * 2. id_slot (Foreign Key)
 *    - Menunjuk ke SlotParkir mana log ini terjadi.
 * 
 * 3. waktu_kejadian
 *    - Tipe: Timestamp (Sangat presisi hingga milidetik).
 * 
 * 4. jenis_kejadian
 *    - Tipe: Enum. 
 *      Kategori Normal: (SENSOR_MENDETEKSI_MOBIL_MASUK, SENSOR_MENDETEKSI_MOBIL_KELUAR)
 *      Kategori Kritis: (ANOMALI_PENYEROBOTAN_SLOT, SENSOR_OFFLINE_TIMEOUT, KENDARAAN_BEDA_DIMENSI)
 * 
 * 5. tingkat_keparahan (Severity)
 *    - Tipe: Enum (INFO, WARNING, CRITICAL)
 *    - Fungsi: Untuk pewarnaan (merah/kuning/hijau) di Dashboard Frontend Petugas.
 * 
 * 6. status_resolusi
 *    - Tipe: Enum (BELUM_DITANGANI, SELESAI_DIVALIDASI).
 *    - Fungsi: Memastikan petugas mengecek lapangan jika terjadi anomali, sebelum statusnya diubah menjadi "Selesai".
 */
public class LogOperasionalIoT {
    // Akan diisi anotas @Entity, @Id, @Column dari JPA
}