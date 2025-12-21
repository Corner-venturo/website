"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import MobileNav from "@/components/MobileNav";
import { useTripStore, Trip, TripItineraryItem } from "@/stores/trip-store";
import { useAuthStore } from "@/stores/auth-store";
import { CheckInScanner } from "@/components/check-in";

// 個別參與者出席狀態
interface ItemAttendance {
  oderId: string;
  status: "attending" | "not_attending" | "pending";
}

// 行程項目類型
interface ItineraryItem {
  id: string;
  time: string;
  title: string;
  icon: string;
  description?: string;
  paidBy?: string;
  amount?: string;
  color: "primary" | "blue" | "pink" | "green";
  category?: "景點" | "美食" | "體驗" | "住宿" | "交通" | "購物" | "其他";
  image?: string;
  // 出席詢問相關
  inquiryBy?: string; // 誰發起詢問 (participant id)
  attendanceList?: Record<string, "attending" | "not_attending" | "pending">; // 每個參與者的出席狀態
}

// 每日行程
interface DaySchedule {
  day: number;
  date: string;
  weekday: string;
  dateLabel: string;
  items: ItineraryItem[];
}

// 參與者
interface Participant {
  id: string;
  name: string;
  avatar: string;
}

// 訂單資料
interface OrderData {
  id: string;
  title: string;
  dateRange: string;
  startDate: string; // 行程開始日期 YYYY-MM-DD
  image: string;
  participants: Participant[];
  schedule: DaySchedule[];
  ownerId?: string; // 主揪的 participant id
}

// 沖繩行程資料（供 UUID 和 slug 共用）
const okinawaWinterData: OrderData = {
  id: "okinawa-winter",
  title: "沖繩冬季五日遊",
  dateRange: "2025/12/23 - 12/27",
  startDate: "2025-12-23",
  image: "https://images.unsplash.com/photo-1542640244-7e672d6cef4e?w=800",
  ownerId: "1", // 主揪是「你」
  participants: [
    { id: "1", name: "你", avatar: "" },
  ],
  schedule: [
    {
      day: 1,
      date: "23",
      weekday: "週一",
      dateLabel: "12月23日",
      items: [
        {
          id: "ok1-1",
          time: "12:00",
          title: "桃園機場集合",
          icon: "groups",
          description: "T1 泰越捷航空櫃檯集合",
          paidBy: "",
          amount: "",
          color: "primary",
          category: "交通",
        },
        {
          id: "ok1-2",
          time: "14:45",
          title: "桃園機場出發",
          icon: "flight_takeoff",
          description: "泰越捷航空 VZ568",
          paidBy: "",
          amount: "",
          color: "primary",
          category: "交通",
        },
        {
          id: "ok1-3",
          time: "17:10",
          title: "抵達那霸機場",
          icon: "flight_land",
          description: "搭乘單軌電車前往牧志站，約20分鐘",
          paidBy: "",
          amount: "",
          color: "blue",
          category: "交通",
        },
        {
          id: "ok1-4",
          time: "18:00",
          title: "飯店入住",
          icon: "hotel",
          description: "琉球Orion那霸國際通飯店 | 1-2-21 Asato, Naha | +81 98-866-5533",
          paidBy: "",
          amount: "",
          color: "green",
          category: "住宿",
          image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400",
        },
        {
          id: "ok1-5",
          time: "19:00",
          title: "國際通散策",
          icon: "storefront",
          description: "逛街購物、感受沖繩夜晚",
          paidBy: "",
          amount: "",
          color: "pink",
          category: "購物",
        },
        {
          id: "ok1-6",
          time: "20:30",
          title: "七輪燒肉晚餐",
          icon: "restaurant",
          description: "沖繩和牛燒肉",
          paidBy: "",
          amount: "",
          color: "primary",
          category: "美食",
          image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400",
        },
      ],
    },
    {
      day: 2,
      date: "24",
      weekday: "週二",
      dateLabel: "12月24日",
      items: [
        {
          id: "ok2-1",
          time: "08:00",
          title: "晨喚出發",
          icon: "wb_sunny",
          description: "準備前往北部",
          paidBy: "",
          amount: "",
          color: "green",
          category: "其他",
        },
        {
          id: "ok2-2",
          time: "10:00",
          title: "沖繩美麗海水族館",
          icon: "water",
          description: "黑潮之海、鯨鯊、魟魚",
          paidBy: "",
          amount: "",
          color: "blue",
          category: "景點",
          image: "https://images.unsplash.com/photo-1559494007-9f5847c49d94?w=400",
        },
        {
          id: "ok2-3",
          time: "15:00",
          title: "美國村",
          icon: "shopping_bag",
          description: "購物、美食、摩天輪",
          paidBy: "",
          amount: "",
          color: "pink",
          category: "購物",
          image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=400",
        },
        {
          id: "ok2-4",
          time: "20:00",
          title: "返回飯店",
          icon: "hotel",
          description: "休息準備明天行程",
          paidBy: "",
          amount: "",
          color: "green",
          category: "住宿",
        },
      ],
    },
    {
      day: 3,
      date: "25",
      weekday: "週三",
      dateLabel: "12月25日",
      items: [
        {
          id: "ok3-1",
          time: "08:00",
          title: "晨喚出發",
          icon: "wb_sunny",
          description: "聖誕節快樂！",
          paidBy: "",
          amount: "",
          color: "green",
          category: "其他",
        },
        {
          id: "ok3-2",
          time: "09:30",
          title: "殘波岬",
          icon: "landscape",
          description: "沖繩西海岸最大海岬",
          paidBy: "",
          amount: "",
          color: "blue",
          category: "景點",
          image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400",
        },
        {
          id: "ok3-3",
          time: "11:00",
          title: "BANTA CAFE",
          icon: "local_cafe",
          description: "絕景海景咖啡廳",
          paidBy: "",
          amount: "",
          color: "primary",
          category: "美食",
          image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400",
        },
        {
          id: "ok3-4",
          time: "14:00",
          title: "AEON MALL Okinawa Rycom",
          icon: "shopping_cart",
          description: "寶可夢中心、購物",
          paidBy: "",
          amount: "",
          color: "pink",
          category: "購物",
        },
        {
          id: "ok3-5",
          time: "17:00",
          title: "東南植物樂園",
          icon: "park",
          description: "熱帶植物園、燈飾",
          paidBy: "",
          amount: "",
          color: "green",
          category: "景點",
          image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400",
        },
        {
          id: "ok3-6",
          time: "20:00",
          title: "國際通無菜單料理",
          icon: "restaurant",
          description: "主廚特製晚餐",
          paidBy: "",
          amount: "",
          color: "primary",
          category: "美食",
        },
      ],
    },
    {
      day: 4,
      date: "26",
      weekday: "週四",
      dateLabel: "12月26日",
      items: [
        {
          id: "ok4-1",
          time: "08:00",
          title: "晨喚出發",
          icon: "wb_sunny",
          description: "前往南部區域",
          paidBy: "",
          amount: "",
          color: "green",
          category: "其他",
        },
        {
          id: "ok4-2",
          time: "10:00",
          title: "DMM Kariyushi水族館",
          icon: "water",
          description: "結合科技的新型水族館",
          paidBy: "",
          amount: "",
          color: "blue",
          category: "景點",
          image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400",
        },
        {
          id: "ok4-3",
          time: "13:00",
          title: "iias 沖繩豐崎",
          icon: "shopping_bag",
          description: "購物中心、午餐",
          paidBy: "",
          amount: "",
          color: "pink",
          category: "購物",
        },
        {
          id: "ok4-4",
          time: "15:00",
          title: "自由活動",
          icon: "explore",
          description: "自由探索或休息",
          paidBy: "",
          amount: "",
          color: "green",
          category: "其他",
        },
        {
          id: "ok4-5",
          time: "19:00",
          title: "Churasun 6 沖繩",
          icon: "celebration",
          description: "傳統表演晚餐秀",
          paidBy: "",
          amount: "",
          color: "primary",
          category: "體驗",
          image: "https://images.unsplash.com/photo-1528495612343-9ca9f4a4de28?w=400",
        },
      ],
    },
    {
      day: 5,
      date: "27",
      weekday: "週五",
      dateLabel: "12月27日",
      items: [
        {
          id: "ok5-1",
          time: "08:00",
          title: "晨喚",
          icon: "wb_sunny",
          description: "收拾行李、退房",
          paidBy: "",
          amount: "",
          color: "green",
          category: "其他",
        },
        {
          id: "ok5-2",
          time: "11:00",
          title: "敘敘苑燒肉 歌町店",
          icon: "restaurant",
          description: "最後的沖繩美食",
          paidBy: "",
          amount: "",
          color: "primary",
          category: "美食",
          image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",
        },
        {
          id: "ok5-3",
          time: "15:00",
          title: "前往那霸機場",
          icon: "airport_shuttle",
          description: "辦理登機手續",
          paidBy: "",
          amount: "",
          color: "blue",
          category: "交通",
        },
        {
          id: "ok5-4",
          time: "18:05",
          title: "那霸機場出發",
          icon: "flight_takeoff",
          description: "泰越捷航空 VZ569",
          paidBy: "",
          amount: "",
          color: "primary",
          category: "交通",
        },
        {
          id: "ok5-5",
          time: "18:45",
          title: "抵達桃園機場",
          icon: "flight_land",
          description: "結束美好的沖繩之旅",
          paidBy: "",
          amount: "",
          color: "green",
          category: "交通",
        },
      ],
    },
  ],
};

