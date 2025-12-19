'use client';

import Link from 'next/link';
import {
  HotelImageGallery,
  HotelInfoCard,
  BookingIdCard,
  DetailCards,
  RemindersCard,
  ActionButtons,
  StayInfo,
} from './components';

const stayInfo: StayInfo = {
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

const reminders = [
  '入住時間：15:00 後，退房時間：11:00 前。',
  '辦理入住時請出示護照與入住憑證。',
  '飯店禁止攜帶寵物（導盲犬除外）。',
];

export default function StayDetailsPage() {
  return (
    <div className="relative bg-[#F0EEE6] font-sans antialiased text-gray-900 transition-colors duration-300 min-h-screen flex flex-col overflow-hidden">
      {/* 背景效果 */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[#EFEFE8] texture-bg" />
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-morandi-blue/20 rounded-full blur-3xl" />
        <div className="absolute bottom-[20%] left-[-10%] w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
      </div>

      {/* 手機版佈局 */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Header */}
        <header className="relative z-50 px-6 pt-6 pb-4 flex items-center justify-between">
          <Link
            href="/orders"
            className="glass w-10 h-10 flex items-center justify-center rounded-full shadow-sm text-gray-600 hover:text-primary transition-colors"
            aria-label="返回訂單"
          >
            <span className="material-icons-round text-xl">arrow_back</span>
          </Link>
          <h1 className="text-lg font-bold text-gray-800 tracking-tight">住宿詳情</h1>
          <div className="w-10" />
        </header>

        {/* 主要內容 */}
        <main className="relative z-10 flex-1 w-full h-full overflow-y-auto hide-scrollbar pb-32 px-6 pt-2">
          <div className="mb-5">
            <HotelImageGallery image={stayInfo.image} alt={stayInfo.name} />
          </div>

          <HotelInfoCard stayInfo={stayInfo} />

          <div className="mt-5">
            <BookingIdCard bookingId={stayInfo.bookingId} />
          </div>

          <div className="flex items-center justify-between my-4 px-1">
            <h3 className="text-sm font-bold text-gray-800">詳細資訊</h3>
          </div>

          <DetailCards stayInfo={stayInfo} />

          <div className="mt-6 mb-8">
            <RemindersCard reminders={reminders} phone={stayInfo.phone} />
          </div>
        </main>

        {/* 底部操作按鈕 */}
        <ActionButtons />
      </div>
    </div>
  );
}
