import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { CAFE_CONFIG } from '../config/cafeConfig';
import { DEFAULT_CATEGORIES, DEFAULT_OFFERS, DEFAULT_PRODUCTS } from '../data/seedCatalog';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  CategoryItem,
  ContactMessageRecord,
  Offer,
  OrderRecord,
  OrderStatus,
  Product,
} from '../types/cafe';

function safeSlug(input: string): string {
  const cleaned = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90);
  return cleaned || `item-${Date.now()}`;
}

function safeId(input: string): string {
  const cleaned = input.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 100);
  return cleaned || `id-${Date.now()}`;
}

export async function checkIsAdminUser(uid: string, email: string | null, emailVerified: boolean): Promise<boolean> {
  if (!emailVerified) return false;
  if (email && email.toLowerCase() === CAFE_CONFIG.adminEmailHint.toLowerCase()) {
    return true;
  }
  try {
    const adminDoc = await getDoc(doc(db, 'admins', uid));
    return adminDoc.exists();
  } catch {
    return false;
  }
}

export function subscribePublicCatalog(
  onProducts: (products: Product[]) => void,
  onCategories: (categories: CategoryItem[]) => void,
  onOffers: (offers: Offer[]) => void
): () => void {
  const unsubProducts = onSnapshot(
    query(collection(db, 'products'), where('active', '==', true)),
    (snap) => {
      if (snap.empty) {
        onProducts(DEFAULT_PRODUCTS);
        return;
      }
      const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Product, 'id'>) }));
      onProducts(list);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, 'products')
  );

  const unsubCategories = onSnapshot(
    query(collection(db, 'categories'), where('active', '==', true)),
    (snap) => {
      if (snap.empty) {
        onCategories(DEFAULT_CATEGORIES);
        return;
      }
      const list = snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as Omit<CategoryItem, 'id'>) }))
        .sort((a, b) => a.displayOrder - b.displayOrder);
      onCategories(list);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, 'categories')
  );

  const unsubOffers = onSnapshot(
    query(collection(db, 'offers'), where('active', '==', true)),
    (snap) => {
      if (snap.empty) {
        onOffers(DEFAULT_OFFERS);
        return;
      }
      const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Offer, 'id'>) }));
      onOffers(list);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, 'offers')
  );

  return () => {
    unsubProducts();
    unsubCategories();
    unsubOffers();
  };
}

export function subscribeAdminCatalog(
  onProducts: (products: Product[]) => void,
  onCategories: (categories: CategoryItem[]) => void,
  onOffers: (offers: Offer[]) => void
): () => void {
  const unsubProducts = onSnapshot(
    collection(db, 'products'),
    (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Product, 'id'>) }));
      onProducts(list);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, 'products')
  );

  const unsubCategories = onSnapshot(
    collection(db, 'categories'),
    (snap) => {
      const list = snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as Omit<CategoryItem, 'id'>) }))
        .sort((a, b) => a.displayOrder - b.displayOrder);
      onCategories(list);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, 'categories')
  );

  const unsubOffers = onSnapshot(
    collection(db, 'offers'),
    (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Offer, 'id'>) }));
      onOffers(list);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, 'offers')
  );

  return () => {
    unsubProducts();
    unsubCategories();
    unsubOffers();
  };
}

