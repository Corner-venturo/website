'use client';

import Image from 'next/image';
import { JourneyItem } from './types';

interface JourneyBuilderProps {
  items: JourneyItem[];
  onAddClick: () => void;
  onRemoveItem: (id: string) => void;
  onAutoGenerate: () => void;
}

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

export default function JourneyBuilder({
  items,
  onAddClick,
  onRemoveItem,
  onAutoGenerate,
}: JourneyBuilderProps) {
  // 按天分組
  const groupedByDay = items.reduce((acc, item) => {
    const day = item.day || 1;
    if (!acc[day]) acc[day] = [];
    acc[day].push(item);
    return acc;
  }, {} as Record<number, JourneyItem[]>);

  const days = Object.keys(groupedByDay).map(Number).sort((a, b) => a - b);

  return (
    <section className="flex-1 px-5 mt-1 flex flex-col min-h-0 relative">
      {/* 標題列 */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
          <span className="w-1.5 h-4 rounded-full bg-[#A8BFA6]" />
          拼湊你的旅程
        </h2>
        <button
          onClick={onAutoGenerate}
          className="group flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-[#Cfb9a5] to-[#dccebd] text-white rounded-full text-xs font-bold shadow-sm hover:shadow-md transition-all active:scale-95 ring-2 ring-[#Cfb9a5]/20"
        >
          <span className="material-icons-round text-[16px]">auto_awesome</span>
          自動生成
        </button>
      </div>

      {/* 行程區域 */}
      <div className="relative flex-1 bg-white/60 rounded-t-[2.5rem] border border-white/40 overflow-hidden flex flex-col shadow-lg backdrop-blur-sm">
        {/* 背景地圖紋理 */}
        <div className="absolute inset-0 opacity-[0.08] pointer-events-none bg-gradient-to-b from-gray-200 to-transparent" />

        <div className="flex-1 p-5 relative z-10 overflow-y-auto hide-scrollbar pb-36">
          <div className="flex flex-col gap-4">
            {days.length > 0 ? (
              days.map((day) => (
                <div key={day}>
                  {/* Day 標籤 */}
                  <div className="flex items-center gap-3 sticky top-0 z-10 py-2 -mx-2 px-2 rounded-xl backdrop-blur-md bg-white/30">
                    <div className="px-3 py-1 bg-gray-800 text-white rounded-full text-xs font-bold tracking-wide shadow-sm">
                      Day {day}
                    </div>
                    <div className="h-px bg-gradient-to-r from-gray-400/50 to-transparent flex-1" />
                    <span className="text-[10px] text-gray-500 font-medium">
                      {getDayLabel(day)}
                    </span>
                  </div>

                  {/* 該天的項目 */}
                  {groupedByDay[day].map((item, index) => {
                    const config = typeConfig[item.type] || typeConfig.attraction;
                    const isLast = index === groupedByDay[day].length - 1;

                    return (
                      <div key={item.id} className="flex items-start gap-3 group mt-4">
                        {/* 時間軸點 */}
                        <div className="flex flex-col items-center gap-1 pt-3">
                          <div className={`w-3 h-3 rounded-full ${config.dotColor} ring-4 ring-white shadow-sm`} />
                          {!isLast && (
                            <div className="w-0.5 h-full bg-gray-200 min-h-[3rem]" />
                          )}
                        </div>

                        {/* 項目卡片 */}
                        <div className="flex-1 bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex gap-3 relative transition-all hover:shadow-md hover:-translate-y-0.5">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.title}
                              width={64}
                              height={64}
                              className="w-16 h-16 rounded-xl object-cover bg-gray-100 shadow-sm"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center">
                              <span className="material-icons-round text-gray-300 text-2xl">image</span>
                            </div>
                          )}
                          <div className="flex-1 flex flex-col justify-center gap-0.5">
                            <div className="flex items-center gap-2">
                              <span className={`px-1.5 py-0.5 rounded-md ${config.bgColor} text-[10px] ${config.color} font-bold`}>
                                {config.label}
                              </span>
                              {item.time && (
                                <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                                  <span className="material-icons-round text-[10px]">schedule</span>
                                  {item.time}
                                </span>
                              )}
                            </div>
                            <h4 className="text-sm font-bold text-gray-800">{item.title}</h4>
                            <p className="text-[10px] text-gray-400 line-clamp-1">{item.description}</p>
                          </div>

                          {/* 刪除按鈕 */}
                          <button
                            onClick={() => onRemoveItem(item.id)}
                            className="absolute -top-2 -right-2 bg-red-50 rounded-full p-1 shadow-sm text-red-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <span className="material-icons-round text-[16px]">remove</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <span className="material-icons-round text-5xl text-gray-200 mb-3 block">route</span>
                <p className="text-gray-400 text-sm mb-1">還沒有行程</p>
                <p className="text-gray-300 text-xs">點擊下方按鈕開始規劃！</p>
              </div>
            )}

            {/* 新增項目按鈕 */}
            <div className="flex items-start gap-3 pt-2">
              <div className="flex flex-col items-center gap-1 pt-1 opacity-40">
                <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
              </div>
              <button
                onClick={onAddClick}
                className="flex-1 py-3 rounded-full border border-dashed border-[#Cfb9a5]/50 text-[#Cfb9a5] bg-[#Cfb9a5]/5 hover:bg-[#Cfb9a5]/10 transition-all flex items-center justify-center gap-2 font-bold text-sm shadow-sm active:scale-[0.98]"
              >
                <span className="material-icons-round text-[20px]">add_circle</span>
                新增項目
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// 取得日期標籤（示範用）
function getDayLabel(day: number): string {
  const today = new Date();
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + day - 1);

  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  const month = targetDate.getMonth() + 1;
  const date = targetDate.getDate();
  const weekday = weekdays[targetDate.getDay()];

  return `${month}月${date}日 (${weekday})`;
}
