package com.spct.repository; // Nama package dari modul repositori akses data sistem

// Import entitas SensorIoT dari package model
import com.spct.model.SensorIoT;
// Import antarmuka JpaRepository dari Spring Data JPA
import org.springframework.data.jpa.repository.JpaRepository;
// Import anotasi Repository dari komponen Spring Framework
import org.springframework.stereotype.Repository;
// Import koleksi List dari java util
import java.util.List;
// Import kelas utilitas Optional dari java util
import java.util.Optional;

// Interface publik java SensorIoTRepository untuk operasi akses basis data tabel sensor_iot
// Menyediakan operasi kueri status unit sensor ultrasonik pendeteksi keberadaan kendaraan
@Repository // Menandai interface ini sebagai komponen Spring Repository
public interface SensorIoTRepository extends JpaRepository<SensorIoT, String>
{
    // Method findByStatusSensor untuk mencari seluruh sensor berdasarkan status operasional (ON/OFF)
    List<SensorIoT> findByStatusSensor(String statusSensor); // Mengembalikan daftar List objek SensorIoT

    // Method findBySlotDipantau_IdSlot untuk mencari sensor berdasarkan id slot yang dipantaunya
    Optional<SensorIoT> findBySlotDipantau_IdSlot(String idSlot); // Mengembalikan objek Optional pembungkus SensorIoT
}
