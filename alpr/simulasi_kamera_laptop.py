"""
=============================================================================
  SIMULASI KAMERA LAPTOP — AUTOMATIC LICENSE PLATE RECOGNITION (ALPR) INDONESIA
=============================================================================
Arsitektur Pipeline 2-Stage:
  Stage 1 : YOLOv11s Plate Detector (yolo_plate_exp_c_best.pt)
  Stage 2 : Image Cropping (Padding 8% + OpenCV Enhancement)
  Stage 3 : TrOCR Text Recognizer (OCR Extraction Text Weight EXP 2)
  Stage 4 : Post-Processing Regex TNKB & Disambiguasi Karakter Indonesia

Fitur:
  - Real-time Webcam Stream (Threading OCR agar preview kamera tetap 30 FPS lancar)
  - HUD / Overlay futuristik (Bounding Box neon, badge plat, status validasi)
  - Otomatis mencatat riwayat deteksi ke 'riwayat_deteksi.csv'
  - Tombol kontrol:
      [Q] / [ESC] : Keluar dari simulasi
      [SPACE]     : Ambil foto snapshot & simpan hasil deteksi
      [T]         : Toggle mode (Auto Scan vs Manual Scan)
=============================================================================
"""

import sys
import os

# Pastikan output konsol Windows mendukung encoding UTF-8
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

import time
import re
import threading
from pathlib import Path
from datetime import datetime

# Cek dependensi utama
missing_deps = []
for pkg, import_name in [('ultralytics', 'ultralytics'), ('torch', 'torch'), ('transformers', 'transformers'), ('opencv-python', 'cv2'), ('Pillow', 'PIL')]:
    try:
        __import__(import_name)
    except ImportError:
        missing_deps.append(pkg)

if missing_deps:
    print("\n" + "=" * 70)
    print("[PERINGATAN] Beberapa library pendukung belum terinstal di laptop Anda!")
    print("=" * 70)
    print(f"Library yang belum ada: {', '.join(missing_deps)}")
    print("\nSilakan buka PowerShell atau Command Prompt, lalu jalankan perintah ini:")
    print("  pip install ultralytics transformers torch torchvision --index-url https://download.pytorch.org/whl/cpu")
    print("=" * 70 + "\n")
    sys.exit(1)

import cv2
import numpy as np
import torch
from PIL import Image
from ultralytics import YOLO
from transformers import TrOCRProcessor, VisionEncoderDecoderModel

