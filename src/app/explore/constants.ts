// 揪團類別定義
export const categories = [
  { id: 'all', label: '全部', icon: 'M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z' },
  { id: 'food', label: '美食', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z' },
  { id: 'photo', label: '攝影', icon: 'M12 9a3 3 0 100 6 3 3 0 000-6zM17 6h-2l-1.5-2h-3L9 6H7c-1.1 0-2 .9-2 2v9c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z' },
  { id: 'outdoor', label: '戶外', icon: 'M14 6l-3.75 5 2.85 3.8-1.6 1.2C9.81 13.75 7 10 7 10l-6 8h22L14 6z' },
  { id: 'music', label: '音樂', icon: 'M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z' },
  { id: 'coffee', label: '咖啡', icon: 'M2 21h18v-2H2M20 8h-2V5h2m0-2H4v10a4 4 0 004 4h6a4 4 0 004-4v-3h2a2 2 0 002-2V5a2 2 0 00-2-2z' },
] as const;

export type CategoryId = typeof categories[number]['id'];

// Mock 揪團資料 - 用於未登入時展示
export const mockTrips = [
  {
    id: '1',
    title: '週末咖啡探險',
    category: 'coffee',
    event_date: '2025-12-20',
    location: '台北車站',
    latitude: 25.035,
    longitude: 121.568,
    member_count: 3,
    max_members: 6,
    organizer_name: '小明',
    organizer_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop',
  },
  {
    id: '2',
    title: '城市攝影散步',
    category: 'photo',
    event_date: '2025-12-21',
    location: '中正紀念堂',
    latitude: 25.028,
    longitude: 121.562,
    member_count: 5,
    max_members: 8,
    organizer_name: '阿華',
    organizer_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    image: 'https://images.unsplash.com/photo-1470004914212-05527e49370b?w=400&h=300&fit=crop',
  },
  {
    id: '3',
    title: '河濱慢跑團',
    category: 'outdoor',
    event_date: '2025-12-22',
    location: '大稻埕碼頭',
    latitude: 25.040,
    longitude: 121.560,
    member_count: 8,
    max_members: 12,
    organizer_name: '小美',
    organizer_avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=300&fit=crop',
  },
  {
    id: '4',
    title: '寧夏夜市美食',
    category: 'food',
    event_date: '2025-12-23',
    location: '寧夏夜市',
    latitude: 25.038,
    longitude: 121.570,
    member_count: 4,
    max_members: 10,
    organizer_name: '大胃王',
    organizer_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop',
  },
  {
    id: '5',
    title: 'LiveHouse 之夜',
    category: 'music',
    event_date: '2025-12-24',
    location: '西門町',
    latitude: 25.030,
    longitude: 121.555,
    member_count: 6,
    max_members: 8,
    organizer_name: '樂迷',
    organizer_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
  },
];

// 計算兩點之間的距離（公里）- Haversine 公式
export function getDistanceFromLatLonInKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// 預設台北位置
export const DEFAULT_LOCATION: [number, number] = [25.033, 121.5654];
