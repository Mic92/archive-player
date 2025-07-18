import axios from 'axios';
import type { ArchiveMetadata } from '../types/archive';

const ARCHIVE_API_BASE = 'https://archive.org';
const CORS_PROXY = '';

export class ArchiveApiService {
  private useProxy = false;

  private getUrl(path: string): string {
    const url = `${ARCHIVE_API_BASE}${path}`;
    return this.useProxy && CORS_PROXY ? `${CORS_PROXY}${url}` : url;
  }

  async getMetadata(identifier: string): Promise<ArchiveMetadata> {
    try {
      const response = await axios.get<ArchiveMetadata>(
        this.getUrl(`/metadata/${identifier}`)
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 0) {
        this.useProxy = true;
        const response = await axios.get<ArchiveMetadata>(
          this.getUrl(`/metadata/${identifier}`)
        );
        return response.data;
      }
      throw error;
    }
  }

  getVideoUrl(identifier: string, fileName: string): string {
    return `${ARCHIVE_API_BASE}/download/${identifier}/${encodeURIComponent(fileName)}`;
  }

  getThumbnailUrl(identifier: string): string {
    return `${ARCHIVE_API_BASE}/services/img/${identifier}`;
  }

  async searchCollections(query: string, page = 1, rows = 50): Promise<any> {
    const params = new URLSearchParams({
      q: query,
      fl: 'identifier,title,description,creator,date,mediatype',
      sort: 'downloads desc',
      rows: rows.toString(),
      page: page.toString(),
      output: 'json'
    });

    const response = await axios.get(
      this.getUrl(`/advancedsearch.php?${params}`)
    );
    return response.data;
  }
}

export const archiveApi = new ArchiveApiService();