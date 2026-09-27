package com.spct.controller;

import com.spct.model.SlotParkir;
import com.spct.service.AlokasiRuteService;
import org.springframework.web.bind.annotation.*;

@RestController // Pintu gerbang untuk Frontend/Hardware
@RequestMapping("/api/parkir")
public class TerminalMasukController {

    private final AlokasiRuteService alokasiService;

    public TerminalMasukController(AlokasiRuteService alokasiService) {
        this.alokasiService = alokasiService;
    }

    // Endpoint yang dipanggil oleh Kios Frontend saat mobil baru datang dan selesai di-scan YOLO
    @PostMapping("/alokasi")
    public SlotParkir alokasikanSlot(@RequestParam String jenisKendaraan, @RequestParam String platNomor) {
        
        // Panggil algoritma mencari slot di kelas Service
        return alokasiService.cariSlotTerbaik(jenisKendaraan);
    }
}
