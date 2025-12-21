"use client";

import React from "react";
import { AttractionCardData } from "./types";

interface AttractionCardProps {
  attraction: AttractionCardData;
  onClick?: () => void;
  size?: "small" | "medium" | "large";
}

/**
 * 景點卡片組件
 * 用於列表顯示景點的簡要資訊
 */
export default function AttractionCard({
  attraction,
  onClick,
  size = "medium",
}: AttractionCardProps) {
  const sizeStyles = {
    small: {
      card: "w-32",
      image: "h-24",
      title: "text-sm",
    },
    medium: {
      card: "w-40",
      image: "h-28",
      title: "text-base",
    },
    large: {
      card: "w-full",
      image: "h-40",
      title: "text-lg",
    },
  };

  const styles = sizeStyles[size];

  return (
    <button
      onClick={onClick}
      className={`${styles.card} bg-white rounded-2xl shadow-sm overflow-hidden active:scale-[0.98] transition-transform text-left`}
    >
      {/* Image */}
      <div className={`${styles.image} w-full overflow-hidden relative`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={attraction.imageUrl}
          alt={attraction.name}
          className="w-full h-full object-cover"
        />
        {/* Category Badge */}
        {attraction.category && (
          <span className="absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium bg-white/80 backdrop-blur-sm text-[#5C5C5C]">
            {attraction.category}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <h3
          className={`${styles.title} font-bold text-[#5C5C5C] truncate mb-1`}
        >
          {attraction.name}
        </h3>
        <div className="flex items-center text-sm">
          <span className="material-icons-round text-[#e0d6a8] text-base mr-1">
            star
          </span>
          <span className="text-[#5C5C5C]">{attraction.rating.toFixed(1)}</span>
          {attraction.reviews && (
            <span className="text-[#949494] ml-1">
              ({attraction.reviews})
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
