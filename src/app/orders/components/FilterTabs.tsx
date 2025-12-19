"use client";

import { FilterType } from "./types";

interface FilterTabsProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

interface FilterOption {
  key: FilterType;
  label: string;
  icon: string;
  activeColor: string;
}

const filterOptions: FilterOption[] = [
  { key: "all", label: "全部", icon: "list", activeColor: "bg-[#94A3B8] shadow-[#94A3B8]/30" },
  { key: "upcoming", label: "出發", icon: "flight_takeoff", activeColor: "bg-[#94A3B8] shadow-[#94A3B8]/30" },
  { key: "pending", label: "待確認", icon: "pending", activeColor: "bg-[#C5B6AF] shadow-[#C5B6AF]/30" },
  { key: "planning", label: "規劃中", icon: "edit_note", activeColor: "bg-[#A8BCA1] shadow-[#A8BCA1]/30" },
];

export default function FilterTabs({ activeFilter, onFilterChange }: FilterTabsProps) {
  return (
    <div className="flex gap-2">
      {filterOptions.map((option) => (
        <button
          key={option.key}
          onClick={() => onFilterChange(option.key)}
          className={`flex-1 py-2 rounded-full text-xs font-medium flex items-center justify-center gap-1 transition-all ${
            activeFilter === option.key
              ? `${option.activeColor} text-white shadow-lg`
              : "bg-white/60 backdrop-blur-xl border border-white/50 text-[#5C5C5C] hover:bg-white/80"
          }`}
        >
          <span className="material-icons-round text-sm">{option.icon}</span>
          {option.label}
        </button>
      ))}
    </div>
  );
}
