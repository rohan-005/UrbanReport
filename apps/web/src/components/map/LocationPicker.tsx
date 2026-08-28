'use client';

import React, { useEffect, useRef, useState } from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Navigation, Search, MapPin, Loader2, AlertCircle } from 'lucide-react';
import { MapsService, PlaceSearchResult } from '@/lib/services/mapsService';

interface LocationPickerProps {
  latitude: number;
  longitude: number;
  onLocationChange: (lat: number, lng: number, address?: string) => void;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  latitude,
  longitude,
  onLocationChange,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PlaceSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLocatingGPS, setIsLocatingGPS] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    let isMounted = true;
    let mapInstance: any = null;

    const initMap = async () => {
      try {
        const maplibreglModule = await import('maplibre-gl');
        const maplibregl = maplibreglModule.default || maplibreglModule;

        if (!isMounted || !mapContainerRef.current) return;

        const apiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;
        const styleUrl = apiKey
          ? `https://api.maptiler.com/maps/streets-v2/style.json?key=${apiKey}`
          : 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

        const map = new maplibregl.Map({
          container: mapContainerRef.current,
          style: styleUrl,
          center: [longitude, latitude],
          zoom: 13,
        });

        mapRef.current = map;
        mapInstance = map;

        const marker = new maplibregl.Marker({ color: '#09090b', draggable: true })
          .setLngLat([longitude, latitude])
          .addTo(map);

        markerRef.current = marker;

        const handlePositionUpdate = async (newLat: number, newLng: number) => {
          setIsReverseGeocoding(true);
          setLocationError(null);
          const geoRes = await MapsService.reverseGeocode(newLat, newLng);
          setIsReverseGeocoding(false);

          onLocationChange(
            newLat,
            newLng,
            geoRes?.address || `Incident Coordinates (${newLat.toFixed(4)}° N, ${newLng.toFixed(4)}° E)`
          );
        };

        marker.on('dragend', () => {
          const lngLat = marker.getLngLat();
          handlePositionUpdate(lngLat.lat, lngLat.lng);
        });

        map.on('click', (e: any) => {
          marker.setLngLat(e.lngLat);
          handlePositionUpdate(e.lngLat.lat, e.lngLat.lng);
        });
      } catch (err) {
        console.error('Failed to initialize LocationPicker map:', err);
      }
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, []);

  // Synchronize marker & center when props change from external place selection or form reset
  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setLngLat([longitude, latitude]);
    }
  }, [latitude, longitude]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      const results = await MapsService.searchPlaces(query);
      setSearchResults(results);
      setIsSearching(false);
      setShowDropdown(true);
    }, 300);
  };

  const handleSelectSearchResult = (result: PlaceSearchResult) => {
    setShowDropdown(false);
    setSearchQuery(result.placeName);

    if (markerRef.current) {
      markerRef.current.setLngLat([result.longitude, result.latitude]);
    }
    if (mapRef.current) {
      mapRef.current.flyTo({ center: [result.longitude, result.latitude], zoom: 15 });
    }

    onLocationChange(result.latitude, result.longitude, result.address);
  };

  const handleUseCurrentLocation = async () => {
    setIsLocatingGPS(true);
    setLocationError(null);

    try {
      const location = await MapsService.getCurrentLocation();
      setGpsAccuracy(Math.round(location.accuracy));

      if (markerRef.current) {
        markerRef.current.setLngLat([location.lng, location.lat]);
      }
      if (mapRef.current) {
        mapRef.current.flyTo({ center: [location.lng, location.lat], zoom: 16 });
      }

      setIsReverseGeocoding(true);
      const geoRes = await MapsService.reverseGeocode(location.lat, location.lng);
      setIsReverseGeocoding(false);

      onLocationChange(
        location.lat,
        location.lng,
        geoRes?.address || `GPS Location (${location.lat.toFixed(4)}° N, ${location.lng.toFixed(4)}° E)`
      );
    } catch (err: any) {
      setLocationError(err.message || 'Failed to acquire GPS location.');
    } finally {
      setIsLocatingGPS(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Header Controls & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-900">
          Pinpoint Incident Location (Click map, drag marker, or search)
        </span>
        <button
          type="button"
          disabled={isLocatingGPS}
          onClick={handleUseCurrentLocation}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold transition-colors disabled:opacity-50 shrink-0 self-start sm:self-auto"
        >
          {isLocatingGPS ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
          ) : (
            <Navigation className="w-3.5 h-3.5" />
          )}
          <span>{isLocatingGPS ? 'Acquiring GPS...' : 'Use My GPS Location'}</span>
        </button>
      </div>

      {/* Address / Landmark Search Bar */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
            placeholder="Search landmark, street, or area name (e.g. HSR Layout, Silk Board)..."
            className="w-full pl-9 pr-8 py-2 bg-white border border-zinc-300 rounded text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900 font-medium"
          />
          {isSearching && (
            <Loader2 className="w-4 h-4 text-zinc-500 animate-spin absolute right-3" />
          )}
        </div>

        {/* Autocomplete Dropdown */}
        {showDropdown && searchResults.length > 0 && (
          <div className="absolute z-30 left-0 right-0 mt-1 bg-white border border-zinc-300 rounded shadow-xl max-h-56 overflow-y-auto font-sans">
            {searchResults.map((result) => (
              <div
                key={result.id}
                onClick={() => handleSelectSearchResult(result)}
                className="p-2.5 hover:bg-zinc-100 cursor-pointer border-b border-zinc-100 last:border-none transition-colors"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-zinc-900 shrink-0" />
                  <div>
                    <h5 className="text-xs font-bold text-zinc-900">{result.placeName}</h5>
                    <p className="text-[11px] text-zinc-500 line-clamp-1">{result.address}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Map Canvas */}
      <div className="h-64 w-full rounded border border-zinc-300 relative overflow-hidden bg-zinc-900">
        <div ref={mapContainerRef} className="w-full h-full" />
        {isReverseGeocoding && (
          <div className="absolute top-3 right-3 z-20 px-2.5 py-1 bg-zinc-950/90 text-white text-[11px] font-mono rounded flex items-center gap-1.5 shadow-md">
            <Loader2 className="w-3 h-3 animate-spin text-white" />
            <span>Resolving Address...</span>
          </div>
        )}
      </div>

      {/* Error & Accuracy Notice */}
      {locationError && (
        <div className="flex items-center gap-2 p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{locationError}</span>
        </div>
      )}

      {/* Coordinate & Accuracy Footer */}
      <div className="text-[11px] text-zinc-600 font-mono flex flex-wrap items-center justify-between gap-2 px-1">
        <span>Lat: {latitude.toFixed(5)}° N • Lng: {longitude.toFixed(5)}° E</span>
        {gpsAccuracy && (
          <span className="text-zinc-500 font-sans">GPS Accuracy: ±{gpsAccuracy}m</span>
        )}
      </div>
    </div>
  );
};
