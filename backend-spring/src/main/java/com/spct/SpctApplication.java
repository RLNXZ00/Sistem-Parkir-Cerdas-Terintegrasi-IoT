package com.spct;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// Ini adalah Kelas Utama (Main Class) yang bertugas untuk menjalankan server Spring Boot.
// Sama seperti fungsi public static void main(String[] args) pada Java Core Anda.
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import com.spct.model.*;
import com.spct.repository.*;

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

    // =====================================================================
    // Seeder Otomatis: Mengisi semua tabel MASTER saat server pertama dijalankan
    // Urutan penting: SlotParkir → KameraAnpr → SensorIoT (ada relasi FK ke SlotParkir)
    // → User (berdiri sendiri)
    // =====================================================================
    @Bean
    public CommandLineRunner seederData(
        SlotParkirRepository slotRepo,
        KameraAnprRepository kameraRepo,
        SensorIoTRepository sensorRepo,
        UserRepository userRepo
    ) {
        return args -> {

            // ──────────────────────────────────────────────────────────────
            // 1. SEED SLOT PARKIR (15 Slot, Grid Siku-siku, Koordinat A* BFS)
            // ──────────────────────────────────────────────────────────────
            System.out.println("[SEEDER] Menyinkronkan 15 Slot Parkir (Grid A* BFS)...");
            for (int i = 1; i <= 15; i++) {
                String idSlot = "B1-" + String.format("%02d", i);
                String nodeId = "NODE_B1_" + i;

                // Rumus koordinat mengikuti Grid Kiosk (sinkron dengan AlokasiRuteService.java)
                int col = (i + 1) / 2;
                Double x = 20.0 * col;
                Double y = (i % 2 != 0) ? 30.0 : 70.0; // Ganjil = baris atas, Genap = baris bawah

                java.util.Optional<SlotParkir> existingSlot = slotRepo.findById(idSlot);
                if (existingSlot.isPresent()) {
                    // Update koordinat + reset status untuk simulasi ulang
                    SlotParkir slot = existingSlot.get();
                    slot.setNodeId(nodeId);
                    slot.setKoordinatX(x);
                    slot.setKoordinatY(y);
                    slot.setStatusSlot(StatusSlot.KOSONG);
                    slot.setKendaraanAktif(null);
                    slot.setWaktuDipesan(null);
                    slotRepo.save(slot);
                } else {
                    SlotParkir slot = new SlotParkir(idSlot, 1, nodeId, x, y);
                    slot.setStatusSlot(StatusSlot.KOSONG);
                    slotRepo.save(slot);
                }
            }
            System.out.println("[SEEDER] ✓ 15 Slot Parkir berhasil disinkronisasi!");

            // ──────────────────────────────────────────────────────────────
            // 2. SEED KAMERA ANPR (4 unit: 2 Masuk + 2 Keluar)
            //    Sesuai desain sistem: 2 jalur masuk (Mobil & Motor) + 2 jalur keluar
            // ──────────────────────────────────────────────────────────────
            System.out.println("[SEEDER] Menginisialisasi 4 unit Kamera ANPR...");
            Object[][] dataKamera = {
                {"PG-IN-MOB",  "MASUK",  JenisKendaraan.MOBIL,  "Gerbang Masuk Jalur Mobil (Kiri)"},
                {"PG-IN-MOT",  "MASUK",  JenisKendaraan.MOTOR,  "Gerbang Masuk Jalur Motor (Kanan)"},
                {"PG-OUT-MOB", "KELUAR", JenisKendaraan.MOBIL,  "Gerbang Keluar Jalur Mobil (Kiri)"},
                {"PG-OUT-MOT", "KELUAR", JenisKendaraan.MOTOR,  "Gerbang Keluar Jalur Motor (Kanan)"}
            };
            for (Object[] d : dataKamera) {
                String idKamera = (String) d[0];
                if (!kameraRepo.existsById(idKamera)) {
                    KameraAnpr kamera = new KameraAnpr(
                        idKamera,
                        (String) d[1],
                        (JenisKendaraan) d[2],
                        (String) d[3]
                    );
                    kameraRepo.save(kamera);
                }
            }
            System.out.println("[SEEDER] ✓ 4 Kamera ANPR berhasil diinisialisasi!");

            // ──────────────────────────────────────────────────────────────
            // 3. SEED SENSOR IoT (15 sensor, satu per slot parkir)
            //    ID Sensor mengikuti format: SNS-<idSlot>
            // ──────────────────────────────────────────────────────────────
            System.out.println("[SEEDER] Menginisialisasi 15 Sensor IoT (per Slot)...");
            for (int i = 1; i <= 15; i++) {
                String idSlot   = "B1-" + String.format("%02d", i);
                String idSensor = "SNS-" + idSlot;

                if (!sensorRepo.existsById(idSensor)) {
                    java.util.Optional<SlotParkir> slotOpt = slotRepo.findById(idSlot);
                    slotOpt.ifPresent(slot -> {
                        SensorIoT sensor = new SensorIoT(idSensor, slot);
                        sensorRepo.save(sensor);
                    });
                }
            }
            System.out.println("[SEEDER] ✓ 15 Sensor IoT berhasil diinisialisasi!");

            // ──────────────────────────────────────────────────────────────
            // 4. SEED USER (Akun default Admin dan Petugas untuk login Dashboard)
            //    Password disimpan plain-text untuk prototype MVP.
            //    Di produksi nyata: ganti dengan BCryptPasswordEncoder.
            // ──────────────────────────────────────────────────────────────
            System.out.println("[SEEDER] Membuat akun default Admin dan Petugas...");
            if (!userRepo.existsByUsername("admin")) {
                userRepo.save(new User("admin",    "admin123",   "Administrator Sistem",  "ADMIN"));
            }
            if (!userRepo.existsByUsername("petugas01")) {
                userRepo.save(new User("petugas01", "petugas123", "Budi Santoso",         "PETUGAS_LAPANGAN"));
            }
            System.out.println("[SEEDER] ✓ Akun default berhasil dibuat! (admin / petugas01)");

            System.out.println("==========================================================");
            System.out.println("SEEDER SELESAI: 9 TABEL DATABASE SIAP DIGUNAKAN!");
            System.out.println("==========================================================");
        };
    }
}
