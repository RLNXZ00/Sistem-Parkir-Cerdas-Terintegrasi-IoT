package com.spct.model; // Nama package dari modul model entitas sistem

// Import anotasi Jackson untuk penanganan serialisasi objek JSON
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
// Import pustaka persistensi database Jakarta JPA
import jakarta.persistence.*;

// Kelas entitas publik java SensorIoT untuk memetakan tabel sensor_iot di database relasional
// Kelas ini merepresentasikan master unit sensor ultrasonik pemantau ketersediaan slot parkir
@Entity // Menandai kelas ini sebagai entitas JPA
@Table(name = "sensor_iot") // Memetakan kelas ke tabel sensor_iot
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"}) // Mengabaikan atribut proxy internal hibernate pada serialisasi JSON
public class SensorIoT
{
    // =====================================================================
    // Deklarasi Atribut Kolom Tabel sensor_iot
    // =====================================================================

    @Id // Menandai atribut idSensor sebagai Primary Key tabel
    @Column(name = "id_sensor", length = 20) // Pemetaan kolom id_sensor dengan panjang 20 karakter
    private String idSensor; // Deklarasi atribut idSensor bertipe String untuk identitas unik sensor (misal: SNS-B1-01)

    @Column(name = "status_sensor", nullable = false, length = 3) // Pemetaan kolom status_sensor dengan batasan not-null
    private String statusSensor; // Deklarasi atribut statusSensor bertipe String untuk status operasional (ON/OFF)

    @OneToOne(fetch = FetchType.EAGER) // Relasi satu-ke-satu dengan slot parkir dengan pemuatan instan (EAGER)
    @JoinColumn(name = "id_slot", nullable = false, unique = true) // Foreign key unik ke tabel slot_parkir
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "kendaraanAktif"}) // Mencegah referensi sirkular serialisasi ke kendaraan
    private SlotParkir slotDipantau; // Deklarasi atribut slotDipantau bertipe objek SlotParkir yang dimonitor

    // =====================================================================
    // Konstruktor Kelas SensorIoT
    // =====================================================================

    // Konstruktor dengan parameter idSensor dan slotDipantau
    public SensorIoT(String idSensor, SlotParkir slotDipantau)
    {
        this.idSensor = idSensor; // Inisialisasi atribut idSensor dengan nilai parameter idSensor
        this.slotDipantau = slotDipantau; // Inisialisasi atribut slotDipantau dengan nilai parameter slotDipantau
        this.statusSensor = "ON"; // Inisialisasi status default sensor bernilai ON
    }

    // Konstruktor default tanpa parameter untuk JPA
    public SensorIoT() 
    {
        // Konstruktor kosong untuk kebutuhan instansiasi JPA Hibernate
    }

    // =====================================================================
    // Method Setter & Getter Atribut
    // =====================================================================

    // Method setter setIdSensor untuk mengubah nilai atribut idSensor
    public void setIdSensor(String idSensor)
    {
        this.idSensor = idSensor; // Mengubah nilai atribut idSensor dari nilai parameter
    }

    // Method getter getIdSensor untuk mengambil nilai atribut idSensor
    public String getIdSensor()
    {
        return idSensor; // Mengembalikan nilai dari atribut idSensor
    }

    // Method setter setStatusSensor untuk mengubah status operasional sensor
    public void setStatusSensor(String statusSensor)
    {
        // Jika parameter tidak bernilai null, ubah ke uppercase; jika tidak beri nilai "OFF"
        this.statusSensor = (statusSensor != null) ? statusSensor.toUpperCase() : "OFF";
    }

    // Method getter getStatusSensor untuk mengambil nilai status operasional sensor
    public String getStatusSensor()
    {
        return statusSensor; // Mengembalikan nilai dari atribut statusSensor
    }

    // Method setter setSlotDipantau untuk mengubah objek slot parkir yang dipantau
    public void setSlotDipantau(SlotParkir slotDipantau)
    {
        this.slotDipantau = slotDipantau; // Inisialisasi atribut slotDipantau dengan nilai objek dari parameter
    }

    // Method getter getSlotDipantau untuk mengambil objek slot parkir yang dipantau
    public SlotParkir getSlotDipantau()
    {
        return slotDipantau; // Mengembalikan objek slot parkir dari atribut slotDipantau
    }
}
