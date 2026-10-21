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
import com.spct.dto.TitikRuteDto;         // Mengimpor DTO titik rute

// Deklarasi Service: kelas yang berisi OTAK / logika bisnis dari fitur Alokasi Rute
// Setara dengan method-method aksi kompleks yang ada di dalam TableDataGUI.java Anda
// namun dipisahkan menjadi kelas tersendiri agar rapi dan mudah diuji
@Service
public class AlokasiRuteService // Kelas service yang mengorkestrasi semua langkah alokasi slot dan pencarian rute
{
    // =====================================================================
    // Deklarasi Atribut Repository (diinject otomatis oleh Spring)
    // =====================================================================

    @Autowired
    private SlotParkirRepository slotParkirRepository; 

    @Autowired
    private DataKendaraanRepository dataKendaraanRepository; 

    // Struktur Data Graph Statis (Simulasi denah siku-siku)
    private static class GraphNodeData {
        String id;
        double x;
        double y;
        boolean isSlot;
        
        GraphNodeData(String id, double x, double y, boolean isSlot) {
            this.id = id; this.x = x; this.y = y; this.isSlot = isSlot;
        }
    }

    // Jumlah lantai yang didukung graf (harus sinkron dengan seeder data di SpctApplication)
    private static final int JUMLAH_LANTAI = 3;

    // Mendefinisikan koordinat tiap Node
    private static final Map<String, GraphNodeData> GRAPH_NODES = new HashMap<>();
    
    // Mendefinisikan Edges (Tetangga) tiap Node
    private static final Map<String, List<String>> GRAPH_EDGES = new HashMap<>();

    static {
        // 1. Inisialisasi Node Jalan (Koridor Utama di Y = 50)
        GRAPH_NODES.put("Gate-A", new GraphNodeData("Gate-A", 0, 50, false));
        for (int i = 1; i <= 8; i++) {
            GRAPH_NODES.put("N-" + i, new GraphNodeData("N-" + i, 20.0 * i, 50, false));
        }

        // 2. Inisialisasi Node Slot untuk setiap zona (Y = 30 untuk atas, Y = 70 untuk bawah)
        //    Zona mobil: B1..B3, zona motor: M1..M3 (tata letak sama, koridor jalan dipakai bersama)
        for (int lantai = 1; lantai <= JUMLAH_LANTAI; lantai++) {
            for (String prefix : new String[] {"B", "M"}) {
                String zona = prefix + lantai;
                for (int i = 1; i <= 16; i++) {
                    int col = (i + 1) / 2; // Menentukan pasangan (1-2 di col 1, 3-4 di col 2, dst)
                    double x = 20.0 * col;
                    double y = (i % 2 != 0) ? 30.0 : 70.0;
                    String slotNodeId = "NODE_" + zona + "_" + i;
                    GRAPH_NODES.put(slotNodeId, new GraphNodeData(slotNodeId, x, y, true));

                    // Hubungkan Slot ke Node Jalan di depannya secara langsung
                    String pathNodeId = "N-" + col;
                    tambahEdge(pathNodeId, slotNodeId);
                }
            }
        }

        // 3. Hubungkan antar Node Jalan secara berurutan (Gate -> N1 -> N2 dst)
        tambahEdge("Gate-A", "N-1");
        for (int i = 1; i < 8; i++) {
            tambahEdge("N-" + i, "N-" + (i + 1));
        }
    }

    // Helper untuk membuat Edge dua arah
    private static void tambahEdge(String nodeA, String nodeB) {
        GRAPH_EDGES.computeIfAbsent(nodeA, k -> new ArrayList<>()).add(nodeB);
        GRAPH_EDGES.computeIfAbsent(nodeB, k -> new ArrayList<>()).add(nodeA);
    }


