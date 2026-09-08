@echo off
chcp 65001 >nul
title Fiyat Listesi - Site Sunucusu
cd /d "%~dp0"

echo ============================================
echo    FIYAT LISTESI - SITE BASLATILIYOR
echo ============================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [HATA] Node.js kurulu degil.
  echo Once https://nodejs.org adresinden "LTS" surumu kurun, sonra bu dosyayi tekrar cift tiklayin.
  echo.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo [1/3] Gerekli paketler kuruluyor... Bu islem ilk seferde 1-2 dakika surer.
  call npm install
  if errorlevel 1 goto hata
  echo.
)

echo [2/3] Site derleniyor...
call npm run build
if errorlevel 1 goto hata
echo.

echo [3/3] Sunucu baslatiliyor: http://localhost:3000
echo.
echo Bu pencereyi KAPATMAYIN. Kapatirsaniz site kapanir.
echo Yonetim paneli: http://localhost:3000/admin
echo.
start "" http://localhost:3000
call npm run start
goto son

:hata
echo.
echo [HATA] Islem tamamlanamadi. Yukaridaki mesaji kontrol edin.
echo.
pause
exit /b 1

:son
pause
