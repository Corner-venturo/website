export interface Message {
  id: number;
  type: "user" | "ai";
  content: string;
  showRecommendations?: boolean;
  showItinerary?: boolean;
  tripTitle?: string;
}

export interface RecommendedTrip {
  id: number;
  title: string;
  description: string;
  duration: string;
  price: string;
  note: string;
  image: string | null;
}

export interface ItineraryItem {
  time: string;
  title: string;
  type: string;
  description: string;
}

export interface ItineraryDay {
  day: number;
  date: string;
  items: ItineraryItem[];
}

export interface TypeConfig {
  label: string;
  color: string;
  bgColor: string;
}

export interface AutoReply {
  keywords: string[];
  response: string;
  showRecommendations?: boolean;
}
