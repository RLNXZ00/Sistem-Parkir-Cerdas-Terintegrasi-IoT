package com.spct.model; // Nama package dari modul model entitas sistem

// Enum publik java dari StatusPembayaran: merepresentasikan siklus status pembayaran transaksi parkir
public enum StatusPembayaran
{
    // Status BELUM_LUNAS: tiket parkir aktif dan belum dibayar di gardu keluar
    BELUM_LUNAS,
    
    // Status PROSES_GATEWAY: proses verifikasi pembayaran sedang berlangsung di gateway transaksi
    PROSES_GATEWAY,
    
    // Status LUNAS: transaksi telah berhasil dibayar lunas dan palang keluar dibuka
    LUNAS,
    
    // Status GRACE_PERIOD_FREE: durasi parkir di bawah batas toleransi (bebas biaya)
    GRACE_PERIOD_FREE
}
