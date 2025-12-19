import { categories } from './constants';

export type Category = (typeof categories)[number];

interface CategoryButtonProps {
  cat: Category;
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export default function CategoryButton({
  cat,
  activeCategory,
  onCategoryChange,
}: CategoryButtonProps) {
  return (
    <button
      onClick={() => onCategoryChange(cat.id)}
      className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
        activeCategory === cat.id
          ? 'bg-[#94A3B8] text-white shadow-lg shadow-[#94A3B8]/30'
          : 'bg-white/60 backdrop-blur-xl text-[#5C5C5C] border border-white/50 hover:bg-white/80'
      }`}
    >
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d={cat.icon} />
      </svg>
      {cat.label}
    </button>
  );
}
