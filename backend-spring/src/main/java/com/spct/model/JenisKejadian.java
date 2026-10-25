package com.spct.model; // Nama package dari modul model entitas sistem

// Enum publik java dari JenisKejadian: merepresentasikan kategori kejadian operasional dan anomali IoT
public enum JenisKejadian
{
    // --- Kategori Normal ---
    // Kejadian sensor mendeteksi kendaraan mulai memasuki slot parkir yang dipesan
    SENSOR_MENDETEKSI_MOBIL_MASUK,
    
    // Kejadian sensor mendeteksi kendaraan meninggalkan slot parkir
    SENSOR_MENDETEKSI_MOBIL_KELUAR,

    // --- Kategori Kritis (Anomali) ---
    // Anomali terdeteksi: slot kosong di sistem namun sensor mendeteksi fisik kendaraan (penyerobotan)
    ANOMALI_PENYEROBOTAN_SLOT,
    
    // Anomali terdeteksi: sensor IoT tidak merespons atau heartbeat terputus melampaui batas waktu
    SENSOR_OFFLINE_TIMEOUT,
    
    // Anomali terdeteksi: sensor ultrasonik mendeteksi dimensi kendaraan tidak cocok dengan tipe tiket
    KENDARAAN_BEDA_DIMENSI
}
