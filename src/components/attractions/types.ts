/**
 * 景點相關型別定義
 */

export interface Attraction {
  id: string;
  name: string;
  imageUrl: string;
  rating: number;
  reviews: number;
  description: string;
  openingHours: string[];
  ticketInfo: string[];
  // 擴展欄位（未來可加入）
  address?: string;
  phone?: string;
  website?: string;
  category?: string;
  tags?: string[];
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// 景點卡片用的簡化版本
export interface AttractionCardData {
  id: string;
  name: string;
  imageUrl: string;
  rating: number;
  reviews?: number;
  category?: string;
}
