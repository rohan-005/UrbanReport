'use client';

import React, { useEffect, useRef } from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Complaint, Severity } from '@/lib/types';
import { Navigation } from 'lucide-react';

interface MapViewProps {
  complaints: Complaint[];
  selectedComplaintId?: string;
  onSelectComplaint?: (complaint: Complaint) => void;
  center?: [number, number];
  zoom?: number;
  interactive?: boolean;
  className?: string;
}

const severityColors: Record<Severity, string> = {
  CRITICAL: '#ef4444',
  HIGH: '#f8fafc',
  MEDIUM: '#a1a1aa',
  LOW: '#52525b',
};

export const MapView: React.FC<MapViewProps> = ({
  complaints,
  selectedComplaintId,
  onSelectComplaint,
  center = [77.5946, 12.9716],
  zoom = 12,
  interactive = true,
  className = 'w-full h-full min-h-[400px]',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());

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
          center: center,
          zoom: zoom,
          interactive: interactive,
        });

        mapRef.current = map;
        mapInstance = map;

        map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');
      } catch (err) {
        console.error('Failed to initialize MapLibre GL instance:', err);
      }
    };

    initMap();

    return () => {
      isMounted = false;
      if (markersRef.current) {
        markersRef.current.forEach((marker) => marker.remove());
        markersRef.current.clear();
      }
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, []);

  // Sync Markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    let isMounted = true;

    const updateMarkers = async () => {
      try {
        const maplibreglModule = await import('maplibre-gl');
        const maplibregl = maplibreglModule.default || maplibreglModule;

        if (!isMounted || !mapRef.current) return;

        markersRef.current.forEach((m) => m.remove());
        markersRef.current.clear();

        complaints.forEach((complaint) => {
          const color = severityColors[complaint.severity] || '#f8fafc';

          const el = document.createElement('div');
          el.className = 'custom-complaint-marker group cursor-pointer';

          const isCritical = complaint.severity === 'CRITICAL';
          const isSelected = selectedComplaintId === complaint.id;

          el.innerHTML = `
            <div class="relative flex items-center justify-center">
              ${
                isCritical
                  ? `<span class="absolute inline-flex h-8 w-8 rounded-none bg-red-600 opacity-75 animate-ping"></span>`
                  : ''
              }
              <div class="relative z-10 flex items-center justify-center ${
                isSelected ? 'w-10 h-10 ring-2 ring-white scale-110' : 'w-8 h-8'
              } rounded-none border border-zinc-900 shadow-2xl transition-all duration-200" style="background-color: ${color}">
                <span class="w-2.5 h-2.5 bg-zinc-950 rounded-none"></span>
              </div>
            </div>
          `;

          const popupHtml = `
            <div class="p-2 max-w-xs font-sans text-zinc-100">
              <div class="flex items-center justify-between gap-2 mb-1.5">
                <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-none bg-zinc-800 text-zinc-200 border border-zinc-700">${complaint.category}</span>
                <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-none text-zinc-950 uppercase" style="background-color: ${color}">${complaint.severity}</span>
              </div>
              <h4 class="text-xs font-bold text-white leading-tight mb-1">${complaint.title}</h4>
              <p class="text-[11px] text-zinc-400 line-clamp-2 mb-2">${complaint.address}</p>
              <div class="flex items-center justify-between pt-2 border-t border-zinc-800">
                <span class="text-[10px] text-zinc-400 font-mono">${complaint.status}</span>
                <a href="/complaints/${complaint.id}" class="inline-flex items-center gap-1 text-[11px] font-bold text-white uppercase tracking-wider hover:underline">
                  DOSSIER →
                </a>
              </div>
            </div>
          `;

          const popup = new maplibregl.Popup({ offset: 20, closeButton: true }).setHTML(popupHtml);

          const marker = new maplibregl.Marker({ element: el })
            .setLngLat([complaint.longitude, complaint.latitude])
            .setPopup(popup)
            .addTo(mapRef.current);

          el.addEventListener('click', () => {
            if (onSelectComplaint) onSelectComplaint(complaint);
          });

          markersRef.current.set(complaint.id, marker);
        });
      } catch (err) {
        console.error('Failed to update map markers:', err);
      }
    };

    updateMarkers();

    return () => {
      isMounted = false;
    };
  }, [complaints, selectedComplaintId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedComplaintId) return;

    const target = complaints.find((c) => c.id === selectedComplaintId);
    if (target) {
      map.flyTo({
        center: [target.longitude, target.latitude],
        zoom: 15,
        essential: true,
      });

      const marker = markersRef.current.get(selectedComplaintId);
      if (marker && !marker.getPopup().isOpen()) {
        marker.togglePopup();
      }
    }
  }, [selectedComplaintId, complaints]);

  const handleResetView = () => {
    const map = mapRef.current;
    if (!map) return;
    map.flyTo({ center: center, zoom: zoom });
  };

  return (
    <div className={`relative overflow-hidden rounded-none border border-zinc-800 ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Monochrome Legend */}
      <div className="absolute bottom-4 left-4 z-10 hidden sm:flex items-center gap-3 px-3 py-2 rounded-none bg-zinc-950/95 border border-zinc-800 text-xs text-zinc-300 shadow-2xl font-mono">
        <span className="font-bold text-zinc-400 uppercase">SEVERITY:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-none bg-red-600 animate-pulse" />
          <span>Critical</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-none bg-zinc-100" />
          <span>High</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-none bg-zinc-400" />
          <span>Medium</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-none bg-zinc-600" />
          <span>Low</span>
        </div>
      </div>

      <button
        onClick={handleResetView}
        className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-none bg-zinc-950/95 hover:bg-zinc-900 border border-zinc-700 text-xs font-bold uppercase tracking-wider text-zinc-200 shadow-xl transition-colors"
        title="Reset Map View"
      >
        <Navigation className="w-3.5 h-3.5 text-zinc-100" />
        <span>RESET VIEW</span>
      </button>
    </div>
  );
};
