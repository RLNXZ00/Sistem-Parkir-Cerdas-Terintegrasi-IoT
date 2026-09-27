// OTAK LOGIKA UNTUK HARDWARE SENSOR IOT (MQTT)

// Pseudocode:
// Service ini berjalan di background secara terus-menerus mendengarkan sensor.

// Fungsi ketikaSensorBerubah(idSlotSensor, statusSensorHardware):
// 1. Misal sensor di lantai B1-12 mendeteksi ada mobil (statusSensorHardware = "Terisi").
// 2. Panggil SlotParkirRepository untuk mengambil data slot B1-12 dari Database.
// 3. Bandingkan (Validasi Anomali):
//    - Jika status Database = "Kosong" TETAPI status Sensor = "Terisi" 
//      -> INI ANOMALI! Ada mobil menyerobot atau salah parkir.
//      -> Kirim peringatan ke Dashboard Petugas Lapangan.
//    - Jika status Database = "Dipesan" DAN status Sensor = "Terisi"
//      -> INI NORMAL. Mobil yang dialokasikan sudah sampai. 
//      -> Ubah status di Database menjadi "Terisi Penuh".
//    - Jika status Sensor = "Kosong", ubah status di Database menjadi "Kosong".
// 4. Simpan log kejadian ini ke LogOperasionalIoTRepository.
