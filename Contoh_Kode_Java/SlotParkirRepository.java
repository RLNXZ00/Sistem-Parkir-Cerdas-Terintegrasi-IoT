package com.spct.repository;

import com.spct.model.SlotParkir;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SlotParkirRepository extends JpaRepository<SlotParkir, Long> {
    
    // Ajaibnya Spring: Cukup tulis nama metode (findBy...), ia otomatis membuat query: 
    // SELECT * FROM slot_parkir WHERE status_slot = ?
    List<SlotParkir> findByStatusSlot(String statusSlot);
}