// 模擬訂單資料
const ordersData: Record<string, OrderData> = {
  // 用 UUID 也能找到沖繩行程
  "fe9b114d-f2b6-4d44-9352-ce9b9068b1f5": okinawaWinterData,
  "okinawa-winter": okinawaWinterData,
  "kyoto-autumn": {
    id: "kyoto-autumn",
    title: "京都秋日賞楓五日遊",
    dateRange: "2023/11/15 - 11/20",
    startDate: "2023-11-15",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAeCbTrGygE4_uzH0tj_DTbI3KKdnoQ-66HvcsNlfYVxQPtIEx94CzY2pXOnEqdq6FuX7wN-DhOHQPde4bxA4F3BCP7FN5iIfmUJNn7PT9aQFYAf9SvhzNGXL8ziV6L53mb9MeTbWDT1WJg4zcMfSvp1Mv21IiatJBbRZrilIDpDHA1o8leWHUifwEN2S4aN9duWIv9AzqngFYHlaRSfm83EjpSie_ZKPMSnOQBzWGJl5eeYSL-ryZMDgEmgNzTolv5VpqE1PnA4Ydl",
    participants: [
      { id: "1", name: "你", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBdWYYJ2ldikSJNzSIrJ8WHfZ_bWTBEojNa77kJR4ggJoqSpS3LoKPSDe3H-lhGy0nGJZHT7HGZa9dzYxFIjOmIuA1kH4_VWYnN7UM84eAGi66JzmJWezpvj4iwk06f5UvxgAwkq34Q7nOkmCgcbH-PeWX5n3_xoyiMxNd8pIKjF_VwyfSZhfJlU4ohY6Vfdn2Zs5aRGlhQiw94ZhCti2uyvQBer3RmcZSml2TdVB6ec--9BSUqmhPM6RoHLCjwOdfAB68_DxzQoghq" },
      { id: "2", name: "Alice", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDPzzadcLTbIg8xv27Pvg-gvrPko3q98kp8FvsDFy7YrfNQzmCz_5w6u6Nf1e6nShSLqSbHQTfruXobIC_Lb8iBHxAOu2Xu4xzbxgq_Dbnb1fJ4GqSSkwyMJG1ebvsW8sTi-EqJpRffTqPJ58DftKOxMCo-EngxBgy23uJ-gHlTOPQkJ8_AIdtHvp1M7TVckOwBJcgQeHV-pgH7IBH3bqD7A4gbEYoMJ2mJpFIorWjmbBDX7wB7lzhInwEyAhIIPwg1C5Tuiu2LjqKd" },
      { id: "3", name: "Bob", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDvQNq-jhI8bPHrQa9l-1RH1LWV5D7Uv4BUVhmAepBeBx3RMgUeZtPD2FeAvAcZFU7sz1Yh1qukLAkCEyzKldJhI1iOqRBvtObS8tmTsF49HrrnQy1XCQcBUCYxXrDXGAySJqbbQwprShe2_Hz-uNJxvXexme6C_HjJAc3tBIjN2oiDz5jo9yLSp7wOZhJr5jnA-K2Vs86wYAiWMSci66tVVO9a6Kf7ZZsGElKhGN9j9sohrcEOP7uqPKqfpOfCfj0HKEvDi5OiZbOs" },
      { id: "4", name: "Carol", avatar: "" },
      { id: "5", name: "David", avatar: "" },
    ],
    schedule: [
      {
        day: 1,
        date: "15",
        weekday: "週三",
        dateLabel: "11月15日",
        items: [
          {
            id: "1-1",
            time: "09:30",
            title: "關西機場接機",
            icon: "flight_land",
            description: "MK計程車預約單號 #99281",
            paidBy: "你",
            amount: "¥15,000",
            color: "primary",
            category: "交通",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCBqTUmBLXZhqnZPcQe1nIwGuRohyZdFc47OG_sWdrh-8saBlb34Y3uBw_YSd3Ydp2nV6EPktexnXTw9wPF6eb36Rn8uQRi2rpc1GaDxQWmwktHbyyAER_xn5iJHi57wdMmjPJMAPOHV6gWVqxjjPN6x3WoQ896n7YFsHWPU3QML6BZE7hdafcgPI1Fec6SXhNEWVo_t1Q8zw0I0CXTZmbO0cZY5vS3xQ7FdyX36K86T9W5NsNVF5QEMEo3e6tavseKbCcuFdaXTaUQ",
            // Alice 發起詢問，大家都已回覆
            inquiryBy: "2",
            attendanceList: {
              "1": "attending",
              "2": "attending",
              "3": "attending",
              "4": "attending",
              "5": "attending",
            },
          },
          {
            id: "1-2",
            time: "11:30",
            title: "祇園午餐：湯豆腐",
            icon: "restaurant",
            description: "已訂位 11:30, 奧丹清水店",
            paidBy: "Alice",
            amount: "¥8,000",
            color: "blue",
            category: "美食",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCBqTUmBLXZhqnZPcQe1nIwGuRohyZdFc47OG_sWdrh-8saBlb34Y3uBw_YSd3Ydp2nV6EPktexnXTw9wPF6eb36Rn8uQRi2rpc1GaDxQWmwktHbyyAER_xn5iJHi57wdMmjPJMAPOHV6gWVqxjjPN6x3WoQ896n7YFsHWPU3QML6BZE7hdafcgPI1Fec6SXhNEWVo_t1Q8zw0I0CXTZmbO0cZY5vS3xQ7FdyX36K86T9W5NsNVF5QEMEo3e6tavseKbCcuFdaXTaUQ",
            // 我發起詢問，部分人還沒回覆
            inquiryBy: "1",
            attendanceList: {
              "1": "attending",
              "2": "attending",
              "3": "attending",
              "4": "not_attending",
              "5": "pending",
            },
          },
          {
            id: "1-3",
            time: "14:00",
            title: "清水寺參拜",
            icon: "temple_buddhist",
            description: "紅葉季人多，建議提前入場",
            paidBy: "Bob",
            amount: "¥2,000",
            color: "pink",
            category: "景點",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCBqTUmBLXZhqnZPcQe1nIwGuRohyZdFc47OG_sWdrh-8saBlb34Y3uBw_YSd3Ydp2nV6EPktexnXTw9wPF6eb36Rn8uQRi2rpc1GaDxQWmwktHbyyAER_xn5iJHi57wdMmjPJMAPOHV6gWVqxjjPN6x3WoQ896n7YFsHWPU3QML6BZE7hdafcgPI1Fec6SXhNEWVo_t1Q8zw0I0CXTZmbO0cZY5vS3xQ7FdyX36K86T9W5NsNVF5QEMEo3e6tavseKbCcuFdaXTaUQ",
            // 尚未發起詢問
          },
        ],
      },
      {
        day: 2,
        date: "16",
        weekday: "週四",
        dateLabel: "11月16日",
        items: [
          {
            id: "2-1",
            time: "08:30",
            title: "嵐山竹林散步",
            icon: "forest",
            description: "建議早起避開人潮",
            paidBy: "你",
            amount: "免費",
            color: "green",
          },
          {
            id: "2-2",
            time: "12:00",
            title: "嵐山午餐",
            icon: "restaurant",
            description: "鯛匠 HANANA 鯛魚茶泡飯",
            paidBy: "Carol",
            amount: "¥6,000",
            color: "blue",
          },
        ],
      },
      {
        day: 3,
        date: "17",
        weekday: "週五",
        dateLabel: "11月17日",
        items: [
          {
            id: "3-1",
            time: "09:00",
            title: "伏見稻荷大社",
            icon: "temple_buddhist",
            description: "千本鳥居，預計步行2小時",
            paidBy: "你",
            amount: "免費",
            color: "primary",
          },
        ],
      },
      {
        day: 4,
        date: "18",
        weekday: "週六",
        dateLabel: "11月18日",
        items: [
          {
            id: "4-1",
            time: "10:00",
            title: "金閣寺",
            icon: "temple_buddhist",
            description: "世界遺產，門票 ¥500/人",
            paidBy: "Alice",
            amount: "¥2,500",
            color: "blue",
          },
        ],
      },
      {
        day: 5,
        date: "19",
        weekday: "週日",
        dateLabel: "11月19日",
        items: [
          {
            id: "5-1",
            time: "10:00",
            title: "京都車站購物",
            icon: "shopping_bag",
            description: "伴手禮採買",
            paidBy: "",
            amount: "",
            color: "green",
          },
          {
            id: "5-2",
            time: "14:00",
            title: "關西機場",
            icon: "flight_takeoff",
            description: "HARUKA 特急，約75分鐘",
            paidBy: "你",
            amount: "¥3,000",
            color: "primary",
          },
        ],
      },
    ],
  },
  "tokyo-disney": {
    id: "tokyo-disney",
    title: "東京迪士尼夢幻之旅",
    dateRange: "2023/12/24 - 12/28",
    startDate: "2023-12-24",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCG3AJ90z0fRZUHbKu5cYlgYt0LZAkNc3uQYelVS-hJk9_kNA7CNAkyo4hBOCE25UqvUGwiMmQR2JEL8CE070Jx7fcBeNrNLbLY6AFWGqkW66DFMZQr3fpDGCa7oTu1wRwgqbdl812uGJyDjnUf7_BDfbts_gT17M79ShHbBgfODyTFMzxfn33oBnZLoKzkKCN5WiNwVJISRRQKf_MH6rzMsfQ2Wc8hcCu8tuHIRxOUXmUdukUK9SXVV4WsT1YiL5SgpqQJ0N9qk6za",
    participants: [
      { id: "1", name: "你", avatar: "" },
      { id: "2", name: "伴侶", avatar: "" },
    ],
    schedule: [
      {
        day: 1,
        date: "24",
        weekday: "週日",
        dateLabel: "12月24日",
        items: [
          {
            id: "d1-1",
            time: "12:30",
            title: "成田機場入境",
            icon: "flight_land",
            description: "CI100 航班抵達",
            paidBy: "你",
            amount: "",
            color: "primary",
          },
        ],
      },
    ],
  },
};

const colorConfig = {
  primary: {
    dot: "bg-[#Cfb9a5]",
    tag: "bg-[#Cfb9a5]/10 text-[#Cfb9a5] border-[#Cfb9a5]/20",
  },
  blue: {
    dot: "bg-[#A5BCCF]",
    tag: "bg-[#A5BCCF]/10 text-[#A5BCCF] border-[#A5BCCF]/20",
  },
  pink: {
    dot: "bg-[#CFA5A5]",
    tag: "bg-[#CFA5A5]/10 text-[#CFA5A5] border-[#CFA5A5]/20",
  },
  green: {
    dot: "bg-[#A8BFA6]",
    tag: "bg-[#A8BFA6]/10 text-[#A8BFA6] border-[#A8BFA6]/20",
  },
};

const categoryConfig: Record<string, { bg: string; text: string }> = {
  "景點": { bg: "bg-[#A5BCCF]/15", text: "text-[#A5BCCF]" },
  "美食": { bg: "bg-[#CFA5A5]/15", text: "text-[#CFA5A5]" },
  "體驗": { bg: "bg-[#Cfb9a5]/15", text: "text-[#Cfb9a5]" },
  "住宿": { bg: "bg-[#A8BFA6]/15", text: "text-[#A8BFA6]" },
  "交通": { bg: "bg-[#94A3B8]/15", text: "text-[#94A3B8]" },
  "購物": { bg: "bg-[#CFA5A5]/15", text: "text-[#CFA5A5]" },
  "其他": { bg: "bg-gray-100", text: "text-gray-500" },
};

// 計算當前應該顯示哪一天
function calculateCurrentDay(startDate: string, totalDays: number): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // 出發前：顯示第一天
  if (diffDays < 0) return 1;

  // 行程中：顯示對應天數 (0 = Day 1, 1 = Day 2, ...)
  const currentDay = diffDays + 1;

  // 行程結束後：顯示最後一天
  if (currentDay > totalDays) return totalDays;

  return currentDay;
}

// 檢查是否在行程期間內
function isWithinTripDates(startDate: string, totalDays: number): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + totalDays - 1);

  return today >= start && today <= end;
}

