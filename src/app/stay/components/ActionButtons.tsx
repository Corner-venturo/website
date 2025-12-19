export default function ActionButtons() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-6 bg-gradient-to-t from-[#F0EEE6] via-[#F0EEE6]/95 to-transparent pointer-events-none">
      <div className="pointer-events-auto flex gap-3 max-w-md mx-auto w-full">
        <button className="flex-1 py-3.5 rounded-2xl bg-white text-gray-600 font-bold text-sm shadow-sm border border-gray-200 hover:bg-gray-50 transition-all active:scale-95 flex items-center justify-center gap-2">
          <span className="material-icons-round text-base">receipt_long</span>
          查看憑證
        </button>
        <button className="flex-[2] py-3.5 rounded-2xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/30 flex items-center justify-center gap-2 hover:bg-primary-dark transition-all active:scale-95">
          <span className="material-icons-round text-base">support_agent</span>
          聯絡酒店
        </button>
      </div>
    </div>
  );
}
