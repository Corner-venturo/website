'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import MobileNav from '@/components/MobileNav';
import { useAuthStore } from '@/stores/auth-store';
import { countryColors } from '@/lib/airports';

interface Flight {
  id: string;
  from: string;
  to: string;
  fromCity: string;
  toCity: string;
  date: string;
  countryCode: string;
}

// 展示用假資料
const demoFlights: Flight[] = [
  { id: '1', from: 'TPE', to: 'NRT', fromCity: '台北', toCity: '東京', date: '2024-12-15', countryCode: 'JP' },
  { id: '2', from: 'NRT', to: 'TPE', fromCity: '東京', toCity: '台北', date: '2024-12-20', countryCode: 'TW' },
  { id: '3', from: 'TPE', to: 'ICN', fromCity: '台北', toCity: '首爾', date: '2024-10-01', countryCode: 'KR' },
  { id: '4', from: 'ICN', to: 'TPE', fromCity: '首爾', toCity: '台北', date: '2024-10-05', countryCode: 'TW' },
  { id: '5', from: 'TPE', to: 'BKK', fromCity: '台北', toCity: '曼谷', date: '2024-08-10', countryCode: 'TH' },
  { id: '6', from: 'BKK', to: 'TPE', fromCity: '曼谷', toCity: '台北', date: '2024-08-15', countryCode: 'TW' },
];

// 計算征服國家（排除台灣）
const getConqueredCountries = (flights: Flight[]) => {
  const countries = new Map<string, { count: number; lastDate: string }>();
  flights.forEach((f) => {
    if (f.countryCode !== 'TW') {
      const existing = countries.get(f.countryCode);
      if (existing) {
        existing.count += 1;
        if (f.date > existing.lastDate) existing.lastDate = f.date;
      } else {
        countries.set(f.countryCode, { count: 1, lastDate: f.date });
      }
    }
  });
  return countries;
};

// 按年份分組航班
const groupFlightsByYear = (flights: Flight[]) => {
  const groups = new Map<string, Flight[]>();
  flights.forEach((f) => {
    const year = f.date.substring(0, 4);
    if (!groups.has(year)) groups.set(year, []);
    groups.get(year)!.push(f);
  });
  return Array.from(groups.entries()).sort((a, b) => b[0].localeCompare(a[0]));
};

