import React, { useEffect, useState } from 'react';
import { ArrowUpRight, Check, Minus, Plus, Star, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
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
import { calculateCustomizedUnitPrice, formatINR } from '../utils/pricing';
import { SafeImage } from './SafeImage';

export function ProductModal() {
  const { modalProduct, closeProductModal, addToCart, navigate } = useStore();

  const [quantity, setQuantity] = useState(1);
  const [customization, setCustomization] = useState<BeverageCustomization>(DEFAULT_CUSTOMIZATION);

  useEffect(() => {
    if (modalProduct) {
      setQuantity(1);
      setCustomization(DEFAULT_CUSTOMIZATION);
    }
  }, [modalProduct]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeProductModal();
    };
    if (modalProduct) {
      window.addEventListener('keydown', onKeyDown);
    }
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [modalProduct, closeProductModal]);

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

  if (!modalProduct) return null;

  const unitPrice = calculateCustomizedUnitPrice(modalProduct, customization);
  const totalPrice = unitPrice * quantity;

  const handleAdd = () => {
    addToCart(modalProduct, quantity, modalProduct.isBeverage ? customization : undefined);
    closeProductModal();
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#1C120E]/65 backdrop-blur-xs overflow-y-auto"
        onClick={closeProductModal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-product-title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-3xl bg-[#F8F3E9] rounded-2xl overflow-hidden shadow-2xl border border-[#3E2723]/15 my-auto max-h-[92vh] flex flex-col"
        >
          <button
            type="button"
            onClick={closeProductModal}
            aria-label="Close product modal"
            className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/90 text-[#242424] hover:bg-white flex items-center justify-center shadow-sm transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-12 overflow-y-auto">
            {/* Left Image */}
            <div className="md:col-span-5 bg-[#EFE6D5] relative min-h-[240px] md:min-h-full">
              <SafeImage
                src={modalProduct.image}
                alt={modalProduct.name}
                fallbackTitle={modalProduct.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Right Customization Controls */}
            <div className="md:col-span-7 p-6 sm:p-7 flex flex-col gap-5 bg-white">
              <div>
                <div className="flex items-center gap-2 text-xs text-[#6F4E37] mb-1">
                  <span className="font-medium">{modalProduct.category}</span>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1 tabular-nums text-[#242424]">
                    <Star className="w-3.5 h-3.5 fill-[#C89B5C] text-[#C89B5C]" />
                    {modalProduct.rating.toFixed(1)} ({modalProduct.reviewsCount} reviews)
                  </span>
                </div>
                <h2
                  id="modal-product-title"
                  className="font-display text-2xl font-semibold text-[#3E2723]"
                >
                  {modalProduct.name}
                </h2>
                <p className="text-sm text-[#242424]/75 mt-1.5 leading-relaxed">
                  {modalProduct.description}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    const slug = modalProduct.slug;
                    closeProductModal();
                    navigate(`/product/${slug}`);
                  }}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#6F4E37] hover:text-[#3E2723] underline underline-offset-4"
                >
                  View full product page
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {modalProduct.isBeverage && (
                <div className="space-y-4 border-t border-[#3E2723]/10 pt-4">
                  {/* Size Selection */}
                  <div>
                    <label className="block text-xs font-semibold text-[#3E2723] mb-2">
                      Cup Size
                    </label>
                    <div className="grid grid-cols-3 gap-2">
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
                            className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all whitespace-nowrap ${
                              active
                                ? 'bg-[#3E2723] text-white border-[#3E2723]'
                                : 'bg-[#F8F3E9]/60 text-[#242424] border-[#3E2723]/15 hover:border-[#3E2723]/40'
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

                  {/* Sugar Level */}
                  <div>
                    <label className="block text-xs font-semibold text-[#3E2723] mb-2">
                      Sugar Level
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {SUGAR_LEVELS.map((sugar) => {
                        const active = customization.sugarLevel === sugar;
                        return (
                          <button
                            key={sugar}
                            type="button"
                            onClick={() =>
                              setCustomization((prev) => ({
                                ...prev,
                                sugarLevel: sugar as SugarLevel,
                              }))
                            }
                            className={`px-2.5 py-2 rounded-lg text-xs font-medium border transition-all whitespace-nowrap ${
                              active
                                ? 'bg-[#3E2723] text-white border-[#3E2723]'
                                : 'bg-[#F8F3E9]/60 text-[#242424] border-[#3E2723]/15 hover:border-[#3E2723]/40'
                            }`}
                          >
                            {sugar}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Milk Type */}
                  <div>
                    <label className="block text-xs font-semibold text-[#3E2723] mb-2">
                      Milk Choice
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {MILK_TYPES.map((milk) => {
                        const delta = CUSTOMIZATION_PRICING.milk[milk];
                        const active = customization.milkType === milk;
                        return (
                          <button
                            key={milk}
                            type="button"
                            onClick={() =>
                              setCustomization((prev) => ({
                                ...prev,
                                milkType: milk as MilkType,
                              }))
                            }
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all whitespace-nowrap ${
                              active
                                ? 'bg-[#3E2723] text-white border-[#3E2723]'
                                : 'bg-[#F8F3E9]/60 text-[#242424] border-[#3E2723]/15 hover:border-[#3E2723]/40'
                            }`}
                          >
                            {milk} {delta > 0 ? `(+₹${delta})` : ''}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Extra Shot */}
                  <div>
                    <label className="block text-xs font-semibold text-[#3E2723] mb-2">
                      Espresso Boost
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {EXTRA_SHOTS.map((shot) => {
                        const delta = CUSTOMIZATION_PRICING.extraShot[shot];
                        const active = customization.extraShot === shot;
                        return (
                          <button
                            key={shot}
                            type="button"
                            onClick={() =>
                              setCustomization((prev) => ({
                                ...prev,
                                extraShot: shot as ExtraShot,
                              }))
                            }
                            className={`px-2.5 py-2 rounded-lg text-xs font-medium border transition-all whitespace-nowrap ${
                              active
                                ? 'bg-[#3E2723] text-white border-[#3E2723]'
                                : 'bg-[#F8F3E9]/60 text-[#242424] border-[#3E2723]/15 hover:border-[#3E2723]/40'
                            }`}
                          >
                            {shot} {delta > 0 ? `(+₹${delta})` : ''}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Toppings */}
                  <div>
                    <label className="block text-xs font-semibold text-[#3E2723] mb-2">
                      Toppings & Syrups
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
                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all whitespace-nowrap ${
                              active
                                ? 'bg-[#C89B5C]/20 text-[#3E2723] border-[#C89B5C]'
                                : 'bg-[#F8F3E9]/60 text-[#242424] border-[#3E2723]/15 hover:border-[#3E2723]/40'
                            }`}
                          >
                            {active && <Check className="w-3 h-3 text-[#3E2723]" />}
                            {topping} {delta > 0 ? `(+₹${delta})` : ''}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Quantity & Add CTA */}
              <div className="pt-4 border-t border-[#3E2723]/10 flex items-center justify-between gap-4 mt-auto">
                <div className="flex items-center border border-[#3E2723]/20 rounded-lg bg-[#F8F3E9]/50">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                    className="w-10 h-10 flex items-center justify-center text-[#3E2723] hover:bg-[#3E2723]/10 rounded-l-lg"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-9 text-center text-sm font-semibold tabular-nums">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                    aria-label="Increase quantity"
                    className="w-10 h-10 flex items-center justify-center text-[#3E2723] hover:bg-[#3E2723]/10 rounded-r-lg"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAdd}
                  className="flex-1 py-3 px-5 rounded-lg bg-[#3E2723] text-white text-sm font-semibold hover:bg-[#6F4E37] transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <span>Add to Bag</span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">{formatINR(totalPrice)}</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
