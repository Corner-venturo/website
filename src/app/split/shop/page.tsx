"use client";

import Link from "next/link";
import { useState } from "react";

// 商品資料
const products = [
  {
    id: 0,
    title: "威廉晚餐約會",
    description: "與創辦人共進浪漫晚餐",
    image: "/images/messageImage.jpg",
    points: 100000,
    stock: 1,
    tag: "超限量",
    tagColor: "bg-gradient-to-r from-[#FFD700] to-[#FFA500]",
    available: true,
  },
  {
    id: 1,
    title: "東京來回機票 $2000 折抵券",
    description: "適用於全日空、日本航空",
    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop",
    points: 10000,
    stock: 124,
    tag: "熱門兌換",
    tagColor: "bg-black/40",
    available: true,
  },
  {
    id: 2,
    title: "機場貴賓室咖啡券",
    description: "全球 50+ 機場通用",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop",
    points: 800,
    stock: 890,
    tag: null,
    available: true,
  },
  {
    id: 3,
    title: "五星飯店住宿 9 折券",
    description: "最高折抵 $3000",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop",
    points: 5000,
    stock: 50,
    tag: "限時",
    tagColor: "bg-[#CFA5A5]/80",
    available: true,
  },
  {
    id: 4,
    title: "7日上網 SIM 卡 (亞洲)",
    description: "吃到飽不降速",
    image: "https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=400&h=300&fit=crop",
    points: 2200,
    stock: 999,
    tag: null,
    available: true,
  },
  {
    id: 5,
    title: "輕量登機箱 20吋",
    description: "耐摔 PC 材質",
    image: "https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=400&h=300&fit=crop",
    points: 15000,
    stock: 0,
    tag: null,
    available: false,
  },
  {
    id: 6,
    title: "景點門票買一送一",
    description: "指定熱門景點",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop",
    points: 1500,
    stock: 330,
    tag: null,
    available: true,
  },
];

const categories = ["全部", "機票優惠", "住宿折扣", "行程體驗", "實體好禮"];

interface Product {
  id: number;
  title: string;
  description: string;
  image: string;
  points: number;
  stock: number;
  tag: string | null;
  tagColor?: string;
  available: boolean;
}

function ProductCard({ product }: { product: Product }) {
  return (
    <div
      className={`bg-white/60 backdrop-blur-xl border border-white/50 rounded-xl overflow-hidden group flex flex-col h-full hover:shadow-lg transition-all duration-300 ${
        !product.available ? "opacity-80" : ""
      }`}
    >
      <div className="aspect-[4/3] w-full overflow-hidden relative bg-gray-200">
        <img
          src={product.image}
          alt={product.title}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${
            !product.available ? "grayscale" : ""
          }`}
        />
        {product.tag && (
          <div
            className={`absolute top-2 left-2 ${product.tagColor || "bg-black/40"} backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full`}
          >
            {product.tag}
          </div>
        )}
        {!product.available && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white text-xs font-bold border border-white/50 px-3 py-1 rounded-full backdrop-blur-sm">
              已兌罄
            </span>
          </div>
        )}
      </div>
      <div className="p-3 flex flex-col flex-1">
        <h3
          className={`text-sm font-bold leading-tight mb-1 line-clamp-2 ${
            product.available ? "text-[#5C5C5C]" : "text-[#949494]"
          }`}
        >
          {product.title}
        </h3>
        <p className="text-[10px] text-[#949494] mb-3">{product.description}</p>
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-2">
            <span
              className={`text-base font-bold ${
                product.available ? "text-[#Cfb9a5]" : "text-[#949494]"
              }`}
            >
              {product.points.toLocaleString()}{" "}
              <span className="text-xs font-normal">P</span>
            </span>
            <span className="text-[10px] text-[#949494]">
              {product.stock > 0 ? `餘 ${product.stock}` : "餘 0"}
            </span>
          </div>
          {product.available ? (
            <button className="w-full bg-[#Cfb9a5] hover:bg-[#c0aa96] text-white text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center">
              立即兌換
            </button>
          ) : (
            <button
              className="w-full bg-gray-200 text-[#949494] text-xs font-bold py-2 rounded-lg cursor-not-allowed"
              disabled
            >
              補貨中
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState("全部");
  const currentPoints = 2450;

  return (
    <div className="bg-[#F5F4F0] min-h-screen font-sans">
      {/* 背景 */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-[5%] -left-[15%] w-[500px] h-[500px] bg-[#D8D0C9] opacity-40 blur-[90px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[450px] h-[450px] bg-[#C8D6D3] opacity-40 blur-[90px] rounded-full" />
        <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] bg-[#A5BCCF]/20 rounded-full blur-[70px]" />
      </div>

      {/* Header */}
      <header className="relative z-50 px-5 pt-12 pb-2 flex items-center justify-between">
        <Link
          href="/split/tasks"
          className="bg-white/60 backdrop-blur-xl border border-white/50 p-2.5 rounded-full shadow-sm text-[#5C5C5C] hover:text-[#Cfb9a5] transition-colors flex items-center justify-center w-10 h-10"
        >
          <span className="material-icons-round text-xl">arrow_back</span>
        </Link>
        <h1 className="text-lg font-bold text-[#5C5C5C] tracking-tight">
          點數商店
        </h1>
        <Link
          href="/split/points"
          className="bg-white/60 backdrop-blur-xl border border-white/50 p-2.5 rounded-full shadow-sm text-[#5C5C5C] hover:text-[#Cfb9a5] transition-colors flex items-center justify-center w-10 h-10"
          title="點數紀錄"
        >
          <span className="material-icons-round text-xl">receipt_long</span>
        </Link>
      </header>

      {/* 主要內容 */}
      <main className="relative z-10 pb-10">
        {/* 點數卡片 */}
        <section className="px-5 py-4">
          <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-2xl p-5 relative overflow-hidden shadow-lg">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#E0D6A8]/20 rounded-bl-full -mr-6 -mt-6 blur-xl" />
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-[#949494] mb-1 flex items-center gap-1">
                  <span className="material-icons-round text-sm">
                    account_balance_wallet
                  </span>
                  可用點數
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-[#5C5C5C] tracking-tight">
                    {currentPoints.toLocaleString()}
                  </span>
                  <span className="text-sm font-medium text-[#Cfb9a5]">P</span>
                </div>
              </div>
              <button className="text-xs text-[#Cfb9a5] font-bold flex items-center gap-1 hover:text-[#c0aa96] transition-colors bg-white/50 px-3 py-2 rounded-lg border border-white/30">
                <span className="material-icons-round text-sm">
                  help_outline
                </span>
                用途說明
              </button>
            </div>
          </div>
        </section>

        {/* 分類標籤 */}
        <section className="px-5 mb-4 sticky top-0 z-30 pt-2 pb-2 backdrop-blur-md bg-gradient-to-b from-[#F5F4F0]/80 to-transparent">
          <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar py-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all active:scale-95 whitespace-nowrap ${
                  activeCategory === category
                    ? "bg-[#Cfb9a5] text-white shadow-md shadow-[#Cfb9a5]/20"
                    : "bg-white/60 backdrop-blur-xl border border-white/50 text-[#5C5C5C] hover:bg-white/80"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        {/* 商品網格 */}
        <section className="px-5 pb-6">
          <div className="grid grid-cols-2 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-8 mb-4 text-center px-4">
            <p className="text-[11px] text-[#949494] leading-relaxed">
              兌換後的商品將存入您的「我的票券」中。
              <br />
              部分商品數量有限，兌完為止。
            </p>
          </div>
        </section>
      </main>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
