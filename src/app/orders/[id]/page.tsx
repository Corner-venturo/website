"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import MobileNav from "@/components/MobileNav";

// 模擬訂單資料
const ordersData: Record<string, {
  id: string;
  title: string;
  dateRange: string;
  travelers: string;
  image: string;
  hasBriefing: boolean;
  briefing?: {
    topic: string;
    date: string;
    time: string;
    location: string;
    meetingLink: string;
    outline: string[];
    documents: { name: string; type: string; size: string; href?: string }[];
  };
  faqs?: { question: string; answer: string; icon: string; color: string }[];
  itinerary?: {
    flight: { departure: string; arrival: string; flightNo: string };
    hotel: { name: string; address: string; checkIn: string; checkOut: string };
    days: { day: number; title: string; activities: string[] }[];
  };
}> = {
  "kyoto-autumn": {
    id: "kyoto-autumn",
    title: "京都秋日賞楓五日遊",
    dateRange: "11/15 - 11/20, 2023",
    travelers: "2 成人, 1 兒童",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAeCbTrGygE4_uzH0tj_DTbI3KKdnoQ-66HvcsNlfYVxQPtIEx94CzY2pXOnEqdq6FuX7wN-DhOHQPde4bxA4F3BCP7FN5iIfmUJNn7PT9aQFYAf9SvhzNGXL8ziV6L53mb9MeTbWDT1WJg4zcMfSvp1Mv21IiatJBbRZrilIDpDHA1o8leWHUifwEN2S4aN9duWIv9AzqngFYHlaRSfm83EjpSie_ZKPMSnOQBzWGJl5eeYSL-ryZMDgEmgNzTolv5VpqE1PnA4Ydl",
    hasBriefing: true,
    briefing: {
      topic: "行前注意事項與行程細節確認",
      date: "2023年 11月 10日 (週五)",
      time: "19:30 - 20:30 (約 1 小時)",
      location: "Google Meet 線上會議",
      meetingLink: "https://meet.google.com/xxx-xxxx-xxx",
      outline: [
        "集合時間地點確認與機場報到流程",
        "京都當地天氣預報與洋蔥式穿著建議",
        "入境卡填寫教學與 Visit Japan Web 設定",
        "自由活動時間推薦景點 (清水寺周邊)",
        "Q&A 問題討論",
      ],
      documents: [
        { name: "行前手冊.pdf", type: "pdf", size: "2.4 MB" },
        { name: "常見問題 (FAQ)", type: "link", size: "外部連結", href: "#faq" },
      ],
    },
    faqs: [
      {
        question: "集合時間地點確認",
        answer: "集合地點位於桃園國際機場第二航廈 3 號櫃檯（長榮航空）。請務必於起飛前 3 小時（即早上 06:30）抵達現場與領隊會合，領取登機證並辦理行李託運。",
        icon: "flight_takeoff",
        color: "morandi-blue",
      },
      {
        question: "當地天氣與穿著建議",
        answer: "京都秋季氣溫約在 10°C 至 18°C 之間，早晚溫差較大。建議採用「洋蔥式穿搭」，內層穿著舒適透氣的長袖，外層搭配防風保暖的薄外套或風衣。",
        icon: "checkroom",
        color: "morandi-pink",
      },
      {
        question: "網卡與 Wi-Fi 設定",
        answer: "本次行程已包含每人一張 5GB 流量的日本上網 SIM 卡。領隊將於機場集合時統一發放，請於抵達日本後再插入手機使用。若需要 eSIM，請提前聯繫客服更換。",
        icon: "wifi",
        color: "morandi-green",
      },
      {
        question: "入境卡填寫教學",
        answer: "建議您在出發前下載 Visit Japan Web 並完成註冊。填寫時請參考行前手冊第 5 頁的範例。若不會操作，領隊會在機場協助教學。",
        icon: "description",
        color: "morandi-yellow",
      },
      {
        question: "當地貨幣兌換",
        answer: "建議在台灣先行兌換日幣，匯率通常較佳。大部分商店可使用信用卡（Visa/Master/JCB），但部分小吃攤與神社僅收現金，建議每人準備約 3-5 萬日幣現金。",
        icon: "currency_exchange",
        color: "gray",
      },
    ],
    itinerary: {
      flight: {
        departure: "桃園 TPE 09:30",
        arrival: "關西 KIX 13:15",
        flightNo: "BR132",
      },
      hotel: {
        name: "京都格蘭比亞酒店",
        address: "京都市下京區烏丸通塩小路下ル",
        checkIn: "11/15 15:00",
        checkOut: "11/20 11:00",
      },
      days: [
        {
          day: 1,
          title: "抵達京都",
          activities: ["關西機場入境", "HARUKA 特急前往京都", "酒店 Check-in", "祇園花見小路散策"],
        },
        {
          day: 2,
          title: "嵐山一日遊",
          activities: ["嵐山竹林小徑", "天龍寺", "渡月橋", "嵯峨野觀光小火車"],
        },
        {
          day: 3,
          title: "東山區經典路線",
          activities: ["清水寺", "二年坂・三年坂", "八坂神社", "花見小路晚餐"],
        },
        {
          day: 4,
          title: "自由活動日",
          activities: ["推薦：伏見稻荷大社", "推薦：金閣寺", "推薦：錦市場"],
        },
        {
          day: 5,
          title: "返程",
          activities: ["酒店 Check-out", "京都車站購物", "HARUKA 前往關西機場", "返回台灣"],
        },
      ],
    },
  },
  "tokyo-disney": {
    id: "tokyo-disney",
    title: "東京迪士尼夢幻之旅",
    dateRange: "12/24 - 12/28, 2023",
    travelers: "2 成人",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCG3AJ90z0fRZUHbKu5cYlgYt0LZAkNc3uQYelVS-hJk9_kNA7CNAkyo4hBOCE25UqvUGwiMmQR2JEL8CE070Jx7fcBeNrNLbLY6AFWGqkW66DFMZQr3fpDGCa7oTu1wRwgqbdl812uGJyDjnUf7_BDfbts_gT17M79ShHbBgfODyTFMzxfn33oBnZLoKzkKCN5WiNwVJISRRQKf_MH6rzMsfQ2Wc8hcCu8tuHIRxOUXmUdukUK9SXVV4WsT1YiL5SgpqQJ0N9qk6za",
    hasBriefing: false,
    itinerary: {
      flight: {
        departure: "桃園 TPE 08:00",
        arrival: "成田 NRT 12:30",
        flightNo: "CI100",
      },
      hotel: {
        name: "東京迪士尼大使大飯店",
        address: "千葉県浦安市舞浜2-11",
        checkIn: "12/24 15:00",
        checkOut: "12/28 12:00",
      },
      days: [
        { day: 1, title: "抵達東京", activities: ["成田機場入境", "利木津巴士前往迪士尼", "飯店 Check-in"] },
        { day: 2, title: "迪士尼樂園", activities: ["東京迪士尼樂園全日遊玩", "聖誕特別遊行", "煙火秀"] },
        { day: 3, title: "迪士尼海洋", activities: ["東京迪士尼海洋全日遊玩", "聖誕港灣秀"] },
        { day: 4, title: "自由活動", activities: ["推薦：IKSPIARI 購物", "推薦：再訪樂園"] },
        { day: 5, title: "返程", activities: ["飯店 Check-out", "利木津巴士前往成田", "返回台灣"] },
      ],
    },
  },
};

