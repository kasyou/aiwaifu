@echo off
REM ============================================================
REM  AiWaifu APK Build Script (Windows)
REM  Usage: .\scripts\build-apk.bat
REM ============================================================
setlocal enabledelayedexpansion
cd /d "%~dp0.."

echo [1/3] Building web project...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Web build failed
    exit /b %ERRORLEVEL%
)
echo [OK] Web build done

echo [2/3] Syncing Capacitor to Android...
call npx cap sync android
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Capacitor sync failed
    exit /b %ERRORLEVEL%
)
echo [OK] Sync done

echo [3/3] Building APK with Gradle...
REM Override JAVA_HOME — Gradle 8.x requires JDK 17+
if exist "C:\Program Files\Java\jdk-21" set JAVA_HOME=C:\Program Files\Java\jdk-21
if exist "C:\Program Files\Java\jdk-17" set JAVA_HOME=C:\Program Files\Java\jdk-17
echo   JAVA_HOME = %JAVA_HOME%
cd android
call gradlew assembleDebug
if %ERRORLEVEL% neq 0 (
    cd ..
    echo [ERROR] Gradle build failed
    exit /b %ERRORLEVEL%
)
cd ..
echo [OK] APK built

echo.
echo ============================================================
echo   APK saved to: android\app\build\outputs\apk\debug\
echo ============================================================
dir /b android\app\build\outputs\apk\debug\*.apk 2>nul
endlocal
