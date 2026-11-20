import React, { useState } from 'react';
import { MessageCircle, Minus, Plus, ShoppingBag, Tag, Trash2, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { CAFE_CONFIG } from '../config/cafeConfig';
import { useStore } from '../context/StoreContext';
import {
  buildWhatsAppOrderUrl,
  formatCustomizationSummary,
  formatINR,
} from '../utils/pricing';
import { SafeImage } from './SafeImage';

export function CartDrawer() {
  const {
    isCartDrawerOpen,
    setCartDrawerOpen,
    cartItems,
    updateCartQuantity,
    removeFromCart,
    promoCode,
    setPromoCode,
    orderType,
    setOrderType,
    cartTotals,
    offers,
    navigate,
  } = useStore();

  const [promoInput, setPromoInput] = useState(promoCode);
  const [promoFeedback, setPromoFeedback] = useState<string | null>(null);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = promoInput.trim().toUpperCase();
    if (!trimmed) {
      setPromoCode('');
      setPromoFeedback(null);
      return;
    }
    const found = offers.find((o) => o.active && o.code.toUpperCase() === trimmed);
    if (!found) {
      setPromoFeedback('Promo code not found or currently inactive.');
      return;
    }
    setPromoCode(found.code);
    setPromoFeedback(`Applied ${found.title}`);
  };

  const whatsappUrl = buildWhatsAppOrderUrl({
    items: cartItems,
    totals: cartTotals,
    orderType,
  });

  return (
    <AnimatePresence>
      {isCartDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Shopping Bag">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setCartDrawerOpen(false)}
            className="fixed inset-0 bg-[#1C120E]/55 backdrop-blur-xs"
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-md bg-[#F8F3E9] h-full flex flex-col shadow-2xl border-l border-[#3E2723]/15"
          >
            {/* Header */}
            <div className="px-6 py-5 bg-white border-b border-[#3E2723]/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-5 h-5 text-[#3E2723]" />
                <h2 className="font-display text-xl font-semibold text-[#3E2723]">
                  Your Bag
                </h2>
                <span className="text-xs text-[#6F4E37] tabular-nums">
                  ({cartTotals.itemCount} {cartTotals.itemCount === 1 ? 'item' : 'items'})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setCartDrawerOpen(false)}
                aria-label="Close bag"
                className="w-9 h-9 rounded-full hover:bg-[#3E2723]/10 flex items-center justify-center text-[#242424]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Order Type Toggle */}
            {cartItems.length > 0 && (
              <div className="px-6 py-3 bg-white/70 border-b border-[#3E2723]/10 flex items-center justify-between gap-3">
                <span className="text-xs font-medium text-[#242424]/75">Order Type</span>
                <div className="flex items-center gap-1 p-1 bg-[#EFE6D5] rounded-lg">
                  {(['Delivery', 'Pickup'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setOrderType(type)}
                      className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                        orderType === type
                          ? 'bg-[#3E2723] text-white'
                          : 'text-[#3E2723] hover:bg-white/60'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-[#EFE6D5] flex items-center justify-center mb-4">
                    <ShoppingBag className="w-7 h-7 text-[#6F4E37]" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-[#3E2723] mb-1">
                    Your bag is empty
                  </h3>
                  <p className="text-sm text-[#242424]/70 max-w-xs mb-6">
                    Explore our handcrafted espressos, cold coffees, frappes, and fresh pastries.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setCartDrawerOpen(false);
                      navigate('/menu');
                    }}
                    className="px-6 py-2.5 rounded-lg bg-[#3E2723] text-white text-sm font-semibold hover:bg-[#6F4E37] transition-colors"
                  >
                    Browse Menu
                  </button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={item.cartItemId}
                    className="bg-white rounded-xl p-3.5 border border-[#3E2723]/10 flex gap-3.5"
                  >
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-[#EFE6D5] shrink-0">
                      <SafeImage
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-display text-sm font-semibold text-[#242424] truncate">
                          {item.name}
                        </h4>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.cartItemId)}
                          aria-label={`Remove ${item.name}`}
                          className="text-[#242424]/45 hover:text-red-700 transition-colors p-0.5"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {item.isBeverage && item.customization && (
                        <p className="text-xs text-[#6F4E37] mt-0.5 leading-snug">
                          {formatCustomizationSummary(item.customization)}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-3">
                        <div className="inline-flex items-center border border-[#3E2723]/15 rounded-lg">
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(item.cartItemId, -1)}
                            aria-label="Decrease quantity"
                            className="w-7 h-7 flex items-center justify-center text-[#3E2723] hover:bg-[#3E2723]/5"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-7 text-center text-xs font-semibold tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(item.cartItemId, 1)}
                            aria-label="Increase quantity"
                            className="w-7 h-7 flex items-center justify-center text-[#3E2723] hover:bg-[#3E2723]/5"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="text-sm font-semibold text-[#3E2723] tabular-nums">
                          {formatINR(item.unitPrice * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Totals & Actions */}
            {cartItems.length > 0 && (
              <div className="bg-white border-t border-[#3E2723]/10 px-6 py-5 space-y-4">
                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-4 h-4 text-[#6F4E37] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      placeholder="Promo code (e.g. KAKABOGO)"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#3E2723]/20 bg-[#F8F3E9]/50 focus:outline-none focus:border-[#3E2723]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-3.5 py-2 rounded-lg bg-[#EFE6D5] text-[#3E2723] text-xs font-semibold hover:bg-[#E5D5BC] transition-colors whitespace-nowrap"
                  >
                    Apply
                  </button>
                </form>
                {promoFeedback && (
                  <p className="text-xs text-[#6F4E37]">{promoFeedback}</p>
                )}

                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-[#242424]/75">
                    <span>Subtotal</span>
                    <span className="tabular-nums">{formatINR(cartTotals.subtotal)}</span>
                  </div>
                  {cartTotals.discount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Offer Discount ({cartTotals.appliedOffer?.code})</span>
                      <span className="tabular-nums">-{formatINR(cartTotals.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#242424]/75">
                    <span>GST (5%)</span>
                    <span className="tabular-nums">{formatINR(cartTotals.tax)}</span>
                  </div>
                  <div className="flex justify-between text-[#242424]/75">
                    <span>
                      {orderType === 'Pickup' ? 'Store Pickup' : 'Delivery Fee'}
                    </span>
                    <span className="tabular-nums">
                      {cartTotals.deliveryFee === 0 ? 'Free' : formatINR(cartTotals.deliveryFee)}
                    </span>
                  </div>
                  {orderType === 'Delivery' && cartTotals.deliveryFee > 0 && (
                    <p className="text-[11px] text-[#6F4E37]">
                      Free delivery on orders above {formatINR(CAFE_CONFIG.freeDeliveryThreshold)}
                    </p>
                  )}
                  <div className="pt-2 border-t border-[#3E2723]/10 flex justify-between font-semibold text-base text-[#3E2723]">
                    <span>Total</span>
                    <span className="tabular-nums">{formatINR(cartTotals.total)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setCartDrawerOpen(false);
                      navigate('/cart');
                    }}
                    className="py-2.5 px-3 rounded-lg border border-[#3E2723]/25 text-[#3E2723] text-xs font-semibold hover:bg-[#F8F3E9] transition-colors whitespace-nowrap"
                  >
                    View Full Bag
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCartDrawerOpen(false);
                      navigate('/checkout');
                    }}
                    className="py-2.5 px-3 rounded-lg bg-[#3E2723] text-white text-xs font-semibold hover:bg-[#6F4E37] transition-colors whitespace-nowrap"
                  >
                    Checkout
                  </button>
                </div>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-lg bg-[#1F6F4A] text-white text-xs font-semibold hover:bg-[#195a3c] transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Order on WhatsApp
                </a>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
