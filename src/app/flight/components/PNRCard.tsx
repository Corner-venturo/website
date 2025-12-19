import { flightInfo } from '../constants';

export default function PNRCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
      <div className="p-5 relative z-10">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-[10px] text-gray-400 mb-1 uppercase tracking-wider font-bold">訂位代號 (PNR)</div>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-mono font-bold text-gray-800 tracking-widest">{flightInfo.pnr}</span>
              <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-primary transition-colors" aria-label="複製 PNR">
                <span className="material-icons-round text-base">content_copy</span>
              </button>
            </div>
          </div>
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
            <span className="material-icons-round text-2xl text-gray-400">qr_code_2</span>
          </div>
        </div>
      </div>
      <div className="relative flex items-center justify-center px-2">
        <div className="absolute left-0 w-4 h-8 bg-[#F0EEE6] rounded-r-full -ml-2" />
        <div className="absolute right-0 w-4 h-8 bg-[#F0EEE6] rounded-l-full -mr-2" />
        <div className="w-full border-t-2 border-dashed border-gray-200 h-px" />
      </div>
      <button className="w-full p-4 flex justify-between items-center hover:bg-gray-50 transition-colors" aria-label="查看電子機票">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-icons-round text-sm">confirmation_number</span>
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-gray-700">電子機票 ({flightInfo.ticket})</div>
            <div className="text-[10px] text-gray-400">點擊查看或下載 PDF</div>
          </div>
        </div>
        <span className="material-icons-round text-gray-300 text-lg">chevron_right</span>
      </button>
    </div>
  );
}
