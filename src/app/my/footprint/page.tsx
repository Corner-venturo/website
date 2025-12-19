'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import MobileNav from '@/components/MobileNav';
import { useAuthStore } from '@/stores/auth-store';
import { countryColors, countryNames } from '@/lib/airports';

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

export default function FootprintPage() {
  const { user, initialize, isInitialized } = useAuthStore();

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

  return (
    <div className="bg-[#F0EEE6] font-sans antialiased text-[#5C5C5C] min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 px-5 pt-12 pb-4 flex items-center justify-between bg-[#F0EEE6]">
        <Link
          href="/my"
          className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-[#5C5C5C] hover:text-[#cfb9a5] transition-colors"
        >
          <span className="material-icons-round text-xl leading-none">arrow_back</span>
        </Link>
        <h1 className="text-lg font-bold text-gray-800 absolute left-1/2 -translate-x-1/2">
          旅行足跡
        </h1>
        <div className="w-10" />
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-36 px-5">
        {/* 統計卡片 */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
            <div className="text-3xl font-bold text-[#5C5C5C]">{conqueredCountries.size}</div>
            <div className="text-xs text-[#949494]">征服國家</div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
            <div className="text-3xl font-bold text-[#5C5C5C]">{flights.length}</div>
            <div className="text-xs text-[#949494]">航班紀錄</div>
          </div>
        </div>

        {/* 征服國家列表 */}
        {conqueredCountries.size > 0 && (
          <section className="mb-6">
            <h3 className="text-xs font-bold text-[#949494] uppercase tracking-wider mb-3 px-1">
              征服國家
            </h3>
            <div className="flex flex-wrap gap-2">
              {Array.from(conqueredCountries.entries()).map(([code, data]) => (
                <div
                  key={code}
                  className="flex items-center gap-2 px-3 py-2 bg-white rounded-full shadow-sm"
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                    style={{ backgroundColor: countryColors[code] || '#cfb9a5' }}
                  >
                    {code}
                  </div>
                  <span className="text-sm font-medium text-[#5C5C5C]">
                    {countryNames[code] || code}
                  </span>
                  <span className="text-xs text-[#949494]">×{data.count}</span>
                </div>
              ))}
            </div>
          </section>
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
              <p className="text-xs text-[#B0B0B0]">開始記錄你的旅行吧！</p>
            </div>
          )}
        </section>
      </main>

      {/* 底部按鈕 */}
      <div className="fixed bottom-24 left-0 w-full px-5 pb-4 bg-gradient-to-t from-[#F0EEE6] via-[#F0EEE6] to-transparent z-40 pt-8">
        <Link
          href="/my/footprint/record"
          className="w-full py-3.5 rounded-2xl bg-[#cfb9a5] text-white font-bold shadow-lg shadow-[#cfb9a5]/30 flex items-center justify-center gap-2 hover:bg-[#b09b88] transition active:scale-95"
        >
          <span className="material-icons-round">add</span>
          記錄航班
        </Link>
      </div>

      <MobileNav />
    </div>
  );
}
