#!/usr/bin/env bash
# ============================================================
#  AiWaifu APK Build Script (macOS / Linux)
#  Usage: chmod +x build-apk.sh && ./build-apk.sh
# ============================================================
set -euo pipefail

echo "[1/3] Building web project..."
npm run build
echo "[OK] Web build done"

echo "[2/3] Syncing Capacitor to Android..."
npx cap sync android
echo "[OK] Sync done"

echo "[3/3] Building APK with Gradle..."
# Override JAVA_HOME — Gradle 8.x requires JDK 17+
if [ -d "C:/Program Files/Java/jdk-21" ]; then
    export JAVA_HOME="C:/Program Files/Java/jdk-21"
elif [ -d "/usr/lib/jvm/java-17-openjdk-amd64" ]; then
    export JAVA_HOME="/usr/lib/jvm/java-17-openjdk-amd64"
elif [ -d "/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home" ]; then
    export JAVA_HOME="/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home"
fi
echo "  JAVA_HOME = $JAVA_HOME"
cd android
./gradlew assembleDebug
cd ..
echo "[OK] APK built"

echo ""
echo "============================================================"
echo "  APK saved to: android/app/build/outputs/apk/debug/"
echo "============================================================"
ls -la android/app/build/outputs/apk/debug/*.apk 2>/dev/null || echo "(run build to generate)"
