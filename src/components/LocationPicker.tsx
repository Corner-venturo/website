'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';

// 動態載入地圖元件（避免 SSR 問題）
const MapComponent = dynamic(() => import('./LocationPickerMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-gray-100 rounded-2xl flex items-center justify-center">
      <div className="text-gray-400">載入地圖中...</div>
    </div>
  ),
});

export interface LocationData {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

interface LocationPickerProps {
  value?: LocationData | null;
  onChange: (location: LocationData) => void;
  placeholder?: string;
}

interface SearchResult {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

// Photon API 搜尋地點
async function searchPlaces(query: string): Promise<SearchResult[]> {
  if (!query.trim() || query.length < 2) return [];

  try {
    // 使用 Photon API，偏好台灣地區
    const response = await fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5&lang=zh&lat=25.0330&lon=121.5654`
    );

    if (!response.ok) return [];

    const data = await response.json();

    return data.features?.map((feature: {
      properties: {
        osm_id?: number;
        name?: string;
        street?: string;
        housenumber?: string;
        city?: string;
        district?: string;
        state?: string;
        country?: string;
      };
      geometry: {
        coordinates: [number, number];
      };
    }, index: number) => {
      const props = feature.properties;
      const name = props.name || props.street || '未知地點';

      // 組合地址
      const addressParts = [
        props.country,
        props.state,
        props.city,
        props.district,
        props.street,
        props.housenumber,
      ].filter(Boolean);

      const address = addressParts.join('') || name;

      return {
        id: `${props.osm_id || index}`,
        name,
        address,
        latitude: feature.geometry.coordinates[1],
        longitude: feature.geometry.coordinates[0],
      };
    }) || [];
  } catch (error) {
    console.error('Search places error:', error);
    return [];
  }
}

// Nominatim 反向地理編碼（經緯度 → 地址）
async function reverseGeocode(lat: number, lng: number): Promise<{ name: string; address: string } | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=zh-TW`,
      {
        headers: {
          'User-Agent': 'Venturo App',
        },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();

    const address = data.address || {};
    const name = data.name || address.amenity || address.building || address.road || '選取的位置';

    // 組合台灣格式地址
    const addressParts = [
      address.country,
      address.state,
      address.city || address.town || address.village,
      address.suburb || address.district,
      address.road,
      address.house_number,
    ].filter(Boolean);

    return {
      name,
      address: addressParts.join('') || data.display_name || '未知地址',
    };
  } catch (error) {
    console.error('Reverse geocode error:', error);
    return null;
  }
}

export default function LocationPicker({ value, onChange, placeholder = '搜尋地點...' }: LocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 預設台北市中心
  const defaultCenter: [number, number] = [25.0330, 121.5654];
  const [mapCenter, setMapCenter] = useState<[number, number]>(
    value ? [value.latitude, value.longitude] : defaultCenter
  );

  // 點擊外部關閉搜尋結果
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 搜尋地點（防抖）
  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    searchTimeout.current = setTimeout(async () => {
      const results = await searchPlaces(searchQuery);
      setSearchResults(results);
      setShowResults(results.length > 0);
      setIsSearching(false);
    }, 300);

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchQuery]);

  // 選擇搜尋結果
  const handleSelectResult = useCallback((result: SearchResult) => {
    onChange({
      name: result.name,
      address: result.address,
      latitude: result.latitude,
      longitude: result.longitude,
    });
    setSearchQuery(result.name);
    setShowResults(false);
    setMapCenter([result.latitude, result.longitude]);
  }, [onChange]);

  // 地圖點擊選擇位置
  const handleMapClick = useCallback(async (lat: number, lng: number) => {
    setIsReverseGeocoding(true);

    // 先設定座標
    const tempLocation: LocationData = {
      name: '載入中...',
      address: '載入中...',
      latitude: lat,
      longitude: lng,
    };
    onChange(tempLocation);
    setMapCenter([lat, lng]);

    // 反向地理編碼取得地址
    const result = await reverseGeocode(lat, lng);

    if (result) {
      onChange({
        name: result.name,
        address: result.address,
        latitude: lat,
        longitude: lng,
      });
      setSearchQuery(result.name);
    } else {
      onChange({
        name: '選取的位置',
        address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        latitude: lat,
        longitude: lng,
      });
      setSearchQuery('選取的位置');
    }

    setIsReverseGeocoding(false);
  }, [onChange]);

  return (
    <div ref={containerRef} className="space-y-3">
      {/* 搜尋輸入框 */}
      <div className="relative">
        <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          search
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchResults.length > 0 && setShowResults(true)}
          placeholder={placeholder}
          className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-none bg-white text-sm text-gray-800 placeholder-gray-300 shadow-sm focus:ring-2 focus:ring-[rgba(207,185,165,0.5)]"
        />
        {isSearching && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-[#cfb9a5] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* 搜尋結果下拉選單 */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden max-h-64 overflow-y-auto">
            {searchResults.map((result) => (
              <button
                key={result.id}
                type="button"
                onClick={() => handleSelectResult(result)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-start gap-3 border-b border-gray-50 last:border-b-0"
              >
                <span className="material-icons-round text-[#cfb9a5] text-lg mt-0.5">place</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800 truncate">{result.name}</div>
                  <div className="text-xs text-gray-400 truncate">{result.address}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 已選擇的位置顯示 */}
      {value && (
        <div className="bg-[#F7F5F2] rounded-2xl p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#A8BFA6]/20 flex items-center justify-center text-[#A8BFA6] shrink-0">
            <span className="material-icons-round">location_on</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-gray-800 truncate">
              {isReverseGeocoding ? '載入中...' : value.name}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {isReverseGeocoding ? '正在取得地址...' : value.address}
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              onChange({ name: '', address: '', latitude: 0, longitude: 0 });
              setSearchQuery('');
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span className="material-icons-round text-lg">close</span>
          </button>
        </div>
      )}

      {/* 地圖選點切換 */}
      <button
        type="button"
        onClick={() => setShowMap(!showMap)}
        className="flex items-center gap-2 text-sm text-[#cfb9a5] font-medium hover:text-[#b09b88] transition-colors"
      >
        <span className="material-icons-round text-lg">
          {showMap ? 'expand_less' : 'map'}
        </span>
        {showMap ? '收起地圖' : '從地圖選擇位置'}
      </button>

      {/* 地圖 */}
      {showMap && (
        <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          <MapComponent
            center={mapCenter}
            selectedLocation={value ? [value.latitude, value.longitude] : null}
            onLocationSelect={handleMapClick}
          />
          <div className="bg-white px-4 py-2 text-xs text-gray-400 flex items-center gap-1">
            <span className="material-icons-round text-sm">touch_app</span>
            點擊地圖選擇位置
          </div>
        </div>
      )}
    </div>
  );
}
