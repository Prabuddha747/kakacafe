import React, { useEffect, useMemo, useState } from 'react';
import {
  Check,
  Coffee,
  Edit3,
  Inbox,
  Lock,
  LogIn,
  LogOut,
  PackageCheck,
  Plus,
  RefreshCw,
  ShieldAlert,
  Tag,
  Trash2,
} from 'lucide-react';
import { MENU_CATEGORIES, ORDER_STATUSES } from '../config/cafeConfig';
import { useStore } from '../context/StoreContext';
import { IMAGE_PRESET_OPTIONS } from '../data/assets';
import {
  ensureAdminCatalogSeeded,
  markMessageReviewed,
  removeOffer,
  removeProduct,
  saveCategory,
  saveOffer,
  saveProduct,
  seedDefaultCatalogToFirestore,
  subscribeAdminCatalog,
  subscribeAdminInbox,
  subscribeAllOrdersAdmin,
  updateOrderStatus,
} from '../services/firestoreService';
import {
  CategoryItem,
  ContactMessageRecord,
  MenuCategoryName,
  Offer,
  OrderRecord,
  OrderStatus,
  Product,
} from '../types/cafe';
import { formatINR } from '../utils/pricing';
import { SafeImage } from '../components/SafeImage';

type AdminTab = 'orders' | 'products' | 'offers' | 'categories' | 'inbox';

