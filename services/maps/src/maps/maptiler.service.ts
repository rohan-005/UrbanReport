import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

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

@Injectable()
export class MaptilerService {
  private readonly logger = new Logger('MaptilerService');

  private readonly samplePlaces: PlaceSearchResult[] = [
    {
      id: 'place-01',
      placeName: 'Silk Board Junction, Outer Ring Road',
      address: 'Central Silk Board Flyover, BTM Layout, Bengaluru, Karnataka 560068',
      latitude: 12.9172,
      longitude: 77.6228,
      bbox: [77.618, 12.912, 77.628, 12.922],
    },
    {
      id: 'place-02',
      placeName: 'HSR Layout Sector 5',
      address: '14th Main Road, Sector 5, HSR Layout, Bengaluru, Karnataka 560102',
      latitude: 12.9116,
      longitude: 77.6389,
      bbox: [77.63, 12.905, 77.645, 12.918],
    },
    {
      id: 'place-03',
      placeName: '100 Feet Road, Indiranagar',
      address: '100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru, Karnataka 560038',
      latitude: 12.9784,
      longitude: 77.6408,
      bbox: [77.635, 12.972, 77.646, 12.984],
    },
    {
      id: 'place-04',
      placeName: 'MG Road Metro Station',
      address: 'Mahatma Gandhi Road, Tasker Town, Shivaji Nagar, Bengaluru, Karnataka 560001',
      latitude: 12.9756,
      longitude: 77.6066,
      bbox: [77.601, 12.97, 77.612, 12.98],
    },
    {
      id: 'place-05',
      placeName: 'Jayanagar 4th Block Complex',
      address: '4th Block, Jayanagar, Bengaluru, Karnataka 560011',
      latitude: 12.9299,
      longitude: 77.5826,
      bbox: [77.577, 12.924, 77.588, 12.935],
    },
    {
      id: 'place-06',
      placeName: 'Koramangala 80 Feet Road',
      address: '80 Feet Peripheral Road, Koramangala 4th Block, Bengaluru, Karnataka 560034',
      latitude: 12.9352,
      longitude: 77.6245,
      bbox: [77.619, 12.93, 77.63, 12.94],
    },
    {
      id: 'place-07',
      placeName: 'Whitefield Main Road',
      address: 'ITPL Main Road, Pattandur Agrahara, Whitefield, Bengaluru, Karnataka 560066',
      latitude: 12.9863,
      longitude: 77.7337,
      bbox: [77.725, 12.98, 77.74, 12.99],
    },
    {
      id: 'place-08',
      placeName: 'Electronic City Phase 1',
      address: 'Hosur Road, Electronic City Phase 1, Bengaluru, Karnataka 560100',
      latitude: 12.8452,
      longitude: 77.6602,
      bbox: [77.652, 12.838, 77.668, 12.852],
    },
  ];

  constructor(private readonly configService: ConfigService) {}

  /**
   * Search places / forward geocode query string via MapTiler Cloud API
   */
  async searchPlaces(query: string): Promise<PlaceSearchResult[]> {
    const apiKey = this.configService.get<string>('MAPTILER_API_KEY');
    const baseUrl =
      this.configService.get<string>('MAPTILER_BASE_URL') ||
      'https://api.maptiler.com/geocoding';

    if (apiKey) {
      try {
        const url = `${baseUrl}/${encodeURIComponent(query)}.json?key=${apiKey}&limit=5`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data.features && Array.isArray(data.features)) {
            return data.features.map((feat: any, idx: number) => {
              const [lng, lat] = feat.geometry?.coordinates || [77.5946, 12.9716];
              return {
                id: feat.id || `maptiler-${idx}-${Date.now()}`,
                placeName: feat.text || feat.place_name || query,
                address: feat.place_name || feat.text || query,
                latitude: lat,
                longitude: lng,
                bbox: feat.bbox || undefined,
              };
            });
          }
        }
      } catch (err: any) {
        this.logger.warn(`MapTiler search request error: ${err.message}.`);
      }
    }

    // Secondary Fallback: Try free public OpenStreetMap Nominatim geocoding API
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query.trim())}&format=json&limit=5`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'UrbanReport-App/1.0 (contact: admin@urbanreports.gov.in)' }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data.map((item: any) => {
            const lat = parseFloat(item.lat);
            const lng = parseFloat(item.lon);
            return {
              id: item.place_id ? `osm-${item.place_id}` : `osm-${Math.random()}`,
              placeName: item.display_name.split(',')[0] || query,
              address: item.display_name || query,
              latitude: lat,
              longitude: lng,
            };
          });
        }
      }
    } catch (err: any) {
      this.logger.warn(`OSM Nominatim search fallback error: ${err.message}.`);
    }

    // Fallback search filtering on local landmarks dataset
    const q = query.toLowerCase().trim();
    const matched = this.samplePlaces.filter(
      (p) =>
        p.placeName.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q),
    );

    return matched.length > 0 ? matched : this.samplePlaces.slice(0, 4);
  }

  /**
   * Reverse geocode latitude/longitude coordinates to human-readable address via MapTiler API
   */
  async reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResult> {
    const apiKey = this.configService.get<string>('MAPTILER_API_KEY');
    const baseUrl =
      this.configService.get<string>('MAPTILER_BASE_URL') ||
      'https://api.maptiler.com/geocoding';

    if (apiKey) {
      try {
        const url = `${baseUrl}/${lng},${lat}.json?key=${apiKey}&limit=1`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data.features && data.features.length > 0) {
            const feat = data.features[0];
            return {
              address: feat.place_name || feat.text || `Location at ${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`,
              placeName: feat.text || 'Selected Location',
              latitude: lat,
              longitude: lng,
              city: feat.context?.find((c: any) => c.id?.startsWith('place'))?.text || 'Bengaluru',
            };
          }
        }
      } catch (err: any) {
        this.logger.warn(`MapTiler reverse geocode error: ${err.message}.`);
      }
    }

    // Secondary Fallback: Try free public OpenStreetMap Nominatim reverse geocoding API
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'UrbanReport-App/1.0 (contact: admin@urbanreports.gov.in)' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.display_name) {
          return {
            address: data.display_name,
            placeName: data.name || 'Selected Location',
            latitude: lat,
            longitude: lng,
            city: data.address?.city || data.address?.town || data.address?.village || 'Bengaluru',
            postcode: data.address?.postcode,
          };
        }
      }
    } catch (err: any) {
      this.logger.warn(`OSM Nominatim reverse geocode fallback error: ${err.message}.`);
    }

    // Find closest sample place or construct fallback coordinate address
    let minDistance = Infinity;
    let closestPlace = this.samplePlaces[0];

    for (const place of this.samplePlaces) {
      const dist = Math.hypot(place.latitude - lat, place.longitude - lng);
      if (dist < minDistance) {
        minDistance = dist;
        closestPlace = place;
      }
    }

    if (minDistance < 0.05) {
      return {
        address: closestPlace.address,
        placeName: closestPlace.placeName,
        latitude: lat,
        longitude: lng,
        city: 'Bengaluru',
      };
    }

    return {
      address: `Incident Site Coordinates (${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E), Urban District`,
      placeName: 'Selected Coordinates',
      latitude: lat,
      longitude: lng,
      city: 'Bengaluru',
    };
  }
}