// 世界地圖 SVG 元件
const WorldMapSVG = ({ countriesArray, countryColors }: {
  countriesArray: [string, { count: number; lastDate: string }][];
  countryColors: Record<string, string>;
}) => (
  <svg viewBox="0 0 380 180" className="w-full h-auto">
    {/* 背景網格點 (稀疏) */}
    <g fill="#3d5266" opacity="0.3">
      {Array.from({ length: 18 }, (_, row) =>
        Array.from({ length: 38 }, (_, col) => (
          <circle key={`bg-${row}-${col}`} cx={col * 10 + 5} cy={row * 10 + 5} r="0.8" />
        ))
      )}
    </g>

    {/* 大陸輪廓點 - 北美洲 */}
    <g fill="#5d7a8c">
      {[[50,25],[55,25],[60,25],[65,25],[45,30],[50,30],[55,30],[60,30],[65,30],[70,30],
        [40,35],[45,35],[50,35],[55,35],[60,35],[65,35],[70,35],[75,35],
        [45,40],[50,40],[55,40],[60,40],[65,40],[70,40],[75,40],[80,40],
        [50,45],[55,45],[60,45],[65,45],[70,45],[75,45],[80,45],
        [55,50],[60,50],[65,50],[70,50],[75,50],[80,50],[85,50],
        [60,55],[65,55],[70,55],[75,55],[80,55],[85,55],
        [70,60],[75,60],[80,60],[85,60],[90,60],
        [75,65],[80,65],[85,65],[90,65],[95,65],
        [80,70],[85,70],[90,70],[95,70],[100,70]
      ].map(([x, y], i) => <circle key={`na-${i}`} cx={x} cy={y} r="1.5" />)}
    </g>

    {/* 大陸輪廓點 - 南美洲 */}
    <g fill="#5d7a8c">
      {[[95,75],[100,75],[85,80],[90,80],[95,80],[100,80],
        [85,85],[90,85],[95,85],[100,85],[105,85],
        [90,90],[95,90],[100,90],[105,90],
        [90,95],[95,95],[100,95],[105,95],
        [90,100],[95,100],[100,100],
        [90,105],[95,105],[100,105],
        [90,110],[95,110],[100,110],
        [90,115],[95,115],
        [90,120],[95,120],
        [90,125],[95,125],
        [90,130]
      ].map(([x, y], i) => <circle key={`sa-${i}`} cx={x} cy={y} r="1.5" />)}
    </g>

    {/* 大陸輪廓點 - 歐洲 */}
    <g fill="#5d7a8c">
      {[[175,30],[180,30],[185,30],[190,30],
        [170,35],[175,35],[180,35],[185,35],[190,35],[195,35],
        [165,40],[170,40],[175,40],[180,40],[185,40],[190,40],[195,40],
        [170,45],[175,45],[180,45],[185,45],[190,45],[195,45],[200,45],
        [175,50],[180,50],[185,50],[190,50],[195,50],[200,50]
      ].map(([x, y], i) => <circle key={`eu-${i}`} cx={x} cy={y} r="1.5" />)}
    </g>

    {/* 大陸輪廓點 - 非洲 */}
    <g fill="#5d7a8c">
      {[[175,60],[180,60],[185,60],[190,60],
        [170,65],[175,65],[180,65],[185,65],[190,65],[195,65],
        [170,70],[175,70],[180,70],[185,70],[190,70],[195,70],[200,70],
        [170,75],[175,75],[180,75],[185,75],[190,75],[195,75],[200,75],
        [175,80],[180,80],[185,80],[190,80],[195,80],
        [180,85],[185,85],[190,85],[195,85],
        [180,90],[185,90],[190,90],[195,90],
        [185,95],[190,95],[195,95],
        [185,100],[190,100],
        [185,105],[190,105],
        [190,110]
      ].map(([x, y], i) => <circle key={`af-${i}`} cx={x} cy={y} r="1.5" />)}
    </g>

    {/* 大陸輪廓點 - 亞洲 (含日本韓國) */}
    <g fill="#5d7a8c">
      {[[200,25],[205,25],[210,25],[215,25],[220,25],[225,25],[230,25],[235,25],[240,25],[245,25],[250,25],[255,25],[260,25],[265,25],[270,25],[275,25],[280,25],
        [200,30],[205,30],[210,30],[215,30],[220,30],[225,30],[230,30],[235,30],[240,30],[245,30],[250,30],[255,30],[260,30],[265,30],[270,30],[275,30],[280,30],[285,30],
        [205,35],[210,35],[215,35],[220,35],[225,35],[230,35],[235,35],[240,35],[245,35],[250,35],[255,35],[260,35],[265,35],[270,35],[275,35],[280,35],[285,35],
        [210,40],[215,40],[220,40],[225,40],[230,40],[235,40],[240,40],[245,40],[250,40],[255,40],[260,40],[265,40],[270,40],[275,40],[280,40],[285,40],[290,40],
        [215,45],[220,45],[225,45],[230,45],[235,45],[240,45],[245,45],[250,45],[255,45],[260,45],[265,45],[270,45],[275,45],[280,45],[285,45],
        [220,50],[225,50],[230,50],[235,50],[240,50],[245,50],[250,50],[255,50],[260,50],[265,50],[270,50],[275,50],[280,50],
        [235,55],[240,55],[245,55],[250,55],[255,55],[260,55],[265,55],[270,55],[275,55],
        [240,60],[245,60],[250,60],[255,60],[260,60],[265,60],[270,60],[275,60],
        [250,65],[255,65],[260,65],[265,65],[270,65],[275,65],[280,65],
        [260,70],[265,70],[270,70],[275,70],[280,70],
        // 韓國半島
        [305,50],[305,55],[308,52],[308,57],
        // 日本列島
        [315,45],[318,48],[320,52],[318,55],[315,58],[320,58],[323,55],[325,50],[322,48]
      ].map(([x, y], i) => <circle key={`as-${i}`} cx={x} cy={y} r="1.5" />)}
    </g>

    {/* 大陸輪廓點 - 澳洲 */}
    <g fill="#5d7a8c">
      {[[285,95],[290,95],[295,95],[300,95],[305,95],
        [285,100],[290,100],[295,100],[300,100],[305,100],[310,100],
        [285,105],[290,105],[295,105],[300,105],[305,105],[310,105],
        [290,110],[295,110],[300,110],[305,110],[310,110],
        [295,115],[300,115],[305,115],[310,115],
        [300,120],[305,120]
      ].map(([x, y], i) => <circle key={`au-${i}`} cx={x} cy={y} r="1.5" />)}
    </g>

    {/* 台灣位置標記 (出發地) */}
    <circle cx="300" cy="66" r="3" fill="#a8bfa6" />
    <circle cx="300" cy="66" r="5" fill="none" stroke="#a8bfa6" strokeWidth="1" opacity="0.5" />

    {/* 征服國家標記 */}
    {countriesArray.map(([code]) => {
      const positions: Record<string, {x: number, y: number}> = {
        JP: {x: 320, y: 52}, KR: {x: 306, y: 54}, TH: {x: 280, y: 74},
        VN: {x: 286, y: 70}, SG: {x: 283, y: 90}, MY: {x: 280, y: 85},
        ID: {x: 295, y: 93}, PH: {x: 301, y: 75}, AU: {x: 297, y: 105},
        US: {x: 72, y: 55}, CA: {x: 60, y: 40}, GB: {x: 179, y: 42},
        FR: {x: 181, y: 48}, DE: {x: 189, y: 44}, IT: {x: 191, y: 52},
        ES: {x: 176, y: 54}, NL: {x: 184, y: 42}, CH: {x: 187, y: 48},
        CN: {x: 270, y: 52}, HK: {x: 293, y: 68}, NZ: {x: 335, y: 125},
        AE: {x: 234, y: 68}, IN: {x: 258, y: 70}, RU: {x: 240, y: 35},
        BR: {x: 95, y: 100}, MX: {x: 75, y: 68}, AR: {x: 90, y: 125}
      };
      const pos = positions[code];
      if (!pos) return null;
      return (
        <g key={code}>
          <circle cx={pos.x} cy={pos.y} r="4" fill={countryColors[code] || '#cfb9a5'} />
          <circle cx={pos.x} cy={pos.y} r="7" fill="none" stroke={countryColors[code] || '#cfb9a5'} strokeWidth="1.5" opacity="0.4">
            <animate attributeName="r" from="4" to="12" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.6" to="0" dur="1.5s" repeatCount="indefinite" />
          </circle>
        </g>
      );
    })}
  </svg>
);

