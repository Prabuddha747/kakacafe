import React, { useEffect, useState } from 'react';
import { LogIn, Package, XCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { subscribeUserOrders, updateOrderStatus } from '../services/firestoreService';
import { OrderRecord } from '../types/cafe';
import { formatINR } from '../utils/pricing';

export function OrdersPage() {
  const { user, authReady, signInWithGoogle, navigate, showToast } = useStore();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authReady) return;
    if (!user) {
      setLoading(false);
      setOrders([]);
      return;
    }

    setLoading(true);
    const unsub = subscribeUserOrders(user.uid, (list) => {
      setOrders(list);
      setLoading(false);
    });
    return () => unsub();
  }, [authReady, user]);

  const handleCancelOrder = async (orderId: string) => {
    await updateOrderStatus(orderId, 'Cancelled');
    showToast('Order cancelled.');
  };

  return (
    <div className="pt-24 sm:pt-28 pb-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-10">
        <p className="text-xs font-semibold tracking-widest uppercase text-[#6F4E37] mb-2">
          Live Status
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#3E2723]">
          My Orders
        </h1>
      </div>

      {!authReady || loading ? (
        <div className="bg-white rounded-2xl p-8 border border-[#3E2723]/10 text-center text-sm text-[#6F4E37]">
          Loading your orders...
        </div>
      ) : !user ? (
        <div className="bg-white rounded-2xl p-10 border border-[#3E2723]/10 text-center max-w-lg mx-auto space-y-4">
          <Package className="w-10 h-10 text-[#6F4E37] mx-auto" />
          <h2 className="font-display text-2xl font-semibold text-[#3E2723]">
            Sign in to view your orders
          </h2>
          <p className="text-sm text-[#242424]/70">
            Access real-time preparation updates for orders placed with your Google account.
          </p>
          <button
            type="button"
            onClick={() => signInWithGoogle()}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#3E2723] text-white text-sm font-semibold hover:bg-[#6F4E37] transition-colors"
          >
            <LogIn className="w-4 h-4" />
            Sign in with Google
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 border border-[#3E2723]/10 text-center max-w-lg mx-auto space-y-4">
          <Package className="w-10 h-10 text-[#6F4E37] mx-auto" />
          <h2 className="font-display text-2xl font-semibold text-[#3E2723]">
            No orders yet
          </h2>
          <p className="text-sm text-[#242424]/70">
            Ready for a freshly brewed cappuccino or iced cold coffee?
          </p>
          <button
            type="button"
            onClick={() => navigate('/menu')}
            className="px-6 py-3 rounded-lg bg-[#3E2723] text-white text-sm font-semibold hover:bg-[#6F4E37] transition-colors"
          >
            Browse Menu
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl p-6 border border-[#3E2723]/10 space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#3E2723]/10">
                <div>
                  <span className="font-mono text-sm font-semibold text-[#3E2723]">
                    {order.orderNumber}
                  </span>
                  <span className="text-xs text-[#6F4E37] ml-2">
                    · {order.orderType} · {order.paymentMethod}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold px-3 py-1 rounded-md bg-[#EFE6D5] text-[#3E2723]">
                    {order.status}
                  </span>
                  {order.status === 'Pending' && (
                    <button
                      type="button"
                      onClick={() => handleCancelOrder(order.id)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-red-700 hover:underline"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <div>
                      <span className="font-medium text-[#242424]">
                        {item.name} × {item.quantity}
                      </span>
                      <span className="text-xs text-[#6F4E37] ml-2">{item.summary}</span>
                    </div>
                    <span className="tabular-nums font-medium text-[#3E2723]">
                      {formatINR(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-[#3E2723]/10 flex justify-between items-center text-sm font-semibold text-[#3E2723]">
                <span>Total</span>
                <span className="tabular-nums text-base">{formatINR(order.total)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
