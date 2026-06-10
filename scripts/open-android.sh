#!/usr/bin/env bash
# ============================================================
#  Open project in Android Studio for manual adjustments
#  Usage: bash scripts/open-android.sh
# ============================================================
cd "$(dirname "$0")/.."
npx cap open android
