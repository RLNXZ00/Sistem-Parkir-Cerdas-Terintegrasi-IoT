package com.spct.model;

// Deklarasi Enum MetodePembayaran: merepresentasikan pilihan metode pembayaran yang didukung
public enum MetodePembayaran
{
    QRIS,           // Pembayaran via QR Code
    ETOLL_MANDIRI,  // Kartu e-Toll Bank Mandiri
    ETOLL_BRI,      // Kartu e-Toll Bank BRI
    CASH            // Tunai (dibantu petugas)
}
