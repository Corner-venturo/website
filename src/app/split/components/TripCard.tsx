'use client';

import Image from "next/image";
import Link from "next/link";
import { Trip } from "./types";
import { getOptimizedImageProps } from "@/lib/image-utils";

interface TripCardProps {
  trip: Trip;
}

export default function TripCard({ trip }: TripCardProps) {
  return (
    <Link
      href={`/split/${trip.id}`}
      className="block bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 overflow-hidden shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
    >
      <div className="flex">
        {/* 圖片 */}
        <div className="relative w-24 h-24 shrink-0">
          <Image src={trip.image} alt={trip.title} fill className="object-cover" {...getOptimizedImageProps(trip.image)} />
          <div
            className={`absolute top-2 left-2 ${trip.statusColor} text-white text-[10px] font-medium px-2 py-0.5 rounded-full`}
          >
            {trip.statusLabel}
          </div>
        </div>

        {/* 內容 */}
        <div className="flex-1 p-3 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-[#5C5C5C] text-sm line-clamp-1">{trip.title}</h3>
            <p className="text-[11px] text-[#949494] mt-0.5">{trip.date}</p>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-[11px] text-[#949494]">
              <span className="material-icons-round text-sm">group</span>
              {trip.members} 人
            </div>
            <div className="text-right">
              {trip.myBalance !== 0 ? (
                <p
                  className={`text-sm font-bold ${
                    trip.myBalance > 0 ? "text-[#A8BCA1]" : "text-[#E8A5A5]"
                  }`}
                >
                  {trip.myBalance > 0 ? "+" : ""}
                  {trip.myBalance.toLocaleString()}
                </p>
              ) : (
                <p className="text-sm font-medium text-[#949494]">已結清</p>
              )}
            </div>
          </div>
        </div>

        {/* 箭頭 */}
        <div className="flex items-center pr-3">
          <span className="material-icons-round text-[#C5B6AF]">chevron_right</span>
        </div>
      </div>
    </Link>
  );
}
