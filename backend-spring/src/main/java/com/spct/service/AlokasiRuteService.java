package com.spct.service; // Nama package dari modul layanan logika bisnis sistem

// Import DTO HasilAlokasiRuteDto dari package dto
import com.spct.dto.HasilAlokasiRuteDto;
// Import DTO TitikRuteDto dari package dto
import com.spct.dto.TitikRuteDto;
// Import entitas DataKendaraan dari package model
import com.spct.model.DataKendaraan;
// Import enum JenisKendaraan dari package model
import com.spct.model.JenisKendaraan;
// Import entitas SlotParkir dari package model
import com.spct.model.SlotParkir;
// Import enum StatusSlot dari package model
import com.spct.model.StatusSlot;
// Import repositori DataKendaraanRepository dari package repository
import com.spct.repository.DataKendaraanRepository;
// Import repositori SlotParkirRepository dari package repository
import com.spct.repository.SlotParkirRepository;
// Import anotasi Autowired dari Spring Framework
import org.springframework.beans.factory.annotation.Autowired;
// Import anotasi Service dari Spring Framework
import org.springframework.stereotype.Service;
// Import anotasi Transactional dari Spring Framework
import org.springframework.transaction.annotation.Transactional;

// Import tipe data LocalDateTime java
import java.time.LocalDateTime;
// Import koleksi dan struktur data java util
import java.util.*;

// Kelas layanan publik java AlokasiRuteService untuk mengelola algoritma pencarian slot optimal dan perutean navigasi graf A*/BFS
@Service // Menandai kelas ini sebagai Spring Service Bean
public class AlokasiRuteService
{
    // Injeksi otomatis dependensi SlotParkirRepository
    @Autowired
    private SlotParkirRepository slotParkirRepository; // Deklarasi atribut slotParkirRepository

    // Injeksi otomatis dependensi DataKendaraanRepository
    @Autowired
    private DataKendaraanRepository dataKendaraanRepository; // Deklarasi atribut dataKendaraanRepository

    // Kelas inner GraphNodeData untuk menyimpan data koordinat simpul graf peta
    private static class GraphNodeData 
    {
        String id; // Identitas kode node simpul
        double x; // Titik koordinat X
        double y; // Titik koordinat Y
        boolean isSlot; // Penanda apakah simpul ini merupakan slot parkir fisik
        
        // Konstruktor GraphNodeData
        GraphNodeData(String id, double x, double y, boolean isSlot) 
        {
            this.id = id; // Inisialisasi atribut id dengan parameter
            this.x = x; // Inisialisasi atribut x dengan parameter
            this.y = y; // Inisialisasi atribut y dengan parameter
            this.isSlot = isSlot; // Inisialisasi atribut isSlot dengan parameter
        }
    }

    // Deklarasi konstanta JUMLAH_LANTAI bertipe int dengan nilai 3
    private static final int JUMLAH_LANTAI = 3;

    // Deklarasi struktur peta simpul graf GRAPH_NODES
    private static final Map<String, GraphNodeData> GRAPH_NODES = new HashMap<>();
    
    // Deklarasi adjacency list graf GRAPH_EDGES untuk relasi ketetanggaan antar node
    private static final Map<String, List<String>> GRAPH_EDGES = new HashMap<>();

    // Blok static initializer untuk membangun struktur topologi graf denah basement
    static 
    {
        // Inisialisasi gerbang masuk Gate-A pada koordinat (0, 50)
        GRAPH_NODES.put("Gate-A", new GraphNodeData("Gate-A", 0, 50, false));
        // Perulangan untuk membuat node koridor jalan utama N-1 s.d. N-8
        for (int i = 1; i <= 8; i++) 
        {
            GRAPH_NODES.put("N-" + i, new GraphNodeData("N-" + i, 20.0 * i, 50, false));
        }

        // Perulangan untuk inisialisasi simpul slot parkir per lantai
        for (int lantai = 1; lantai <= JUMLAH_LANTAI; lantai++) 
        {
            // Perulangan untuk jenis zona mobil (B) dan zona motor (M)
            for (String prefix : new String[] {"B", "M"}) 
            {
                String zona = prefix + lantai; // Penggabungan kode zona
                // Perulangan slot 1 s.d. 16
                for (int i = 1; i <= 16; i++) 
                {
                    int col = (i + 1) / 2; // Menentukan kolom koridor jalan
                    double x = 20.0 * col; // Menghitung koordinat X
                    double y = (i % 2 != 0) ? 30.0 : 70.0; // Menentukan koordinat Y atas atau bawah
                    String slotNodeId = "NODE_" + zona + "_" + i; // Kode unik node slot
                    GRAPH_NODES.put(slotNodeId, new GraphNodeData(slotNodeId, x, y, true)); // Registrasi node ke graf

                    // Menghubungkan simpul slot ke koridor jalan terdekat di depannya
                    String pathNodeId = "N-" + col;
                    tambahEdge(pathNodeId, slotNodeId); // Tambahkan edge dua arah
                }
            }
        }

        // Menghubungkan gerbang masuk ke simpul jalan pertama N-1
        tambahEdge("Gate-A", "N-1");
        // Perulangan menghubungkan setiap segmen koridor jalan secara berurutan
        for (int i = 1; i < 8; i++) 
        {
            tambahEdge("N-" + i, "N-" + (i + 1));
        }
    }

