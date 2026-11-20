import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { auth, googleProvider, testFirestoreConnection } from '../lib/firebase';
import { DEFAULT_CATEGORIES, DEFAULT_OFFERS, DEFAULT_PRODUCTS } from '../data/seedCatalog';
import {
  checkIsAdminUser,
  subscribePublicCatalog,
} from '../services/firestoreService';
import {
  BeverageCustomization,
  CartItem,
  CategoryItem,
  Offer,
  OrderType,
  Product,
} from '../types/cafe';
import {
  calculateCartTotals,
  calculateCustomizedUnitPrice,
  CartTotals,
  makeCartItemKey,
} from '../utils/pricing';

const CART_STORAGE_KEY = 'kaka_cafe_cart_v1';
const PROMO_STORAGE_KEY = 'kaka_cafe_promo_v1';

interface StoreContextValue {
  // Navigation
  currentPath: string;
  navigate: (path: string, options?: { category?: string; scrollToId?: string }) => void;
  menuCategoryFilter: string;
  setMenuCategoryFilter: (cat: string) => void;

  // Auth
  user: User | null;
  authReady: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<User | null>;
  signOutUser: () => Promise<void>;

  // Catalog
  products: Product[];
  categories: CategoryItem[];
  offers: Offer[];
  catalogLoading: boolean;

  // Cart
  cartItems: CartItem[];
  addToCart: (
    product: Product,
    quantity?: number,
    customization?: BeverageCustomization
  ) => void;
  updateCartQuantity: (cartItemId: string, delta: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  promoCode: string;
  setPromoCode: (code: string) => void;
  orderType: OrderType;
  setOrderType: (t: OrderType) => void;
  cartTotals: CartTotals;
  isCartDrawerOpen: boolean;
  setCartDrawerOpen: (open: boolean) => void;

  // Product Customization Modal
  modalProduct: Product | null;
  openProductModal: (product: Product) => void;
  closeProductModal: () => void;

  // Toast feedback
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

const ROUTE_META: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'Kaka Cafe — Your Daily Dose of Happiness',
    description:
      'Crafted with passion and brewed to perfection. Explore handcrafted espresso, cappuccinos, cold coffee, frappes, teas, and fresh bakery pairings at Kaka Cafe.',
  },
  '/menu': {
    title: 'Menu — Kaka Cafe',
    description:
      'Browse hot coffee, cold coffee, espresso, frappes, milkshakes, artisanal teas, and bakery snacks. Customize size, milk, sugar, and toppings.',
  },
  '/cart': {
    title: 'Your Bag — Kaka Cafe',
    description: 'Review your customized Kaka Cafe beverages, apply offers, and proceed to checkout.',
  },
  '/checkout': {
    title: 'Checkout — Kaka Cafe',
    description: 'Complete your Kaka Cafe pickup or delivery order online or via WhatsApp.',
  },
  '/about': {
    title: 'Our Story — Kaka Cafe',
    description:
      'Discover how Kaka Cafe roasts single-estate Indian Arabica beans and crafts unforgettable coffee moments.',
  },
  '/contact': {
    title: 'Contact Us — Kaka Cafe',
    description: 'Visit Kaka Cafe, check opening hours, or send us a message online or via WhatsApp.',
  },
  '/orders': {
    title: 'My Orders — Kaka Cafe',
    description: 'Track your live Kaka Cafe beverage orders in real time.',
  },
  '/admin': {
    title: 'Admin Dashboard — Kaka Cafe',
    description: 'Manage Kaka Cafe menu items, special offers, and live customer orders.',
  },
};

