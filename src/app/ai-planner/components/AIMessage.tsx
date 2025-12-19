import Image from "next/image";
import { Message, RecommendedTrip, ItineraryDay, TypeConfig } from "./types";
import TripCard from "./TripCard";
import DayItinerary from "./DayItinerary";

interface AIMessageProps {
  message: Message;
  avatarUrl: string;
  recommendedTrips: RecommendedTrip[];
  itinerary: ItineraryDay[];
  typeConfig: Record<string, TypeConfig>;
  onTripClick: (title: string) => void;
  onAddToItinerary: () => void;
}

export default function AIMessage({
  message,
  avatarUrl,
  recommendedTrips,
  itinerary,
  typeConfig,
  onTripClick,
  onAddToItinerary,
}: AIMessageProps) {
  return (
    <div className="flex gap-3 w-full animate-fade-in">
      <div className="w-8 h-8 rounded-full bg-[#Cfb9a5] flex items-center justify-center shrink-0 shadow-sm ring-2 ring-white overflow-hidden">
        <Image
          src={avatarUrl}
          alt="威廉"
          width={32}
          height={32}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex flex-col gap-3 items-start flex-1 min-w-0">
        <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-sm text-sm text-gray-700 leading-relaxed border border-gray-100 max-w-[95%]">
          {message.content}
        </div>

        {/* 每日行程 */}
        {message.showItinerary && (
          <div className="w-full space-y-3">
            {itinerary.map((day) => (
              <DayItinerary key={day.day} day={day} typeConfig={typeConfig} />
            ))}
            <button
              onClick={onAddToItinerary}
              className="w-full py-3 rounded-xl bg-[#Cfb9a5] text-white font-bold text-sm shadow-lg shadow-[#Cfb9a5]/30 hover:bg-[#b09b88] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span className="material-icons-round text-lg">add_circle</span>
              新增景點到行程
            </button>
          </div>
        )}

        {/* 推薦行程卡片 */}
        {message.showRecommendations && (
          <div className="relative w-full">
            <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar snap-x scroll-pl-0">
              {recommendedTrips.slice(0, 2).map((trip) => (
                <TripCard key={trip.id} trip={trip} onClick={onTripClick} />
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
        )}
      </div>
    </div>
  );
}