    // Method helper tambahEdge untuk menghubungkan dua simpul secara dua arah (undirected graph)
    private static void tambahEdge(String nodeA, String nodeB) 
    {
        // Menambahkan nodeB sebagai tetangga dari nodeA
        GRAPH_EDGES.computeIfAbsent(nodeA, k -> new ArrayList<>()).add(nodeB);
        // Menambahkan nodeA sebagai tetangga dari nodeB
        GRAPH_EDGES.computeIfAbsent(nodeB, k -> new ArrayList<>()).add(nodeA);
    }

    // =====================================================================
    // Method Utama: Alokasi Rute dengan Penelusuran Graf Terpendek (BFS)
    // =====================================================================

    // Method prosesAlokasiDanRute untuk mengeksekusi pencarian slot kosong terdekat dan lintasannya
    @Transactional
    public HasilAlokasiRuteDto prosesAlokasiDanRute(String platNomor, JenisKendaraan jenisKendaraan)
    {
        // Langkah 1: Mencari data master kendaraan atau mendaftarkannya jika baru pertama kali datang
        DataKendaraan kendaraan = cariAtauDaftarkanKendaraan(platNomor, jenisKendaraan);

        // Deklarasi set himpunan simpul slot kosong
        Set<String> setNodeSlotKosong = new HashSet<>();
        // Deklarasi map pemetaan kode node ke objek entitas SlotParkir
        Map<String, SlotParkir> mapSlotKosong = new HashMap<>();

        // Perulangan mencari slot kosong berurutan dari lantai terbawah
        for (int lantai = 1; lantai <= JUMLAH_LANTAI && setNodeSlotKosong.isEmpty(); lantai++) 
        {
            // Mengambil daftar slot kosong sesuai jenis kendaraan pada lantai bersangkutan
            List<SlotParkir> slotKosongList = slotParkirRepository
                .findByStatusSlotAndLantaiAndJenisKendaraanOrderByKoordinatXAsc(StatusSlot.KOSONG, lantai, jenisKendaraan);
            // Menambahkan setiap slot kosong ke dalam koleksi pencarian
            for (SlotParkir slot : slotKosongList) 
            {
                setNodeSlotKosong.add(slot.getNodeId());
                mapSlotKosong.put(slot.getNodeId(), slot);
            }
        }

        // Menentukan titik awal pencarian rute dari Gate-A
        String startNode = "Gate-A";
        
        // Inisialisasi antrean penelusuran graf Queue (BFS)
        Queue<String> queue = new LinkedList<>();
        // Inisialisasi peta asal rekonstruksi rute lintasan
        Map<String, String> peta_asal = new HashMap<>();
        // Inisialisasi himpunan simpul yang telah dikunjungi
        Set<String> dikunjungi = new HashSet<>();
        
        // Memasukkan startNode ke dalam antrean
        queue.add(startNode);
        // Menandai startNode sebagai sudah dikunjungi
        dikunjungi.add(startNode);
        
        // Inisialisasi variabel nodeSlotTerpilih dengan nilai null
        String nodeSlotTerpilih = null;

        // Selama antrean queue tidak kosong, lakukan perulangan penelusuran simpul graf:
        while (!queue.isEmpty()) 
        {
            // Mengambil simpul paling depan dari antrean queue
            String nodeSaatIni = queue.poll();
            
            // Jika simpul saat ini adalah slot parkir dan statusnya KOSONG di database, maka:
            if (GRAPH_NODES.get(nodeSaatIni).isSlot && setNodeSlotKosong.contains(nodeSaatIni)) 
            {
                // Menetapkan node saat ini sebagai slot terdekat yang terpilih
                nodeSlotTerpilih = nodeSaatIni;
                // Keluar dari perulangan karena BFS menjamin penemuan jalur terpendek pertama
                break;
            }
            
            // Mengambil daftar simpul tetangga dari node saat ini
            List<String> tetangga = GRAPH_EDGES.getOrDefault(nodeSaatIni, Collections.emptyList());
            // Perulangan untuk setiap simpul tetangga
            for (String t : tetangga) 
            {
                // Jika simpul tetangga belum pernah dikunjungi, maka:
                if (!dikunjungi.contains(t)) 
                {
                    // Tandai tetangga sebagai telah dikunjungi
                    dikunjungi.add(t);
                    // Catat nodeSaatIni sebagai simpul asal dari tetangga t
                    peta_asal.put(t, nodeSaatIni);
                    // Masukkan tetangga t ke dalam antrean untuk penelusuran tingkat berikutnya
                    queue.add(t);
                }
            }
        }

        // Jika tidak ditemukan slot kosong sama sekali, maka:
        if (nodeSlotTerpilih == null) 
        {
            // Kembalikan DTO dengan pesan status BASEMENT_PENUH
            return new HasilAlokasiRuteDto(null, null, null, null, null, null, "BASEMENT_PENUH");
        }

        // Rekonstruksi rute navigasi dari titik awal ke slot tujuan
        List<TitikRuteDto> urutanRute = rekonstruksiJalurKoordinat(peta_asal, nodeSlotTerpilih);
        // Mengambil objek entitas SlotParkir terpilih dari map
        SlotParkir slotTerpilih = mapSlotKosong.get(nodeSlotTerpilih);

        // Mengunci status slot menjadi DIPESAN agar tidak dialokasikan ke kendaraan lain
        kunciSlotSebagaiDipesan(slotTerpilih, kendaraan);

        // Mengembalikan objek DTO hasil alokasi lengkap beserta jalur rutenya
        return new HasilAlokasiRuteDto(
            slotTerpilih.getIdSlot(), // Nomor slot dialokasikan
            slotTerpilih.getLantai(), // Lantai slot
            slotTerpilih.getKoordinatX(), // Koordinat X slot
            slotTerpilih.getKoordinatY(), // Koordinat Y slot
            urutanRute, // Daftar titik rute navigasi
            null, // ID transaksi akan diisi oleh layer pemanggil
            "ALOKASI_BERHASIL" // Pesan status operasi
        );
    }

