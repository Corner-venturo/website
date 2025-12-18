"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import MobileNav from "@/components/MobileNav";
import SideDrawer from "@/components/SideDrawer";
import { DrawerItem } from "@/types/wishlist.types";
import { getSupabaseClient } from "@/lib/supabase";

// 推薦行程資料
const recommendedTrips = [
  {
    id: 1,
    title: "京都秋日賞楓五日遊",
    description: "清水寺、嵐山小火車、和服體驗",
    duration: "5天4夜",
    price: "NT$32,900",
    note: "含機票/住宿",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCBqTUmBLXZhqnZPcQe1nIwGuRohyZdFc47OG_sWdrh-8saBlb34Y3uBw_YSd3Ydp2nV6EPktexnXTw9wPF6eb36Rn8uQRi2rpc1GaDxQWmwktHbyyAER_xn5iJHi57wdMmjPJMAPOHV6gWVqxjjPN6x3WoQ896n7YFsHWPU3QML6BZE7hdafcgPI1Fec6SXhNEWVo_t1Q8zw0I0CXTZmbO0cZY5vS3xQ7FdyX36K86T9W5NsNVF5QEMEo3e6tavseKbCcuFdaXTaUQ",
  },
  {
    id: 2,
    title: "關西三都深度漫遊",
    description: "京都、大阪、奈良一次滿足",
    duration: "6天5夜",
    price: "NT$28,500",
    note: "特色民宿",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCBqTUmBLXZhqnZPcQe1nIwGuRohyZdFc47OG_sWdrh-8saBlb34Y3uBw_YSd3Ydp2nV6EPktexnXTw9wPF6eb36Rn8uQRi2rpc1GaDxQWmwktHbyyAER_xn5iJHi57wdMmjPJMAPOHV6gWVqxjjPN6x3WoQ896n7YFsHWPU3QML6BZE7hdafcgPI1Fec6SXhNEWVo_t1Q8zw0I0CXTZmbO0cZY5vS3xQ7FdyX36K86T9W5NsNVF5QEMEo3e6tavseKbCcuFdaXTaUQ",
  },
  {
    id: 3,
    title: "京都職人文化體驗",
    description: "茶道、花道、陶藝製作",
    duration: "5天4夜",
    price: "NT$35,000",
    note: "精緻小團",
    image: null,
  },
];

// 五天京都行程資料
const kyotoItinerary = [
  {
    day: 1,
    date: "11月25日 (五)",
    items: [
      { time: "09:00", title: "清水寺", type: "attraction", description: "京都最著名的古老寺院" },
      { time: "11:30", title: "和服租借體驗", type: "experience", description: "穿著和服漫步古都" },
      { time: "13:00", title: "二年坂・三年坂", type: "attraction", description: "傳統石板街道散步" },
      { time: "18:00", title: "祇園花見小路", type: "food", description: "享用京都懷石料理" },
    ],
  },
  {
    day: 2,
    date: "11月26日 (六)",
    items: [
      { time: "08:30", title: "伏見稻荷大社", type: "attraction", description: "千本鳥居參拜" },
      { time: "12:00", title: "錦市場", type: "food", description: "品嚐京都在地美食" },
      { time: "14:30", title: "金閣寺", type: "attraction", description: "世界文化遺產" },
      { time: "17:00", title: "北野天滿宮", type: "attraction", description: "賞楓名所" },
    ],
  },
  {
    day: 3,
    date: "11月27日 (日)",
    items: [
      { time: "09:00", title: "嵐山竹林", type: "attraction", description: "漫步竹林小徑" },
      { time: "10:30", title: "嵐山小火車", type: "experience", description: "沿著保津川賞楓" },
      { time: "13:00", title: "天龍寺", type: "attraction", description: "世界遺產庭園" },
      { time: "16:00", title: "渡月橋", type: "attraction", description: "嵐山地標夕陽" },
    ],
  },
  {
    day: 4,
    date: "11月28日 (一)",
    items: [
      { time: "09:30", title: "銀閣寺", type: "attraction", description: "東山文化代表" },
      { time: "11:00", title: "哲學之道", type: "attraction", description: "沿疏水道散步" },
      { time: "14:00", title: "南禪寺", type: "attraction", description: "禪宗名剎" },
      { time: "16:30", title: "茶道體驗", type: "experience", description: "學習日本茶道文化" },
    ],
  },
  {
    day: 5,
    date: "11月29日 (二)",
    items: [
      { time: "09:00", title: "東寺", type: "attraction", description: "五重塔與弘法市集" },
      { time: "11:30", title: "京都車站購物", type: "shopping", description: "伴手禮採買" },
      { time: "14:00", title: "返程", type: "transport", description: "關西機場出發" },
    ],
  },
];

const typeConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  attraction: { label: "景點", color: "text-[#A5BCCF]", bgColor: "bg-[#A5BCCF]/10" },
  experience: { label: "體驗", color: "text-[#CFA5A5]", bgColor: "bg-[#CFA5A5]/10" },
  food: { label: "美食", color: "text-[#A8BFA6]", bgColor: "bg-[#A8BFA6]/10" },
  shopping: { label: "購物", color: "text-[#D4A5CF]", bgColor: "bg-[#D4A5CF]/10" },
  transport: { label: "交通", color: "text-[#B0B0B0]", bgColor: "bg-[#B0B0B0]/10" },
};

interface Message {
  id: number;
  type: 'user' | 'ai';
  content: string;
  showRecommendations?: boolean;
  showItinerary?: boolean;
  tripTitle?: string;
}

// 自動回覆規則
const autoReplies: { keywords: string[]; response: string; showRecommendations?: boolean }[] = [
  {
    keywords: ['日本', '京都', '大阪', '東京', '北海道', '沖繩', '奈良'],
    response: '日本真的超讚！🇯🇵 威廉最愛京都的古色古香和大阪的美食。這邊有幾個我精心整理的行程，保證讓你玩得盡興！',
    showRecommendations: true,
  },
  {
    keywords: ['泰國', '曼谷', '普吉島', '清邁', '芭達雅'],
    response: '泰國是CP值超高的選擇！🇹🇭 威廉推薦曼谷的街頭美食和按摩，普吉島的海灘也很棒。目前行程規劃中，敬請期待！',
  },
  {
    keywords: ['韓國', '首爾', '釜山', '濟州島'],
    response: '韓國很適合說走就走！🇰🇷 首爾的咖啡廳、美妝店、炸雞配啤酒，威廉每次去都意猶未盡。行程即將上線！',
  },
  {
    keywords: ['歐洲', '法國', '巴黎', '義大利', '英國', '倫敦'],
    response: '歐洲是威廉的夢想清單！🇪🇺 目前正在規劃深度行程，會包含當地人才知道的私房景點，請再等等唷！',
  },
  {
    keywords: ['預算', '便宜', '省錢', '平價', '窮遊', '多少錢'],
    response: '省錢旅遊威廉最在行！💰 通常日本5天4夜抓3萬左右，東南亞更便宜大概1.5-2萬。想知道更詳細的預算分配嗎？',
  },
  {
    keywords: ['美食', '吃', '餐廳', '小吃', '推薦吃'],
    response: '說到吃威廉可以講三天三夜！🍜 每個行程我都會特別標註必吃美食，從米其林到路邊攤通通有。告訴我你想去哪，我推薦給你！',
  },
  {
    keywords: ['幾天', '天數', '多久', '請假'],
    response: '威廉覺得理想天數要看地點～日本建議5-7天比較充裕，東南亞4-5天也可以玩得很開心。你有目的地了嗎？',
  },
  {
    keywords: ['自由行', '跟團', '怎麼玩'],
    response: '威廉強烈推薦自由行！🎒 雖然要自己做功課，但能按自己步調走超自在。我規劃的行程都很適合自由行新手，有詳細交通指引！',
  },
  {
    keywords: ['機票', '飛機', '航班'],
    response: '機票威廉建議用Skyscanner或Google Flights比價！✈️ 通常提早2-3個月買最划算，記得開無痕模式避免被加價哦～',
  },
  {
    keywords: ['住宿', '飯店', '民宿', '旅館'],
    response: '住宿威廉愛用Booking跟Agoda！🏨 商務旅館CP值高，想體驗在地可以選民宿。行程裡都有推薦住宿區域給你參考！',
  },
  {
    keywords: ['謝謝', '感謝', '太棒了', '好的'],
    response: '不客氣！有任何問題隨時問威廉～祝你旅途愉快！✨',
  },
  {
    keywords: ['哈囉', '你好', 'hi', 'hello', '嗨'],
    response: '嗨嗨！我是威廉的AI替身 👋 今天想聊什麼呢？告訴我你想去哪裡玩，我來幫你規劃！',
  },
];

