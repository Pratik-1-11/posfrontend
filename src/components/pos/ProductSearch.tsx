import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Search } from 'lucide-react';

interface ProductSearchProps {
    onSearch: (query: string) => void;
}

export const ProductSearch: React.FC<ProductSearchProps> = ({ onSearch }) => {
    const [query, setQuery] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            onSearch(query);
        }, 300);

        return () => clearTimeout(timer);
    }, [query, onSearch]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(query);
    };

    return (
        <form onSubmit={handleSearch} className="flex gap-4 w-full">
            <div className="relative flex-1 group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none transition-transform group-focus-within:scale-110">
                    <Search className="h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                </div>
                <Input
                    type="search"
                    placeholder="Search by name or scan barcode... (F2)"
                    className="pl-10 h-10 bg-slate-50 border-slate-100 rounded-xl font-bold text-slate-700 placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all text-sm shadow-inner"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </div>
            <Button
                type="submit"
                className="h-10 px-4 md:px-6 rounded-xl bg-primary hover:bg-primary/95 text-white font-black uppercase tracking-widest shadow-lg shadow-primary/20 active:scale-95 transition-all text-xs"
            >
                <Search className="h-4 w-4 md:hidden" />
                <span className="hidden md:inline">Search</span>
            </Button>
        </form>
    );
};