export async function seedDefaultCatalogToFirestore(): Promise<void> {
  try {
    const batch = writeBatch(db);
    DEFAULT_PRODUCTS.forEach((product) => {
      const ref = doc(db, 'products', safeId(product.id));
      const payload: Record<string, unknown> = {
        name: product.name.slice(0, 80),
        slug: safeSlug(product.slug),
        category: product.category,
        description: product.description.slice(0, 400),
        price: Number(product.price),
        rating: Number(product.rating),
        reviewsCount: Math.round(product.reviewsCount),
        image: product.image.slice(0, 300),
        isBestSeller: Boolean(product.isBestSeller),
        isBeverage: Boolean(product.isBeverage),
        active: Boolean(product.active),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      if (product.tag) {
        payload.tag = product.tag.slice(0, 32);
      }
      batch.set(ref, payload);
    });

    DEFAULT_CATEGORIES.forEach((cat) => {
      const ref = doc(db, 'categories', safeId(cat.id));
      batch.set(ref, {
        name: cat.name.slice(0, 50),
        slug: safeSlug(cat.slug),
        description: cat.description.slice(0, 200),
        image: cat.image.slice(0, 300),
        displayOrder: Math.round(cat.displayOrder),
        active: Boolean(cat.active),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });

    DEFAULT_OFFERS.forEach((offer) => {
      const ref = doc(db, 'offers', safeId(offer.id));
      batch.set(ref, {
        title: offer.title.slice(0, 80),
        subtitle: offer.subtitle.slice(0, 160),
        code: offer.code.toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 24),
        discountType: offer.discountType,
        discountValue: Number(offer.discountValue),
        targetCategory: offer.targetCategory.slice(0, 50),
        active: Boolean(offer.active),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'products');
  }
}

export async function ensureAdminCatalogSeeded(): Promise<boolean> {
  try {
    const snap = await getDocs(collection(db, 'products'));
    if (snap.empty) {
      await seedDefaultCatalogToFirestore();
      return true;
    }
    return false;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'products');
  }
}

export async function saveProduct(
  product: Omit<Product, 'id'> & { id?: string }
): Promise<void> {
  const id = product.id ? safeId(product.id) : safeId(`${safeSlug(product.name)}-${Date.now()}`);
  const path = `products/${id}`;
  const isNew = !product.id;

  const basePayload: Record<string, unknown> = {
    name: product.name.trim().slice(0, 80),
    slug: safeSlug(product.slug || product.name),
    category: product.category,
    description: product.description.trim().slice(0, 400),
    price: Math.max(1, Math.min(10000, Number(product.price))),
    rating: Math.max(1, Math.min(5, Number(product.rating || 4.8))),
    reviewsCount: Math.max(0, Math.round(Number(product.reviewsCount || 0))),
    image: product.image.trim().slice(0, 300),
    isBestSeller: Boolean(product.isBestSeller),
    isBeverage: Boolean(product.isBeverage),
    active: Boolean(product.active),
    updatedAt: serverTimestamp(),
  };

  if (product.tag && product.tag.trim()) {
    basePayload.tag = product.tag.trim().slice(0, 32);
  }

  try {
    if (isNew) {
      await setDoc(doc(db, 'products', id), {
        ...basePayload,
        createdAt: serverTimestamp(),
      });
    } else {
      await updateDoc(doc(db, 'products', id), basePayload);
    }
  } catch (error) {
    handleFirestoreError(error, isNew ? OperationType.CREATE : OperationType.UPDATE, path);
  }
}

export async function removeProduct(productId: string): Promise<void> {
  const path = `products/${productId}`;
  try {
    await deleteDoc(doc(db, 'products', productId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveOffer(offer: Omit<Offer, 'id'> & { id?: string }): Promise<void> {
  const id = offer.id ? safeId(offer.id) : safeId(`offer-${Date.now()}`);
  const path = `offers/${id}`;
  const isNew = !offer.id;

  const payload = {
    title: offer.title.trim().slice(0, 80),
    subtitle: offer.subtitle.trim().slice(0, 160),
    code: offer.code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 24),
    discountType: offer.discountType,
    discountValue: Math.max(0, Math.min(10000, Number(offer.discountValue))),
    targetCategory: (offer.targetCategory || 'All Items').trim().slice(0, 50),
    active: Boolean(offer.active),
    updatedAt: serverTimestamp(),
  };

  try {
    if (isNew) {
      await setDoc(doc(db, 'offers', id), {
        ...payload,
        createdAt: serverTimestamp(),
      });
    } else {
      await updateDoc(doc(db, 'offers', id), payload);
    }
  } catch (error) {
    handleFirestoreError(error, isNew ? OperationType.CREATE : OperationType.UPDATE, path);
  }
}

export async function removeOffer(offerId: string): Promise<void> {
  const path = `offers/${offerId}`;
  try {
    await deleteDoc(doc(db, 'offers', offerId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveCategory(
  category: Omit<CategoryItem, 'id'> & { id?: string }
): Promise<void> {
  const id = category.id ? safeId(category.id) : safeId(`cat-${safeSlug(category.name)}`);
  const path = `categories/${id}`;
  const isNew = !category.id;

  const payload = {
    name: category.name.trim().slice(0, 50),
    slug: safeSlug(category.slug || category.name),
    description: category.description.trim().slice(0, 200),
    image: category.image.trim().slice(0, 300),
    displayOrder: Math.max(0, Math.min(100, Math.round(category.displayOrder))),
    active: Boolean(category.active),
    updatedAt: serverTimestamp(),
  };

  try {
    if (isNew) {
      await setDoc(doc(db, 'categories', id), {
        ...payload,
        createdAt: serverTimestamp(),
      });
    } else {
      await updateDoc(doc(db, 'categories', id), payload);
    }
  } catch (error) {
    handleFirestoreError(error, isNew ? OperationType.CREATE : OperationType.UPDATE, path);
  }
}

export async function createOrderInFirestore(
  orderData: Omit<OrderRecord, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const id = safeId(`ord-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`);
  const path = `orders/${id}`;

  const sanitizedItems = orderData.items.slice(0, 25).map((item) => ({
    productId: item.productId.slice(0, 128),
    name: item.name.slice(0, 80),
    quantity: Math.max(1, Math.min(50, Math.round(item.quantity))),
    unitPrice: Math.max(0, Number(item.unitPrice)),
    summary: item.summary.slice(0, 180),
  }));

  try {
    await setDoc(doc(db, 'orders', id), {
      orderNumber: orderData.orderNumber.slice(0, 24),
      userId: orderData.userId,
      customerName: orderData.customerName.trim().slice(0, 80),
      customerPhone: orderData.customerPhone.trim().slice(0, 20),
      customerEmail: orderData.customerEmail.trim().slice(0, 120),
      orderType: orderData.orderType,
      deliveryAddress: orderData.deliveryAddress.trim().slice(0, 300),
      paymentMethod: orderData.paymentMethod,
      status: 'Pending',
      items: sanitizedItems,
      subtotal: Number(orderData.subtotal),
      deliveryFee: Number(orderData.deliveryFee),
      tax: Number(orderData.tax),
      discount: Number(orderData.discount),
      promoCode: orderData.promoCode.trim().slice(0, 24),
      total: Number(orderData.total),
      notes: orderData.notes.trim().slice(0, 300),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export function subscribeUserOrders(
  userId: string,
  onOrders: (orders: OrderRecord[]) => void
): () => void {
  const q = query(
    collection(db, 'orders'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<OrderRecord, 'id'>),
      }));
      onOrders(list);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, 'orders')
  );
}

export function subscribeAllOrdersAdmin(
  onOrders: (orders: OrderRecord[]) => void
): () => void {
  const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<OrderRecord, 'id'>),
      }));
      onOrders(list);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, 'orders')
  );
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  const path = `orders/${orderId}`;
  try {
    await updateDoc(doc(db, 'orders', orderId), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function subscribeNewsletter(userId: string, email: string): Promise<void> {
  const id = safeId(`sub-${userId}`);
  const path = `newsletter_subscribers/${id}`;
  try {
    await setDoc(doc(db, 'newsletter_subscribers', id), {
      userId,
      email: email.trim().slice(0, 120),
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function submitContactMessage(payload: {
  userId: string;
  name: string;
  email: string;
  phone: string;
  message: string;
}): Promise<void> {
  const id = safeId(`msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`);
  const path = `contact_messages/${id}`;
  try {
    await setDoc(doc(db, 'contact_messages', id), {
      userId: payload.userId,
      name: payload.name.trim().slice(0, 80),
      email: payload.email.trim().slice(0, 120),
      phone: payload.phone.trim().slice(0, 20),
      message: payload.message.trim().slice(0, 1000),
      status: 'New',
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export function subscribeAdminInbox(
  onMessages: (messages: ContactMessageRecord[]) => void,
  onSubscribersCount: (count: number) => void
): () => void {
  const unsubMsgs = onSnapshot(
    query(collection(db, 'contact_messages'), orderBy('createdAt', 'desc')),
    (snap) => {
      onMessages(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<ContactMessageRecord, 'id'>),
        }))
      );
    },
    (error) => handleFirestoreError(error, OperationType.LIST, 'contact_messages')
  );

  const unsubSubs = onSnapshot(
    collection(db, 'newsletter_subscribers'),
    (snap) => {
      onSubscribersCount(snap.size);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, 'newsletter_subscribers')
  );

  return () => {
    unsubMsgs();
    unsubSubs();
  };
}

export async function markMessageReviewed(messageId: string): Promise<void> {
  const path = `contact_messages/${messageId}`;
  try {
    await updateDoc(doc(db, 'contact_messages', messageId), {
      status: 'Reviewed',
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}
