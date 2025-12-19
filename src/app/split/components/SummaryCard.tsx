interface SummaryCardProps {
  totalToReceive: number;
  totalOwed: number;
}

export default function SummaryCard({ totalToReceive, totalOwed }: SummaryCardProps) {
  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs text-[#949494] mb-1">我要收</p>
          <p className="text-xl font-bold text-[#A8BCA1]">
            {totalToReceive > 0 ? `$${totalToReceive.toLocaleString()}` : "-"}
          </p>
        </div>
        <div className="w-px h-10 bg-gray-200" />
        <div className="flex-1 text-right">
          <p className="text-xs text-[#949494] mb-1">我要付</p>
          <p className="text-xl font-bold text-[#E8A5A5]">
            {totalOwed > 0 ? `$${totalOwed.toLocaleString()}` : "-"}
          </p>
        </div>
      </div>
    </div>
  );
}
