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