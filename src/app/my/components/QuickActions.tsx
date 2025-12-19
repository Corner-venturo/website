import Link from "next/link";
import { QuickAction } from "./types";

interface QuickActionsProps {
  actions: QuickAction[];
}

export default function QuickActions({ actions }: QuickActionsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map((action) => (
        <Link
          key={action.title}
          href={action.href}
          className="bg-white/60 backdrop-blur-xl border border-white/50 p-4 rounded-2xl shadow-sm text-left hover:bg-white/80 transition-colors group relative overflow-hidden"
        >
          <div
            className={`absolute top-0 right-0 w-16 h-16 ${action.accent} rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`}
          />
          <span
            className={`material-symbols-outlined ${action.color} text-3xl mb-2 group-hover:rotate-12 transition-transform duration-300`}
          >
            {action.icon}
          </span>
          <div className="font-bold text-[#5C5C5C] text-sm">{action.title}</div>
          <div className="text-[10px] text-[#949494] mt-1">{action.subtitle}</div>
        </Link>
      ))}
    </div>
  );
}
