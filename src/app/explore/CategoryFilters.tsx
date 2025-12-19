import CategoryButton, { Category } from './CategoryButton';

interface CategoryFiltersProps {
  categories: readonly Category[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export default function CategoryFilters({
  categories,
  activeCategory,
  onCategoryChange,
}: CategoryFiltersProps) {
  return (
    <div className="flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-1">
      {categories.map((cat) => (
        <CategoryButton
          key={cat.id}
          cat={cat}
          activeCategory={activeCategory}
          onCategoryChange={onCategoryChange}
        />
      ))}
    </div>
  );
}
