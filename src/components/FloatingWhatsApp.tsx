import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { buildWhatsAppOrderUrl } from '../utils/pricing';

export function FloatingWhatsApp() {
  const { cartItems, cartTotals, orderType } = useStore();

  const whatsappUrl = buildWhatsAppOrderUrl({
    items: cartItems,
    totals: cartTotals,
    orderType,
  });

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Order on WhatsApp"
      className="fixed bottom-5 right-5 z-30 inline-flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#1F6F4A] text-white text-xs sm:text-sm font-semibold shadow-lg hover:bg-[#195a3c] hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C89B5C]"
    >
      <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
      <span className="whitespace-nowrap">
        {cartTotals.itemCount > 0
          ? `Order on WhatsApp (${cartTotals.itemCount})`
          : 'Order on WhatsApp'}
      </span>
    </a>
  );
}
