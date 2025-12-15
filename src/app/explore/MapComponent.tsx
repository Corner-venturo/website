'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Trip {
  id: string;
  title: string;
  category: string;
  event_date: string;
  location: string;
  latitude: number;
  longitude: number;
  member_count: number;
  max_members: number;
  organizer_name: string;
  organizer_avatar: string;
  image: string;
}

interface MapComponentProps {
  trips: Trip[];
  selectedTrip: Trip | null;
  onTripSelect: (trip: Trip) => void;
}

// 類別顏色
const getCategoryHexColor = (category: string) => {
  switch (category) {
    case 'food': return '#E8C4C4';
    case 'photo': return '#A5BCCD';
    case 'outdoor': return '#A8BFA6';
    case 'music': return '#C4B8E0';
    case 'coffee': return '#D4C4A8';
    default: return '#CFB9A5';
  }
};

// 建立揪團標記圖示
const createTripIcon = (trip: Trip, isSelected: boolean) => {
  const size = isSelected ? 50 : 42;
  const color = getCategoryHexColor(trip.category);

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        border-radius: 14px;
        background: ${color};
        border: ${isSelected ? '3px solid white' : '2px solid white'};
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      ">
        <img
          src="${trip.organizer_avatar}"
          style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;"
        />
      </div>
      <div style="
        position: absolute;
        bottom: -4px;
        right: -4px;
        background: white;
        border-radius: 8px;
        padding: 2px 6px;
        font-size: 10px;
        font-weight: bold;
        color: #5C5C5C;
        box-shadow: 0 2px 6px rgba(0,0,0,0.15);
      ">
        ${trip.member_count}/${trip.max_members}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
};

// 用戶位置標記
const userIcon = L.divIcon({
  className: 'user-marker',
  html: `
    <div style="
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: linear-gradient(135deg, #94A3B8 0%, #CFB9A5 100%);
      border: 4px solid white;
      box-shadow: 0 4px 16px rgba(148, 163, 184, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
      </svg>
    </div>
  `,
  iconSize: [48, 48],
  iconAnchor: [24, 24],
});

// 計算兩點之間的距離（公里）
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // 地球半徑（公里）
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

// 自動調整地圖視角
function MapController({ center }: { center: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, 14); // zoom 14 更適合 2 公里範圍
  }, []);

  return null;
}

export default function MapComponent({ trips, selectedTrip, onTripSelect }: MapComponentProps) {
  const [mapReady, setMapReady] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number]>([25.033, 121.5654]); // 預設台北

  useEffect(() => {
    // 延遲渲染地圖
    const timer = setTimeout(() => {
      setMapReady(true);
    }, 100);

    // 取得用戶位置
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        () => {
          // 使用預設位置
        },
        { timeout: 5000 }
      );
    }

    return () => clearTimeout(timer);
  }, []);

  if (!mapReady) {
    return (
      <div className="w-full h-full bg-[#E8E4DC] flex items-center justify-center">
        <div className="text-[#949494]">載入地圖中...</div>
      </div>
    );
  }

  return (
    <MapContainer
      center={userLocation}
      zoom={12}
      style={{ width: '100%', height: '100%' }}
      zoomControl={false}
    >
      {/* 淺色風格地圖 - CartoDB Positron */}
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />

      <MapController center={userLocation} />

      {/* 搜尋範圍圓圈 - 2公里 */}
      <Circle
        center={userLocation}
        radius={2000}
        pathOptions={{
          color: '#94A3B8',
          fillColor: '#94A3B8',
          fillOpacity: 0.08,
          weight: 2,
          dashArray: '8, 8',
        }}
      />

      {/* 用戶位置 */}
      <Marker position={userLocation} icon={userIcon}>
        <Popup>你的位置</Popup>
      </Marker>

      {/* 揪團標記 - 只顯示 2 公里內的 */}
      {trips
        .filter((trip) => {
          const distance = getDistanceFromLatLonInKm(
            userLocation[0],
            userLocation[1],
            trip.latitude,
            trip.longitude
          );
          return distance <= 2; // 2 公里內
        })
        .map((trip) => (
          <Marker
            key={trip.id}
            position={[trip.latitude, trip.longitude]}
            icon={createTripIcon(trip, selectedTrip?.id === trip.id)}
            eventHandlers={{
              click: () => onTripSelect(trip),
            }}
          >
            <Popup>
              <div style={{ minWidth: '150px', fontFamily: 'inherit' }}>
                <strong style={{ fontSize: '14px', color: '#5C5C5C' }}>
                  {trip.title}
                </strong>
                <div style={{ fontSize: '12px', color: '#949494', marginTop: '4px' }}>
                  {trip.member_count}/{trip.max_members} 人參加
                </div>
                <div style={{ fontSize: '12px', color: '#949494', marginTop: '2px' }}>
                  主辦人: {trip.organizer_name}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
}
