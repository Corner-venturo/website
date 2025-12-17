'use client';

import Link from 'next/link';

const flightInfo = {
  airline: '星宇航空',
  flightNumber: 'JX850',
  aircraft: 'Airbus A330',
  status: '準時起飛',
  departure: {
    time: '08:30',
    code: 'TPE',
    terminal: '台北桃園 T1',
  },
  arrival: {
    time: '12:10',
    code: 'KIX',
    terminal: '大阪關西 T1',
  },
  date: '11月15日',
  duration: '2h 40m',
  gate: 'B6',
  seat: '12A',
  baggage: '23kg x 2',
  carryOn: '7kg x 1',
  meal: '標準餐',
  cabin: '經濟艙 (Q)',
  pnr: '6X2K9L',
  ticket: '695-234891002',
};

const reminders = [
  '請於起飛前 2 小時抵達機場辦理登機手續。',
  '您的登機門可能會臨時變更，請隨時留意機場廣播。',
  '目的地大阪目前氣溫 12°C，建議攜帶薄外套。',
];

function DesktopHeader() {
  return (
    <header className="flex-shrink-0 flex items-center justify-between py-4 px-8 bg-white/80 backdrop-blur-2xl rounded-2xl border border-white/50 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.06)] mb-6">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#D6CDC8] text-white font-bold flex items-center justify-center">V</div>
          <span className="text-xl font-bold text-[#5C5C5C]">VENTURO</span>
        </Link>
        <nav className="flex items-center gap-8 ml-12">
          <Link href="/" className="text-[#949494] hover:text-[#5C5C5C] transition">首頁</Link>
          <Link href="/explore" className="text-[#949494] hover:text-[#5C5C5C] transition">探索</Link>
          <Link href="/orders" className="text-[#94A3B8] font-medium border-b-2 border-[#94A3B8] pb-1">訂單</Link>
          <Link href="/wishlist" className="text-[#949494] hover:text-[#5C5C5C] transition">收藏</Link>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-full hover:bg-black/5 transition-colors">
          <span className="material-icons-round text-[#949494]">notifications_none</span>
        </button>
        <Link href="/my" className="flex items-center gap-3 px-4 py-2 bg-white/60 rounded-full border border-white/40 hover:bg-white/80 transition">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#E8DED5] to-[#C9B8A8] flex items-center justify-center">
            <span className="text-white text-sm font-medium">W</span>
          </div>
          <span className="text-sm font-medium text-[#5C5C5C]">William</span>
        </Link>
      </div>
    </header>
  );
}

