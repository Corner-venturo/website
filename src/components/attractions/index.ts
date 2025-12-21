/**
 * 景點庫組件
 */

export { default as AttractionDetail } from "./AttractionDetail";
export { default as AttractionCard } from "./AttractionCard";
export * from "./types";

// 範例資料（開發測試用）
export const SAMPLE_ATTRACTION = {
  id: "1",
  name: "天空之城古堡",
  imageUrl:
    "https://images.unsplash.com/photo-1506197603052-3be9ceef1910?q=80&w=2940&auto=format&fit=crop",
  rating: 4.8,
  reviews: 1234,
  description:
    "天空之城古堡，坐落在雲霧繚繞的山巔，彷彿漂浮在半空中。這座宏偉的建築擁有千年歷史，每一塊石頭都訴說著古老的傳說。遊客可以在這裡探索神秘的迴廊、欣賞壯麗的自然風光，並在日落時分體驗如夢似幻的氛圍。",
  openingHours: [
    "週一至週五：09:00 - 17:00",
    "週六、週日及國定假日：08:30 - 18:00",
    "最後入場時間為閉館前一小時",
  ],
  ticketInfo: [
    "成人票：NT$350",
    "學生票：NT$280 (需出示有效學生證)",
    "兒童票 (6歲以下)：免費",
    "團體票 (20人以上)：九折優惠",
  ],
};

export const SAMPLE_ATTRACTIONS = [
  {
    id: "1",
    name: "天空之城古堡",
    imageUrl:
      "https://images.unsplash.com/photo-1506197603052-3be9ceef1910?q=80&w=800&auto=format&fit=crop",
    rating: 4.8,
    reviews: 1234,
    category: "歷史古蹟",
  },
  {
    id: "2",
    name: "夢幻海灘",
    imageUrl:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop",
    rating: 4.6,
    reviews: 892,
    category: "自然風光",
  },
  {
    id: "3",
    name: "櫻花古道",
    imageUrl:
      "https://images.unsplash.com/photo-1522383225653-ed111181a951?q=80&w=800&auto=format&fit=crop",
    rating: 4.9,
    reviews: 2156,
    category: "自然風光",
  },
  {
    id: "4",
    name: "星空觀景台",
    imageUrl:
      "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?q=80&w=800&auto=format&fit=crop",
    rating: 4.7,
    reviews: 567,
    category: "觀景台",
  },
];
