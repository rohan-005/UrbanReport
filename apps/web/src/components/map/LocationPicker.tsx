'use client';

import React, { useEffect, useRef, useState } from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Navigation, Search, MapPin, Loader2, AlertCircle, Crosshair } from 'lucide-react';
import { MapsService, PlaceSearchResult } from '@/lib/services/mapsService';

export type LocationSource = 'GPS' | 'MANUAL' | 'SEARCH';

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
  const [locationSource, setLocationSource] = useState<LocationSource>('MANUAL');

  const actionIdRef = useRef<number>(0);
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
          center: [longitude, latitude], // MapLibre expects [lng, lat]
          zoom: 13,
        });

        mapRef.current = map;
        mapInstance = map;

        // Custom marker element
        const el = document.createElement('div');
        el.className = 'custom-location-pin cursor-pointer group';
        el.innerHTML = `
          <div class="relative flex items-center justify-center">
            <span class="absolute inline-flex h-6 w-6 rounded-full bg-zinc-950/30 animate-ping"></span>
            <div class="relative z-10 w-7 h-7 bg-zinc-950 border-2 border-white rounded-full flex items-center justify-center shadow-xl">
              <span class="w-2 h-2 bg-white rounded-full"></span>
            </div>
          </div>
        `;

        const marker = new maplibregl.Marker({ element: el, draggable: true })
          .setLngLat([longitude, latitude])
          .addTo(map);

        markerRef.current = marker;

        const handleManualPositionUpdate = async (newLat: number, newLng: number) => {
          const actionId = ++actionIdRef.current;
          setLocationSource('MANUAL');
          setLocationError(null);

          // Immediately propagate exact unrounded coordinates
          onLocationChange(newLat, newLng);

          setIsReverseGeocoding(true);
          const geoRes = await MapsService.reverseGeocode(newLat, newLng);

          // Prevent stale reverse-geocoding callbacks from overwriting a newer selection
          if (actionId === actionIdRef.current) {
            setIsReverseGeocoding(false);
            if (geoRes?.address) {
              onLocationChange(
                newLat,
                newLng,
                geoRes.address,
              );
            }
          }
        };

        marker.on('dragend', () => {
          const lngLat = marker.getLngLat();
          handleManualPositionUpdate(lngLat.lat, lngLat.lng);
        });

        map.on('click', (e: any) => {
          marker.setLngLat([e.lngLat.lng, e.lngLat.lat]);
          handleManualPositionUpdate(e.lngLat.lat, e.lngLat.lng);
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

  // Keep marker position synchronized with props if changed externally
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
    const actionId = ++actionIdRef.current;
    setShowDropdown(false);
    setSearchQuery(result.placeName);
    setLocationSource('SEARCH');
    setLocationError(null);
    setGpsAccuracy(null);

    // Update marker and center map immediately
    if (markerRef.current) {
      markerRef.current.setLngLat([result.longitude, result.latitude]);
    }
    if (mapRef.current) {
      mapRef.current.flyTo({ center: [result.longitude, result.latitude], zoom: 15, essential: true });
    }

    onLocationChange(result.latitude, result.longitude, result.address);
  };

  const handleUseCurrentLocation = async () => {
    const actionId = ++actionIdRef.current;
    setIsLocatingGPS(true);
    setLocationError(null);

    try {
      // 1. Fetch exact high-accuracy device GPS position
      const location = await MapsService.getCurrentLocation();

      // Ensure no newer action has been triggered in the interim
      if (actionId !== actionIdRef.current) return;

      setLocationSource('GPS');
      setGpsAccuracy(Math.round(location.accuracy));

      // 2. Immediately update marker & fly MapLibre to [lng, lat]
      if (markerRef.current) {
        markerRef.current.setLngLat([location.lng, location.lat]);
      }
      if (mapRef.current) {
        mapRef.current.flyTo({
          center: [location.lng, location.lat],
          zoom: 16,
          essential: true,
        });
      }

      // 3. Immediately propagate exact unrounded coordinates to parent form
      onLocationChange(
        location.lat,
        location.lng,
        `GPS Coordinates (${location.lat.toFixed(5)}° N, ${location.lng.toFixed(5)}° E)`
      );

      // 4. Asynchronously resolve reverse-geocoded address
      setIsReverseGeocoding(true);
      const geoRes = await MapsService.reverseGeocode(location.lat, location.lng);

      if (actionId === actionIdRef.current) {
        setIsReverseGeocoding(false);
        if (geoRes?.address) {
          onLocationChange(location.lat, location.lng, geoRes.address);
        }
      }
    } catch (err: any) {
      if (actionId === actionIdRef.current) {
        setLocationError(err.message || 'Failed to acquire device GPS location.');
      }
    } finally {
      if (actionId === actionIdRef.current) {
        setIsLocatingGPS(false);
      }
    }
  };

  return (
    <div className="space-y-3">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-900">
            Pinpoint Incident Location
          </span>
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-zinc-100 border border-zinc-300 text-zinc-800 uppercase font-mono">
            {locationSource} MODE
          </span>
        </div>

        <button
          type="button"
          disabled={isLocatingGPS}
          onClick={handleUseCurrentLocation}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold transition-colors disabled:opacity-50 shrink-0 self-start sm:self-auto shadow-md"
        >
          {isLocatingGPS ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
          ) : (
            <Navigation className="w-3.5 h-3.5 fill-current" />
          )}
          <span>{isLocatingGPS ? 'Acquiring GPS Signal...' : 'Use My Exact GPS Location'}</span>
        </button>
      </div>

      {/* Place / Address Search Bar */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
            placeholder="Search landmark, street, or area (e.g. HSR Layout, Silk Board)..."
            className="w-full pl-9 pr-8 py-2 bg-white border border-zinc-300 rounded text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900 font-medium"
          />
          {isSearching && (
            <Loader2 className="w-4 h-4 text-zinc-500 animate-spin absolute right-3" />
          )}
        </div>

        {/* Search Results Dropdown */}
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

      {/* Map Container */}
      <div className="h-64 w-full rounded border border-zinc-300 relative overflow-hidden bg-zinc-900">
        <div ref={mapContainerRef} className="w-full h-full" />
        {isReverseGeocoding && (
          <div className="absolute top-3 right-3 z-20 px-2.5 py-1 bg-zinc-950/90 text-white text-[11px] font-mono rounded flex items-center gap-1.5 shadow-md">
            <Loader2 className="w-3 h-3 animate-spin text-white" />
            <span>Resolving Reverse Geocode...</span>
          </div>
        )}
      </div>

      {/* Error Feedback */}
      {locationError && (
        <div className="flex items-center gap-2 p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{locationError}</span>
        </div>
      )}

      {/* Footer Meta Details */}
      <div className="text-[11px] text-zinc-600 font-mono flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-1">
          <Crosshair className="w-3.5 h-3.5 text-zinc-900 shrink-0" />
          <span>Lat: {latitude.toFixed(6)}° N • Lng: {longitude.toFixed(6)}° E</span>
        </div>
        {gpsAccuracy && locationSource === 'GPS' && (
          <span className="text-zinc-700 font-sans font-bold bg-zinc-100 px-2 py-0.5 rounded border border-zinc-300">
            Device GPS Accuracy: ±{gpsAccuracy}m
          </span>
        )}
      </div>
    </div>
  );
};
