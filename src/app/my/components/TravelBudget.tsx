import Image from "next/image";

interface TravelBudgetProps {
  isLoggedIn: boolean;
  friends: string[];
}

export default function TravelBudget({ isLoggedIn, friends }: TravelBudgetProps) {
  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 shadow-sm p-5 relative overflow-hidden transition-all duration-300">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xs font-bold text-[#949494] uppercase tracking-wider mb-1 flex items-center gap-1">
            旅費管家
          </h3>
          {isLoggedIn ? (
            <div className="text-sm text-[#949494]">尚未設定旅程預算</div>
          ) : (
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-[#5C5C5C]">$12,450</span>
              <span className="text-xs text-[#949494] font-medium">/ $20,000 TWD</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center">
            <button
              className="group flex items-center justify-center w-10 h-10 rounded-full bg-[#A8BCA1]/10 text-[#A8BCA1] hover:bg-[#A8BCA1] hover:text-white transition-all duration-300 shadow-sm"
              title="多人分帳"
            >
              <span className="material-icons-round text-xl">call_split</span>
            </button>
            <span className="text-[9px] text-[#A8BCA1] font-medium mt-1">分帳</span>
          </div>
          <div className="flex flex-col items-center">
            <button
              className="w-10 h-10 rounded-full bg-[#94A3B8] text-white shadow-lg shadow-[#94A3B8]/30 flex items-center justify-center hover:scale-110 transition-transform"
              title="新增消費"
            >
              <span className="material-icons-round text-xl">add</span>
            </button>
            <span className="text-[9px] text-[#94A3B8] font-medium mt-1">記帳</span>
          </div>
        </div>
      </div>

      {!isLoggedIn && (
        <>
          <div className="mt-2 mb-4">
            <div className="flex justify-between text-[10px] text-[#949494] mb-1.5">
              <span>京都自由行</span>
              <span>62%</span>
            </div>
            <div className="h-2 w-full bg-[#E8E2DD] rounded-full overflow-hidden">
              <div className="h-full bg-[#94A3B8] rounded-full w-[62%]" />
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-[#E8E2DD]">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-[#A8BCA1] rounded-full" />
                <span className="text-xs font-bold text-[#5C5C5C]">快速分帳群組</span>
              </div>
              <button className="text-[10px] text-[#94A3B8] font-medium flex items-center hover:underline">
                選擇好友{" "}
                <span className="material-icons-round text-[10px]">arrow_forward_ios</span>
              </button>
            </div>

            <div className="bg-white/40 rounded-xl p-2.5 flex items-center justify-between border border-white/30">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-3">
                  {friends.slice(0, 2).map((friend, i) => (
                    <Image
                      key={`mobile-friend-${i}`}
                      src={friend}
                      alt="Friend"
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full border-2 border-white object-cover"
                    />
                  ))}
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-[#D8D0C9] text-white flex items-center justify-center text-[9px] font-bold shadow-sm">
                    +3
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-medium text-[#949494]">當前分配</span>
                  <span className="text-xs font-bold text-[#5C5C5C]">5 人均分</span>
                </div>
              </div>
              <button
                className="w-8 h-8 rounded-full bg-[#A8BCA1]/20 text-[#A8BCA1] hover:bg-[#A8BCA1] hover:text-white flex items-center justify-center transition-colors"
                aria-label="確認分帳群組"
              >
                <span className="material-icons-round text-base">check</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
