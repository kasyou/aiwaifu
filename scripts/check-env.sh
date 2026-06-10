#!/usr/bin/env bash
# ============================================================
#  AiWaifu Environment Check (macOS / Linux)
#  Usage: bash scripts/check-env.sh
# ============================================================
echo "============================================================"
echo "  AiWaifu Android Environment Check"
echo "============================================================"
echo ""

# --- Node.js ---
if command -v node &>/dev/null; then
    echo "[OK] Node.js $(node -v)"
else
    echo "[MISSING] Node.js"
    echo "   Install: https://nodejs.org (LTS)  or  brew install node / nvm install --lts"
fi

# --- npm ---
if command -v npm &>/dev/null; then
    echo "[OK] npm $(npm -v)"
else
    echo "[MISSING] npm"
fi

# --- Java ---
if command -v java &>/dev/null; then
    JAVA_VER=$(java -version 2>&1 | head -1)
    echo "[OK] Java $JAVA_VER"
else
    echo "[MISSING] Java JDK"
    echo "   macOS:  brew install openjdk@17"
    echo "   Ubuntu: sudo apt install openjdk-17-jdk"
fi

# --- JAVA_HOME ---
if [ -n "${JAVA_HOME:-}" ]; then
    echo "[OK] JAVA_HOME = $JAVA_HOME"
else
    echo "[MISSING] JAVA_HOME"
    echo "   macOS (Homebrew OpenJDK 17):"
    echo "     export JAVA_HOME=\"/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home\""
    echo "   macOS (Intel Homebrew):"
    echo "     export JAVA_HOME=\"/usr/local/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home\""
    echo "   Linux:"
    echo "     export JAVA_HOME=\"/usr/lib/jvm/java-17-openjdk-amd64\""
    echo "   Add the export line to ~/.bashrc or ~/.zshrc for permanent setting"
fi

# --- ANDROID_HOME ---
if [ -n "${ANDROID_HOME:-}" ]; then
    echo "[OK] ANDROID_HOME = $ANDROID_HOME"
else
    echo "[INFO] ANDROID_HOME not set (Gradle auto-detects if Android Studio SDK is installed)"
    echo "   Typical paths:"
    echo "     macOS:   ~/Library/Android/sdk"
    echo "     Linux:   ~/Android/Sdk"
    echo "   export ANDROID_HOME=\"\$HOME/Library/Android/sdk\""
fi

echo ""
echo "============================================================"
echo "  Next steps:"
echo "    1. Fix any [MISSING] items above"
echo "    2. Run: bash scripts/build-apk.sh"
echo "    3. Or open Android Studio: bash scripts/open-android.sh"
echo "============================================================"
