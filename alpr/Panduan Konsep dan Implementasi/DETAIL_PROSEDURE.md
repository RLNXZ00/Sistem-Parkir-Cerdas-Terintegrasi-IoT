Nah, kalau konteksnya **proyek industri nyata untuk akses basement mall/rumah sakit**, saya justru akan mengubah sedikit cara kita membingkainya.

Yang kamu bangun sebenarnya adalah **ALPR/ANPR pipeline**, bukan sekadar "object detection + OCR". Dan arsitektur yang kamu jelaskan **sudah tepat**:

```text
Camera Frame
     │
     ▼
┌──────────────────────┐
│ YOLO License Plate   │
│      Detector        │
└──────────┬───────────┘
           │
       Plate BBox
           │
           ▼
    ┌─────────────┐
    │ Crop Plate  │
    └──────┬──────┘
           │
           ▼
┌──────────────────────┐
│ OCR / Plate Reader   │
└──────────┬───────────┘
           │
           ▼
      "B 1234 XYZ"
           │
           ▼
┌──────────────────────┐
│ Validation / Filter  │
└──────────┬───────────┘
           │
           ▼
        Database
```

**YOLO tidak perlu membaca "B 1234 XYZ".** Tugasnya hanya menjawab:

> "Di frame ini, plat nomor berada di koordinat mana?"

Setelah itu crop tersebut diberikan ke recognizer.

Ultralytics memang mendukung training custom detection dengan pretrained weights, dan model hasil training kemudian bisa digunakan untuk inference maupun tracking. ([Ultralytics Docs][1])

---

## Tapi untuk sistem basement, saya akan menambahkan satu tahap penting

Karena kameramu kemungkinan **video kontinu**, jangan melakukan:

```text
Frame 1 → YOLO → OCR
Frame 2 → YOLO → OCR
Frame 3 → YOLO → OCR
Frame 4 → YOLO → OCR
...
```

secara naif.

Lebih baik:

```text
                 CAMERA
                    │
                    ▼
             ┌────────────┐
             │    YOLO    │
             └─────┬──────┘
                   │
             Plate detected
                   │
                   ▼
             ┌────────────┐
             │   Tracker  │
             └─────┬──────┘
                   │
             Plate ID #17
                   │
        ┌──────────┼──────────┐
        ▼          ▼          ▼
      Frame      Frame      Frame
        1          2          3
        │          │          │
        └──────────┼──────────┘
                   ▼
              OCR beberapa
                 frame
                   │
                   ▼
          "B 1234 XYZ"
                   │
                   ▼
              CONFIRMED
                   │
                   ▼
                DATABASE
```

YOLO tracking memang dirancang untuk mempertahankan ID objek antar-frame, dan tracker seperti **BoT-SORT** atau **ByteTrack** dapat digunakan tanpa melatih tracker secara terpisah. ([Ultralytics Docs][2])

Ini **sangat relevan untuk basement**.

---

# Kenapa tracking penting?

Bayangkan mobil masuk:

```text
Frame 001
YOLO → plat detected
OCR → B 1234 X?Z

Frame 002
YOLO → plat detected
OCR → B 1234 XYZ

Frame 003
YOLO → plat detected
OCR → B 1234 XYZ

Frame 004
YOLO → plat detected
OCR → B 1234 XYZ
```

Daripada langsung memasukkan empat record:

```text
B1234XYZ
B1234XYZ
B1234XYZ
B1234XYZ
```

kita punya:

```text
TRACK ID 17
       │
       ├── OCR frame 1
       ├── OCR frame 2
       ├── OCR frame 3
       └── OCR frame 4
                │
                ▼
        confidence voting
                │
                ▼
           B1234XYZ
                │
                ▼
            DATABASE
```

Jadi database hanya mendapatkan **satu event kendaraan**.

---

# Dan saya akan membedakan 3 komponen

## 1. Detector

**YOLO**

Tugas:

```text
Input:
1920 × 1080 camera frame

Output:
x1, y1, x2, y2
confidence
class = license_plate
```

Misalnya:

```text
license_plate
confidence = 0.96

x1 = 812
y1 = 523
x2 = 1042
y2 = 587
```

---

## 2. Recognizer

Kemudian:

```text
frame
  ↓
bbox
  ↓
crop
  ↓
OCR
```

Output:

```text
B 1234 XYZ
confidence = 0.94
```

Di sinilah **PaddleOCR / TrOCR / recognizer khusus plat** bekerja.

---

## 3. Decision layer

Ini sering dilupakan.

Jangan langsung:

```text
OCR → database
```

Lebih baik:

```text
OCR
 ↓
confidence
 ↓
format validation
 ↓
multi-frame voting
 ↓
plate confirmed
 ↓
database
```

Contohnya:

```text
Frame 1 → B 1234 X8Z  (0.71)
Frame 2 → B 1234 XYZ  (0.92)
Frame 3 → B 1234 XYZ  (0.95)
Frame 4 → B 1234 XYZ  (0.94)
Frame 5 → B 1234 XYZ  (0.97)

                ↓

       FINAL = B 1234 XYZ
```

Ini menurut saya **jauh lebih cocok untuk sistem industri** daripada mengandalkan satu frame.

---

# Nah, dataset YOLO-mu juga harus mengikuti kamera sebenarnya

Ini penting sekali.

Kalau target deployment adalah:

> kamera basement mall

maka dataset terbaik bukan sekadar dataset internet berisi foto mobil.

Misalnya kamera produksi nanti:

```text
Camera
1920×1080
dipasang 3 meter
sudut ±20°
mobil bergerak menuju kamera
```

Maka data training idealnya **semirip mungkin dengan kondisi tersebut**.

Karena model tidak hanya belajar "plat Indonesia".

Ia belajar:

