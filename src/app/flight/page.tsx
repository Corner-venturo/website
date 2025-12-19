'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { stayInfo } from './constants';
import {
  FlightInfoCard,
  PNRCard,
  FlightDetailCards,
  FlightRemindersCard,
  HotelInfoCard,
  BookingIdCard,
  StayDetailCards,
  StayRemindersCard,
} from './components';

function FlightDetailContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'flight' | 'stay'>('flight');
  const [showMapOptions, setShowMapOptions] = useState(false);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'stay') {
      setActiveTab('stay');
    }
  }, [searchParams]);

  const openGoogleMaps = () => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stayInfo.address)}`, '_blank');
    setShowMapOptions(false);
  };

  const openAppleMaps = () => {
    window.open(`https://maps.apple.com/?q=${encodeURIComponent(stayInfo.address)}`, '_blank');
    setShowMapOptions(false);
  };

  return (
    <div className="bg-[#F0EEE6] text-gray-900 min-h-screen font-sans relative overflow-hidden">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[#EFEFE8]" />
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-morandi-blue/20 rounded-full blur-3xl" />
        <div className="absolute bottom-[20%] left-[-10%] w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
      </div>

      {/* Map Selection Modal */}
      {showMapOptions && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowMapOptions(false)}
          />
          <div className="relative w-full max-w-md mx-4 mb-8 bg-white rounded-3xl overflow-hidden shadow-2xl animate-slide-up">
            <div className="p-5 text-center border-b border-gray-100">
              <h3 className="font-bold text-gray-800">選擇地圖應用</h3>
              <p className="text-xs text-gray-500 mt-1">導航至 {stayInfo.name}</p>
            </div>
            <div className="p-3 space-y-2">
              <button
                onClick={openGoogleMaps}
                className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-[#4285F4]/10 flex items-center justify-center">
                  <span className="material-icons-round text-[#4285F4] text-2xl">map</span>
                </div>
                <div className="text-left">
                  <div className="font-bold text-gray-800">Google Maps</div>
                  <div className="text-xs text-gray-500">在 Google 地圖中開啟</div>
                </div>
                <span className="material-icons-round text-gray-300 ml-auto">chevron_right</span>
              </button>
              <button
                onClick={openAppleMaps}
                className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                  <span className="material-icons-round text-gray-600 text-2xl">explore</span>
                </div>
                <div className="text-left">
                  <div className="font-bold text-gray-800">Apple Maps</div>
                  <div className="text-xs text-gray-500">在 Apple 地圖中開啟</div>
                </div>
                <span className="material-icons-round text-gray-300 ml-auto">chevron_right</span>
              </button>
            </div>
            <div className="p-3 pt-0">
              <button
                onClick={() => setShowMapOptions(false)}
                className="w-full py-3.5 rounded-2xl bg-gray-100 text-gray-600 font-bold text-sm hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Layout */}
      <div className="relative z-10 max-w-xl mx-auto flex flex-col min-h-screen">
        <header className="px-6 pt-6 pb-4 flex items-center gap-3">
          <Link
            href="/orders"
            className="glass w-10 h-10 flex items-center justify-center rounded-full shadow-sm text-gray-600 hover:text-primary transition-colors shrink-0"
            aria-label="返回訂單"
          >
            <span className="material-icons-round text-xl">arrow_back</span>
          </Link>
          <div className="flex-1 flex bg-white/60 backdrop-blur-sm rounded-full p-1 border border-white/40">
            <button
              onClick={() => setActiveTab('flight')}
              className={`flex-1 py-2 px-4 rounded-full text-sm font-bold transition-all ${
                activeTab === 'flight'
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-500'
              }`}
            >
              航班資訊
            </button>
            <button
              onClick={() => setActiveTab('stay')}
              className={`flex-1 py-2 px-4 rounded-full text-sm font-bold transition-all ${
                activeTab === 'stay'
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-500'
              }`}
            >
              住宿資訊
            </button>
          </div>
        </header>

        {/* Flight Content */}
        {activeTab === 'flight' && (
          <main className="flex-1 w-full h-full overflow-y-auto hide-scrollbar pb-32 px-6 pt-2 space-y-5">
            <FlightInfoCard />
            <PNRCard />

            <div className="flex items-center justify-between mb-1 px-1">
              <h3 className="text-sm font-bold text-gray-800">詳細資訊</h3>
              <button className="text-[10px] font-medium text-primary flex items-center gap-1 bg-white/50 px-2 py-1 rounded-lg" aria-label="航班追蹤">
                <span className="material-icons-round text-[12px]">map</span>
                航班追蹤
              </button>
            </div>

            <FlightDetailCards />
            <FlightRemindersCard />
          </main>
        )}

        {/* Stay Content */}
        {activeTab === 'stay' && (
          <main className="flex-1 w-full h-full overflow-y-auto hide-scrollbar pb-32 px-6 pt-2 space-y-5">
            <HotelInfoCard onMapClick={() => setShowMapOptions(true)} />
            <BookingIdCard />

            <div className="flex items-center justify-between mb-1 px-1">
              <h3 className="text-sm font-bold text-gray-800">詳細資訊</h3>
            </div>

            <StayDetailCards />
            <StayRemindersCard />
          </main>
        )}

        {/* Bottom Actions */}
        <div className="fixed bottom-0 left-0 right-0 z-50 p-6 bg-gradient-to-t from-[#F0EEE6] via-[#F0EEE6]/95 to-transparent pointer-events-none">
          <div className="pointer-events-auto flex gap-3 max-w-md mx-auto w-full">
            {activeTab === 'flight' ? (
              <>
                <button className="flex-1 py-3.5 rounded-2xl bg-white text-gray-600 font-bold text-sm shadow-sm border border-gray-200 hover:bg-gray-50 transition-all active:scale-95">
                  查看憑證
                </button>
                <button className="flex-[2] py-3.5 rounded-2xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/30 flex items-center justify-center gap-2 hover:bg-primary-dark transition-all active:scale-95">
                  <span className="material-icons-round">qr_code_scanner</span>
                  前往登機
                </button>
              </>
            ) : (
              <>
                <button className="flex-1 py-3.5 rounded-2xl bg-white text-gray-600 font-bold text-sm shadow-sm border border-gray-200 hover:bg-gray-50 transition-all active:scale-95 flex items-center justify-center gap-2">
                  <span className="material-icons-round text-base">receipt_long</span>
                  查看憑證
                </button>
                <button className="flex-[2] py-3.5 rounded-2xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/30 flex items-center justify-center gap-2 hover:bg-primary-dark transition-all active:scale-95">
                  <span className="material-icons-round text-base">support_agent</span>
                  聯絡酒店
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FlightDetailPage() {
  return (
    <Suspense fallback={
      <div className="bg-[#F0EEE6] min-h-screen flex items-center justify-center">
        <div className="text-gray-500">載入中...</div>
      </div>
    }>
      <FlightDetailContent />
    </Suspense>
  );
}