# Optimasi CPU: Batasi thread PyTorch agar kamera lancar dan CPU tidak 100% tersedot
torch.set_num_threads(max(1, (os.cpu_count() or 4) // 2))

# ─── 1. KONFIGURASI PATH MODEL & ASSETS ─────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent
YOLO_WEIGHT_PATH = BASE_DIR / "Plate Detector Weight" / "yolo_plate_exp_c_best.pt"
TROCR_DIR_PATH   = BASE_DIR / "OCR Extraction Text Weight EXP 2"

# Fallback ke Exp-B jika Exp-C belum dipindahkan
if not YOLO_WEIGHT_PATH.exists():
    fallback_b = BASE_DIR / "Plate Detector Weight" / "yolo_plate_exp_b_best.pt"
    if fallback_b.exists():
        YOLO_WEIGHT_PATH = fallback_b

SCREENSHOTS_DIR = BASE_DIR / "hasil_tangkapan_kamera"
SCREENSHOTS_DIR.mkdir(exist_ok=True)
LOG_CSV_PATH    = BASE_DIR / "riwayat_deteksi.csv"

# ─── 2. KONFIGURASI DETEKSI & OCR ─────────────────────────────────────────────
DEFAULT_FLIP_MODE   = 0      # 0 = Flip Vertikal (Membetulkan kamera terbalik), 1 = Mirror, -1 = 180°, None = Normal
YOLO_CONF_THRESHOLD = 0.25   # Sensitivitas YOLO (0.20 - 0.30)
YOLO_IOU_THRESHOLD  = 0.45
YOLO_IMGSZ          = 384    # Dioptimasi ke 384px (dari 640px) agar webcam lancar 30 FPS di CPU
PAD_X_PCT           = 0.08   # 8% padding horizontal agar huruf tepi tidak terpotong
PAD_Y_PCT           = 0.04   # 4% padding vertikal
OCR_COOLDOWN_SEC    = 2.0    # Cooldown 2 detik agar CPU tidak terbebani saat menyorot plat yang sama

# Ambiguity Map Plat Indonesia
DIGIT_TO_CHAR = {'0': 'O', '1': 'I', '2': 'Z', '4': 'A', '5': 'S', '6': 'G', '8': 'B'}
CHAR_TO_DIGIT = {'O': '0', 'I': '1', 'Z': '2', 'A': '4', 'S': '5', 'G': '6', 'B': '8', 'Q': '0'}
TNKB_PATTERN  = re.compile(r'^([A-Z]{1,2})([0-9]{1,4})([A-Z]{1,3})$')

# ─── 3. FUNGSI POST-PROCESSING TNKB CERDAS ────────────────────────────────────
def _try_segment(chars, p_end, n_end):
    n = len(chars)
    if not (1 <= p_end + 1 <= 2):     return None, 0
    if not (1 <= n_end - p_end <= 4): return None, 0
    if not (1 <= n - n_end - 1 <= 3): return None, 0

    result = list(chars)
    changes = 0

    # Prefix (harus huruf)
    for i in range(0, p_end + 1):
        c = result[i]
        if c.isdigit():
            new = DIGIT_TO_CHAR.get(c, c)
            result[i] = new
            if new != c: changes += 1

    # Nomor (harus angka)
    for i in range(p_end + 1, n_end + 1):
        c = result[i]
        if c.isalpha():
            new = CHAR_TO_DIGIT.get(c, c)
            result[i] = new
            if new != c: changes += 1

    # Suffix (harus huruf)
    for i in range(n_end + 1, n):
        c = result[i]
        if c.isdigit():
            new = DIGIT_TO_CHAR.get(c, c)
            result[i] = new
            if new != c: changes += 1

    return ''.join(result), changes


def correct_char_ambiguity(text_raw):
    clean = re.sub(r'[^A-Z0-9]', '', text_raw.upper())
    n = len(clean)
    if n < 4 or n > 9:
        return clean

    max_changes = 1 if n >= 8 else 2
    chars = list(clean)
    best_candidate = None
    best_changes = float('inf')

    for p_end in range(0, 2):
        for n_end in range(p_end + 1, p_end + 5):
            if n_end >= n:
                continue
            cand, chg = _try_segment(chars, p_end, n_end)
            if cand is not None and TNKB_PATTERN.match(cand) and chg < best_changes and chg <= max_changes:
                best_changes = chg
                best_candidate = cand

    return best_candidate if best_candidate is not None else clean


def validate_tnkb(text):
    clean = re.sub(r'[^A-Z0-9]', '', text.upper())
    m = TNKB_PATTERN.match(clean)
    return (True, m.groups()) if m else (False, None)


def postprocess_plate(raw_text):
    cleaned   = re.sub(r'[^A-Z0-9]', '', raw_text.upper())
    corrected = correct_char_ambiguity(cleaned)
    is_valid, groups = validate_tnkb(corrected)
    return {
        'raw'      : raw_text,
        'final'    : corrected,
        'valid'    : is_valid,
        'groups'   : groups
    }

# ─── 4. FUNGSI CROP & IMAGE PROCESSING ─────────────────────────────────────────
def crop_plate(frame_bgr, xyxy):
    h, w = frame_bgr.shape[:2]
    x1, y1, x2, y2 = xyxy
    bw = x2 - x1
    bh = y2 - y1

    pad_x = int(bw * PAD_X_PCT)
    pad_y = int(bh * PAD_Y_PCT)

    x1 = max(0, x1 - pad_x)
    y1 = max(0, y1 - pad_y)
    x2 = min(w, x2 + pad_x)
    y2 = min(h, y2 + pad_y)

    crop_bgr = frame_bgr[y1:y2, x1:x2]
    crop_rgb = cv2.cvtColor(crop_bgr, cv2.COLOR_BGR2RGB)
    return crop_rgb, (x1, y1, x2, y2)


# ─── 5. KELAS ALPR ENGINE DENGAN ASYNC THREADING ──────────────────────────────
class AlprCameraEngine:
    def __init__(self, yolo_path, trocr_dir):
        print("\n" + "═" * 60)
        print("🚀 INISIALISASI SISTEM ALPR INDONESIA")
        print("═" * 60)
        
        # Device auto selection (GPU jika ada, CPU jika laptop standar)
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"  [Device]      : {self.device.upper()}")

        # 1. Load YOLO
        print(f"  [Load YOLO]   : {yolo_path.name} ...")
        self.yolo = YOLO(str(yolo_path))
        print("  [YOLO Ready]  : ✅")

        # 2. Load TrOCR
        print(f"  [Load TrOCR]  : {trocr_dir.name} ...")
        self.processor = TrOCRProcessor.from_pretrained(str(trocr_dir))
        self.ocr_model = VisionEncoderDecoderModel.from_pretrained(str(trocr_dir)).to(self.device)
        self.ocr_model.eval()
        print("  [TrOCR Ready] : ✅")
        print("═" * 60 + "\n")

        # Status & State
        self.last_ocr_time   = 0
        self.is_ocr_busy     = False
        self.latest_result   = None
        self.auto_scan_mode  = True
        self.detected_history = []

    def recognize_crop(self, crop_rgb):
        """Membaca teks dari crop RGB menggunakan TrOCR."""
        try:
            pil_img = Image.fromarray(crop_rgb)
            pixel_values = self.processor(pil_img, return_tensors="pt").pixel_values.to(self.device)
            with torch.no_grad():
                generated_ids = self.ocr_model.generate(
                    pixel_values,
                    max_new_tokens=12,
                    num_beams=1,
                    early_stopping=True,
                )
            raw_text = self.processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
            
            # Post-processing
            pp = postprocess_plate(raw_text)

            # Fallback jika hanya membaca angka pajak baris bawah (e.g. '1219')
            if (pp['final'].isdigit() or not pp['valid']) and crop_rgb.shape[0] >= 30:
                top_h = int(crop_rgb.shape[0] * 0.75)
                top_crop = crop_rgb[:top_h, :]
                top_pil = Image.fromarray(top_crop)
                top_pixels = self.processor(top_pil, return_tensors="pt").pixel_values.to(self.device)
                with torch.no_grad():
                    top_ids = self.ocr_model.generate(top_pixels, max_new_tokens=12, num_beams=1)
                top_raw = self.processor.batch_decode(top_ids, skip_special_tokens=True)[0]
                top_pp = postprocess_plate(top_raw)
                if top_pp['valid'] or (any(c.isalpha() for c in top_pp['final']) and len(top_pp['final']) >= 4):
                    pp = top_pp

            return pp
        except Exception as e:
            return {'raw': '', 'final': 'ERROR', 'valid': False}

    def trigger_ocr_async(self, crop_rgb, yolo_conf, bbox):
        """Menjalankan OCR di thread terpisah agar kamera tidak macet."""
        def worker():
            self.is_ocr_busy = True
            t_start = time.time()
            res = self.recognize_crop(crop_rgb)
            elapsed = (time.time() - t_start) * 1000

            plate_text = res['final']
            is_valid   = res['valid']
            groups     = res.get('groups')
            formatted  = " ".join(groups) if groups else plate_text

            self.latest_result = {
                'text'     : plate_text,
                'formatted': formatted,
                'raw'      : res.get('raw', ''),
                'valid'    : is_valid,
                'groups'   : groups,
                'conf'     : yolo_conf,
                'bbox'     : bbox,
                'crop_rgb' : crop_rgb,
                'time_ms'  : elapsed,
                'timestamp': datetime.now().strftime("%H:%M:%S"),
            }

            # Simpan ke riwayat jika plat valid dan belum dicatat dalam sesi terakhir
            if is_valid:
                now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                if not self.detected_history or self.detected_history[-1]['text'] != plate_text:
                    self.detected_history.append({'time': now_str, 'text': formatted, 'conf': f"{yolo_conf:.2f}"})
                    self.save_to_csv(now_str, formatted, yolo_conf)
                    print(f"🎯 [TERDETEKSI] Plat: {formatted} (Valid TNKB) | Conf: {yolo_conf:.2f} | OCR: {elapsed:.0f}ms")

            self.is_ocr_busy = False

        if not self.is_ocr_busy:
            threading.Thread(target=worker, daemon=True).start()

    def save_to_csv(self, timestamp, text, conf):
        write_header = not LOG_CSV_PATH.exists()
        with open(LOG_CSV_PATH, 'a', encoding='utf-8') as f:
            if write_header:
                f.write("Waktu,Plat_Nomor,Confidence_YOLO\n")
            f.write(f'"{timestamp}","{text}",{conf:.2f}\n')


# ─── 6. HUD / GRAPHICAL INTERFACE OVERLAY ──────────────────────────────────────
def draw_futuristic_hud(frame, engine, fps, detections):
    h, w = frame.shape[:2]
    overlay = frame.copy()

    # 1. Top Glassmorphism Dashboard
    cv2.rectangle(overlay, (0, 0), (w, 70), (20, 20, 24), -1)
    cv2.addWeighted(overlay, 0.75, frame, 0.25, 0, frame)

    # Garis aksen bawah header
    cv2.line(frame, (0, 70), (w, 70), (0, 255, 170), 2)

    # Judul & Status
    cv2.putText(frame, "ALPR INDONESIA — LIVE CAM", (20, 30),
                cv2.FONT_HERSHEY_DUPLEX, 0.75, (255, 255, 255), 2, cv2.LINE_AA)
    
    mode_text = "AUTO SCAN" if engine.auto_scan_mode else "MANUAL [SPACE]"
    cv2.putText(frame, f"MODE: {mode_text}", (20, 55),
                cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 255, 255), 1, cv2.LINE_AA)

    # FPS & Device
    cv2.putText(frame, f"FPS: {fps:04.1f} | {engine.device.upper()}", (w - 180, 30),
                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 170), 1, cv2.LINE_AA)

    status_ocr = "SCANNING..." if engine.is_ocr_busy else "READY"
    status_col = (0, 165, 255) if engine.is_ocr_busy else (0, 255, 0)
    cv2.putText(frame, f"STATUS: {status_ocr}", (w - 180, 55),
                cv2.FONT_HERSHEY_SIMPLEX, 0.45, status_col, 1, cv2.LINE_AA)

    # 2. Gambar Bounding Box Plat
    for det in detections:
        x1, y1, x2, y2 = det['xyxy']
        conf = det['conf']

        # Kotak Bounding Box Neon
        box_color = (0, 255, 120)  # Neon Green
        cv2.rectangle(frame, (x1, y1), (x2, y2), box_color, 2)

        # Corner Brackets Futuristik
        line_len = min(20, (x2 - x1) // 4)
        thickness = 3
        # Top-Left
        cv2.line(frame, (x1, y1), (x1 + line_len, y1), (255, 255, 255), thickness)
        cv2.line(frame, (x1, y1), (x1, y1 + line_len), (255, 255, 255), thickness)
        # Top-Right
        cv2.line(frame, (x2, y1), (x2 - line_len, y1), (255, 255, 255), thickness)
        cv2.line(frame, (x2, y1), (x2, y1 + line_len), (255, 255, 255), thickness)
        # Bottom-Left
        cv2.line(frame, (x1, y2), (x1 + line_len, y2), (255, 255, 255), thickness)
        cv2.line(frame, (x1, y2), (x1, y2 - line_len), (255, 255, 255), thickness)
        # Bottom-Right
        cv2.line(frame, (x2, y2), (x2 - line_len, y2), (255, 255, 255), thickness)
        cv2.line(frame, (x2, y2), (x2, y2 - line_len), (255, 255, 255), thickness)

        # Label di atas kotak
        label = f"PLAT [{conf:.2f}]"
        cv2.rectangle(frame, (x1, y1 - 22), (x1 + 110, y1), (20, 20, 24), -1)
        cv2.putText(frame, label, (x1 + 5, y1 - 6),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 255, 200), 1, cv2.LINE_AA)

    # 3. Bottom Card: Popup Hasil Pembacaan Terakhir + Foto Crop Plat
    if engine.latest_result:
        res = engine.latest_result
        text  = res['text']
        valid = res['valid']
        ts    = res['timestamp']
        crop_rgb = res.get('crop_rgb')

        card_w, card_h = 490, 105
        card_x, card_y = 20, h - card_h - 20

        # Background card (Dark translucent glassmorphism)
        card_ov = frame.copy()
        cv2.rectangle(card_ov, (card_x, card_y), (card_x + card_w, card_y + card_h), (20, 20, 26), -1)
        cv2.addWeighted(card_ov, 0.88, frame, 0.12, 0, frame)

        border_col = (0, 255, 120) if valid else (0, 140, 255)
        cv2.rectangle(frame, (card_x, card_y), (card_x + card_w, card_y + card_h), border_col, 2)

        # Tempel Foto Crop Plat di sisi kiri kartu popup jika ada
        if crop_rgb is not None and crop_rgb.size > 0:
            crop_bgr = cv2.cvtColor(crop_rgb, cv2.COLOR_RGB2BGR)
            target_pw, target_ph = 160, 50
            plate_thumb = cv2.resize(crop_bgr, (target_pw, target_ph), interpolation=cv2.INTER_AREA)

            thumb_x = card_x + 15
            thumb_y = card_y + 36

            # Render thumbnail foto plat
            frame[thumb_y:thumb_y + target_ph, thumb_x:thumb_x + target_pw] = plate_thumb
            cv2.rectangle(frame, (thumb_x - 1, thumb_y - 1), (thumb_x + target_pw, thumb_y + target_ph), (255, 255, 255), 1)

            cv2.putText(frame, "FOTO CROP PLAT:", (thumb_x, card_y + 24),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.38, (180, 180, 180), 1, cv2.LINE_AA)

            text_x_offset = thumb_x + target_pw + 20
        else:
            text_x_offset = card_x + 15

        # Teks Plat Hasil OCR di sisi kanan
        cv2.putText(frame, "HASIL PEMBACAAN OCR:", (text_x_offset, card_y + 24),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.40, (0, 255, 200), 1, cv2.LINE_AA)

        display_text = res.get('formatted') or (text if text else "MEMBACA...")
        cv2.putText(frame, display_text, (text_x_offset, card_y + 64),
                    cv2.FONT_HERSHEY_DUPLEX, 1.15, (255, 255, 255), 2, cv2.LINE_AA)

        status_str = "VALID TNKB" if valid else "FORMAT LAIN"
        cv2.putText(frame, f"{status_str} | {ts}", (text_x_offset, card_y + 92),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.42, border_col, 1, cv2.LINE_AA)

    # 4. Petunjuk Shortcut di Kanan Bawah
    cv2.putText(frame, "[Q] Keluar | [SPACE] Foto | [F] Flip | [P] Pop-up",
                (w - 430, h - 20), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (180, 180, 180), 1, cv2.LINE_AA)


