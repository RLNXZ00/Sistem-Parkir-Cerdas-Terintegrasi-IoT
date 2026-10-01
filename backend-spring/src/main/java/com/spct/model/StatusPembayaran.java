package com.spct.model;

// Deklarasi Enum StatusPembayaran: merepresentasikan semua kemungkinan state pembayaran sebuah transaksi
public enum StatusPembayaran
{
    BELUM_LUNAS,        // Kendaraan sudah masuk, belum ada aksi pembayaran di gerbang keluar
    PROSES_GATEWAY,     // Sedang dalam proses verifikasi di Payment Gateway (e-Toll / QRIS)
    LUNAS,              // Pembayaran berhasil dikonfirmasi, palang keluar terbuka
    GRACE_PERIOD_FREE   // Durasi parkir < 10 menit, dibebaskan dari tagihan
}
