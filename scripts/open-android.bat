@echo off
REM ============================================================
REM  Open project in Android Studio for manual adjustments
REM  Usage: .\scripts\open-android.bat
REM ============================================================
cd /d "%~dp0.."
call npx cap open android
