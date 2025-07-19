# Archive.org Player

A Progressive Web App (PWA) for playing Archive.org video playlists with offline support and playback tracking.

## Features

- 📺 Play video playlists from Archive.org
- 📱 Install as a PWA on any device
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

## Installation as PWA

1. Open the app in your browser
2. Click the install button in the address bar or use your browser's menu to "Install app" or "Add to Home screen"
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

## License

MIT