> **bagaimana plat Indonesia terlihat dari kamera yang digunakan sistem.**

Ultralytics sendiri menekankan pengumpulan data yang relevan dan beragam serta penambahan *edge cases* secara iteratif untuk custom detection. ([Ultralytics Docs][3])

---

# Saya malah menyarankan dua dataset

### Dataset A — Benchmark / pretraining

Gunakan dataset publik Indonesia.

Tujuannya:

> membuat model pertama yang sudah tahu seperti apa plat Indonesia.

### Dataset B — Production dataset

Ambil footage dari:

**kamera yang benar-benar akan digunakan di basement.**

Lalu ekstrak frame:

```text
Kamera production
       ↓
100.000 frames
       ↓
sampling
       ↓
5.000–20.000 gambar
       ↓
annotation
       ↓
fine-tuning
```

Tidak perlu semua frame diberi label.

---

# Dan ada satu hal yang sangat penting untuk deployment komersial

Kamu tadi mengatakan:

> proyek nyata industri

Maka **jangan hanya melihat akurasi model**.

Ada persoalan **lisensi software/model/dataset** juga.

Contohnya, dokumentasi Ultralytics saat ini menyebut dua opsi lisensi untuk penggunaan YOLO: **AGPL-3.0** dan **Enterprise**, dengan Enterprise ditujukan antara lain untuk deployment produk komersial yang ingin menghindari kewajiban lisensi AGPL. ([Ultralytics Docs][4])

Jadi sebelum produk benar-benar dijual/dipasang di mall atau rumah sakit, bagian licensing ini perlu kita cek secara serius.

---

# Arsitektur production yang saya bayangkan

Kalau ini benar-benar mau kamu jadikan sistem:

```text
                  IP CAMERA
                     │
                     ▼
              RTSP VIDEO STREAM
                     │
                     ▼
            ┌─────────────────┐
            │ YOLO Detector   │
            │ License Plate   │
            └────────┬────────┘
                     │
                     ▼
                TRACKER
              ByteTrack/
              BoT-SORT
                     │
                     ▼
              PLATE TRACK ID
                     │
                     ▼
             Perspective/
             Rectification
                     │
                     ▼
               OCR ENGINE
                     │
                     ▼
           ┌─────────────────┐
           │ B 1234 XYZ      │
           │ confidence 0.96 │
           └────────┬────────┘
                    │
                    ▼
             FORMAT VALIDATOR
                    │
                    ▼
             MULTI-FRAME VOTE
                    │
                    ▼
              FINAL PLATE ID
                    │
                    ▼
               DATABASE
                    │
           ┌────────┴────────┐
           ▼                 ▼
       ENTRY EVENT       EXIT EVENT
           │                 │
           ▼                 ▼
       timestamp          timestamp
       camera_id          camera_id
       plate              plate
```

Kemudian database bisa menyimpan:

```text
vehicle_event
-------------------------
id
plate_number
camera_id
event_type
timestamp
confidence
image_path
```

Misalnya:

```text
17
B 1234 XYZ
CAM_ENTRY_01
ENTRY
2026-09-07 14:32:17
0.96
/path/evidence/...
```

---

## Dan ada satu upgrade yang sangat menarik

Karena targetmu **basement**, sebenarnya kamu bisa menggunakan **dua level detection**:

```text
                FRAME
                  │
                  ▼
          YOLO Vehicle Detector
                  │
          ┌───────┴───────┐
          ▼               ▼
        CAR            MOTORCYCLE
          │               │
          └───────┬───────┘
                  ▼
            Plate Detector
                  │
                  ▼
                 OCR
```

Tapi **belum tentu perlu**.

Kalau kamera sudah diarahkan khusus ke jalur masuk dan hampir selalu menangkap bagian kendaraan yang relevan, langsung:

```text
Camera → Plate YOLO → OCR
```

bisa lebih ringan dan lebih cepat.

---

# Jadi saya setuju dengan pemahamanmu

**YOLO = localization**

> "Platnya di mana?"

**OCR = recognition**

> "Tulisan di plat itu apa?"

**Tracker = temporal association**

> "Plat yang saya lihat sekarang sama dengan plat yang saya lihat 5 frame sebelumnya atau bukan?"

**Decision layer = verification**

> "Apakah saya cukup yakin bahwa nomor ini benar-benar B 1234 XYZ?"

**Database = business layer**

> "Kendaraan ini masuk kapan, lewat kamera mana, dan apakah sudah terdaftar?"

Itulah yang membuatnya berubah dari sekadar **demo Computer Vision** menjadi **sistem ALPR yang siap diarahkan ke deployment**.

Dan kalau targetmu memang **basement mall/rumah sakit**, saya sarankan kita jangan buru-buru memilih "YOLO versi X + OCR Y". **Lebih tepat kita desain spesifikasi sistem dulu**, terutama posisi kamera, resolusi, jarak kendaraan, kecepatan kendaraan, kondisi malam, dan apakah kendaraan berhenti atau terus bergerak. Dari situ baru kita bisa menentukan **YOLO model size, ukuran input, strategi tracking, OCR, dan spesifikasi dataset** secara rasional.

[1]: https://docs.ultralytics.com/tasks/detect?utm_source=chatgpt.com "Object Detection with Ultralytics YOLO | Ultralytics"
[2]: https://docs.ultralytics.com/datasets/track?utm_source=chatgpt.com "Multi-Object Tracking Datasets | Ultralytics"
[3]: https://docs.ultralytics.com/yolov5/tutorials/train-custom-data?utm_source=chatgpt.com "Train YOLOv5 on Custom Data | Ultralytics"
[4]: https://docs.ultralytics.com/?utm_source=chatgpt.com "YOLO Object Detection & Segmentation | Ultralytics"
