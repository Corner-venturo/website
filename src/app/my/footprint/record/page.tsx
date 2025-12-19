'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import MobileNav from '@/components/MobileNav';
import { useAuthStore } from '@/stores/auth-store';
import { Airport, searchAirports, countryColors } from '@/lib/airports';

interface FlightSegment {
  id: string;
  from: Airport | null;
  to: Airport | null;
  date: string;
}

export default function RecordFlightPage() {
  const router = useRouter();
  const { user, initialize, isInitialized } = useAuthStore();

  const [segments, setSegments] = useState<FlightSegment[]>([
    { id: '1', from: null, to: null, date: new Date().toISOString().split('T')[0] },
  ]);
  const [activeInput, setActiveInput] = useState<{ segmentId: string; field: 'from' | 'to' } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Airport[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [initialize, isInitialized]);

  useEffect(() => {
    if (searchQuery.length >= 1) {
      const results = searchAirports(searchQuery);
      setSearchResults(results.slice(0, 8));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleInputFocus = (segmentId: string, field: 'from' | 'to') => {
    setActiveInput({ segmentId, field });
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSelectAirport = (airport: Airport) => {
    if (!activeInput) return;

    setSegments((prev) =>
      prev.map((s) =>
        s.id === activeInput.segmentId ? { ...s, [activeInput.field]: airport } : s
      )
    );
    setActiveInput(null);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleDateChange = (segmentId: string, date: string) => {
    setSegments((prev) =>
      prev.map((s) => (s.id === segmentId ? { ...s, date } : s))
    );
  };

  const addSegment = () => {
    const lastSegment = segments[segments.length - 1];
    setSegments([
      ...segments,
      {
        id: Date.now().toString(),
        from: lastSegment?.to || null, // 自動填入上一段的目的地
        to: null,
        date: lastSegment?.date || new Date().toISOString().split('T')[0],
      },
    ]);
  };

  const removeSegment = (id: string) => {
    if (segments.length > 1) {
      setSegments(segments.filter((s) => s.id !== id));
    }
  };

  const isValid = segments.every((s) => s.from && s.to && s.date);

  const handleSave = async () => {
    if (!isValid) return;

    setIsSaving(true);
    // TODO: 儲存到資料庫
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSaving(false);
    router.push('/my/footprint');
  };

  return (
    <div className="bg-[#F0EEE6] font-sans antialiased text-[#5C5C5C] min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 px-5 pt-12 pb-4 flex items-center justify-between bg-[#F0EEE6]">
        <Link
          href="/my/footprint"
          className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-[#5C5C5C] hover:text-[#cfb9a5] transition-colors"
        >
          <span className="material-icons-round text-xl leading-none">arrow_back</span>
        </Link>
        <h1 className="text-lg font-bold text-gray-800 absolute left-1/2 -translate-x-1/2">
          記錄航班
        </h1>
        <div className="w-10" />
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-36 px-5">
        {/* 航段列表 */}
        <div className="space-y-4">
          {segments.map((segment, index) => (
            <div key={segment.id} className="bg-white rounded-2xl shadow-sm p-5">
              {/* 航段標題 */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="material-icons-round text-[#a5bccf] text-lg">flight</span>
                  <span className="text-sm font-bold text-[#5C5C5C]">航段 {index + 1}</span>
                </div>
                {segments.length > 1 && (
                  <button
                    onClick={() => removeSegment(segment.id)}
                    className="w-8 h-8 rounded-full text-[#949494] hover:text-[#cfa5a5] hover:bg-[#cfa5a5]/10 flex items-center justify-center transition-colors"
                  >
                    <span className="material-icons-round text-lg">close</span>
                  </button>
                )}
              </div>

              {/* 出發地 → 目的地 */}
              <div className="flex items-center gap-3 mb-4">
                {/* 出發地 */}
                <button
                  onClick={() => handleInputFocus(segment.id, 'from')}
                  className={`flex-1 rounded-2xl p-4 text-left transition-all ${
                    activeInput?.segmentId === segment.id && activeInput?.field === 'from'
                      ? 'bg-[#cfb9a5]/10 ring-2 ring-[#cfb9a5]'
                      : 'bg-[#F7F5F2]'
                  }`}
                >
                  {segment.from ? (
                    <div>
                      <div className="text-xl font-bold text-[#5C5C5C]">{segment.from.code}</div>
                      <div className="text-xs text-[#949494]">{segment.from.city}</div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-lg font-medium text-[#B0B0B0]">出發地</div>
                      <div className="text-xs text-[#C0C0C0]">點擊選擇機場</div>
                    </div>
                  )}
                </button>

                {/* 箭頭 */}
                <div className="w-10 h-10 rounded-full bg-[#cfb9a5] flex items-center justify-center shadow-sm shrink-0">
                  <span className="material-icons-round text-white leading-none">arrow_forward</span>
                </div>

                {/* 目的地 */}
                <button
                  onClick={() => handleInputFocus(segment.id, 'to')}
                  className={`flex-1 rounded-2xl p-4 text-left transition-all ${
                    activeInput?.segmentId === segment.id && activeInput?.field === 'to'
                      ? 'bg-[#cfb9a5]/10 ring-2 ring-[#cfb9a5]'
                      : 'bg-[#F7F5F2]'
                  }`}
                >
                  {segment.to ? (
                    <div>
                      <div className="text-xl font-bold text-[#5C5C5C]">{segment.to.code}</div>
                      <div className="text-xs text-[#949494]">{segment.to.city}</div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-lg font-medium text-[#B0B0B0]">目的地</div>
                      <div className="text-xs text-[#C0C0C0]">點擊選擇機場</div>
                    </div>
                  )}
                </button>
              </div>

              {/* 日期 */}
              <div>
                <label className="text-xs text-[#949494] mb-1 block">出發日期</label>
                <input
                  type="date"
                  value={segment.date}
                  onChange={(e) => handleDateChange(segment.id, e.target.value)}
                  className="w-full rounded-2xl bg-[#F7F5F2] py-3 px-4 text-sm text-[#5C5C5C] focus:outline-none focus:ring-2 focus:ring-[#cfb9a5]/50"
                />
              </div>
            </div>
          ))}
        </div>

        {/* 新增航段按鈕 */}
        <button
          onClick={addSegment}
          className="w-full mt-4 py-3 rounded-2xl border-2 border-dashed border-[#D8D0C9] text-[#949494] hover:border-[#cfb9a5] hover:text-[#cfb9a5] flex items-center justify-center gap-2 transition-colors"
        >
          <span className="material-icons-round">add</span>
          新增航段（轉機/回程）
        </button>
      </main>

      {/* 機場搜尋面板 */}
      {activeInput && (
        <div className="fixed inset-0 z-50 bg-[#F0EEE6]">
          {/* 搜尋 Header */}
          <header className="px-5 pt-12 pb-4 flex items-center gap-3 bg-[#F0EEE6]">
            <button
              onClick={() => {
                setActiveInput(null);
                setSearchQuery('');
              }}
              className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-[#5C5C5C]"
            >
              <span className="material-icons-round text-xl leading-none">arrow_back</span>
            </button>
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜尋機場代碼、城市..."
                autoFocus
                className="w-full rounded-2xl bg-white py-3 px-4 pr-10 text-sm text-[#5C5C5C] placeholder-[#B0B0B0] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#cfb9a5]/50"
              />
              <span className="material-icons-round absolute right-4 top-1/2 -translate-y-1/2 text-[#949494]">
                search
              </span>
            </div>
          </header>

          {/* 搜尋結果 */}
          <div className="px-5 overflow-y-auto" style={{ height: 'calc(100vh - 100px)' }}>
            {searchResults.length > 0 ? (
              <div className="space-y-2">
                {searchResults.map((airport) => (
                  <button
                    key={airport.code}
                    onClick={() => handleSelectAirport(airport)}
                    className="w-full bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4 hover:bg-[#F7F5F2] transition-colors text-left"
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: countryColors[airport.countryCode] || '#cfb9a5' }}
                    >
                      {airport.code}
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-bold text-[#5C5C5C]">{airport.city}</div>
                      <div className="text-xs text-[#949494]">{airport.name}</div>
                    </div>
                    <div className="text-xs text-[#949494]">{airport.country}</div>
                  </button>
                ))}
              </div>
            ) : searchQuery ? (
              <div className="text-center py-12">
                <span className="material-icons-round text-4xl text-[#D6CDC8] mb-2 block">search_off</span>
                <p className="text-sm text-[#949494]">找不到符合的機場</p>
              </div>
            ) : (
              <div className="text-center py-12">
                <span className="material-icons-round text-4xl text-[#D6CDC8] mb-2 block">flight_takeoff</span>
                <p className="text-sm text-[#949494]">輸入機場代碼或城市名稱</p>
                <p className="text-xs text-[#B0B0B0] mt-1">例如：TPE、東京、Bangkok</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 底部儲存按鈕 */}
      <div className="fixed bottom-24 left-0 w-full px-5 pb-4 bg-gradient-to-t from-[#F0EEE6] via-[#F0EEE6] to-transparent z-40 pt-8">
        <button
          onClick={handleSave}
          disabled={!isValid || isSaving}
          className={`w-full py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${
            isValid && !isSaving
              ? 'bg-[#cfb9a5] text-white shadow-lg shadow-[#cfb9a5]/30 hover:bg-[#b09b88]'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isSaving ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              儲存中...
            </>
          ) : (
            <>
              <span className="material-icons-round">check</span>
              儲存航班
            </>
          )}
        </button>
      </div>

      <MobileNav />
    </div>
  );
}
