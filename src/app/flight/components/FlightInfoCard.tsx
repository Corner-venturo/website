import { flightInfo } from '../constants';

export default function FlightInfoCard() {
  return (
    <div className="glass-card rounded-3xl p-6 relative overflow-hidden shadow-soft">
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-morandi-blue/10 rounded-full blur-2xl pointer-events-none" />
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-gray-800 text-2xl">airlines</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-lg text-gray-800">{flightInfo.airline}</h2>
            </div>
            <div className="text-xs font-medium text-gray-500">
              {flightInfo.flightNumber} · {flightInfo.aircraft}
            </div>
          </div>
        </div>
        <span className="text-sm font-medium text-gray-500">
          {flightInfo.date}
        </span>
      </div>

      <div className="flex justify-between items-center text-center mb-6 relative z-10">
        <div className="text-left w-1/3">
          <div className="text-4xl font-bold text-gray-800 mb-1 tracking-tight">{flightInfo.departure.time}</div>
          <div className="text-xl font-bold text-primary">{flightInfo.departure.code}</div>
          <div className="text-xs text-gray-400 mt-1">{flightInfo.departure.terminal}</div>
        </div>
        <div className="flex-1 px-2 flex flex-col items-center">
          <div className="text-[10px] text-gray-400 font-medium mb-1 uppercase tracking-wide">{flightInfo.duration}</div>
          <div className="w-full h-[2px] bg-gray-200 relative flex items-center justify-between">
            <div className="w-2 h-2 rounded-full bg-gray-400 border-2 border-white" />
            <div className="w-2 h-2 rounded-full bg-gray-400 border-2 border-white" />
          </div>
          <span className="material-icons-round text-primary text-sm mt-1 rotate-90">flight</span>
        </div>
        <div className="text-right w-1/3">
          <div className="text-4xl font-bold text-gray-800 mb-1 tracking-tight">{flightInfo.arrival.time}</div>
          <div className="text-xl font-bold text-primary">{flightInfo.arrival.code}</div>
          <div className="text-xs text-gray-400 mt-1">{flightInfo.arrival.terminal}</div>
        </div>
      </div>
    </div>
  );
}
