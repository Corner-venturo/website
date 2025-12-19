"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Order } from "./types";

interface OrderCardProps {
  order: Order;
}

export default function OrderCard({ order }: OrderCardProps) {
  const router = useRouter();

  const handleTagClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(href);
  };

  const getChipTextColor = (chipColor: string) => {
    if (chipColor === "bg-[#94A3B8]") return "#94A3B8";
    if (chipColor === "bg-[#C5B6AF]") return "#C5B6AF";
    return "#A8BCA1";
  };

  return (
    <Link
      href={`/orders/${order.id}`}
      className="block bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] p-4 relative group overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
    >
      {/* 狀態標籤 */}
      <div className={`absolute top-0 right-0 px-3 py-1 ${order.chipColor}/20 rounded-bl-xl`}>
        <span
          className="text-[10px] font-bold"
          style={{ color: getChipTextColor(order.chipColor) }}
        >
          {order.chipText}
        </span>
      </div>

      {/* 卡片頭部 */}
      <div className="flex gap-3 mb-4">
        <div className="w-16 h-16 rounded-xl overflow-hidden shadow-sm shrink-0 bg-[#E8E2DD] flex items-center justify-center">
          {order.image ? (
            <img src={order.image} alt={order.title} className="w-full h-full object-cover" />
          ) : (
            <span className="material-icons-round text-[#C5B6AF] text-2xl">map</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-[#5C5C5C] text-base mb-1 truncate">{order.title}</h3>
          <div className="flex items-center gap-1 text-[#949494] text-xs mb-1">
            <span className="material-icons-round text-sm">calendar_today</span>
            <span className="truncate">{order.dateRange}</span>
          </div>
          <div className="flex items-center gap-1 text-[#949494] text-xs">
            <span className="material-icons-round text-sm">
              {order.id === "tokyo-disney" ? "timer" : "group"}
            </span>
            <span className={`truncate ${order.id === "tokyo-disney" ? "text-[#C5B6AF] font-medium" : ""}`}>
              {order.travelers}
            </span>
          </div>
        </div>
      </div>

      {/* 京都訂單：進度條和狀態標籤 */}
      {order.id === "kyoto-autumn" && (
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-medium text-[#5C5C5C]">行程準備進度</span>
            <span className="font-bold text-[#94A3B8]">{order.progress}%</span>
          </div>
          <div className="h-1.5 w-full bg-[#E8E2DD] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#94A3B8] rounded-full"
              style={{ width: `${order.progress}%` }}
            />
          </div>
          <div className="flex gap-2 pt-2 overflow-x-auto hide-scrollbar">
            {order.statusTags?.map((tag) => (
              <button
                key={tag.label}
                onClick={(e) => tag.href && handleTagClick(e, tag.href)}
                className={`px-3 py-2 rounded-full text-xs font-medium border flex items-center gap-1.5 whitespace-nowrap transition-all ${
                  tag.tone === "green"
                    ? "bg-white/80 border-[#C8E6C9] hover:bg-[#E8F5E9]"
                    : "bg-white/60 border-[#E8E2DD] hover:bg-white/80"
                } ${tag.href ? "cursor-pointer active:scale-95" : ""}`}
              >
                <span
                  className={`material-icons-round text-sm ${
                    tag.tone === "green" ? "text-[#6B8E6B]" : "text-[#B8A065]"
                  }`}
                >
                  {tag.tone === "green" ? "check_circle" : "more_horiz"}
                </span>
                <span className={tag.tone === "green" ? "text-[#6B8E6B]" : "text-[#949494]"}>
                  {tag.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 東京訂單：付款區塊 */}
      {order.id === "tokyo-disney" && (
        <div className="flex justify-between items-center border-t border-[#E8E2DD] pt-3 mt-3">
          <div className="flex flex-col">
            <span className="text-[10px] text-[#949494]">總金額</span>
            <span className="font-bold text-[#5C5C5C]">{order.total}</span>
          </div>
          <span className="px-4 py-2 bg-[#C5B6AF] text-white text-xs font-bold rounded-full shadow-md shadow-[#C5B6AF]/30">
            {order.actionLabel}
          </span>
        </div>
      )}

      {/* 北海道訂單：操作按鈕 */}
      {order.id === "hokkaido-ski" && (
        <div className="flex items-center gap-2 mt-2">
          <span className="flex-1 py-2 rounded-lg border border-[#94A3B8]/30 text-[#94A3B8] text-xs font-medium text-center">
            編輯行程
          </span>
          <span className="flex-1 py-2 rounded-lg bg-[#94A3B8]/10 text-[#94A3B8] text-xs font-medium text-center">
            繼續預訂
          </span>
        </div>
      )}
    </Link>
  );
}
