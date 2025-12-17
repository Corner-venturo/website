'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { DrawerItem, ItemType } from '@/types/wishlist.types';

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectItem: (item: DrawerItem) => void;
}

const categories: { id: ItemType; label: string; icon: string }[] = [
  { id: 'restaurant', label: '餐廳', icon: 'restaurant' },
  { id: 'attraction', label: '景點', icon: 'place' },
  { id: 'activity', label: '活動', icon: 'directions_run' },
  { id: 'transportation', label: '交通', icon: 'directions_car' },
];

// Mock data for database items
const mockDrawerItems: DrawerItem[] = [
  // Restaurants
  { id: 'r1', name: '廣川鰻魚飯', type: 'restaurant', description: '百年老店，關西風味炭烤鰻魚', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&h=300&fit=crop', tags: ['米其林一星', '日式'], duration: '1.5 hr' },
  { id: 'r2', name: '松籟庵', type: 'restaurant', description: '隱身嵐山深處，佐以桂川美景', image: 'https://images.unsplash.com/photo-1540648639573-8c848de23f0a?w=400&h=300&fit=crop', tags: ['湯豆腐', '絕景'], duration: '2 hr' },
  { id: 'r3', name: '嵐山吉村蕎麥', type: 'restaurant', description: '渡月橋畔，手打蕎麥麵', image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop', tags: ['人氣店', '平價'], duration: '1 hr' },
  // Attractions
  { id: 'a1', name: '嵐山竹林小徑', type: 'attraction', description: '世界知名竹林步道', image: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&h=300&fit=crop', tags: ['景點', '步行'], duration: '1.5 hr' },
  { id: 'a2', name: '金閣寺', type: 'attraction', description: '世界文化遺產，金色閃耀', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=300&fit=crop', tags: ['世界遺產', '必訪'], duration: '1 hr' },
  { id: 'a3', name: '伏見稻荷大社', type: 'attraction', description: '千本鳥居，日本最熱門景點', image: 'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=400&h=300&fit=crop', tags: ['神社', '千本鳥居'], duration: '2 hr' },
  // Activities
  { id: 'ac1', name: '茶道體驗', type: 'activity', description: '建仁寺茶道教室，深度文化體驗', image: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=400&h=300&fit=crop', tags: ['體驗', '文化'], duration: '1.5 hr' },
  { id: 'ac2', name: '和服租借', type: 'activity', description: '穿著和服漫步古都', image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400&h=300&fit=crop', tags: ['體驗', '拍照'], duration: '4 hr' },
  // Transportation
  { id: 't1', name: '嵐電', type: 'transportation', description: '京福電鐵嵐山本線', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop', tags: ['電車', '觀光'], duration: '30 min' },
  { id: 't2', name: '計程車', type: 'transportation', description: '包車觀光服務', image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&h=300&fit=crop', tags: ['計程車', '方便'], duration: '依需求' },
];

export default function SideDrawer({ isOpen, onClose, onSelectItem }: SideDrawerProps) {
  const [activeCategory, setActiveCategory] = useState<ItemType>('restaurant');
  const [searchQuery, setSearchQuery] = useState('');

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const filteredItems = mockDrawerItems.filter(
    (item) =>
      item.type === activeCategory &&
      (searchQuery === '' ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-[60] transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 right-0 w-[340px] max-w-[90vw] bg-white/95 backdrop-blur-xl shadow-2xl z-[70] transform transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex-shrink-0 px-5 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">新增項目</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
            >
              <span className="material-icons-round text-xl">close</span>
            </button>
          </div>

          {/* Search */}
          <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 rounded-full border border-gray-100">
            <span className="material-icons-round text-gray-400 text-xl">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none text-sm placeholder-gray-400 text-gray-700 focus:outline-none"
              placeholder="搜尋項目..."
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600">
                <span className="material-icons-round text-lg">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex-shrink-0 px-5 py-3 border-b border-gray-100">
          <div className="flex gap-2 overflow-x-auto hide-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
                  activeCategory === cat.id
                    ? 'bg-[#94A3B8] text-white shadow-lg shadow-[#94A3B8]/30'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="material-icons-round text-base">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <span className="material-icons-round text-4xl mb-2">search_off</span>
              <p className="text-sm">找不到相關項目</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelectItem(item)}
                className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-3 flex gap-3 hover:shadow-md hover:border-[#94A3B8]/30 transition-all text-left group"
              >
                <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 relative">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 text-sm truncate group-hover:text-[#94A3B8] transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.description}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {item.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="px-2 py-0.5 rounded bg-gray-100 text-[10px] text-gray-500">
                        {tag}
                      </span>
                    ))}
                    {item.duration && (
                      <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                        <span className="material-icons-round text-xs">schedule</span>
                        {item.duration}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="material-icons-round text-gray-300 group-hover:text-[#94A3B8] transition-colors">
                    add_circle
                  </span>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-5 py-4 border-t border-gray-100 bg-gray-50/50">
          <p className="text-xs text-gray-400 text-center">
            點擊項目即可加入行程
          </p>
        </div>
      </div>
    </>
  );
}
