/**
 * Kaka Cafe Business Configuration
 * IMPORTANT: Replace placeholder phone, WhatsApp number, email, and address
 * with your actual cafe business details before production launch.
 */
export const CAFE_CONFIG = {
  brandName: 'Kaka Cafe',
  tagline: 'Your Daily Dose of Happiness.',
  // Configurable WhatsApp number (country code + number without '+' or spaces).
  whatsappNumber: '91123456789',
  displayPhone: '+91 123456789',
  email: 'hello@kakacafe.in',
  addressLine1: 'Boring Road',
  addressLine2: 'Patna, Bihar',
  instagramHandle: '@kakacafe.official',
  instagramUrl: 'https://instagram.com/kakacafe.official',
  facebookUrl: 'https://facebook.com/kakacafe.official',
  googleMapsUrl: 'https://maps.google.com/?q=Boring+Road+Patna+Bihar',
  hours: {
    weekdays: 'Mon – Fri: 7:30 AM – 10:30 PM',
    weekends: 'Sat – Sun: 8:00 AM – 11:30 PM',
  },
  deliveryFee: 40,
  freeDeliveryThreshold: 499,
  gstRate: 0.05,
  adminEmailHint: 'gardaaiacademyofficial@gmail.com',
} as const;

export const CUSTOMIZATION_PRICING = {
  size: {
    Small: -20,
    Medium: 0,
    Large: 45,
  },
  milk: {
    'Whole Milk': 0,
    'Skim Milk': 0,
    'Oat Milk': 45,
    'Almond Milk': 45,
    'Soy Milk': 35,
  },
  extraShot: {
    None: 0,
    'Single Shot': 40,
    'Double Shot': 75,
  },
  toppings: {
    'Cocoa Dusting': 0,
    'Whipped Cream': 25,
    'Caramel Drizzle': 25,
    'Hazelnut Syrup': 35,
    'Choco Chips': 30,
  },
} as const;

export const SUGAR_LEVELS = ['No Sugar', 'Less Sugar', 'Regular', 'Extra Sweet'] as const;
export const DRINK_SIZES = ['Small', 'Medium', 'Large'] as const;
export const MILK_TYPES = ['Whole Milk', 'Skim Milk', 'Oat Milk', 'Almond Milk', 'Soy Milk'] as const;
export const EXTRA_SHOTS = ['None', 'Single Shot', 'Double Shot'] as const;
export const TOPPINGS_LIST = [
  'Cocoa Dusting',
  'Whipped Cream',
  'Caramel Drizzle',
  'Hazelnut Syrup',
  'Choco Chips',
] as const;

export const MENU_CATEGORIES = [
  'All Items',
  'Hot Coffee',
  'Cold Coffee',
  'Espresso',
  'Frappes',
  'Milkshakes',
  'Tea',
  'Snacks & Desserts',
] as const;

export const ORDER_STATUSES = [
  'Pending',
  'Confirmed',
  'Preparing',
  'Ready',
  'Out for Delivery',
  'Completed',
  'Cancelled',
] as const;
