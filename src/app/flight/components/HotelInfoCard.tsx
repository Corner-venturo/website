import { stayInfo } from '../constants';

interface HotelInfoCardProps {
  onMapClick: () => void;
}

export default function HotelInfoCard({ onMapClick }: HotelInfoCardProps) {
  return (
    <div className="glass-card rounded-3xl p-6 relative overflow-hidden shadow-soft">
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-morandi-blue/10 rounded-full blur-2xl pointer-events-none" />
      <div className="mb-5 relative z-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 leading-tight">{stayInfo.name}</h2>
        <div className="flex items-center gap-1">
          <div className="flex text-morandi-yellow text-sm">
            {[...Array(stayInfo.stars)].map((_, i) => (
              <span key={i} className="material-icons-round text-base">star</span>
            ))}
          </div>
          <span className="text-xs text-gray-400 font-medium ml-1">{stayInfo.rating} Excellent</span>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6 relative z-10 bg-white/40 rounded-2xl p-4 border border-white/40">
        <div className="text-left w-[40%]">
          <div className="text-[10px] text-gray-500 mb-1 font-medium">入住 CHECK-IN</div>
          <div className="text-lg font-bold text-gray-800 tracking-tight">{stayInfo.checkIn.date}</div>
          <div className="text-xs font-medium text-gray-400 mt-0.5">{stayInfo.checkIn.day} {stayInfo.checkIn.time}</div>
        </div>
        <div className="flex flex-col items-center justify-center">
          <div className="w-px h-8 bg-gray-300 mb-1" />
          <div className="bg-primary/10 text-primary px-2 py-0.5 rounded-md text-[10px] font-bold">{stayInfo.nights} 晚</div>
        </div>
        <div className="text-right w-[40%]">
          <div className="text-[10px] text-gray-500 mb-1 font-medium">退房 CHECK-OUT</div>
          <div className="text-lg font-bold text-gray-800 tracking-tight">{stayInfo.checkOut.date}</div>
          <div className="text-xs font-medium text-gray-400 mt-0.5">{stayInfo.checkOut.day} {stayInfo.checkOut.time}</div>
        </div>
      </div>

      <div className="flex items-start justify-between gap-3 relative z-10">
        <div className="flex items-start gap-2.5">
          <span className="material-icons-round text-primary text-xl mt-0.5">location_on</span>
          <span className="text-sm text-gray-600 leading-relaxed font-medium">{stayInfo.address}</span>
        </div>
        <button
          onClick={onMapClick}
          className="shrink-0 w-8 h-8 rounded-full bg-white border border-gray-100 text-morandi-blue flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
          aria-label="在地圖中查看"
        >
          <span className="material-icons-round text-sm">map</span>
        </button>
      </div>
    </div>
  );
}
