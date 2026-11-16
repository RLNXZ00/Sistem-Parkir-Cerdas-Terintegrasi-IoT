Betul sekali arah berpikirmu. Untuk **Automatic License Plate Recognition (ALPR)**, sebaiknya jangan membayangkan ini sebagai satu model CNN saja. Justru sistem yang bagus biasanya berupa **pipeline beberapa model**, karena tugas “menemukan plat” dan “membaca karakter plat” adalah dua masalah berbeda.

Dan ada satu koreksi kecil: **OCR bukan algoritma tunggal seperti ResNet50**. OCR adalah *task/pipeline* untuk mendeteksi dan mengenali teks, yang di dalamnya bisa memakai berbagai arsitektur Deep Learning. ([paddlepaddle.github.io][1])

## 1. Arsitektur yang saya rekomendasikan

Untuk kasusmu:

```text
                 INPUT
           Foto/video kendaraan
                    │
                    ▼
        ┌──────────────────────┐
        │ YOLO License Plate   │
        │       Detector       │
        └──────────────────────┘
                    │
              Bounding Box
                    │
                    ▼
          ┌──────────────────┐
          │ Plate Crop       │
          │ + Perspective    │
          │   Correction     │
          └──────────────────┘
                    │
                    ▼
          ┌──────────────────┐
          │ OCR / Text       │
          │ Recognition      │
          └──────────────────┘
                    │
                    ▼
              "B 1234 XYZ"
                    │
                    ▼
          Post-processing
          Regex / validasi
                    │
                    ▼
              HASIL AKHIR
```

Jadi:

**YOLO = WHERE is the plate?**

**OCR = WHAT does the plate say?**

Ini jauh lebih masuk akal daripada memberikan seluruh foto kendaraan langsung ke OCR.

---

# 2. Apakah YOLO punya pretrained model?

**Ya. Bahkan sangat dianjurkan menggunakan pretrained model.**

Misalnya pada ekosistem Ultralytics, model detection tersedia dalam bentuk pretrained checkpoint yang sebelumnya dilatih pada COCO. Kemudian model tersebut di-*fine-tune* menggunakan dataset plat nomor milikmu. ([Ultralytics Docs][2])

Konsepnya:

```text
YOLO pretrained
       │
       │ transfer learning
       ▼
YOLO yang belajar "license plate"
```

Bukan:

```text
YOLO random
       │
       ▼
belajar semuanya dari nol
```

Ultralytics sendiri merekomendasikan memulai dari checkpoint pretrained untuk custom detection karena backbone/feature extractor sudah memiliki representasi visual umum. ([Ultralytics Docs][3])

Misalnya secara konsep:

```python
from ultralytics import YOLO

model = YOLO("yolo26s.pt")

model.train(
    data="license_plate.yaml",
    epochs=100,
    imgsz=640
)
```

Tentu versi YOLO yang dipakai bisa kamu pilih berdasarkan kebutuhan. **Tidak harus YOLO26**; YOLO11 juga sangat relevan untuk penelitian ALPR dan banyak implementasi saat ini.

---

# 3. Yang paling penting: dataset YOLO-nya

Nah, **ini justru bagian yang sangat menentukan akurasi**.

Untuk detector plat, kamu tidak perlu membuat:

```text
car
motorcycle
truck
bus
license_plate
```

kalau tujuanmu hanya plat.

Bahkan saya akan membuatnya **single-class detection**:

```text
0 = license_plate
```

Contohnya:

```text
┌───────────────────────────────┐
│                               │
│        🚗                     │
│       ┌───────────┐           │
│       │ B 1234 XY │  ← bbox   │
│       └───────────┘           │
│                               │
└───────────────────────────────┘
```

YOLO hanya perlu belajar:

> "Bagian mana dari gambar yang merupakan plat nomor?"

Bukan membaca tulisannya.

---

# 4. Berapa jumlah gambar?

Tidak ada angka sakral seperti:

> "Minimal harus 1.000 gambar."

