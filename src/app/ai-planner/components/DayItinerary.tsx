import { ItineraryDay, TypeConfig } from "./types";

interface DayItineraryProps {
  day: ItineraryDay;
  typeConfig: Record<string, TypeConfig>;
}

export default function DayItinerary({ day, typeConfig }: DayItineraryProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-[#Cfb9a5]/10 px-4 py-2 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[#Cfb9a5] text-white text-xs font-bold flex items-center justify-center">
            {day.day}
          </span>
          <span className="font-bold text-gray-800 text-sm">{day.date}</span>
        </div>
      </div>
      <div className="p-3 space-y-2">
        {day.items.map((item, idx) => {
          const config = typeConfig[item.type];
          return (
            <div key={idx} className="flex gap-3 items-start">
              <span className="text-[11px] text-gray-400 font-medium w-12 shrink-0 pt-0.5">
                {item.time}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-800 text-sm">{item.title}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded ${config.bgColor} ${config.color}`}
                  >
                    {config.label}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
