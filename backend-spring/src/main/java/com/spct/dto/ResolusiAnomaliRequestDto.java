package com.spct.dto; // Nama package DTO

// Kelas publik ResolusiAnomaliRequestDto untuk menampung request body saat petugas memvalidasi anomali
public class ResolusiAnomaliRequestDto
{
    // Deklarasi atribut jenisAnomali bertipe String untuk menyimpan pilihan jenis anomali (misal: 'Salah Parkir', 'Benda Asing', 'Keberadaan Manusia')
    private String jenisAnomali;

    // Deklarasi atribut catatanTambahan bertipe String untuk menyimpan catatan atau deskripsi tambahan dari petugas lapangan
    private String catatanTambahan;

    // Constructor default tanpa parameter (diperlukan untuk deserialisasi JSON oleh Spring Boot Jackson)
    public ResolusiAnomaliRequestDto()
    {
    }

    // Constructor dengan parameter untuk inisialisasi data resolusi anomali
    public ResolusiAnomaliRequestDto(String jenisAnomali, String catatanTambahan)
    {
        // Inisialisasi atribut jenisAnomali dengan parameter jenisAnomali
        this.jenisAnomali = jenisAnomali;

        // Inisialisasi atribut catatanTambahan dengan parameter catatanTambahan
        this.catatanTambahan = catatanTambahan;
    }

    // Method getter getJenisAnomali() untuk mengambil nilai jenis anomali
    public String getJenisAnomali()
    {
        // Mengembalikan nilai atribut jenisAnomali
        return this.jenisAnomali;
    }

    // Method setter setJenisAnomali(String) untuk mengubah nilai jenis anomali
    public void setJenisAnomali(String jenisAnomali)
    {
        // Mengubah nilai atribut jenisAnomali dengan parameter yang diberikan
        this.jenisAnomali = jenisAnomali;
    }

    // Method getter getCatatanTambahan() untuk mengambil nilai catatan tambahan
    public String getCatatanTambahan()
    {
        // Mengembalikan nilai atribut catatanTambahan
        return this.catatanTambahan;
    }

    // Method setter setCatatanTambahan(String) untuk mengubah nilai catatan tambahan
    public void setCatatanTambahan(String catatanTambahan)
    {
        // Mengubah nilai atribut catatanTambahan dengan parameter yang diberikan
        this.catatanTambahan = catatanTambahan;
    }
}