function FlightInfoCard() {
  return (
    <div className="glass-card rounded-3xl p-6 relative overflow-hidden shadow-soft">
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-morandi-blue/10 rounded-full blur-2xl pointer-events-none" />
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-gray-800 text-2xl">airlines</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-lg text-gray-800">{flightInfo.airline}</h2>
            </div>
            <div className="text-xs font-medium text-gray-500">
              {flightInfo.flightNumber} · {flightInfo.aircraft}
            </div>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full bg-[#E8F5E9] text-green-700 text-xs font-bold flex items-center gap-1 border border-green-100">
          <span className="material-icons-round text-sm">check_circle</span>
          {flightInfo.status}
        </span>
      </div>

      <div className="flex justify-between items-center text-center mb-6 relative z-10">
        <div className="text-left w-1/3">
          <div className="text-4xl font-bold text-gray-800 mb-1 tracking-tight">{flightInfo.departure.time}</div>
          <div className="text-xl font-bold text-primary">{flightInfo.departure.code}</div>
          <div className="text-xs text-gray-400 mt-1">{flightInfo.departure.terminal}</div>
        </div>
        <div className="flex-1 px-2 flex flex-col items-center">
          <div className="text-[10px] text-gray-400 font-medium mb-1 uppercase tracking-wide">{flightInfo.duration}</div>
          <div className="w-full h-[2px] bg-gray-200 relative flex items-center justify-between">
            <div className="w-2 h-2 rounded-full bg-gray-400 border-2 border-white" />
            <span className="material-icons-round text-primary text-xl absolute left-1/2 -translate-x-1/2 -rotate-90 bg-white/50 backdrop-blur-sm px-1 rounded-full">flight</span>
            <div className="w-2 h-2 rounded-full bg-gray-400 border-2 border-white" />
          </div>
          <div className="text-[10px] text-primary font-bold mt-1 bg-primary/10 px-2 py-0.5 rounded-md">{flightInfo.date}</div>
        </div>
        <div className="text-right w-1/3">
          <div className="text-4xl font-bold text-gray-800 mb-1 tracking-tight">{flightInfo.arrival.time}</div>
          <div className="text-xl font-bold text-primary">{flightInfo.arrival.code}</div>
          <div className="text-xs text-gray-400 mt-1">{flightInfo.arrival.terminal}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 relative z-10">
        <div className="bg-white/50 border border-white/50 rounded-2xl py-3 px-4 flex justify-between items-center">
          <span className="text-xs text-gray-500">登機門</span>
          <span className="text-xl font-bold text-gray-800">{flightInfo.gate}</span>
        </div>
        <div className="bg-white/50 border border-white/50 rounded-2xl py-3 px-4 flex justify-between items-center">
          <span className="text-xs text-gray-500">座位</span>
          <span className="text-xl font-bold text-gray-800">{flightInfo.seat}</span>
        </div>
      </div>
    </div>
  );
}

function PNRCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
      <div className="p-5 relative z-10">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-[10px] text-gray-400 mb-1 uppercase tracking-wider font-bold">訂位代號 (PNR)</div>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-mono font-bold text-gray-800 tracking-widest">{flightInfo.pnr}</span>
              <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-primary transition-colors" aria-label="複製 PNR">
                <span className="material-icons-round text-base">content_copy</span>
              </button>
            </div>
          </div>
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
            <span className="material-icons-round text-2xl text-gray-400">qr_code_2</span>
          </div>
        </div>
      </div>
      <div className="relative flex items-center justify-center px-2">
        <div className="absolute left-0 w-4 h-8 bg-[#F0EEE6] rounded-r-full -ml-2" />
        <div className="absolute right-0 w-4 h-8 bg-[#F0EEE6] rounded-l-full -mr-2" />
        <div className="w-full border-t-2 border-dashed border-gray-200 h-px" />
      </div>
      <button className="w-full p-4 flex justify-between items-center hover:bg-gray-50 transition-colors" aria-label="查看電子機票">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-icons-round text-sm">confirmation_number</span>
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-gray-700">電子機票 ({flightInfo.ticket})</div>
            <div className="text-[10px] text-gray-400">點擊查看或下載 PDF</div>
          </div>
        </div>
        <span className="material-icons-round text-gray-300 text-lg">chevron_right</span>
      </button>
    </div>
  );
}

function DetailCards() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="glass-card p-4 rounded-2xl flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-morandi-blue/20 flex items-center justify-center shrink-0">
          <span className="material-icons-round text-morandi-blue text-sm">luggage</span>
        </div>
        <div>
          <div className="text-[10px] text-gray-500 mb-0.5">托運行李</div>
          <div className="text-sm font-bold text-gray-800">{flightInfo.baggage}</div>
        </div>
      </div>
      <div className="glass-card p-4 rounded-2xl flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-morandi-green/20 flex items-center justify-center shrink-0">
          <span className="material-icons-round text-morandi-green text-sm">backpack</span>
        </div>
        <div>
          <div className="text-[10px] text-gray-500 mb-0.5">手提行李</div>
          <div className="text-sm font-bold text-gray-800">{flightInfo.carryOn}</div>
        </div>
      </div>
      <div className="glass-card p-4 rounded-2xl flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-morandi-pink/20 flex items-center justify-center shrink-0">
          <span className="material-icons-round text-morandi-pink text-sm">restaurant</span>
        </div>
        <div>
          <div className="text-[10px] text-gray-500 mb-0.5">機上餐點</div>
          <div className="text-sm font-bold text-gray-800">{flightInfo.meal}</div>
        </div>
      </div>
      <div className="glass-card p-4 rounded-2xl flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-morandi-yellow/20 flex items-center justify-center shrink-0">
          <span className="material-icons-round text-yellow-600 text-sm">airline_seat_recline_extra</span>
        </div>
        <div>
          <div className="text-[10px] text-gray-500 mb-0.5">艙等</div>
          <div className="text-sm font-bold text-gray-800">{flightInfo.cabin}</div>
        </div>
      </div>
    </div>
  );
}

