package com.spct.model; // Nama package dari modul model entitas sistem

// Enum publik java dari StatusSlot: merepresentasikan status ketersediaan slot parkir
public enum StatusSlot
{
    // Status KOSONG: slot bebas dan siap dialokasikan untuk kendaraan baru
    KOSONG,
    
    // Status DIPESAN: slot sudah dialokasikan oleh sistem namun kendaraan masih dalam perjalanan
    DIPESAN,
    
    // Status TERISI: kendaraan sudah terparkir dan dikonfirmasi oleh sensor fisik ultrasonik
    TERISI,
    
    // Status MAINTENANCE: slot sedang dalam perbaikan atau dinonaktifkan sementara
    MAINTENANCE
}
