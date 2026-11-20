import React from 'react';
import { Clock, Instagram, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { CAFE_CONFIG } from '../config/cafeConfig';
import { useStore } from '../context/StoreContext';
import { buildWhatsAppOrderUrl } from '../utils/pricing';

export function Footer() {
  const { navigate, cartItems, cartTotals, orderType } = useStore();

  const whatsappUrl = buildWhatsAppOrderUrl({
    items: cartItems,
    totals: cartTotals,
    orderType,
  });

  return (
    <footer className="bg-[#1C120E]/90 backdrop-blur-md text-[#F8F3E9] border-t border-white/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-4">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                navigate('/');
              }}
              className="font-display text-2xl font-semibold text-white tracking-tight inline-block"
            >
              Kaka Cafe
            </a>
            <p className="text-sm text-[#C89B5C] font-medium">
              {CAFE_CONFIG.tagline}
            </p>
            <p className="text-sm text-[#F8F3E9]/70 leading-relaxed max-w-sm">
              A modern neighborhood coffee house roasting single-estate Indian Arabica beans
              and crafting warm, memorable beverage experiences every day.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href={CAFE_CONFIG.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Kaka Cafe on Instagram"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#C89B5C] hover:text-[#242424] flex items-center justify-center transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={CAFE_CONFIG.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Kaka Cafe on Facebook"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#C89B5C] hover:text-[#242424] flex items-center justify-center transition-colors text-xs font-semibold"
              >
                f
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Order via WhatsApp"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#C89B5C] hover:text-[#242424] flex items-center justify-center transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-semibold tracking-wider text-[#C89B5C] uppercase">
              Explore
            </h3>
            <ul className="space-y-2.5 text-sm text-[#F8F3E9]/80">
              {[
                { label: 'Home', path: '/' },
                { label: 'Full Menu', path: '/menu' },
                { label: 'About Us', path: '/about' },
                { label: 'Contact Us', path: '/contact' },
                { label: 'My Orders', path: '/orders' },
                { label: 'Admin Dashboard', path: '/admin' },
              ].map((item) => (
                <li key={item.path}>
                  <a
                    href={item.path}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(item.path);
                    }}
                    className="hover:text-[#C89B5C] transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Menu Categories */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-xs font-semibold tracking-wider text-[#C89B5C] uppercase">
              Menu Categories
            </h3>
            <ul className="space-y-2.5 text-sm text-[#F8F3E9]/80">
              {[
                'Hot Coffee',
                'Cold Coffee',
                'Espresso',
                'Frappes',
                'Milkshakes',
                'Tea',
                'Snacks & Desserts',
              ].map((cat) => (
                <li key={cat}>
                  <button
                    type="button"
                    onClick={() => navigate('/menu', { category: cat })}
                    className="hover:text-[#C89B5C] transition-colors text-left"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Hours */}
          <div className="lg:col-span-3 space-y-3.5 text-sm text-[#F8F3E9]/80">
            <h3 className="text-xs font-semibold tracking-wider text-[#C89B5C] uppercase">
              Visit & Hours
            </h3>
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-[#C89B5C] shrink-0 mt-0.5" />
              <span>
                {CAFE_CONFIG.addressLine1}
                <br />
                {CAFE_CONFIG.addressLine2}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-[#C89B5C] shrink-0" />
              <span className="tabular-nums">{CAFE_CONFIG.displayPhone}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-[#C89B5C] shrink-0" />
              <span>{CAFE_CONFIG.email}</span>
            </div>
            <div className="flex items-start gap-2.5 pt-1">
              <Clock className="w-4 h-4 text-[#C89B5C] shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p>{CAFE_CONFIG.hours.weekdays}</p>
                <p>{CAFE_CONFIG.hours.weekends}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#F8F3E9]/60">
          <p>© {new Date().getFullYear()} Kaka Cafe. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
