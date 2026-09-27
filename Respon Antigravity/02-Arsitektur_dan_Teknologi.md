# Arsitektur dan Teknologi Sistem

Sesuai dengan rencana Anda, sistem ini akan dikembangkan dengan arsitektur **Microservices**, memisahkan beban kerja sistem menjadi beberapa layanan yang spesifik dan independen agar mudah dikembangkan (*scalable*).

## 1. Bahasa Pemrograman & Stack Utama
- **Backend (Logika Bisnis): Java (OOP)**. Java sangat ideal untuk arsitektur Microservices (misalnya menggunakan *framework* Spring Boot). Java akan menangani seluruh manajemen *role*, otentikasi, API Gateway, kontrol alokasi slot (algoritma pencarian), dan sinkronisasi data dari modul IoT.
- **Computer Vision (Deteksi Plat Nomor): Python**. Modul *Artificial Intelligence* (ALPR/YOLO) akan ditulis menggunakan Python. Karena Python memiliki ekosistem *machine learning* dan pemrosesan citra (OpenCV, YOLOv8) yang paling *mature* dan sangat optimal mendeteksi teks plat nomor dari *frame* kamera dalam hitungan milidetik.
- **Frontend (Web Back-Office):** Menggunakan HTML5, CSS3, dan framework JavaScript (seperti React.js / Vue.js) dengan TailwindCSS untuk menciptakan antarmuka *Dashboard* ala "Command Center".
- **Terminal Gerbang (Kios):** Dapat menggunakan antarmuka tertanam berbasis Chromium atau GUI Python (Tkinter/PyQt) yang ringan untuk melayani visual navigasi yang cepat.

## 2. Infrastruktur Basis Data & Integrasi
- **DBMS Transaksional:** PostgreSQL untuk menyimpan data historis seperti `Data_Kendaraan`, `Transaksi_Parkir`, dan log-log lainnya, yang dijamin ter-normalisasi hingga ke Bentuk Normal Ketiga (3NF).
- **In-Memory Cache (Opsional tapi disarankan):** Redis. Sangat berguna untuk menyimpan status *real-time* dari okupansi sensor IoT agar kueri pencarian slot di gerbang masuk tidak membebani database PostgreSQL secara konstan.
- **IoT & Edge Gateway:** Perangkat fisik (Raspberry Pi/Mikrokontroler) yang menggunakan protokol ringan MQTT untuk mengirim sinyal telemetri *occupancy* dari *basement* langsung ke server pusat.
- **Koneksi Real-time GUI:** Memanfaatkan WebSocket/Socket.IO agar pembaruan status denah parkir di layar *dashboard* terjadi seketika tanpa harus melakukan *refresh* (F5).
