const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:4001';
const MAPS_API_BASE = `${GATEWAY_URL}/api`;

export interface PlaceSearchResult {
  id: string;
  placeName: string;
  address: string;
  latitude: number;
  longitude: number;
  bbox?: [number, number, number, number];
}

export interface ReverseGeocodeResult {
  address: string;
  placeName: string;
  latitude: number;
  longitude: number;
  city?: string;
  postcode?: string;
}

export class MapsService {
  public static async searchPlaces(query: string): Promise<PlaceSearchResult[]> {
    if (!query || query.trim().length < 2) return [];

    try {
      const res = await fetch(`${MAPS_API_BASE}/maps/search?q=${encodeURIComponent(query.trim())}`);
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  public static async reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResult | null> {
    try {
      const res = await fetch(`${MAPS_API_BASE}/maps/reverse?lat=${lat}&lng=${lng}`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  /**
   * High-accuracy device GPS position provider
   * Disables stale cached locations (maximumAge: 0) and sets 15s timeout
   */
  public static async getCurrentLocation(): Promise<{ lat: number; lng: number; accuracy: number }> {
    return new Promise((resolve, reject) => {
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        reject(new Error('Browser geolocation is not supported on your device or environment.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        (error) => {
          let msg = 'Failed to acquire current GPS location.';
          if (error.code === error.PERMISSION_DENIED) {
            msg = 'Location access denied. Please grant location permissions in your browser settings.';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            msg = 'GPS location signal is currently unavailable on your device.';
          } else if (error.code === error.TIMEOUT) {
            msg = 'GPS location request timed out. Please try again.';
          }
          reject(new Error(msg));
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
      );
    });
  }
}
