<#
.SYNOPSIS
  AiWaifu APK Build Script (PowerShell)
  Usage: .\build-apk.ps1
  If blocked: powershell -ExecutionPolicy Bypass -File build-apk.ps1
#>
$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectRoot

Write-Host "[1/3] Building web project..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) { throw "Web build failed" }
Write-Host "[OK] Web build done" -ForegroundColor Green

Write-Host "[2/3] Syncing Capacitor to Android..." -ForegroundColor Cyan
npx cap sync android
if ($LASTEXITCODE -ne 0) { throw "Capacitor sync failed" }
Write-Host "[OK] Sync done" -ForegroundColor Green

Write-Host "[3/3] Building APK with Gradle..." -ForegroundColor Cyan

# Override JAVA_HOME — Gradle 8.x requires JDK 17+
$oldJavaHome = $env:JAVA_HOME
$env:JAVA_HOME = if (Test-Path "C:\Program Files\Java\jdk-21") {
    "C:\Program Files\Java\jdk-21"
} elseif (Test-Path "C:\Program Files\Java\jdk-17") {
    "C:\Program Files\Java\jdk-17"
} else {
    $env:JAVA_HOME
}

# Ensure ANDROID_HOME is set
if (-not $env:ANDROID_HOME) {
    $sdkPaths = @(
        "D:\Environment\Android\Sdk",
        "$env:LOCALAPPDATA\Android\Sdk"
    )
    foreach ($p in $sdkPaths) {
        if (Test-Path $p) {
            $env:ANDROID_HOME = $p
            break
        }
    }
}

Write-Host "  JAVA_HOME   = $env:JAVA_HOME" -ForegroundColor Gray
Write-Host "  ANDROID_HOME = $env:ANDROID_HOME" -ForegroundColor Gray

Push-Location android
try {
    .\gradlew.bat assembleDebug
    if ($LASTEXITCODE -ne 0) { throw "Gradle build failed" }
} finally {
    $env:JAVA_HOME = $oldJavaHome
    Pop-Location
}
Write-Host "[OK] APK built" -ForegroundColor Green

Write-Host ""
Write-Host "============================================================" -ForegroundColor Yellow
Write-Host "  APK saved to: android\app\build\outputs\apk\debug\" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Yellow
Get-ChildItem android\app\build\outputs\apk\debug\*.apk -ErrorAction SilentlyContinue | ForEach-Object {
    Write-Host "  $($_.Name)  ($('{0:N1} MB' -f ($_.Length / 1MB)))" -ForegroundColor White
}
