import localforage from 'localforage';
import type { PlaybackHistory, Playlist, OfflineVideo } from '../types/archive';

const playbackStore = localforage.createInstance({
  name: 'archivePlayer',
  storeName: 'playbackHistory'
});

const playlistStore = localforage.createInstance({
  name: 'archivePlayer',
  storeName: 'playlists'
});

const offlineStore = localforage.createInstance({
  name: 'archivePlayer',
  storeName: 'offlineVideos'
});

export class StorageService {
  async savePlaybackPosition(
    identifier: string,
    fileName: string,
    position: number,
    duration: number
  ): Promise<void> {
    const key = `${identifier}:${fileName}`;
    const history: PlaybackHistory = {
      identifier,
      fileName,
      position,
      duration,
      lastPlayed: Date.now(),
      completed: duration > 0 && position / duration > 0.9
    };
    await playbackStore.setItem(key, history);
  }

  async getPlaybackPosition(
    identifier: string,
    fileName: string
  ): Promise<PlaybackHistory | null> {
    const key = `${identifier}:${fileName}`;
    return await playbackStore.getItem<PlaybackHistory>(key);
  }

  async getAllPlaybackHistory(): Promise<PlaybackHistory[]> {
    const history: PlaybackHistory[] = [];
    await playbackStore.iterate<PlaybackHistory, void>((value) => {
      history.push(value);
    });
    return history.sort((a, b) => b.lastPlayed - a.lastPlayed);
  }

  async savePlaylist(playlist: Playlist): Promise<void> {
    playlist.lastAccessed = Date.now();
    await playlistStore.setItem(playlist.identifier, playlist);
  }

  async getPlaylist(identifier: string): Promise<Playlist | null> {
    return await playlistStore.getItem<Playlist>(identifier);
  }

  async getAllPlaylists(): Promise<Playlist[]> {
    const playlists: Playlist[] = [];
    await playlistStore.iterate<Playlist, void>((value) => {
      playlists.push(value);
    });
    return playlists.sort((a, b) => b.lastAccessed - a.lastAccessed);
  }

  async saveOfflineVideo(
    identifier: string,
    fileName: string,
    blob: Blob,
    metadata: any
  ): Promise<void> {
    const blobUrl = URL.createObjectURL(blob);
    const video: OfflineVideo = {
      identifier,
      fileName,
      blobUrl,
      size: blob.size,
      downloadedAt: Date.now(),
      metadata
    };
    const key = `${identifier}:${fileName}`;
    await offlineStore.setItem(key, video);
  }

  async getOfflineVideo(
    identifier: string,
    fileName: string
  ): Promise<OfflineVideo | null> {
    const key = `${identifier}:${fileName}`;
    return await offlineStore.getItem<OfflineVideo>(key);
  }

  async removeOfflineVideo(
    identifier: string,
    fileName: string
  ): Promise<void> {
    const key = `${identifier}:${fileName}`;
    const video = await this.getOfflineVideo(identifier, fileName);
    if (video) {
      URL.revokeObjectURL(video.blobUrl);
    }
    await offlineStore.removeItem(key);
  }

  async getAllOfflineVideos(): Promise<OfflineVideo[]> {
    const videos: OfflineVideo[] = [];
    await offlineStore.iterate<OfflineVideo, void>((value) => {
      videos.push(value);
    });
    return videos;
  }

  async getOfflineStorageUsage(): Promise<number> {
    let totalSize = 0;
    await offlineStore.iterate<OfflineVideo, void>((value) => {
      totalSize += value.size;
    });
    return totalSize;
  }
}

export const storage = new StorageService();