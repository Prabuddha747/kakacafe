import React, { useState } from 'react';
import {
  ArrowRight,
  MessageCircle,
  Minus,
  Plus,
  ShoppingBag,
  Tag,
  Trash2,
} from 'lucide-react';
import { CAFE_CONFIG } from '../config/cafeConfig';
import { useStore } from '../context/StoreContext';
import {
  buildWhatsAppOrderUrl,
  formatCustomizationSummary,
  formatINR,
} from '../utils/pricing';
import { SafeImage } from '../components/SafeImage';

export function CartPage() {
  const {
    cartItems,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    promoCode,
    setPromoCode,
    orderType,
    setOrderType,
    cartTotals,
    offers,
    navigate,
  } = useStore();

  const [promoInput, setPromoInput] = useState(promoCode);
  const [promoMessage, setPromoMessage] = useState<string | null>(null);

  const handlePromoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoInput.trim().toUpperCase();
    if (!code) {
      setPromoCode('');
      setPromoMessage(null);
      return;
    }
    const found = offers.find((o) => o.active && o.code.toUpperCase() === code);
    if (!found) {
      setPromoMessage('Offer code not recognized. Try KAKABOGO, MORNING90, or CAMPUS20.');
      return;
    }
    setPromoCode(found.code);
    setPromoMessage(`Applied offer: ${found.title}`);
  };

  const whatsappUrl = buildWhatsAppOrderUrl({
    items: cartItems,
    totals: cartTotals,
    orderType,
  });

  return (
    <div className="pt-24 sm:pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-[#6F4E37] mb-2">
            Your Selection
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#3E2723]">
            Shopping Bag
          </h1>
        </div>
        {cartItems.length > 0 && (
          <button
            type="button"
            onClick={clearCart}
            className="text-xs font-semibold text-red-700 hover:underline self-start sm:self-auto"
          >
            Clear Bag
          </button>
        )}
      </div>

      {cartItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#3E2723]/10 p-12 text-center max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-[#EFE6D5] flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-7 h-7 text-[#3E2723]" />
          </div>
          <h2 className="font-display text-2xl font-semibold text-[#3E2723] mb-2">
            Your bag is empty
          </h2>
          <p className="text-sm text-[#242424]/70 mb-6">
            Discover our freshly roasted espressos, iced cold coffees, frappes, and baked pastries.
          </p>
          <button
            type="button"
            onClick={() => navigate('/menu')}
            className="px-6 py-3 rounded-lg bg-[#3E2723] text-white text-sm font-semibold hover:bg-[#6F4E37] transition-colors"
          >
            Explore Our Menu
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cart Items */}
          <div className="lg:col-span-7 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.cartItemId}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-[#3E2723]/10 flex gap-4 sm:gap-5"
              >
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-[#EFE6D5] shrink-0">
                  <SafeImage
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-[#6F4E37]">{item.category}</p>
                      <h3 className="font-display text-lg font-semibold text-[#3E2723]">
                        {item.name}
                      </h3>
                      {item.isBeverage && item.customization && (
                        <p className="text-xs text-[#242424]/70 mt-1">
                          {formatCustomizationSummary(item.customization)}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.cartItemId)}
                      aria-label={`Remove ${item.name}`}
                      className="text-[#242424]/45 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#3E2723]/8">
                    <div className="inline-flex items-center border border-[#3E2723]/20 rounded-lg">
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(item.cartItemId, -1)}
                        aria-label="Decrease quantity"
                        className="w-8 h-8 flex items-center justify-center text-[#3E2723] hover:bg-[#3E2723]/5"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-semibold tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(item.cartItemId, 1)}
                        aria-label="Increase quantity"
                        className="w-8 h-8 flex items-center justify-center text-[#3E2723] hover:bg-[#3E2723]/5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="text-base font-semibold text-[#3E2723] tabular-nums">
                      {formatINR(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-6 sm:p-7 border border-[#3E2723]/10 space-y-5 lg:sticky lg:top-28">
            <h2 className="font-display text-xl font-semibold text-[#3E2723]">
              Order Summary
            </h2>

            <div className="flex items-center justify-between p-1 bg-[#EFE6D5] rounded-lg">
              {(['Delivery', 'Pickup'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setOrderType(type)}
                  className={`flex-1 py-2 rounded-md text-xs font-semibold transition-colors ${
                    orderType === type ? 'bg-[#3E2723] text-white' : 'text-[#3E2723]'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <form onSubmit={handlePromoSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="w-4 h-4 text-[#6F4E37] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  placeholder="Enter promo code"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-[#3E2723]/20 text-xs bg-[#F8F3E9]/40 focus:outline-none focus:border-[#3E2723]"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-lg bg-[#EFE6D5] text-[#3E2723] text-xs font-semibold hover:bg-[#E5D5BC]"
              >
                Apply
              </button>
            </form>
            {promoMessage && <p className="text-xs text-[#6F4E37]">{promoMessage}</p>}

            <div className="space-y-2.5 text-sm border-t border-[#3E2723]/10 pt-4">
              <div className="flex justify-between text-[#242424]/75">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatINR(cartTotals.subtotal)}</span>
              </div>
              {cartTotals.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Promo Discount</span>
                  <span className="tabular-nums">-{formatINR(cartTotals.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#242424]/75">
                <span>GST (5%)</span>
                <span className="tabular-nums">{formatINR(cartTotals.tax)}</span>
              </div>
              <div className="flex justify-between text-[#242424]/75">
                <span>{orderType === 'Pickup' ? 'Pickup Fee' : 'Delivery Fee'}</span>
                <span className="tabular-nums">
                  {cartTotals.deliveryFee === 0 ? 'Free' : formatINR(cartTotals.deliveryFee)}
                </span>
              </div>
              {orderType === 'Delivery' && cartTotals.deliveryFee > 0 && (
                <p className="text-xs text-[#6F4E37]">
                  Add {formatINR(CAFE_CONFIG.freeDeliveryThreshold - cartTotals.subtotal)} more for
                  free delivery.
                </p>
              )}
              <div className="pt-3 border-t border-[#3E2723]/10 flex justify-between text-lg font-semibold text-[#3E2723]">
                <span>Total</span>
                <span className="tabular-nums">{formatINR(cartTotals.total)}</span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/checkout')}
                className="w-full py-3.5 px-5 rounded-lg bg-[#3E2723] text-white text-sm font-semibold hover:bg-[#6F4E37] transition-colors flex items-center justify-center gap-2"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-5 rounded-lg bg-[#1F6F4A] text-white text-sm font-semibold hover:bg-[#195a3c] transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Order on WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
