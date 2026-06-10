<#
.SYNOPSIS
  Open project in Android Studio (PowerShell)
  Usage: .\scripts\open-android.ps1
#>
$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectRoot
npx cap open android
