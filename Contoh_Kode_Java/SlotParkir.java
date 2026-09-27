package com.spct.model;

import jakarta.persistence.*;

@Entity
@Table(name = "slot_parkir") // Sesuai dengan nama tabel di database
public class SlotParkir {

    @Id // Menandakan ini Primary Key
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Sesuai tipe SERIAL/Auto-Increment
    private Long idSlot; 

    @Column(nullable = false)
    private String zona;

    @Column(nullable = false)
    private String lantai;

    @Column(name = "status_slot")
    private String statusSlot; // Contoh: "Kosong", "Terisi", "Dipesan"

    // Konstruktor
    public SlotParkir() {}

    // Getter dan Setter
    public Long getIdSlot() {
        return idSlot;
    }

    public void setIdSlot(Long idSlot) {
        this.idSlot = idSlot;
    }

    public String getZona() {
        return zona;
    }

    public void setZona(String zona) {
        this.zona = zona;
    }

    public String getLantai() {
        return lantai;
    }

    public void setLantai(String lantai) {
        this.lantai = lantai;
    }

    public String getStatusSlot() {
        return statusSlot;
    }

    public void setStatusSlot(String statusSlot) {
        this.statusSlot = statusSlot;
    }
}
