"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AttractionDetail,
  AttractionCard,
  SAMPLE_ATTRACTION,
  SAMPLE_ATTRACTIONS,
  Attraction,
} from "@/components/attractions";

export default function AttractionsDemo() {
  const [selectedAttraction, setSelectedAttraction] =
    useState<Attraction | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  };

  const selectAttraction = (attraction: (typeof SAMPLE_ATTRACTIONS)[0]) => {
    setSelectedAttraction({
      ...SAMPLE_ATTRACTION,
      id: attraction.id,
      name: attraction.name,
      imageUrl: attraction.imageUrl,
      rating: attraction.rating,
      reviews: attraction.reviews || 0,
    });
  };

  return (
    <div className="min-h-screen bg-[#F0EEE6] font-sans">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#F0EEE6]/95 backdrop-blur-sm px-5 py-4 border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Link
            href="/dev/ui-generator"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm"
          >
            <span className="material-icons-round text-gray-600">
              arrow_back
            </span>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-[#5C5C5C]">景點庫組件預覽</h1>
            <p className="text-xs text-[#949494]">左側選擇景點，右側預覽詳情</p>
          </div>
        </div>
      </header>

      {/* Main Content - Split View */}
      <div className="max-w-7xl mx-auto flex">
        {/* Left Panel - List */}
        <div className="w-1/2 border-r border-gray-200/50 h-[calc(100vh-73px)] overflow-y-auto">
          <div className="p-5 space-y-6">
            {/* 大卡片展示 */}
            <section>
              <h2 className="text-lg font-bold text-[#5C5C5C] mb-4">精選景點</h2>
              <AttractionCard
                attraction={SAMPLE_ATTRACTIONS[0]}
                size="large"
                onClick={() => selectAttraction(SAMPLE_ATTRACTIONS[0])}
              />
            </section>

            {/* 中型卡片橫向滾動 */}
            <section>
              <h2 className="text-lg font-bold text-[#5C5C5C] mb-4">熱門景點</h2>
              <div className="flex gap-4 overflow-x-auto pb-4">
                {SAMPLE_ATTRACTIONS.map((attraction) => (
                  <AttractionCard
                    key={attraction.id}
                    attraction={attraction}
                    size="medium"
                    onClick={() => selectAttraction(attraction)}
                  />
                ))}
              </div>
            </section>

            {/* 小型卡片 */}
            <section>
              <h2 className="text-lg font-bold text-[#5C5C5C] mb-4">附近景點</h2>
              <div className="flex gap-3 overflow-x-auto pb-4">
                {SAMPLE_ATTRACTIONS.map((attraction) => (
                  <AttractionCard
                    key={attraction.id}
                    attraction={attraction}
                    size="small"
                    onClick={() => selectAttraction(attraction)}
                  />
                ))}
              </div>
            </section>

            {/* 組件說明 */}
            <section className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-[#5C5C5C] mb-4">組件說明</h2>
              <div className="space-y-4 text-sm text-[#5C5C5C]">
                <div>
                  <h3 className="font-bold mb-1">AttractionCard</h3>
                  <p className="text-[#949494]">
                    景點卡片組件，支援 small / medium / large 三種尺寸
                  </p>
                </div>
                <div>
                  <h3 className="font-bold mb-1">AttractionDetail</h3>
                  <p className="text-[#949494]">
                    景點詳情頁組件，顯示完整資訊和操作按鈕
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Right Panel - Phone Preview */}
        <div className="w-1/2 h-[calc(100vh-73px)] flex items-center justify-center bg-gray-100 p-8">
          {/* Phone Frame */}
          <div className="w-[375px] h-[700px] bg-white rounded-[40px] shadow-2xl overflow-hidden border-8 border-gray-800 relative">
            {/* Phone Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-2xl z-50" />

            {/* Phone Content */}
            <div className="w-full h-full overflow-hidden">
              {selectedAttraction ? (
                <AttractionDetail
                  attraction={selectedAttraction}
                  onBack={() => setSelectedAttraction(null)}
                  onShare={() => alert("分享功能")}
                  onFavorite={() => toggleFavorite(selectedAttraction.id)}
                  onNavigate={() => alert("導航功能")}
                  isFavorite={favorites.includes(selectedAttraction.id)}
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8">
                  <span className="material-icons-round text-6xl mb-4">
                    touch_app
                  </span>
                  <p className="text-lg font-medium text-gray-500">選擇一個景點</p>
                  <p className="text-sm text-center mt-2">
                    點擊左側的景點卡片<br />查看詳情頁預覽
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
