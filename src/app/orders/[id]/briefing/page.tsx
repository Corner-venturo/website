"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";

// 模擬說明會資料
const briefingData: Record<string, {
  tripTitle: string;
  tripImage: string;
  topic: string;
  date: string;
  time: string;
  location: string;
  meetingLink: string;
  agenda: string[];
  documents: { name: string; size: string; type: "pdf" | "link" }[];
}> = {
  "kyoto-autumn": {
    tripTitle: "京都秋日賞楓五日遊",
    tripImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuAeCbTrGygE4_uzH0tj_DTbI3KKdnoQ-66HvcsNlfYVxQPtIEx94CzY2pXOnEqdq6FuX7wN-DhOHQPde4bxA4F3BCP7FN5iIfmUJNn7PT9aQFYAf9SvhzNGXL8ziV6L53mb9MeTbWDT1WJg4zcMfSvp1Mv21IiatJBbRZrilIDpDHA1o8leWHUifwEN2S4aN9duWIv9AzqngFYHlaRSfm83EjpSie_ZKPMSnOQBzWGJl5eeYSL-ryZMDgEmgNzTolv5VpqE1PnA4Ydl",
    topic: "行前注意事項與行程細節確認",
    date: "2023年 11月 10日 (週五)",
    time: "19:30 - 20:30 (約 1 小時)",
    location: "Google Meet 線上會議",
    meetingLink: "https://meet.google.com/xxx-xxxx-xxx",
    agenda: [
      "集合時間地點確認與機場報到流程",
      "京都當地天氣預報與洋蔥式穿著建議",
      "入境卡填寫教學與 Visit Japan Web 設定",
      "自由活動時間推薦景點 (清水寺周邊)",
      "Q&A 問題討論",
    ],
    documents: [
      { name: "行前手冊.pdf", size: "2.4 MB", type: "pdf" },
      { name: "常見問題 (FAQ)", size: "外部連結", type: "link" },
    ],
  },
  "okinawa-winter": {
    tripTitle: "沖繩冬季五日遊",
    tripImage: "https://images.unsplash.com/photo-1542640244-7e672d6cef4e?w=800",
    topic: "沖繩行前準備與注意事項",
    date: "2024年 12月 20日 (週五)",
    time: "20:00 - 21:00 (約 1 小時)",
    location: "Google Meet 線上會議",
    meetingLink: "https://meet.google.com/xxx-xxxx-xxx",
    agenda: [
      "桃園機場集合與報到流程",
      "沖繩天氣與穿著建議",
      "日本入境流程與 Visit Japan Web",
      "行程景點介紹與注意事項",
      "Q&A 問題討論",
    ],
    documents: [
      { name: "沖繩行前手冊.pdf", size: "3.1 MB", type: "pdf" },
      { name: "常見問題 (FAQ)", size: "外部連結", type: "link" },
    ],
  },
};

