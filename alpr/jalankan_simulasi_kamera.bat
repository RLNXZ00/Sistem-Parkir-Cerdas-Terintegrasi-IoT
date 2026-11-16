@echo off
title Simulasi ALPR Indonesia - Kamera Laptop
color 0A
cls
echo ======================================================================
echo           SIMULASI ALPR INDONESIA -- WEBCAM / KAMERA LAPTOP
echo ======================================================================
echo.
echo Memeriksa dan menjalankan simulasi kamera...
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
