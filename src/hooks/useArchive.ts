import { useState, useEffect } from 'react';
import { archiveApi } from '../services/archiveApi';
import { storage } from '../services/storage';
import type { ArchiveMetadata, Playlist } from '../types/archive';

export function useArchive(identifier: string) {
  const [metadata, setMetadata] = useState<ArchiveMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!identifier) return;

    const loadMetadata = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const cachedPlaylist = await storage.getPlaylist(identifier);
        if (cachedPlaylist && Date.now() - cachedPlaylist.lastAccessed < 3600000) {
          setMetadata({
            identifier: cachedPlaylist.identifier,
            title: cachedPlaylist.title,
            description: cachedPlaylist.description,
            files: cachedPlaylist.files,
          } as ArchiveMetadata);
          setLoading(false);
          return;
        }

        const data = await archiveApi.getMetadata(identifier);
        setMetadata(data);
        
        const playlist: Playlist = {
          identifier: identifier, // Use the parameter, not data.identifier
          title: data.title || identifier,
          description: data.description,
          files: data.files.filter(f => 
            f.format && (
              f.format.toLowerCase().includes('mp4') ||
              f.format.toLowerCase().includes('mkv') ||
              f.format.toLowerCase().includes('avi') ||
              f.format.toLowerCase().includes('webm') ||
              f.format.toLowerCase().includes('h.264')
            )
          ),
          lastAccessed: Date.now()
        };
        await storage.savePlaylist(playlist);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load metadata');
      } finally {
        setLoading(false);
      }
    };

    loadMetadata();
  }, [identifier]);

  return { metadata, loading, error };
}