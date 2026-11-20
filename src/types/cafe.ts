export type MenuCategoryName =
  | 'Hot Coffee'
  | 'Cold Coffee'
  | 'Espresso'
  | 'Frappes'
  | 'Milkshakes'
  | 'Tea'
  | 'Snacks & Desserts';

export type DrinkSize = 'Small' | 'Medium' | 'Large';
export type SugarLevel = 'No Sugar' | 'Less Sugar' | 'Regular' | 'Extra Sweet';
export type MilkType = 'Whole Milk' | 'Skim Milk' | 'Oat Milk' | 'Almond Milk' | 'Soy Milk';
export type ExtraShot = 'None' | 'Single Shot' | 'Double Shot';
export type ToppingOption =
  | 'Cocoa Dusting'
  | 'Whipped Cream'
  | 'Caramel Drizzle'
  | 'Hazelnut Syrup'
  | 'Choco Chips';

export interface BeverageCustomization {
  size: DrinkSize;
  sugarLevel: SugarLevel;
  milkType: MilkType;
  extraShot: ExtraShot;
  toppings: ToppingOption[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: MenuCategoryName;
  description: string;
  price: number;
  rating: number;
  reviewsCount: number;
  image: string;
  isBestSeller: boolean;
  isBeverage: boolean;
  active: boolean;
  tag?: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  menuFilter: MenuCategoryName;
  description: string;
  image: string;
  displayOrder: number;
  active: boolean;
}

export interface Offer {
  id: string;
  title: string;
  subtitle: string;
  code: string;
  discountType: 'bogo' | 'combo' | 'percent' | 'flat';
  discountValue: number;
  targetCategory: string;
  active: boolean;
}

export interface CartItem {
  cartItemId: string;
  productId: string;
  slug: string;
  name: string;
  category: MenuCategoryName;
  image: string;
  basePrice: number;
  unitPrice: number;
  quantity: number;
  isBeverage: boolean;
  customization?: BeverageCustomization;
}

export type OrderType = 'Pickup' | 'Delivery';
export type PaymentMethod = 'Cash on Delivery' | 'UPI';
export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Preparing'
  | 'Ready'
  | 'Out for Delivery'
  | 'Completed'
  | 'Cancelled';

export interface OrderLineItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  summary: string;
}

export interface OrderRecord {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  orderType: OrderType;
  deliveryAddress: string;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  items: OrderLineItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  promoCode: string;
  total: number;
  notes: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface ContactMessageRecord {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: 'New' | 'Reviewed';
  createdAt?: unknown;
}

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  rating: number;
  quote: string;
  favoriteDrink: string;
}