function RemindersCard() {
  return (
    <div className="bg-[#FDFCF8] p-5 rounded-2xl border border-primary/20 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-16 h-16 bg-morandi-yellow/10 rounded-bl-full -mr-4 -mt-4" />
      <div className="flex items-center gap-2 mb-3 relative z-10">
        <span className="material-icons-round text-primary">tips_and_updates</span>
        <span className="font-bold text-sm text-gray-700">重要提示</span>
      </div>
      <ul className="text-xs text-gray-500 space-y-2.5 list-none relative z-10">
        {reminders.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function FlightDetailPage() {
  return (
    <div className="bg-[#F0EEE6] text-gray-900 min-h-screen font-sans relative overflow-hidden">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[#EFEFE8]" />
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-morandi-blue/20 rounded-full blur-3xl" />
        <div className="absolute bottom-[20%] left-[-10%] w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
      </div>

      {/* Desktop Layout */}
      <div className="hidden xl:flex relative z-10 min-h-screen flex-col p-6">
        <DesktopHeader />

        <div className="flex-1 grid grid-cols-12 gap-6">
          {/* Left Panel - Flight Info */}
          <div className="col-span-7 space-y-5">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-lg border border-white/50">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Link
                    href="/orders"
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:text-primary transition-colors"
                  >
                    <span className="material-icons-round text-xl">arrow_back</span>
                  </Link>
                  <h1 className="text-2xl font-bold text-gray-800">航班詳情</h1>
                </div>
                <button className="text-sm font-medium text-primary flex items-center gap-1 bg-primary/10 px-4 py-2 rounded-lg hover:bg-primary/20 transition">
                  <span className="material-icons-round text-base">map</span>
                  航班追蹤
                </button>
              </div>

              <FlightInfoCard />
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-lg border border-white/50">
              <h3 className="text-sm font-bold text-gray-800 mb-4">詳細資訊</h3>
              <DetailCards />
            </div>
          </div>

          {/* Right Panel - PNR & Actions */}
          <div className="col-span-5 space-y-5">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-lg border border-white/50">
              <PNRCard />
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-lg border border-white/50">
              <RemindersCard />
            </div>

            <div className="flex gap-3">
              <button className="flex-1 py-3.5 rounded-2xl bg-white text-gray-600 font-bold text-sm shadow-sm border border-gray-200 hover:bg-gray-50 transition-all active:scale-95">
                查看憑證
              </button>
              <button className="flex-[2] py-3.5 rounded-2xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/30 flex items-center justify-center gap-2 hover:bg-primary/90 transition-all active:scale-95">
                <span className="material-icons-round">qr_code_scanner</span>
                前往登機
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="xl:hidden relative z-10 max-w-xl mx-auto flex flex-col min-h-screen">
        <header className="px-6 pt-12 pb-4 flex items-center justify-between">
          <Link
            href="/orders"
            className="glass w-10 h-10 flex items-center justify-center rounded-full shadow-sm text-gray-600 hover:text-primary transition-colors"
            aria-label="返回訂單"
          >
            <span className="material-icons-round text-xl">arrow_back</span>
          </Link>
          <h1 className="text-lg font-bold text-gray-800 tracking-tight">航班詳情</h1>
          <div className="w-10" />
        </header>

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

          <DetailCards />
          <RemindersCard />
        </main>

        <div className="fixed bottom-0 left-0 right-0 z-50 p-6 bg-gradient-to-t from-[#F0EEE6] via-[#F0EEE6]/95 to-transparent pointer-events-none">
          <div className="pointer-events-auto flex gap-3 max-w-md mx-auto w-full">
            <button className="flex-1 py-3.5 rounded-2xl bg-white text-gray-600 font-bold text-sm shadow-sm border border-gray-200 hover:bg-gray-50 transition-all active:scale-95">
              查看憑證
            </button>
            <button className="flex-[2] py-3.5 rounded-2xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/30 flex items-center justify-center gap-2 hover:bg-primary-dark transition-all active:scale-95">
              <span className="material-icons-round">qr_code_scanner</span>
              前往登機
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
