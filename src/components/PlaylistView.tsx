import { useState, useEffect } from 'react';
import type { ArchiveFile, PlaybackHistory } from '../types/archive';
import { storage } from '../services/storage';
import './PlaylistView.css';

interface PlaylistViewProps {
  files: ArchiveFile[];
  identifier: string;
  onSelectFile: (file: ArchiveFile, index: number) => void;
  currentIndex?: number;
}

export function PlaylistView({ files, identifier, onSelectFile, currentIndex }: PlaylistViewProps) {
  const [playbackHistory, setPlaybackHistory] = useState<Map<string, PlaybackHistory>>(new Map());
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadPlaybackHistory();
    // Focus first playlist item when component mounts
    setTimeout(() => {
      const firstItem = document.querySelector('.playlist-item');
      if (firstItem) {
        (firstItem as HTMLElement).focus();
      }
    }, 100);
  }, [identifier]);

  const loadPlaybackHistory = async () => {
    const history = await storage.getAllPlaybackHistory();
    const historyMap = new Map<string, PlaybackHistory>();
    history
      .filter(h => h.identifier === identifier)
      .forEach(h => historyMap.set(h.fileName, h));
    setPlaybackHistory(historyMap);
  };

  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDuration = (seconds: string | undefined) => {
    if (!seconds) return '';
    const sec = parseInt(seconds);
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = (fileName: string): number => {
    const history = playbackHistory.get(fileName);
    if (!history || !history.duration) return 0;
    return (history.position / history.duration) * 100;
  };

  const isWatched = (fileName: string): boolean => {
    const history = playbackHistory.get(fileName);
    return history?.completed || false;
  };

  return (
    <div className="playlist-view">
      <div className="playlist-header">
        <input
          type="text"
          placeholder="Search episodes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
          tabIndex={-1}
        />
      </div>
      
      <div className="playlist-items">
        {filteredFiles.map((file) => {
          const progress = getProgress(file.name);
          const watched = isWatched(file.name);
          const isCurrent = currentIndex === files.indexOf(file);
          
          return (
            <div
              key={file.name}
              className={`playlist-item ${isCurrent ? 'current' : ''} ${watched ? 'watched' : ''}`}
              onClick={() => onSelectFile(file, files.indexOf(file))}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectFile(file, files.indexOf(file));
                }
              }}
            >
              <div className="item-info">
                <div className="item-name">{file.name}</div>
                <div className="item-details">
                  {file.format} • {formatDuration(file.length)}
                  {file.size && ` • ${(parseInt(file.size) / 1024 / 1024).toFixed(1)} MB`}
                </div>
              </div>
              
              {progress > 0 && !watched && (
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progress}%` }} />
                </div>
              )}
              
              {watched && (
                <span className="watched-indicator">✓</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}