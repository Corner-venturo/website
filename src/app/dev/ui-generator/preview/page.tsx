"use client";

import React from 'react';
import Image from 'next/image';

// Dummy data for the attraction details
const attraction = {
  id: "1",
  name: "天空之城古堡",
  imageUrl: "https://images.unsplash.com/photo-1506197603052-3be9ceef1910?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  rating: 4.8,
  reviews: 1234,
  description: "天空之城古堡，坐落在雲霧繚繞的山巔，彷彿漂浮在半空中。這座宏偉的建築擁有千年歷史，每一塊石頭都訴說著古老的傳說。遊客可以在這裡探索神秘的迴廊、欣賞壯麗的自然風光，並在日落時分體驗如夢似幻的氛圍。是探險家與攝影愛好者的天堂，感受歷史與自然的完美結合。",
  openingHours: [
    "週一至週五：09:00 - 17:00",
    "週六、週日及國定假日：08:30 - 18:00",
    "最後入場時間為閉館前一小時"
  ],
  ticketInfo: [
    "成人票：NT$350",
    "學生票：NT$280 (需出示有效學生證)",
    "兒童票 (6歲以下)：免費",
    "團體票 (20人以上)：九折優惠，需提前預約"
  ]
};

const AttractionDetailPage: React.FC = () => {
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center text-[#e0d6a8] text-lg">
        {[...Array(fullStars)].map((_, i) => (
          <span key={`full-${i}`} className="material-icons-round">star</span>
        ))}
        {hasHalfStar && <span className="material-icons-round">star_half</span>}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={`empty-${i}`} className="material-icons-round text-gray-300">star_border</span>
        ))}
        <span className="ml-2 text-sm text-[#949494]">{rating.toFixed(1)} ({attraction.reviews} 評論)</span>
      </div>
    );
  };

  return (
    <div className="min-h-[100dvh] bg-[#F0EEE6] font-sans text-[#5C5C5C]">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#F0EEE6]/95 backdrop-blur-sm px-5 py-4 flex items-center justify-between">
        <button className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center shadow-sm active:scale-95 transition-transform">
          <span className="material-icons-round text-gray-700">arrow_back</span>
        </button>
        <div className="flex space-x-2">
          <button className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center shadow-sm active:scale-95 transition-transform">
            <span className="material-icons-round text-gray-700">share</span>
          </button>
          <button className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center shadow-sm active:scale-95 transition-transform">
            <span className="material-icons-round text-gray-700">favorite_border</span>
          </button>
        </div>
      </header>

      {/* Main Image */}
      <div className="w-full h-64 md:h-80 overflow-hidden relative">
        <Image
          src={attraction.imageUrl}
          alt={attraction.name}
          layout="fill"
          objectFit="cover"
          priority
        />
      </div>

      {/* Content Area */}
      <main className="px-5 pb-32 mt-[-2rem] relative z-10"> {/* Added mt-[-2rem] to slightly overlap with image */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          {/* Title and Rating */}
          <h1 className="text-2xl font-bold text-[#5C5C5C] mb-2">{attraction.name}</h1>
          {renderStars(attraction.rating)}
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <h2 className="text-lg font-bold text-[#5C5C5C] mb-3">景點介紹</h2>
          <p className="text-sm text-[#5C5C5C] leading-relaxed">
            {attraction.description}
          </p>
        </div>

        {/* Opening Hours Card */}
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] p-6 mb-6">
          <h2 className="text-lg font-bold text-[#5C5C5C] mb-3 flex items-center">
            <span className="material-icons-round mr-2 text-[#cfb9a5]">schedule</span> 開放時間
          </h2>
          <ul className="list-none p-0 m-0 text-sm text-[#5C5C5C]">
            {attraction.openingHours.map((item, index) => (
              <li key={index} className="mb-1 last:mb-0">{item}</li>
            ))}
          </ul>
        </div>

        {/* Ticket Info Card */}
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] p-6 mb-6">
          <h2 className="text-lg font-bold text-[#5C5C5C] mb-3 flex items-center">
            <span className="material-icons-round mr-2 text-[#cfb9a5]">payments</span> 門票資訊
          </h2>
          <ul className="list-none p-0 m-0 text-sm text-[#5C5C5C]">
            {attraction.ticketInfo.map((item, index) => (
              <li key={index} className="mb-1 last:mb-0">{item}</li>
            ))}
          </ul>
        </div>
      </main>

      {/* Floating Action Button (FAB) */}
      <button className="fixed bottom-24 right-5 w-14 h-14 rounded-full bg-[#cfb9a5] text-white shadow-lg flex items-center justify-center active:scale-95 transition-transform z-40">
        <span className="material-icons-round text-3xl">navigation</span>
      </button>

      {/* Placeholder for Bottom Navigation Bar (for pb-32 spacing) */}
      {/* If a bottom navigation bar exists, it would go here */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#F0EEE6]/95 backdrop-blur-sm h-[80px] pb-[max(1.5rem,env(safe-area-inset-bottom))] flex items-center justify-around text-xs text-[#949494] shadow-inner border-t border-gray-100">
         {/* Example bottom nav items */}
         <div className="flex flex-col items-center">
             <span className="material-icons-round text-xl text-[#cfb9a5]">home</span>
             <span>首頁</span>
         </div>
         <div className="flex flex-col items-center">
             <span className="material-icons-round text-xl">search</span>
             <span>探索</span>
         </div>
         <div className="flex flex-col items-center">
             <span className="material-icons-round text-xl">bookmark_border</span>
             <span>收藏</span>
         </div>
         <div className="flex flex-col items-center">
             <span className="material-icons-round text-xl">person</span>
             <span>我的</span>
         </div>
      </div>
    </div>
  );
};

export default AttractionDetailPage;