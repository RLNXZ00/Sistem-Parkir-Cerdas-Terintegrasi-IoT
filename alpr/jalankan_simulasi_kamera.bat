@echo off
title Simulasi ALPR Indonesia - Kamera Laptop (Miniconda Active)
color 0A
cls
echo ======================================================================
echo           SIMULASI ALPR INDONESIA -- WEBCAM / KAMERA LAPTOP
echo ======================================================================
echo.
cd /d "%~dp0"

set CONDA_ENV_NAME=base
if not "%~1"=="" set CONDA_ENV_NAME=%~1

where conda >nul 2>nul
if %ERRORLEVEL% equ 0 (
    call conda activate %CONDA_ENV_NAME%
    goto :JALANKAN
)
if exist "%USERPROFILE%\miniconda3\Scripts\activate.bat" (
    call "%USERPROFILE%\miniconda3\Scripts\activate.bat" %CONDA_ENV_NAME%
    goto :JALANKAN
)
if exist "%USERPROFILE%\anaconda3\Scripts\activate.bat" (
    call "%USERPROFILE%\anaconda3\Scripts\activate.bat" %CONDA_ENV_NAME%
    goto :JALANKAN
)
if exist "C:\ProgramData\miniconda3\Scripts\activate.bat" (
    call "C:\ProgramData\miniconda3\Scripts\activate.bat" %CONDA_ENV_NAME%
    goto :JALANKAN
)
if exist "%LOCALAPPDATA%\miniconda3\Scripts\activate.bat" (
    call "%LOCALAPPDATA%\miniconda3\Scripts\activate.bat" %CONDA_ENV_NAME%
    goto :JALANKAN
)

:JALANKAN
echo [INFO] Menjalankan simulasi kamera dengan Python:
python --version
echo.

python simulasi_kamera_laptop.py

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ======================================================================
    echo Jika ada error library, silakan jalankan instalasi library dengan:
    echo pip install ultralytics transformers torch torchvision --index-url https://download.pytorch.org/whl/cpu
    echo ======================================================================
    echo.
    pause
)
