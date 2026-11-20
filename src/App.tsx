import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { StoreProvider, useStore } from './context/StoreContext';
import { CartDrawer } from './components/CartDrawer';
import { ScrollVideoBackground } from './components/ScrollVideoBackground';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { Footer } from './components/Footer';
import { Navbar } from './components/Navbar';
import { ProductModal } from './components/ProductModal';
import { AboutPage } from './pages/AboutPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { ContactPage } from './pages/ContactPage';
import { HomePage } from './pages/HomePage';
import { MenuPage } from './pages/MenuPage';
import { OrdersPage } from './pages/OrdersPage';
import { ProductDetailPage } from './pages/ProductDetailPage';

function ToastBanner() {
  const { toastMessage } = useStore();
  return (
    <AnimatePresence>
      {toastMessage && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.2 }}
          role="status"
          aria-live="polite"
          className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-full bg-[#3E2723] text-white text-xs sm:text-sm font-medium shadow-xl border border-[#C89B5C]/40 whitespace-nowrap"
        >
          {toastMessage}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function AppRouter() {
  const { currentPath } = useStore();

  const renderPage = () => {
    if (currentPath === '/menu') return <MenuPage />;
    if (currentPath.startsWith('/product/')) {
      const slug = currentPath.replace('/product/', '');
      return <ProductDetailPage slug={slug} />;
    }
    if (currentPath === '/cart') return <CartPage />;
    if (currentPath === '/checkout') return <CheckoutPage />;
    if (currentPath === '/about') return <AboutPage />;
    if (currentPath === '/contact') return <ContactPage />;
    if (currentPath === '/orders') return <OrdersPage />;
    if (currentPath === '/admin') return <AdminDashboardPage />;
    return <HomePage />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-[#F8F3E9] relative">
      {/* Scroll-scrubbed cinematic video background — spans hero through footer */}
      <ScrollVideoBackground />

      <Navbar />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPath}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <CartDrawer />
      <ProductModal />
      <FloatingWhatsApp />
      <ToastBanner />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppRouter />
    </StoreProvider>
  );
}
