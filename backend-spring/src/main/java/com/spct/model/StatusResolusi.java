package com.spct.model;

// Deklarasi Enum StatusResolusi: memastikan petugas tidak melewatkan anomali yang terjadi
public enum StatusResolusi
{
    BELUM_DITANGANI,    // Anomali baru masuk, petugas belum mengkonfirmasi
    SELESAI_DIVALIDASI  // Petugas sudah mengecek lapangan dan mengkonfirmasi penanganan selesai
}
