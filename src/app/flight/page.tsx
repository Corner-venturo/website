'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
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

const flightReminders = [
  '請於起飛前 2 小時抵達機場辦理登機手續。',
  '您的登機門可能會臨時變更，請隨時留意機場廣播。',
  '目的地大阪目前氣溫 12°C，建議攜帶薄外套。',
];

const stayInfo = {
  name: '大阪世紀酒店',
  rating: 4.8,
  stars: 5,
  image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuClBiVIO27lB5T_e3zUwyvCEhHPfUhyTj0ibF8BChYP5w0jvIWuSjdZkC7WKDcGya2FoRoFv-8N2ZDWoSQxApXRWutSDjTemfsUH7vAVEkLhLmv_ARuwjx8zElBSJ9fWF_phbItOYF34CnG4WXC5Ssc1XBGhfVKbJrD5a5_G8yBg9Rkpx66EtQM2WK1H1gXwsyN8ImLv4APjuyXZXcWmqJt71DvfAgdrctkBrZbUDVh6n6CS4xQyoc8fY8sonBs31MvWKi6syze9wax',
  address: '大阪府大阪市北區大深町 3-1',
  checkIn: { date: '11月15日', day: '週五', time: '15:00' },
  checkOut: { date: '11月18日', day: '週一', time: '11:00' },
  nights: 3,
  bookingId: 'HTL-88293',
  roomType: '豪華雙人房',
  bedType: '大床 x 1',
  guests: '2 位成人',
  requests: ['包含早餐', '高樓層房'],
  paymentStatus: '已付款',
  phone: '+81 6-1234-5678',
};

