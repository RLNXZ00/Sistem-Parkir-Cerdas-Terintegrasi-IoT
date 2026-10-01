package com.spct.service;

import com.spct.dto.HasilAlokasiRuteDto;
import com.spct.model.DataKendaraan;
import com.spct.model.JenisKendaraan;
import com.spct.model.SlotParkir;
import com.spct.model.StatusSlot;
import com.spct.repository.DataKendaraanRepository;
import com.spct.repository.SlotParkirRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;          // Mengimpor kelas LocalDateTime untuk timestamp penguncian slot
import java.util.*;                       // Mengimpor Collections untuk implementasi Algoritma A*

// Deklarasi Service: kelas yang berisi OTAK / logika bisnis dari fitur Alokasi Rute
// Setara dengan method-method aksi kompleks yang ada di dalam TableDataGUI.java Anda
// namun dipisahkan menjadi kelas tersendiri agar rapi dan mudah diuji
@Service
public class AlokasiRuteService // Kelas service yang mengorkestrasi semua langkah alokasi slot dan pencarian rute
{
    // =====================================================================
    // Deklarasi Atribut Repository (diinject otomatis oleh Spring)
    // Pengganti DataBaseConnection.getActiveConnection() dari proyek Anda
    // =====================================================================

    @Autowired
    private SlotParkirRepository slotParkirRepository; // Repository untuk akses tabel slot_parkir

    @Autowired
    private DataKendaraanRepository dataKendaraanRepository; // Repository untuk akses tabel data_kendaraan


    // =====================================================================
    // Method Utama: Mengorkestrasi seluruh alur alokasi sesuai pseudocode
    // =====================================================================

    // Merupakan method utama yang dipanggil oleh AlokasiRuteController
    // @Transactional memastikan semua operasi database (baca + tulis) berhasil semua atau gagal semua
    @Transactional
    public HasilAlokasiRuteDto prosesAlokasiDanRute(String platNomor, JenisKendaraan jenisKendaraan)
    {
        // --- Langkah 1: Validasi & Registrasi Kendaraan ---
        // Mengecek apakah plat nomor sudah terdaftar, jika belum maka daftarkan otomatis
        DataKendaraan kendaraan = cariAtauDaftarkanKendaraan(platNomor, jenisKendaraan);

        // --- Langkah 2: Pencarian Slot Tersedia (Berjenjang per Lantai) ---
        // Loop untuk Lantai 1, 2, 3 sesuai pseudocode (prioritas lantai terdekat gerbang)
        SlotParkir slotTerpilih = cariSlotKosongBerjenjang();

        // Jika setelah dicek semua lantai tidak ada slot kosong, lempar exception
        if (slotTerpilih == null)
        {
            // Mengembalikan DTO dengan pesan "Basement Penuh" tanpa data rute
            return new HasilAlokasiRuteDto(null, null, null, null, null, null, "BASEMENT_PENUH");
        }

        // --- Langkah 3: Algoritma A* (Pencarian Jalur Terpendek) ---
        // Memanggil implementasi Algoritma A* untuk mencari rute dari gerbang ke slot terpilih
        List<String> urutanRute = hitungRuteAstar("Gate-A", slotTerpilih.getNodeId());

        // --- Langkah 4: Penguncian Slot (Handling Race Condition) ---
        // Mengubah status slot menjadi 'DIPESAN' agar slot tidak direbut kendaraan lain
        kunciSlotSebagaiDipesan(slotTerpilih, kendaraan);

        // --- Langkah 5: Menyusun dan mengembalikan hasil ke Controller ---
        return new HasilAlokasiRuteDto(
            slotTerpilih.getIdSlot(),   // ID Slot yang berhasil dialokasikan
            slotTerpilih.getLantai(),   // Lantai dari slot tersebut
            slotTerpilih.getKoordinatX(), // Koordinat X untuk rendering peta Kiosk
            slotTerpilih.getKoordinatY(), // Koordinat Y untuk rendering peta Kiosk
            urutanRute,                 // Array urutan rute dari Algoritma A*
            null,                       // idTransaksi (akan diisi oleh TransaksiService nanti)
            "ALOKASI_BERHASIL"          // Pesan status operasi berhasil
        );
    }


    // =====================================================================
    // Method Pendukung: Logika spesifik yang dipecah menjadi method tersendiri
    // (gaya penulisan Anda: method terpisah dengan komentar blok)
    // =====================================================================

    // Method untuk mencari kendaraan di database atau mendaftarkan yang baru
    private DataKendaraan cariAtauDaftarkanKendaraan(String platNomor, JenisKendaraan jenisKendaraan)
    {
        // Mencari kendaraan di database berdasarkan plat nomor
        Optional<DataKendaraan> kendaraanTerdaftar = dataKendaraanRepository.findByPlatNomor(platNomor);

        // Jika kendaraan sudah terdaftar (pernah parkir sebelumnya), gunakan data yang ada
        if (kendaraanTerdaftar.isPresent())
        {
            return kendaraanTerdaftar.get(); // Mengembalikan objek DataKendaraan yang sudah ada di database
        }

        // Jika kendaraan belum terdaftar (kendaraan baru pertama kali masuk), daftarkan otomatis
        DataKendaraan kendaraanBaru = new DataKendaraan(platNomor, jenisKendaraan);
        return dataKendaraanRepository.save(kendaraanBaru); // Simpan kendaraan baru ke database dan kembalikan objeknya
    }

