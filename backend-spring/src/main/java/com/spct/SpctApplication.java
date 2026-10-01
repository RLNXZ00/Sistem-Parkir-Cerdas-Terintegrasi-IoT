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
            if (slotRepo.count() == 0) {
                System.out.println("MENGINISIALISASI DATA SLOT PARKIR...");
                for (int i = 1; i <= 15; i++) {
                    String idSlot = "B1-" + String.format("%02d", i);
                    String nodeId = "NODE_B1_" + i;
                    Double x = 10.0 * i;
                    Double y = 20.0;
                    
                    // Menggunakan konstruktor berparameter karena tidak ada metode setter untuk field-field ini
                    SlotParkir slot = new SlotParkir(idSlot, 1, nodeId, x, y);
                    slotRepo.save(slot);
                }
                System.out.println("15 SLOT PARKIR BERHASIL DIBUAT!");
            }
        };
    }
}
