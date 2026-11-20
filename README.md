# Kaka Cafe

A full-stack website for **Kaka Cafe** — browse the menu, customize drinks, add to cart, check out, track orders, and manage everything from an admin dashboard. Built with React, TypeScript, and Firebase.

## Features

- **Home, Menu & Product pages** — browse drinks/snacks by category, view details, customize size/milk/sugar/toppings/extra shots
- **Cart & Checkout** — live cart drawer, delivery fee + GST calculation, WhatsApp-based ordering
- **Orders** — track order status
- **About / Contact** — cafe info, hours, location, socials
- **Admin Dashboard** — manage orders/menu from one place
- **Cinematic scroll background** — a coffee-making video whose playback frame is driven by scroll position instead of autoplay, visible behind every section of the site
- **Firebase-backed** — Firestore for data, Firebase Auth (Google sign-in) for the newsletter/orders flow

## Tech Stack

- **React 19** + **TypeScript**
- **Vite 8** (build tool)
- **Tailwind CSS 4**
- **Firebase** (Firestore, Auth)
- **Motion** (animations)
- **Lucide React** (icons)

## Getting Started

**Prerequisites:** Node.js **22+** (Vite 8's rolldown bundler requires it). If you use [nvm](https://github.com/nvm-sh/nvm), this repo includes an `.nvmrc`:

```bash
nvm use
```

Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

The app runs at `http://localhost:3000` by default.

Other scripts:

```bash
npm run build     # production build
npm run preview   # preview the production build
npm run lint      # type-check with tsc
```

## Configuration

Firebase project config lives in `firebase-applet-config.json` (safe to commit — it's the public client config, not a secret). Firestore security rules are in `firestore.rules`.

Business details (phone, WhatsApp number, address, hours, pricing) are configured in [`src/config/cafeConfig.ts`](src/config/cafeConfig.ts) — update the placeholder contact details there before going live.

## Project Structure

```
src/
  pages/        Route-level pages (Home, Menu, Cart, Checkout, Orders, About, Contact, Admin)
  components/   Shared UI (Navbar, Footer, CartDrawer, ProductCard, ScrollVideoBackground, ...)
  context/      App-wide state (StoreContext)
  services/     Firestore data access
  config/       Cafe business config & product customization options
  lib/          Firebase client setup
  utils/        Pricing helpers
public/assets/  Images and video assets
```
