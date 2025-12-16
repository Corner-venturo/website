"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

interface BottomNavProps {
  className?: string;
}

export default function BottomNav({ className }: BottomNavProps) {
  const pathname = usePathname() ?? '/';
  const [showPersonalMenu, setShowPersonalMenu] = useState(false);

  const activeKey = useMemo(() => {
    if (pathname.startsWith("/explore")) return "explore";
    if (pathname.startsWith("/wishlist")) return "wishlist";
    if (
      pathname.startsWith("/profile") ||
      pathname.startsWith("/my") ||
      pathname.startsWith("/split")
    )
      return "personal";
    return "home";
  }, [pathname]);

  const containerClassName =
    className ?? "fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-40 xl:hidden";

  const navButtonClass = (key: string) =>
    `flex-1 flex justify-center py-2 transition ${
      activeKey === key ? "text-[#94A3B8]" : "text-[#B0B0B0] hover:text-[#8C8C8C]"
    }`;

  const closeMenu = () => setShowPersonalMenu(false);

  return (
    <>
      <div className={containerClassName}>
        <div className="bg-white/80 backdrop-blur-xl rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white/60 p-2 flex justify-between items-center">
          <Link href="/" className={navButtonClass("home")} onClick={closeMenu}>
            <span className="material-icons-round">home</span>
          </Link>
          <Link href="/explore" className={navButtonClass("explore")} onClick={closeMenu}>
            <span className="material-icons-round">explore</span>
          </Link>
          <Link href="/wishlist" className={navButtonClass("wishlist")} onClick={closeMenu}>
            <span className="material-icons-round">favorite</span>
          </Link>
          <button
            type="button"
            className={navButtonClass("personal")}
            onClick={() => setShowPersonalMenu((prev) => !prev)}
            aria-label="開啟個人工具"
          >
            <span className="material-icons-round">person</span>
          </button>
        </div>
      </div>

      {showPersonalMenu && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-end pb-24 pr-6"
          onClick={closeMenu}
        >
          <div className="absolute inset-0 bg-black/20" />
          <div
            className="relative pointer-events-auto bg-white/95 backdrop-blur-xl border border-white/60 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] rounded-[2rem] p-3 w-[190px] origin-bottom-right flex flex-col gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <Link
              href="/profile"
              className="group flex items-center gap-3 w-full p-2.5 rounded-[1.2rem] hover:bg-[#F5F4F0] transition-all active:scale-95"
              onClick={closeMenu}
            >
              <div className="w-9 h-9 rounded-full bg-[#F2EBE9] flex items-center justify-center text-[#C5B6AF] group-hover:scale-110 transition-transform">
                <span className="material-icons-round text-[18px]">verified_user</span>
              </div>
              <span className="text-[13px] font-bold text-[#5C5C5C] tracking-wide">旅人護照</span>
            </Link>
            <Link
              href="#"
              className="group flex items-center gap-3 w-full p-2.5 rounded-[1.2rem] hover:bg-[#F5F4F0] transition-all active:scale-95"
              onClick={closeMenu}
            >
              <div className="w-9 h-9 rounded-full bg-[#EDF2EC] flex items-center justify-center text-[#A8BCA1] group-hover:scale-110 transition-transform">
                <span className="material-icons-round text-[18px]">airplane_ticket</span>
              </div>
              <span className="text-[13px] font-bold text-[#5C5C5C] tracking-wide">我的訂單</span>
            </Link>
            <Link
              href="/split"
              className="group flex items-center gap-3 w-full p-2.5 rounded-[1.2rem] hover:bg-[#F5F4F0] transition-all active:scale-95"
              onClick={closeMenu}
            >
              <div className="w-9 h-9 rounded-full bg-[#E6EBF2] flex items-center justify-center text-[#94A3B8] group-hover:scale-110 transition-transform">
                <span className="material-icons-round text-[18px]">pie_chart</span>
              </div>
              <span className="text-[13px] font-bold text-[#5C5C5C] tracking-wide">分帳</span>
            </Link>
            <Link
              href="#"
              className="group flex items-center gap-3 w-full p-2.5 rounded-[1.2rem] hover:bg-[#F5F4F0] transition-all active:scale-95"
              onClick={closeMenu}
            >
              <div className="w-9 h-9 rounded-full bg-[#F0EBE6] flex items-center justify-center text-[#BAACA5] group-hover:scale-110 transition-transform">
                <span className="material-icons-round text-[18px]">groups</span>
              </div>
              <span className="text-[13px] font-bold text-[#5C5C5C] tracking-wide">朋友</span>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
