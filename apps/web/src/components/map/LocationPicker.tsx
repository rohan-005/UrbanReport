'use client';

import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPin, Navigation } from 'lucide-react';
import { Button } from '../ui/Button';

interface LocationPickerProps {
  latitude: number;
  longitude: number;
  onLocationChange: (lat: number, lng: number, sampleAddress?: string) => void;
}

const sampleAddresses = [
  'Outer Ring Road, Sector 5, HSR Layout, Bengaluru',
  '100 Feet Road, Indiranagar, Bengaluru',
  'MG Road District, Near Trinity Circle, Bengaluru',
  'Commercial Street Corner, Tasker Town, Bengaluru',
  'Jayanagar 4th Block, South End Circle, Bengaluru',
];

export const LocationPicker: React.FC<LocationPickerProps> = ({
  latitude,
  longitude,
  onLocationChange,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

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

    // Draggable / Clickable Pin Marker
    const marker = new maplibregl.Marker({ color: '#0284c7', draggable: true })
      .setLngLat([longitude, latitude])
      .addTo(map);

    markerRef.current = marker;

    marker.on('dragend', () => {
      const lngLat = marker.getLngLat();
      const randomAddr = sampleAddresses[Math.floor(Math.random() * sampleAddresses.length)];
      onLocationChange(lngLat.lat, lngLat.lng, randomAddr);
    });

    map.on('click', (e) => {
      marker.setLngLat(e.lngLat);
      const randomAddr = sampleAddresses[Math.floor(Math.random() * sampleAddresses.length)];
      onLocationChange(e.lngLat.lat, e.lngLat.lng, randomAddr);
    });

    return () => {
      map.remove();
    };
  }, []);

  const handleUseCurrentLocation = () => {
    // Default to Bengaluru Center with slight offset
    const lat = 12.9716 + (Math.random() - 0.5) * 0.05;
    const lng = 77.5946 + (Math.random() - 0.5) * 0.05;
    const addr = sampleAddresses[Math.floor(Math.random() * sampleAddresses.length)];

    if (markerRef.current) {
      markerRef.current.setLngLat([lng, lat]);
    }
    if (mapRef.current) {
      mapRef.current.flyTo({ center: [lng, lat], zoom: 15 });
    }
    onLocationChange(lat, lng, addr);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Pinpoint Location on Map (Click or Drag Marker)
        </span>
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          className="inline-flex items-center gap-1 text-xs font-semibold text-sky-400 hover:text-sky-300"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Use My GPS Location</span>
        </button>
      </div>

      <div className="h-60 w-full rounded-2xl overflow-hidden border border-slate-700 relative">
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>

      <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between">
        <span>Selected Lat: {latitude.toFixed(4)}° N</span>
        <span>Selected Lng: {longitude.toFixed(4)}° E</span>
      </div>
    </div>
  );
};
