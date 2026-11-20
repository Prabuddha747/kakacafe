import React from 'react';
import { ArrowRight, Award, Coffee, Heart } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { CAFE_IMAGES } from '../data/assets';
import { SafeImage } from '../components/SafeImage';

export function AboutPage() {
  const { navigate } = useStore();

  return (
    <div className="pt-24 sm:pt-28 pb-20">
      {/* Hero Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <div className="lg:col-span-6 space-y-6">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#6F4E37]">
              Our Story · Kaka Cafe
            </p>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[#3E2723] leading-tight">
              More Than Coffee. It&apos;s an Experience.
            </h1>
            <p className="text-base text-[#242424]/80 leading-relaxed">
              Born from a simple belief that great coffee should feel warm, unhurried, and deeply
              memorable, Kaka Cafe partners directly with shade-grown estates in Chikmagalur and
              Coorg.
            </p>
            <p className="text-base text-[#242424]/80 leading-relaxed">
              Every morning begins with dial-in tastings, warm Normandy-butter croissants leaving
              the oven, and baristas crafting each cappuccino, iced cold coffee, and spiced masala
              chai to order.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/menu')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#3E2723] text-white text-sm font-semibold hover:bg-[#6F4E37] transition-colors"
              >
                Explore Our Menu
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => navigate('/contact')}
                className="px-6 py-3 rounded-lg border border-[#3E2723]/25 text-[#3E2723] text-sm font-semibold hover:bg-[#EFE6D5] transition-colors"
              >
                Visit the Cafe
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 rounded-2xl overflow-hidden bg-[#EFE6D5] aspect-[4/3]">
            <SafeImage
              src={CAFE_IMAGES.heroEspressoBar}
              alt="Kaka Cafe espresso counter and morning sunlight"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Craft Pillars */}
      <section className="bg-[#EFE6D5]/60 border-y border-[#3E2723]/10 py-16 sm:py-20 mb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-7 border border-[#3E2723]/10 space-y-3">
            <Coffee className="w-6 h-6 text-[#3E2723]" />
            <h2 className="font-display text-xl font-semibold text-[#3E2723]">
              Single-Estate Sourcing
            </h2>
            <p className="text-sm text-[#242424]/75 leading-relaxed">
              100% washed and honey-processed Indian Arabica beans harvested above 1,200 meters for
              clean caramel sweetness and silky body.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-7 border border-[#3E2723]/10 space-y-3">
            <Award className="w-6 h-6 text-[#3E2723]" />
            <h2 className="font-display text-xl font-semibold text-[#3E2723]">
              Honest Ingredients
            </h2>
            <p className="text-sm text-[#242424]/75 leading-relaxed">
              No artificial syrups or shortcuts. House-simmered salted caramel, stone-ground Uji
              matcha, real Belgian cocoa, and fresh whole spices.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-7 border border-[#3E2723]/10 space-y-3">
            <Heart className="w-6 h-6 text-[#3E2723]" />
            <h2 className="font-display text-xl font-semibold text-[#3E2723]">
              Built for Community
            </h2>
            <p className="text-sm text-[#242424]/75 leading-relaxed">
              Designed as a welcoming third space for morning rituals, creative studio sessions,
              and catching up over warm pastries.
            </p>
          </div>
        </div>
      </section>

      {/* Bakery & Atmosphere */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 rounded-2xl overflow-hidden bg-[#EFE6D5] aspect-[4/3]">
            <SafeImage
              src={CAFE_IMAGES.bakeryLifestyle}
              alt="Fresh croissants and pour-over coffee at Kaka Cafe"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="lg:col-span-6 space-y-4">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#6F4E37]">
              Morning Bakehouse
            </p>
            <h2 className="font-display text-3xl font-semibold text-[#3E2723]">
              Small-Batch Roasts & Laminated Pastries
            </h2>
            <p className="text-base text-[#242424]/80 leading-relaxed">
              Whether you prefer a bold double espresso at sunrise or an indulgent roasted hazelnut
              frappe in the afternoon, every pairing at Kaka Cafe is balanced to bring you your
              daily dose of happiness.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
