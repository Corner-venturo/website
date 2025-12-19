'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LocationPickerMapProps {
  center: [number, number];
  selectedLocation: [number, number] | null;
  onLocationSelect: (lat: number, lng: number) => void;
}

// 選取位置的標記圖示
const selectedIcon = L.divIcon({
  className: 'selected-location-marker',
  html: `
    <div style="
      position: relative;
      width: 40px;
      height: 40px;
    ">
      <div style="
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 12px;
        height: 12px;
        background: #cfb9a5;
        border-radius: 50%;
        box-shadow: 0 0 0 4px rgba(207, 185, 165, 0.3);
      "></div>
      <div style="
        position: absolute;
        bottom: 6px;
        left: 50%;
        transform: translateX(-50%);
        width: 4px;
        height: 24px;
        background: linear-gradient(to bottom, #cfb9a5, transparent);
        border-radius: 2px;
      "></div>
      <div style="
        position: absolute;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 24px;
        height: 24px;
        background: #cfb9a5;
        border-radius: 50% 50% 50% 0;
        transform: translateX(-50%) rotate(-45deg);
        box-shadow: 0 2px 8px rgba(207, 185, 165, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 10px;
          height: 10px;
          background: white;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

// 地圖控制器
function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  const prevCenter = useRef<[number, number]>(center);

  useEffect(() => {
    const [prevLat, prevLng] = prevCenter.current;
    const [newLat, newLng] = center;

    // 如果 center 有明顯變化，飛過去
    if (Math.abs(prevLat - newLat) > 0.0001 || Math.abs(prevLng - newLng) > 0.0001) {
      map.flyTo(center, 16, { duration: 0.5 });
    }

    prevCenter.current = center;
  }, [center, map]);

  return null;
}

// 地圖點擊事件處理
function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function LocationPickerMap({
  center,
  selectedLocation,
  onLocationSelect,
}: LocationPickerMapProps) {
  return (
    <MapContainer
      center={center}
      zoom={16}
      style={{ width: '100%', height: '256px' }}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />

      <MapController center={center} />
      <MapClickHandler onLocationSelect={onLocationSelect} />

      {/* 選取的位置標記 */}
      {selectedLocation && selectedLocation[0] !== 0 && (
        <Marker position={selectedLocation} icon={selectedIcon} />
      )}
    </MapContainer>
  );
}
