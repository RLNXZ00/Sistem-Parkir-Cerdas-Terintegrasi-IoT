package com.spct.model; // Nama package dari modul model entitas sistem

// Enum publik java dari TingkatKeparahan: merepresentasikan derajat keparahan insiden/anomali
public enum TingkatKeparahan
{
    // Derajat INFO: insiden operasional normal atau informasi umum
    INFO,
    
    // Derajat WARNING: insiden yang membutuhkan perhatian dan pengawasan petugas
    WARNING,
    
    // Derajat CRITICAL: anomali kritis yang memerlukan respons tindakan darurat segera
    CRITICAL
}
