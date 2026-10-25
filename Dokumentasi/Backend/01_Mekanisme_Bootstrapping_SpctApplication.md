# 01. Mekanisme Bootstrapping & Lifecycle: SpctApplication.java

Berkas acuan: [SpctApplication.java](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/SpctApplication.java)

---

## 1. Peran Sentral SpctApplication
`SpctApplication.java` adalah **kelas utama (entry point)** dari seluruh backend Spring Boot. Kelas ini bertindak sebagai konduktor utama yang menginisialisasi Spring Container (IoC), memuat konfigurasi basis data, menyalakan web server tertanam (*embedded* Tomcat di port 8081), serta mengeksekusi sinkronisasi data master sebelum sistem melayani request HTTP.

---

## 2. Bedah Anotasi Kelas

Di baris 30–32 pada [SpctApplication.java:30-32](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/SpctApplication.java#L30-L32):

```java
@SpringBootApplication
@EnableScheduling
public class SpctApplication {
```

1. **`@SpringBootApplication`**:
   Merupakan meta-anotasi yang secara otomatis mengaktifkan tiga fitur esensial:
   - `@Configuration`: Menandai kelas ini sebagai sumber definisi bean untuk ApplicationContext.
   - `@EnableAutoConfiguration`: Menginstruksikan Spring Boot untuk secara otomatis mengonfigurasi DataSource PostgreSQL, Hibernate JPA EntityManager, dan Jackson JSON Serializer berdasarkan dependensi `pom.xml`.
   - `@ComponentScan`: Memindai seluruh komponen (`@Controller`, `@Service`, `@Repository`, `@Component`) di dalam paket `com.spct` dan sub-paketnya untuk didaftarkan ke dalam *Inversion of Control (IoC) Container*.
2. **`@EnableScheduling`**:
   Mengaktifkan *background task scheduler* internal Spring. Anotasi ini sangat krusial untuk menjalankan *cron job* pembersihan retensi data otomatis pada [DataRetentionService.java](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/service/DataRetentionService.java) setiap pukul 02:00 dini hari.

---

## 3. Alur Eksekusi Method `main()`

Di baris 37–42 pada [SpctApplication.java:37-42](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/SpctApplication.java#L37-L42):

```java
    public static void main(String[] args) {
        SpringApplication.run(SpctApplication.class, args);
        System.out.println("==========================================================");
        System.out.println("SERVER SPCT IoT BERHASIL DIJALANKAN DI PORT 8081");
        System.out.println("==========================================================");
    }
```

Urutan kejadian saat perintah `main` dieksekusi:
1. **JVM Startup**: JVM memuat bytecode dan memulai eksekusi `main()`.
2. **Environment Initialization**: Membaca file konfigurasi `application.properties` (URL JDBC, username, password postgres, port `8081`).
3. **Database DDL Auto Update**: Hibernate mengecek skema database PostgreSQL `db_spct_iot` dan otomatis membuat/memperbarui tabel relasional (`users`, `slot_parkir`, `transaksi_parkir`, `pembayaran`, `sensor_iot`, `kamera_anpr`, dll.).
4. **Embedded Tomcat Start**: Server web Tomcat dinyalakan dan mulai *listen* pada port `8081`.
5. **Context Ready Notification**: Seluruh Bean selesai diinjeksi melalui Dependency Injection (`@Autowired`).

---

## 4. Mekanisme Auto-Seeder: CommandLineRunner

Tepat sebelum server mulai menerima request dari Kiosk atau Web Dashboard, Spring mengeksekusi Bean bertipe `CommandLineRunner` pada [SpctApplication.java:46-209](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/SpctApplication.java#L46-L209):

```java
    @Bean
    public CommandLineRunner seederData(
            SlotParkirRepository slotRepo,
            UserRepository userRepo,
            KameraAnprRepository kameraRepo,
            SensorIoTRepository sensorRepo
    ) {
        return args -> { ... };
    }
```

Bean ini dirancang secara **idempoten** (aman dijalankan berulang kali tanpa merusak atau menduplikasi data yang sudah ada).

### Tahap 1: Sinkronisasi Akun Pengguna Default (Baris 57–104)
Memastikan 3 akun utama dengan kredensial standar dan NIP 8-digit terdaftar:
- **Admin**: Username `admin`, Password `admin123`, Role `ADMIN`, NIP `10000001`.
- **Petugas**: Username `petugas01`, Password `petugas123`, Role `PETUGAS_LAPANGAN`, NIP `10000002`.
- **Manajer**: Username `manajer`, Password `manajer123`, Role `Manajemen RS`, NIP `10000003`.
*(Jika akun sudah ada tetapi kolom NIP masih kosong dari versi sebelumnya, seeder melakukan backfill otomatis).*

### Tahap 2: Sinkronisasi Slot Multi-Lantai (Baris 106–159)
Mengonfigurasi total **96 unit slot parkir** yang terdistribusi secara matematis:
- `JUMLAH_LANTAI = 3`, `SLOT_PER_ZONA = 16`
- **Zona Mobil (Prefix B)**:
  - Lantai 1: `B1-01` s.d. `B1-16` (16 Slot)
  - Lantai 2: `B2-01` s.d. `B2-16` (16 Slot)
  - Lantai 3: `B3-01` s.d. `B3-16` (16 Slot)
- **Zona Motor (Prefix M)**:
  - Lantai 1: `M1-01` s.d. `M1-16` (16 Slot)
  - Lantai 2: `M2-01` s.d. `M2-16` (16 Slot)
  - Lantai 3: `M3-01` s.d. `M3-16` (16 Slot)
Setiap slot diinisialisasi lengkap dengan:
- `nodeId`: Node titik henti graf A* (contoh: `NODE_B1_1`, `NODE_M2_8`).
- Koordinat Spasial `koordinatX` & `koordinatY`: Digunakan oleh frontend untuk merender denah denah spasial secara presisi.
- `jenisKendaraan`: `MOBIL` atau `MOTOR`.
- `statusSlot`: `KOSONG`.

### Tahap 3: Sinkronisasi 4 Unit Kamera ANPR (Baris 161–187)
Memastikan 4 kamera gerbang terdaftar dan aktif (`ON`):
1. `PG-IN-MOB`: Gerbang Masuk Jalur Mobil (Kiri)
2. `PG-IN-MOT`: Gerbang Masuk Jalur Motor (Kanan)
3. `PG-OUT-MOB`: Gerbang Keluar Jalur Mobil (Kiri)
4. `PG-OUT-MOT`: Gerbang Keluar Jalur Motor (Kanan)

### Tahap 4: Sinkronisasi Sensor IoT Ultrasonic per-Slot (Baris 189–208)
Melakukan perulangan dinamis pada setiap slot yang ada di database (`slotRepo.findAll()`):
- Membuat satu sensor ultrasonic dengan format ID: `SNS-<idSlot>` (misal: `SNS-B1-01`, `SNS-M3-16`).
- Status operasional awal diatur menjadi `ON`.
- Dengan 96 slot, sistem otomatis memelihara **96 unit sensor IoT**.

---

## 5. Keuntungan Arsitektural untuk Kolaborator
Mekanisme auto-seeder ini menjamin prinsip **Zero Manual Setup**. Kolaborator baru yang meng-*clone* repositori hanya perlu menyiapkan database kosong bernama `db_spct_iot`. Begitu backend dijalankan, seluruh data master, struktur slot gedung 3 lantai, kamera, dan akun langsung terisi otomatis secara konsisten.
