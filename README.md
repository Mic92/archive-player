# Archive.org Player

A Progressive Web App (PWA) for playing Archive.org video playlists with offline support and playback tracking.

## Features

- 📺 Play video playlists from Archive.org
- 📱 Install as a PWA on Android devices
- 💾 Download videos for offline viewing
- 📊 Track playback progress
- 🔍 Search within playlists
- 📜 Remember recently viewed playlists
- 🌙 Dark theme UI

## Live Demo

Visit the app at: https://[your-username].github.io/archive-org-player/

## Usage

1. Enter an Archive.org URL or identifier (e.g., `its_always_sunny_complete_archive`)
2. Browse the playlist and click on any video to play
3. Your playback position is automatically saved
4. Download videos for offline viewing using the download button

## Installation on Android

1. Open the app in Chrome on Android
2. Tap the menu (three dots) and select "Add to Home screen"
3. The app will work offline for previously cached content

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

The app is automatically deployed to GitHub Pages when you push to the main branch.

## Technology Stack

- React + TypeScript
- Vite + PWA Plugin
- LocalForage for offline storage
- Archive.org API

## Android TV Version

This app includes full Android TV support with remote control navigation.

### Building for Android TV

```bash
# Ensure you have Android Studio or Android SDK installed
# Build the TV APK
./build-tv.sh
```

### Installing on Android TV

1. Enable Developer Mode on your Android TV (Settings > About > Build - click 7 times)
2. Enable "Install from Unknown Sources" in security settings
3. Transfer `archive-player-tv.apk` to your TV via USB or network
4. Install using a file manager app

Or use ADB:
```bash
adb connect YOUR_TV_IP:5555
adb install archive-player-tv.apk
```

### TV Remote Controls

- **Arrow Keys**: Navigate between items
- **Enter/OK**: Select item or play/pause video
- **Back**: Go back or exit fullscreen
- **Play/Pause**: Toggle video playback
- **Fast Forward**: Skip ahead 10 seconds
- **Rewind**: Skip back 10 seconds

## License

MIT