    // =====================================================================
    // Method Pendukung Bisnis
    // =====================================================================

    // Method cariAtauDaftarkanKendaraan untuk memeriksa atau mendaftarkan kendaraan baru
    private DataKendaraan cariAtauDaftarkanKendaraan(String platNomor, JenisKendaraan jenisKendaraan)
    {
        // Mencari kendaraan di database berdasarkan plat nomor
        Optional<DataKendaraan> kendaraanTerdaftar = dataKendaraanRepository.findByPlatNomor(platNomor);
        // Jika kendaraan sudah terdaftar, kembalikan objeknya
        if (kendaraanTerdaftar.isPresent()) 
        {
            return kendaraanTerdaftar.get();
        }
        // Jika belum terdaftar, buat entitas DataKendaraan baru
        DataKendaraan kendaraanBaru = new DataKendaraan(platNomor, jenisKendaraan);
        // Simpan data kendaraan ke database dan kembalikan objek yang tersimpan
        return dataKendaraanRepository.save(kendaraanBaru);
    }

    // Method kunciSlotSebagaiDipesan untuk memperbarui status slot menjadi DIPESAN
    private void kunciSlotSebagaiDipesan(SlotParkir slot, DataKendaraan kendaraan)
    {
        slot.setStatusSlot(StatusSlot.DIPESAN); // Mengubah status keterisian menjadi DIPESAN
        slot.setKendaraanAktif(kendaraan); // Menghubungkan kendaraan aktif pada slot
        slot.setWaktuDipesan(LocalDateTime.now()); // Mencatat timestamp waktu penguncian slot
        slotParkirRepository.save(slot); // Menyimpan perubahan status slot ke database
    }

    // Method rekonstruksiJalurKoordinat untuk merekonstruksi rute dari titik akhir ke titik awal
    private List<TitikRuteDto> rekonstruksiJalurKoordinat(Map<String, String> peta_asal, String nodeTujuan)
    {
        // Instansiasi daftar list jalur koordinat
        List<TitikRuteDto> jalur = new ArrayList<>();
        // Inisialisasi node saat ini dengan node tujuan
        String nodeSaatIni = nodeTujuan;

        // Selama nodeSaatIni tidak null, lakukan penelusuran balik:
        while (nodeSaatIni != null) 
        {
            // Mengambil metadata koordinat dari simpul graf
            GraphNodeData dataNode = GRAPH_NODES.get(nodeSaatIni);
            // Instansiasi objek DTO TitikRuteDto
            TitikRuteDto titik = new TitikRuteDto(dataNode.id, dataNode.x, dataNode.y);
            
            // Menambahkan titik ke posisi indeks 0 (paling awal) agar urutan menjadi dari gerbang ke slot
            jalur.add(0, titik);
            // Melangkah mundur ke node pendahulu
            nodeSaatIni = peta_asal.get(nodeSaatIni);
        }

        // Mengembalikan daftar titik rute navigasi
        return jalur;
    }
}
