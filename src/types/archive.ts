export interface ArchiveFile {
  name: string;
  source: 'original' | 'derivative';
  format: string;
  size: string;
  length?: string;
  height?: string;
  width?: string;
  title?: string;
  track?: string;
  md5?: string;
  mtime?: string;
  crc32?: string;
  sha1?: string;
}

export interface ArchiveMetadata {
  created: number;
  creator?: string;
  description?: string;
  identifier: string;
  mediatype: string;
  title: string;
  publicdate?: string;
  uploader?: string;
  files: ArchiveFile[];
  dir: string;
  server: string;
  workable_servers: string[];
}

export interface PlaybackHistory {
  identifier: string;
  fileName: string;
  position: number;
  duration: number;
  lastPlayed: number;
  completed: boolean;
}

export interface Playlist {
  identifier: string;
  title: string;
  description?: string;
  files: ArchiveFile[];
  lastAccessed: number;
}

export interface OfflineVideo {
  identifier: string;
  fileName: string;
  blobUrl: string;
  size: number;
  downloadedAt: number;
  metadata: ArchiveFile;
}