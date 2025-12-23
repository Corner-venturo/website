'use client';

import Image from "next/image";
import Link from "next/link";
import { getOptimizedImageProps } from "@/lib/image-utils";

interface ProfileHeaderProps {
  userName: string;
  avatarUrl: string | null;
  isFoundingMember?: boolean;
  memberNumber?: number | null;
}

export default function ProfileHeader({
  userName,
  avatarUrl,
  isFoundingMember,
  memberNumber,
}: ProfileHeaderProps) {
  return (
    <div className="px-6 pb-5 flex items-center gap-4">
      <Link href="/my/settings" className="relative shrink-0 group">
        <div className="w-20 h-20 rounded-full p-1 border-2 border-[#94A3B8]/30 group-hover:border-[#94A3B8]/50 transition">
          <div className="relative w-full h-full rounded-full overflow-hidden shadow-sm bg-[#D6CDC8] flex items-center justify-center">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="Profile"
                fill
                sizes="80px"
                className="object-cover"
                {...getOptimizedImageProps(avatarUrl)}
              />
            ) : (
              <span className="text-2xl font-bold text-white">
                {userName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        </div>
        <div className="absolute -bottom-1 -left-1 w-7 h-7 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-white/50 flex items-center justify-center text-[#949494] group-hover:text-[#5C5C5C] transition">
          <span className="material-icons-outlined text-base">settings</span>
        </div>
      </Link>
      <div className="flex-1">
        <h2 className="text-xl font-bold text-[#5C5C5C] mb-2">{userName}</h2>
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-2 text-center border border-white/50">
            <span className="text-base font-bold text-[#5C5C5C]">0</span>
            <span className="block text-[9px] text-[#949494] font-medium">國家</span>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-2 text-center border border-white/50">
            <span className="text-base font-bold text-[#5C5C5C]">0</span>
            <span className="block text-[9px] text-[#949494] font-medium">旅程</span>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-2 text-center border border-white/50">
            <span className="text-base font-bold text-[#5C5C5C]">0</span>
            <span className="block text-[9px] text-[#949494] font-medium">收藏</span>
          </div>
          {isFoundingMember && memberNumber ? (
            <div className="bg-gradient-to-r from-[#94A3B8] to-[#A8BCA1] rounded-xl p-2 text-center shadow-md">
              <span className="text-base font-bold text-white">#{memberNumber}</span>
              <span className="block text-[9px] text-white/80 font-medium">創始</span>
            </div>
          ) : (
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-2 text-center border border-white/50">
              <span className="text-base font-bold text-[#5C5C5C]">1</span>
              <span className="block text-[9px] text-[#949494] font-medium">等級</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
