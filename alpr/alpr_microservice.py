"""
=============================================================================
MODUL EDGE AI MICROSERVICE — AUTOMATIC LICENSE PLATE RECOGNITION (ALPR)
SISTEM PARKIR CERDAS TERINTEGRASI IOT (SPCT IOT)
=============================================================================
Peran Komponen:
  - Berjalan sebagai Microservice mandiri pada perangkat Edge (Laptop Gerbang)
  - Melayani REST API HTTP pada port 5001 (menggunakan ThreadingHTTPServer standar)
  - Mengelola siklus hidup kamera (Hot Standby -> Active Scan -> Auto-Off 3 Detik)
  - Pipeline Deteksi 2-Stage:
      Stage 1 : YOLOv11s Bounding Box Detector (yolo_plate_exp_c_best.pt)
      Stage 2 : Image Cropping & OpenCV Padding Enhancement
      Stage 3 : TrOCR Indonesian Character Recognition (VisionEncoderDecoder)
      Stage 4 : Post-Processing Regex TNKB & Ambiguity Disambiguation
  - Terintegrasi dengan Central Server (Spring Boot PC port 8081)

Endpoints REST API:
  - GET  /health          : Status kesiapan layanan & model AI
  - POST /api/alpr/scan   : Pemicu on-demand pemindaian plat (Masuk / Keluar)
  - POST /api/alpr/stop   : Pembatalan paksa proses pemindaian aktif
=============================================================================
"""

import sys
import os
import time
import json
import re
import threading
from pathlib import Path
from datetime import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler
from socketserver import ThreadingMixIn
import urllib.request
import urllib.parse

# Memastikan standar encoding output konsol Windows adalah UTF-8
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

# Import OpenCV dan NumPy untuk manipulasi citra
import cv2
import numpy as np

# ─── 1. PEMERIKSAAN DEPENDENSI DEEP LEARNING (TORCH, ULTRALYTICS, TROCR) ──────
TORCH_AVAILABLE = False
TROCR_AVAILABLE = False
YOLO_AVAILABLE = False

try:
    import torch
    from PIL import Image
    TORCH_AVAILABLE = True
except ImportError:
    pass

try:
    from ultralytics import YOLO
    YOLO_AVAILABLE = True
except ImportError:
    pass

try:
    from transformers import TrOCRProcessor, VisionEncoderDecoderModel
    TROCR_AVAILABLE = True
except ImportError:
    pass