Yang lebih penting adalah **keragaman data**.

Namun untuk proyek mahasiswa/research prototype, saya akan menggunakan target seperti ini:

| Dataset                  |        Jumlah |
| ------------------------ | ------------: |
| Minimum untuk eksperimen |        ~1.000 |
| Bagus untuk prototype    |   2.000–5.000 |
| Sangat bagus             | 5.000–10.000+ |
| Research skala besar     |       10.000+ |

Tetapi **1.000 gambar yang sangat beragam bisa lebih berguna daripada 10.000 gambar yang hampir identik**.

Misalnya kamu punya:

```text
10.000 foto
semuanya:
- kamera sama
- jarak sama
- sudut sama
- siang
- mobil sama
```

model bisa terlihat hebat di validation tetapi jeblok ketika dipakai di dunia nyata.

---

# 5. Variasi dataset yang justru sangat penting

Untuk plat kendaraan, saya akan sengaja membuat dataset memiliki variasi:

### Sudut kamera

```text
frontal
   ↓
┌─────────┐
│ B 1234  │
└─────────┘


sedikit miring
       ╱────────
      ╱ B 1234
     ╱────────


miring horizontal

  ╱──────────
 ╱ B 1234 XY
╱───────────
```

Termasuk:

* frontal
* kiri
* kanan
* kamera agak tinggi
* kamera agak rendah
* perspektif diagonal

CCPD adalah contoh bagus mengenai pentingnya variasi ini. Dataset tersebut memiliki subset khusus untuk **blur, rotate, tilt, distance, illumination, challenge**, dan lain-lain. ([GitHub][4])

---

# 6. Variasi kondisi lingkungan

Dataset sebaiknya mencakup:

### Lighting

```text
☀️ siang
🌥 mendung
🌙 malam
💡 lampu kendaraan
```

### Kondisi plat

```text
bersih
kotor
tergores
refleksi
sedikit tertutup
blur
overexposure
underexposure
```

### Jarak

```text
DEKAT
████████████
B 1234 ABC

SEDANG
████████
B 1234 ABC

JAUH
███
B1234
```

Ini sangat penting karena **ukuran karakter pada crop sangat menentukan OCR**.

---

# 7. Dataset yang sangat saya rekomendasikan untukmu

Ada beberapa yang menarik.

### A. CCPD

Ini salah satu benchmark klasik yang sangat bagus untuk memahami ALPR.