    // =====================================================================
    // Method Utama: Alokasi Rute dengan Graph Traversal (SDNL Concept)
    // =====================================================================
    @Transactional
    public HasilAlokasiRuteDto prosesAlokasiDanRute(String platNomor, JenisKendaraan jenisKendaraan)
    {
        DataKendaraan kendaraan = cariAtauDaftarkanKendaraan(platNomor, jenisKendaraan);

        // Cari slot kosong sesuai jenis kendaraan (MOBIL/MOTOR), mulai dari lantai terendah
        // sampai ditemukan lantai yang masih memiliki slot kosong
        Set<String> setNodeSlotKosong = new HashSet<>();
        Map<String, SlotParkir> mapSlotKosong = new HashMap<>();
        for (int lantai = 1; lantai <= JUMLAH_LANTAI && setNodeSlotKosong.isEmpty(); lantai++) {
            List<SlotParkir> slotKosongList = slotParkirRepository
                .findByStatusSlotAndLantaiAndJenisKendaraanOrderByKoordinatXAsc(StatusSlot.KOSONG, lantai, jenisKendaraan);
            for (SlotParkir slot : slotKosongList) {
                setNodeSlotKosong.add(slot.getNodeId());
                mapSlotKosong.put(slot.getNodeId(), slot);
            }
        }

        // --- Langkah 2 & 3: Pencarian Slot Terdekat + Rute sekaligus (BFS/Dijkstra dari Gate) ---
        // Karena jarak antar node kotak grid kurang lebih seragam, BFS sudah menemukan rute terpendek absolut!
        String startNode = "Gate-A";
        
        Queue<String> queue = new LinkedList<>();
        Map<String, String> peta_asal = new HashMap<>(); // Untuk merekonstruksi rute
        Set<String> dikunjungi = new HashSet<>();
        
        queue.add(startNode);
        dikunjungi.add(startNode);
        
        String nodeSlotTerpilih = null;

        while (!queue.isEmpty()) {
            String nodeSaatIni = queue.poll();
            
            // Cek apakah node ini adalah slot parkir yang sedang KOSONG di database?
            if (GRAPH_NODES.get(nodeSaatIni).isSlot && setNodeSlotKosong.contains(nodeSaatIni)) {
                nodeSlotTerpilih = nodeSaatIni; // DITEMUKAN SLOT TERDEKAT!
                break; // Berhenti mencari karena algoritma BFS menjamin ini yang terdekat!
            }
            
            // Jika bukan, lanjutkan penelusuran ke tetangganya
            List<String> tetangga = GRAPH_EDGES.getOrDefault(nodeSaatIni, Collections.emptyList());
            for (String t : tetangga) {
                if (!dikunjungi.contains(t)) {
                    dikunjungi.add(t);
                    peta_asal.put(t, nodeSaatIni); // Rekam jejak
                    queue.add(t);
                }
            }
        }

        // Jika antrian habis tapi tidak menemukan slot kosong sama sekali
        if (nodeSlotTerpilih == null) {
            return new HasilAlokasiRuteDto(null, null, null, null, null, null, "BASEMENT_PENUH");
        }

        // Rekonstruksi rute menjadi array koordinat
        List<TitikRuteDto> urutanRute = rekonstruksiJalurKoordinat(peta_asal, nodeSlotTerpilih);
        SlotParkir slotTerpilih = mapSlotKosong.get(nodeSlotTerpilih);

        // Kunci slot agar tidak diserobot
        kunciSlotSebagaiDipesan(slotTerpilih, kendaraan);

        // Kembalikan DTO
        return new HasilAlokasiRuteDto(
            slotTerpilih.getIdSlot(),
            slotTerpilih.getLantai(),
            slotTerpilih.getKoordinatX(),
            slotTerpilih.getKoordinatY(),
            urutanRute,
            null, // idTransaksi diisi nanti
            "ALOKASI_BERHASIL"
        );
    }

    // =====================================================================
    // Method Pendukung
    // =====================================================================

    private DataKendaraan cariAtauDaftarkanKendaraan(String platNomor, JenisKendaraan jenisKendaraan)
    {
        Optional<DataKendaraan> kendaraanTerdaftar = dataKendaraanRepository.findByPlatNomor(platNomor);
        if (kendaraanTerdaftar.isPresent()) {
            return kendaraanTerdaftar.get();
        }
        DataKendaraan kendaraanBaru = new DataKendaraan(platNomor, jenisKendaraan);
        return dataKendaraanRepository.save(kendaraanBaru);
    }

    private void kunciSlotSebagaiDipesan(SlotParkir slot, DataKendaraan kendaraan)
    {
        slot.setStatusSlot(StatusSlot.DIPESAN);
        slot.setKendaraanAktif(kendaraan);
        slot.setWaktuDipesan(LocalDateTime.now());
        slotParkirRepository.save(slot);
    }

    // Merekonstruksi rute dari tujuan ke awal, dan mengkonversi Node menjadi TitikRuteDto (id, x, y)
    private List<TitikRuteDto> rekonstruksiJalurKoordinat(Map<String, String> peta_asal, String nodeTujuan)
    {
        List<TitikRuteDto> jalur = new ArrayList<>();
        String nodeSaatIni = nodeTujuan;

        while (nodeSaatIni != null) {
            GraphNodeData dataNode = GRAPH_NODES.get(nodeSaatIni);
            TitikRuteDto titik = new TitikRuteDto(dataNode.id, dataNode.x, dataNode.y);
            
            jalur.add(0, titik); // Tambah di depan agar urutannya menjadi dari awal ke akhir
            nodeSaatIni = peta_asal.get(nodeSaatIni);
        }

        return jalur;
    }
}