export default function FootprintPage() {
  const { user, initialize, isInitialized } = useAuthStore();
  const [showZoom, setShowZoom] = useState(false);

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [initialize, isInitialized]);

  const isLoggedIn = !!user;
  // TODO: 從資料庫讀取
  const flights = isLoggedIn ? [] : demoFlights;
  const conqueredCountries = getConqueredCountries(flights);
  const flightsByYear = groupFlightsByYear(flights);
  const countriesArray = Array.from(conqueredCountries.entries());

  return (
    <div className="bg-[#F0EEE6] font-sans antialiased text-[#5C5C5C] min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 px-5 pt-12 pb-4 flex items-center justify-between bg-[#F0EEE6]/95 backdrop-blur-md">
        <Link
          href="/my"
          className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-[#5C5C5C] hover:text-[#cfb9a5] transition-colors"
        >
          <span className="material-icons-round text-xl leading-none">arrow_back</span>
        </Link>
        <h1 className="text-lg font-bold text-gray-800 absolute left-1/2 -translate-x-1/2">
          旅行足跡
        </h1>
        <Link
          href="/my/footprint/record"
          className="w-10 h-10 bg-[#cfb9a5] rounded-full shadow-lg shadow-[#cfb9a5]/30 flex items-center justify-center text-white hover:bg-[#b09b88] transition-colors"
        >
          <span className="material-icons-round text-xl leading-none">add</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-28 px-5">
        {/* 世界地圖視覺化 */}
        <div className="rounded-2xl shadow-lg overflow-hidden mb-6">
          {/* 地圖區域 - 點陣式世界地圖 */}
          <button
            onClick={() => setShowZoom(true)}
            className="relative w-full bg-gradient-to-br from-[#2C3E50] to-[#1a252f] p-4 pb-6 cursor-pointer active:opacity-90 transition-opacity"
          >
            <WorldMapSVG countriesArray={countriesArray} countryColors={countryColors} />

            {/* 放大提示 */}
            <div className="absolute bottom-2 right-2 bg-white/20 backdrop-blur-sm text-white/80 px-2 py-1 rounded-lg flex items-center gap-1 text-xs">
              <span className="material-icons-round text-sm leading-none">zoom_in</span>
              點擊放大
            </div>
          </button>

          {/* 統計數字 */}
          <div className="bg-white px-4 py-4">
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#5C5C5C]">{conqueredCountries.size}</div>
                <div className="text-xs text-[#949494]">征服國家</div>
              </div>
              <div className="w-px h-10 bg-gray-200" />
              <div className="text-center">
                <div className="text-3xl font-bold text-[#5C5C5C]">{flights.length}</div>
                <div className="text-xs text-[#949494]">航班紀錄</div>
              </div>
            </div>
          </div>
        </div>

        {/* 放大地圖 Modal */}
        {showZoom && (
          <div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
            onClick={() => setShowZoom(false)}
          >
            <div className="w-full max-w-4xl p-4">
              <div className="bg-gradient-to-br from-[#2C3E50] to-[#1a252f] rounded-2xl p-6 overflow-auto">
                <WorldMapSVG countriesArray={countriesArray} countryColors={countryColors} />
              </div>
              <div className="text-center mt-4 text-white/60 text-sm">
                點擊任意處關閉
              </div>
            </div>
          </div>
        )}

        {/* 航班紀錄 */}
        <section>
          <h3 className="text-xs font-bold text-[#949494] uppercase tracking-wider mb-3 px-1">
            航班紀錄
          </h3>

          {flightsByYear.length > 0 ? (
            <div className="space-y-4">
              {flightsByYear.map(([year, yearFlights]) => (
                <div key={year}>
                  <div className="text-sm font-bold text-[#5C5C5C] mb-2 px-1">{year}</div>
                  <div className="space-y-2">
                    {yearFlights.map((flight) => (
                      <div
                        key={flight.id}
                        className="bg-white rounded-2xl shadow-sm p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="text-center">
                              <div className="text-lg font-bold text-[#5C5C5C]">{flight.from}</div>
                              <div className="text-[10px] text-[#949494]">{flight.fromCity}</div>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-[#cfb9a5] flex items-center justify-center shrink-0">
                              <span className="material-icons-round text-white text-sm leading-none">arrow_forward</span>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-[#5C5C5C]">{flight.to}</div>
                              <div className="text-[10px] text-[#949494]">{flight.toCity}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[8px] font-bold"
                              style={{ backgroundColor: countryColors[flight.countryCode] || '#cfb9a5' }}
                            >
                              {flight.countryCode}
                            </div>
                            <span className="text-xs text-[#949494]">
                              {flight.date.replace(/-/g, '/')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
              <span className="material-icons-round text-4xl text-[#D6CDC8] mb-2 block">flight</span>
              <p className="text-sm text-[#949494] mb-1">還沒有航班紀錄</p>
              <p className="text-xs text-[#B0B0B0]">點擊右上角 + 開始記錄</p>
            </div>
          )}
        </section>
      </main>

      <MobileNav />
    </div>
  );
}
