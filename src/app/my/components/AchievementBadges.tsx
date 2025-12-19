import Link from "next/link";
import { Achievement } from "./types";

interface AchievementBadgesProps {
  achievements: Achievement[];
}

export default function AchievementBadges({ achievements }: AchievementBadgesProps) {
  return (
    <section className="px-5 mb-6">
      <div className="bg-[#E8E2DD]/60 rounded-3xl p-5 border border-white/40 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              "url('data:image/svg+xml,%3Csvg width=\\'6\\' height=\\'6\\' viewBox=\\'0 0 6 6\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'%23000000\\' fill-opacity=\\'1\\' fill-rule=\\'evenodd\\'%3E%3Cpath d=\\'M5 0h1L0 6V5zM6 5v1H5z\\'/%3E%3C/g%3E%3C/svg%3E')",
          }}
        />
        <div className="flex justify-between items-center mb-4 relative z-10">
          <h3 className="font-bold text-[#5C5C5C] flex items-center gap-2">
            <span className="material-icons-round text-[#94A3B8] text-lg">military_tech</span>
            成就勳章
          </h3>
          <Link
            href="/my/achievements"
            className="text-xs text-[#94A3B8] font-medium flex items-center hover:underline"
          >
            查看全部 <span className="material-icons-round text-sm">chevron_right</span>
          </Link>
        </div>
        {achievements.length > 0 ? (
          <div className="grid grid-cols-4 gap-3 relative z-10">
            {achievements.map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-1 group cursor-pointer">
                <div
                  className={`w-14 h-14 rounded-full ${item.color} shadow-lg flex items-center justify-center transform group-hover:scale-105 transition-transform border-2 border-dashed border-white/30 ${item.rotate}`}
                >
                  <span className="material-icons-round text-white text-2xl drop-shadow-md">
                    {item.icon}
                  </span>
                </div>
                <span className="text-[10px] font-medium text-[#5C5C5C]">{item.label}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-[#949494] text-sm relative z-10">
            尚未獲得任何徽章
          </div>
        )}
      </div>
    </section>
  );
}