// William 的用戶 ID (網站擁有者)
const WILLIAM_USER_ID = process.env.NEXT_PUBLIC_WILLIAM_USER_ID || '';

// William 的預設頭像（避免載入時閃爍）
const WILLIAM_DEFAULT_AVATAR = 'https://lh3.googleusercontent.com/a/ACg8ocI7lQb0xdCXh7lMBj07f2YhAY0p3X0XgqXP8rqYQHXu1uRBYuI=s96-c';

export default function AIPlannerPage() {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      type: 'ai',
      content: '嗨！我是威廉的AI替身 ✨\n\n想去哪裡玩呢？告訴我你想去的國家或城市，我來幫你規劃一趟完美的旅程！',
    }
  ]);
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [addedItems, setAddedItems] = useState<DrawerItem[]>([]);
  const [williamAvatar, setWilliamAvatar] = useState<string>(WILLIAM_DEFAULT_AVATAR);

  // 取得 William 的頭像
  useEffect(() => {
    const fetchWilliamProfile = async () => {
      if (!WILLIAM_USER_ID) return;

      const supabase = getSupabaseClient();
      const { data } = await supabase
        .from('profiles')
        .select('avatar_url, display_name')
        .eq('id', WILLIAM_USER_ID)
        .single();

      if (data?.avatar_url) {
        setWilliamAvatar(data.avatar_url);
      }
    };

    fetchWilliamProfile();
  }, []);

  const handleAddItem = (item: DrawerItem) => {
    setAddedItems([...addedItems, item]);
    // 加入 AI 訊息通知用戶已新增
    const aiResponse: Message = {
      id: Date.now(),
      type: 'ai',
      content: `已將「${item.name}」加入行程！${item.description}`,
    };
    setMessages(prev => [...prev, aiResponse]);
    setIsDrawerOpen(false);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      type: 'user',
      content: inputValue.trim(),
    };

    // 找到匹配的自動回覆
    const input = inputValue.trim().toLowerCase();
    let matchedReply = autoReplies.find(rule =>
      rule.keywords.some(keyword => input.includes(keyword.toLowerCase()))
    );

    // 預設回覆
    const aiResponse: Message = {
      id: Date.now() + 1,
      type: 'ai',
      content: matchedReply?.response || `「${inputValue.trim()}」聽起來很有趣！威廉正在研究這個目的地，之後會有更完整的行程推薦給你～有其他想去的地方也可以告訴我！`,
      showRecommendations: matchedReply?.showRecommendations || false,
    };

    setMessages([...messages, userMessage, aiResponse]);
    setInputValue("");
    setHasStartedChat(true);
  };

  const handleTripClick = (tripTitle: string) => {
    // 用戶選擇行程
    const userMessage: Message = {
      id: Date.now(),
      type: 'user',
      content: `我想看「${tripTitle}」的詳細行程`,
    };

    // AI 回覆行程內容
    const aiResponse: Message = {
      id: Date.now() + 1,
      type: 'ai',
      content: `好的！以下是「${tripTitle}」的完整行程規劃：`,
      showItinerary: true,
      tripTitle: tripTitle,
    };

    setMessages([...messages, userMessage, aiResponse]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="bg-[#F7F5F2] font-sans antialiased text-gray-900 min-h-screen flex flex-col">
      {/* 背景紋理 */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-5">
        <img
          alt="Background Texture"
          className="w-full h-full object-cover filter blur-3xl scale-110"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQxdpG2RE5XLEWK6ikPUSOrtPRwSqlSU7iJ6pbjL8J7PW_cnbAoiwIYp6mTaBqkRK3mdYLRXVbNS2VRUP8uJgT-igXHym-u1wTQEMDlwCL3fHMRn2U4GMvmxMX-_aTrnY_-c3u_aoifLUZeMRnTDhVN8WeRyzwtSz7HYK2vgEvLpa7bVPuUZdY_bnLC15Ron7tOGB0esLisiM305SNNU1301EMQh4eugnCtB4j9ZK_jnZsZcxx5Put2e17rOhKmyhvmLCi84G_53Dk"
        />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 px-5 py-4 bg-[#F7F5F2]/95 backdrop-blur-md flex items-center gap-3">
        <Link
          href="/"
          className="hidden lg:flex w-10 h-10 items-center justify-center rounded-full bg-white shadow-sm hover:shadow-md transition-all active:scale-95 shrink-0"
        >
          <span className="material-icons-round text-gray-800 text-[22px]">arrow_back</span>
        </Link>
        <div className="flex-1 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#Cfb9a5] flex items-center justify-center shadow-sm overflow-hidden">
            <Image src={williamAvatar} alt="威廉" width={32} height={32} className="w-full h-full object-cover" priority />
          </div>
          <span className="font-bold text-gray-800">跟威廉聊聊</span>
        </div>
      </header>

      {/* 主要內容 */}
      <main className="relative z-10 w-full flex-1 flex flex-col pb-40 overflow-hidden">

        {/* 對話區域 */}
        {messages.length > 0 && (
          <section className="px-5 pt-2 pb-2 flex flex-col gap-4 overflow-y-auto hide-scrollbar flex-1">
            {messages.map((message) => (
              <div key={message.id}>
                {message.type === 'user' ? (
                  /* 用戶訊息 */
                  <div className="flex gap-3 flex-row-reverse">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0 shadow-sm overflow-hidden border-2 border-white">
                      <span className="material-icons-round text-gray-500 text-[18px]">person</span>
                    </div>
                    <div className="flex flex-col gap-1 items-end max-w-[85%]">
                      <div className="bg-[#D6C4B4] text-white rounded-2xl rounded-tr-none px-4 py-3 shadow-sm text-sm leading-relaxed">
                        {message.content}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* AI 訊息 */
                  <div className="flex gap-3 w-full animate-fade-in">
                    <div className="w-8 h-8 rounded-full bg-[#Cfb9a5] flex items-center justify-center shrink-0 shadow-sm ring-2 ring-white overflow-hidden">
                      <Image src={williamAvatar} alt="威廉" width={32} height={32} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col gap-3 items-start flex-1 min-w-0">
                      <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-sm text-sm text-gray-700 leading-relaxed border border-gray-100 max-w-[95%]">
                        {message.content}
                      </div>

                      {/* 每日行程 */}
                      {message.showItinerary && (
                        <div className="w-full space-y-3">
                          {kyotoItinerary.map((day) => (
                            <div key={day.day} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                              <div className="bg-[#Cfb9a5]/10 px-4 py-2 border-b border-gray-100">
                                <div className="flex items-center gap-2">
                                  <span className="w-6 h-6 rounded-full bg-[#Cfb9a5] text-white text-xs font-bold flex items-center justify-center">
                                    {day.day}
                                  </span>
                                  <span className="font-bold text-gray-800 text-sm">{day.date}</span>
                                </div>
                              </div>
                              <div className="p-3 space-y-2">
                                {day.items.map((item, idx) => {
                                  const config = typeConfig[item.type];
                                  return (
                                    <div key={idx} className="flex gap-3 items-start">
                                      <span className="text-[11px] text-gray-400 font-medium w-12 shrink-0 pt-0.5">{item.time}</span>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium text-gray-800 text-sm">{item.title}</span>
                                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${config.bgColor} ${config.color}`}>
                                            {config.label}
                                          </span>
                                        </div>
                                        <p className="text-[11px] text-gray-500 mt-0.5">{item.description}</p>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                          <button
                            onClick={() => setIsDrawerOpen(true)}
                            className="w-full py-3 rounded-xl bg-[#Cfb9a5] text-white font-bold text-sm shadow-lg shadow-[#Cfb9a5]/30 hover:bg-[#b09b88] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                          >
                            <span className="material-icons-round text-lg">add_circle</span>
                            新增景點到行程
                          </button>
                        </div>
                      )}

                      {/* 推薦行程卡片 */}
                      {message.showRecommendations && (
                        <>
                          <div className="relative w-full">
                            <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar snap-x scroll-pl-0">
                              {recommendedTrips.slice(0, 2).map((trip) => (
                                <div
                                  key={trip.id}
                                  onClick={() => handleTripClick(trip.title)}
                                  className="min-w-[200px] max-w-[200px] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col snap-start shrink-0 cursor-pointer hover:shadow-md transition-all active:scale-95"
                                >
                                  <div className="h-24 w-full relative bg-gray-200">
                                    {trip.image ? (
                                      <img alt={trip.title} className="w-full h-full object-cover" src={trip.image} />
                                    ) : (
                                      <div className="w-full h-full bg-[#A8BFA6]/20 flex items-center justify-center">
                                        <span className="material-icons-round text-[#A8BFA6] text-4xl">landscape</span>
                                      </div>
                                    )}
                                    <span className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
                                      {trip.duration}
                                    </span>
                                  </div>
                                  <div className="p-2.5 flex flex-col gap-0.5">
                                    <h4 className="text-sm font-bold text-gray-800 line-clamp-1">{trip.title}</h4>
                                    <p className="text-[10px] text-gray-500 line-clamp-1">{trip.description}</p>
                                    <div className="flex justify-between items-end mt-1">
                                      <span className="text-[10px] text-gray-400">{trip.note}</span>
                                      <span className="text-sm font-bold text-[#Cfb9a5]">{trip.price}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                              {/* 更多行程提示 */}
                              <div className="min-w-[80px] flex items-center justify-center shrink-0">
                                <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#Cfb9a5] transition-colors">
                                  <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center">
                                    <span className="material-icons-round text-[20px]">arrow_forward</span>
                                  </div>
                                  <span className="text-[10px] font-medium">更多</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </section>
        )}

      </main>

      {/* 底部輸入框 */}
      <div className="fixed bottom-20 left-0 right-0 z-40 px-4 py-3 bg-[#F7F5F2]/95 backdrop-blur-md border-t border-gray-200/50">
        <div className="bg-white/85 backdrop-blur-xl rounded-full p-1 flex items-center shadow-lg border border-white/40 ring-1 ring-black/5">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 ml-1 text-gray-400">
            <span className="material-icons-round text-[18px]">mic</span>
          </div>
          <input
            className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-sm text-gray-700 placeholder-gray-400 px-3 py-2 min-w-0"
            placeholder="想去哪裡玩？"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button
            onClick={handleSendMessage}
            className="w-8 h-8 rounded-full bg-[#Cfb9a5] hover:bg-[#b09b88] flex items-center justify-center shrink-0 shadow-sm text-white transition-colors active:scale-95 mr-0.5"
          >
            <span className="material-icons-round text-[16px]">send</span>
          </button>
        </div>
      </div>

      {/* 底部導航 */}
      <MobileNav />

      {/* 新增景點抽屜 */}
      <SideDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSelectItem={handleAddItem}
      />

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
