import { RecommendedTrip, ItineraryDay, TypeConfig, AutoReply, SuggestionItem } from "./types";

export const recommendedTrips: RecommendedTrip[] = [
  {
    id: 1,
    title: "京都秋日賞楓五日遊",
    description: "清水寺、嵐山小火車、和服體驗",
    duration: "5天4夜",
    price: "NT$32,900",
    note: "含機票/住宿",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCBqTUmBLXZhqnZPcQe1nIwGuRohyZdFc47OG_sWdrh-8saBlb34Y3uBw_YSd3Ydp2nV6EPktexnXTw9wPF6eb36Rn8uQRi2rpc1GaDxQWmwktHbyyAER_xn5iJHi57wdMmjPJMAPOHV6gWVqxjjPN6x3WoQ896n7YFsHWPU3QML6BZE7hdafcgPI1Fec6SXhNEWVo_t1Q8zw0I0CXTZmbO0cZY5vS3xQ7FdyX36K86T9W5NsNVF5QEMEo3e6tavseKbCcuFdaXTaUQ",
  },
  {
    id: 2,
    title: "關西三都深度漫遊",
    description: "京都、大阪、奈良一次滿足",
    duration: "6天5夜",
    price: "NT$28,500",
    note: "特色民宿",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCBqTUmBLXZhqnZPcQe1nIwGuRohyZdFc47OG_sWdrh-8saBlb34Y3uBw_YSd3Ydp2nV6EPktexnXTw9wPF6eb36Rn8uQRi2rpc1GaDxQWmwktHbyyAER_xn5iJHi57wdMmjPJMAPOHV6gWVqxjjPN6x3WoQ896n7YFsHWPU3QML6BZE7hdafcgPI1Fec6SXhNEWVo_t1Q8zw0I0CXTZmbO0cZY5vS3xQ7FdyX36K86T9W5NsNVF5QEMEo3e6tavseKbCcuFdaXTaUQ",
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

export const kyotoItinerary: ItineraryDay[] = [
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

export const typeConfig: Record<string, TypeConfig> = {
  attraction: { label: "景點", color: "text-[#A5BCCF]", bgColor: "bg-[#A5BCCF]/10" },
  experience: { label: "體驗", color: "text-[#CFA5A5]", bgColor: "bg-[#CFA5A5]/10" },
  food: { label: "美食", color: "text-[#A8BFA6]", bgColor: "bg-[#A8BFA6]/10" },
  shopping: { label: "購物", color: "text-[#D4A5CF]", bgColor: "bg-[#D4A5CF]/10" },
  transport: { label: "交通", color: "text-[#B0B0B0]", bgColor: "bg-[#B0B0B0]/10" },
};

export const autoReplies: AutoReply[] = [
  {
    keywords: ["日本", "京都", "大阪", "東京", "北海道", "沖繩", "奈良"],
    response:
      "日本真的超讚！🇯🇵 威廉最愛京都的古色古香和大阪的美食。這邊有幾個我精心整理的行程，保證讓你玩得盡興！",
    showRecommendations: true,
  },
  {
    keywords: ["泰國", "曼谷", "普吉島", "清邁", "芭達雅"],
    response:
      "泰國是CP值超高的選擇！🇹🇭 威廉推薦曼谷的街頭美食和按摩，普吉島的海灘也很棒。目前行程規劃中，敬請期待！",
  },
  {
    keywords: ["韓國", "首爾", "釜山", "濟州島"],
    response:
      "韓國很適合說走就走！🇰🇷 首爾的咖啡廳、美妝店、炸雞配啤酒，威廉每次去都意猶未盡。行程即將上線！",
  },
  {
    keywords: ["歐洲", "法國", "巴黎", "義大利", "英國", "倫敦"],
    response:
      "歐洲是威廉的夢想清單！🇪🇺 目前正在規劃深度行程，會包含當地人才知道的私房景點，請再等等唷！",
  },
  {
    keywords: ["預算", "便宜", "省錢", "平價", "窮遊", "多少錢"],
    response:
      "省錢旅遊威廉最在行！💰 通常日本5天4夜抓3萬左右，東南亞更便宜大概1.5-2萬。想知道更詳細的預算分配嗎？",
  },
  {
    keywords: ["美食", "吃", "餐廳", "小吃", "推薦吃"],
    response:
      "說到吃威廉可以講三天三夜！🍜 每個行程我都會特別標註必吃美食，從米其林到路邊攤通通有。告訴我你想去哪，我推薦給你！",
  },
  {
    keywords: ["幾天", "天數", "多久", "請假"],
    response:
      "威廉覺得理想天數要看地點～日本建議5-7天比較充裕，東南亞4-5天也可以玩得很開心。你有目的地了嗎？",
  },
  {
    keywords: ["自由行", "跟團", "怎麼玩"],
    response:
      "威廉強烈推薦自由行！🎒 雖然要自己做功課，但能按自己步調走超自在。我規劃的行程都很適合自由行新手，有詳細交通指引！",
  },
  {
    keywords: ["機票", "飛機", "航班"],
    response:
      "機票威廉建議用Skyscanner或Google Flights比價！✈️ 通常提早2-3個月買最划算，記得開無痕模式避免被加價哦～",
  },
  {
    keywords: ["住宿", "飯店", "民宿", "旅館"],
    response:
      "住宿威廉愛用Booking跟Agoda！🏨 商務旅館CP值高，想體驗在地可以選民宿。行程裡都有推薦住宿區域給你參考！",
  },
  {
    keywords: ["謝謝", "感謝", "太棒了", "好的"],
    response: "不客氣！有任何問題隨時問威廉～祝你旅途愉快！✨",
  },
  {
    keywords: ["哈囉", "你好", "hi", "hello", "嗨"],
    response: "嗨嗨！我是威廉的AI替身 👋 今天想聊什麼呢？告訴我你想去哪裡玩，我來幫你規劃！",
  },
];

export const WILLIAM_USER_ID = process.env.NEXT_PUBLIC_WILLIAM_USER_ID || "";
export const WILLIAM_DEFAULT_AVATAR =
  "https://lh3.googleusercontent.com/a/ACg8ocI7lQb0xdCXh7lMBj07f2YhAY0p3X0XgqXP8rqYQHXu1uRBYuI=s96-c";

export const kyotoSuggestions: SuggestionItem[] = [
  {
    id: "s1",
    title: "伏見稻荷大社",
    type: "attraction",
    description: "千本鳥居聞名遐邇",
    image: "https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=400&h=300&fit=crop",
  },
  {
    id: "s2",
    title: "南禪寺 順正湯豆腐",
    type: "food",
    description: "百年老字號料理",
    image: "https://images.unsplash.com/photo-1540648639573-8c848de23f0a?w=400&h=300&fit=crop",
  },
  {
    id: "s3",
    title: "嵐山竹林小徑",
    type: "attraction",
    description: "充滿禪意的散步道",
    image: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&h=300&fit=crop",
  },
  {
    id: "s4",
    title: "京都陶藝教室",
    type: "experience",
    description: "手作獨一無二紀念品",
  },
  {
    id: "s5",
    title: "清水寺",
    type: "attraction",
    description: "京都最著名的古寺",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=300&fit=crop",
  },
  {
    id: "s6",
    title: "一蘭拉麵",
    type: "food",
    description: "獨特的單人座位體驗",
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop",
  },
  {
    id: "s7",
    title: "金閣寺",
    type: "attraction",
    description: "金碧輝煌的世界遺產",
    image: "https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=400&h=300&fit=crop",
  },
  {
    id: "s8",
    title: "和服租借體驗",
    type: "experience",
    description: "穿著和服漫步古都",
    image: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400&h=300&fit=crop",
  },
  {
    id: "s9",
    title: "京都威斯汀酒店",
    type: "hotel",
    description: "五星級奢華住宿",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop",
  },
  {
    id: "s10",
    title: "祇園白川",
    type: "attraction",
    description: "傳統花街風情",
    image: "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=400&h=300&fit=crop",
  },
];