export function AdminDashboardPage() {
  const { user, authReady, isAdmin, signInWithGoogle, signOutUser, showToast } = useStore();

  const [activeTab, setActiveTab] = useState<AdminTab>('orders');
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [adminProducts, setAdminProducts] = useState<Product[]>([]);
  const [adminCategories, setAdminCategories] = useState<CategoryItem[]>([]);
  const [adminOffers, setAdminOffers] = useState<Offer[]>([]);
  const [messages, setMessages] = useState<ContactMessageRecord[]>([]);
  const [subscribersCount, setSubscribersCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [seeding, setSeeding] = useState(false);

  // Product Form State
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  // Offer Form State
  const [editingOffer, setEditingOffer] = useState<Partial<Offer> | null>(null);
  // Category Form State
  const [editingCategory, setEditingCategory] = useState<Partial<CategoryItem> | null>(null);

  useEffect(() => {
    if (!authReady || !user || !isAdmin) return;

    ensureAdminCatalogSeeded().then((seeded) => {
      if (seeded) {
        showToast('Initial Kaka Cafe menu synced to Firestore.');
      }
    });

    const unsubOrders = subscribeAllOrdersAdmin(setOrders);
    const unsubCatalog = subscribeAdminCatalog(
      setAdminProducts,
      setAdminCategories,
      setAdminOffers
    );
    const unsubInbox = subscribeAdminInbox(setMessages, setSubscribersCount);

    return () => {
      unsubOrders();
      unsubCatalog();
      unsubInbox();
    };
  }, [authReady, user, isAdmin, showToast]);

  const metrics = useMemo(() => {
    const validOrders = orders.filter((o) => o.status !== 'Cancelled');
    const totalRevenue = validOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const pendingCount = orders.filter(
      (o) => o.status === 'Pending' || o.status === 'Confirmed' || o.status === 'Preparing'
    ).length;
    const activeProductsCount = adminProducts.filter((p) => p.active).length;

    return {
      totalOrders: orders.length,
      totalRevenue,
      pendingCount,
      activeProductsCount,
    };
  }, [orders, adminProducts]);

  const filteredOrders = useMemo(() => {
    if (statusFilter === 'All') return orders;
    return orders.filter((o) => o.status === statusFilter);
  }, [orders, statusFilter]);

  const handleSeedCatalog = async () => {
    setSeeding(true);
    try {
      await seedDefaultCatalogToFirestore();
      showToast('Default products, categories, and offers restored to Firestore.');
    } finally {
      setSeeding(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name || !editingProduct?.price) return;
    await saveProduct({
      id: editingProduct.id,
      name: editingProduct.name,
      slug: editingProduct.slug || editingProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category: (editingProduct.category || 'Hot Coffee') as MenuCategoryName,
      description: editingProduct.description || 'Crafted fresh at Kaka Cafe.',
      price: Number(editingProduct.price),
      rating: Number(editingProduct.rating || 4.8),
      reviewsCount: Number(editingProduct.reviewsCount || 24),
      image: editingProduct.image || IMAGE_PRESET_OPTIONS[0].value,
      isBestSeller: Boolean(editingProduct.isBestSeller),
      isBeverage: editingProduct.isBeverage !== false,
      active: editingProduct.active !== false,
      tag: editingProduct.tag || '',
    });
    showToast(editingProduct.id ? 'Product updated.' : 'Product added.');
    setEditingProduct(null);
  };

  const handleSaveOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOffer?.title || !editingOffer?.code) return;
    await saveOffer({
      id: editingOffer.id,
      title: editingOffer.title,
      subtitle: editingOffer.subtitle || 'Special cafe offer',
      code: editingOffer.code.toUpperCase(),
      discountType: editingOffer.discountType || 'flat',
      discountValue: Number(editingOffer.discountValue || 50),
      targetCategory: editingOffer.targetCategory || 'All Items',
      active: editingOffer.active !== false,
    });
    showToast(editingOffer.id ? 'Offer updated.' : 'Offer created.');
    setEditingOffer(null);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory?.name) return;
    await saveCategory({
      id: editingCategory.id,
      name: editingCategory.name,
      slug:
        editingCategory.slug ||
        editingCategory.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      menuFilter: (editingCategory.menuFilter || 'Hot Coffee') as MenuCategoryName,
      description: editingCategory.description || 'Handcrafted selection',
      image: editingCategory.image || IMAGE_PRESET_OPTIONS[0].value,
      displayOrder: Number(editingCategory.displayOrder || 1),
      active: editingCategory.active !== false,
    });
    showToast('Category saved.');
    setEditingCategory(null);
  };

  if (!authReady) {
    return (
      <div className="pt-28 pb-20 max-w-xl mx-auto px-4 text-center text-sm text-[#6F4E37]">
        Verifying authentication...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="pt-28 pb-20 max-w-lg mx-auto px-4">
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#3E2723]/15 text-center space-y-5 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-[#EFE6D5] text-[#3E2723] flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="font-display text-3xl font-semibold text-[#3E2723]">
            Admin Authentication Required
          </h1>
          <p className="text-sm text-[#242424]/75 leading-relaxed">
            The Kaka Cafe Admin Dashboard is protected by Firebase Authentication and Firestore
            server-side role rules. Sign in with an authorized admin Google account to continue.
          </p>
          <button
            type="button"
            onClick={() => signInWithGoogle()}
            className="w-full py-3.5 px-6 rounded-lg bg-[#3E2723] text-white text-sm font-semibold hover:bg-[#6F4E37] transition-colors inline-flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="pt-28 pb-20 max-w-lg mx-auto px-4">
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-red-200 text-center space-y-5 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-red-50 text-red-700 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h1 className="font-display text-2xl font-semibold text-[#3E2723]">
            Admin Access Restricted
          </h1>
          <p className="text-sm text-[#242424]/75 leading-relaxed">
            Signed in as <span className="font-semibold">{user.email}</span>. This account does not
            hold cafe administrator permissions in Firestore.
          </p>
          <button
            type="button"
            onClick={() => signOutUser()}
            className="px-6 py-2.5 rounded-lg border border-[#3E2723]/25 text-sm font-semibold text-[#3E2723] hover:bg-[#F8F3E9]"
          >
            Sign Out & Switch Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 sm:pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-[#6F4E37] mb-1">
            Store Management · {user.email}
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#3E2723]">
            Kaka Cafe Admin Dashboard
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleSeedCatalog}
            disabled={seeding}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#3E2723]/20 bg-white text-xs font-semibold text-[#3E2723] hover:bg-[#EFE6D5] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${seeding ? 'animate-spin' : ''}`} />
            {seeding ? 'Syncing...' : 'Sync Default Catalog'}
          </button>
          <button
            type="button"
            onClick={() => signOutUser()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#3E2723] text-white text-xs font-semibold hover:bg-[#6F4E37] transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-[#3E2723]/10">
          <p className="text-xs text-[#6F4E37] font-medium">Total Orders</p>
          <p className="font-display text-3xl font-semibold text-[#3E2723] tabular-nums mt-1">
            {metrics.totalOrders}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-[#3E2723]/10">
          <p className="text-xs text-[#6F4E37] font-medium">Total Sales</p>
          <p className="font-display text-3xl font-semibold text-[#3E2723] tabular-nums mt-1">
            {formatINR(metrics.totalRevenue)}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-[#3E2723]/10">
          <p className="text-xs text-[#6F4E37] font-medium">Active Queue</p>
          <p className="font-display text-3xl font-semibold text-[#3E2723] tabular-nums mt-1">
            {metrics.pendingCount}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-[#3E2723]/10">
          <p className="text-xs text-[#6F4E37] font-medium">Active Menu Items</p>
          <p className="font-display text-3xl font-semibold text-[#3E2723] tabular-nums mt-1">
            {metrics.activeProductsCount}
          </p>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[#3E2723]/10">
        {(
          [
            { id: 'orders', label: 'Orders', icon: PackageCheck },
            { id: 'products', label: 'Products & Prices', icon: Coffee },
            { id: 'offers', label: 'Special Offers', icon: Tag },
            { id: 'categories', label: 'Categories', icon: Edit3 },
            { id: 'inbox', label: `Inbox & Dispatch (${messages.length})`, icon: Inbox },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                active
                  ? 'bg-[#3E2723] text-white'
                  : 'text-[#242424]/75 hover:text-[#3E2723] hover:bg-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ORDERS TAB */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-xl font-semibold text-[#3E2723]">
              Live Customer Orders
            </h2>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter orders by status"
              className="px-3 py-2 rounded-lg bg-white border border-[#3E2723]/15 text-xs font-semibold text-[#3E2723]"
            >
              <option value="All">All Statuses</option>
              {ORDER_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 border border-[#3E2723]/10 text-center text-sm text-[#6F4E37]">
              No orders in this status view yet.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl p-5 sm:p-6 border border-[#3E2723]/10 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#3E2723]/10">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-sm font-semibold text-[#3E2723]">
                          {order.orderNumber}
                        </span>
                        <span className="text-xs text-[#6F4E37]">
                          {order.orderType} · {order.paymentMethod}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-[#242424] mt-1">
                        {order.customerName} ·{' '}
                        <span className="tabular-nums font-normal text-[#6F4E37]">
                          {order.customerPhone}
                        </span>
                      </p>
                      <p className="text-xs text-[#242424]/70">{order.deliveryAddress}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-base font-semibold text-[#3E2723] tabular-nums">
                        {formatINR(order.total)}
                      </span>
                      <select
                        value={order.status}
                        onChange={async (e) => {
                          const next = e.target.value as OrderStatus;
                          await updateOrderStatus(order.id, next);
                          showToast(`Order ${order.orderNumber} marked ${next}`);
                        }}
                        aria-label={`Update status for ${order.orderNumber}`}
                        className="px-3 py-2 rounded-lg bg-[#F8F3E9] border border-[#3E2723]/20 text-xs font-semibold text-[#3E2723]"
                      >
                        {ORDER_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="bg-[#F8F3E9]/70 rounded-lg p-2.5 flex justify-between">
                        <div>
                          <p className="font-semibold text-[#3E2723]">
                            {item.name} × {item.quantity}
                          </p>
                          <p className="text-[#6F4E37]">{item.summary}</p>
                        </div>
                        <span className="tabular-nums font-semibold">
                          {formatINR(item.unitPrice * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PRODUCTS TAB */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold text-[#3E2723]">
              Menu Catalog ({adminProducts.length})
            </h2>
            <button
              type="button"
              onClick={() =>
                setEditingProduct({
                  name: '',
                  category: 'Hot Coffee',
                  price: 220,
                  description: '',
                  image: IMAGE_PRESET_OPTIONS[0].value,
                  isBestSeller: false,
                  isBeverage: true,
                  active: true,
                  rating: 4.8,
                  reviewsCount: 10,
                })
              }
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#3E2723] text-white text-xs font-semibold hover:bg-[#6F4E37]"
            >
              <Plus className="w-4 h-4" />
              Add New Product
            </button>
          </div>

          {editingProduct && (
            <form
              onSubmit={handleSaveProduct}
              className="bg-white rounded-2xl p-6 border border-[#3E2723]/15 space-y-4"
            >
              <h3 className="font-display text-lg font-semibold text-[#3E2723]">
                {editingProduct.id ? `Edit ${editingProduct.name}` : 'Create New Menu Item'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#3E2723] mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name || ''}
                    onChange={(e) =>
                      setEditingProduct((p) => ({ ...p, name: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[#3E2723]/20 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#3E2723] mb-1">
                    Category *
                  </label>
                  <select
                    value={editingProduct.category || 'Hot Coffee'}
                    onChange={(e) =>
                      setEditingProduct((p) => ({
                        ...p,
                        category: e.target.value as MenuCategoryName,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[#3E2723]/20 text-sm"
                  >
                    {MENU_CATEGORIES.filter((c) => c !== 'All Items').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#3E2723] mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={10000}
                    required
                    value={editingProduct.price || ''}
                    onChange={(e) =>
                      setEditingProduct((p) => ({ ...p, price: Number(e.target.value) }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[#3E2723]/20 text-sm tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#3E2723] mb-1">
                    Image Asset Preset
                  </label>
                  <select
                    value={editingProduct.image || IMAGE_PRESET_OPTIONS[0].value}
                    onChange={(e) =>
                      setEditingProduct((p) => ({ ...p, image: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[#3E2723]/20 text-sm"
                  >
                    {IMAGE_PRESET_OPTIONS.map((opt) => (
                      <option key={opt.label} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#3E2723] mb-1">
                    Optional Tag (1–2 words)
                  </label>
                  <input
                    type="text"
                    value={editingProduct.tag || ''}
                    onChange={(e) =>
                      setEditingProduct((p) => ({ ...p, tag: e.target.value }))
                    }
                    placeholder="e.g. Signature Pour"
                    className="w-full px-3 py-2 rounded-lg border border-[#3E2723]/20 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3E2723] mb-1">
                  Description *
                </label>
                <textarea
                  rows={2}
                  required
                  value={editingProduct.description || ''}
                  onChange={(e) =>
                    setEditingProduct((p) => ({ ...p, description: e.target.value }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-[#3E2723]/20 text-sm"
                />
              </div>

              <div className="flex flex-wrap gap-6 text-xs font-medium text-[#3E2723]">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(editingProduct.isBestSeller)}
                    onChange={(e) =>
                      setEditingProduct((p) => ({ ...p, isBestSeller: e.target.checked }))
                    }
                    className="accent-[#3E2723]"
                  />
                  Best Seller
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.isBeverage !== false}
                    onChange={(e) =>
                      setEditingProduct((p) => ({ ...p, isBeverage: e.target.checked }))
                    }
                    className="accent-[#3E2723]"
                  />
                  Customizable Beverage
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.active !== false}
                    onChange={(e) =>
                      setEditingProduct((p) => ({ ...p, active: e.target.checked }))
                    }
                    className="accent-[#3E2723]"
                  />
                  Active on Storefront
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-[#3E2723] text-white text-xs font-semibold hover:bg-[#6F4E37]"
                >
                  Save Product
                </button>
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-5 py-2.5 rounded-lg border border-[#3E2723]/20 text-xs font-semibold text-[#3E2723]"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {adminProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl p-4 border border-[#3E2723]/10 flex gap-4 items-center"
              >
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#EFE6D5] shrink-0">
                  <SafeImage
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-[#6F4E37] font-medium">
                    {product.category} · {product.active ? 'Visible' : 'Hidden'}
                  </p>
                  <h3 className="font-display text-base font-semibold text-[#3E2723] truncate">
                    {product.name}
                  </h3>
                  <p className="text-sm font-semibold text-[#3E2723] tabular-nums mt-0.5">
                    {formatINR(product.price)}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(product)}
                    aria-label={`Edit ${product.name}`}
                    className="p-2 rounded-lg bg-[#F8F3E9] text-[#3E2723] hover:bg-[#EFE6D5]"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await removeProduct(product.id);
                      showToast(`Deleted ${product.name}`);
                    }}
                    aria-label={`Delete ${product.name}`}
                    className="p-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* OFFERS TAB */}
      {activeTab === 'offers' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold text-[#3E2723]">
              Promotions & Special Offers
            </h2>
            <button
              type="button"
              onClick={() =>
                setEditingOffer({
                  title: '',
                  subtitle: '',
                  code: '',
                  discountType: 'flat',
                  discountValue: 50,
                  targetCategory: 'All Items',
                  active: true,
                })
              }
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#3E2723] text-white text-xs font-semibold hover:bg-[#6F4E37]"
            >
              <Plus className="w-4 h-4" />
              Add Offer
            </button>
          </div>

          {editingOffer && (
            <form
              onSubmit={handleSaveOffer}
              className="bg-white rounded-2xl p-6 border border-[#3E2723]/15 space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#3E2723] mb-1">
                    Offer Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingOffer.title || ''}
                    onChange={(e) => setEditingOffer((o) => ({ ...o, title: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-[#3E2723]/20 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#3E2723] mb-1">
                    Promo Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingOffer.code || ''}
                    onChange={(e) =>
                      setEditingOffer((o) => ({ ...o, code: e.target.value.toUpperCase() }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[#3E2723]/20 text-sm font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#3E2723] mb-1">
                    Discount Type
                  </label>
                  <select
                    value={editingOffer.discountType || 'flat'}
                    onChange={(e) =>
                      setEditingOffer((o) => ({
                        ...o,
                        discountType: e.target.value as Offer['discountType'],
                      }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[#3E2723]/20 text-sm"
                  >
                    <option value="bogo">Buy 1 Get 1 (Fixed ₹)</option>
                    <option value="combo">Combo Savings (₹)</option>
                    <option value="percent">Percentage (%)</option>
                    <option value="flat">Flat Discount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#3E2723] mb-1">
                    Value (₹ or %)
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={editingOffer.discountValue ?? 0}
                    onChange={(e) =>
                      setEditingOffer((o) => ({ ...o, discountValue: Number(e.target.value) }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[#3E2723]/20 text-sm tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#3E2723] mb-1">
                    Description *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingOffer.subtitle || ''}
                    onChange={(e) =>
                      setEditingOffer((o) => ({ ...o, subtitle: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[#3E2723]/20 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#3E2723] mb-1">
                    Target Category
                  </label>
                  <select
                    value={editingOffer.targetCategory || 'All Items'}
                    onChange={(e) =>
                      setEditingOffer((o) => ({ ...o, targetCategory: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[#3E2723]/20 text-sm"
                  >
                    {MENU_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-[#3E2723] text-white text-xs font-semibold"
                >
                  Save Offer
                </button>
                <button
                  type="button"
                  onClick={() => setEditingOffer(null)}
                  className="px-5 py-2.5 rounded-lg border border-[#3E2723]/20 text-xs font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {adminOffers.map((offer) => (
              <div
                key={offer.id}
                className="bg-white rounded-2xl p-5 border border-[#3E2723]/10 flex items-start justify-between gap-4"
              >
                <div>
                  <p className="text-xs font-mono text-[#6F4E37]">
                    {offer.code} · {offer.targetCategory}
                  </p>
                  <h3 className="font-display text-lg font-semibold text-[#3E2723] mt-0.5">
                    {offer.title}
                  </h3>
                  <p className="text-xs text-[#242424]/75 mt-1">{offer.subtitle}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingOffer(offer)}
                    className="p-2 rounded-lg bg-[#F8F3E9] text-[#3E2723]"
                    aria-label={`Edit ${offer.title}`}
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeOffer(offer.id)}
                    className="p-2 rounded-lg bg-red-50 text-red-700"
                    aria-label={`Delete ${offer.title}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CATEGORIES TAB */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold text-[#3E2723]">
              Storefront Categories
            </h2>
            <button
              type="button"
              onClick={() =>
                setEditingCategory({
                  name: '',
                  description: '',
                  image: IMAGE_PRESET_OPTIONS[0].value,
                  displayOrder: adminCategories.length + 1,
                  active: true,
                })
              }
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#3E2723] text-white text-xs font-semibold"
            >
              <Plus className="w-4 h-4" />
              Add Category
            </button>
          </div>

          {editingCategory && (
            <form
              onSubmit={handleSaveCategory}
              className="bg-white rounded-2xl p-6 border border-[#3E2723]/15 space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <input
                  type="text"
                  required
                  placeholder="Category Name"
                  value={editingCategory.name || ''}
                  onChange={(e) =>
                    setEditingCategory((c) => ({ ...c, name: e.target.value }))
                  }
                  className="px-3 py-2 rounded-lg border border-[#3E2723]/20 text-sm"
                />
                <input
                  type="text"
                  required
                  placeholder="Short description"
                  value={editingCategory.description || ''}
                  onChange={(e) =>
                    setEditingCategory((c) => ({ ...c, description: e.target.value }))
                  }
                  className="px-3 py-2 rounded-lg border border-[#3E2723]/20 text-sm"
                />
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={editingCategory.displayOrder ?? 1}
                  onChange={(e) =>
                    setEditingCategory((c) => ({ ...c, displayOrder: Number(e.target.value) }))
                  }
                  className="px-3 py-2 rounded-lg border border-[#3E2723]/20 text-sm tabular-nums"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-[#3E2723] text-white text-xs font-semibold"
                >
                  Save Category
                </button>
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-5 py-2.5 rounded-lg border border-[#3E2723]/20 text-xs font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {adminCategories.map((cat) => (
              <div
                key={cat.id}
                className="bg-white rounded-2xl p-4 border border-[#3E2723]/10 flex items-center justify-between gap-3"
              >
                <div>
                  <p className="text-xs text-[#6F4E37] tabular-nums">Order #{cat.displayOrder}</p>
                  <h3 className="font-display text-base font-semibold text-[#3E2723]">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-[#242424]/70 line-clamp-1">{cat.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingCategory(cat)}
                  className="p-2 rounded-lg bg-[#F8F3E9] text-[#3E2723]"
                  aria-label={`Edit ${cat.name}`}
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* INBOX & SUBSCRIBERS TAB */}
      {activeTab === 'inbox' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-[#3E2723]/10 flex items-center justify-between">
            <div>
              <p className="text-xs text-[#6F4E37]">Newsletter Subscribers</p>
              <p className="font-display text-2xl font-semibold text-[#3E2723] tabular-nums">
                {subscribersCount} Verified Subscribers
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {messages.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 border border-[#3E2723]/10 text-center text-sm text-[#6F4E37]">
                No customer contact messages yet.
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className="bg-white rounded-2xl p-5 border border-[#3E2723]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#3E2723]">
                      {msg.name} · <span className="font-normal text-[#6F4E37]">{msg.email}</span> ·{' '}
                      <span className="tabular-nums font-normal text-[#6F4E37]">{msg.phone}</span>
                    </p>
                    <p className="text-sm text-[#242424]/80 mt-1">{msg.message}</p>
                  </div>
                  {msg.status === 'New' ? (
                    <button
                      type="button"
                      onClick={() => markMessageReviewed(msg.id)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#3E2723] text-white text-xs font-semibold shrink-0"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Mark Reviewed
                    </button>
                  ) : (
                    <span className="text-xs font-semibold text-emerald-700 shrink-0">
                      Reviewed
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
