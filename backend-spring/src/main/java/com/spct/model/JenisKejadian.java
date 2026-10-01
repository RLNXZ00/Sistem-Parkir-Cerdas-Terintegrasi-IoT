package com.spct.model;

// Deklarasi Enum JenisKejadian: merepresentasikan semua kategori kejadian yang bisa dicatat sensor IoT
public enum JenisKejadian
{
    // --- Kategori Normal ---
    SENSOR_MENDETEKSI_MOBIL_MASUK,  // Slot berstatus DIPESAN -> sensor mendeteksi kendaraan masuk
    SENSOR_MENDETEKSI_MOBIL_KELUAR, // Slot berstatus TERISI  -> sensor mendeteksi kendaraan keluar

    // --- Kategori Kritis (Anomali) ---
    ANOMALI_PENYEROBOTAN_SLOT,      // Slot KOSONG di database tapi sensor mendeteksi kendaraan
    SENSOR_OFFLINE_TIMEOUT,         // Sensor tidak mengirim data dalam waktu yang ditentukan
    KENDARAAN_BEDA_DIMENSI          // Sensor mendeteksi dimensi kendaraan tidak sesuai jenis terdaftar
}
