import React, { useState } from 'react';
import {
  ArrowRight,
  Award,
  ChevronLeft,
  ChevronRight,
  Clock,
  Coffee,
  Flame,
  Heart,
  Instagram,
  Sparkles,
  Star,
  Store,
  Tag,
} from 'lucide-react';
import { motion } from 'motion/react';
import { CAFE_CONFIG } from '../config/cafeConfig';
import { useStore } from '../context/StoreContext';
import { CAFE_IMAGES } from '../data/assets';
import { SAMPLE_TESTIMONIALS } from '../data/seedCatalog';
import { subscribeNewsletter } from '../services/firestoreService';
import { ProductCard } from '../components/ProductCard';
import { SafeImage } from '../components/SafeImage';

const WHY_CHOOSE_FEATURES = [
  {
    icon: Coffee,
    title: 'Freshly Brewed Coffee',
    description:
      'Single-estate Chikmagalur and Coorg Arabica beans small-batch roasted and ground moments before extraction.',
  },
  {
    icon: Award,
    title: 'Premium Ingredients',
    description:
      'Pure Belgian couverture cocoa, Madagascar vanilla pods, farm-fresh dairy, and organic ceremonial matcha.',
  },
  {
    icon: Flame,
    title: 'Expert Baristas',
    description:
      'Trained espresso artisans calibrating grind, pressure, and silky microfoam temperature to every single pour.',
  },
  {
    icon: Store,
    title: 'Cozy Cafe Experience',
    description:
      'Warm travertine stone, natural wood, soft morning acoustics, and unhurried seating crafted for connection.',
  },
  {
    icon: Clock,
    title: 'Quick Service',
    description:
      'Seamless pickup pre-ordering and responsive neighborhood delivery so your cup arrives at peak flavor.',
  },
  {
    icon: Heart,
    title: 'Made With Love',
    description:
      'Every cup and laminated pastry carries genuine hospitality—because coffee tastes better when crafted with care.',
  },
];

const GALLERY_SHOTS = [
  { src: CAFE_IMAGES.cappuccinoClassic, alt: 'Velvety rosetta cappuccino on travertine stone' },
  { src: CAFE_IMAGES.icedColdCoffee, alt: 'Swirling iced cold coffee at Kaka Cafe' },
  { src: CAFE_IMAGES.bakeryLifestyle, alt: 'Morning butter croissants and pour-over carafe' },
  { src: CAFE_IMAGES.caramelMacchiato, alt: 'Layered caramel macchiato drizzle' },
  { src: CAFE_IMAGES.matchaChaiTea, alt: 'Ceremonial matcha and spiced masala chai' },
  { src: CAFE_IMAGES.aboutInterior, alt: 'Barista pouring latte art behind the espresso bar' },
];

