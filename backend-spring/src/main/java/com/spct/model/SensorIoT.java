package com.spct.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

// Deklarasi Entity: merepresentasikan tabel 'sensor_iot' di Database Relasional
// Tabel MASTER HARDWARE untuk unit sensor ultrasonik yang dipasang di tiap slot parkir
// Setiap sensor memiliki 1 relasi ke 1 SlotParkir (One-to-One)
// Arsitektur: Sensor mengirim sinyal ke backend melalui endpoint IoT Gateway
@Entity
@Table(name = "sensor_iot")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"}) // Cegah error Jackson saat serialisasi proxy Hibernate
public class SensorIoT
{
    // =====================================================================
    // Deklarasi Atribut: Kolom-kolom tabel 'sensor_iot'
    // =====================================================================

    @Id
    @Column(name = "id_sensor", length = 20)
    private String idSensor; // ID unik sensor (misal: "SNS-B1-01") - mengikuti ID slot parkir

    // Status operasional sensor saat ini
    // Sesuai ERD: status_sensor (on/off)
    @Column(name = "status_sensor", nullable = false, length = 3)
    private String statusSensor; // "ON" atau "OFF" - jika OFF akan tercatat sebagai anomali

    // Relasi ke SlotParkir: tiap sensor memantau TEPAT SATU slot (One-to-One)
    // Satu slot juga hanya punya satu sensor
    @OneToOne(fetch = FetchType.EAGER) // EAGER: langsung load data slot saat sensor di-query
    @JoinColumn(name = "id_slot", nullable = false, unique = true) // FK unik ke slot_parkir
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "kendaraanAktif"}) // Cegah circular reference ke DataKendaraan
    private SlotParkir slotDipantau; // Slot parkir yang dipantau sensor ini


    // =====================================================================
    // Konstruktor LENGKAP (gaya penulisan Anda)
    // =====================================================================
    public SensorIoT(String idSensor, SlotParkir slotDipantau)
    {
        this.idSensor = idSensor;           // Menginisialisasi ID sensor (format: SNS-B1-01)
        this.slotDipantau = slotDipantau;   // Menginisialisasi relasi ke slot yang dipantau
        this.statusSensor = "ON";           // Default: sensor ON saat diregistrasikan
    }

    // Konstruktor kosong (wajib ada untuk JPA/Hibernate)
    public SensorIoT() {}


    // =====================================================================
    // Getter & Setter (gaya penulisan Anda)
    // =====================================================================

    public void setIdSensor(String idSensor)
    {
        this.idSensor = idSensor;
    }

    public String getIdSensor()
    {
        return idSensor;
    }

    public void setStatusSensor(String statusSensor)
    {
        // Normalisasi ke uppercase agar konsisten (toleransi nilai DB: 'on', 'OFF', 'On')
        this.statusSensor = (statusSensor != null) ? statusSensor.toUpperCase() : "OFF";
    }

    public String getStatusSensor()
    {
        return statusSensor;
    }

    public void setSlotDipantau(SlotParkir slotDipantau)
    {
        this.slotDipantau = slotDipantau;
    }

    public SlotParkir getSlotDipantau()
    {
        return slotDipantau;
    }
}