type TabType = "itinerary" | "briefing";

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;
  const order = ordersData[orderId];

  const [activeTab, setActiveTab] = useState<TabType>("itinerary");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  if (!order) {
    return (
      <div className="min-h-screen bg-[#F5F4F0] flex items-center justify-center">
        <div className="text-center">
          <span className="material-icons-outlined text-[#D8D0C9] text-6xl mb-4">error_outline</span>
          <p className="text-[#949494]">找不到此訂單</p>
          <Link href="/orders" className="mt-4 inline-block text-[#94A3B8] font-medium">
            返回訂單列表
          </Link>
        </div>
      </div>
    );
  }

  const getColorClass = (color: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      "morandi-blue": { bg: "bg-[#A5BCCF]/20", text: "text-[#A5BCCF]" },
      "morandi-pink": { bg: "bg-[#CFA5A5]/20", text: "text-[#CFA5A5]" },
      "morandi-green": { bg: "bg-[#A8BFA6]/20", text: "text-[#A8BFA6]" },
      "morandi-yellow": { bg: "bg-[#E0D6A8]/20", text: "text-[#B8A065]" },
      gray: { bg: "bg-gray-200", text: "text-gray-500" },
    };
    return colors[color] || colors.gray;
  };

  return (
    <div className="bg-[#F5F4F0] font-sans antialiased text-[#5C5C5C] min-h-screen flex flex-col">
      {/* 背景光暈 */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-[5%] -left-[15%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-[#D8D0C9] opacity-40 blur-[90px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[250px] sm:w-[450px] h-[250px] sm:h-[450px] bg-[#C8D6D3] opacity-40 blur-[90px] rounded-full" />
        <div className="absolute top-[40%] left-[20%] w-[200px] sm:w-[300px] h-[200px] sm:h-[300px] bg-[#E6DFDA] opacity-30 blur-[70px] rounded-full" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 px-4 sm:px-6 pt-6 pb-4 flex items-center gap-3">

        {/* 切換標籤放在中間 */}
        {order.hasBriefing ? (
          <div className="flex-1 flex gap-2 p-1 bg-white/60 backdrop-blur-xl rounded-full border border-white/50">
            <button
              onClick={() => setActiveTab("itinerary")}
              className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                activeTab === "itinerary"
                  ? "bg-[#94A3B8] text-white shadow-lg shadow-[#94A3B8]/30"
                  : "text-[#949494] hover:text-[#5C5C5C]"
              }`}
            >
              <span className="material-icons-round text-lg">map</span>
              行程資訊
            </button>
            <button
              onClick={() => setActiveTab("briefing")}
              className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                activeTab === "briefing"
                  ? "bg-[#E0D6A8] text-white shadow-lg shadow-[#E0D6A8]/30"
                  : "text-[#949494] hover:text-[#5C5C5C]"
              }`}
            >
              <span className="material-icons-round text-lg">groups</span>
              說明會
            </button>
          </div>
        ) : (
          <div className="flex-1" />
        )}

        <button className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-white/70 backdrop-blur-xl border border-white/50 shadow-sm text-[#5C5C5C] hover:text-[#94A3B8] transition-colors">
          <span className="material-icons-round text-xl">more_vert</span>
        </button>
      </header>

      {/* 主要內容 */}
      <main className="flex-1 w-full overflow-y-auto pb-24">

        {/* 行程封面圖 */}
        <div className="px-4 sm:px-6 mb-4">
          <div className="relative w-full h-48 rounded-2xl overflow-hidden shadow-lg group">
            <img
              src={order.image}
              alt={order.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-sm border border-white/30 text-[10px] text-white font-medium mb-2">
                <span className="material-icons-round text-[12px]">flight_takeoff</span>
                即將出發
              </div>
              <h2 className="text-xl font-bold text-white tracking-wide">{order.title}</h2>
              <p className="text-white/80 text-sm mt-1">{order.dateRange} · {order.travelers}</p>
            </div>
          </div>
        </div>

        {/* 快捷按鈕 - 放在照片下方 */}
        <div className="px-4 sm:px-6 mb-4">
          <div className="flex gap-3">
            {activeTab === "briefing" && order.briefing ? (
              <>
                <button className="flex-1 py-3 rounded-xl border border-[#C5B6AF]/50 text-[#C5B6AF] font-bold text-sm bg-white/60 backdrop-blur-xl hover:bg-white/80 transition-colors flex items-center justify-center gap-2">
                  <span className="material-icons-round text-lg">edit_calendar</span>
                  加入行事曆
                </button>
                <button className="flex-1 py-3 rounded-xl bg-[#C5B6AF] hover:bg-[#B5A69F] text-white font-bold text-sm shadow-lg shadow-[#C5B6AF]/30 transition-all flex items-center justify-center gap-2">
                  <span className="material-icons-round text-lg">video_call</span>
                  進入會議
                </button>
              </>
            ) : (
              <>
                <button className="flex-1 py-3 rounded-xl border border-[#94A3B8]/50 text-[#94A3B8] font-bold text-sm bg-white/60 backdrop-blur-xl hover:bg-white/80 transition-colors flex items-center justify-center gap-2">
                  <span className="material-icons-round text-lg">support_agent</span>
                  聯繫客服
                </button>
                <button className="flex-1 py-3 rounded-xl bg-[#94A3B8] hover:bg-[#8291A6] text-white font-bold text-sm shadow-lg shadow-[#94A3B8]/30 transition-all flex items-center justify-center gap-2">
                  <span className="material-icons-round text-lg">share</span>
                  分享行程
                </button>
              </>
            )}
          </div>
        </div>

        {/* 內容區域 */}
        <div className="px-4 sm:px-6 space-y-4">
          {/* ========== 行程資訊 Tab ========== */}
          {activeTab === "itinerary" && order.itinerary && (
            <>
              {/* 航班資訊 */}
              <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-1 h-5 bg-[#94A3B8] rounded-full" />
                  <h3 className="font-bold text-[#5C5C5C]">航班資訊</h3>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1 text-center">
                    <p className="text-xs text-[#949494] mb-1">出發</p>
                    <p className="font-bold text-[#5C5C5C]">{order.itinerary.flight.departure.split(" ")[0]}</p>
                    <p className="text-sm text-[#949494]">{order.itinerary.flight.departure.split(" ")[1]}</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-[#949494] mb-1">{order.itinerary.flight.flightNo}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#94A3B8]" />
                      <div className="w-16 h-0.5 bg-[#E8E2DD]" />
                      <span className="material-icons-round text-[#94A3B8] text-lg">flight</span>
                      <div className="w-16 h-0.5 bg-[#E8E2DD]" />
                      <div className="w-2 h-2 rounded-full bg-[#94A3B8]" />
                    </div>
                  </div>
                  <div className="flex-1 text-center">
                    <p className="text-xs text-[#949494] mb-1">抵達</p>
                    <p className="font-bold text-[#5C5C5C]">{order.itinerary.flight.arrival.split(" ")[0]}</p>
                    <p className="text-sm text-[#949494]">{order.itinerary.flight.arrival.split(" ")[1]}</p>
                  </div>
                </div>
              </div>

              {/* 住宿資訊 */}
              <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-1 h-5 bg-[#CFA5A5] rounded-full" />
                  <h3 className="font-bold text-[#5C5C5C]">住宿資訊</h3>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#CFA5A5]/20 flex items-center justify-center shrink-0">
                    <span className="material-icons-round text-[#CFA5A5]">hotel</span>
                  </div>
                  <div>
                    <p className="font-bold text-[#5C5C5C]">{order.itinerary.hotel.name}</p>
                    <p className="text-xs text-[#949494] mt-1">{order.itinerary.hotel.address}</p>
                    <div className="flex gap-4 mt-2 text-xs">
                      <span className="text-[#949494]">入住：{order.itinerary.hotel.checkIn}</span>
                      <span className="text-[#949494]">退房：{order.itinerary.hotel.checkOut}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 每日行程 */}
              <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-1 h-5 bg-[#A8BFA6] rounded-full" />
                  <h3 className="font-bold text-[#5C5C5C]">每日行程</h3>
                </div>
                <div className="space-y-4">
                  {order.itinerary.days.map((day, index) => (
                    <div key={day.day} className="relative pl-6">
                      {index < order.itinerary!.days.length - 1 && (
                        <div className="absolute left-[7px] top-6 w-0.5 h-[calc(100%+8px)] bg-[#E8E2DD]" />
                      )}
                      <div className="absolute left-0 top-0 w-4 h-4 rounded-full bg-[#A8BFA6] flex items-center justify-center">
                        <span className="text-[8px] font-bold text-white">{day.day}</span>
                      </div>
                      <div className="pb-4">
                        <p className="font-bold text-[#5C5C5C] text-sm">{day.title}</p>
                        <ul className="mt-2 space-y-1">
                          {day.activities.map((activity, i) => (
                            <li key={i} className="text-xs text-[#949494] flex items-start gap-1.5">
                              <span className="material-icons-round text-[10px] mt-0.5 text-[#C5B6AF]">circle</span>
                              {activity}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ========== 說明會 Tab ========== */}
          {activeTab === "briefing" && order.briefing && (
            <>
              {/* 說明會資訊 */}
              <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-1 h-5 bg-[#E0D6A8] rounded-full" />
                  <h3 className="font-bold text-[#5C5C5C]">說明會資訊</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#E0D6A8]/20 flex items-center justify-center shrink-0">
                      <span className="material-icons-round text-[#B8A065]">topic</span>
                    </div>
                    <div>
                      <p className="text-xs text-[#949494] mb-0.5">說明會主題</p>
                      <p className="font-medium text-[#5C5C5C]">{order.briefing.topic}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#C5B6AF]/20 flex items-center justify-center shrink-0">
                      <span className="material-icons-round text-[#C5B6AF]">event</span>
                    </div>
                    <div>
                      <p className="text-xs text-[#949494] mb-0.5">時間與日期</p>
                      <p className="font-medium text-[#5C5C5C]">{order.briefing.date}</p>
                      <p className="text-sm text-[#949494]">{order.briefing.time}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#A5BCCF]/20 flex items-center justify-center shrink-0">
                      <span className="material-icons-round text-[#A5BCCF]">videocam</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-[#949494] mb-0.5">地點 / 連結</p>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-[#5C5C5C]">{order.briefing.location}</span>
                        <button className="p-1.5 rounded-full hover:bg-[#94A3B8]/10 text-[#A5BCCF] transition-colors">
                          <span className="material-icons-round text-lg">open_in_new</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 內容大綱 */}
              <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-1 h-5 bg-[#A8BFA6] rounded-full" />
                  <h3 className="font-bold text-[#5C5C5C]">內容大綱</h3>
                </div>
                <ul className="space-y-3 pl-1">
                  {order.briefing.outline.map((item, index) => (
                    <li key={index} className="flex gap-3 text-sm text-[#5C5C5C] items-start">
                      <span className="text-[#A8BFA6] font-bold text-xs mt-0.5 bg-[#A8BFA6]/10 px-1.5 py-0.5 rounded">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 相關文件 */}
              <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-1 h-5 bg-[#A5BCCF] rounded-full" />
                  <h3 className="font-bold text-[#5C5C5C]">相關文件與連結</h3>
                </div>
                <div className="grid gap-3">
                  {order.briefing.documents.map((doc, index) => (
                    <button
                      key={index}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/60 border border-white/50 hover:bg-white/90 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform ${
                          doc.type === "pdf" ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-500"
                        }`}>
                          <span className="material-icons-round">
                            {doc.type === "pdf" ? "picture_as_pdf" : "help_outline"}
                          </span>
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-bold text-[#5C5C5C]">{doc.name}</div>
                          <div className="text-[10px] text-[#949494]">{doc.size}</div>
                        </div>
                      </div>
                      <span className="material-icons-round text-[#949494] group-hover:text-[#5C5C5C]">
                        {doc.type === "pdf" ? "download" : "chevron_right"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 常見問題 FAQ */}
              {order.faqs && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-1">
                    <span className="material-icons-round text-[#949494]">help_outline</span>
                    <h3 className="font-bold text-[#5C5C5C]">常見問題</h3>
                  </div>
                  {order.faqs.map((faq, index) => {
                    const colorClass = getColorClass(faq.color);
                    return (
                      <div
                        key={index}
                        className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 shadow-sm overflow-hidden"
                      >
                        <button
                          onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                          className="w-full flex items-center justify-between p-4 hover:bg-white/40 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full ${colorClass.bg} ${colorClass.text} flex items-center justify-center shrink-0`}>
                              <span className="material-icons-round text-lg">{faq.icon}</span>
                            </div>
                            <span className="font-bold text-[#5C5C5C] text-[15px] text-left">{faq.question}</span>
                          </div>
                          <span className={`material-icons-round text-[#949494] transition-transform duration-300 ${expandedFaq === index ? "rotate-180" : ""}`}>
                            expand_more
                          </span>
                        </button>
                        {expandedFaq === index && (
                          <div className="px-4 pb-4 pt-0 text-sm text-[#5C5C5C] leading-relaxed border-t border-[#E8E2DD] mx-4 pt-3">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
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
