@echo off
TITLE SPCT IoT - Edge ALPR Camera Microservice (Miniconda Active)
color 0A
echo =====================================================================
echo  SPCT IOT - EDGE ALPR CAMERA MICROSERVICE (PORT 5001)
echo  Pipeline Deteksi Plat Nomor: YOLOv11s + TrOCR + Regex TNKB
echo =====================================================================
echo.
cd /d "%~dp0"

:: =====================================================================
:: KONFIGURASI NAMA ENVIRONMENT CONDA
:: (Ubah nama di bawah jika library Anda ada di env khusus, default: base)
:: =====================================================================
set CONDA_ENV_NAME=base

:: Jika saat menjalankan .bat disertakan parameter nama env, gunakan parameter tsb
if not "%~1"=="" set CONDA_ENV_NAME=%~1

echo [INFO] Mendeteksi instalasi Miniconda / Anaconda di Laptop...

:: 1. Cek apakah perintah conda sudah terdaftar di PATH sistem
where conda >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [INFO] Conda terdeteksi di PATH sistem.
    echo [INFO] Mengaktifkan environment '%CONDA_ENV_NAME%'...
    call conda activate %CONDA_ENV_NAME%
    goto :JALANKAN
)

:: 2. Cek lokasi instalasi standar Miniconda di profil pengguna
if exist "%USERPROFILE%\miniconda3\Scripts\activate.bat" (
    echo [INFO] Miniconda ditemukan di: %USERPROFILE%\miniconda3
    echo [INFO] Mengaktifkan environment '%CONDA_ENV_NAME%'...
    call "%USERPROFILE%\miniconda3\Scripts\activate.bat" %CONDA_ENV_NAME%
    goto :JALANKAN
)

if exist "%USERPROFILE%\anaconda3\Scripts\activate.bat" (
    echo [INFO] Anaconda ditemukan di: %USERPROFILE%\anaconda3
    echo [INFO] Mengaktifkan environment '%CONDA_ENV_NAME%'...
    call "%USERPROFILE%\anaconda3\Scripts\activate.bat" %CONDA_ENV_NAME%
    goto :JALANKAN
)

:: 3. Cek lokasi instalasi ProgramData / LocalAppData
if exist "C:\ProgramData\miniconda3\Scripts\activate.bat" (
    echo [INFO] Miniconda ditemukan di: C:\ProgramData\miniconda3
    echo [INFO] Mengaktifkan environment '%CONDA_ENV_NAME%'...
    call "C:\ProgramData\miniconda3\Scripts\activate.bat" %CONDA_ENV_NAME%
    goto :JALANKAN
)

if exist "%LOCALAPPDATA%\miniconda3\Scripts\activate.bat" (
    echo [INFO] Miniconda ditemukan di: %LOCALAPPDATA%\miniconda3
    echo [INFO] Mengaktifkan environment '%CONDA_ENV_NAME%'...
    call "%LOCALAPPDATA%\miniconda3\Scripts\activate.bat" %CONDA_ENV_NAME%
    goto :JALANKAN
)

if exist "C:\miniconda3\Scripts\activate.bat" (
    echo [INFO] Miniconda ditemukan di: C:\miniconda3
    echo [INFO] Mengaktifkan environment '%CONDA_ENV_NAME%'...
    call "C:\miniconda3\Scripts\activate.bat" %CONDA_ENV_NAME%
    goto :JALANKAN
)

echo [PERINGATAN] Folder instalasi otomatis Miniconda tidak ditemukan.
echo              Menggunakan perintah Python default sistem...

:JALANKAN
echo.
echo =====================================================================
echo [INFO] Menggunakan Python:
python --version
echo =====================================================================
echo.
echo [INFO] Menjalankan server Edge ALPR Microservice...
python alpr_microservice.py

pause
