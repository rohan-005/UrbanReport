'use client';

import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Complaint, Severity } from '@/lib/types';
import { MapPin, Navigation, Layers, ZoomIn, ZoomOut } from 'lucide-react';

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
  HIGH: '#f97316',
  MEDIUM: '#f59e0b',
  LOW: '#38bdf8',
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
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<Map<string, maplibregl.Marker>>(new Map());
  const activePopupRef = useRef<maplibregl.Popup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

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

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current.clear();
      map.remove();
    };
  }, []);

  // Sync Markers with Complaints data
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current.clear();

    complaints.forEach((complaint) => {
      const color = severityColors[complaint.severity] || '#38bdf8';

      // Create Custom Element Marker
      const el = document.createElement('div');
      el.className = 'custom-complaint-marker group cursor-pointer';
      
      const isCritical = complaint.severity === 'CRITICAL';
      const isSelected = selectedComplaintId === complaint.id;

      el.innerHTML = `
        <div class="relative flex items-center justify-center">
          ${
            isCritical
              ? `<span class="absolute inline-flex h-8 w-8 rounded-full bg-red-500 opacity-75 animate-ping"></span>`
              : ''
          }
          <div class="relative z-10 flex items-center justify-center ${
            isSelected ? 'w-10 h-10 ring-4 ring-white' : 'w-8 h-8'
          } rounded-full border-2 border-slate-900 shadow-xl transition-all duration-200" style="background-color: ${color}">
            <svg class="w-4 h-4 text-slate-950 stroke-[2.5]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
        </div>
      `;

      // Popup Content HTML
      const popupHtml = `
        <div class="p-2 max-w-xs font-sans">
          <div class="flex items-center justify-between gap-2 mb-1">
            <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-sky-400 border border-slate-700">${complaint.category}</span>
            <span class="text-[10px] font-semibold px-2 py-0.5 rounded text-white" style="background-color: ${color}">${complaint.severity}</span>
          </div>
          <h4 class="text-sm font-bold text-white leading-tight mb-1">${complaint.title}</h4>
          <p class="text-xs text-slate-300 line-clamp-2 mb-2">${complaint.address}</p>
          <div class="flex items-center justify-between pt-2 border-t border-slate-700">
            <span class="text-[11px] text-slate-400 font-mono">${complaint.status}</span>
            <a href="/complaints/${complaint.id}" class="inline-flex items-center gap-1 text-xs font-semibold text-sky-400 hover:text-sky-300">
              View Details →
            </a>
          </div>
        </div>
      `;

      const popup = new maplibregl.Popup({ offset: 25, closeButton: true }).setHTML(popupHtml);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([complaint.longitude, complaint.latitude])
        .setPopup(popup)
        .addTo(map);

      el.addEventListener('click', () => {
        if (onSelectComplaint) onSelectComplaint(complaint);
      });

      markersRef.current.set(complaint.id, marker);
    });
  }, [complaints, selectedComplaintId]);

  // Fly to selected complaint
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
    <div className={`relative overflow-hidden rounded-2xl border border-slate-800 ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Map Floating Info Legend */}
      <div className="absolute bottom-4 left-4 z-10 hidden sm:flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-800 text-xs text-slate-300 shadow-xl">
        <span className="font-semibold text-slate-400">Severity:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <span>Critical</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
          <span>High</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>Medium</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
          <span>Low</span>
        </div>
      </div>

      {/* Reset view Floating Button */}
      <button
        onClick={handleResetView}
        className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 backdrop-blur-md border border-slate-700 text-xs font-medium text-slate-200 shadow-lg transition-colors"
        title="Reset Map View"
      >
        <Navigation className="w-3.5 h-3.5 text-sky-400" />
        <span>Reset View</span>
      </button>
    </div>
  );
};
