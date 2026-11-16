@echo off
TITLE SPCT IoT - Edge ALPR Camera Microservice
color 0A
echo =====================================================================
echo  SPCT IOT - EDGE ALPR CAMERA MICROSERVICE (PORT 5001)
echo  Pipeline Deteksi Plat Nomor: YOLOv11s + TrOCR + Regex TNKB
echo =====================================================================
echo.
cd /d "%~dp0"

echo [INFO] Menjalankan server Edge ALPR Microservice...
python alpr_microservice.py

pause
