"use client";

import React from "react";
import { Attraction } from "./types";

interface AttractionDetailProps {
  attraction: Attraction;
  onBack?: () => void;
  onShare?: () => void;
  onFavorite?: () => void;
  onNavigate?: () => void;
  isFavorite?: boolean;
}

/**
 * 景點詳情組件
 * 顯示景點的完整資訊，包含圖片、評分、介紹、開放時間、門票資訊
 */
export default function AttractionDetail({
  attraction,
  onBack,
  onShare,
  onFavorite,
  onNavigate,
  isFavorite = false,
}: AttractionDetailProps) {
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center text-[#e0d6a8] text-lg">
        {[...Array(fullStars)].map((_, i) => (
          <span key={`full-${i}`} className="material-icons-round">
            star
          </span>
        ))}
        {hasHalfStar && (
          <span className="material-icons-round">star_half</span>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <span
            key={`empty-${i}`}
            className="material-icons-round text-gray-300"
          >
            star_border
          </span>
        ))}
        <span className="ml-2 text-sm text-[#949494]">
          {rating.toFixed(1)} ({attraction.reviews} 評論)
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-[100dvh] bg-[#F0EEE6] font-sans text-[#5C5C5C]">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#F0EEE6]/95 backdrop-blur-sm px-5 py-4 flex items-center justify-between">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center shadow-sm active:scale-95 transition-transform"
        >
          <span className="material-icons-round text-gray-700">arrow_back</span>
        </button>
        <div className="flex space-x-2">
          <button
            onClick={onShare}
            className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center shadow-sm active:scale-95 transition-transform"
          >
            <span className="material-icons-round text-gray-700">share</span>
          </button>
          <button
            onClick={onFavorite}
            className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center shadow-sm active:scale-95 transition-transform"
          >
            <span className="material-icons-round text-gray-700">
              {isFavorite ? "favorite" : "favorite_border"}
            </span>
          </button>
        </div>
      </header>

      {/* Main Image */}
      <div className="w-full h-64 md:h-80 overflow-hidden relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={attraction.imageUrl}
          alt={attraction.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content Area */}
      <main className="px-5 pb-32 mt-[-2rem] relative z-10">
        {/* Title and Rating Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <h1 className="text-2xl font-bold text-[#5C5C5C] mb-2">
            {attraction.name}
          </h1>
          {renderStars(attraction.rating)}
        </div>

        {/* Description Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <h2 className="text-lg font-bold text-[#5C5C5C] mb-3">景點介紹</h2>
          <p className="text-sm text-[#5C5C5C] leading-relaxed">
            {attraction.description}
          </p>
        </div>

        {/* Opening Hours Card */}
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] p-6 mb-6">
          <h2 className="text-lg font-bold text-[#5C5C5C] mb-3 flex items-center">
            <span className="material-icons-round mr-2 text-[#cfb9a5]">
              schedule
            </span>
            開放時間
          </h2>
          <ul className="list-none p-0 m-0 text-sm text-[#5C5C5C]">
            {attraction.openingHours.map((item, index) => (
              <li key={index} className="mb-1 last:mb-0">
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Ticket Info Card */}
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] p-6 mb-6">
          <h2 className="text-lg font-bold text-[#5C5C5C] mb-3 flex items-center">
            <span className="material-icons-round mr-2 text-[#cfb9a5]">
              payments
            </span>
            門票資訊
          </h2>
          <ul className="list-none p-0 m-0 text-sm text-[#5C5C5C]">
            {attraction.ticketInfo.map((item, index) => (
              <li key={index} className="mb-1 last:mb-0">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </main>

      {/* Floating Action Button - Navigate */}
      <button
        onClick={onNavigate}
        className="fixed bottom-24 right-5 w-14 h-14 rounded-full bg-[#cfb9a5] text-white shadow-lg flex items-center justify-center active:scale-95 transition-transform z-40"
      >
        <span className="material-icons-round text-3xl">navigation</span>
      </button>
    </div>
  );
}
