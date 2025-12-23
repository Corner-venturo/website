"use client";

import Link from "next/link";

export default function WishlistPage() {
  return (
    <div className="min-h-[100dvh] bg-[#F0EEE6] font-sans">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#F0EEE6]/95 backdrop-blur-sm px-5 py-4 flex items-center gap-4 border-b border-gray-200/50">
        <Link
          href="/"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm active:scale-95 transition-transform"
        >
          <span className="material-icons-round text-gray-600">arrow_back</span>
        </Link>
        <h1 className="text-xl font-bold text-[#5C5C5C]">願望清單</h1>
      </header>

      {/* Content */}
      <div className="px-5 py-8">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-[#Cfb9a5]/20 rounded-full flex items-center justify-center">
            <span className="material-icons-round text-4xl text-[#Cfb9a5]">favorite_border</span>
          </div>
          <h2 className="text-lg font-bold text-gray-800 mb-2">尚無願望清單</h2>
          <p className="text-sm text-gray-500">將喜歡的行程加入願望清單，方便日後查看</p>
        </div>
      </div>
    </div>
  );
}
