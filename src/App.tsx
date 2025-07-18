import { useState, useEffect } from 'react';
import { useArchive } from './hooks/useArchive';
import { useTVNavigation } from './hooks/useTVNavigation';
import { VideoPlayer } from './components/VideoPlayer';
import { PlaylistView } from './components/PlaylistView';
import { storage } from './services/storage';
import type { ArchiveFile, Playlist } from './types/archive';
import './App.css';
import './tv.css';

function App() {
  const [identifier, setIdentifier] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [currentFile, setCurrentFile] = useState<ArchiveFile | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recentPlaylists, setRecentPlaylists] = useState<Playlist[]>([]);
  const [showPlaylist, setShowPlaylist] = useState(true);
  
  const { metadata, loading, error } = useArchive(identifier);
  
  // Custom back handler
  const handleBack = () => {
    console.log('Back button pressed', { currentFile, showPlaylist, identifier });
    
    if (currentFile && !showPlaylist) {
      // If watching video, go back to playlist
      console.log('Going back to playlist');
      setShowPlaylist(true);
      setCurrentFile(null);
      return true;
    } else if (identifier) {
      // If in playlist, go back to home
      console.log('Going back to home');
      setIdentifier('');
      setCurrentFile(null);
      return true;
    }
    console.log('Nothing to go back to');
    return false;
  };
  
  useTVNavigation(handleBack);

  useEffect(() => {
    loadRecentPlaylists();
    registerServiceWorker();
  }, []);

  const registerServiceWorker = async () => {
    // PWA service worker is automatically registered by vite-plugin-pwa
  };

  const loadRecentPlaylists = async () => {
    const playlists = await storage.getAllPlaylists();
    setRecentPlaylists(playlists.slice(0, 5));
    // Auto-focus first playlist card on TV
    setTimeout(() => {
      const firstCard = document.querySelector('.playlist-card');
      if (firstCard) (firstCard as HTMLElement).focus();
    }, 100);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const match = inputValue.match(/archive\.org\/details\/([^\/]+)/);
    if (match) {
      setIdentifier(match[1]);
    } else if (inputValue && !inputValue.includes('/')) {
      setIdentifier(inputValue);
    }
  };

  const selectFile = (file: ArchiveFile, index: number) => {
    setCurrentFile(file);
    setCurrentIndex(index);
    setShowPlaylist(false);
    // Focus video after selection
    setTimeout(() => {
      const video = document.querySelector('video');
      if (video) (video as HTMLElement).focus();
    }, 100);
  };

  const playNext = () => {
    if (!metadata?.files || currentIndex >= metadata.files.length - 1) return;
    const nextIndex = currentIndex + 1;
    setCurrentFile(metadata.files[nextIndex]);
    setCurrentIndex(nextIndex);
  };

  const playPrevious = () => {
    if (!metadata?.files || currentIndex <= 0) return;
    const prevIndex = currentIndex - 1;
    setCurrentFile(metadata.files[prevIndex]);
    setCurrentIndex(prevIndex);
  };
  
  const [isPlaying, setIsPlaying] = useState(false);
  
  const togglePlayPause = () => {
    const videoElement = document.querySelector('.video-js video') as HTMLVideoElement;
    if (!videoElement) return;
    
    if (videoElement.paused) {
      videoElement.play();
      setIsPlaying(true);
    } else {
      videoElement.pause();
      setIsPlaying(false);
    }
  };
  
  // Listen for video play/pause events
  useEffect(() => {
    const checkVideoState = () => {
      const videoElement = document.querySelector('.video-js video') as HTMLVideoElement;
      if (!videoElement) return;
      
      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);
      const handleEnded = () => setIsPlaying(false);
      
      videoElement.addEventListener('play', handlePlay);
      videoElement.addEventListener('pause', handlePause);
      videoElement.addEventListener('ended', handleEnded);
      
      // Set initial state
      setIsPlaying(!videoElement.paused);
      
      return () => {
        videoElement.removeEventListener('play', handlePlay);
        videoElement.removeEventListener('pause', handlePause);
        videoElement.removeEventListener('ended', handleEnded);
      };
    };
    
    // Wait for video element to be created
    if (currentFile) {
      const timeout = setTimeout(checkVideoState, 500);
      return () => clearTimeout(timeout);
    }
  }, [currentFile]);


  const videoFiles = metadata?.files.filter(f => 
    f.format && (
      f.format.toLowerCase().includes('mp4') ||
      f.format.toLowerCase().includes('mkv') ||
      f.format.toLowerCase().includes('avi') ||
      f.format.toLowerCase().includes('webm') ||
      f.format.toLowerCase().includes('h.264')
    )
  ) || [];

  return (
    <div className="app">
      <header className="app-header">
        <h1>Archive.org Player</h1>
        <form onSubmit={handleSubmit} className="url-form">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter Archive.org URL or identifier"
            className="url-input"
          />
          <button type="submit" disabled={!inputValue}>
            Load Playlist
          </button>
        </form>
      </header>

      {!identifier && recentPlaylists.length > 0 && (
        <div className="recent-playlists">
          <h2>Recent Playlists</h2>
          <div className="playlist-grid">
            {recentPlaylists.map(playlist => (
              <div
                key={playlist.identifier}
                className="playlist-card"
                onClick={() => setIdentifier(playlist.identifier)}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setIdentifier(playlist.identifier);
                  }
                }}
              >
                <h3>{playlist.title || playlist.identifier}</h3>
                <p>{playlist.files.length} videos</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading && <div className="loading">Loading playlist...</div>}
      {error && <div className="error">Error: {error}</div>}

      {metadata && (
        <div className="content">
          <div className="playlist-info">
            <h2>{metadata.title}</h2>
            {metadata.description && (
              <p className="description">{metadata.description}</p>
            )}
            <div className="playback-controls">
              <button
                className="toggle-playlist"
                onClick={() => setShowPlaylist(!showPlaylist)}
                tabIndex={0}
              >
                {showPlaylist ? 'Hide' : 'Show'} Playlist
              </button>
              {currentFile && (
                <>
                  <button 
                    onClick={playPrevious} 
                    disabled={currentIndex <= 0}
                    tabIndex={0}
                  >
                    Previous
                  </button>
                  <button 
                    onClick={togglePlayPause}
                    tabIndex={0}
                  >
                    {isPlaying ? 'Pause' : 'Play'}
                  </button>
                  <button 
                    onClick={playNext} 
                    disabled={currentIndex >= videoFiles.length - 1}
                    tabIndex={0}
                  >
                    Next
                  </button>
                  <span className="track-info">
                    Track {currentIndex + 1} of {videoFiles.length}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="main-content">
            <div className="video-container" style={{ display: currentFile && !showPlaylist ? 'flex' : 'none' }}>
              {currentFile && (
                <VideoPlayer
                  identifier={identifier}
                  file={currentFile}
                  onNext={currentIndex < videoFiles.length - 1 ? playNext : undefined}
                  onPrevious={currentIndex > 0 ? playPrevious : undefined}
                />
              )}
            </div>

            <div 
              className="playlist-container" 
              style={{ display: showPlaylist || !currentFile ? 'block' : 'none' }}
              tabIndex={showPlaylist || !currentFile ? 0 : -1}
            >
              <PlaylistView
                files={videoFiles}
                identifier={identifier}
                onSelectFile={selectFile}
                currentIndex={currentIndex}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;