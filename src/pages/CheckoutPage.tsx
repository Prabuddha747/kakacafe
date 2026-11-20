import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Lock,
  MessageCircle,
  ShieldCheck,
  ShoppingBag,
  Store,
  Truck,
} from 'lucide-react';
import { CAFE_CONFIG } from '../config/cafeConfig';
import { useStore } from '../context/StoreContext';
import { createOrderInFirestore } from '../services/firestoreService';
import { OrderType, PaymentMethod } from '../types/cafe';
import {
  buildWhatsAppOrderUrl,
  formatCustomizationSummary,
  formatINR,
} from '../utils/pricing';

interface ConfirmedReceipt {
  orderNumber: string;
  total: number;
  orderType: OrderType;
  paymentMethod: PaymentMethod;
  customerName: string;
}

export function CheckoutPage() {
  const {
    cartItems,
    cartTotals,
    orderType,
    setOrderType,
    promoCode,
    clearCart,
    user,
    signInWithGoogle,
    navigate,
    showToast,
  } = useStore();

  const [customerName, setCustomerName] = useState(user?.displayName || '');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash on Delivery');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<ConfirmedReceipt | null>(null);

  useEffect(() => {
    if (user) {
      if (!customerName && user.displayName) setCustomerName(user.displayName);
      if (!customerEmail && user.email) setCustomerEmail(user.email);
    }
  }, [user, customerName, customerEmail]);

  const validateForm = (): string | null => {
    if (cartItems.length === 0) return 'Your bag is empty.';
    if (customerName.trim().length < 2) return 'Please enter your full name.';
    const digits = customerPhone.replace(/\D/g, '');
    if (digits.length < 10) return 'Please enter a valid 10-digit phone number.';
    if (orderType === 'Delivery' && deliveryAddress.trim().length < 8) {
      return 'Please enter your complete delivery address.';
    }
    return null;
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    setErrorMsg(null);
    setSubmitting(true);

    try {
      let activeUser = user;
      if (!activeUser) {
        activeUser = await signInWithGoogle();
      }
      if (!activeUser) {
        setErrorMsg(
          'Please sign in with Google to save and track your order, or use "Order via WhatsApp" below.'
        );
        setSubmitting(false);
        return;
      }

      const orderNumber = `KC-${Math.floor(100000 + Math.random() * 900000)}`;
      const lineItems = cartItems.map((item) => ({
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        summary: item.isBeverage
          ? formatCustomizationSummary(item.customization)
          : 'Standard',
      }));

      await createOrderInFirestore({
        orderNumber,
        userId: activeUser.uid,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: (customerEmail || activeUser.email || '').trim(),
        orderType,
        deliveryAddress:
          orderType === 'Pickup' ? 'Store Pickup — Patna Exhibition Road Cafe' : deliveryAddress.trim(),
        paymentMethod,
        status: 'Pending',
        items: lineItems,
        subtotal: cartTotals.subtotal,
        deliveryFee: cartTotals.deliveryFee,
        tax: cartTotals.tax,
        discount: cartTotals.discount,
        promoCode: cartTotals.appliedOffer?.code || promoCode || '',
        total: cartTotals.total,
        notes: notes.trim(),
      });

      const snapshot: ConfirmedReceipt = {
        orderNumber,
        total: cartTotals.total,
        orderType,
        paymentMethod,
        customerName: customerName.trim(),
      };
      clearCart();
      setReceipt(snapshot);
      showToast(`Order ${orderNumber} placed successfully!`);
    } catch (err) {
      console.error(err);
      setErrorMsg('Could not submit order to server. You can also place it instantly via WhatsApp.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleWhatsAppCheckout = () => {
    const validationError = validateForm();
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }
    setErrorMsg(null);
    const url = buildWhatsAppOrderUrl({
      items: cartItems,
      totals: cartTotals,
      orderType,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      deliveryAddress: deliveryAddress.trim(),
      paymentMethod,
      notes: notes.trim(),
    });
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (receipt) {
    return (
      <div className="pt-28 pb-20 max-w-2xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#3E2723]/15 text-center space-y-5 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <p className="text-xs font-semibold tracking-widest uppercase text-[#6F4E37]">
            Order Received · Status: Pending
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#3E2723]">
            Thank you, {receipt.customerName}!
          </h1>
          <p className="text-sm sm:text-base text-[#242424]/75">
            Order <span className="font-mono font-semibold text-[#3E2723]">{receipt.orderNumber}</span>{' '}
            has been sent to our baristas.
          </p>

          <div className="bg-[#F8F3E9] rounded-xl p-5 text-sm space-y-2 text-left max-w-md mx-auto">
            <div className="flex justify-between">
              <span className="text-[#242424]/70">Order Type</span>
              <span className="font-semibold text-[#3E2723]">{receipt.orderType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#242424]/70">Payment Method</span>
              <span className="font-semibold text-[#3E2723]">{receipt.paymentMethod}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-[#3E2723]/10">
              <span className="font-semibold text-[#3E2723]">Total Payable</span>
              <span className="font-semibold text-[#3E2723] tabular-nums">
                {formatINR(receipt.total)}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/orders')}
              className="px-6 py-3 rounded-lg bg-[#3E2723] text-white text-sm font-semibold hover:bg-[#6F4E37] transition-colors"
            >
              Track My Order
            </button>
            <button
              type="button"
              onClick={() => navigate('/menu')}
              className="px-6 py-3 rounded-lg border border-[#3E2723]/25 text-[#3E2723] text-sm font-semibold hover:bg-[#F8F3E9] transition-colors"
            >
              Order More
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 sm:pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mb-10">
        <p className="text-xs font-semibold tracking-widest uppercase text-[#6F4E37] mb-2">
          Complete Your Order
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#3E2723]">
          Checkout
        </h1>
      </div>

      {cartItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#3E2723]/10 p-12 text-center max-w-xl mx-auto">
          <ShoppingBag className="w-10 h-10 text-[#6F4E37] mx-auto mb-4" />
          <h2 className="font-display text-2xl font-semibold text-[#3E2723] mb-2">
            Nothing in your bag yet
          </h2>
          <p className="text-sm text-[#242424]/70 mb-6">
            Add your favorite coffee or bakery item from the menu before checking out.
          </p>
          <button
            type="button"
            onClick={() => navigate('/menu')}
            className="px-6 py-3 rounded-lg bg-[#3E2723] text-white text-sm font-semibold hover:bg-[#6F4E37] transition-colors"
          >
            Go to Menu
          </button>
        </div>
      ) : (
        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Customer Details */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-[#3E2723]/10 space-y-5">
              <h2 className="font-display text-xl font-semibold text-[#3E2723]">
                1. Order Type & Contact Details
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setOrderType('Delivery')}
                  className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-colors ${
                    orderType === 'Delivery'
                      ? 'border-[#3E2723] bg-[#3E2723]/5'
                      : 'border-[#3E2723]/15 hover:border-[#3E2723]/35'
                  }`}
                >
                  <Truck className="w-5 h-5 text-[#3E2723] shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-[#3E2723]">Delivery</p>
                    <p className="text-xs text-[#6F4E37]">To your doorstep</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType('Pickup')}
                  className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-colors ${
                    orderType === 'Pickup'
                      ? 'border-[#3E2723] bg-[#3E2723]/5'
                      : 'border-[#3E2723]/15 hover:border-[#3E2723]/35'
                  }`}
                >
                  <Store className="w-5 h-5 text-[#3E2723] shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-[#3E2723]">Cafe Pickup</p>
                    <p className="text-xs text-[#6F4E37]">Skip the counter queue</p>
                  </div>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#3E2723] mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Ananya Sharma"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#3E2723]/20 text-sm focus:outline-none focus:border-[#3E2723]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#3E2723] mb-1.5">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#3E2723]/20 text-sm focus:outline-none focus:border-[#3E2723]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3E2723] mb-1.5">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#3E2723]/20 text-sm focus:outline-none focus:border-[#3E2723]"
                />
              </div>

              {orderType === 'Delivery' ? (
                <div>
                  <label className="block text-xs font-semibold text-[#3E2723] mb-1.5">
                    Delivery Address *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Flat / House No., Building, Street, Landmark"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#3E2723]/20 text-sm focus:outline-none focus:border-[#3E2723]"
                  />
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[#F8F3E9] text-xs text-[#3E2723]">
                  <p className="font-semibold mb-1">Pickup Location</p>
                  <p>
                    {CAFE_CONFIG.addressLine1}, {CAFE_CONFIG.addressLine2}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#3E2723] mb-1.5">
                  Barista Notes (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Extra hot, less ice, ring doorbell"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#3E2723]/20 text-sm focus:outline-none focus:border-[#3E2723]"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-[#3E2723]/10 space-y-4">
              <h2 className="font-display text-xl font-semibold text-[#3E2723]">
                2. Payment Method
              </h2>

              <div className="space-y-2.5">
                {(
                  [
                    {
                      id: 'Cash on Delivery' as PaymentMethod,
                      title: orderType === 'Pickup' ? 'Pay at Pickup Counter (Cash)' : 'Cash on Delivery',
                      subtitle: 'Pay directly when you receive your order.',
                    },
                    {
                      id: 'UPI' as PaymentMethod,
                      title: 'UPI (GPay / PhonePe / Paytm on Delivery or Counter)',
                      subtitle: 'Scan our verified cafe UPI QR upon handoff.',
                    },
                  ] as const
                ).map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                      paymentMethod === method.id
                        ? 'border-[#3E2723] bg-[#3E2723]/5'
                        : 'border-[#3E2723]/15 hover:border-[#3E2723]/35'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === method.id}
                      onChange={() => setPaymentMethod(method.id)}
                      className="mt-1 accent-[#3E2723]"
                    />
                    <div>
                      <p className="text-sm font-semibold text-[#3E2723]">{method.title}</p>
                      <p className="text-xs text-[#242424]/70">{method.subtitle}</p>
                    </div>
                  </label>
                ))}

                {/* Honest Online Gateway Placeholder — Never simulates payment */}
                <div className="flex items-start gap-3 p-4 rounded-xl border border-dashed border-[#3E2723]/20 bg-[#F8F3E9]/50 opacity-75">
                  <Lock className="w-4 h-4 text-[#6F4E37] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-[#3E2723]">
                      Online Card / Netbanking Gateway (Placeholder — Not Enabled)
                    </p>
                    <p className="text-xs text-[#242424]/70">
                      Direct card checkout is disabled until a live payment gateway is connected.
                      Please use Cash on Delivery, UPI on Delivery/Pickup, or WhatsApp ordering.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-6 sm:p-7 border border-[#3E2723]/10 space-y-5 lg:sticky lg:top-28">
            <h2 className="font-display text-xl font-semibold text-[#3E2723]">
              Order Summary
            </h2>

            <div className="divide-y divide-[#3E2723]/10 max-h-72 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div key={item.cartItemId} className="py-3 flex justify-between gap-3 text-sm">
                  <div>
                    <p className="font-medium text-[#242424]">
                      {item.name} × {item.quantity}
                    </p>
                    {item.isBeverage && item.customization && (
                      <p className="text-xs text-[#6F4E37]">
                        {formatCustomizationSummary(item.customization)}
                      </p>
                    )}
                  </div>
                  <span className="font-semibold text-[#3E2723] tabular-nums shrink-0">
                    {formatINR(item.unitPrice * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-sm border-t border-[#3E2723]/10 pt-4">
              <div className="flex justify-between text-[#242424]/75">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatINR(cartTotals.subtotal)}</span>
              </div>
              {cartTotals.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Promo ({cartTotals.appliedOffer?.code})</span>
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
              <div className="pt-3 border-t border-[#3E2723]/10 flex justify-between text-lg font-semibold text-[#3E2723]">
                <span>Total Payable</span>
                <span className="tabular-nums">{formatINR(cartTotals.total)}</span>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                {errorMsg}
              </div>
            )}

            <div className="space-y-3 pt-1">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-5 rounded-lg bg-[#3E2723] text-white text-sm font-semibold hover:bg-[#6F4E37] disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                {submitting
                  ? 'Placing Order...'
                  : user
                  ? 'Confirm & Place Order'
                  : 'Sign in with Google & Place Order'}
              </button>

              <button
                type="button"
                onClick={handleWhatsAppCheckout}
                className="w-full py-3 px-5 rounded-lg bg-[#1F6F4A] text-white text-sm font-semibold hover:bg-[#195a3c] transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Submit Order on WhatsApp
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