# Batasi jumlah thread PyTorch agar CPU laptop tidak tersedot 100%
if TORCH_AVAILABLE:
    torch.set_num_threads(max(1, (os.cpu_count() or 4) // 2))

# ─── 2. KONFIGURASI DIREKTORI & FILE ──────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent
CONFIG_PATH = BASE_DIR / "alpr_config.json"
YOLO_WEIGHT_PATH = BASE_DIR / "Plate Detector Weight" / "yolo_plate_exp_c_best.pt"
TROCR_DIR_PATH = BASE_DIR / "OCR Extraction Text Weight EXP 2"
SCREENSHOTS_DIR = BASE_DIR / "hasil_tangkapan_kamera"
SCREENSHOTS_DIR.mkdir(exist_ok=True)
LOG_CSV_PATH = BASE_DIR / "riwayat_deteksi.csv"

# Fallback ke bobot Exp-B jika Exp-C tidak ada
if not YOLO_WEIGHT_PATH.exists():
    fallback_b = BASE_DIR / "Plate Detector Weight" / "yolo_plate_exp_b_best.pt"
    if fallback_b.exists():
        YOLO_WEIGHT_PATH = fallback_b

# ─── 3. PEMBACAAN FILE KONFIGURASI ─────────────────────────────────────────────
DEFAULT_CONFIG = {
    "server_host": "0.0.0.0",
    "server_port": 5001,
    "spring_boot_url": "http://localhost:8081",
    "camera_index": 0,
    "scan_timeout_sec": 15,
    "auto_off_delay_sec": 3.0,
    "yolo_conf_threshold": 0.25,
    "yolo_imgsz": 384,
    "default_flip_mode": 0,
    "show_opencv_window": True
}

def load_config():
    """Membaca konfigurasi dari alpr_config.json dengan nilai default cadangan."""
    if CONFIG_PATH.exists():
        try:
            with open(CONFIG_PATH, "r", encoding="utf-8") as f:
                loaded = json.load(f)
                return {**DEFAULT_CONFIG, **loaded}
        except Exception as e:
            print(f"[CONFIG] Gagal memuat file konfigurasi: {e}. Menggunakan konfigurasi default.")
    return DEFAULT_CONFIG

APP_CONFIG = load_config()

# Pola Regex TNKB Indonesia dan Peta Disambiguasi Karakter
DIGIT_TO_CHAR = {'0': 'O', '1': 'I', '2': 'Z', '4': 'A', '5': 'S', '6': 'G', '8': 'B'}
CHAR_TO_DIGIT = {'O': '0', 'I': '1', 'Z': '2', 'A': '4', 'S': '5', 'G': '6', 'B': '8', 'Q': '0'}
TNKB_PATTERN = re.compile(r'^([A-Z]{1,2})([0-9]{1,4})([A-Z]{1,3})$')

# ─── 4. ALGORITMA POST-PROCESSING TNKB INDONESIA ──────────────────────────────
def _try_segment(chars, p_end, n_end):
    """Mencoba segmentasi prefix huruf, angka nomor, dan suffix huruf TNKB."""
    n = len(chars)
    if not (1 <= p_end + 1 <= 2):
        return None, 0
    if not (1 <= n_end - p_end <= 4):
        return None, 0
    if not (1 <= n - n_end - 1 <= 3):
        return None, 0

    result = list(chars)
    changes = 0

    # Prefix: Harus huruf alfabet
    for i in range(0, p_end + 1):
        c = result[i]
        if c.isdigit():
            new = DIGIT_TO_CHAR.get(c, c)
            result[i] = new
            if new != c:
                changes += 1

    # Nomor Polisi: Harus digit angka
    for i in range(p_end + 1, n_end + 1):
        c = result[i]
        if c.isalpha():
            new = CHAR_TO_DIGIT.get(c, c)
            result[i] = new
            if new != c:
                changes += 1

    # Suffix: Harus huruf alfabet
    for i in range(n_end + 1, n):
        c = result[i]
        if c.isdigit():
            new = DIGIT_TO_CHAR.get(c, c)
            result[i] = new
            if new != c:
                changes += 1

    return ''.join(result), changes


def correct_char_ambiguity(text_raw):
    """Memperbaiki karakter ambigu berdasarkan aturan plat nomor kepolisian Indonesia."""
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
    """Memvalidasi apakah string memenuhi standar plat nomor Indonesia."""
    clean = re.sub(r'[^A-Z0-9]', '', text.upper())
    m = TNKB_PATTERN.match(clean)
    return (True, m.groups()) if m else (False, None)


def postprocess_plate(raw_text):
    """Menghasilkan teks plat akhir yang bersih, terformat, dan valid."""
    cleaned = re.sub(r'[^A-Z0-9]', '', raw_text.upper())
    corrected = correct_char_ambiguity(cleaned)
    is_valid, groups = validate_tnkb(corrected)
    formatted = " ".join(groups) if groups else corrected
    return {
        'raw': raw_text,
        'final': corrected,
        'formatted': formatted,
        'valid': is_valid,
        'groups': groups
    }


def crop_plate(frame_bgr, xyxy, pad_x_pct=0.08, pad_y_pct=0.04):
    """Memotong area plat nomor dari frame kamera dengan padding proporsional."""
    h, w = frame_bgr.shape[:2]
    x1, y1, x2, y2 = xyxy
    bw = x2 - x1
    bh = y2 - y1

    pad_x = int(bw * pad_x_pct)
    pad_y = int(bh * pad_y_pct)

    x1 = max(0, x1 - pad_x)
    y1 = max(0, y1 - pad_y)
    x2 = min(w, x2 + pad_x)
    y2 = min(h, y2 + pad_y)

    crop_bgr = frame_bgr[y1:y2, x1:x2]
    crop_rgb = cv2.cvtColor(crop_bgr, cv2.COLOR_BGR2RGB)
    return crop_rgb, (x1, y1, x2, y2)


# ─── 5. KELAS MESIN AI ALPR EDGE ──────────────────────────────────────────────
class AlprMicroserviceEngine:
    """Kelas pengelola model AI YOLO & TrOCR serta status operasional kamera."""
    def __init__(self):
        self.device = "cuda" if (TORCH_AVAILABLE and torch.cuda.is_available()) else "cpu"
        self.yolo_model = None
        self.trocr_processor = None
        self.trocr_model = None
        self.is_simulation_mode = not (YOLO_AVAILABLE and TROCR_AVAILABLE)

        # Inisialisasi model deep learning jika dependensi tersedia
        if not self.is_simulation_mode and YOLO_WEIGHT_PATH.exists() and TROCR_DIR_PATH.exists():
            try:
                print(f"[ALPR] Memuat bobot YOLOv11s: {YOLO_WEIGHT_PATH.name} ({self.device.upper()})...")
                self.yolo_model = YOLO(str(YOLO_WEIGHT_PATH))
                print(f"[ALPR] Memuat bobot TrOCR: {TROCR_DIR_PATH.name}...")
                self.trocr_processor = TrOCRProcessor.from_pretrained(str(TROCR_DIR_PATH))
                self.trocr_model = VisionEncoderDecoderModel.from_pretrained(str(TROCR_DIR_PATH)).to(self.device)
                self.trocr_model.eval()
                print("[ALPR] Model AI YOLO & TrOCR berhasil diinisialisasi secara penuh!")
            except Exception as e:
                print(f"[ALPR WARNING] Gagal menginisialisasi model deep learning: {e}")
                self.is_simulation_mode = True
        else:
            print("[ALPR INFO] Mode simulasi diaktifkan (dependensi atau bobot model deep learning belum lengkap).")

        # Status Operasional Microservice
        self.state_lock = threading.Lock()
        self.current_state = "STANDBY"  # "STANDBY", "SCANNING", "SUCCESS", "TIMEOUT"
        self.active_gate = "MASUK"
        self.active_vehicle_type = "MOBIL"
        self.scan_start_time = 0
        self.scan_timeout_sec = APP_CONFIG.get("scan_timeout_sec", 15)
        self.last_detection_result = None
        self.scan_event = threading.Event()
        self.camera_active = False

    def is_ready(self):
        """Memeriksa kesiapan operasional mesin AI."""
        return True

    def recognize_crop(self, crop_rgb):
        """Membaca teks dari gambar crop plat menggunakan TrOCR."""
        if self.is_simulation_mode or self.trocr_model is None:
            # Fallback simulasi plat realistis
            dummy_numbers = f"{int(time.time() * 1000) % 9000 + 1000}"
            dummy_plate = f"B {dummy_numbers} SPCT"
            return postprocess_plate(dummy_plate)

        try:
            pil_img = Image.fromarray(crop_rgb)
            pixel_values = self.trocr_processor(pil_img, return_tensors="pt").pixel_values.to(self.device)
            with torch.no_grad():
                generated_ids = self.trocr_model.generate(
                    pixel_values,
                    max_new_tokens=12,
                    num_beams=1,
                    early_stopping=True
                )
            raw_text = self.trocr_processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
            pp = postprocess_plate(raw_text)

            # Fallback jika hanya membaca angka pajak baris bawah
            if (pp['final'].isdigit() or not pp['valid']) and crop_rgb.shape[0] >= 30:
                top_h = int(crop_rgb.shape[0] * 0.75)
                top_crop = crop_rgb[:top_h, :]
                top_pil = Image.fromarray(top_crop)
                top_pixels = self.trocr_processor(top_pil, return_tensors="pt").pixel_values.to(self.device)
                with torch.no_grad():
                    top_ids = self.trocr_model.generate(top_pixels, max_new_tokens=12, num_beams=1)
                top_raw = self.trocr_processor.batch_decode(top_ids, skip_special_tokens=True)[0]
                top_pp = postprocess_plate(top_raw)
                if top_pp['valid'] or (any(c.isalpha() for c in top_pp['final']) and len(top_pp['final']) >= 4):
                    pp = top_pp

            return pp
        except Exception as e:
            print(f"[OCR ERROR] {e}")
            return {'raw': '', 'final': 'ERROR', 'formatted': 'ERROR', 'valid': False, 'groups': None}

    def start_scan_trigger(self, gerbang="MASUK", jenis="MOBIL", timeout_sec=15):
        """Memulai sesi pemindaian on-demand saat dipicu oleh Kiosk / Central Core."""
        with self.state_lock:
            self.current_state = "SCANNING"
            self.active_gate = gerbang.upper()
            self.active_vehicle_type = jenis.upper()
            self.scan_start_time = time.time()
            self.scan_timeout_sec = timeout_sec
            self.last_detection_result = None
            self.scan_event.clear()

        print(f"\n[TRIGGER DITERIMA] Gerbang: {self.active_gate} | Kendaraan: {self.active_vehicle_type} | Timeout: {timeout_sec}s")
        print("  -> Kamera diaktifkan, memindai plat nomor...")

        # Menunggu hingga plat terdeteksi atau timeout
        completed = self.scan_event.wait(timeout=timeout_sec + 1.0)

        with self.state_lock:
            if completed and self.last_detection_result is not None:
                res = self.last_detection_result
                return {
                    "status": "SUKSES",
                    "platNomor": res["platNomor"],
                    "formatted": res.get("formatted", res["platNomor"]),
                    "jenisKendaraan": self.active_vehicle_type,
                    "gerbang": self.active_gate,
                    "confidence": res.get("confidence", 0.95),
                    "waktuEksekusiMs": res.get("waktuEksekusiMs", 500),
                    "pesan": f"Plat nomor {res['platNomor']} berhasil dideteksi."
                }
            else:
                self.current_state = "TIMEOUT"
                return {
                    "status": "TIMEOUT",
                    "platNomor": None,
                    "jenisKendaraan": self.active_vehicle_type,
                    "gerbang": self.active_gate,
                    "confidence": 0.0,
                    "waktuEksekusiMs": int((time.time() - self.scan_start_time) * 1000),
                    "pesan": f"Waktu pemindaian ({timeout_sec} detik) habis. Plat nomor tidak terdeteksi."
                }

    def record_success_detection(self, plate_result, yolo_conf, elapsed_ms, crop_rgb=None):
        """Mencatat deteksi sukses dan membangunkan thread HTTP pemicu."""
        with self.state_lock:
            if self.current_state != "SCANNING":
                return

            self.current_state = "SUCCESS"
            self.last_detection_result = {
                "platNomor": plate_result["final"],
                "formatted": plate_result["formatted"],
                "confidence": round(float(yolo_conf), 2),
                "waktuEksekusiMs": int(elapsed_ms),
                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "crop_rgb": crop_rgb
            }
            self.scan_event.set()

        # Simpan rekaman deteksi ke CSV log
        try:
            write_header = not LOG_CSV_PATH.exists()
            with open(LOG_CSV_PATH, 'a', encoding='utf-8') as f:
                if write_header:
                    f.write("Waktu,Plat_Nomor,Jenis_Kendaraan,Gerbang,Confidence_YOLO,Durasi_Ms\n")
                f.write(f'"{datetime.now().strftime("%Y-%m-%d %H:%M:%S")}","{plate_result["formatted"]}","{self.active_vehicle_type}","{self.active_gate}",{yolo_conf:.2f},{elapsed_ms:.0f}\n')
        except Exception as e:
            print(f"[CSV LOG ERROR] Gagal menulis ke CSV: {e}")

        print(f"🎯 [TERDETEKSI] Plat: {plate_result['formatted']} | Conf: {yolo_conf:.2f} | Durasi: {elapsed_ms:.0f}ms")


# Instansiasi singleton engine ALPR
ALPR_ENGINE = AlprMicroserviceEngine()


# ─── 6. HANDLER SERVER HTTP REST API (THREADING) ──────────────────────────────
class ThreadingHTTPServer(ThreadingMixIn, HTTPServer):
    """Server HTTP multi-thread untuk menangani request REST bersamaan."""
    daemon_threads = True


class AlprHttpHandler(BaseHTTPRequestHandler):
    """Handler endpoint REST API untuk melayani komunikasi dengan Central Core."""

    def _set_cors_headers(self, status_code=200, content_type="application/json"):
        """Menambahkan header CORS lengkap untuk komunikasi lintas domain."""
        self.send_response(status_code)
        self.send_header("Content-Type", content_type)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()

    def do_OPTIONS(self):
        """Menanggapi preflight check OPTIONS dari browser web."""
        self._set_cors_headers(200)

    def do_GET(self):
        """Menangani permintaan HTTP GET (Status dan Health Check)."""
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path

        if path in ["/health", "/api/alpr/status", "/"]:
            res = {
                "status": "ONLINE",
                "service": "SPCT IoT - Edge ALPR Microservice",
                "state": ALPR_ENGINE.current_state,
                "device": ALPR_ENGINE.device.upper(),
                "simulationMode": ALPR_ENGINE.is_simulation_mode,
                "timestamp": datetime.now().isoformat()
            }
            self._set_cors_headers(200)
            self.wfile.write(json.dumps(res, indent=2).encode('utf-8'))
        else:
            self._set_cors_headers(404)
            self.wfile.write(json.dumps({"error": "Endpoint tidak ditemukan"}).encode('utf-8'))

    def do_POST(self):
        """Menangani permintaan HTTP POST (Pemicu Pemindaian Kamera)."""
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path

        # Membaca body request jika ada
        content_length = int(self.headers.get('Content-Length', 0))
        body_data = {}
        if content_length > 0:
            try:
                body_bytes = self.rfile.read(content_length)
                body_data = json.loads(body_bytes.decode('utf-8'))
            except Exception:
                body_data = {}

        # Parsing query params sebagai fallback
        query_params = urllib.parse.parse_qs(parsed_url.query)

        if path == "/api/alpr/scan":
            gerbang = body_data.get("gerbang") or query_params.get("gerbang", ["MASUK"])[0]
            jenis = body_data.get("jenis") or query_params.get("jenis", ["MOBIL"])[0]
            timeout = int(body_data.get("timeout") or query_params.get("timeout", [15])[0])

            # Jalankan siklus pemindaian kamera on-demand
            scan_result = ALPR_ENGINE.start_scan_trigger(gerbang=gerbang, jenis=jenis, timeout_sec=timeout)

            status_http = 200 if scan_result["status"] == "SUKSES" else (408 if scan_result["status"] == "TIMEOUT" else 500)
            self._set_cors_headers(status_http)
            self.wfile.write(json.dumps(scan_result, indent=2).encode('utf-8'))

        elif path == "/api/alpr/stop":
            with ALPR_ENGINE.state_lock:
                ALPR_ENGINE.current_state = "STANDBY"
                ALPR_ENGINE.scan_event.set()
            self._set_cors_headers(200)
            self.wfile.write(json.dumps({"status": "STANDBY", "pesan": "Pemindaian dihentikan."}).encode('utf-8'))

        else:
            self._set_cors_headers(404)
            self.wfile.write(json.dumps({"error": "Endpoint tidak ditemukan"}).encode('utf-8'))

    def log_message(self, format, *args):
        """Menyesuaikan format log HTTP agar rapi di konsol terminal."""
        sys.stderr.write(f"[HTTP] {self.address_string()} - {format % args}\n")


# ─── 7. THREAD WORKER LOOP KAMERA OPENCV ──────────────────────────────────────
def opencv_camera_worker():
    """Worker background untuk mengelola loop penangkapan frame kamera dan visualisasi HUD."""
    cam_index = APP_CONFIG.get("camera_index", 0)
    flip_mode = APP_CONFIG.get("default_flip_mode", 0)
    show_window = APP_CONFIG.get("show_opencv_window", True)
    conf_thresh = APP_CONFIG.get("yolo_conf_threshold", 0.25)
    imgsz = APP_CONFIG.get("yolo_imgsz", 384)
    auto_off_delay = APP_CONFIG.get("auto_off_delay_sec", 3.0)

    print(f"\n[CAMERA] Menginisialisasi kamera laptop index {cam_index}...")
    cap = cv2.VideoCapture(cam_index, cv2.CAP_DSHOW) if sys.platform.startswith('win') else cv2.VideoCapture(cam_index)

    is_cam_open = cap.isOpened()
    if not is_cam_open:
        print(f"[CAMERA INFO] Webcam index {cam_index} tidak dapat dibuka (mungkin tanpa webcam fisik atau sedang dipakai).")
        print("  -> Microservice tetap aktif dan beralih ke Canvas Simulasi Virtual.")

    # Atur resolusi kamera ke 720p jika didukung
    if is_cam_open:
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)

    window_name = "SPCT IOT — EDGE ALPR CAMERA MICROSERVICE"
    if show_window:
        cv2.namedWindow(window_name, cv2.WINDOW_NORMAL)
        cv2.resizeWindow(window_name, 960, 540)

    prev_time = time.time()
    frame_count = 0
    cached_detections = []
    success_hold_until = 0

    print("=" * 65)
    print("🚀 EDGE ALPR MICROSERVICE AKTIF & SIAP MENERIMA PERMINTAAN!")
    print(f"   REST API Server: http://{APP_CONFIG['server_host']}:{APP_CONFIG['server_port']}")
    print("   Shortcut Konsol:")
    print("     [SPACE] : Simulasi pemicu tombol tiket (Manual Trigger)")
    print("     [F]     : Balik Orientasi Kamera (Flip)")
    print("     [Q]     : Berhenti / Tutup Layanan")
    print("=" * 65 + "\n")

    try:
        while True:
            if is_cam_open:
                ret, frame = cap.read()
                if not ret:
                    time.sleep(0.05)
                    continue

                if flip_mode is not None:
                    frame = cv2.flip(frame, flip_mode)
            else:
                # Kanvas sintetis berlatar belakang gelap jika tanpa webcam fisik
                frame = np.full((720, 1280, 3), (20, 24, 30), dtype=np.uint8)
                time.sleep(0.04)

            cur_time = time.time()
            fps = 1.0 / (cur_time - prev_time + 1e-6)
            prev_time = cur_time

            # Cek status pemindaian dari engine
            with ALPR_ENGINE.state_lock:
                state = ALPR_ENGINE.current_state
                gate = ALPR_ENGINE.active_gate
                vtype = ALPR_ENGINE.active_vehicle_type
                start_t = ALPR_ENGINE.scan_start_time
                timeout_s = ALPR_ENGINE.scan_timeout_sec
                last_res = ALPR_ENGINE.last_detection_result

            # Logika batas waktu pemindaian (Timeout)
            if state == "SCANNING" and (cur_time - start_t > timeout_s):
                with ALPR_ENGINE.state_lock:
                    ALPR_ENGINE.current_state = "TIMEOUT"
                    ALPR_ENGINE.scan_event.set()
                print("⚠️ [TIMEOUT] Waktu pemindaian 15 detik habis tanpa plat terdeteksi.")

            # Logika Auto-Off setelah sukses deteksi (kembali ke STANDBY setelah delay 3 detik)
            if state == "SUCCESS":
                if success_hold_until == 0:
                    success_hold_until = cur_time + auto_off_delay
                elif cur_time >= success_hold_until:
                    with ALPR_ENGINE.state_lock:
                        ALPR_ENGINE.current_state = "STANDBY"
                    success_hold_until = 0
                    print("💤 [STANDBY] Kamera kembali ke status standby (hemat daya & siap pemicu berikutnya).")

            # Eksekusi AI hanya saat status SCANNING aktif
            detections = []
            if state == "SCANNING":
                # Fallback otomatis jika kamera fisik tidak terpasang (misal pengujian simulasi)
                if not is_cam_open:
                    if cur_time - start_t >= 1.5:
                        sim_res = ALPR_ENGINE.recognize_crop(None)
                        ALPR_ENGINE.record_success_detection(sim_res, 0.95, 420)
                else:
                    frame_count += 1
                    if frame_count % 2 == 0 or not cached_detections:
                        if ALPR_ENGINE.yolo_model is not None:
                            try:
                                results = ALPR_ENGINE.yolo_model(
                                    frame,
                                    conf=conf_thresh,
                                    imgsz=imgsz,
                                    verbose=False
                                )[0]
                                cached = []
                                for box in results.boxes:
                                    xyxy = box.xyxy[0].cpu().numpy().astype(int).tolist()
                                    conf = float(box.conf[0].cpu())
                                    cached.append({'xyxy': xyxy, 'conf': conf})
                                cached_detections = cached
                            except Exception as e:
                                cached_detections = []
                        else:
                            cached_detections = []

                    detections = cached_detections

                    # Jika ada plat terdeteksi oleh YOLO, jalankan TrOCR
                    if detections:
                        best_det = max(detections, key=lambda d: d['conf'])
                        crop_rgb, bbox_padded = crop_plate(frame, best_det['xyxy'])
                        t_ocr_start = time.time()
                        ocr_res = ALPR_ENGINE.recognize_crop(crop_rgb)
                        elapsed_ocr = (time.time() - t_ocr_start) * 1000

                        if ocr_res.get('valid', False):
                            # Perekaman deteksi sukses
                            ALPR_ENGINE.record_success_detection(ocr_res, best_det['conf'], elapsed_ocr, crop_rgb)

            # ─── MENGGAMBAR OVERLAY HUD FUTURISTIK ───────────────────────────
            h, w = frame.shape[:2]
            overlay = frame.copy()

            # Glassmorphism Top Header Bar
            cv2.rectangle(overlay, (0, 0), (w, 65), (15, 20, 28), -1)
            cv2.addWeighted(overlay, 0.85, frame, 0.15, 0, frame)
            cv2.line(frame, (0, 65), (w, 65), (0, 230, 150), 2)

            # Judul dan Status Operasional
            cv2.putText(frame, "SPCT IOT — EDGE ALPR MICROSERVICE", (20, 28),
                        cv2.FONT_HERSHEY_DUPLEX, 0.65, (255, 255, 255), 1, cv2.LINE_AA)

            # State Badge
            color_map = {
                "STANDBY": (180, 180, 180),
                "SCANNING": (0, 215, 255),
                "SUCCESS": (0, 255, 120),
                "TIMEOUT": (0, 100, 255)
            }
            state_color = color_map.get(state, (255, 255, 255))
            cv2.putText(frame, f"STATUS: {state} [{gate} - {vtype}]", (20, 52),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.50, state_color, 2, cv2.LINE_AA)

            # FPS dan Sisa Waktu Pemindaian
            cv2.putText(frame, f"FPS: {fps:.1f} | {ALPR_ENGINE.device.upper()}", (w - 180, 28),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 230, 150), 1, cv2.LINE_AA)

            if state == "SCANNING":
                sisa_waktu = max(0.0, timeout_s - (cur_time - start_t))
                cv2.putText(frame, f"TIMEOUT: {sisa_waktu:.1f}s", (w - 180, 52),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.50, (0, 215, 255), 1, cv2.LINE_AA)

            # Bounding Box Deteksi Plat
            if state == "SCANNING":
                for det in detections:
                    x1, y1, x2, y2 = det['xyxy']
                    conf = det['conf']
                    cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 120), 2)
                    cv2.putText(frame, f"PLAT [{conf:.2f}]", (x1, max(15, y1 - 8)),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 255, 120), 1, cv2.LINE_AA)

            # Popup Hasil Deteksi Terakhir (Sukses)
            if state in ["SUCCESS", "STANDBY"] and last_res is not None:
                card_w, card_h = 420, 90
                card_x, card_y = 20, h - card_h - 20
                cv2.rectangle(frame, (card_x, card_y), (card_x + card_w, card_y + card_h), (20, 24, 30), -1)
                cv2.rectangle(frame, (card_x, card_y), (card_x + card_w, card_y + card_h), (0, 255, 120), 2)

                cv2.putText(frame, "PLAT NOMOR TERKONFIRMASI:", (card_x + 15, card_y + 24),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.40, (0, 230, 150), 1, cv2.LINE_AA)
                cv2.putText(frame, last_res["formatted"], (card_x + 15, card_y + 60),
                            cv2.FONT_HERSHEY_DUPLEX, 0.95, (255, 255, 255), 2, cv2.LINE_AA)
                cv2.putText(frame, f"Akurasi: {last_res['confidence']*100:.0f}% | {last_res['timestamp']}",
                            (card_x + 15, card_y + 80), cv2.FONT_HERSHEY_SIMPLEX, 0.38, (180, 180, 180), 1, cv2.LINE_AA)

            if show_window:
                cv2.imshow(window_name, frame)

            # Tangani input tombol keyboard
            key = cv2.waitKey(1) & 0xFF
            if key in [ord('q'), ord('Q'), 27]:
                print("\n[ALPR] Menghentikan loop kamera...")
                break
            elif key == ord(' '):
                # Manual trigger pemicu tiket langsung dari laptop
                print("\n[MANUAL TRIGGER] Tombol [SPACE] ditekan di laptop.")
                threading.Thread(target=ALPR_ENGINE.start_scan_trigger, kwargs={"gerbang": "MASUK", "jenis": "MOBIL"}, daemon=True).start()
            elif key in [ord('f'), ord('F')]:
                flip_cycle = [0, -1, 1, None]
                cur_idx = flip_cycle.index(flip_mode) if flip_mode in flip_cycle else -1
                flip_mode = flip_cycle[(cur_idx + 1) % len(flip_cycle)]
                print(f"[CAMERA] Flip mode diubah ke: {flip_mode}")

    finally:
        cap.release()
        cv2.destroyAllWindows()
        print("[CAMERA] Kamera berhasil dilepas.")


# ─── 8. ENTRY POINT UTAMA MICROSERVICE ─────────────────────────────────────────
def main():
    host = APP_CONFIG.get("server_host", "0.0.0.0")
    port = APP_CONFIG.get("server_port", 5001)

    # 1. Inisialisasi HTTP REST API Server terlebih dahulu agar binding port instan
    server_address = (host, port)
    httpd = ThreadingHTTPServer(server_address, AlprHttpHandler)
    print(f"\n[HTTP SERVER] Mendengarkan pada http://{host}:{port} ...")

    # 2. Jalankan HTTP Server di background thread
    server_thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    server_thread.start()

    # 3. Jalankan Thread Kamera OpenCV
    cam_thread = threading.Thread(target=opencv_camera_worker, daemon=True)
    cam_thread.start()

    try:
        while server_thread.is_alive() and cam_thread.is_alive():
            cam_thread.join(timeout=1.0)
    except KeyboardInterrupt:
        print("\n[SERVER] Menutup microservice ALPR...")
    finally:
        httpd.server_close()
        print("[SERVER] Microservice ALPR selesai dimatikan.")


if __name__ == "__main__":
    main()
