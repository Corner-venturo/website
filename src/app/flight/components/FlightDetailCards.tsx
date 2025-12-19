import { flightInfo } from '../constants';

export default function FlightDetailCards() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="glass-card p-4 rounded-2xl flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-morandi-blue/20 flex items-center justify-center shrink-0">
          <span className="material-icons-round text-morandi-blue text-sm">luggage</span>
        </div>
        <div>
          <div className="text-[10px] text-gray-500 mb-0.5">托運行李</div>
          <div className="text-sm font-bold text-gray-800">{flightInfo.baggage}</div>
        </div>
      </div>
      <div className="glass-card p-4 rounded-2xl flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-morandi-green/20 flex items-center justify-center shrink-0">
          <span className="material-icons-round text-morandi-green text-sm">backpack</span>
        </div>
        <div>
          <div className="text-[10px] text-gray-500 mb-0.5">手提行李</div>
          <div className="text-sm font-bold text-gray-800">{flightInfo.carryOn}</div>
        </div>
      </div>
      <div className="glass-card p-4 rounded-2xl flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-morandi-pink/20 flex items-center justify-center shrink-0">
          <span className="material-icons-round text-morandi-pink text-sm">restaurant</span>
        </div>
        <div>
          <div className="text-[10px] text-gray-500 mb-0.5">機上餐點</div>
          <div className="text-sm font-bold text-gray-800">{flightInfo.meal}</div>
        </div>
      </div>
      <div className="glass-card p-4 rounded-2xl flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-morandi-yellow/20 flex items-center justify-center shrink-0">
          <span className="material-icons-round text-yellow-600 text-sm">airline_seat_recline_extra</span>
        </div>
        <div>
          <div className="text-[10px] text-gray-500 mb-0.5">艙等</div>
          <div className="text-sm font-bold text-gray-800">{flightInfo.cabin}</div>
        </div>
      </div>
    </div>
  );
}
