import type { StayInfo } from "@/components/shared";

interface DetailCardsProps {
  stayInfo: StayInfo;
}

export default function DetailCards({ stayInfo }: DetailCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="glass-card p-3.5 rounded-2xl flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-morandi-blue/20 flex items-center justify-center shrink-0">
          <span className="material-icons-round text-morandi-blue text-sm">bed</span>
        </div>
        <div>
          <div className="text-[10px] text-gray-500 mb-0.5">房型</div>
          <div className="text-sm font-bold text-gray-800 leading-tight">
            {stayInfo.roomType}
            <br />
            <span className="text-[10px] font-normal text-gray-400">{stayInfo.bedType}</span>
          </div>
        </div>
      </div>

      <div className="glass-card p-3.5 rounded-2xl flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-morandi-green/20 flex items-center justify-center shrink-0">
          <span className="material-icons-round text-morandi-green text-sm">group</span>
        </div>
        <div>
          <div className="text-[10px] text-gray-500 mb-0.5">入住人數</div>
          <div className="text-sm font-bold text-gray-800">{stayInfo.guests}</div>
        </div>
      </div>

      <div className="glass-card p-3.5 rounded-2xl flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-morandi-pink/20 flex items-center justify-center shrink-0">
          <span className="material-icons-round text-morandi-pink text-sm">restaurant</span>
        </div>
        <div>
          <div className="text-[10px] text-gray-500 mb-0.5">特殊需求</div>
          <div className="text-sm font-bold text-gray-800">
            {stayInfo.requests[0]}
            <br />
            <span className="text-[10px] font-normal text-gray-400">{stayInfo.requests[1]}</span>
          </div>
        </div>
      </div>

      <div className="glass-card p-3.5 rounded-2xl flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-morandi-yellow/20 flex items-center justify-center shrink-0">
          <span className="material-icons-round text-yellow-600 text-sm">payments</span>
        </div>
        <div>
          <div className="text-[10px] text-gray-500 mb-0.5">付款狀態</div>
          <div className="text-sm font-bold text-green-600">{stayInfo.paymentStatus}</div>
        </div>
      </div>
    </div>
  );
}
