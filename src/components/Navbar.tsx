import React, { useEffect, useState } from 'react';
import { Menu, ShoppingBag, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export function Navbar() {
  const {
    currentPath,
    navigate,
    cartTotals,
    setCartDrawerOpen,
  } = useStore();

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isHome = currentPath === '/';
  const solidHeader = !isHome || scrolled || mobileMenuOpen;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 36);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = (
    e: React.MouseEvent,
    path: string,
    options?: { scrollToId?: string }
  ) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (options?.scrollToId && currentPath === '/') {
      const el = document.getElementById(options.scrollToId);
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    navigate(path, options);
  };

  const navLinkClass = (active: boolean) =>
    `relative py-1 text-sm font-medium whitespace-nowrap shrink-0 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C89B5C] rounded-sm ${
      active
        ? 'text-[#C89B5C] font-semibold'
        : 'text-white/85 hover:text-white'
    }`;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        solidHeader
          ? 'bg-[#1C120E]/90 backdrop-blur-md border-b border-white/15 shadow-xl'
          : 'bg-gradient-to-b from-[#1C120E]/80 to-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4 sm:gap-8">
        {/* Zone 1: Single-element Brand Wordmark */}
        <a
          href="/"
          onClick={(e) => handleLinkClick(e, '/')}
          className="font-display text-2xl sm:text-[26px] font-semibold tracking-tight whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C89B5C] rounded-sm text-white"
        >
          Kaka Cafe
        </a>

        {/* Zone 2: 5 concise single-line text nav links */}
        <nav className="hidden lg:flex items-center gap-7" aria-label="Main navigation">
          <a
            href="/"
            onClick={(e) => handleLinkClick(e, '/')}
            className={navLinkClass(currentPath === '/')}
          >
            Home
          </a>
          <a
            href="/menu"
            onClick={(e) => handleLinkClick(e, '/menu')}
            className={navLinkClass(currentPath === '/menu')}
          >
            Menu
          </a>
          <a
            href="/about"
            onClick={(e) => handleLinkClick(e, '/about')}
            className={navLinkClass(currentPath === '/about')}
          >
            About Us
          </a>
          <a
            href="/#special-offers"
            onClick={(e) => handleLinkClick(e, '/', { scrollToId: 'special-offers' })}
            className={navLinkClass(false)}
          >
            Our Specials
          </a>
          <a
            href="/contact"
            onClick={(e) => handleLinkClick(e, '/contact')}
            className={navLinkClass(currentPath === '/contact')}
          >
            Contact
          </a>
        </nav>

        {/* Zone 3: Cart icon & Primary CTA */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setCartDrawerOpen(true)}
            aria-label={`Open shopping bag with ${cartTotals.itemCount} items`}
            className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C89B5C] ${
              solidHeader
                ? 'text-[#3E2723] hover:bg-[#3E2723]/10'
                : 'text-white hover:bg-white/15'
            }`}
          >
            <ShoppingBag className="w-5 h-5" strokeWidth={1.75} />
            {cartTotals.itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#C89B5C] text-[#242424] text-[11px] font-semibold tabular-nums flex items-center justify-center">
                {cartTotals.itemCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => navigate('/menu')}
            className={`hidden sm:inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C89B5C] ${
              solidHeader
                ? 'bg-[#3E2723] text-white hover:bg-[#6F4E37]'
                : 'bg-[#C89B5C] text-[#242424] hover:bg-[#d6ac70]'
            }`}
          >
            Order Now
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            className={`lg:hidden flex items-center justify-center w-10 h-10 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C89B5C] ${
              solidHeader
                ? 'text-[#3E2723] hover:bg-[#3E2723]/10'
                : 'text-white hover:bg-white/15'
            }`}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#F8F3E9] border-t border-[#3E2723]/10 px-4 py-5 space-y-2 shadow-lg">
          {[
            { label: 'Home', path: '/' },
            { label: 'Menu', path: '/menu' },
            { label: 'About Us', path: '/about' },
            { label: 'Our Specials', path: '/', scrollToId: 'special-offers' },
            { label: 'Contact', path: '/contact' },
            { label: 'My Orders', path: '/orders' },
            { label: 'Admin Portal', path: '/admin' },
          ].map((item) => (
            <a
              key={item.label}
              href={item.path}
              onClick={(e) =>
                handleLinkClick(e, item.path, item.scrollToId ? { scrollToId: item.scrollToId } : undefined)
              }
              className="block px-3 py-2.5 rounded-lg text-base font-medium text-[#242424] hover:bg-[#3E2723]/5 hover:text-[#3E2723]"
            >
              {item.label}
            </a>
          ))}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/menu');
              }}
              className="w-full py-3 rounded-lg bg-[#3E2723] text-white text-sm font-semibold hover:bg-[#6F4E37] transition-colors"
            >
              Order Now
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
