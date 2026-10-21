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
import com.spct.model.User;
import com.spct.repository.UserRepository;
import com.spct.model.DataKendaraan;
import com.spct.model.JenisKendaraan;
import com.spct.repository.DataKendaraanRepository;
import com.spct.model.TransaksiParkir;
import com.spct.model.StatusPembayaran;
import com.spct.repository.TransaksiParkirRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import org.springframework.scheduling.annotation.EnableScheduling;

import com.spct.model.KameraAnpr;
import com.spct.model.SensorIoT;
import com.spct.repository.KameraAnprRepository;
import com.spct.repository.SensorIoTRepository;

@SpringBootApplication
@EnableScheduling
public class SpctApplication {
    // Konfigurasi denah gedung parkir: jumlah lantai dan jumlah slot per zona (per lantai per jenis kendaraan)
    private static final int JUMLAH_LANTAI = 3;
    private static final int SLOT_PER_ZONA = 16;

    public static void main(String[] args) {
        SpringApplication.run(SpctApplication.class, args);
        System.out.println("==========================================================");
        System.out.println("SERVER SPCT IoT BERHASIL DIJALANKAN DI PORT 8081");
        System.out.println("==========================================================");
    }

    // Method seederData bertipe CommandLineRunner untuk auto-seeder data master
    // (Akun, Slot Mobil & Motor per Lantai, 4 Kamera ANPR, Sensor IoT per Slot)
    @Bean
    public CommandLineRunner seederData(
            SlotParkirRepository slotRepo, // Injeksi repository slot_parkir
            UserRepository userRepo, // Injeksi repository users
            KameraAnprRepository kameraRepo, // Injeksi repository kamera_anpr
            SensorIoTRepository sensorRepo // Injeksi repository sensor_iot
    ) {
        return args -> {
            // =====================================================================
            // 1. Sinkronisasi Akun Pengguna Default (Admin, Petugas, Manajer)
            // =====================================================================
            System.out.println("SINKRONISASI AKUN DEFAULT...");

            // Cek apakah akun admin sudah terdaftar di database
            if (userRepo.findByUsername("admin").isEmpty()) {
                // Inisialisasi objek user admin baru dengan role ADMIN
                User admin = new User("admin", "admin123", "Administrator Sistem", "ADMIN");
                // Menyimpan data akun admin ke tabel users
                userRepo.save(admin);
                System.out.println("AKUN ADMIN BERHASIL DIBUAT (user: admin, pass: admin123)");
            }

            // Cek apakah akun petugas01 sudah terdaftar di database
            if (userRepo.findByUsername("petugas01").isEmpty()) {
                // Inisialisasi objek user petugas01 baru dengan role PETUGAS_LAPANGAN
                User petugas = new User("petugas01", "petugas123", "Budi Santoso", "PETUGAS_LAPANGAN");
                // Menyimpan data akun petugas01 ke tabel users
                userRepo.save(petugas);
                System.out.println("AKUN PETUGAS BERHASIL DIBUAT (user: petugas01, pass: petugas123)");
            }

            // Cek apakah akun manajer sudah terdaftar di database
            if (userRepo.findByUsername("manajer").isEmpty()) {
                // Inisialisasi objek user manajer baru dengan role Manajemen RS
                User manajer = new User("manajer", "manajer123", "Manajer RS Panti Rapih", "Manajemen RS");
                // Menyimpan data akun manajer ke tabel users
                userRepo.save(manajer);
                System.out.println("AKUN MANAJER BERHASIL DIBUAT (user: manajer, pass: manajer123)");
            }

            // =====================================================================
            // 2. Sinkronisasi Slot Parkir Multi-Lantai (Mobil & Motor)
            // =====================================================================
            System.out.println("SINKRONISASI KOORDINAT SLOT PARKIR (GRID MULTI-LANTAI)...");
            // Looping setiap lantai (1 s.d. JUMLAH_LANTAI)
            for (int lantai = 1; lantai <= JUMLAH_LANTAI; lantai++) {
                // Looping setiap jenis kendaraan: MOBIL (prefix B) dan MOTOR (prefix M)
                for (JenisKendaraan jenis : JenisKendaraan.values()) {
                    // Menentukan prefix kode slot: B = Basement mobil, M = zona motor
                    String zona = ((jenis == JenisKendaraan.MOBIL) ? "B" : "M") + lantai;

                    // Looping i dari 1 hingga SLOT_PER_ZONA untuk membentuk slot pada zona ini
                    for (int i = 1; i <= SLOT_PER_ZONA; i++) {
                        // Menentukan idSlot dengan format dua digit angka (misal: B1-01, B2-16, M1-05)
                        String idSlot = zona + "-" + String.format("%02d", i);
                        // Menentukan nodeId penanda titik pada peta navigasi graf (misal: NODE_B1_1, NODE_M2_5)
                        String nodeId = "NODE_" + zona + "_" + i;

                        // Menghitung indeks kolom grid kiosk (kelipatan 2 baris)
                        int col = (i + 1) / 2;
                        // Menghitung koordinat sumbu X pada denah
                        Double x = 20.0 * col;
                        // Menghitung koordinat sumbu Y pada denah (baris atas atau bawah)
                        Double y = (i % 2 != 0) ? 30.0 : 70.0;

                        // Mencari apakah idSlot sudah tersimpan di database
                        java.util.Optional<SlotParkir> existingSlot = slotRepo.findById(idSlot);
                        // Jika slot sudah ada sebelumnya di database, maka:
                        if (existingSlot.isPresent()) {
                            // Mengambil referensi entitas slot yang sudah ada
                            SlotParkir slot = existingSlot.get();
                            // Memperbarui atribut nodeId
                            slot.setNodeId(nodeId);
                            // Memperbarui koordinat X
                            slot.setKoordinatX(x);
                            // Memperbarui koordinat Y
                            slot.setKoordinatY(y);
                            // Backfill peruntukan slot (data lama B1-xx belum memiliki jenis_kendaraan)
                            slot.setJenisKendaraan(jenis);
                            // Menyimpan kembali pembaruan data slot ke database
                            slotRepo.save(slot);
                        } else { // Jika slot belum ada di database, maka:
                            // Inisialisasi entitas objek SlotParkir baru
                            SlotParkir slot = new SlotParkir(idSlot, lantai, nodeId, x, y);
                            // Mengatur peruntukan slot (MOBIL / MOTOR)
                            slot.setJenisKendaraan(jenis);
                            // Mengatur status awal slot parkir menjadi KOSONG
                            slot.setStatusSlot(StatusSlot.KOSONG);
                            // Menyimpan data slot baru ke tabel slot_parkir
                            slotRepo.save(slot);
                        }
                    }
                }
            }
            System.out.println("SLOT PARKIR MOBIL & MOTOR (" + JUMLAH_LANTAI + " LANTAI) BERHASIL DISINKRONISASI!");

            // =====================================================================
            // 3. Sinkronisasi Status Kamera ANPR (4 Unit Gerbang Masuk & Keluar)
            // =====================================================================
            System.out.println("SINKRONISASI UNIT KAMERA ANPR...");
            // Definisi array data master 4 kamera ANPR gerbang
            String[][] dataKamera = {
                    { "PG-IN-MOB", "MASUK", "MOBIL", "Gerbang Masuk Jalur Mobil (Kiri)" },
                    { "PG-IN-MOT", "MASUK", "MOTOR", "Gerbang Masuk Jalur Motor (Kanan)" },
                    { "PG-OUT-MOB", "KELUAR", "MOBIL", "Gerbang Keluar Jalur Mobil (Kiri)" },
                    { "PG-OUT-MOT", "KELUAR", "MOTOR", "Gerbang Keluar Jalur Motor (Kanan)" }
            };

            // Melakukan perulangan untuk setiap data kamera dalam array dataKamera
            for (String[] k : dataKamera) {
                // Mengambil nilai idKamera dari array
                String idKamera = k[0];
                // Cek apakah kamera sudah ada di tabel kamera_anpr
                if (kameraRepo.findById(idKamera).isEmpty()) {
                    // Parsing enum jenis kendaraan MOBIL / MOTOR
                    JenisKendaraan tipe = "MOBIL".equals(k[2]) ? JenisKendaraan.MOBIL : JenisKendaraan.MOTOR;
                    // Inisialisasi objek KameraAnpr baru
                    KameraAnpr kamera = new KameraAnpr(idKamera, k[1], tipe, k[3]);
                    // Mengatur status operasional kamera menjadi ON
                    kamera.setStatusKamera("ON");
                    // Menyimpan entitas kamera ke tabel kamera_anpr
                    kameraRepo.save(kamera);
                    System.out.println("KAMERA ANPR BERHASIL DIDAFTARKAN: " + idKamera);
                }
            }
            System.out.println("4 UNIT KAMERA ANPR BERHASIL DISINKRONISASI!");

            // =====================================================================
            // 4. Sinkronisasi Sensor IoT per-Slot (satu sensor ultrasonic untuk setiap slot)
            // =====================================================================
            System.out.println("SINKRONISASI SENSOR IOT PER-SLOT...");
            // Melakukan perulangan untuk setiap slot yang ada di database (semua lantai, mobil & motor)
            for (SlotParkir slotTarget : slotRepo.findAll()) {
                // Menentukan idSensor dengan format SNS-<idSlot> (misal: SNS-B1-01, SNS-M2-05)
                String idSensor = "SNS-" + slotTarget.getIdSlot();

                // Cek apakah sensor sudah tersimpan di tabel sensor_iot
                if (sensorRepo.findById(idSensor).isEmpty()) {
                    // Inisialisasi objek SensorIoT baru yang memantau slot tersebut
                    SensorIoT sensor = new SensorIoT(idSensor, slotTarget);
                    // Mengatur status operasional sensor menjadi ON
                    sensor.setStatusSensor("ON");
                    // Menyimpan entitas sensor ke tabel sensor_iot
                    sensorRepo.save(sensor);
                }
            }
            System.out.println("UNIT SENSOR IOT PER-SLOT BERHASIL DISINKRONISASI!");
        };
    }
}
