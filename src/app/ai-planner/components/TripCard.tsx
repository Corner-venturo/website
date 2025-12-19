import { RecommendedTrip } from "./types";

interface TripCardProps {
  trip: RecommendedTrip;
  onClick: (title: string) => void;
}

export default function TripCard({ trip, onClick }: TripCardProps) {
  return (
    <div
      onClick={() => onClick(trip.title)}
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
  );
}
