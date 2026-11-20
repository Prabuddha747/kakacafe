import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
} from 'lucide-react';
import { CAFE_CONFIG } from '../config/cafeConfig';
import { useStore } from '../context/StoreContext';
import { submitContactMessage } from '../services/firestoreService';

export function ContactPage() {
  const { user, signInWithGoogle } = useStore();

  const [name, setName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  const [status, setStatus] = useState<{
    type: 'idle' | 'loading' | 'success' | 'error';
    text?: string;
  }>({ type: 'idle' });

  const validate = (): string | null => {
    if (name.trim().length < 2) return 'Please enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return 'Please enter a valid email address.';
    }
    if (phone.replace(/\D/g, '').length < 7) {
      return 'Please enter a valid phone number.';
    }
    if (message.trim().length < 5) {
      return 'Please enter a brief message (at least 5 characters).';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setStatus({ type: 'error', text: err });
      return;
    }

    setStatus({ type: 'loading' });
    try {
      let currentUser = user;
      if (!currentUser) {
        currentUser = await signInWithGoogle();
      }
      if (!currentUser) {
        setStatus({
          type: 'error',
          text: 'Please sign in with Google to submit your inquiry, or message us directly on WhatsApp.',
        });
        return;
      }

      await submitContactMessage({
        userId: currentUser.uid,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        message: message.trim(),
      });

      setStatus({
        type: 'success',
        text: 'Message received! Our cafe manager will get back to you shortly.',
      });
      setMessage('');
    } catch {
      setStatus({
        type: 'error',
        text: 'Unable to save message right now. Please reach out via WhatsApp instead.',
      });
    }
  };

  const whatsappDirectUrl = `https://wa.me/${CAFE_CONFIG.whatsappNumber}?text=${encodeURIComponent(
    `Hello Kaka Cafe! ${name ? `My name is ${name}. ` : ''}${
      message || 'I would like to get in touch regarding your cafe.'
    }`
  )}`;

  return (
    <div className="pt-24 sm:pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mb-12">
        <p className="text-xs font-semibold tracking-widest uppercase text-[#6F4E37] mb-2">
          Get In Touch
        </p>
        <h1 className="font-display text-3xl sm:text-5xl font-semibold text-[#3E2723] mb-3">
          Visit or Message Kaka Cafe
        </h1>
        <p className="text-sm sm:text-base text-[#242424]/75 leading-relaxed">
          Have a catering request, feedback, or table inquiry? Write to us below or connect
          instantly on WhatsApp.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Info & Map Placeholder */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-[#3E2723]/10 space-y-5">
            <h2 className="font-display text-xl font-semibold text-[#3E2723]">
              Cafe Information
            </h2>

            <div className="space-y-4 text-sm text-[#242424]/80">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#6F4E37] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#3E2723]">Address</p>
                  <p>{CAFE_CONFIG.addressLine1}</p>
                  <p>{CAFE_CONFIG.addressLine2}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#6F4E37] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#3E2723]">Phone</p>
                  <p className="tabular-nums">{CAFE_CONFIG.displayPhone} (Placeholder)</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#6F4E37] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#3E2723]">Email</p>
                  <p>{CAFE_CONFIG.email} (Placeholder)</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#6F4E37] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#3E2723]">Opening Hours</p>
                  <p>{CAFE_CONFIG.hours.weekdays}</p>
                  <p>{CAFE_CONFIG.hours.weekends}</p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#3E2723]/10 flex flex-wrap gap-3">
              <a
                href={whatsappDirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1F6F4A] text-white text-xs font-semibold hover:bg-[#195a3c] transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Chat on WhatsApp
              </a>
              <a
                href={CAFE_CONFIG.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#3E2723]/20 text-[#3E2723] text-xs font-semibold hover:bg-[#F8F3E9] transition-colors"
              >
                <Instagram className="w-4 h-4" />
                Instagram
              </a>
            </div>
          </div>

          {/* Google Maps Embed Placeholder */}
          <div className="bg-[#EFE6D5] rounded-2xl p-6 border border-[#3E2723]/15 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#6F4E37]">
                Location Map Placeholder
              </span>
              <a
                href={CAFE_CONFIG.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#3E2723] hover:underline"
              >
                Open in Google Maps
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <div className="h-44 rounded-xl bg-white/70 border border-[#3E2723]/10 flex flex-col items-center justify-center text-center p-4">
              <MapPin className="w-7 h-7 text-[#3E2723] mb-2" />
              <p className="font-display text-base font-semibold text-[#3E2723]">
                Kaka Cafe Flagship Roastery
              </p>
              <p className="text-xs text-[#6F4E37] mt-1">
                {CAFE_CONFIG.addressLine1} · Replace with your live Google Maps iframe embed
              </p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-[#3E2723]/10">
          <h2 className="font-display text-2xl font-semibold text-[#3E2723] mb-2">
            Send Us a Message
          </h2>
          <p className="text-xs text-[#6F4E37] mb-6">
            Verified messages are stored directly in our cafe inbox for fast follow-up.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#3E2723] mb-1.5">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#3E2723]/20 text-sm focus:outline-none focus:border-[#3E2723]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#3E2723] mb-1.5">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#3E2723]/20 text-sm focus:outline-none focus:border-[#3E2723]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#3E2723] mb-1.5">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#3E2723]/20 text-sm focus:outline-none focus:border-[#3E2723]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#3E2723] mb-1.5">
                Message *
              </label>
              <textarea
                rows={5}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us how we can help..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#3E2723]/20 text-sm focus:outline-none focus:border-[#3E2723]"
              />
            </div>

            {status.type === 'success' && (
              <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                {status.text}
              </div>
            )}

            {status.type === 'error' && (
              <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                {status.text}
              </div>
            )}

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={status.type === 'loading'}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#3E2723] text-white text-sm font-semibold hover:bg-[#6F4E37] disabled:opacity-60 transition-colors"
              >
                <Send className="w-4 h-4" />
                {status.type === 'loading' ? 'Sending...' : 'Send Message'}
              </button>
              <a
                href={whatsappDirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-[#1F6F4A]/30 text-[#1F6F4A] text-sm font-semibold hover:bg-[#1F6F4A]/5 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Send via WhatsApp
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
