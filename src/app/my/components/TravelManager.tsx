'use client';

import Link from 'next/link';

interface Flight {
  id: string;
  from: string;
  to: string;
  date: string;
  country: string;
}

interface TravelManagerProps {
  isLoggedIn: boolean;
}

// 展示用假資料
const demoFlights: Flight[] = [
  { id: '1', from: 'TPE', to: 'NRT', date: '2024/12/15', country: 'JP' },
  { id: '2', from: 'NRT', to: 'TPE', date: '2024/12/20', country: 'TW' },
  { id: '3', from: 'TPE', to: 'ICN', date: '2024/10/01', country: 'KR' },
];

// 從航班計算征服國家數（排除出發地台灣）
const getConqueredCountries = (flights: Flight[]) => {
  const countries = new Set(flights.map(f => f.country).filter(c => c !== 'TW'));
  return countries.size;
};

export default function TravelManager({ isLoggedIn }: TravelManagerProps) {
  // TODO: 從資料庫讀取使用者的航班記錄
  const flights = isLoggedIn ? [] : demoFlights;
  const conqueredCount = getConqueredCountries(flights);
  const recentFlight = flights[0];

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      {/* 標題列 */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-[#5C5C5C] flex items-center gap-2">
          <span className="material-icons-round text-[#a5bccf] text-lg">flight</span>
          旅行管家
        </h3>
        <Link
          href="/my/footprint"
          className="text-xs text-[#949494] hover:text-[#cfb9a5] flex items-center transition-colors"
        >
          查看全部
          <span className="material-icons-round text-sm">chevron_right</span>
        </Link>
      </div>

      {/* 統計區 */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1 bg-[#F7F5F2] rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-[#5C5C5C]">{conqueredCount}</div>
          <div className="text-xs text-[#949494]">征服國家</div>
        </div>
        <div className="flex-1 bg-[#F7F5F2] rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-[#5C5C5C]">{flights.length}</div>
          <div className="text-xs text-[#949494]">航班紀錄</div>
        </div>
      </div>

      {/* 最近航班 */}
      {recentFlight ? (
        <div className="bg-[#F7F5F2] rounded-2xl p-4 mb-4">
          <div className="text-xs text-[#949494] mb-2">最近航班</div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-[#5C5C5C]">{recentFlight.from}</span>
              <div className="w-8 h-8 rounded-full bg-[#cfb9a5] flex items-center justify-center shrink-0">
                <span className="material-icons-round text-white text-sm leading-none">arrow_forward</span>
              </div>
              <span className="text-lg font-bold text-[#5C5C5C]">{recentFlight.to}</span>
            </div>
            <span className="text-xs text-[#949494]">{recentFlight.date}</span>
          </div>
        </div>
      ) : (
        <div className="bg-[#F7F5F2] rounded-2xl p-4 mb-4 text-center">
          <p className="text-sm text-[#949494]">還沒有航班紀錄</p>
        </div>
      )}

      {/* 記錄航班按鈕 */}
      <Link
        href="/my/footprint/record"
        className="w-full py-3 rounded-2xl bg-[#cfb9a5] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#cfb9a5]/30 hover:bg-[#b09b88] transition active:scale-95"
      >
        <span className="material-icons-round text-lg">add</span>
        記錄航班
      </Link>
    </div>
  );
}
