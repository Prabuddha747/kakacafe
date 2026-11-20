import React, { useMemo, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { MENU_CATEGORIES } from '../config/cafeConfig';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'rating';

export function MenuPage() {
  const { products, menuCategoryFilter, setMenuCategoryFilter, catalogLoading } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('featured');

  const filteredProducts = useMemo(() => {
    const queryLower = searchQuery.trim().toLowerCase();
    const list = products.filter((item) => {
      if (!item.active) return false;
      const matchesCat =
        menuCategoryFilter === 'All Items' || item.category === menuCategoryFilter;
      const matchesQuery =
        !queryLower ||
        item.name.toLowerCase().includes(queryLower) ||
        item.description.toLowerCase().includes(queryLower) ||
        item.category.toLowerCase().includes(queryLower);
      return matchesCat && matchesQuery;
    });

    if (sortBy === 'price-asc') {
      return [...list].sort((a, b) => a.price - b.price);
    }
    if (sortBy === 'price-desc') {
      return [...list].sort((a, b) => b.price - a.price);
    }
    if (sortBy === 'rating') {
      return [...list].sort((a, b) => b.rating - a.rating);
    }
    return [...list].sort((a, b) => Number(b.isBestSeller) - Number(a.isBestSeller));
  }, [products, menuCategoryFilter, searchQuery, sortBy]);

  return (
    <div className="pt-24 sm:pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-2xl mb-10">
        <p className="text-xs font-semibold tracking-widest uppercase text-[#6F4E37] mb-2">
          Handcrafted Menu
        </p>
        <h1 className="font-display text-3xl sm:text-5xl font-semibold text-[#3E2723] mb-3">
          Brewed Fresh to Your Taste
        </h1>
        <p className="text-sm sm:text-base text-[#242424]/75 leading-relaxed">
          Tap any beverage to customize cup size, milk selection, sugar level, espresso shots, and
          house toppings.
        </p>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="space-y-4 mb-10">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#6F4E37] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cappuccino, cold coffee, matcha, croissant..."
              aria-label="Search menu items"
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white border border-[#3E2723]/15 text-sm focus:outline-none focus:border-[#3E2723]"
            />
          </div>

          <div className="flex items-center gap-2.5">
            <SlidersHorizontal className="w-4 h-4 text-[#6F4E37] shrink-0" />
            <label htmlFor="menu-sort" className="text-xs font-medium text-[#242424]/70 whitespace-nowrap">
              Sort by
            </label>
            <select
              id="menu-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-2 rounded-lg bg-white border border-[#3E2723]/15 text-xs font-semibold text-[#3E2723] focus:outline-none focus:border-[#3E2723]"
            >
              <option value="featured">Featured & Best Sellers</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2" role="tablist" aria-label="Menu categories">
          {MENU_CATEGORIES.map((category) => {
            const active = menuCategoryFilter === category;
            return (
              <button
                key={category}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setMenuCategoryFilter(category)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C89B5C] ${
                  active
                    ? 'bg-[#3E2723] text-white'
                    : 'bg-white text-[#242424]/80 border border-[#3E2723]/12 hover:bg-[#EFE6D5]/70'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      {/* Product Grid */}
      {catalogLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl overflow-hidden border border-[#3E2723]/10 h-96 animate-pulse"
            >
              <div className="h-56 bg-[#EFE6D5]" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-[#EFE6D5] rounded w-1/3" />
                <div className="h-5 bg-[#EFE6D5] rounded w-2/3" />
                <div className="h-3 bg-[#EFE6D5] rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#3E2723]/10 p-12 text-center">
          <h2 className="font-display text-2xl font-semibold text-[#3E2723] mb-2">
            No matching items found
          </h2>
          <p className="text-sm text-[#242424]/70 mb-6">
            Try clearing your search query or switching to All Items.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setMenuCategoryFilter('All Items');
            }}
            className="px-5 py-2.5 rounded-lg bg-[#3E2723] text-white text-sm font-semibold hover:bg-[#6F4E37] transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
