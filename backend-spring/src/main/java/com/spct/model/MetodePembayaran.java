package com.spct.model; // Nama package dari modul model entitas sistem

// Enum publik java dari MetodePembayaran: merepresentasikan opsi kanal pembayaran yang tersedia
public enum MetodePembayaran
{
    // Opsi pembayaran nontunai digital menggunakan QRIS dinamis
    QRIS,
    
    // Opsi pembayaran uang elektronik menggunakan kartu e-Toll Mandiri (e-Money)
    ETOLL_MANDIRI,
    
    // Opsi pembayaran uang elektronik menggunakan kartu BRIZZI Bank BRI
    ETOLL_BRI,
    
    // Opsi pembayaran tunai langsung melalui kasir petugas loket
    CASH
}
