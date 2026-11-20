import React from 'react';
import { Plus, Star } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product } from '../types/cafe';
import { formatINR } from '../utils/pricing';
import { SafeImage } from './SafeImage';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart, openProductModal } = useStore();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
  };

  return (
    <article
      onClick={() => openProductModal(product)}
      className="group cursor-pointer bg-[#1C120E]/80 backdrop-blur-md rounded-2xl overflow-hidden border border-white/15 shadow-xl hover:shadow-2xl hover:-translate-y-2 hover:border-[#C89B5C] hover:ring-2 hover:ring-[#C89B5C]/30 transition-all duration-300 ease-out flex flex-col relative text-[#F8F3E9]"
    >
      <div className="relative aspect-[4/3] bg-[#1C120E]/50 overflow-hidden">
        <SafeImage
          src={product.image}
          alt={`${product.name} — Kaka Cafe`}
          fallbackTitle={product.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 group-hover:rotate-1"
        />
        {product.isBestSeller && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#C89B5C] text-[#1C120E] text-[10px] font-bold tracking-wider uppercase shadow-md animate-pulse">
            Best Seller
          </span>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col">
        {/* Zero-pill clean metadata line */}
        <div className="flex items-center justify-between gap-2 text-xs text-[#C89B5C] mb-1.5 font-medium">
          <span className="tracking-wide">{product.category}</span>
          <span className="inline-flex items-center gap-1 tabular-nums text-white/90">
            <Star className="w-3.5 h-3.5 fill-[#C89B5C] text-[#C89B5C]" />
            {product.rating.toFixed(1)}
            {product.tag ? (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-[#C89B5C]">{product.tag}</span>
              </>
            ) : null}
          </span>
        </div>

        <h3 className="font-display text-lg font-semibold text-white group-hover:text-[#C89B5C] transition-colors mb-1.5">
          {product.name}
        </h3>

        <p className="text-sm text-white/75 line-clamp-2 leading-relaxed mb-4 flex-1">
          {product.description}
        </p>

        <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
          <span className="text-base font-semibold text-white tabular-nums">
            {formatINR(product.price)}
          </span>

          <button
            type="button"
            onClick={handleQuickAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#3E2723] text-white text-xs font-semibold hover:bg-[#C89B5C] hover:text-[#242424] active:scale-95 transition-all duration-200 shadow-sm hover:shadow-md whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C89B5C]"
          >
            <Plus className="w-3.5 h-3.5" />
            Add to Cart
          </button>
        </div>
      </div>
    </article>
  );
}