export default function BriefingPage() {
  const params = useParams();
  const orderId = params.id as string;
  const briefing = briefingData[orderId];

  if (!briefing) {
    return (
      <div className="min-h-screen bg-[#F0EEE6] flex items-center justify-center">
        <div className="text-center">
          <span className="material-icons-round text-gray-300 text-6xl mb-4">event_busy</span>
          <p className="text-gray-500">尚無說明會資訊</p>
          <Link href={`/orders/${orderId}`} className="mt-4 inline-block text-[#Cfb9a5] font-medium">
            返回行程
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F0EEE6] font-sans antialiased text-gray-900 min-h-screen flex flex-col">
      {/* 背景光暈 */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-[#A5BCCF]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-[20%] left-[-10%] w-80 h-80 bg-[#Cfb9a5]/20 rounded-full blur-3xl" />
        <div className="absolute top-[40%] right-[20%] w-64 h-64 bg-[#CFA5A5]/15 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-50 px-6 pt-12 pb-4 flex items-center justify-between">
        <Link
          href={`/orders/${orderId}`}
          className="bg-white/70 backdrop-blur-xl border border-white/60 w-10 h-10 flex items-center justify-center rounded-full shadow-sm text-gray-600 hover:text-[#Cfb9a5] transition-colors"
        >
          <span className="material-icons-round text-xl">arrow_back</span>
        </Link>
        <h1 className="text-lg font-bold text-gray-800 tracking-tight">行前說明會</h1>
        <div className="w-10" />
      </header>

      {/* 主要內容 */}
      <main className="relative z-10 flex-1 w-full overflow-y-auto pb-32">
        {/* 行程封面 */}
        <div className="px-6 mb-6">
          <div className="relative w-full h-48 rounded-2xl overflow-hidden shadow-lg group">
            <Image
              src={briefing.tripImage}
              alt={briefing.tripTitle}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-sm border border-white/30 text-[10px] text-white font-medium mb-2">
                <span className="material-icons-round text-[12px]">flight_takeoff</span>
                所屬行程
              </div>
              <h2 className="text-xl font-bold text-white tracking-wide">{briefing.tripTitle}</h2>
            </div>
          </div>
        </div>

        <div className="px-6 space-y-5">
          {/* 說明會資訊 */}
          <div className="bg-white/50 backdrop-blur-xl border border-white/40 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1 h-5 bg-[#E0D6A8] rounded-full" />
              <h3 className="font-bold text-gray-800">說明會資訊</h3>
            </div>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[#E0D6A8]/20 flex items-center justify-center shrink-0 text-yellow-700">
                  <span className="material-icons-round">topic</span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">說明會主題</p>
                  <p className="font-medium text-gray-800">{briefing.topic}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[#Cfb9a5]/20 flex items-center justify-center shrink-0 text-[#b09b88]">
                  <span className="material-icons-round">event</span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">時間與日期</p>
                  <p className="font-medium text-gray-800">{briefing.date}</p>
                  <p className="text-sm text-gray-600">{briefing.time}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[#A5BCCF]/20 flex items-center justify-center shrink-0 text-[#A5BCCF]">
                  <span className="material-icons-round">videocam</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-0.5">地點 / 連結</p>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-800">{briefing.location}</span>
                    <button className="p-1.5 rounded-full hover:bg-gray-100 text-[#A5BCCF] transition-colors">
                      <span className="material-icons-round text-lg">open_in_new</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 內容大綱 */}
          <div className="bg-white/50 backdrop-blur-xl border border-white/40 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1 h-5 bg-[#A8BFA6] rounded-full" />
              <h3 className="font-bold text-gray-800">內容大綱</h3>
            </div>
            <ul className="space-y-3 pl-1">
              {briefing.agenda.map((item, index) => (
                <li key={index} className="flex gap-3 text-sm text-gray-600 items-start">
                  <span className="text-[#A8BFA6] font-bold text-xs mt-0.5 bg-[#A8BFA6]/10 px-1.5 py-0.5 rounded">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 相關文件 */}
          <div className="bg-white/50 backdrop-blur-xl border border-white/40 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1 h-5 bg-[#A5BCCF] rounded-full" />
              <h3 className="font-bold text-gray-800">相關文件與連結</h3>
            </div>
            <div className="grid gap-3">
              {briefing.documents.map((doc, index) => (
                <button
                  key={index}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/60 border border-white/50 hover:bg-white/90 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform ${
                        doc.type === "pdf"
                          ? "bg-red-50 text-red-500"
                          : "bg-blue-50 text-blue-500"
                      }`}
                    >
                      <span className="material-icons-round">
                        {doc.type === "pdf" ? "picture_as_pdf" : "help_outline"}
                      </span>
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-bold text-gray-800">{doc.name}</div>
                      <div className="text-[10px] text-gray-500">{doc.size}</div>
                    </div>
                  </div>
                  <span className="material-icons-round text-gray-400 group-hover:text-gray-600">
                    {doc.type === "pdf" ? "download" : "chevron_right"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* 底部按鈕 */}
      <div className="fixed bottom-0 left-0 right-0 p-6 z-50">
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-white/20 flex gap-4">
          <button className="flex-1 py-3 rounded-xl border border-[#Cfb9a5]/50 text-[#Cfb9a5] font-bold text-sm bg-[#Cfb9a5]/5 hover:bg-[#Cfb9a5]/10 transition-colors flex items-center justify-center gap-2">
            <span className="material-icons-round text-lg">edit_calendar</span>
            加入行事曆
          </button>
          <button className="flex-1 py-3 rounded-xl bg-[#Cfb9a5] hover:bg-[#c0a996] text-white font-bold text-sm shadow-lg shadow-[#Cfb9a5]/30 transition-all active:scale-95 flex items-center justify-center gap-2">
            <span className="material-icons-round text-lg">video_call</span>
            進入會議
          </button>
        </div>
      </div>
    </div>
  );
}