    // Method untuk mencari slot kosong secara berjenjang per lantai sesuai pseudocode
    private SlotParkir cariSlotKosongBerjenjang()
    {
        // Deklarasi array lantai yang akan diiterasikan (Lantai 1 prioritas pertama)
        int[] urutanLantai = {1, 2, 3}; // Asumsi basement 3 lantai sesuai pseudocode

        // LOOP untuk setiap lantai dari lantai 1 (terdekat gerbang) hingga lantai 3
        for (int lantai : urutanLantai)
        {
            // Kueri database: SELECT * FROM slot_parkir WHERE status = 'KOSONG' AND lantai = currentLantai
            // Diurutkan berdasarkan koordinatX (slot terdekat dari titik gerbang masuk)
            List<SlotParkir> slotKosong = slotParkirRepository
                .findByStatusSlotAndLantaiOrderByKoordinatXAsc(StatusSlot.KOSONG, lantai);

            // IF Ditemukan slot kosong di lantai ini
            if (!slotKosong.isEmpty())
            {
                return slotKosong.get(0); // Break LOOP: ambil slot pertama (terdekat), kembalikan hasilnya
            }
            // Jika tidak ada slot kosong di lantai ini, lanjut ke lantai berikutnya (continue loop)
        }

        return null; // IF TIDAK ADA SLOT KOSONG DI SEMUA LANTAI: kembalikan null (Basement Penuh)
    }

    // Method untuk mengunci slot menjadi 'DIPESAN' (mencegah penyerobotan / race condition)
    private void kunciSlotSebagaiDipesan(SlotParkir slot, DataKendaraan kendaraan)
    {
        // UPDATE slot_parkir SET status = 'DIPESAN', id_kendaraan = id_kendaraan_saat_ini
        slot.setStatusSlot(StatusSlot.DIPESAN);             // Mengubah status slot menjadi DIPESAN
        slot.setKendaraanAktif(kendaraan);                  // Menghubungkan kendaraan ke slot ini
        slot.setWaktuDipesan(LocalDateTime.now());          // Mencatat waktu penguncian slot

        slotParkirRepository.save(slot); // Simpan perubahan ke database (setara commit manual Anda)
    }


    // =====================================================================
    // Implementasi Algoritma A* (Pencarian Jalur Terpendek)
    // Diimplementasikan menggunakan Graf dengan representasi adjacency list
    // =====================================================================

    // Method utama Algoritma A*: mencari rute terpendek dari nodeAwal ke nodeTujuan
    private List<String> hitungRuteAstar(String nodeAwal, String nodeTujuan)
    {
        // --- Inisialisasi Struktur Data untuk A* ---
        // PriorityQueue (Open Set): antrian berprioritas berdasarkan nilai F = G + H
        // Diurutkan dari nilai F terkecil (jalur terbaik)
        PriorityQueue<NodeAstar> openSet = new PriorityQueue<>(Comparator.comparingDouble(n -> n.nilaiF));

        // Map untuk melacak node mana yang menjadi "orang tua" dari node saat ini (untuk merekonstruksi jalur)
        Map<String, String> peta_asal = new HashMap<>();

        // Map untuk menyimpan nilai G (biaya aktual dari nodeAwal ke node ini)
        Map<String, Double> nilaiG = new HashMap<>();

        // Inisialisasi nilai G awal: semua node memiliki biaya tak terhingga, kecuali node awal = 0
        nilaiG.put(nodeAwal, 0.0);

        // Masukkan node awal ke dalam antrian dengan nilai F = 0 + H(nodeAwal, nodeTujuan)
        openSet.add(new NodeAstar(nodeAwal, hitungHeuristik(nodeAwal, nodeTujuan)));

        // --- Loop Utama Algoritma A* ---
        while (!openSet.isEmpty())
        {
            // Ambil node dengan nilai F terkecil dari antrian (jalur paling menjanjikan)
            NodeAstar nodeSaatIni = openSet.poll();
            String idNodeSaatIni = nodeSaatIni.idNode;

            // Jika sudah mencapai node tujuan, rekonstruksi dan kembalikan jalurnya
            if (idNodeSaatIni.equals(nodeTujuan))
            {
                return rekonstruksiJalur(peta_asal, nodeTujuan); // Kembalikan urutan node dari awal ke tujuan
            }

            // Telusuri semua tetangga (node yang terhubung) dari node saat ini
            List<String[]> tetangga = ambilTetanggaNode(idNodeSaatIni); // Format: [nodeId, jarak]
            for (String[] data : tetangga)
            {
                String idTetangga = data[0];                   // ID node tetangga
                double jarakKeTetangga = Double.parseDouble(data[1]); // Jarak / bobot edge ke tetangga

                // Hitung nilai G baru jika melewati node saat ini ke tetangga
                double nilaiGBaru = nilaiG.getOrDefault(idNodeSaatIni, Double.MAX_VALUE) + jarakKeTetangga;

                // Jika jalur baru ke tetangga ini lebih pendek dari yang sudah diketahui
                if (nilaiGBaru < nilaiG.getOrDefault(idTetangga, Double.MAX_VALUE))
                {
                    peta_asal.put(idTetangga, idNodeSaatIni); // Catat bahwa asal terbaik ke tetangga adalah dari node saat ini
                    nilaiG.put(idTetangga, nilaiGBaru);         // Perbarui nilai G untuk tetangga

                    // Hitung nilai F = G (biaya aktual) + H (heuristik ke tujuan)
                    double nilaiF = nilaiGBaru + hitungHeuristik(idTetangga, nodeTujuan);
                    openSet.add(new NodeAstar(idTetangga, nilaiF)); // Tambahkan tetangga ke antrian dengan nilai F baru
                }
            }
        }

        // Jika antrian habis tanpa menemukan tujuan, kembalikan list kosong (tidak ada jalur)
        return Collections.emptyList();
    }