export function HomePage() {
  const {
    products,
    categories,
    offers,
    navigate,
    setPromoCode,
    user,
    signInWithGoogle,
    showToast,
  } = useStore();

  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<{
    type: 'idle' | 'loading' | 'success' | 'error';
    message?: string;
  }>({ type: 'idle' });

  const bestSellers = products
    .filter((p) => p.active && p.isBestSeller)
    .slice(0, 6);

  const activeOffers = offers.filter((o) => o.active);
  const activeTestimonial = SAMPLE_TESTIMONIALS[testimonialIdx] || SAMPLE_TESTIMONIALS[0];

  const handleGrabOffer = (code: string, targetCategory: string) => {
    setPromoCode(code);
    showToast(`Promo code ${code} applied to your bag`);
    navigate('/menu', {
      category: targetCategory && targetCategory !== 'All Items' ? targetCategory : 'All Items',
    });
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = newsletterEmail.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setNewsletterStatus({
        type: 'error',
        message: 'Please enter a valid email address.',
      });
      return;
    }

    setNewsletterStatus({ type: 'loading' });
    try {
      let currentUser = user;
      if (!currentUser) {
        currentUser = await signInWithGoogle();
      }
      if (!currentUser) {
        setNewsletterStatus({
          type: 'error',
          message: 'Please verify with Google sign-in to save your newsletter subscription.',
        });
        return;
      }

      await subscribeNewsletter(currentUser.uid, email);
      setNewsletterStatus({
        type: 'success',
        message: 'You are subscribed! Watch your inbox for seasonal brews and member offers.',
      });
      setNewsletterEmail('');
    } catch {
      setNewsletterStatus({
        type: 'error',
        message: 'Could not complete your subscription right now. Please try again.',
      });
    }
  };

  return (
    <div>
      {/* B. Hero Section */}
      <section className="relative min-h-[88vh] sm:min-h-[92vh] flex items-center overflow-hidden bg-transparent">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 w-full">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl"
          >
            <p className="text-xs sm:text-sm font-medium tracking-[0.18em] uppercase text-[#C89B5C] mb-4">
              {CAFE_CONFIG.brandName} · {CAFE_CONFIG.tagline}
            </p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-[64px] font-semibold text-white leading-[1.08] tracking-tight mb-6">
              Every Sip Tells a Story.
            </h1>
            <p className="text-base sm:text-lg text-white/90 leading-relaxed max-w-xl mb-8">
              Crafted with passion. Brewed to perfection. Experience your favorite coffee moments
              at Kaka Cafe.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => navigate('/menu')}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-[#C89B5C] text-[#1C120E] text-sm font-semibold hover:bg-[#d6ac70] transition-all duration-200 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Explore Our Menu
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => navigate('/checkout')}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-white/10 text-white border border-white/30 backdrop-blur-xs text-sm font-semibold hover:bg-white/20 transition-all duration-200 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C89B5C]"
              >
                Order Your Coffee
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Cafe Highlights Strip */}
      <div className="bg-black/25 backdrop-blur-md text-[#F8F3E9] border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs sm:text-sm">
          <div className="flex items-center gap-2.5">
            <Coffee className="w-4 h-4 text-[#C89B5C] shrink-0" />
            <span>100% Single-Estate Arabica</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Flame className="w-4 h-4 text-[#C89B5C] shrink-0" />
            <span>Small-Batch Roasted Fresh</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-[#C89B5C] shrink-0" />
            <span>Custom Milk & Sugar Options</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-[#C89B5C] shrink-0" />
            <span>Open Daily · 7:30 AM – 10:30 PM</span>
          </div>
        </div>
      </div>

      {/* C. Best Sellers Section */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-[#C89B5C] mb-2">
              House Favorites
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-white">
              Our Best Sellers
            </h2>
          </div>
          <button
            type="button"
            onClick={() => navigate('/menu')}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#C89B5C] hover:text-white transition-colors whitespace-nowrap self-start sm:self-auto"
          >
            View Complete Menu
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* D. Categories Section */}
      <section className="py-16 sm:py-20 bg-transparent border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#C89B5C] mb-2">
              Curated Pourings
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-white">
              Explore by Category
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories
              .filter((c) => c.active)
              .map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => navigate('/menu', { category: category.menuFilter })}
                  className="group text-left bg-black/40 backdrop-blur-md rounded-2xl overflow-hidden border border-white/15 shadow-xl hover:shadow-2xl hover:-translate-y-1.5 hover:border-[#C89B5C] transition-all duration-300 ease-out flex items-center gap-4 p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C89B5C] text-[#F8F3E9]"
                >
                  <div className="w-24 h-24 rounded-xl overflow-hidden bg-black/30 shrink-0">
                    <SafeImage
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex-1 min-w-0 pr-2">
                    <h3 className="font-display text-lg font-semibold text-white group-hover:text-[#C89B5C] transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-xs text-white/75 line-clamp-2 mt-1 leading-relaxed">
                      {category.description}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#C89B5C] shrink-0 mr-2 group-hover:translate-x-0.5 transition-transform" />
                </button>
              ))}
          </div>
        </div>
      </section>

      {/* E. About Kaka Cafe */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-stretch">
          <div className="lg:col-span-6 rounded-2xl overflow-hidden bg-black/30 min-h-[340px] border border-white/15">
            <SafeImage
              src={CAFE_IMAGES.aboutInterior}
              alt="Inside Kaka Cafe with barista crafting espresso"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="lg:col-span-6 flex flex-col justify-center space-y-6 py-2">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#C89B5C]">
              Our Philosophy
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-[42px] font-semibold text-white leading-tight">
              More Than Coffee. It&apos;s an Experience.
            </h2>
            <p className="text-base text-white/85 leading-relaxed">
              At Kaka Cafe, we believe every cup brings people closer. From freshly brewed
              espresso to creamy handcrafted beverages, every drink is made with love, quality
              ingredients, and a passion for perfection.
            </p>
            <div className="grid grid-cols-2 gap-6 pt-2 border-t border-white/15">
              <div>
                <p className="font-display text-2xl font-semibold text-white tabular-nums">
                  1,200m+
                </p>
                <p className="text-xs text-[#C89B5C] mt-1">
                  High-elevation Chikmagalur estates
                </p>
              </div>
              <div>
                <p className="font-display text-2xl font-semibold text-white tabular-nums">
                  48 Hours
                </p>
                <p className="text-xs text-[#C89B5C] mt-1">
                  Roast-to-bar freshness window
                </p>
              </div>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => navigate('/about')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#C89B5C] text-[#1C120E] text-sm font-semibold hover:bg-[#d6ac70] transition-colors"
              >
                Learn More
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* F. Special Offers Section */}
      <section
        id="special-offers"
        className="py-16 sm:py-24 bg-[#3E2723] text-[#F8F3E9]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-[#C89B5C] mb-2">
                Curated Cafe Specials
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-white">
                Your Coffee Break Just Got Better.
              </h2>
            </div>
            <p className="text-sm text-[#F8F3E9]/75 max-w-md">
              Tap any offer below to automatically apply its promo code to your bag and start ordering.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {activeOffers.map((offer) => (
              <div
                key={offer.id}
                className="bg-[#4B312B] rounded-2xl p-6 border border-[#C89B5C]/30 shadow-md hover:shadow-2xl hover:-translate-y-2 hover:border-[#C89B5C] transition-all duration-300 ease-out flex flex-col justify-between gap-5 group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs text-[#C89B5C] font-medium mb-3">
                    <span>{offer.targetCategory}</span>
                    <span className="font-mono tracking-wider">{offer.code}</span>
                  </div>
                  <h3 className="font-display text-xl font-semibold text-white mb-2">
                    {offer.title}
                  </h3>
                  <p className="text-sm text-[#F8F3E9]/80 leading-relaxed">
                    {offer.subtitle}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleGrabOffer(offer.code, offer.targetCategory)}
                  className="w-full py-2.5 px-4 rounded-lg bg-[#C89B5C] text-[#242424] text-xs font-semibold hover:bg-[#d6ac70] transition-colors inline-flex items-center justify-center gap-1.5"
                >
                  <Tag className="w-3.5 h-3.5" />
                  Grab the Offer
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* G. Why Choose Kaka Cafe */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-12">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#6F4E37] mb-2">
            The Kaka Standard
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#3E2723]">
            Why Choose Kaka Cafe
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {WHY_CHOOSE_FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="bg-white rounded-2xl p-6 border border-[#3E2723]/10 shadow-sm hover:shadow-xl hover:-translate-y-1.5 hover:border-[#C89B5C]/50 transition-all duration-300 ease-out space-y-3 group"
              >
                <div className="w-11 h-11 rounded-xl bg-[#F8F3E9] text-[#3E2723] flex items-center justify-center">
                  <Icon className="w-5 h-5" strokeWidth={1.75} />
                </div>
                <h3 className="font-display text-lg font-semibold text-[#3E2723]">
                  {feat.title}
                </h3>
                <p className="text-sm text-[#242424]/75 leading-relaxed">
                  {feat.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* H. Customer Testimonials Slider */}
      <section className="py-16 sm:py-20 bg-[#EFE6D5]/60 border-y border-[#3E2723]/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#6F4E37] mb-2">
              Guest Notes · Sample Reviews
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#3E2723]">
              Loved by Daily Coffee Ritualists
            </h2>
          </div>

          <div className="bg-white rounded-2xl p-8 sm:p-10 border border-[#3E2723]/10 shadow-xs">
            <div className="flex items-center justify-center gap-1 mb-5">
              {Array.from({ length: activeTestimonial.rating }).map((_, idx) => (
                <Star key={idx} className="w-4 h-4 fill-[#C89B5C] text-[#C89B5C]" />
              ))}
            </div>

            <blockquote className="font-display text-xl sm:text-2xl text-[#3E2723] text-center leading-relaxed mb-6">
              &ldquo;{activeTestimonial.quote}&rdquo;
            </blockquote>

            <div className="text-center space-y-1">
              <p className="text-sm font-semibold text-[#242424]">
                {activeTestimonial.name}
              </p>
              <p className="text-xs text-[#6F4E37]">
                {activeTestimonial.role} · {activeTestimonial.favoriteDrink}
              </p>
            </div>

            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                type="button"
                onClick={() =>
                  setTestimonialIdx((prev) =>
                    prev === 0 ? SAMPLE_TESTIMONIALS.length - 1 : prev - 1
                  )
                }
                aria-label="Previous testimonial"
                className="w-10 h-10 rounded-full border border-[#3E2723]/20 flex items-center justify-center text-[#3E2723] hover:bg-[#F8F3E9] transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2">
                {SAMPLE_TESTIMONIALS.map((item, idx) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTestimonialIdx(idx)}
                    aria-label={`View testimonial ${idx + 1}`}
                    className={`h-2 rounded-full transition-all ${
                      idx === testimonialIdx
                        ? 'w-6 bg-[#3E2723]'
                        : 'w-2 bg-[#3E2723]/25 hover:bg-[#3E2723]/45'
                    }`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() =>
                  setTestimonialIdx((prev) => (prev + 1) % SAMPLE_TESTIMONIALS.length)
                }
                aria-label="Next testimonial"
                className="w-10 h-10 rounded-full border border-[#3E2723]/20 flex items-center justify-center text-[#3E2723] hover:bg-[#F8F3E9] transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* I. Instagram / Social Media Section */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-[#6F4E37] mb-2">
              {CAFE_CONFIG.instagramHandle}
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#3E2723]">
              Coffee, Moments & Memories.
            </h2>
          </div>
          <a
            href={CAFE_CONFIG.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[#3E2723]/25 text-sm font-semibold text-[#3E2723] hover:bg-[#3E2723] hover:text-white transition-colors whitespace-nowrap self-start sm:self-auto"
          >
            <Instagram className="w-4 h-4" />
            Follow Us
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {GALLERY_SHOTS.map((shot, idx) => (
            <a
              key={idx}
              href={CAFE_CONFIG.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group aspect-square rounded-xl overflow-hidden bg-[#EFE6D5] block"
            >
              <SafeImage
                src={shot.src}
                alt={shot.alt}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </a>
          ))}
        </div>
      </section>

      {/* J. Newsletter Section */}
      <section className="pb-16 sm:pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#3E2723]/10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-2">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#6F4E37]">
              Cafe Dispatch
            </p>
            <h2 className="font-display text-3xl font-semibold text-[#3E2723]">
              Stay Brewed With Us.
            </h2>
            <p className="text-sm sm:text-base text-[#242424]/75 leading-relaxed">
              Get exclusive offers, new drink launches, and cafe updates straight to your inbox.
            </p>
          </div>

          <div className="lg:col-span-6">
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email address"
                aria-label="Email address for newsletter"
                className="flex-1 px-4 py-3 rounded-lg border border-[#3E2723]/20 bg-[#F8F3E9]/50 text-sm focus:outline-none focus:border-[#3E2723]"
              />
              <button
                type="submit"
                disabled={newsletterStatus.type === 'loading'}
                className="px-6 py-3 rounded-lg bg-[#3E2723] text-white text-sm font-semibold hover:bg-[#6F4E37] disabled:opacity-60 transition-colors whitespace-nowrap"
              >
                {newsletterStatus.type === 'loading' ? 'Saving...' : 'Subscribe'}
              </button>
            </form>
            {newsletterStatus.type === 'success' && (
              <p className="text-xs text-emerald-700 font-medium mt-2.5">
                {newsletterStatus.message}
              </p>
            )}
            {newsletterStatus.type === 'error' && (
              <p className="text-xs text-red-700 font-medium mt-2.5">
                {newsletterStatus.message}
              </p>
            )}
            <p className="text-[11px] text-[#242424]/55 mt-2">
              Verified via Google sign-in and stored securely in Kaka Cafe&apos;s subscriber database.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
