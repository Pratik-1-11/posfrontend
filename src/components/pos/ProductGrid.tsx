import React, { useMemo } from 'react';
import { Plus } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';
import type { Product } from '@/types/product';

import { Skeleton } from '@/components/ui/Skeleton';

interface ProductGridProps {
    products: Product[];
    activeCategory: string;
    searchQuery: string;
    onAddToCart: (product: Product) => void;
    isSidebarCollapsed?: boolean;
    loading?: boolean;
}

const GridSkeleton = ({ isSidebarCollapsed }: { isSidebarCollapsed: boolean }) => (
    <div className={`grid gap-3 md:gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 ${isSidebarCollapsed ? 'lg:grid-cols-4' : ''}`}>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="flex flex-col gap-2 rounded-lg border border-slate-100 bg-white p-4 h-[240px]">
                <Skeleton className="w-full h-[90px] rounded-md" />
                <Skeleton className="h-4 w-3/4 mt-2" />
                <Skeleton className="h-5 w-1/2 mt-1" />
                <div className="flex justify-between mt-auto">
                    <Skeleton className="h-5 w-20 rounded" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                </div>
            </div>
        ))}
    </div>
);

/**
 * ENHANCED PRODUCT GRID FOR TOUCHSCREEN POS
 * - Whole card is touchable
 * - Improved visual hierarchy
 * - Responsive grid for sidebar toggle
 * - Stock & Add button dynamic behavior
 * - Hover & active effect
 * - Reduced height by 5px
 */
export const ProductGrid: React.FC<ProductGridProps> = ({
    products,
    activeCategory,
    searchQuery,
    onAddToCart,
    isSidebarCollapsed = false,
    loading = false,
}) => {
    const filteredProducts = useMemo(
        () =>
            products.filter(
                (p) =>
                    (p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.barcode?.toLowerCase().includes(searchQuery.toLowerCase())) &&
                    (activeCategory === 'All' || p.category === activeCategory)
            ),
        [products, searchQuery, activeCategory]
    );

    if (loading) return <GridSkeleton isSidebarCollapsed={isSidebarCollapsed} />;

    return (
        <div
            className={`grid gap-3 md:gap-4 
                grid-cols-2 sm:grid-cols-2 lg:grid-cols-3
                ${isSidebarCollapsed ? 'lg:grid-cols-4' : ''}`}
        >
            {filteredProducts.map((product) => (
                <button
                    key={product.id}
                    onClick={() => (product.stock || 0) > 0 && onAddToCart(product)}
                    disabled={(product.stock || 0) === 0}
                    className="flex flex-col justify-between gap-2 rounded-lg border border-slate-200 bg-white p-4 hover:shadow-md transition-shadow duration-150 text-left disabled:opacity-50"
                >
                    {/* IMAGE */}
                    <div className="w-full h-[90px] bg-slate-100 rounded-md flex items-center justify-center overflow-hidden">
                        {product.image ? (
                            <img
                                src={typeof product.image === 'string' ? product.image : URL.createObjectURL(product.image)}
                                alt={product.name}
                                className="w-full h-full object-contain"
                            />
                        ) : (
                            <span className="text-lg font-bold text-slate-400">
                                {product.name[0]}
                            </span>
                        )}
                    </div>

                    {/* NAME + PRICE */}
                    <div className="flex flex-col flex-1 mt-2">
                        <span
                            className="text-sm font-medium text-slate-700 truncate"
                            title={product.name}
                        >
                            {product.name}
                        </span>
                        <span className="text-base font-semibold text-primary mt-1">
                            {formatCurrency(product.price)}
                        </span>
                    </div>

                    {/* STOCK + ADD BUTTON */}
                    <div className="flex items-center justify-between mt-3">
                        <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded ${(product.stock || 0) <= 5
                                ? 'bg-red-100 text-red-600'
                                : 'bg-emerald-100 text-emerald-700'
                                }`}
                        >
                            {product.stock || 0} in stock
                        </span>

                        <div className="w-8 h-8 flex items-center justify-center">
                            <Plus
                                size={16}
                                className={`text-white ${(product.stock || 0) === 0
                                    ? 'text-slate-400'
                                    : 'text-primary'
                                    }`}
                            />
                        </div>
                    </div>
                </button>
            ))}
        </div>
    );
};
