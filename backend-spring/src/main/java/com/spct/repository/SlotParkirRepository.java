package com.spct.repository;

import com.spct.model.SlotParkir;
import com.spct.model.StatusSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

// Deklarasi Repository: pengganti PreparedStatement + ResultSet dari DataBaseConnection.java Anda
// JpaRepository<SlotParkir, String> otomatis menyediakan: findAll(), findById(), save(), delete()
// String = Tipe data dari Primary Key (idSlot berupa String seperti "B1-12")
@Repository
public interface SlotParkirRepository extends JpaRepository<SlotParkir, String>
{
    // =====================================================================
    // Method Kueri Kustom (setara method-method aksi di TableDataGUI.java Anda)
    // Spring Boot secara otomatis menerjemahkan nama method ini menjadi perintah SQL!
    // =====================================================================

    // Mencari daftar slot kosong berdasarkan lantai, diurutkan berdasarkan koordinatX (terdekat dari gerbang)
    // Setara: SELECT * FROM slot_parkir WHERE status_slot = ? AND lantai = ? ORDER BY koordinat_x ASC
    List<SlotParkir> findByStatusSlotAndLantaiOrderByKoordinatXAsc(StatusSlot statusSlot, Integer lantai);

    // Mencari semua slot berdasarkan lantai (untuk keperluan tampilan peta Dashboard)
    // Setara: SELECT * FROM slot_parkir WHERE lantai = ?
    List<SlotParkir> findByLantai(Integer lantai);

    // Mencari slot berdasarkan node_id (digunakan oleh Algoritma A* untuk memetakan koordinat)
    // Setara: SELECT * FROM slot_parkir WHERE node_id = ?
    Optional<SlotParkir> findByNodeId(String nodeId);

    // Mencari semua slot berdasarkan status (untuk menghitung kapasitas tersisa di Dashboard)
    // Setara: SELECT * FROM slot_parkir WHERE status_slot = ?
    List<SlotParkir> findByStatusSlot(StatusSlot statusSlot);
}
