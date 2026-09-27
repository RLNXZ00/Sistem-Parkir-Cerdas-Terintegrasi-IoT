package com.spct.service;

import com.spct.model.SlotParkir;
import com.spct.repository.SlotParkirRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service // Otak logika bisnis
public class AlokasiRuteService {

    private final SlotParkirRepository slotRepository;

    public AlokasiRuteService(SlotParkirRepository slotRepository) {
        this.slotRepository = slotRepository;
    }

    public SlotParkir cariSlotTerbaik(String jenisKendaraan) {
        // 1. Kueri ke database: Cari semua slot yang statusnya "Kosong"
        List<SlotParkir> slotTersedia = slotRepository.findByStatusSlot("Kosong");
        
        if (slotTersedia.isEmpty()) {
            throw new RuntimeException("Parkir Penuh!");
        }

        // 2. Logika Algoritma Rute: Ambil jarak terdekat (Ini versi simpelnya)
        SlotParkir slotTerbaik = slotTersedia.get(0); 

        // 3. Ubah status jadi "Dipesan" agar tidak diserobot mobil lain!
        slotTerbaik.setStatusSlot("Dipesan");
        slotRepository.save(slotTerbaik); // Simpan pembaruan ke database

        return slotTerbaik;
    }
}
