export type ItemType = 'restaurant' | 'attraction' | 'activity' | 'transportation';
export type ItemStatus = 'completed' | 'pending' | 'upcoming';

export interface WishlistItem {
  id: string;
  time: string;
  title: string;
  description: string;
  badges: string[];
  image: string;
  status: ItemStatus;
  type: ItemType;
  duration?: string;
}

export interface DrawerItem {
  id: string;
  name: string;
  type: ItemType;
  description: string;
  image: string;
  tags: string[];
  duration?: string;
}

export interface Region {
  id: string;
  label: string;
  country: string;
}
