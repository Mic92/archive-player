#!/usr/bin/env bash

set -eux

echo "Building Archive Player for Android TV..."

# Build the web app
echo "Building web assets..."
npm run build

# Sync with Capacitor
echo "Syncing with Capacitor..."
npx cap sync android

# Build the Android APK
echo "Building Android APK..."
cd android
./gradlew assembleDebug

# Copy APK to project root
cp app/build/outputs/apk/debug/app-debug.apk ../archive-player-tv.apk
cd ..
adb install archive-player-tv.apk
