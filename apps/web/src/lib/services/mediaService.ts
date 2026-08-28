const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:3005';
const MEDIA_API_BASE = `${GATEWAY_URL}/api`;

export interface UploadedMediaResponse {
  id: string;
  mediaId: string;
  owner: string;
  status: string;
  mimeType: string;
  fileName: string;
  size: number;
  dimensions?: { width: number; height: number };
  checksum: string;
  url: string;
  createdAt: string;
}

export class MediaService {
  public static getMediaUrl(mediaIdOrPath: string): string {
    if (!mediaIdOrPath) return '';
    if (mediaIdOrPath.startsWith('http://') || mediaIdOrPath.startsWith('https://') || mediaIdOrPath.startsWith('data:')) {
      return mediaIdOrPath;
    }
    if (mediaIdOrPath.startsWith('/media/')) {
      return `${MEDIA_API_BASE}${mediaIdOrPath}`;
    }
    return `${MEDIA_API_BASE}/media/${mediaIdOrPath}`;
  }

  public static async uploadImage(file: File): Promise<UploadedMediaResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const token = typeof window !== 'undefined' ? localStorage.getItem('urbanreports_access_token') : null;

    const response = await fetch(`${MEDIA_API_BASE}/media`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || `Upload failed with status ${response.status}`);
    }

    const data: UploadedMediaResponse = await response.json();
    return {
      ...data,
      url: this.getMediaUrl(data.mediaId),
    };
  }

  public static async uploadSampleUrl(sampleUrl: string, sampleName: string): Promise<UploadedMediaResponse> {
    try {
      const res = await fetch(sampleUrl);
      const blob = await res.blob();
      const file = new File([blob], `${sampleName.toLowerCase().replace(/\s+/g, '-')}.jpg`, {
        type: blob.type || 'image/jpeg',
      });
      return await this.uploadImage(file);
    } catch {
      // If fetching external URL fails due to CORS in browser, create a fallback canvas binary
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 600;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#18181b';
        ctx.fillRect(0, 0, 800, 600);
        ctx.fillStyle = '#ffffff';
        ctx.font = '24px sans-serif';
        ctx.fillText(`UrbanReports Evidence: ${sampleName}`, 40, 300);
      }
      const blob: Blob = await new Promise((resolve) => canvas.toBlob((b) => resolve(b || new Blob()), 'image/jpeg'));
      const file = new File([blob], `${sampleName.toLowerCase().replace(/\s+/g, '-')}.jpg`, { type: 'image/jpeg' });
      return await this.uploadImage(file);
    }
  }

  public static async deleteMedia(mediaId: string): Promise<boolean> {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('urbanreports_access_token') : null;
      const res = await fetch(`${MEDIA_API_BASE}/media/${mediaId}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      return res.ok;
    } catch {
      return false;
    }
  }
}