// 將資料庫行程項目轉換為 UI 格式
function dbItemToItineraryItem(dbItem: TripItineraryItem): ItineraryItem {
  // 轉換出席記錄
  const attendanceList: Record<string, "attending" | "not_attending" | "pending"> = {};
  if (dbItem.attendance) {
    dbItem.attendance.forEach((a) => {
      attendanceList[a.user_id] = a.status;
    });
  }

  return {
    id: dbItem.id,
    time: dbItem.start_time?.substring(0, 5) || "", // HH:MM format，沒設定則為空
    title: dbItem.title,
    icon: dbItem.icon || "place",
    description: dbItem.description || undefined,
    paidBy: undefined, // TODO: 從 profiles 取得名稱
    amount: dbItem.estimated_cost ? `¥${dbItem.estimated_cost}` : undefined,
    color: (dbItem.color as "primary" | "blue" | "pink" | "green") || "primary",
    category: dbItem.category as ItineraryItem["category"],
    image: dbItem.image_url || undefined,
    inquiryBy: dbItem.inquiry_by || undefined,
    attendanceList: Object.keys(attendanceList).length > 0 ? attendanceList : undefined,
  };
}

// 將資料庫 Trip 轉換為 OrderData 格式
function tripToOrderData(trip: Trip, dbItems: TripItineraryItem[]): OrderData {
  const startDate = trip.start_date || "";
  const endDate = trip.end_date || "";

  let dateRange = "";
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    dateRange = `${start.getFullYear()}/${start.getMonth() + 1}/${start.getDate()} - ${end.getMonth() + 1}/${end.getDate()}`;
  }

  // 計算行程天數
  const days = startDate && endDate
    ? Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
    : 1;

  // 生成行程表框架
  const schedule: DaySchedule[] = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const weekdays = ["週日", "週一", "週二", "週三", "週四", "週五", "週六"];

    // 找出這一天的行程項目
    const dayItems = dbItems
      .filter((item) => item.day_number === i + 1)
      .map(dbItemToItineraryItem)
      .sort((a, b) => {
        // 如果都有時間，按時間排序
        if (a.time && b.time) return a.time.localeCompare(b.time);
        // 如果只有一個有時間，有時間的排前面
        if (a.time && !b.time) return -1;
        if (!a.time && b.time) return 1;
        // 如果都沒有時間，維持原本順序（sort_order）
        return 0;
      });

    schedule.push({
      day: i + 1,
      date: String(date.getDate()),
      weekday: weekdays[date.getDay()],
      dateLabel: `${date.getMonth() + 1}月${date.getDate()}日`,
      items: dayItems,
    });
  }

  return {
    id: trip.id,
    title: trip.title,
    dateRange,
    startDate,
    image: trip.cover_image || "",
    participants: [{ id: "1", name: "你", avatar: "" }], // 預設只有自己
    schedule,
    ownerId: "1", // 從資料庫載入的行程，目前預設主揪是自己
  };
}

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;

  // 先嘗試從假資料找
  const mockOrder = ordersData[orderId];

  // 從資料庫載入
  const {
    currentTrip,
    isLoading,
    fetchTripById,
    itineraryItems,
    fetchTripItineraryItems,
    createItineraryItem,
    updateItineraryItem,
    deleteItineraryItem,
    members,
    fetchTripMembers,
  } = useTripStore();

  // 取得領隊資訊（如果有的話）
  const { leaderInfo, user } = useAuthStore();

  // 檢查是否為領隊：leaderInfo 有值，或者是此行程的 owner
  const currentMember = members.find(m => m.user_id === user?.id);
  const isLeader = !!leaderInfo || currentMember?.role === 'owner';

  // 統一使用 order state 來管理資料（不管來源是 mock 還是 db）
  const [order, setOrder] = useState<OrderData | null>(null);

  useEffect(() => {
    // 如果有假資料，使用假資料
    if (mockOrder) {
      setOrder(mockOrder);
    } else if (orderId) {
      // 否則從資料庫載入
      fetchTripById(orderId);
      fetchTripItineraryItems(orderId);
      fetchTripMembers(orderId);
    }
  }, [orderId, mockOrder, fetchTripById, fetchTripItineraryItems, fetchTripMembers]);

  useEffect(() => {
    // 當資料庫資料載入完成，轉換格式
    if (currentTrip && currentTrip.id === orderId && !mockOrder) {
      const orderData = tripToOrderData(currentTrip, itineraryItems);
      // 載入儲存的時間設定
      const timeKey = `trip_times_${orderId}`;
      const savedTimes = JSON.parse(localStorage.getItem(timeKey) || '{}');
      if (Object.keys(savedTimes).length > 0) {
        orderData.schedule = orderData.schedule.map((day) => ({
          ...day,
          items: day.items.map((item) => ({
            ...item,
            time: savedTimes[item.id] || item.time,
          })),
        }));
      }
      setOrder(orderData);
    }
  }, [currentTrip, orderId, mockOrder, itineraryItems]);

  // 根據日期自動計算初始天數
  const initialDay = order ? calculateCurrentDay(order.startDate, order.schedule.length) : 1;

  const [selectedDay, setSelectedDay] = useState(initialDay);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showItemMenu, setShowItemMenu] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ItineraryItem | null>(null);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const [editingTimeItemId, setEditingTimeItemId] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [showMemberList, setShowMemberList] = useState(false);
  const [newItem, setNewItem] = useState({
    time: "",
    title: "",
    description: "",
    category: "景點" as "景點" | "美食" | "體驗" | "住宿" | "交通" | "購物" | "其他",
  });

  // 費用記錄相關 state
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseItem, setExpenseItem] = useState<ItineraryItem | null>(null);
  const [expenseData, setExpenseData] = useState({
    companyPaid: "", // 公司支出金額（領隊用）
    paidBy: "", // 誰付款
    splitWith: [] as string[], // 分攤對象
    amount: "", // 金額
    note: "", // 備註
  });

  // 開啟費用 Modal
  const handleOpenExpense = (item: ItineraryItem) => {
    setExpenseItem(item);
    setExpenseData({
      companyPaid: "",
      paidBy: "",
      splitWith: [],
      amount: "",
      note: "",
    });
    setShowExpenseModal(true);
  };

  // 儲存費用記錄狀態
  const [isSavingExpense, setIsSavingExpense] = useState(false);

  // 儲存費用記錄
  const handleSaveExpense = async () => {
    if (!order) return;

    setIsSavingExpense(true);
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripId: order.id,
          title: expenseItem?.title || (isLeader ? '公司支出' : '費用'),
          description: expenseData.note || undefined,
          category: expenseItem?.category ? mapCategoryToExpense(expenseItem.category) : 'other',
          amount: isLeader ? expenseData.companyPaid : expenseData.amount,
          paidBy: isLeader ? 'company' : expenseData.paidBy, // TODO: 改成實際 user_id
          splitWith: expenseData.splitWith,
          itineraryItemId: expenseItem?.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // 成功：關閉 Modal 並顯示成功訊息
        setShowExpenseModal(false);
        // TODO: 更新本地狀態或重新載入
      } else {
        alert(data.error || '儲存失敗');
      }
    } catch (error) {
      console.error('Save expense error:', error);
      alert('儲存失敗，請稍後再試');
    } finally {
      setIsSavingExpense(false);
    }
  };

  // 將行程類別對應到費用類別
  const mapCategoryToExpense = (category: string): string => {
    const mapping: Record<string, string> = {
      '景點': 'ticket',
      '美食': 'food',
      '交通': 'transport',
      '住宿': 'accommodation',
      '體驗': 'ticket',
      '購物': 'shopping',
    };
    return mapping[category] || 'other';
  };

  // 載入中
  if (isLoading && !mockOrder) {
    return (
      <div className="min-h-screen bg-[#F7F5F2] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-[#Cfb9a5]/30 border-t-[#Cfb9a5] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">載入中...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#F7F5F2] flex items-center justify-center">
        <div className="text-center">
          <span className="material-icons-round text-gray-300 text-6xl mb-4">error_outline</span>
          <p className="text-gray-500">找不到此訂單</p>
          <Link href="/orders" className="mt-4 inline-block text-[#Cfb9a5] font-medium">
            返回訂單列表
          </Link>
        </div>
      </div>
    );
  }

  const currentDaySchedule = order.schedule.find((d) => d.day === selectedDay);

  // 計算某項目的出席統計
  const getItemAttendanceStats = (item: ItineraryItem) => {
    if (!item.attendanceList) {
      return { attending: 0, notAttending: 0, pending: order.participants.length };
    }
    const attending = Object.values(item.attendanceList).filter((s) => s === "attending").length;
    const notAttending = Object.values(item.attendanceList).filter((s) => s === "not_attending").length;
    const pending = order.participants.length - attending - notAttending;
    return { attending, notAttending, pending };
  };

  // 取得項目的出席人數顯示
  const getItemAttendanceDisplay = (item: ItineraryItem) => {
    if (!item.inquiryBy) {
      return null; // 尚未發起詢問
    }
    const stats = getItemAttendanceStats(item);
    return {
      present: stats.attending,
      total: order.participants.length,
      hasPending: stats.pending > 0,
    };
  };

  // 取得發起詢問者名稱
  const getInquiryByName = (item: ItineraryItem) => {
    if (!item.inquiryBy) return null;
    const inquirer = order.participants.find((p) => p.id === item.inquiryBy);
    return inquirer?.name || "未知";
  };

  // 開啟出席 modal
  const handleOpenAttendance = (item: ItineraryItem) => {
    setSelectedItem(item);
    setShowAttendanceModal(true);
  };

  // 開啟項目選單
  const handleOpenItemMenu = (item: ItineraryItem) => {
    setSelectedItem(item);
    setShowItemMenu(true);
  };

  // 取得當前用戶 ID (模擬為 "1")
  const currentUserId = "1";

  // 檢查當前用戶是否為主揪
  const isOwner = order.ownerId === currentUserId;

  // 刪除行程項目
  const handleDeleteItem = async (item: ItineraryItem) => {
    if (!confirm(`確定要刪除「${item.title}」嗎？`)) {
      return;
    }

    // 如果是資料庫項目（UUID 格式），呼叫 API 刪除
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.id);
    if (isUUID && !mockOrder) {
      const result = await deleteItineraryItem(item.id);
      if (!result.success) {
        alert(result.error || '刪除失敗');
        return;
      }
      // 資料庫已更新，itineraryItems 會自動更新，useEffect 會重建 order
    } else {
      // Mock 資料只更新本地 state
      if (order) {
        const updatedSchedule = order.schedule.map((day) => ({
          ...day,
          items: day.items.filter((i) => i.id !== item.id),
        }));
        setOrder({ ...order, schedule: updatedSchedule });
      }
    }

    // 關閉選單
    setShowItemMenu(false);
    setSelectedItem(null);
  };

  // 發起出席詢問
  const handleInitiateInquiry = (item: ItineraryItem) => {
    // 更新 order state
    if (order) {
      const updatedSchedule = order.schedule.map((day) => ({
        ...day,
        items: day.items.map((i) =>
          i.id === item.id
            ? {
                ...i,
                inquiryBy: currentUserId,
                attendanceList: {
                  [currentUserId]: "attending" as const, // 發起者預設出席
                },
              }
            : i
        ),
      }));
      setOrder({ ...order, schedule: updatedSchedule });
    }

    // 更新 selectedItem 以便 UI 立即反應
    const updatedItem = {
      ...item,
      inquiryBy: currentUserId,
      attendanceList: {
        [currentUserId]: "attending" as const,
      },
    };
    setSelectedItem(updatedItem);

    // 開啟出席 modal 顯示結果
    setShowAttendanceModal(true);

    // TODO: 如果需要持久化，這裡應該呼叫 API 更新資料庫
  };

  // 更新我的出席狀態
  const handleUpdateMyAttendance = (item: ItineraryItem, status: "attending" | "not_attending") => {
    // 更新 order state
    if (order) {
      const updatedSchedule = order.schedule.map((day) => ({
        ...day,
        items: day.items.map((i) =>
          i.id === item.id
            ? {
                ...i,
                attendanceList: {
                  ...i.attendanceList,
                  [currentUserId]: status,
                },
              }
            : i
        ),
      }));
      setOrder({ ...order, schedule: updatedSchedule });
    }

    // 更新 selectedItem 以便 UI 立即反應
    const updatedItem = {
      ...item,
      attendanceList: {
        ...item.attendanceList,
        [currentUserId]: status,
      },
    };
    setSelectedItem(updatedItem);

    // TODO: 如果需要持久化，這裡應該呼叫 API 更新資料庫
  };

  return (
    <div className="h-[100dvh] max-h-[100dvh] overflow-hidden relative bg-[#F7F5F2] font-sans antialiased text-gray-900">
      {/* 背景紋理 */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-5">
        <div className="absolute -top-[10%] -left-[10%] w-96 h-96 bg-[#Cfb9a5]/30 rounded-full blur-3xl" />
        <div className="absolute bottom-[20%] -right-[10%] w-80 h-80 bg-[#A5BCCF]/30 rounded-full blur-3xl" />
      </div>

      {/* Header - absolute 定位 */}
      <header className="absolute top-0 left-0 right-0 z-50 px-5 pt-4 pb-4 bg-[#F7F5F2]/95 backdrop-blur-md flex items-center justify-between shadow-sm">
        <Link
          href="/orders"
          className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full bg-white shadow-sm hover:shadow-md transition-all active:scale-95 border border-gray-100"
        >
          <span className="material-icons-round text-gray-700 text-[22px]">arrow_back</span>
        </Link>
        <div className="flex flex-col items-center max-w-[60%]">
          <h1 className="text-base font-bold text-gray-800 tracking-wide truncate w-full text-center">
            {order.title}
          </h1>
          <span className="text-[10px] text-gray-500 font-medium">{order.dateRange}</span>
        </div>
        <button
          onClick={() => setShowHeaderMenu(true)}
          className="w-10 h-10 min-w-[40px] min-h-[40px] shrink-0 flex items-center justify-center rounded-full bg-white shadow-sm hover:shadow-md transition-all active:scale-95 border border-gray-100"
        >
          <span className="material-icons-round text-gray-700 text-[22px]">more_vert</span>
        </button>
      </header>

      {/* 主要內容 */}
      <main className="h-full overflow-y-auto pt-16 pb-36">
        {/* Day 選擇器 - 膠囊式 */}
        <div className="sticky top-0 z-40 bg-[#F7F5F2]/98 backdrop-blur pt-3 pb-3 px-4">
          <div className="bg-white/60 backdrop-blur-xl rounded-full p-1 flex gap-1 overflow-x-auto hide-scrollbar border border-white/50 shadow-sm">
            {order.schedule.map((day) => {
              // 只有在行程期間內才顯示「今天」的紅點
              const withinTrip = isWithinTripDates(order.startDate, order.schedule.length);
              const currentTripDay = calculateCurrentDay(order.startDate, order.schedule.length);
              const isToday = withinTrip && currentTripDay === day.day;

              return (
                <button
                  key={day.day}
                  onClick={() => setSelectedDay(day.day)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                    selectedDay === day.day
                      ? "bg-[#Cfb9a5] text-white shadow-md"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  Day {day.day}
                  {isToday && selectedDay !== day.day && (
                    <span className="ml-1 w-1.5 h-1.5 bg-[#CFA5A5] rounded-full inline-block" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 時間軸內容 */}
        <div className="px-5 pt-6 pb-4 flex flex-col relative">
          {/* 日期標題和參與者 */}
          <div className="flex items-end justify-between mb-4 pl-2">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-gray-800">
                {currentDaySchedule?.dateLabel}{" "}
                <span className="text-sm font-normal text-gray-500 ml-2">第{selectedDay}天</span>
              </h2>
              {/* 領隊專屬：AI 排序時間按鈕 */}
              {isLeader && currentDaySchedule?.items && currentDaySchedule.items.length > 0 && (
                <button
                  onClick={() => {
                    // TODO: 呼叫 AI API 排序時間
                    alert('AI 排序時間功能開發中...\n\n將會自動根據景點位置和營業時間，\n為您安排最佳行程順序和時間。')
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs font-medium rounded-full shadow-sm hover:shadow-md transition-all hover:scale-105 active:scale-95"
                >
                  <span className="material-icons-round text-sm">auto_awesome</span>
                  AI 排時間
                </button>
              )}
            </div>
            <div className="flex -space-x-2">
              {order.participants.slice(0, 3).map((p) => (
                <div key={p.id} className="relative">
                  {p.avatar ? (
                    <Image
                      src={p.avatar}
                      alt={p.name}
                      width={24}
                      height={24}
                      className="w-6 h-6 rounded-full border-2 border-[#F7F5F2] object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-[#F7F5F2] bg-gray-200 flex items-center justify-center text-[8px] text-gray-500 font-bold">
                      {p.name[0]}
                    </div>
                  )}
                </div>
              ))}
              {order.participants.length > 3 && (
                <div className="w-6 h-6 rounded-full border-2 border-[#F7F5F2] bg-gray-200 flex items-center justify-center text-[8px] text-gray-500 font-bold">
                  +{order.participants.length - 3}
                </div>
              )}
            </div>
          </div>

          {/* 時間軸項目 */}
          {currentDaySchedule?.items.map((item, index) => {
            const colors = colorConfig[item.color];
            const isLast = index === currentDaySchedule.items.length - 1;
            const categoryStyle = item.category ? categoryConfig[item.category] : null;

            return (
              <div key={item.id} className="flex items-start gap-3 group">
                {/* 時間軸：圓點 + 連接線 */}
                <div className="flex flex-col items-center pt-3">
                  <div className={`w-3 h-3 rounded-full ${colors.dot} ring-4 ring-[#F7F5F2] shadow-sm z-10 shrink-0`} />
                  {!isLast && <div className="w-0.5 flex-1 bg-gray-200 mt-1" />}
                </div>

                {/* 卡片內容 */}
                <div className="flex-1 bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex gap-3 relative transition-all hover:shadow-md hover:-translate-y-0.5 mb-3">
                  {/* 圖片 */}
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.title}
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded-xl object-cover bg-gray-100 shadow-sm shrink-0"
                    />
                  ) : (
                    <div className={`w-16 h-16 rounded-xl ${colors.dot}/10 flex items-center justify-center shrink-0`}>
                      <span className={`material-icons-round text-2xl ${colors.dot.replace('bg-', 'text-').replace('/10', '')}`}>{item.icon}</span>
                    </div>
                  )}

                  {/* 內容區 */}
                  <div className="flex-1 flex flex-col justify-center gap-0.5 min-w-0">
                    {/* 標籤列：類別 + 時間 */}
                    <div className="flex items-center gap-2">
                      {categoryStyle && (
                        <span className={`px-1.5 py-0.5 rounded-md ${categoryStyle.bg} text-[10px] ${categoryStyle.text} font-bold`}>
                          {item.category}
                        </span>
                      )}
                      {/* 時間：領隊可點擊編輯，旅客只在有時間時顯示 */}
                      {(item.time || isLeader) && (
                        editingTimeItemId === item.id ? (
                          <select
                            autoFocus
                            value={item.time || ''}
                            onChange={(e) => {
                              const newTime = e.target.value;
                              setEditingTimeItemId(null);
                              // 暫存時間到 localStorage（之後可改存資料庫）
                              const timeKey = `trip_times_${orderId}`;
                              const savedTimes = JSON.parse(localStorage.getItem(timeKey) || '{}');
                              savedTimes[item.id] = newTime;
                              localStorage.setItem(timeKey, JSON.stringify(savedTimes));
                              // 更新本地顯示
                              const updatedSchedule = order.schedule.map((day) => ({
                                ...day,
                                items: day.items.map((i) =>
                                  i.id === item.id ? { ...i, time: newTime } : i
                                ),
                              }));
                              setOrder({ ...order, schedule: updatedSchedule });
                            }}
                            onBlur={() => setEditingTimeItemId(null)}
                            className="text-[10px] text-gray-600 px-1 py-0.5 rounded border border-purple-300 bg-white focus:outline-none focus:ring-1 focus:ring-purple-400"
                          >
                            <option value="">不設定</option>
                            {Array.from({ length: 24 * 4 }, (_, i) => {
                              const hour = Math.floor(i / 4).toString().padStart(2, '0');
                              const minute = ((i % 4) * 15).toString().padStart(2, '0');
                              return `${hour}:${minute}`;
                            }).map((time) => (
                              <option key={time} value={time}>{time}</option>
                            ))}
                          </select>
                        ) : (
                          <span
                            className={`text-[10px] flex items-center gap-0.5 ${
                              isLeader
                                ? 'text-purple-500 cursor-pointer hover:bg-purple-50 px-1 py-0.5 rounded transition-colors'
                                : 'text-gray-400'
                            }`}
                            onClick={(e) => {
                              if (isLeader) {
                                e.stopPropagation();
                                setEditingTimeItemId(item.id);
                              }
                            }}
                          >
                            <span className="material-icons-round text-[10px]">schedule</span>
                            {item.time || '設定時間'}
                            {isLeader && <span className="material-icons-round text-[8px] ml-0.5">edit</span>}
                          </span>
                        )
                      )}
                    </div>
                    {/* 標題 */}
                    <h4 className="text-sm font-bold text-gray-800 truncate">{item.title}</h4>
                    {/* 描述 */}
                    <p className="text-[10px] text-gray-400 line-clamp-1">{item.description}</p>

                    {/* 墊付、費用和出席資訊 */}
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {/* 已記錄的費用顯示 */}
                      {item.paidBy && item.amount && (
                        <div
                          onClick={() => handleOpenExpense(item)}
                          className={`flex items-center gap-1 px-2 py-1 rounded-md ${colors.tag} border cursor-pointer active:scale-95 transition-transform`}
                        >
                          <span className="material-icons-round text-[12px]">account_balance_wallet</span>
                          <span className="text-[10px] font-bold">
                            {item.paidBy} {item.amount}
                          </span>
                        </div>
                      )}

                      {(() => {
                        const attendanceDisplay = getItemAttendanceDisplay(item);
                        if (attendanceDisplay) {
                          return (
                            <button
                              onClick={() => handleOpenAttendance(item)}
                              className={`flex items-center gap-1 px-2 py-1 rounded-md border transition-colors relative ${
                                attendanceDisplay.hasPending
                                  ? `${colors.tag} hover:opacity-80`
                                  : "bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100"
                              }`}
                            >
                              <span className="material-icons-round text-[12px]">group</span>
                              <span className="text-[10px] font-bold">
                                {attendanceDisplay.present}/{attendanceDisplay.total}
                              </span>
                              {attendanceDisplay.hasPending && (
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full border border-white" />
                              )}
                            </button>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </div>

                  {/* 右上角選單按鈕 */}
                  <button
                    onClick={() => handleOpenItemMenu(item)}
                    className="absolute top-2 right-2 w-7 h-7 bg-gray-50 rounded-full shadow-sm text-gray-400 hover:text-[#Cfb9a5] transition-colors flex items-center justify-center"
                  >
                    <span className="material-icons-round text-[16px]">more_horiz</span>
                  </button>
                </div>
              </div>
            );
          })}

          {/* 新增行程按鈕 - 所有人都可以新增 */}
          <div className="flex items-start gap-3 pt-2">
            <div className="flex flex-col items-center gap-1 pt-1 opacity-40">
              <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
            </div>
            <div className="flex-1">
              <button
                onClick={() => setShowAddItemModal(true)}
                className="w-full py-3 rounded-full border border-dashed border-[#Cfb9a5]/50 text-[#Cfb9a5] bg-[#Cfb9a5]/5 hover:bg-[#Cfb9a5]/10 transition-all flex items-center justify-center gap-2 font-bold text-sm shadow-sm active:scale-[0.98]"
              >
                <span className="material-icons-round text-[20px]">add_circle</span>
                新增項目
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* 出席詢問 Modal - 置中懸浮 */}
      {showAttendanceModal && selectedItem && (
        <>
          {/* 背景遮罩 */}
          <div
            className="fixed inset-0 bg-black/50 z-[60]"
            onClick={() => setShowAttendanceModal(false)}
          />

          {/* 置中懸浮面板 */}
          <div className="fixed inset-0 z-[61] flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col pointer-events-auto animate-fade-in">
            {/* 標題列 */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <div>
                <h2 className="text-lg font-bold text-gray-800">{selectedItem.title}</h2>
                {selectedItem.inquiryBy && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    由 {getInquiryByName(selectedItem)} 發起詢問
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowAttendanceModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <span className="material-icons-round text-gray-500 text-[18px]">close</span>
              </button>
            </div>

            {(() => {
              const stats = getItemAttendanceStats(selectedItem);
              const myStatus = selectedItem.attendanceList?.[currentUserId];

              return (
                <>
                  {/* 我的回應按鈕 */}
                  <div className="px-5 pb-4">
                    <p className="text-xs text-gray-500 mb-2 font-medium">我的回覆</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleUpdateMyAttendance(selectedItem, "attending")}
                        className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                          myStatus === "attending"
                            ? "bg-[#A8BFA6] text-white shadow-lg shadow-[#A8BFA6]/30"
                            : "bg-[#A8BFA6]/10 text-[#A8BFA6] border border-[#A8BFA6]/30 hover:bg-[#A8BFA6]/20"
                        }`}
                      >
                        <span className="material-icons-round text-[20px]">check_circle</span>
                        出席
                      </button>
                      <button
                        onClick={() => handleUpdateMyAttendance(selectedItem, "not_attending")}
                        className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                          myStatus === "not_attending"
                            ? "bg-[#CFA5A5] text-white shadow-lg shadow-[#CFA5A5]/30"
                            : "bg-[#CFA5A5]/10 text-[#CFA5A5] border border-[#CFA5A5]/30 hover:bg-[#CFA5A5]/20"
                        }`}
                      >
                        <span className="material-icons-round text-[20px]">cancel</span>
                        不出席
                      </button>
                    </div>
                  </div>

                  {/* 統計區塊 */}
                  <div className="px-5 pb-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-[#A8BFA6]/10 rounded-xl p-3 text-center border border-[#A8BFA6]/20">
                        <div className="text-2xl font-bold text-[#A8BFA6]">{stats.attending}</div>
                        <div className="text-xs text-gray-500 font-medium mt-0.5">出席</div>
                      </div>
                      <div className="bg-[#CFA5A5]/10 rounded-xl p-3 text-center border border-[#CFA5A5]/20">
                        <div className="text-2xl font-bold text-[#CFA5A5]">{stats.notAttending}</div>
                        <div className="text-xs text-gray-500 font-medium mt-0.5">不出席</div>
                      </div>
                      <div className="bg-gray-100 rounded-xl p-3 text-center border border-gray-200">
                        <div className="text-2xl font-bold text-gray-400">{stats.pending}</div>
                        <div className="text-xs text-gray-500 font-medium mt-0.5">未定</div>
                      </div>
                    </div>
                  </div>

                  {/* 參與者列表 */}
                  <div className="flex-1 overflow-y-auto px-5 pb-5">
                    <div className="space-y-2">
                      {order.participants.map((participant) => {
                        const status = selectedItem.attendanceList?.[participant.id] || "pending";
                        const isMe = participant.id === currentUserId;

                        return (
                          <div
                            key={participant.id}
                            className={`flex items-center gap-3 p-3 rounded-xl border ${
                              isMe ? "bg-[#Cfb9a5]/5 border-[#Cfb9a5]/20" : "bg-gray-50 border-gray-100"
                            }`}
                          >
                            {/* 頭像 */}
                            {participant.avatar ? (
                              <Image
                                src={participant.avatar}
                                alt={participant.name}
                                width={40}
                                height={40}
                                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm text-gray-500 font-bold border-2 border-white shadow-sm">
                                {participant.name[0]}
                              </div>
                            )}

                            {/* 名稱 */}
                            <div className="flex-1">
                              <div className="font-medium text-gray-800">
                                {participant.name}
                                {isMe && <span className="text-xs text-[#Cfb9a5] ml-1">(我)</span>}
                              </div>
                            </div>

                            {/* 狀態標籤 */}
                            <div
                              className={`px-3 py-1 rounded-full text-xs font-bold ${
                                status === "attending"
                                  ? "bg-[#A8BFA6]/15 text-[#A8BFA6] border border-[#A8BFA6]/30"
                                  : status === "not_attending"
                                  ? "bg-[#CFA5A5]/15 text-[#CFA5A5] border border-[#CFA5A5]/30"
                                  : "bg-gray-100 text-gray-400 border border-gray-200"
                              }`}
                            >
                              {status === "attending"
                                ? "出席"
                                : status === "not_attending"
                                ? "不出席"
                                : "未回覆"}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 底部按鈕 */}
                  {stats.pending > 0 && (
                    <div className="px-5 pb-5 pt-2 border-t border-gray-100 bg-white">
                      <button className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors active:scale-[0.98]">
                        <span className="material-icons-round text-[18px]">notifications</span>
                        提醒未選擇者 ({stats.pending}人)
                      </button>
                    </div>
                  )}
                </>
              );
            })()}
            </div>
          </div>
        </>
      )}

      {/* 項目選單 Modal - 置中懸浮 */}
      {showItemMenu && selectedItem && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-[60]"
            onClick={() => setShowItemMenu(false)}
          />
          <div className="fixed inset-0 z-[61] flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col pointer-events-auto animate-fade-in">
              {/* 標題列 */}
              <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-800">{selectedItem.title}</h3>
                <button
                  onClick={() => setShowItemMenu(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <span className="material-icons-round text-gray-500 text-[18px]">close</span>
                </button>
              </div>

              {/* 選單內容 */}
              <div className="p-5">

              {/* 選單項目 */}
              <div className="space-y-2">
                {/* 發起出席詢問 - 只有尚未發起時才顯示 */}
                {!selectedItem.inquiryBy && (
                  <button
                    onClick={() => {
                      setShowItemMenu(false);
                      handleInitiateInquiry(selectedItem);
                    }}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl bg-[#CFA5A5]/10 hover:bg-[#CFA5A5]/20 transition-colors active:scale-[0.98]"
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#CFA5A5]/20 flex items-center justify-center">
                      <span className="material-icons-round text-[#CFA5A5] text-2xl">campaign</span>
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-bold text-[#CFA5A5]">發起出席詢問</div>
                      <div className="text-xs text-gray-500">詢問大家是否參加此行程</div>
                    </div>
                  </button>
                )}

                {/* 查看出席狀況 - 只有已發起時才顯示 */}
                {selectedItem.inquiryBy && (
                  <button
                    onClick={() => {
                      setShowItemMenu(false);
                      handleOpenAttendance(selectedItem);
                    }}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors active:scale-[0.98]"
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#A8BFA6]/15 flex items-center justify-center">
                      <span className="material-icons-round text-[#A8BFA6] text-2xl">how_to_reg</span>
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-bold text-gray-800">查看出席狀況</div>
                      <div className="text-xs text-gray-500">查看並回覆出席詢問</div>
                    </div>
                  </button>
                )}

                {/* 分帳/公司支出 */}
                <button
                  onClick={() => {
                    setShowItemMenu(false);
                    handleOpenExpense(selectedItem);
                  }}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-colors active:scale-[0.98] ${
                    isLeader
                      ? "bg-amber-50 hover:bg-amber-100"
                      : "bg-[#Cfb9a5]/10 hover:bg-[#Cfb9a5]/20"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isLeader ? "bg-amber-100" : "bg-[#Cfb9a5]/20"
                  }`}>
                    <span className={`material-icons-round text-2xl ${
                      isLeader ? "text-amber-600" : "text-[#Cfb9a5]"
                    }`}>
                      {isLeader ? "receipt_long" : "group_add"}
                    </span>
                  </div>
                  <div className="flex-1 text-left">
                    <div className={`font-bold ${isLeader ? "text-amber-700" : "text-[#Cfb9a5]"}`}>
                      {isLeader ? "公司支出" : "分帳"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {isLeader ? "記錄公司支出金額" : "記錄誰付款與分帳"}
                    </div>
                  </div>
                </button>

                {/* 編輯行程 - 所有人都可以編輯 */}
                <button
                  onClick={() => {
                    setShowItemMenu(false);
                    // 預填表單資料
                    setNewItem({
                      time: selectedItem.time,
                      title: selectedItem.title,
                      description: selectedItem.description || "",
                      category: selectedItem.category || "其他",
                    });
                    setShowAddItemModal(true);
                  }}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors active:scale-[0.98]"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#A5BCCF]/15 flex items-center justify-center">
                    <span className="material-icons-round text-[#A5BCCF] text-2xl">edit</span>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-bold text-gray-800">編輯行程</div>
                    <div className="text-xs text-gray-500">修改時間、地點等資訊</div>
                  </div>
                </button>

                {/* 刪除行程 - 只有主揪可以刪除 */}
                {isOwner && (
                  <button
                    onClick={() => handleDeleteItem(selectedItem)}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors active:scale-[0.98]"
                  >
                    <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                      <span className="material-icons-round text-red-400 text-2xl">delete</span>
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-bold text-red-500">刪除行程</div>
                      <div className="text-xs text-gray-500">移除此行程項目</div>
                    </div>
                  </button>
                )}
              </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 新增項目 Modal - 置中懸浮 */}
      {showAddItemModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-[60]"
            onClick={() => setShowAddItemModal(false)}
          />
          <div className="fixed inset-0 z-[61] flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col pointer-events-auto animate-fade-in">
              {/* 標題列 */}
              <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-800">新增行程項目</h2>
                <button
                  onClick={() => setShowAddItemModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <span className="material-icons-round text-gray-500 text-[18px]">close</span>
                </button>
              </div>

              {/* 表單內容 */}
              <div className="flex-1 overflow-y-auto px-5 py-4">
                {/* 類別選擇 */}
                <div className="mb-4">
                  <label className="text-xs font-bold text-gray-500 mb-2 block">類別</label>
                  <div className="flex flex-wrap gap-2">
                    {(["景點", "美食", "體驗", "住宿", "交通", "購物", "其他"] as const).map((cat) => {
                      const style = categoryConfig[cat];
                      const isSelected = newItem.category === cat;
                      return (
                        <button
                          key={cat}
                          onClick={() => setNewItem({ ...newItem, category: cat })}
                          className={`px-3 py-1.5 rounded-full text-sm font-bold transition-all ${
                            isSelected
                              ? `${style.bg} ${style.text} ring-2 ring-offset-1 ring-current`
                              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          }`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 時間 - 15分鐘間隔選單 */}
                <div className="mb-4">
                  <label className="text-xs font-bold text-gray-500 mb-2 block">時間</label>
                  <select
                    value={newItem.time}
                    onChange={(e) => setNewItem({ ...newItem, time: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#Cfb9a5] focus:ring-2 focus:ring-[#Cfb9a5]/20 outline-none transition-all text-gray-800 bg-white"
                  >
                    <option value="">選擇時間</option>
                    {Array.from({ length: 24 * 4 }, (_, i) => {
                      const hour = Math.floor(i / 4).toString().padStart(2, '0');
                      const minute = ((i % 4) * 15).toString().padStart(2, '0');
                      return `${hour}:${minute}`;
                    }).map((time) => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>

                {/* 標題 */}
                <div className="mb-4">
                  <label className="text-xs font-bold text-gray-500 mb-2 block">標題</label>
                  <input
                    type="text"
                    value={newItem.title}
                    onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                    placeholder="例如：清水寺參拜"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#Cfb9a5] focus:ring-2 focus:ring-[#Cfb9a5]/20 outline-none transition-all text-gray-800 placeholder:text-gray-400"
                  />
                </div>

                {/* 說明 */}
                <div className="mb-4">
                  <label className="text-xs font-bold text-gray-500 mb-2 block">說明 (選填)</label>
                  <textarea
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    placeholder="例如：門票 ¥500/人"
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#Cfb9a5] focus:ring-2 focus:ring-[#Cfb9a5]/20 outline-none transition-all text-gray-800 placeholder:text-gray-400 resize-none"
                  />
                </div>
              </div>

              {/* 底部按鈕 */}
              <div className="px-5 pb-5 pt-2 border-t border-gray-100 bg-white">
                <button
                  onClick={async () => {
                    if (!order) return;

                    // 計算當前日期
                    const currentDaySchedule = order.schedule.find((d) => d.day === selectedDay);
                    const itemDate = currentDaySchedule
                      ? new Date(order.startDate)
                      : new Date();
                    if (currentDaySchedule) {
                      itemDate.setDate(itemDate.getDate() + selectedDay - 1);
                    }

                    // 如果是資料庫行程，寫入資料庫
                    if (!mockOrder && currentTrip) {
                      const result = await createItineraryItem({
                        trip_id: orderId,
                        day_number: selectedDay,
                        item_date: itemDate.toISOString().split('T')[0],
                        start_time: newItem.time + ':00',
                        title: newItem.title,
                        description: newItem.description || null,
                        category: newItem.category,
                        icon: 'place',
                        color: 'primary',
                      });

                      if (!result.success) {
                        alert(result.error || '新增失敗');
                        return;
                      }
                      // 資料庫已更新，itineraryItems 會自動更新
                    } else {
                      // Mock 資料只更新本地 state
                      const newItineraryItem: ItineraryItem = {
                        id: `item-${Date.now()}`,
                        time: newItem.time,
                        title: newItem.title,
                        description: newItem.description,
                        icon: "place",
                        color: "primary",
                        category: newItem.category,
                      };

                      const updatedSchedule = order.schedule.map((day) => {
                        if (day.day === selectedDay) {
                          const newItems = [...day.items, newItineraryItem].sort((a, b) =>
                            a.time.localeCompare(b.time)
                          );
                          return { ...day, items: newItems };
                        }
                        return day;
                      });

                      setOrder({ ...order, schedule: updatedSchedule });
                    }

                    setNewItem({ time: "", title: "", description: "", category: "景點" });
                    setShowAddItemModal(false);
                  }}
                  disabled={!newItem.time || !newItem.title}
                  className="w-full py-3.5 bg-[#Cfb9a5] hover:bg-[#c0a996] disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-[#Cfb9a5]/30 disabled:shadow-none"
                >
                  <span className="material-icons-round text-[20px]">add</span>
                  新增行程
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Header 選單 Modal - 置中懸浮 */}
      {showHeaderMenu && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-[60]"
            onClick={() => setShowHeaderMenu(false)}
          />
          <div className="fixed inset-0 z-[61] flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col pointer-events-auto animate-fade-in">
              {/* 標題列 */}
              <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-800">選單</h3>
                <button
                  onClick={() => setShowHeaderMenu(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <span className="material-icons-round text-gray-500 text-[18px]">close</span>
                </button>
              </div>

              {/* 選單內容 */}
              <div className="flex-1 overflow-y-auto p-5">
                <div className="space-y-2">
                {/* 新增景點 */}
                <button
                  onClick={() => {
                    setShowHeaderMenu(false);
                    setShowAddItemModal(true);
                  }}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-[#Cfb9a5]/10 hover:bg-[#Cfb9a5]/20 transition-colors active:scale-[0.98]"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#Cfb9a5]/20 flex items-center justify-center">
                    <span className="material-icons-round text-[#Cfb9a5] text-2xl">add_location</span>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-bold text-[#Cfb9a5]">新增景點</div>
                    <div className="text-xs text-gray-500">加入新的行程項目</div>
                  </div>
                </button>

                {/* 邀請旅伴 */}
                <Link
                  href={`/invite/${orderId}`}
                  onClick={() => setShowHeaderMenu(false)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-[#A5BCCF]/10 hover:bg-[#A5BCCF]/20 transition-colors active:scale-[0.98]"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#A5BCCF]/20 flex items-center justify-center">
                    <span className="material-icons-round text-[#A5BCCF] text-2xl">person_add</span>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-bold text-[#A5BCCF]">邀請旅伴</div>
                    <div className="text-xs text-gray-500">邀請朋友加入這趟旅程</div>
                  </div>
                </Link>

                {/* 領隊專用功能 */}
                {isLeader && (
                  <>
                    {/* 報到掃描 */}
                    <button
                      onClick={() => {
                        setShowHeaderMenu(false);
                        setShowScanner(true);
                      }}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl bg-[#5B9BD5]/10 hover:bg-[#5B9BD5]/20 transition-colors active:scale-[0.98]"
                    >
                      <div className="w-12 h-12 rounded-xl bg-[#5B9BD5]/20 flex items-center justify-center">
                        <span className="material-icons-round text-[#5B9BD5] text-2xl">qr_code_scanner</span>
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-bold text-[#5B9BD5]">報到掃描</div>
                        <div className="text-xs text-gray-500">掃描旅客 QR Code 完成報到</div>
                      </div>
                    </button>

                    {/* 報到狀態 */}
                    <button
                      onClick={() => {
                        setShowHeaderMenu(false);
                        setShowMemberList(true);
                      }}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl bg-[#6B8E6B]/10 hover:bg-[#6B8E6B]/20 transition-colors active:scale-[0.98]"
                    >
                      <div className="w-12 h-12 rounded-xl bg-[#6B8E6B]/20 flex items-center justify-center">
                        <span className="material-icons-round text-[#6B8E6B] text-2xl">how_to_reg</span>
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-bold text-[#6B8E6B]">報到狀態</div>
                        <div className="text-xs text-gray-500">
                          {members.filter(m => m.checked_in).length}/{members.length} 人已報到
                        </div>
                      </div>
                    </button>

                    {/* 特殊出帳 */}
                    <button
                      onClick={() => {
                        setShowHeaderMenu(false);
                        setExpenseItem(null);
                        setExpenseData({
                          companyPaid: "",
                          paidBy: "",
                          splitWith: [],
                          amount: "",
                          note: "",
                        });
                        setShowExpenseModal(true);
                      }}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl bg-amber-50 hover:bg-amber-100 transition-colors active:scale-[0.98]"
                    >
                      <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                        <span className="material-icons-round text-amber-600 text-2xl">receipt_long</span>
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-bold text-amber-700">特殊出帳</div>
                        <div className="text-xs text-gray-500">記錄公司額外支出</div>
                      </div>
                    </button>
                  </>
                )}

                {/* 行程資料 */}
                <Link
                  href={`/orders/${orderId}/briefing`}
                  onClick={() => setShowHeaderMenu(false)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors active:scale-[0.98]"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#A5BCCF]/15 flex items-center justify-center">
                    <span className="material-icons-round text-[#A5BCCF] text-2xl">description</span>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-bold text-gray-800">行程資料</div>
                    <div className="text-xs text-gray-500">查看完整行程說明</div>
                  </div>
                  <span className="material-icons-round text-gray-300">chevron_right</span>
                </Link>

                {/* 常見問題 */}
                <Link
                  href="/faq"
                  onClick={() => setShowHeaderMenu(false)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors active:scale-[0.98]"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#A8BFA6]/15 flex items-center justify-center">
                    <span className="material-icons-round text-[#A8BFA6] text-2xl">help_outline</span>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-bold text-gray-800">常見問題</div>
                    <div className="text-xs text-gray-500">FAQ 與使用說明</div>
                  </div>
                  <span className="material-icons-round text-gray-300">chevron_right</span>
                </Link>

                {/* 聯絡客服 */}
                <Link
                  href="/contact"
                  onClick={() => setShowHeaderMenu(false)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors active:scale-[0.98]"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#CFA5A5]/15 flex items-center justify-center">
                    <span className="material-icons-round text-[#CFA5A5] text-2xl">support_agent</span>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-bold text-gray-800">聯絡客服</div>
                    <div className="text-xs text-gray-500">有問題？讓我們幫助你</div>
                  </div>
                  <span className="material-icons-round text-gray-300">chevron_right</span>
                </Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 費用記錄 Modal */}
      {showExpenseModal && (
        <>
          {/* 背景遮罩 */}
          <div
            className="fixed inset-0 bg-black/50 z-[60]"
            onClick={() => setShowExpenseModal(false)}
          />

          {/* 置中懸浮面板 */}
          <div className="fixed inset-0 z-[61] flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col pointer-events-auto animate-fade-in">
              {/* 標題列 */}
              <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">
                    {expenseItem ? `${expenseItem.title} - 費用` : "特殊出帳"}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {isLeader ? "記錄公司支出" : "記錄誰付款與分帳"}
                  </p>
                </div>
                <button
                  onClick={() => setShowExpenseModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <span className="material-icons-round text-gray-500 text-[18px]">close</span>
                </button>
              </div>

              {/* 內容區 */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {/* 領隊專用：公司支出 */}
                {isLeader && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      <span className="material-icons-round text-[14px] mr-1 align-middle">business</span>
                      公司支出金額
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">¥</span>
                      <input
                        type="number"
                        value={expenseData.companyPaid}
                        onChange={(e) => setExpenseData({ ...expenseData, companyPaid: e.target.value })}
                        placeholder="0"
                        className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-lg font-bold"
                      />
                    </div>
                  </div>
                )}

                {/* 一般用戶：誰付款 */}
                {!isLeader && (
                  <>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        <span className="material-icons-round text-[14px] mr-1 align-middle">person</span>
                        誰付款
                      </label>
                      <select
                        value={expenseData.paidBy}
                        onChange={(e) => setExpenseData({ ...expenseData, paidBy: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#Cfb9a5]/20 focus:border-[#Cfb9a5] transition-all"
                      >
                        <option value="">選擇付款人</option>
                        {order?.participants.map((p) => (
                          <option key={p.id} value={p.name}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        <span className="material-icons-round text-[14px] mr-1 align-middle">payments</span>
                        金額
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">¥</span>
                        <input
                          type="number"
                          value={expenseData.amount}
                          onChange={(e) => setExpenseData({ ...expenseData, amount: e.target.value })}
                          placeholder="0"
                          className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#Cfb9a5]/20 focus:border-[#Cfb9a5] transition-all text-lg font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        <span className="material-icons-round text-[14px] mr-1 align-middle">group</span>
                        分帳對象
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {order?.participants.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => {
                              const newSplitWith = expenseData.splitWith.includes(p.id)
                                ? expenseData.splitWith.filter((id) => id !== p.id)
                                : [...expenseData.splitWith, p.id];
                              setExpenseData({ ...expenseData, splitWith: newSplitWith });
                            }}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                              expenseData.splitWith.includes(p.id)
                                ? "bg-[#Cfb9a5] text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                          >
                            {p.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* 備註 */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    <span className="material-icons-round text-[14px] mr-1 align-middle">notes</span>
                    備註
                  </label>
                  <textarea
                    value={expenseData.note}
                    onChange={(e) => setExpenseData({ ...expenseData, note: e.target.value })}
                    placeholder="輸入備註..."
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#Cfb9a5]/20 focus:border-[#Cfb9a5] transition-all resize-none"
                  />
                </div>
              </div>

              {/* 底部按鈕 */}
              <div className="px-5 pb-5 pt-3 border-t border-gray-100">
                <button
                  onClick={handleSaveExpense}
                  disabled={isSavingExpense || (isLeader ? !expenseData.companyPaid : (!expenseData.paidBy || !expenseData.amount))}
                  className={`w-full py-3.5 font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg disabled:shadow-none ${
                    isLeader
                      ? "bg-amber-500 hover:bg-amber-600 disabled:bg-gray-200 disabled:text-gray-400 text-white shadow-amber-500/30"
                      : "bg-[#Cfb9a5] hover:bg-[#c0a996] disabled:bg-gray-200 disabled:text-gray-400 text-white shadow-[#Cfb9a5]/30"
                  }`}
                >
                  {isSavingExpense ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      儲存中...
                    </>
                  ) : (
                    <>
                      <span className="material-icons-round text-[20px]">save</span>
                      儲存
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 底部導航 */}
      <MobileNav />

      {/* 報到掃描 Modal */}
      {showScanner && orderId && (
        <CheckInScanner
          tripId={orderId}
          onClose={() => setShowScanner(false)}
          onCheckInSuccess={() => {
            // 重新載入成員列表以更新報到狀態
            fetchTripMembers(orderId);
          }}
        />
      )}

      {/* 成員報到狀態 Modal */}
      {showMemberList && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-[70]"
            onClick={() => setShowMemberList(false)}
          />
          <div className="fixed inset-0 z-[71] flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col pointer-events-auto animate-fade-in">
              {/* 標題列 */}
              <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">成員報到狀態</h3>
                  <p className="text-sm text-gray-500">
                    {members.filter(m => m.checked_in).length}/{members.length} 人已報到
                  </p>
                </div>
                <button
                  onClick={() => setShowMemberList(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <span className="material-icons-round text-gray-500 text-[18px]">close</span>
                </button>
              </div>

              {/* 成員列表 */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-2">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className={`flex items-center gap-3 p-3 rounded-xl ${
                        member.checked_in ? 'bg-[#E8F5E9]' : 'bg-gray-50'
                      }`}
                    >
                      {/* 頭像 */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        member.checked_in ? 'bg-[#6B8E6B]' : 'bg-gray-300'
                      }`}>
                        <span className="material-icons-round text-white text-lg">
                          {member.checked_in ? 'check' : 'person'}
                        </span>
                      </div>

                      {/* 名稱和狀態 */}
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">
                          {member.nickname || '未命名'}
                          {member.role === 'owner' && (
                            <span className="ml-2 text-xs text-[#Cfb9a5] font-bold">領隊</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {member.checked_in ? (
                            <>
                              <span className="text-[#6B8E6B]">已報到</span>
                              {member.checked_in_at && (
                                <span className="ml-1">
                                  · {new Date(member.checked_in_at).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-gray-400">尚未報到</span>
                          )}
                        </div>
                      </div>

                      {/* 狀態圖標 */}
                      <span className={`material-icons-round text-xl ${
                        member.checked_in ? 'text-[#6B8E6B]' : 'text-gray-300'
                      }`}>
                        {member.checked_in ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                    </div>
                  ))}

                  {members.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <span className="material-icons-round text-4xl text-gray-300 mb-2 block">group_off</span>
                      尚無成員
                    </div>
                  )}
                </div>
              </div>

              {/* 底部按鈕 */}
              <div className="p-4 border-t border-gray-100">
                <button
                  onClick={() => {
                    setShowMemberList(false);
                    setShowScanner(true);
                  }}
                  className="w-full py-3 bg-[#5B9BD5] text-white font-bold rounded-xl hover:bg-[#4A8BC5] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <span className="material-icons-round">qr_code_scanner</span>
                  掃描報到
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
