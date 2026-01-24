import React from 'react';

interface CategoryFilterProps {
    categories: string[];
    activeCategory: string;
    onCategoryChange: (category: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
    categories,
    activeCategory,
    onCategoryChange
}) => {
    return (
        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
            {categories.map((category, index) => (
                <button
                    key={`${category}-${index}`}
                    onClick={() => onCategoryChange(category)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all active:scale-95 ${activeCategory === category
                        ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105'
                        : 'bg-white text-slate-500 border border-slate-100 hover:border-primary/20 hover:text-primary hover:bg-primary/5 shadow-sm'
                        }`}
                >
                    {category}
                </button>
            ))}
        </div>
    );
};
