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

    // Seeder Otomatis: Membuat 15 Slot Parkir dan Akun Manajer jika database masih kosong
    @Bean
    public CommandLineRunner seederData(SlotParkirRepository slotRepo, UserRepository userRepo, DataKendaraanRepository kendaraanRepo, TransaksiParkirRepository transaksiRepo) {
        return args -> {
            System.out.println("SINKRONISASI AKUN DEFAULT...");
            if (userRepo.findByUsername("manajer").isEmpty()) {
                User manajer = new User("manajer", "manajer123", "Manajer RS Panti Rapih", "Manajemen RS");
                userRepo.save(manajer);
                System.out.println("AKUN MANAJER BERHASIL DIBUAT (user: manajer, pass: manajer123)");
            }

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

            System.out.println("SINKRONISASI DATA TRANSAKSI DUMMY UNTUK DASHBOARD MANAJER...");
            if (kendaraanRepo.count() == 0) {
                // Buat 5 Kendaraan Dummy
                for (int i = 1; i <= 5; i++) {
                    DataKendaraan k = new DataKendaraan("AB" + i + "000CD", (i % 2 == 0) ? JenisKendaraan.MOBIL : JenisKendaraan.MOTOR);
                    kendaraanRepo.save(k);
                    
                    // Transaksi kemarin (LUNAS)
                    TransaksiParkir tk = new TransaksiParkir(k, slotRepo.findById("B1-0" + i).orElse(null));
                    tk.setWaktuMasuk(LocalDateTime.now().minusDays(1).minusHours(2));
                    tk.setWaktuKeluar(LocalDateTime.now().minusDays(1));
                    tk.setStatusPembayaran(StatusPembayaran.LUNAS);
                    tk.setNominalTagihan(BigDecimal.valueOf(15000));
                    transaksiRepo.save(tk);

                    // Transaksi hari ini (LUNAS)
                    TransaksiParkir th = new TransaksiParkir(k, slotRepo.findById("B1-1" + i).orElse(null));
                    th.setWaktuMasuk(LocalDateTime.now().minusHours(3));
                    th.setWaktuKeluar(LocalDateTime.now().minusHours(1));
                    th.setStatusPembayaran(StatusPembayaran.LUNAS);
                    th.setNominalTagihan(BigDecimal.valueOf(20000));
                    transaksiRepo.save(th);
                }
                System.out.println("DATA TRANSAKSI DUMMY BERHASIL DITAMBAHKAN!");
            }
        };
    }
}
