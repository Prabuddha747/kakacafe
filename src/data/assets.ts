import heroEspressoBar from '../assets/images/hero_kaka_espresso_bar_1794576875710.jpg';
import cappuccinoClassic from '../assets/images/drink_cappuccino_classic_1794576875262.jpg';
import classicLatte from '../assets/images/drink_classic_latte_1794576875489.jpg';
import icedColdCoffee from '../assets/images/drink_iced_cold_coffee_1794576874037.jpg';
import caramelMacchiato from '../assets/images/drink_caramel_macchiato_1794576876264.jpg';
import espressoMocha from '../assets/images/drink_espresso_mocha_1794576877061.jpg';
import frappeMilkshake from '../assets/images/drink_frappe_milkshake_1794576876546.jpg';
import matchaChaiTea from '../assets/images/drink_matcha_chai_tea_1794576875623.jpg';
import bakeryLifestyle from '../assets/images/cafe_bakery_lifestyle_1794576877048.jpg';
import aboutInterior from '../assets/images/about_cafe_interior_1794576878949.jpg';

export const CAFE_IMAGES = {
  heroEspressoBar,
  cappuccinoClassic,
  classicLatte,
  icedColdCoffee,
  caramelMacchiato,
  espressoMocha,
  frappeMilkshake,
  matchaChaiTea,
  bakeryLifestyle,
  aboutInterior,
} as const;

export const IMAGE_PRESET_OPTIONS = [
  { label: 'Artisanal Cappuccino', value: cappuccinoClassic },
  { label: 'Classic Silky Latte', value: classicLatte },
  { label: 'Iced Cold Coffee', value: icedColdCoffee },
  { label: 'Caramel Macchiato', value: caramelMacchiato },
  { label: 'Mocha & Espresso', value: espressoMocha },
  { label: 'Frappe & Milkshake', value: frappeMilkshake },
  { label: 'Matcha & Masala Chai', value: matchaChaiTea },
  { label: 'Croissants & Bakery', value: bakeryLifestyle },
  { label: 'Espresso Bar Hero', value: heroEspressoBar },
];
