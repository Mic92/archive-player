import { useRef, useEffect, useState } from 'react';
import videojs from 'video.js';
import type Player from 'video.js/dist/types/player';
import 'video.js/dist/video-js.css';
import { storage } from '../services/storage';
import { archiveApi } from '../services/archiveApi';
import type { ArchiveFile, OfflineVideo } from '../types/archive';
import './VideoPlayer.css';

interface VideoPlayerProps {
  identifier: string;
  file: ArchiveFile;
  onNext?: () => void;
  onPrevious?: () => void;
  onDownloadStateChange?: (downloading: boolean, progress: number, offline: boolean) => void;
}

export function VideoPlayer({ identifier, file, onNext }: VideoPlayerProps) {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [offlineVideo, setOfflineVideo] = useState<OfflineVideo | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!videoRef.current) return;

    // Initialize Video.js player
    const videoElement = document.createElement('video');
    videoElement.classList.add('video-js', 'vjs-default-skin', 'vjs-big-play-centered', 'vjs-fill');
    videoRef.current.appendChild(videoElement);

    const player = videojs(videoElement, {
      controls: true,
      autoplay: true,
      preload: 'auto',
      fluid: true,
      html5: {
        vhs: {
          overrideNative: true
        }
      }
    });

    playerRef.current = player;

    // Wait for player to be ready
    player.ready(() => {
      setIsReady(true);
    });

    // Clean up
    return () => {
      if (playerRef.current && !playerRef.current.isDisposed()) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!playerRef.current || !isReady) return;
    
    loadVideoSource();
    loadSavedPosition();
  }, [identifier, file.name, isReady]);


  useEffect(() => {
    const player = playerRef.current;
    if (!player || !isReady) return;

    const savePosition = () => {
      if (!player.el_) return;
      storage.savePlaybackPosition(
        identifier,
        file.name,
        player.currentTime() || 0,
        player.duration() || 0
      );
    };

    const handlePlay = () => {
      // Enter fullscreen when video starts playing
      if (!player.el_ || player.isFullscreen()) return;
      player.requestFullscreen();
    };

    const handleEndedEvent = () => {
      savePosition();
      handleEnded();
    };

    player.on('pause', savePosition);
    player.on('ended', handleEndedEvent);
    player.on('play', handlePlay);

    const interval = setInterval(savePosition, 5000);

    return () => {
      clearInterval(interval);
      if (player.el_) {
        player.off('pause', savePosition);
        player.off('ended', handleEndedEvent);
        player.off('play', handlePlay);
        savePosition();
      }
    };
  }, [identifier, file.name, isReady]);

  const loadVideoSource = async () => {
    const offline = await storage.getOfflineVideo(identifier, file.name);
    if (offline) {
      setOfflineVideo(offline);
      setIsOffline(true);
    }
  };

  const loadSavedPosition = async () => {
    const history = await storage.getPlaybackPosition(identifier, file.name);
    if (history && playerRef.current && playerRef.current.el_ && !history.completed) {
      playerRef.current.currentTime(history.position);
    }
  };


  const handleEnded = () => {
    // Mark as completed and auto-play next
    const player = playerRef.current;
    if (!player) return;
    
    storage.savePlaybackPosition(
      identifier,
      file.name,
      player.duration() || 0,
      player.duration() || 0
    ).then(() => {
      if (onNext) {
        onNext();
      }
    });
  };


  const videoUrl = isOffline && offlineVideo 
    ? offlineVideo.blobUrl 
    : archiveApi.getVideoUrl(identifier, file.name);

  useEffect(() => {
    if (playerRef.current && videoUrl) {
      playerRef.current.src({ type: 'video/mp4', src: videoUrl });
    }
  }, [videoUrl]);

  return (
    <div className="video-player">
      <div ref={videoRef} className="video-container" />
    </div>
  );
}