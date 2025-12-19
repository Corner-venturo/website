'use client';

import Image from 'next/image';
import Link from 'next/link';

// DisplayTrip 介面 - 統一顯示格式
export interface DisplayTrip {
  id: string;
  title: string;
  category: string;
  event_date: string;
  location: string;
  latitude: number;
  longitude: number;
  member_count: number;
  max_members: number;
  organizer_name: string;
  organizer_avatar: string;
  image: string;
  isMyGroup?: boolean;
}

// 類別顏色
export const getCategoryColor = (category: string) => {
  switch (category) {
    case 'food': return 'bg-[#E8C4C4]';
    case 'photo': return 'bg-[#A5BCCD]';
    case 'outdoor': return 'bg-[#A8BFA6]';
    case 'music': return 'bg-[#C4B8E0]';
    case 'coffee': return 'bg-[#D4C4A8]';
    default: return 'bg-[#CFB9A5]';
  }
};

export const getCategoryTextColor = (category: string) => {
  switch (category) {
    case 'food': return 'text-[#8B5A5A]';
    case 'photo': return 'text-[#4A6B8A]';
    case 'outdoor': return 'text-[#4A6B4A]';
    case 'music': return 'text-[#6B4A8A]';
    case 'coffee': return 'text-[#6B5A4A]';
    default: return 'text-[#8B7355]';
  }
};

// 格式化日期
export const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return '今天';
  if (diffDays === 1) return '明天';
  if (diffDays > 0 && diffDays <= 7) return `${diffDays} 天後`;

  return `${date.getMonth() + 1}/${date.getDate()}`;
};

interface TripCardProps {
  trip: DisplayTrip;
  isSelected: boolean;
  onClick: () => void;
  className?: string;
  onClose?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function TripCard({
  trip,
  isSelected,
  onClick,
  className,
}: TripCardProps) {
  const handleClick = (e: React.MouseEvent) => {
    // 先觸發 onClick（選中地圖上的點）
    onClick();
  };

  return (
    <Link
      href={`/explore/${trip.id}`}
      onClick={handleClick}
      className={`snap-center shrink-0 w-[280px] p-3 backdrop-blur-xl rounded-2xl shadow-lg border flex gap-3 cursor-pointer transition-all ${
        isSelected
          ? 'bg-white/95 border-white/80 ring-2 ring-[#94A3B8]/50 shadow-xl'
          : 'bg-white/80 border-white/50 opacity-80 scale-95'
      } ${className || ''}`}
    >
      {/* 圖片 */}
      <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 relative">
        <Image src={trip.image} alt={trip.title} fill className="object-cover" />
        <div className="absolute top-1 right-1 bg-black/50 rounded-md px-1.5 py-0.5 text-[10px] text-white flex items-center gap-0.5">
          <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z" />
          </svg>
          {trip.member_count}/{trip.max_members}
        </div>
      </div>

      {/* 內容 */}
      <div className="flex flex-col justify-center flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          <span className={`w-1.5 h-1.5 rounded-full ${getCategoryColor(trip.category)}`} />
          <span className={`text-[10px] font-bold uppercase tracking-wider ${getCategoryTextColor(trip.category)}`}>
            {formatDate(trip.event_date)}
          </span>
          <span className="text-[10px] text-[#949494] ml-auto truncate max-w-[80px]">
            {trip.location}
          </span>
        </div>
        <h3 className="font-bold text-sm text-[#5C5C5C] truncate mb-1.5">
          {trip.title}
        </h3>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full overflow-hidden ring-2 ring-white">
            <Image
              src={trip.organizer_avatar}
              alt={trip.organizer_name}
              width={20}
              height={20}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-xs text-[#949494]">{trip.organizer_name}</span>
        </div>
      </div>
    </Link>
  );
}
