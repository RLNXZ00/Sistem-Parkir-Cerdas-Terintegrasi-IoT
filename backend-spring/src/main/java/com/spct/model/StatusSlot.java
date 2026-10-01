package com.spct.model;

// Deklarasi Enum StatusSlot: merepresentasikan semua kemungkinan state dari sebuah slot parkir
public enum StatusSlot
{
    KOSONG,     // Slot tidak ada kendaraan dan bebas digunakan
    DIPESAN,    // Slot sudah dialokasikan oleh sistem saat kendaraan baru masuk
    TERISI,     // Slot sudah benar-benar terisi (sensor fisik mengkonfirmasi)
    MAINTENANCE // Slot sedang dalam perbaikan / tidak tersedia
}
