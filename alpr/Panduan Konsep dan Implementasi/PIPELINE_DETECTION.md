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