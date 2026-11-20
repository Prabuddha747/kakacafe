import React, { useEffect, useState } from 'react';
import { ArrowLeft, Check, MessageCircle, Minus, Plus, Star } from 'lucide-react';
import {
  CUSTOMIZATION_PRICING,
  DRINK_SIZES,
  EXTRA_SHOTS,
  MILK_TYPES,
  SUGAR_LEVELS,
  TOPPINGS_LIST,
} from '../config/cafeConfig';
import { DEFAULT_CUSTOMIZATION, useStore } from '../context/StoreContext';
import {
  BeverageCustomization,
  DrinkSize,
  ExtraShot,
  MilkType,
  SugarLevel,
  ToppingOption,
} from '../types/cafe';
import {
  buildWhatsAppOrderUrl,
  calculateCartTotals,
  calculateCustomizedUnitPrice,
  formatINR,
  makeCartItemKey,
} from '../utils/pricing';
import { ProductCard } from '../components/ProductCard';
import { SafeImage } from '../components/SafeImage';

export function ProductDetailPage({ slug }: { slug: string }) {
  const { products, offers, orderType, addToCart, navigate } = useStore();
  const product = products.find((p) => p.slug === slug || p.id === slug) || products[0];

  const [quantity, setQuantity] = useState(1);
  const [customization, setCustomization] = useState<BeverageCustomization>(DEFAULT_CUSTOMIZATION);

  useEffect(() => {
    setQuantity(1);
    setCustomization(DEFAULT_CUSTOMIZATION);
  }, [slug]);

  if (!product) return null;

  const unitPrice = calculateCustomizedUnitPrice(product, customization);
  const totalPrice = unitPrice * quantity;

  const toggleTopping = (topping: ToppingOption) => {
    setCustomization((prev) => {
      const exists = prev.toppings.includes(topping);
      return {
        ...prev,
        toppings: exists
          ? prev.toppings.filter((t) => t !== topping)
          : [...prev.toppings, topping],
      };
    });
  };

  const singleItemCart = [
    {
      cartItemId: makeCartItemKey(product.id, product.isBeverage ? customization : undefined),
      productId: product.id,
      slug: product.slug,
      name: product.name,
      category: product.category,
      image: product.image,
      basePrice: product.price,
      unitPrice,
      quantity,
      isBeverage: product.isBeverage,
      customization: product.isBeverage ? customization : undefined,
    },
  ];
  const singleTotals = calculateCartTotals(singleItemCart, orderType, '', offers);
  const whatsappSingleUrl = buildWhatsAppOrderUrl({
    items: singleItemCart,
    totals: singleTotals,
    orderType,
  });

  const related = products
    .filter((p) => p.active && p.id !== product.id)
    .slice(0, 3);

  return (
    <div className="pt-24 sm:pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={() => navigate('/menu')}
        className="inline-flex items-center gap-2 text-sm font-medium text-[#6F4E37] hover:text-[#3E2723] mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Menu
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start mb-20">
        {/* Sticky Gallery */}
        <div className="lg:col-span-6 lg:sticky lg:top-28 rounded-2xl overflow-hidden bg-[#EFE6D5] border border-[#3E2723]/10 aspect-[4/3]">
          <SafeImage
            src={product.image}
            alt={product.name}
            loading="eager"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Contiguous Purchase & Customization Module */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 sm:p-8 border border-[#3E2723]/10 space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#6F4E37] mb-2">
              <span className="font-semibold">{product.category}</span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 tabular-nums text-[#242424]">
                <Star className="w-3.5 h-3.5 fill-[#C89B5C] text-[#C89B5C]" />
                {product.rating.toFixed(1)} ({product.reviewsCount} reviews)
              </span>
              {product.tag && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{product.tag}</span>
                </>
              )}
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#3E2723]">
              {product.name}
            </h1>
            <p className="text-2xl font-semibold text-[#3E2723] tabular-nums mt-2">
              {formatINR(unitPrice)}
            </p>
            <p className="text-sm sm:text-base text-[#242424]/75 mt-3 leading-relaxed">
              {product.description}
            </p>
          </div>

          {product.isBeverage && (
            <div className="space-y-5 border-t border-[#3E2723]/10 pt-5">
              <div>
                <label className="block text-xs font-semibold text-[#3E2723] mb-2">
                  Select Size
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {DRINK_SIZES.map((size) => {
                    const delta = CUSTOMIZATION_PRICING.size[size];
                    const active = customization.size === size;
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() =>
                          setCustomization((prev) => ({ ...prev, size: size as DrinkSize }))
                        }
                        className={`px-3 py-2.5 rounded-lg text-xs font-semibold border transition-colors ${
                          active
                            ? 'bg-[#3E2723] text-white border-[#3E2723]'
                            : 'bg-[#F8F3E9]/50 text-[#242424] border-[#3E2723]/15 hover:border-[#3E2723]/40'
                        }`}
                      >
                        {size}{' '}
                        <span className="opacity-80 tabular-nums">
                          {delta === 0 ? '' : delta > 0 ? `(+₹${delta})` : `(-₹${Math.abs(delta)})`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3E2723] mb-2">
                  Sugar Level
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SUGAR_LEVELS.map((sugar) => (
                    <button
                      key={sugar}
                      type="button"
                      onClick={() =>
                        setCustomization((prev) => ({
                          ...prev,
                          sugarLevel: sugar as SugarLevel,
                        }))
                      }
                      className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                        customization.sugarLevel === sugar
                          ? 'bg-[#3E2723] text-white border-[#3E2723]'
                          : 'bg-[#F8F3E9]/50 text-[#242424] border-[#3E2723]/15 hover:border-[#3E2723]/40'
                      }`}
                    >
                      {sugar}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3E2723] mb-2">
                  Milk Selection
                </label>
                <div className="flex flex-wrap gap-2">
                  {MILK_TYPES.map((milk) => {
                    const delta = CUSTOMIZATION_PRICING.milk[milk];
                    return (
                      <button
                        key={milk}
                        type="button"
                        onClick={() =>
                          setCustomization((prev) => ({ ...prev, milkType: milk as MilkType }))
                        }
                        className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                          customization.milkType === milk
                            ? 'bg-[#3E2723] text-white border-[#3E2723]'
                            : 'bg-[#F8F3E9]/50 text-[#242424] border-[#3E2723]/15 hover:border-[#3E2723]/40'
                        }`}
                      >
                        {milk} {delta > 0 ? `(+₹${delta})` : ''}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3E2723] mb-2">
                  Extra Shot
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {EXTRA_SHOTS.map((shot) => {
                    const delta = CUSTOMIZATION_PRICING.extraShot[shot];
                    return (
                      <button
                        key={shot}
                        type="button"
                        onClick={() =>
                          setCustomization((prev) => ({ ...prev, extraShot: shot as ExtraShot }))
                        }
                        className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                          customization.extraShot === shot
                            ? 'bg-[#3E2723] text-white border-[#3E2723]'
                            : 'bg-[#F8F3E9]/50 text-[#242424] border-[#3E2723]/15 hover:border-[#3E2723]/40'
                        }`}
                      >
                        {shot} {delta > 0 ? `(+₹${delta})` : ''}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3E2723] mb-2">
                  Toppings
                </label>
                <div className="flex flex-wrap gap-2">
                  {TOPPINGS_LIST.map((topping) => {
                    const delta = CUSTOMIZATION_PRICING.toppings[topping];
                    const active = customization.toppings.includes(topping);
                    return (
                      <button
                        key={topping}
                        type="button"
                        onClick={() => toggleTopping(topping)}
                        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                          active
                            ? 'bg-[#C89B5C]/25 text-[#3E2723] border-[#C89B5C]'
                            : 'bg-[#F8F3E9]/50 text-[#242424] border-[#3E2723]/15 hover:border-[#3E2723]/40'
                        }`}
                      >
                        {active && <Check className="w-3.5 h-3.5" />}
                        {topping} {delta > 0 ? `(+₹${delta})` : ''}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <div className="pt-5 border-t border-[#3E2723]/10 space-y-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-[#3E2723]/20 rounded-lg bg-[#F8F3E9]/50">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="w-11 h-11 flex items-center justify-center text-[#3E2723] hover:bg-[#3E2723]/10"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center text-sm font-semibold tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                  aria-label="Increase quantity"
                  className="w-11 h-11 flex items-center justify-center text-[#3E2723] hover:bg-[#3E2723]/10"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={() =>
                  addToCart(product, quantity, product.isBeverage ? customization : undefined)
                }
                className="flex-1 py-3.5 px-6 rounded-lg bg-[#3E2723] text-white text-sm font-semibold hover:bg-[#6F4E37] transition-colors tabular-nums"
              >
                Add to Bag · {formatINR(totalPrice)}
              </button>
            </div>

            <a
              href={whatsappSingleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-lg bg-[#1F6F4A] text-white text-sm font-semibold hover:bg-[#195a3c] transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Quick Order on WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Pairings */}
      <div>
        <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#3E2723] mb-8">
          Pair It With
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {related.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
