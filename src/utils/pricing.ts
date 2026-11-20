import { CAFE_CONFIG, CUSTOMIZATION_PRICING } from '../config/cafeConfig';
import {
  BeverageCustomization,
  CartItem,
  Offer,
  OrderType,
  Product,
} from '../types/cafe';

export function formatINR(amount: number): string {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

export function calculateCustomizedUnitPrice(
  product: Pick<Product, 'price' | 'isBeverage'>,
  customization?: BeverageCustomization
): number {
  if (!product.isBeverage || !customization) {
    return product.price;
  }

  const sizeDelta = CUSTOMIZATION_PRICING.size[customization.size] ?? 0;
  const milkDelta = CUSTOMIZATION_PRICING.milk[customization.milkType] ?? 0;
  const shotDelta = CUSTOMIZATION_PRICING.extraShot[customization.extraShot] ?? 0;
  const toppingsDelta = customization.toppings.reduce(
    (sum, topping) => sum + (CUSTOMIZATION_PRICING.toppings[topping] ?? 0),
    0
  );

  return Math.max(50, product.price + sizeDelta + milkDelta + shotDelta + toppingsDelta);
}

export function formatCustomizationSummary(customization?: BeverageCustomization): string {
  if (!customization) return 'Standard';
  const parts: string[] = [
    customization.size,
    customization.milkType,
    customization.sugarLevel,
  ];
  if (customization.extraShot !== 'None') {
    parts.push(`+${customization.extraShot}`);
  }
  if (customization.toppings.length > 0) {
    parts.push(customization.toppings.join(', '));
  }
  return parts.join(' · ');
}

export function makeCartItemKey(
  productId: string,
  customization?: BeverageCustomization
): string {
  if (!customization) return productId;
  const sortedToppings = [...customization.toppings].sort().join(',');
  return [
    productId,
    customization.size,
    customization.sugarLevel,
    customization.milkType,
    customization.extraShot,
    sortedToppings,
  ].join('|');
}

export interface CartTotals {
  itemCount: number;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  tax: number;
  total: number;
  appliedOffer: Offer | null;
}

export function calculateCartTotals(
  items: CartItem[],
  orderType: OrderType,
  promoCode: string,
  offers: Offer[]
): CartTotals {
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);

  const normalizedCode = promoCode.trim().toUpperCase();
  const matchedOffer =
    normalizedCode.length > 0
      ? offers.find((o) => o.active && o.code.toUpperCase() === normalizedCode) ?? null
      : null;

  let discount = 0;
  if (matchedOffer && subtotal > 0) {
    if (matchedOffer.discountType === 'percent') {
      discount = Math.round((subtotal * matchedOffer.discountValue) / 100);
    } else if (matchedOffer.discountType === 'bogo') {
      if (itemCount >= 2) {
        discount = Math.min(subtotal, matchedOffer.discountValue);
      }
    } else {
      discount = Math.min(subtotal, matchedOffer.discountValue);
    }
  }

  const discountedSubtotal = Math.max(0, subtotal - discount);
  const deliveryFee =
    subtotal === 0 || orderType === 'Pickup' || discountedSubtotal >= CAFE_CONFIG.freeDeliveryThreshold
      ? 0
      : CAFE_CONFIG.deliveryFee;
  const tax = Math.round(discountedSubtotal * CAFE_CONFIG.gstRate);
  const total = discountedSubtotal + deliveryFee + tax;

  return {
    itemCount,
    subtotal,
    discount,
    deliveryFee,
    tax,
    total,
    appliedOffer: matchedOffer,
  };
}

export interface WhatsAppOrderContext {
  items: CartItem[];
  totals: CartTotals;
  orderType: OrderType;
  customerName?: string;
  customerPhone?: string;
  deliveryAddress?: string;
  paymentMethod?: string;
  notes?: string;
}

export function buildWhatsAppOrderUrl(ctx: WhatsAppOrderContext): string {
  if (ctx.items.length === 0) {
    const greeting = encodeURIComponent(
      `Hello ${CAFE_CONFIG.brandName}! I would like to place a beverage order.`
    );
    return `https://wa.me/${CAFE_CONFIG.whatsappNumber}?text=${greeting}`;
  }

  const lines: string[] = [
    `*New Order — ${CAFE_CONFIG.brandName}*`,
    '',
    '*Selected Items:*',
  ];

  ctx.items.forEach((item, index) => {
    const lineTotal = item.unitPrice * item.quantity;
    const details = item.isBeverage
      ? ` (${formatCustomizationSummary(item.customization)})`
      : '';
    lines.push(
      `${index + 1}. ${item.name} x${item.quantity}${details} — ${formatINR(lineTotal)}`
    );
  });

  lines.push('');
  lines.push(`Subtotal: ${formatINR(ctx.totals.subtotal)}`);
  if (ctx.totals.discount > 0 && ctx.totals.appliedOffer) {
    lines.push(
      `Promo (${ctx.totals.appliedOffer.code}): -${formatINR(ctx.totals.discount)}`
    );
  }
  lines.push(`GST (5%): ${formatINR(ctx.totals.tax)}`);
  lines.push(
    `Delivery (${ctx.orderType}): ${
      ctx.totals.deliveryFee === 0 ? 'Free' : formatINR(ctx.totals.deliveryFee)
    }`
  );
  lines.push(`*Order Total: ${formatINR(ctx.totals.total)}*`);

  if (ctx.customerName || ctx.customerPhone || ctx.deliveryAddress) {
    lines.push('');
    lines.push('*Customer Details:*');
    if (ctx.customerName) lines.push(`Name: ${ctx.customerName}`);
    if (ctx.customerPhone) lines.push(`Phone: ${ctx.customerPhone}`);
    lines.push(`Order Type: ${ctx.orderType}`);
    if (ctx.orderType === 'Delivery' && ctx.deliveryAddress) {
      lines.push(`Address: ${ctx.deliveryAddress}`);
    }
    if (ctx.paymentMethod) lines.push(`Payment: ${ctx.paymentMethod}`);
    if (ctx.notes) lines.push(`Notes: ${ctx.notes}`);
  }

  const message = encodeURIComponent(lines.join('\n'));
  return `https://wa.me/${CAFE_CONFIG.whatsappNumber}?text=${message}`;
}