const stayReminders = [
  '入住時間：15:00 後，退房時間：11:00 前。',
  '辦理入住時請出示護照與入住憑證。',
  '飯店禁止攜帶寵物（導盲犬除外）。',
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

// ===== Flight Components =====
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
        <span className="text-sm font-medium text-gray-500">
          {flightInfo.date}
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
            <div className="w-2 h-2 rounded-full bg-gray-400 border-2 border-white" />
          </div>
          <span className="material-icons-round text-primary text-sm mt-1 rotate-90">flight</span>
        </div>
        <div className="text-right w-1/3">
          <div className="text-4xl font-bold text-gray-800 mb-1 tracking-tight">{flightInfo.arrival.time}</div>
          <div className="text-xl font-bold text-primary">{flightInfo.arrival.code}</div>
          <div className="text-xs text-gray-400 mt-1">{flightInfo.arrival.terminal}</div>
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

function FlightDetailCards() {
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

function FlightRemindersCard() {
  return (
    <div className="bg-[#FDFCF8] p-5 rounded-2xl border border-primary/20 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-16 h-16 bg-morandi-yellow/10 rounded-bl-full -mr-4 -mt-4" />
      <div className="flex items-center gap-2 mb-3 relative z-10">
        <span className="material-icons-round text-primary">tips_and_updates</span>
        <span className="font-bold text-sm text-gray-700">重要提示</span>
      </div>
      <ul className="text-xs text-gray-500 space-y-2.5 list-none relative z-10">
        {flightReminders.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ===== Stay Components =====
function HotelImageGallery() {
  return (
    <div className="relative w-full h-48 rounded-3xl overflow-hidden shadow-soft group">
      <Image
        src={stayInfo.image}
        alt="Hotel Interior"
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, 600px"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
        <div className="w-1.5 h-1.5 rounded-full bg-white/50 backdrop-blur-sm" />
        <div className="w-1.5 h-1.5 rounded-full bg-white/50 backdrop-blur-sm" />
        <div className="w-1.5 h-1.5 rounded-full bg-white/50 backdrop-blur-sm" />
      </div>
      <div className="absolute top-3 right-3 bg-black/30 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-xs font-bold flex items-center gap-1 border border-white/10">
        <span className="material-icons-round text-[14px]">photo_library</span> 1/12
      </div>
    </div>
  );
}

function HotelInfoCard({ onMapClick }: { onMapClick: () => void }) {
  return (
    <div className="glass-card rounded-3xl p-6 relative overflow-hidden shadow-soft">
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-morandi-blue/10 rounded-full blur-2xl pointer-events-none" />
      <div className="mb-5 relative z-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 leading-tight">{stayInfo.name}</h2>
        <div className="flex items-center gap-1">
          <div className="flex text-morandi-yellow text-sm">
            {[...Array(stayInfo.stars)].map((_, i) => (
              <span key={i} className="material-icons-round text-base">star</span>
            ))}
          </div>
          <span className="text-xs text-gray-400 font-medium ml-1">{stayInfo.rating} Excellent</span>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6 relative z-10 bg-white/40 rounded-2xl p-4 border border-white/40">
        <div className="text-left w-[40%]">
          <div className="text-[10px] text-gray-500 mb-1 font-medium">入住 CHECK-IN</div>
          <div className="text-lg font-bold text-gray-800 tracking-tight">{stayInfo.checkIn.date}</div>
          <div className="text-xs font-medium text-gray-400 mt-0.5">{stayInfo.checkIn.day} {stayInfo.checkIn.time}</div>
        </div>
        <div className="flex flex-col items-center justify-center">
          <div className="w-px h-8 bg-gray-300 mb-1" />
          <div className="bg-primary/10 text-primary px-2 py-0.5 rounded-md text-[10px] font-bold">{stayInfo.nights} 晚</div>
        </div>
        <div className="text-right w-[40%]">
          <div className="text-[10px] text-gray-500 mb-1 font-medium">退房 CHECK-OUT</div>
          <div className="text-lg font-bold text-gray-800 tracking-tight">{stayInfo.checkOut.date}</div>
          <div className="text-xs font-medium text-gray-400 mt-0.5">{stayInfo.checkOut.day} {stayInfo.checkOut.time}</div>
        </div>
      </div>

      <div className="flex items-start justify-between gap-3 relative z-10">
        <div className="flex items-start gap-2.5">
          <span className="material-icons-round text-primary text-xl mt-0.5">location_on</span>
          <span className="text-sm text-gray-600 leading-relaxed font-medium">{stayInfo.address}</span>
        </div>
        <button
          onClick={onMapClick}
          className="shrink-0 w-8 h-8 rounded-full bg-white border border-gray-100 text-morandi-blue flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
          aria-label="在地圖中查看"
        >
          <span className="material-icons-round text-sm">map</span>
        </button>
      </div>
    </div>
  );
}

function BookingIdCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
      <div className="p-5 relative z-10">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-[10px] text-gray-400 mb-1 uppercase tracking-wider font-bold">訂房代號 (Booking ID)</div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-mono font-bold text-gray-800 tracking-widest">{stayInfo.bookingId}</span>
              <button
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-primary transition-colors"
                aria-label="複製訂房代號"
              >
                <span className="material-icons-round text-sm">content_copy</span>
              </button>
            </div>
          </div>
          <div className="w-10 h-10 bg-morandi-blue/10 rounded-lg flex items-center justify-center">
            <span className="material-icons-round text-xl text-morandi-blue">confirmation_number</span>
          </div>
        </div>
      </div>
      <div className="relative flex items-center justify-center px-2">
        <div className="absolute left-0 w-4 h-8 bg-[#F0EEE6] rounded-r-full -ml-2" />
        <div className="absolute right-0 w-4 h-8 bg-[#F0EEE6] rounded-l-full -mr-2" />
        <div className="w-full border-t-2 border-dashed border-gray-200 h-px" />
      </div>
      <button className="w-full p-4 flex justify-between items-center hover:bg-gray-50 transition-colors group">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
            <span className="material-icons-round text-sm">description</span>
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-gray-700">入住憑證 (e-Voucher)</div>
            <div className="text-[10px] text-gray-400">點擊查看或下載 PDF</div>
          </div>
        </div>
        <span className="material-icons-round text-gray-300 text-lg group-hover:translate-x-1 transition-transform">chevron_right</span>
      </button>
    </div>
  );
}

function StayDetailCards() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="glass-card p-3.5 rounded-2xl flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-morandi-blue/20 flex items-center justify-center shrink-0">
          <span className="material-icons-round text-morandi-blue text-sm">bed</span>
        </div>
        <div>
          <div className="text-[10px] text-gray-500 mb-0.5">房型</div>
          <div className="text-sm font-bold text-gray-800 leading-tight">
            {stayInfo.roomType}
            <br />
            <span className="text-[10px] font-normal text-gray-400">{stayInfo.bedType}</span>
          </div>
        </div>
      </div>

      <div className="glass-card p-3.5 rounded-2xl flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-morandi-green/20 flex items-center justify-center shrink-0">
          <span className="material-icons-round text-morandi-green text-sm">group</span>
        </div>
        <div>
          <div className="text-[10px] text-gray-500 mb-0.5">入住人數</div>
          <div className="text-sm font-bold text-gray-800">{stayInfo.guests}</div>
        </div>
      </div>

      <div className="glass-card p-3.5 rounded-2xl flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-morandi-pink/20 flex items-center justify-center shrink-0">
          <span className="material-icons-round text-morandi-pink text-sm">restaurant</span>
        </div>
        <div>
          <div className="text-[10px] text-gray-500 mb-0.5">特殊需求</div>
          <div className="text-sm font-bold text-gray-800">
            {stayInfo.requests[0]}
            <br />
            <span className="text-[10px] font-normal text-gray-400">{stayInfo.requests[1]}</span>
          </div>
        </div>
      </div>

      <div className="glass-card p-3.5 rounded-2xl flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-morandi-yellow/20 flex items-center justify-center shrink-0">
          <span className="material-icons-round text-yellow-600 text-sm">payments</span>
        </div>
        <div>
          <div className="text-[10px] text-gray-500 mb-0.5">付款狀態</div>
          <div className="text-sm font-bold text-green-600">{stayInfo.paymentStatus}</div>
        </div>
      </div>
    </div>
  );
}

function StayRemindersCard() {
  return (
    <div className="bg-[#FDFCF8] p-5 rounded-2xl border border-primary/20 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-16 h-16 bg-morandi-yellow/10 rounded-bl-full -mr-4 -mt-4" />
      <div className="flex items-center gap-2 mb-3 relative z-10">
        <span className="material-icons-round text-primary">info</span>
        <span className="font-bold text-sm text-gray-700">入住須知</span>
      </div>
      <ul className="text-xs text-gray-500 space-y-3 list-none relative z-10">
        {stayReminders.map((item) => (
          <li key={item} className="flex gap-2.5 items-start">
            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
            <span>{item}</span>
          </li>
        ))}
        <li className="flex gap-2.5 items-start">
          <div className="bg-gray-100 px-2 py-1 rounded text-[10px] text-gray-600 font-mono flex items-center gap-1">
            <span className="material-icons-round text-[10px]">call</span>
            {stayInfo.phone}
          </div>
        </li>
      </ul>
    </div>
  );
}

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
              <FlightDetailCards />
            </div>
          </div>

          {/* Right Panel - PNR & Actions */}
          <div className="col-span-5 space-y-5">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-lg border border-white/50">
              <PNRCard />
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-lg border border-white/50">
              <FlightRemindersCard />
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
      <div className="xl:hidden relative z-10 max-w-xl mx-auto flex flex-col min-h-screen">
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