    // Fungsi Heuristik A*: memperkirakan jarak dari nodeA ke nodeB
    // Untuk saat ini menggunakan nilai konstan (akan diganti koordinat nyata di iterasi selanjutnya)
    private double hitungHeuristik(String nodeA, String nodeB)
    {
        // TODO: Iterasi berikutnya - hitung jarak Euclidean berdasarkan koordinat node dari database
        // Saat ini mengembalikan 1.0 sebagai estimasi awal (A* tetap berjalan meski kurang optimal)
        return 1.0; // Mengembalikan nilai heuristik estimasi awal
    }

    // Method untuk mendapatkan daftar tetangga dari sebuah node (representasi Graf)
    // TODO: Iterasi berikutnya - ambil data ini dari tabel 'graph_node' di database
    private List<String[]> ambilTetanggaNode(String nodeId)
    {
        // Deklarasi List untuk menyimpan data tetangga: [nodeId, jarak]
        List<String[]> tetangga = new ArrayList<>();

        // Graf statis sementara untuk basement (akan dipindahkan ke database pada iterasi selanjutnya)
        // Format representasi: {"nodeId", "jarak"}
        Map<String, List<String[]>> graphBasement = new HashMap<>();
        graphBasement.put("Gate-A",  Arrays.asList(new String[]{"N-1", "2"}, new String[]{"N-2", "3"}));
        graphBasement.put("N-1",     Arrays.asList(new String[]{"Gate-A", "2"}, new String[]{"N-3", "2"}, new String[]{"N-4", "4"}));
        graphBasement.put("N-2",     Arrays.asList(new String[]{"Gate-A", "3"}, new String[]{"N-5", "2"}));
        graphBasement.put("N-3",     Arrays.asList(new String[]{"N-1", "2"}, new String[]{"N-6", "3"}));
        graphBasement.put("N-4",     Arrays.asList(new String[]{"N-1", "4"}, new String[]{"N-7", "2"}));
        graphBasement.put("N-5",     Arrays.asList(new String[]{"N-2", "2"}, new String[]{"N-8", "3"}));

        // Mengambil daftar tetangga dari graf statis, kembalikan list kosong jika node tidak terdaftar
        return graphBasement.getOrDefault(nodeId, tetangga);
    }

    // Method untuk merekonstruksi urutan jalur dari node tujuan kembali ke node awal
    private List<String> rekonstruksiJalur(Map<String, String> peta_asal, String nodeTujuan)
    {
        // Deklarasi List untuk menyimpan urutan jalur
        List<String> jalur = new ArrayList<>();

        // Deklarasi variabel penunjuk dimulai dari node tujuan
        String nodeSaatIni = nodeTujuan;

        // LOOP: telusuri peta_asal dari tujuan kembali ke awal
        while (nodeSaatIni != null)
        {
            jalur.add(0, nodeSaatIni);                 // Tambahkan node di posisi 0 (urutan terbalik menjadi maju)
            nodeSaatIni = peta_asal.get(nodeSaatIni); // Pindah ke node asal dari node saat ini
        }

        return jalur; // Mengembalikan daftar urutan node dari awal hingga tujuan
    }


    // =====================================================================
    // Kelas Inner: NodeAstar (Struktur Data untuk antrian A*)
    // Setara dengan kelas ListNode.java di Modul_12 Anda namun untuk kebutuhan A*
    // =====================================================================
    private static class NodeAstar // Kelas inner untuk merepresentasikan sebuah node dalam antrian Algoritma A*
    {
        String idNode; // ID dari node ini di dalam graf basement
        double nilaiF; // Nilai F = G (biaya aktual) + H (heuristik estimasi) untuk prioritas antrian

        // Konstruktor NodeAstar
        NodeAstar(String idNode, double nilaiF)
        {
            this.idNode = idNode;     // Menginisialisasi atribut idNode
            this.nilaiF = nilaiF;     // Menginisialisasi atribut nilaiF
        }
    }
}