export const DEFAULT_CUSTOMIZATION: BeverageCustomization = {
  size: 'Medium',
  sugarLevel: 'Regular',
  milkType: 'Whole Milk',
  extraShot: 'None',
  toppings: [],
};

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    const p = window.location.pathname || '/';
    return p === '' ? '/' : p;
  });
  const [menuCategoryFilter, setMenuCategoryFilter] = useState<string>('All Items');

  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [categories, setCategories] = useState<CategoryItem[]>(DEFAULT_CATEGORIES);
  const [offers, setOffers] = useState<Offer[]>(DEFAULT_OFFERS);
  const [catalogLoading, setCatalogLoading] = useState(true);

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore invalid storage
    }
    return [];
  });

  const [promoCode, setPromoCodeState] = useState<string>(() => {
    try {
      return localStorage.getItem(PROMO_STORAGE_KEY) || '';
    } catch {
      return '';
    }
  });

  const [orderType, setOrderType] = useState<OrderType>('Delivery');
  const [isCartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch {
      // ignore storage quota errors
    }
  }, [cartItems]);

  const setPromoCode = useCallback((code: string) => {
    setPromoCodeState(code);
    try {
      localStorage.setItem(PROMO_STORAGE_KEY, code);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    testFirestoreConnection();
    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const adminFlag = await checkIsAdminUser(
          firebaseUser.uid,
          firebaseUser.email,
          firebaseUser.emailVerified
        );
        setIsAdmin(adminFlag);
      } else {
        setIsAdmin(false);
      }
      setAuthReady(true);
    });

    const unsubCatalog = subscribePublicCatalog(
      (prods) => {
        setProducts(prods);
        setCatalogLoading(false);
      },
      (cats) => setCategories(cats),
      (offs) => setOffers(offs)
    );

    return () => {
      unsubAuth();
      unsubCatalog();
    };
  }, []);

  useEffect(() => {
    const onPopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    const base = currentPath.startsWith('/product/') ? '/menu' : currentPath;
    const meta = ROUTE_META[base] || ROUTE_META['/'];
    document.title = meta.title;
    const descTag = document.querySelector('meta[name="description"]');
    if (descTag) {
      descTag.setAttribute('content', meta.description);
    }
  }, [currentPath]);

  const navigate = useCallback(
    (path: string, options?: { category?: string; scrollToId?: string }) => {
      if (options?.category) {
        setMenuCategoryFilter(options.category);
      }
      if (window.location.pathname !== path) {
        window.history.pushState({}, '', path);
        setCurrentPath(path);
      }
      if (options?.scrollToId) {
        window.setTimeout(() => {
          const el = document.getElementById(options.scrollToId!);
          el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 80);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    []
  );

  const signInWithGoogle = useCallback(async (): Promise<User | null> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error) {
      console.error('Sign in failed:', error);
      showToast('Sign-in was cancelled or blocked by popup settings.');
      return null;
    }
  }, [showToast]);

  const signOutUser = useCallback(async () => {
    await signOut(auth);
    setIsAdmin(false);
    showToast('Signed out successfully.');
  }, [showToast]);

  const addToCart = useCallback(
    (
      product: Product,
      quantity = 1,
      customization?: BeverageCustomization
    ) => {
      const effectiveCustomization = product.isBeverage
        ? customization || DEFAULT_CUSTOMIZATION
        : undefined;
      const unitPrice = calculateCustomizedUnitPrice(product, effectiveCustomization);
      const cartItemId = makeCartItemKey(product.id, effectiveCustomization);

      setCartItems((prev) => {
        const existing = prev.find((item) => item.cartItemId === cartItemId);
        if (existing) {
          return prev.map((item) =>
            item.cartItemId === cartItemId
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [
          ...prev,
          {
            cartItemId,
            productId: product.id,
            slug: product.slug,
            name: product.name,
            category: product.category,
            image: product.image,
            basePrice: product.price,
            unitPrice,
            quantity,
            isBeverage: product.isBeverage,
            customization: effectiveCustomization,
          },
        ];
      });
      showToast(`Added ${product.name} to your bag`);
    },
    [showToast]
  );

  const updateCartQuantity = useCallback((cartItemId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const removeFromCart = useCallback((cartItemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    setPromoCode('');
  }, [setPromoCode]);

  const cartTotals = useMemo(
    () => calculateCartTotals(cartItems, orderType, promoCode, offers),
    [cartItems, orderType, promoCode, offers]
  );

  const openProductModal = useCallback((product: Product) => {
    setModalProduct(product);
  }, []);

  const closeProductModal = useCallback(() => {
    setModalProduct(null);
  }, []);

  const value: StoreContextValue = {
    currentPath,
    navigate,
    menuCategoryFilter,
    setMenuCategoryFilter,
    user,
    authReady,
    isAdmin,
    signInWithGoogle,
    signOutUser,
    products,
    categories,
    offers,
    catalogLoading,
    cartItems,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    promoCode,
    setPromoCode,
    orderType,
    setOrderType,
    cartTotals,
    isCartDrawerOpen,
    setCartDrawerOpen,
    modalProduct,
    openProductModal,
    closeProductModal,
    toastMessage,
    showToast,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
