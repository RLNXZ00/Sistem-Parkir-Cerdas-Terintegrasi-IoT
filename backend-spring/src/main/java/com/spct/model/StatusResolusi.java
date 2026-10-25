package com.spct.model; // Nama package dari modul model entitas sistem

// Enum publik java dari StatusResolusi: merepresentasikan status penanganan anomali operasional oleh petugas
public enum StatusResolusi
{
    // Status BELUM_DITANGANI: anomali baru terdeteksi dan menunggu inspeksi petugas lapangan
    BELUM_DITANGANI,
    
    // Status SELESAI_DIVALIDASI: anomali telah selesai diinspeksi dan dikonfirmasi tuntas oleh petugas
    SELESAI_DIVALIDASI
}
