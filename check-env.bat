@echo off
REM ============================================================
REM  AiWaifu Environment Check (Windows)
REM  Usage: .\check-env.bat
REM ============================================================
echo ============================================================
echo   AiWaifu Android Environment Check
echo ============================================================
echo.

REM --- Node.js ---
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [MISSING] Node.js
    echo    Install: https://nodejs.org (LTS recommended)
) else (
    for /f "tokens=*" %%i in ('node -v') do echo [OK] Node.js %%i
)

REM --- npm ---
where npm >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [MISSING] npm
) else (
    for /f "tokens=*" %%i in ('npm -v') do echo [OK] npm %%i
)

REM --- Java ---
where java >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [MISSING] Java JDK
    echo    Download JDK 17: https://adoptium.net / https://www.oracle.com/java/technologies/downloads/
) else (
    for /f "tokens=*" %%i in ('java -version 2^>^&1 ^| findstr /i "version"') do echo [OK] Java %%i
)

REM --- JAVA_HOME ---
if defined JAVA_HOME (
    echo [OK] JAVA_HOME = %JAVA_HOME%
) else (
    echo [MISSING] JAVA_HOME environment variable
    echo    Temporary fix (CMD):
    echo      set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.12.7-hotspot\
    echo    Temporary fix (PowerShell):
    echo      $env:JAVA_HOME="C:\Program Files\Eclipse Adoptium\jdk-17.0.12.7-hotspot\"
    echo    Permanent fix: System Properties ^> Environment Variables ^> New System Variable
)

REM --- ANDROID_HOME ---
if defined ANDROID_HOME (
    echo [OK] ANDROID_HOME = %ANDROID_HOME%
) else (
    echo [INFO] ANDROID_HOME not set (optional, Gradle auto-detects Android SDK)
    echo    Typical paths:
    echo      %LOCALAPPDATA%\Android\Sdk
    echo      C:\Users\%USERNAME%\AppData\Local\Android\Sdk
    echo    Temporary fix (CMD):
    echo      set ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk
    echo    Temporary fix (PowerShell):
    echo      $env:ANDROID_HOME="$env:LOCALAPPDATA\Android\Sdk"
)

echo.
echo ============================================================
echo   Next steps:
echo     1. Fix any [MISSING] items above
echo     2. Run: .\build-apk.bat
echo     3. Or open Android Studio: .\open-android.bat
echo ============================================================