def render_ocr_popup(res):
    """
    Membuat canvas pop-up window khusus yang menampilkan:
    - Foto crop plat nomor beresolusi jelas (aspect ratio terjaga)
    - Teks hasil pembacaan OCR (format TNKB dengan spasi rapi)
    - Badge status validitas plat nomor
    - Metrik deteksi (YOLO Conf, Latensi OCR, Timestamp)
    """
    w, h = 560, 370
    canvas = np.full((h, w, 3), (24, 20, 18), dtype=np.uint8)

    # 1. Header Pop-up
    cv2.rectangle(canvas, (0, 0), (w, 42), (35, 30, 26), -1)
    cv2.line(canvas, (0, 42), (w, 42), (0, 230, 130), 2)
    cv2.putText(canvas, "POPUP HASIL PEMBACAAN OCR", (18, 28),
                cv2.FONT_HERSHEY_DUPLEX, 0.62, (255, 255, 255), 1, cv2.LINE_AA)
    cv2.putText(canvas, res.get('timestamp', '00:00:00'), (w - 100, 28),
                cv2.FONT_HERSHEY_SIMPLEX, 0.48, (0, 230, 130), 1, cv2.LINE_AA)

    # 2. Label Foto Plat
    cv2.putText(canvas, "FOTO PLAT HASIL CROP & ENHANCE:", (20, 62),
                cv2.FONT_HERSHEY_SIMPLEX, 0.40, (170, 170, 170), 1, cv2.LINE_AA)

    # 3. Wadah Foto Crop Plat Nomor
    crop_rgb = res.get('crop_rgb')
    if crop_rgb is not None and crop_rgb.size > 0:
        crop_bgr = cv2.cvtColor(crop_rgb, cv2.COLOR_RGB2BGR) if len(crop_rgb.shape) == 3 and crop_rgb.shape[2] == 3 else crop_rgb
        ch, cw = crop_bgr.shape[:2]
        max_cw, max_ch = 520, 130
        scale = min(max_cw / cw, max_ch / ch)
        new_cw, new_ch = max(1, int(cw * scale)), max(1, int(ch * scale))
        resized_crop = cv2.resize(crop_bgr, (new_cw, new_ch), interpolation=cv2.INTER_AREA)

        crop_x = (w - new_cw) // 2
        crop_y = 72 + (max_ch - new_ch) // 2

        cv2.rectangle(canvas, (crop_x - 3, crop_y - 3), (crop_x + new_cw + 3, crop_y + new_ch + 3), (45, 40, 36), -1)
        canvas[crop_y:crop_y + new_ch, crop_x:crop_x + new_cw] = resized_crop
        cv2.rectangle(canvas, (crop_x - 3, crop_y - 3), (crop_x + new_cw + 3, crop_y + new_ch + 3), (0, 255, 170), 1)

    # 4. Kotak Teks Plat Nomor (Besar & Kontras)
    box_y = 215
    cv2.rectangle(canvas, (20, box_y), (w - 20, box_y + 75), (32, 28, 24), -1)

    is_valid = res.get('valid', False)
    border_col = (0, 230, 130) if is_valid else (0, 140, 255)
    cv2.rectangle(canvas, (20, box_y), (w - 20, box_y + 75), border_col, 2)

    display_plate = res.get('formatted') or res.get('text', '-')
    cv2.putText(canvas, display_plate, (35, box_y + 50),
                cv2.FONT_HERSHEY_DUPLEX, 1.30, (255, 255, 255), 2, cv2.LINE_AA)

    # Badge Status
    status_label = "VALID TNKB" if is_valid else "NON-STANDAR"
    badge_bg = (0, 120, 50) if is_valid else (0, 80, 160)
    cv2.rectangle(canvas, (w - 180, box_y + 12), (w - 32, box_y + 36), badge_bg, -1)
    cv2.putText(canvas, status_label, (w - 170, box_y + 29),
                cv2.FONT_HERSHEY_SIMPLEX, 0.40, (255, 255, 255), 1, cv2.LINE_AA)

    # Raw OCR text info jika berbeda
    raw_str = res.get('raw', '')
    if raw_str and raw_str != display_plate:
        cv2.putText(canvas, f"Raw: {raw_str}", (w - 180, box_y + 58),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.40, (180, 180, 180), 1, cv2.LINE_AA)

    # 5. Baris Metrik Info Teknis
    info_y = 315
    conf = res.get('conf', 0.0)
    time_ms = res.get('time_ms', 0.0)
    info_text = f"YOLO Conf: {conf*100:.1f}%  |  OCR Latency: {time_ms:.0f} ms"
    cv2.putText(canvas, info_text, (20, info_y),
                cv2.FONT_HERSHEY_SIMPLEX, 0.42, (0, 230, 130), 1, cv2.LINE_AA)

    # 6. Footer Navigasi
    cv2.putText(canvas, "[SPACE] Simpan Snapshot  |  [P] Tutup/Buka Pop-up  |  [Q] Keluar", (20, 348),
                cv2.FONT_HERSHEY_SIMPLEX, 0.38, (140, 140, 140), 1, cv2.LINE_AA)

    return canvas


