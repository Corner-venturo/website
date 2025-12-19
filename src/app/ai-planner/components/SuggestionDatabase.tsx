'use client';

import { useState } from 'react';
import Image from 'next/image';
import { SuggestionItem } from './types';

interface SuggestionDatabaseProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (item: SuggestionItem) => void;
  suggestions: SuggestionItem[];
  destination?: string;
}

type CategoryType = 'all' | 'attraction' | 'food' | 'hotel' | 'experience';

const categories: { key: CategoryType; label: string; icon: string }[] = [
  { key: 'all', label: '全部', icon: 'grid_view' },
  { key: 'attraction', label: '景點', icon: 'photo_camera' },
  { key: 'food', label: '美食', icon: 'restaurant' },
  { key: 'hotel', label: '住宿', icon: 'hotel' },
  { key: 'experience', label: '體驗', icon: 'local_activity' },
];

const typeConfig: Record<string, { color: string; bgColor: string; label: string; dotColor: string }> = {
  attraction: {
    color: 'text-[#A5BCCF]',
    bgColor: 'bg-[#A5BCCF]/10',
    label: '景點',
    dotColor: 'bg-[#A5BCCF]',
  },
  food: {
    color: 'text-[#CFA5A5]',
    bgColor: 'bg-[#CFA5A5]/10',
    label: '美食',
    dotColor: 'bg-[#CFA5A5]',
  },
  experience: {
    color: 'text-[#A8BFA6]',
    bgColor: 'bg-[#A8BFA6]/10',
    label: '體驗',
    dotColor: 'bg-[#A8BFA6]',
  },
  hotel: {
    color: 'text-[#E0D6A8]',
    bgColor: 'bg-[#E0D6A8]/10',
    label: '住宿',
    dotColor: 'bg-[#E0D6A8]',
  },
};

export default function SuggestionDatabase({
  isOpen,
  onClose,
  onAddItem,
  suggestions,
  destination = '京都',
}: SuggestionDatabaseProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSuggestions = suggestions.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.type === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] cursor-pointer"
        onClick={onClose}
      />

      {/* 底部抽屜 */}
      <div className="relative w-full h-[85vh] bg-[#F7F5F2] rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden animate-slide-up">
        {/* 拖曳指示器 */}
        <div
          className="w-full flex justify-center pt-3 pb-1 shrink-0 cursor-pointer"
          onClick={onClose}
        >
          <div className="w-12 h-1.5 rounded-full bg-gray-300" />
        </div>

        {/* 標題列 */}
        <div className="px-6 pt-2 pb-3 shrink-0 flex items-center justify-between border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 tracking-wide flex items-center gap-2">
            建議資料庫
            <span className="px-2 py-0.5 rounded-md bg-[#Cfb9a5]/10 text-[#Cfb9a5] text-[10px] font-bold">
              {destination}
            </span>
          </h3>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
          >
            <span className="material-icons-round text-[20px]">close</span>
          </button>
        </div>

        {/* 主要內容區 */}
        <div className="flex flex-1 overflow-hidden relative">
          {/* 左側分類 */}
          <div className="w-20 bg-gray-50 flex flex-col items-center py-4 gap-6 overflow-y-auto hide-scrollbar border-r border-gray-100 shrink-0">
            {categories.map((category) => {
              const isActive = selectedCategory === category.key;
              return (
                <button
                  key={category.key}
                  onClick={() => setSelectedCategory(category.key)}
                  className={`group flex flex-col items-center gap-1.5 relative transition-colors ${
                    isActive ? 'text-[#Cfb9a5]' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                      isActive
                        ? 'bg-white shadow-sm border border-[#Cfb9a5]/20'
                        : 'bg-transparent group-hover:bg-white group-hover:shadow-sm'
                    }`}
                  >
                    <span className="material-icons-round text-[22px]">{category.icon}</span>
                  </div>
                  <span className="text-[10px] font-medium">{category.label}</span>
                  {isActive && (
                    <div className="absolute -right-[1.1rem] top-1/2 -translate-y-1/2 w-1 h-8 bg-[#Cfb9a5] rounded-l-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* 右側內容 */}
          <div className="flex-1 flex flex-col h-full min-w-0 bg-white/40">
            {/* 搜尋框 */}
            <div className="px-4 py-3 shrink-0">
              <div className="relative group">
                <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#Cfb9a5] transition-colors text-[20px]">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜尋項目..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-100 focus:ring-2 focus:ring-[#Cfb9a5]/50 focus:border-[#Cfb9a5]/50 text-sm text-gray-800 placeholder-gray-400 outline-none shadow-sm transition-all"
                />
              </div>
            </div>

            {/* 項目列表 */}
            <div className="flex-1 overflow-y-auto hide-scrollbar px-4 pb-20">
              <h4 className="text-xs font-bold text-gray-500 mb-3 ml-1">為您推薦</h4>
              <div className="grid grid-cols-2 gap-3">
                {filteredSuggestions.map((item) => {
                  const config = typeConfig[item.type] || typeConfig.attraction;
                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 group relative flex flex-col h-full hover:shadow-md transition-all"
                    >
                      {/* 圖片 */}
                      <div className="aspect-[4/3] bg-gray-200 relative overflow-hidden">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="material-icons-round text-gray-300 text-4xl">
                              image_not_supported
                            </span>
                          </div>
                        )}
                        <div
                          className={`absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-white/90 backdrop-blur-sm text-[10px] font-bold shadow-sm flex items-center gap-1`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
                          <span className={config.color}>{config.label}</span>
                        </div>
                      </div>

                      {/* 內容 */}
                      <div className="p-2.5 flex flex-col gap-0.5 flex-1 relative">
                        <h4 className="text-xs font-bold text-gray-800 line-clamp-1 pr-6">
                          {item.title}
                        </h4>
                        <span className="text-[10px] text-gray-400 line-clamp-1">
                          {item.description}
                        </span>

                        {/* 新增按鈕 */}
                        <button
                          onClick={() => onAddItem(item)}
                          className="absolute -top-4 right-2 w-7 h-7 rounded-full bg-[#Cfb9a5] text-white shadow-md flex items-center justify-center hover:bg-[#b09b88] hover:scale-105 active:scale-95 transition-all z-10"
                        >
                          <span className="material-icons-round text-[18px]">add</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredSuggestions.length === 0 && (
                <div className="text-center py-12">
                  <span className="material-icons-round text-4xl text-gray-200 mb-2 block">
                    search_off
                  </span>
                  <p className="text-gray-400 text-sm">找不到符合的項目</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out forwards;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
