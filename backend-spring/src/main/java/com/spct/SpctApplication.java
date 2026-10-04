package com.spct;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// Ini adalah Kelas Utama (Main Class) yang bertugas untuk menjalankan server Spring Boot.
// Sama seperti fungsi public static void main(String[] args) pada Java Core Anda.
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import com.spct.model.SlotParkir;
import com.spct.model.StatusSlot;
import com.spct.repository.SlotParkirRepository;

@SpringBootApplication
public class SpctApplication 
{
    public static void main(String[] args) 
    {
        SpringApplication.run(SpctApplication.class, args);
        System.out.println("==========================================================");
        System.out.println("SERVER SPCT IoT BERHASIL DIJALANKAN DI PORT 8081");
        System.out.println("==========================================================");
    }

    // Seeder Otomatis: Membuat 15 Slot Parkir jika database masih kosong
    @Bean
    public CommandLineRunner seederData(SlotParkirRepository slotRepo) {
        return args -> {
            System.out.println("SINKRONISASI KOORDINAT SLOT PARKIR (GRID)...");
            for (int i = 1; i <= 15; i++) {
                String idSlot = "B1-" + String.format("%02d", i);
                String nodeId = "NODE_B1_" + i;
                
                // Rumus koordinat mengikuti Grid Kiosk
                int col = (i + 1) / 2;
                Double x = 20.0 * col;
                Double y = (i % 2 != 0) ? 30.0 : 70.0;
                
                // Cek apakah slot sudah ada di database
                java.util.Optional<SlotParkir> existingSlot = slotRepo.findById(idSlot);
                if (existingSlot.isPresent()) {
                    // Update koordinat slot lama dan KOSONGKAN slot untuk keperluan simulasi ulang
                    SlotParkir slot = existingSlot.get();
                    slot.setNodeId(nodeId);
                    slot.setKoordinatX(x);
                    slot.setKoordinatY(y);
                    slot.setStatusSlot(StatusSlot.KOSONG);
                    slot.setKendaraanAktif(null);
                    slot.setWaktuDipesan(null);
                    slotRepo.save(slot);
                } else {
                    // Buat slot baru
                    SlotParkir slot = new SlotParkir(idSlot, 1, nodeId, x, y);
                    slot.setStatusSlot(StatusSlot.KOSONG);
                    slotRepo.save(slot);
                }
            }
            System.out.println("15 SLOT PARKIR (GRID) BERHASIL DISINKRONISASI!");
        };
    }
}