# ─── 7. MAIN RUNNER (WEBCAM LOOP) ──────────────────────────────────────────────
def run_laptop_camera(camera_index=0):
    if not YOLO_WEIGHT_PATH.exists():
        print(f"❌ Error: File bobot YOLO tidak ditemukan di:\n   {YOLO_WEIGHT_PATH}")
        return

    if not TROCR_DIR_PATH.exists() or not (TROCR_DIR_PATH / "model.safetensors").exists():
        print(f"❌ Error: Folder bobot TrOCR tidak lengkap di:\n   {TROCR_DIR_PATH}")
        return

    # Inisialisasi Engine
    engine = AlprCameraEngine(YOLO_WEIGHT_PATH, TROCR_DIR_PATH)

    print("📷 Membuka Kamera Laptop / Webcam...")
    cap = cv2.VideoCapture(camera_index, cv2.CAP_DSHOW) if sys.platform.startswith('win') else cv2.VideoCapture(camera_index)

    if not cap.isOpened():
        print(f"❌ Gagal mengakses kamera index {camera_index}!")
        print("   Tips: Pastikan webcam tidak sedang dipakai aplikasi lain (Zoom, Teams, dsb).")
        return

    # Set resolusi kamera (720p jika didukung)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)

    window_name = "SIMULASI ALPR INDONESIA — KAMERA LAPTOP"
    cv2.namedWindow(window_name, cv2.WINDOW_NORMAL)
    cv2.resizeWindow(window_name, 1024, 600)

    # Inisialisasi Pop-up Window Khusus Hasil OCR
    popup_window_name = "POPUP HASIL DETEKSI OCR — ALPR"
    show_popup = True
    popup_opened = False

    # Inisialisasi Orientasi Kamera
    flip_mode = DEFAULT_FLIP_MODE

    print("\n" + "═" * 60)
    print("✅ KAMERA AKTIF! Arahkan plat nomor kendaraan ke kamera.")
    print("   [Q] / [ESC] : Keluar")
    print("   [SPACE]     : Simpan Foto Snapshot (Kamera + Pop-up)")
    print("   [F]         : Putar / Balik Kamera (Flip Vertikal/Horizontal)")
    print("   [P]         : Buka / Tutup Pop-up Window OCR")
    print("   [T]         : Toggle Auto / Manual Scan")
    print("═" * 60 + "\n")

    prev_time = time.time()
    fps = 0.0
    frame_count = 0
    cached_detections = []

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                print("⚠️ Tidak ada frame dari kamera, mencoba membaca ulang...")
                time.sleep(0.1)
                continue

            # Balik orientasi kamera jika terbalik
            if flip_mode is not None:
                frame = cv2.flip(frame, flip_mode)

            # Hitung FPS
            cur_time = time.time()
            fps = 1.0 / (cur_time - prev_time + 1e-6)
            prev_time = cur_time

            # 1. Deteksi YOLO pada frame kamera (setiap 2 frame untuk menjaga kelancaran 30 FPS di CPU)
            frame_count += 1
            if frame_count % 2 == 0 or not cached_detections:
                results = engine.yolo(
                    frame,
                    conf=YOLO_CONF_THRESHOLD,
                    iou=YOLO_IOU_THRESHOLD,
                    imgsz=YOLO_IMGSZ,
                    verbose=False
                )[0]

                cached_detections = []
                for box in results.boxes:
                    xyxy = box.xyxy[0].cpu().numpy().astype(int).tolist()
                    conf = float(box.conf[0].cpu())
                    cached_detections.append({'xyxy': xyxy, 'conf': conf})

            detections = cached_detections

            # 2. Jika ada plat terdeteksi, jadwalkan OCR
            if detections:
                best_det = max(detections, key=lambda d: d['conf'])
                crop_rgb, bbox_padded = crop_plate(frame, best_det['xyxy'])

                # Pemicu Auto-Scan dengan Cooldown
                now = time.time()
                if engine.auto_scan_mode and (now - engine.last_ocr_time > OCR_COOLDOWN_SEC) and not engine.is_ocr_busy:
                    engine.last_ocr_time = now
                    engine.trigger_ocr_async(crop_rgb, best_det['conf'], bbox_padded)

            # 3. Gambar HUD dan Overlay Visual pada Kamera Utama
            draw_futuristic_hud(frame, engine, fps, detections)

            # Tampilkan Window Kamera Utama
            cv2.imshow(window_name, frame)

            # Tampilkan Pop-up Window Khusus Hasil OCR jika ada hasil pembacaan
            if show_popup and engine.latest_result:
                popup_canvas = render_ocr_popup(engine.latest_result)
                if not popup_opened:
                    cv2.namedWindow(popup_window_name, cv2.WINDOW_NORMAL)
                    cv2.resizeWindow(popup_window_name, 560, 370)
                    popup_opened = True

                try:
                    if cv2.getWindowProperty(popup_window_name, cv2.WND_PROP_VISIBLE) >= 1:
                        cv2.imshow(popup_window_name, popup_canvas)
                    else:
                        show_popup = False
                        popup_opened = False
                except Exception:
                    pass

            # 4. Tangani Input Keyboard
            key = cv2.waitKey(1) & 0xFF
            if key in [ord('q'), ord('Q'), 27]:  # 27 = ESC
                print("\n🛑 Simulasi dihentikan oleh pengguna.")
                break

            elif key == ord(' '):  # SPACEBAR = Snapshot
                now_fn = datetime.now().strftime("%Y%m%d_%H%M%S")
                snap_path = SCREENSHOTS_DIR / f"capture_{now_fn}_camera.jpg"
                cv2.imwrite(str(snap_path), frame)
                print(f"📸 Snapshot kamera disimpan ke: {snap_path}")

                if engine.latest_result:
                    popup_snap = render_ocr_popup(engine.latest_result)
                    popup_path = SCREENSHOTS_DIR / f"capture_{now_fn}_popup_ocr.jpg"
                    cv2.imwrite(str(popup_path), popup_snap)
                    print(f"📸 Snapshot popup OCR disimpan ke: {popup_path}")

            elif key in [ord('f'), ord('F')]:  # F = Flip Kamera
                flip_cycle = [0, -1, 1, None]
                cur_idx = flip_cycle.index(flip_mode) if flip_mode in flip_cycle else -1
                flip_mode = flip_cycle[(cur_idx + 1) % len(flip_cycle)]
                desc = {0: "Flip Vertikal (Atas-Bawah)", -1: "Putar 180 Derajat", 1: "Flip Horizontal (Mirror)", None: "Normal (Tanpa Flip)"}
                print(f"🔄 Orientasi Kamera Diubah: {desc[flip_mode]}")

            elif key in [ord('p'), ord('P')]:  # P = Toggle Pop-up Window
                show_popup = not show_popup
                status_p = "DITAMPILKAN" if show_popup else "DISEMBUNYIKAN"
                print(f"🪟 Pop-up window hasil OCR: {status_p}")
                if not show_popup and popup_opened:
                    try:
                        cv2.destroyWindow(popup_window_name)
                    except Exception:
                        pass
                    popup_opened = False

            elif key in [ord('t'), ord('T')]:  # Toggle Mode
                engine.auto_scan_mode = not engine.auto_scan_mode
                mode_str = "AUTO SCAN" if engine.auto_scan_mode else "MANUAL SCAN"
                print(f"🔄 Mode diganti menjadi: {mode_str}")

    except KeyboardInterrupt:
        print("\n🛑 Dihentikan via terminal.")

    finally:
        cap.release()
        cv2.destroyAllWindows()
        print(f"📁 Log riwayat deteksi disimpan di: {LOG_CSV_PATH}")
        print("Terima kasih telah menggunakan sistem ALPR Indonesia!\n")


if __name__ == "__main__":
    run_laptop_camera()
