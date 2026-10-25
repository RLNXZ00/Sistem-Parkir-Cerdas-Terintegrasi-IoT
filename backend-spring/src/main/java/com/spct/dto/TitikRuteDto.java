package com.spct.dto; // Nama package DTO

// Kelas publik TitikRuteDto untuk menyimpan koordinat spasial simpul rute navigasi visual Kiosk
public class TitikRuteDto 
{
    // Deklarasi atribut id bertipe String untuk menyimpan identifier simpul graf (misal: "Gate-A", "N-1", "NODE_B1_3")
    private String id;

    // Deklarasi atribut x bertipe Double untuk menyimpan posisi koordinat sumbu X pada denah 2D
    private Double x;

    // Deklarasi atribut y bertipe Double untuk menyimpan posisi koordinat sumbu Y pada denah 2D
    private Double y;

    // Constructor dengan parameter untuk inisialisasi simpul koordinat rute
    public TitikRuteDto(String id, Double x, Double y) 
    {
        // Inisialisasi atribut id dengan parameter id
        this.id = id;

        // Inisialisasi atribut x dengan parameter x
        this.x = x;

        // Inisialisasi atribut y dengan parameter y
        this.y = y;
    }

    // Constructor default tanpa parameter (diperlukan untuk serialisasi JSON oleh Spring Jackson)
    public TitikRuteDto() 
    {
    }

    // Method setter setId(String) untuk mengubah nilai identifier simpul
    public void setId(String id) 
    {
        // Mengubah nilai atribut id dengan parameter id yang diberikan
        this.id = id;
    }

    // Method getter getId() untuk mengambil nilai identifier simpul
    public String getId() 
    {
        // Mengembalikan nilai atribut id
        return this.id;
    }

    // Method setter setX(Double) untuk mengubah nilai koordinat X
    public void setX(Double x) 
    {
        // Mengubah nilai atribut x dengan parameter x yang diberikan
        this.x = x;
    }

    // Method getter getX() untuk mengambil nilai koordinat X
    public Double getX() 
    {
        // Mengembalikan nilai atribut x
        return this.x;
    }

    // Method setter setY(Double) untuk mengubah nilai koordinat Y
    public void setY(Double y) 
    {
        // Mengubah nilai atribut y dengan parameter y yang diberikan
        this.y = y;
    }

    // Method getter getY() untuk mengambil nilai koordinat Y
    public Double getY() 
    {
        // Mengembalikan nilai atribut y
        return this.y;
    }
}
