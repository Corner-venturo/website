import Link from "next/link";

export default function SettingsLink() {
  return (
    <Link
      href="/my/settings"
      className="w-full bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 shadow-sm p-4 flex items-center justify-between group"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#E8E2DD] flex items-center justify-center text-[#949494] group-hover:bg-[#94A3B8] group-hover:text-white transition-colors">
          <span className="material-icons-round">tune</span>
        </div>
        <span className="font-bold text-[#5C5C5C] text-sm">應用程式設定</span>
      </div>
      <span className="material-icons-round text-[#949494] text-xl">chevron_right</span>
    </Link>
  );
}
