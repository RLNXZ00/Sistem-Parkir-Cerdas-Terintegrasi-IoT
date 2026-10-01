package com.spct.model;

// Deklarasi Enum TingkatKeparahan: menentukan warna indikator di Dashboard Frontend Petugas
public enum TingkatKeparahan
{
    INFO,     // Hijau: kejadian normal, tidak perlu tindakan khusus
    WARNING,  // Kuning: perlu perhatian petugas
    CRITICAL  // Merah: butuh tindakan segera dari petugas lapangan
}
