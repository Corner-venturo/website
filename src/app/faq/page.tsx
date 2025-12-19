"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MobileNav from "@/components/MobileNav";

interface FAQItem {
  id: string;
  icon: string;
  iconColor: string;
  question: string;
  answer: string;
  category: string;
}

const faqItems: FAQItem[] = [
  {
    id: "1",
    icon: "flight_takeoff",
    iconColor: "bg-[#A5BCCF]/20 text-[#A5BCCF]",
    question: "集合時間地點確認",
    answer: "集合地點位於桃園國際機場第二航廈 3 號櫃檯（長榮航空）。請務必於起飛前 3 小時（即早上 06:30）抵達現場與領隊會合，領取登機證並辦理行李託運。",
    category: "行程相關",
  },
  {
    id: "2",
    icon: "checkroom",
    iconColor: "bg-[#CFA5A5]/20 text-[#CFA5A5]",
    question: "當地天氣與穿著建議",
    answer: "京都秋季氣溫約在 10°C 至 18°C 之間，早晚溫差較大。建議採用「洋蔥式穿搭」，內層穿著舒適透氣的長袖，外層搭配防風保暖的薄外套或風衣。",
    category: "行程相關",
  },
  {
    id: "3",
    icon: "wifi",
    iconColor: "bg-[#A8BFA6]/20 text-[#A8BFA6]",
    question: "網卡與 Wi-Fi 設定",
    answer: "本次行程已包含每人一張 5GB 流量的日本上網 SIM 卡。領隊將於機場集合時統一發放，請於抵達日本後再插入手機使用。若需要 eSIM，請提前聯繫客服更換。",
    category: "行程相關",
  },
  {
    id: "4",
    icon: "description",
    iconColor: "bg-[#E0D6A8]/20 text-yellow-600",
    question: "入境卡填寫教學",
    answer: "建議您在出發前下載 Visit Japan Web 並完成註冊。填寫時請參考行前手冊第 5 頁的範例。若不會操作，領隊會在機場協助教學。",
    category: "簽證與保險",
  },
  {
    id: "5",
    icon: "currency_exchange",
    iconColor: "bg-gray-200 text-gray-500",
    question: "當地貨幣兌換",
    answer: "建議在台灣先行兌換日幣，匯率通常較佳。大部分商店可使用信用卡（Visa/Master/JCB），但部分小吃攤與神社僅收現金，建議每人準備約 3-5 萬日幣現金。",
    category: "其他",
  },
  {
    id: "6",
    icon: "hotel",
    iconColor: "bg-[#Cfb9a5]/20 text-[#Cfb9a5]",
    question: "住宿安排與設施",
    answer: "本次行程住宿為四星級飯店，提供免費 Wi-Fi、早餐及基本盥洗用品。房間為雙人房，單人入住需補房差。如有特殊需求（如禁菸房、高樓層），請提前告知。",
    category: "住宿與餐食",
  },
  {
    id: "7",
    icon: "restaurant",
    iconColor: "bg-[#CFA5A5]/20 text-[#CFA5A5]",
    question: "餐食安排與素食選項",
    answer: "行程包含每日早餐，午餐和晚餐依行程安排。如有素食、過敏或宗教飲食需求，請於出發前 7 天告知，我們將協助安排特殊餐食。",
    category: "住宿與餐食",
  },
];

const categories = ["全部", "行程相關", "住宿與餐食", "簽證與保險", "其他"];

export default function FAQPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("全部");
  const [searchQuery, setSearchQuery] = useState("");
  const [openItems, setOpenItems] = useState<string[]>(["1"]);

  const filteredItems = faqItems.filter((item) => {
    const matchesCategory = activeCategory === "全部" || item.category === activeCategory;
    const matchesSearch = item.question.includes(searchQuery) || item.answer.includes(searchQuery);
    return matchesCategory && (searchQuery === "" || matchesSearch);
  });

  const toggleItem = (id: string) => {
    setOpenItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="h-[100dvh] max-h-[100dvh] overflow-hidden relative bg-[#F0EEE6] font-sans antialiased text-gray-900">
      {/* 背景光暈 */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-[#A5BCCF]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-[20%] left-[-10%] w-80 h-80 bg-[#Cfb9a5]/20 rounded-full blur-3xl" />
        <div className="absolute top-[40%] right-[20%] w-64 h-64 bg-[#CFA5A5]/15 rounded-full blur-3xl" />
      </div>

      {/* Header - absolute 定位 */}
      <header className="absolute top-0 left-0 right-0 z-20 px-6 pt-4 pb-4 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="bg-white/70 backdrop-blur-xl border border-white/60 w-10 h-10 flex items-center justify-center rounded-full shadow-sm text-gray-600 hover:text-[#Cfb9a5] transition-colors"
        >
          <span className="material-icons-round text-xl">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold text-gray-800 tracking-tight">常見問題</h1>
        <Link
          href="/contact"
          className="bg-white/70 backdrop-blur-xl border border-white/60 w-10 h-10 flex items-center justify-center rounded-full shadow-sm text-[#Cfb9a5] hover:bg-[#Cfb9a5] hover:text-white transition-colors"
        >
          <span className="material-icons-round text-xl">support_agent</span>
        </Link>
      </header>

      {/* 主要內容 */}
      <main className="h-full overflow-y-auto pt-16 pb-24">
        {/* 搜尋框 */}
        <div className="px-6 mb-6">
          <div className="relative group">
            <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#Cfb9a5] transition-colors">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/60 border border-white/40 shadow-lg text-sm focus:ring-2 focus:ring-[#Cfb9a5]/50 focus:border-[#Cfb9a5]/50 placeholder-gray-400 outline-none transition-all"
              placeholder="搜尋問題關鍵字 (如: 天氣、簽證)"
            />
          </div>
        </div>

        {/* 分類篩選 */}
        <div className="px-6 mb-6 overflow-x-auto hide-scrollbar">
          <div className="flex gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all active:scale-95 ${
                  activeCategory === category
                    ? "bg-[#Cfb9a5] text-white shadow-lg shadow-[#Cfb9a5]/20"
                    : "bg-white/60 text-gray-600 border border-white/40 hover:bg-white/80"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ 列表 */}
        <div className="px-6 space-y-4">
          {filteredItems.map((item) => (
            <details
              key={item.id}
              open={openItems.includes(item.id)}
              className="group bg-white/50 backdrop-blur-xl border border-white/40 rounded-2xl shadow-lg overflow-hidden transition-all duration-300"
            >
              <summary
                onClick={(e) => {
                  e.preventDefault();
                  toggleItem(item.id);
                }}
                className="flex items-center justify-between p-5 cursor-pointer list-none select-none hover:bg-white/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full ${item.iconColor} flex items-center justify-center shrink-0`}>
                    <span className="material-icons-round text-lg">{item.icon}</span>
                  </div>
                  <span className="font-bold text-gray-800 text-[15px]">{item.question}</span>
                </div>
                <span
                  className={`material-icons-round text-gray-400 transition-transform duration-300 ${
                    openItems.includes(item.id) ? "rotate-180" : ""
                  }`}
                >
                  expand_more
                </span>
              </summary>
              <div className="px-5 pb-5 pt-0 text-sm text-gray-600 leading-relaxed border-t border-gray-100/50 mt-2 pt-4">
                {item.answer}
              </div>
            </details>
          ))}

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <span className="material-icons-round text-gray-300 text-5xl mb-3">search_off</span>
              <p className="text-gray-500">找不到相關問題</p>
            </div>
          )}
        </div>
      </main>

      {/* 底部導航 */}
      <MobileNav />

      <style jsx>{`
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