[CCPD Dataset — GitHub](https://github.com/detectRecog/CCPD?utm_source=chatgpt.com)

Dataset ini memiliki **lebih dari 250 ribu gambar plat** pada paper awal dan anotasi yang sangat detail, termasuk bounding box, empat titik sudut plat, dan label nomor plat. ([Open Access The CVF][5])

Yang menarik adalah mereka punya variasi:

* Base
* Blur
* Rotate
* Tilt
* Challenge
* FN (far/near)
* DB (brightness)
* Weather

Jadi **bagus sekali sebagai referensi bagaimana dataset ALPR seharusnya dirancang**. ([GitHub][4])

Tetapi:

> **Jangan langsung memakai CCPD sebagai dataset final untuk plat Indonesia.**

Karena karakteristik plat China berbeda dengan Indonesia.

---

### B. UFPR-ALPR

Ini malah menarik untuk penelitian karena merupakan dataset ALPR dunia nyata.

[UFPR-ALPR Dataset — UFPR](https://web.inf.ufpr.br/vri/databases/ufpr-alpr/?utm_source=chatgpt.com)

Memiliki:

**4.500 gambar beranotasi** dan lebih dari **30.000 karakter**, dengan kendaraan dan kamera sama-sama bergerak. ([web.inf.ufpr.br][6])

Ada juga:

* 3 kamera
* mobil
* motor
* berbagai kondisi dunia nyata
* anotasi posisi plat
* anotasi posisi karakter

Ini bagus untuk kamu pelajari sebagai referensi desain dataset.

---

### C. Dataset Indonesia

Nah, ini yang **lebih penting untuk kasusmu**.

Ada dataset Indonesia di Kaggle yang berisi:

* **1.383 gambar** untuk plate detection
* **1.863 gambar** untuk plate text/OCR

dan anotasinya memang ditujukan untuk plat Indonesia. ([Kaggle][7])

[Indonesian Vehicle License Plate Dataset — Kaggle](https://www.kaggle.com/datasets/linkgish/indonesian-plate-number-from-multi-sources?utm_source=chatgpt.com)

Ada juga dataset Indonesia lain berisi **1.000 gambar dengan anotasi YOLO** untuk license plate detection, dengan variasi lighting, occlusion, background, dan orientasi. ([Kaggle][8])

[Indonesian License Plate Dataset — Kaggle](https://www.kaggle.com/datasets/juanthomaswijaya/indonesian-license-plate-dataset?utm_source=chatgpt.com)

**Saya justru menyarankan kamu mulai dari sini**, lalu tambahkan dataset buatanmu sendiri.

---

# 8. Bagian OCR: jangan berhenti di "Tesseract"

Nah, ini bagian yang menurut saya paling menarik dari pertanyaanmu.

OCR modern sudah jauh berkembang.

Salah satu pilihan yang sangat layak dicoba adalah:

## PaddleOCR

PaddleOCR modern sudah menggunakan pipeline Deep Learning untuk:

```text
Text Detection
      ↓
Text Orientation
      ↓
Text Recognition
```

dan PP-OCRv5 merupakan generasi terbaru pada pipeline tersebut. ([paddlepaddle.github.io][9])

[PaddleOCR — Documentation](https://paddlepaddle.github.io/PaddleOCR/?utm_source=chatgpt.com)

Tetapi ada hal penting:

### Untuk plat nomor, saya tidak akan langsung melakukan:

```text
YOLO
 ↓
PaddleOCR seluruh crop
```

Saya akan melakukan preprocessing terlebih dahulu.

---

# 9. Pipeline yang lebih kuat

Saya akan mendesain:

```text
                    IMAGE
                      │
                      ▼
              ┌──────────────┐
              │ YOLO Detector│
              └──────────────┘
                      │
                License Plate
                      │
                      ▼
              ┌──────────────┐
              │ Perspective  │
              │ Correction   │
              └──────────────┘
                      │
                      ▼
             ┌─────────────────┐
             │ Image Processing│
             ├─────────────────┤
             │ Resize           │
             │ Denoise          │
             │ Contrast         │
             │ Sharpen          │
             └─────────────────┘
                      │
                      ▼
             ┌─────────────────┐
             │ OCR Recognition  │
             │ PP-OCR / TrOCR   │
             └─────────────────┘
                      │
                      ▼
               B 1234 XYZ
                      │
                      ▼
             ┌─────────────────┐
             │ Post Processing │
             └─────────────────┘
                      │
                      ▼
               VALID PLATE
```

---

# 10. Bahkan ada satu tahap yang menurut saya sangat penting

**Perspective correction.**

Misalnya YOLO mendapatkan:

```text
      ╱────────────────
     ╱ B 1234 ABC
    ╱────────────────
```

OCR akan jauh lebih sulit daripada:

```text
┌────────────────────┐
│     B 1234 ABC     │
└────────────────────┘
```

Maka gunakan **four-point perspective transformation / homography**.

CCPD bahkan menyediakan **empat titik sudut plat** dalam anotasinya. ([GitHub][4])

Ini membuat penelitianmu lebih menarik karena bukan sekadar:

> YOLO + OCR

tetapi:

> **YOLO → Plate Rectification → OCR**

---

# 11. Bagaimana dengan TrOCR?

Ini juga menarik.

Ada penelitian/implementasi ALPR Indonesia yang menggunakan:

```text
YOLO11m
   ↓
Plate Crop
   ↓
TrOCR
   ↓
License Plate Text
```

dan melakukan fine-tuning TrOCR menggunakan data plat Indonesia serta data sintetis. ([GitHub][10])

Jadi kamu sebenarnya punya beberapa kandidat:

| OCR                | Kelebihan             |
| ------------------ | --------------------- |
| Tesseract          | sederhana, baseline   |
| EasyOCR            | mudah digunakan       |
| PaddleOCR          | kuat, pipeline modern |
| TrOCR              | Transformer-based     |
| Custom CRNN        | bisa sangat spesifik  |
| Custom Transformer | riset lebih lanjut    |

Untuk **baseline penelitian**, saya akan membandingkan:

```text
PaddleOCR
vs
TrOCR
```

---

# 12. Tetapi ada masalah penting: OCR umum vs OCR plat

PaddleOCR dibuat untuk **general text**.

Sedangkan kamu punya domain yang sangat spesifik:

```text
A B C D ... Z
0 1 2 3 ... 9
```

bahkan formatnya relatif terstruktur.

Contoh Indonesia:

```text
B 1234 XYZ
AB 1234 CD
D 1234 ABC
AD 1234 XX
```

Jadi kamu bisa memanfaatkan **domain constraint**.

Misalnya OCR menghasilkan:

```text
B 1234 X8C
```

padahal kemungkinan besar:

```text
B 1234 XBC
```

Kamu bisa melakukan post-processing.

---

# 13. Bahkan bisa dibuat lebih pintar lagi

Misalnya output OCR:

```text
B 1234 X8C
```

Kemudian:

```text
OCR
 │
 ▼
Character confidence
 │
 ▼
Regex / format validator
 │
 ├── valid
 │
 └── invalid
       │
       ▼
   correction
```

Dengan demikian OCR tidak bekerja sendirian.

---

# 14. Dan jangan deteksi tulisan kecil tahun pajak

Ini yang kamu sebutkan tadi **sangat benar**.

Misalnya:

```text
┌───────────────────────────┐
│                           │
│       B 1234 XYZ          │  ← TARGET
│                           │
│                08•27      │  ← BUKAN TARGET
└───────────────────────────┘
```

Kalau kamu menggunakan general OCR:

```text
PaddleOCR
```

bisa saja dia mendeteksi:

```text
B 1234 XYZ
08 27
```

Padahal yang kamu inginkan hanya nomor registrasi.

### Solusi terbaik:

**Jangan biarkan OCR menentukan area target.**

Gunakan **license-plate-specific recognition**.

Setelah YOLO:

```text
full image
     ↓
license plate bbox
     ↓
crop
     ↓
OCR
```

dan kemudian filter hasil berdasarkan:

* posisi teks
* ukuran teks
* jumlah karakter
* format plat Indonesia
* confidence

---

# 15. Bahkan bisa lebih spesifik lagi: satu model YOLO untuk plat

Misalnya:

```yaml
names:
  0: license_plate
```

Tidak perlu:

```yaml
0: plate_number
1: tax_number
2: logo
3: vehicle
```

Karena YOLO tahap pertama hanya bertugas:

> **mencari lokasi bidang plat.**

Kemudian OCR bertugas membaca isi bidang tersebut.

---

# 16. Dataset YOLO yang saya sarankan untuk penelitianmu

Saya akan membuat dataset kira-kira seperti:

```text
LICENSE PLATE DETECTION DATASET

                 5.000 images
                       │
       ┌───────────────┼───────────────┐
       │               │               │
       ▼               ▼               ▼
     70%             20%              10%
    TRAIN             VAL             TEST
```

Tetapi yang lebih penting:

### TRAIN

```text
frontal
left
right
near
far
day
night
rain
blur
occlusion
different vehicles
different cameras
different resolutions
```

### VALIDATION

Kondisi yang masih representatif.

### TEST

**Jangan hanya random split.**

Ini penting.

Kalau satu kendaraan yang sama muncul di train dan test:

```text
TRAIN
B 1234 ABC

TEST
B 1234 ABC
```

hasil bisa terlalu bagus.

Lebih baik test berisi **kendaraan/plat yang belum pernah dilihat model**.

Implementasi ALPR Indonesia yang saya temukan juga melakukan audit *data leakage* pada level identitas plat sebelum membagi dataset OCR, justru untuk mencegah evaluasi menjadi bias. ([GitHub][10])

---

# 17. Saya akan membuat dataset lebih spesifik seperti ini

Misalnya:

```text
5.000 images
│
├── 1.500 frontal
├── 1.000 diagonal
├──   500 side angle
├──   500 far distance
├──   500 night
├──   500 rain / difficult lighting
├──   500 blur / motion
└──   500 occlusion / difficult
```

Tidak harus persis seperti itu, tetapi **distribusi kondisi** seperti ini jauh lebih berguna daripada mengejar angka gambar semata.

---

# 18. Dan ada satu trik penting: synthetic data

Untuk OCR, synthetic data bisa sangat membantu.

Misalnya kamu generate:

```text
B 1234 ABC
B 5678 XYZ
D 1234 AAA
AB 9876 XX
```

dengan berbagai:

* font
* ukuran
* blur
* noise
* brightness
* perspective
* rotation
* compression
* shadow

Lalu:

```text
Synthetic
   ↓
Pretraining OCR
   ↓
Real Indonesian plates
   ↓
Fine-tuning
```

Ada implementasi ALPR Indonesia terbaru yang melakukan pendekatan **synthetic → real** untuk fine-tuning TrOCR dan melaporkan strategi dua tahap tersebut sebagai bagian dari eksperimennya. ([GitHub][10])

---

# 19. Jadi kalau saya yang membangun proyekmu...

Saya akan membuat **3 level eksperimen**.

### Level 1 — Baseline

```text
YOLO11
   ↓
Crop
   ↓
PaddleOCR
```

Tujuannya mendapatkan baseline.

---

### Level 2 — Improved

```text
YOLO11
   ↓
Crop
   ↓
Perspective Correction
   ↓
Image Enhancement
   ↓
PaddleOCR
   ↓
Regex / Format Validation
```

Ini kemungkinan sudah jauh lebih kuat.

---

### Level 3 — Research / Advanced

```text
                 ┌───────────────┐
                 │ YOLO11 / YOLO  │
                 │ Plate Detector │
                 └───────┬───────┘
                         ↓
                Perspective
                 Rectification
                         ↓
                 ┌───────────────┐
                 │ OCR Recognizer│
                 │ TrOCR/Paddle  │
                 └───────┬───────┘
                         ↓
                 Character-level
                    confidence
                         ↓
                 Indonesian Plate
                   Format Model
                         ↓
                  FINAL RESULT
```

Dan kamu bisa membandingkan:

```text
Experiment A
YOLO + PaddleOCR

Experiment B
YOLO + Perspective + PaddleOCR

Experiment C
YOLO + Perspective + TrOCR

Experiment D
YOLO + Perspective + TrOCR
       + Synthetic Data
       + Post Processing
```

Itu sudah mulai terlihat seperti **penelitian Computer Vision/Deep Learning yang serius**, bukan sekadar "menggunakan YOLO untuk mendeteksi plat".

---

## 20. Metriknya juga harus dipisahkan

Ini sangat penting.

Jangan hanya mengatakan:

> "Akurasi sistem saya 95%."

Pisahkan:

### Detection

```text
Precision
Recall
mAP@50
mAP@50:95
IoU
```

YOLO memang menyediakan metrik detection seperti mAP50 dan mAP50-95. ([Ultralytics Docs][2])

### OCR

```text
Character Accuracy
Character Error Rate (CER)
Exact Match Accuracy
```

Misalnya:

```text
Ground truth:
B 1234 ABC

Prediction:
B 1234 A8C
```

Character accuracy:

```text
8/9
```

tetapi **exact plate accuracy = 0%**

Ini perbedaan yang sangat penting dalam ALPR.

---

# 21. Kesimpulan paling penting

Kalau targetmu adalah **membaca plat nomor Indonesia secara akurat**, saya **tidak menyarankan**:

```text
CNN klasifikasi
        +
OCR umum
```

Saya lebih menyarankan:

```text
        FULL IMAGE
             │
             ▼
    ┌─────────────────┐
    │ YOLO Detector   │
    │ license_plate   │
    └────────┬────────┘
             │
             ▼
       PLATE CROP
             │
             ▼
    Perspective Correction
             │
             ▼
      Image Enhancement
             │
             ▼
    ┌─────────────────┐
    │ OCR Recognition │
    │ PaddleOCR/TrOCR │
    └────────┬────────┘
             │
             ▼
      Post Processing
             │
             ▼
     Indonesian Format
         Validation
             │
             ▼
       B 1234 XYZ
```

Dan **dataset adalah faktor yang sama pentingnya dengan pemilihan model**. Untuk mulai, saya akan menggunakan **dataset Indonesia sebagai dasar + dataset milikmu sendiri**, sementara **CCPD dan UFPR-ALPR digunakan sebagai referensi benchmark/dataset tambahan**, bukan sebagai pengganti data Indonesia. ([GitHub][4])

Kalau kamu ingin membuat ini sebagai **proyek penelitian**, menurut saya langkah berikutnya yang paling bagus adalah kita desain **dataset plat Indonesia milikmu dari nol**: menentukan **jumlah gambar, pembagian train/val/test, variasi sudut, jarak, malam/siang, anotasi YOLO, anotasi OCR, sampai aturan agar angka tahun pajak tidak ikut terbaca**. Itu akan jauh lebih menentukan hasil akhirnya daripada sekadar memilih YOLO versi mana.

[1]: https://paddlepaddle.github.io/PaddleOCR/main/en/version3.x/pipeline_usage/OCR.html?utm_source=chatgpt.com "Usage Tutorial - PaddleOCR Documentation"
[2]: https://docs.ultralytics.com/tasks/detect?utm_source=chatgpt.com "Object Detection with Ultralytics YOLO | Ultralytics"
[3]: https://docs.ultralytics.com/guides/finetuning-guide?utm_source=chatgpt.com "Fine-Tune YOLO26 on a Custom Dataset | Ultralytics"
[4]: https://github.com/detectrecog/ccpd?utm_source=chatgpt.com "GitHub - detectRecog/CCPD: [ECCV 2018] CCPD: a diverse and well-annotated dataset for license plate detection and recognition · GitHub"
[5]: https://openaccess.thecvf.com/content_ECCV_2018/papers/Zhenbo_Xu_Towards_End-to-End_License_ECCV_2018_paper.pdf?utm_source=chatgpt.com "Towards End-to-End License Plate Detection and Recognition: A Large Dataset and Baseline"
[6]: https://web.inf.ufpr.br/vri/databases/ufpr-alpr/?utm_source=chatgpt.com "UFPR-ALPR Dataset - Laboratório Visão Robótica e Imagem"
[7]: https://www.kaggle.com/datasets/linkgish/indonesian-plate-number-from-multi-sources?utm_source=chatgpt.com "Indonesian Vehicle License Plate Dataset"
[8]: https://www.kaggle.com/datasets/juanthomaswijaya/indonesian-license-plate-dataset?utm_source=chatgpt.com "Indonesian License Plate Dataset"
[9]: https://paddlepaddle.github.io/PaddleOCR/main/en/quick_start.html?utm_source=chatgpt.com "Quick Start - PaddleOCR Documentation"
[10]: https://github.com/Andhiksu/indonesian-alpr-yolo11-trocr?utm_source=chatgpt.com "GitHub - Andhiksu/indonesian-alpr-yolo11-trocr: ALPR for Indonesian license plates (TNKB): YOLO11m detector + two-stage fine-tuned TrOCR recognizer, with a synthetic-data ablation study (K1–K4). Thesis/journal research code. · GitHub"
