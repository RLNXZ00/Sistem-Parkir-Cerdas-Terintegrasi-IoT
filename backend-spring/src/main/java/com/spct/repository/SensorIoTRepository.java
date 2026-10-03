package com.spct.repository;

import com.spct.model.SensorIoT;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

// Repository untuk entitas SensorIoT
// Menyediakan operasi CRUD ke tabel 'sensor_iot' di database
@Repository
public interface SensorIoTRepository extends JpaRepository<SensorIoT, String>
{
    // Mencari semua sensor yang statusnya tertentu (untuk monitoring / alert jika sensor mati)
    List<SensorIoT> findByStatusSensor(String statusSensor);

    // Mencari sensor berdasarkan slot yang dipantaunya (untuk validasi kesesuaian sensor-slot)
    Optional<SensorIoT> findBySlotDipantau_IdSlot(String idSlot);
}
