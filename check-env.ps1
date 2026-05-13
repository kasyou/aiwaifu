<#
.SYNOPSIS
  AiWaifu Environment Check (PowerShell)
  Usage: .\check-env.ps1
#>
Write-Host "============================================================" -ForegroundColor Yellow
Write-Host "  AiWaifu Android Environment Check (PowerShell)" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Yellow
Write-Host ""

# --- Node.js ---
$node = Get-Command node -ErrorAction SilentlyContinue
if ($node) {
    Write-Host "[OK] Node.js $(node -v)" -ForegroundColor Green
} else {
    Write-Host "[MISSING] Node.js — https://nodejs.org" -ForegroundColor Red
}

# --- npm ---
$npm = Get-Command npm -ErrorAction SilentlyContinue
if ($npm) {
    Write-Host "[OK] npm $(npm -v)" -ForegroundColor Green
} else {
    Write-Host "[MISSING] npm" -ForegroundColor Red
}

# --- Java ---
$java = Get-Command java -ErrorAction SilentlyContinue
if ($java) {
    $ver = (java -version 2>&1 | Select-Object -First 1)
    Write-Host "[OK] Java: $ver" -ForegroundColor Green
} else {
    Write-Host "[MISSING] Java JDK 17+" -ForegroundColor Red
    Write-Host "  Download: https://adoptium.net/" -ForegroundColor Gray
}

# --- JAVA_HOME ---
if ($env:JAVA_HOME) {
    Write-Host "[OK] JAVA_HOME = $env:JAVA_HOME" -ForegroundColor Green
} else {
    Write-Host "[MISSING] JAVA_HOME" -ForegroundColor Red
    Write-Host "  Temp fix: `$env:JAVA_HOME='C:\Program Files\Eclipse Adoptium\jdk-17.0.12.7-hotspot\'" -ForegroundColor Gray
}

# --- ANDROID_HOME ---
if ($env:ANDROID_HOME) {
    Write-Host "[OK] ANDROID_HOME = $env:ANDROID_HOME" -ForegroundColor Green
} else {
    Write-Host "[INFO] ANDROID_HOME not set" -ForegroundColor Yellow
    $typical = "$env:LOCALAPPDATA\Android\Sdk"
    Write-Host "  Typical path: $typical" -ForegroundColor Gray
    Write-Host "  Temp fix: `$env:ANDROID_HOME='$typical'" -ForegroundColor Gray
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Yellow
Write-Host "  Next: .\build-apk.ps1" -ForegroundColor White
Write-Host "  (if blocked: powershell -ExecutionPolicy Bypass -File build-apk.ps1)" -ForegroundColor Gray
Write-Host "============================================================" -ForegroundColor Yellow
