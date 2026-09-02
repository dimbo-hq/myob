'use client';

import React, { useState } from 'react';
import { 
  SignInButton, 
  SignUpButton 
} from '@clerk/nextjs';
import { 
  ArrowRight, 
  Check, 
  Sparkles, 
  Mail, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  QrCode, 
  ShieldCheck, 
  Database,
  Layers,
  Store,
  Clock,
  ShoppingCart,
  TrendingDown,
  Boxes,
  Zap
} from 'lucide-react';
import { motion } from 'motion/react';

export const LandingPage: React.FC = () => {
  const [demoTab, setDemoTab] = useState<'expiry' | 'inventory' | 'pos'>('expiry');
  const [demoDiscount, setDemoDiscount] = useState<number>(30);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitted(true);
    setTimeout(() => {
      setContactForm({ name: '', email: '', phone: '', message: '' });
      setContactSubmitted(false);
    }, 4000);
  };

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen text-zinc-100 font-sans selection:bg-white/20 selection:text-white overflow-x-hidden">
      {/* 1. FIXED ULTRA-HD DARK CHROMATIC IRIDESCENT BACKGROUND */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat pointer-events-none" 
        style={{ backgroundImage: `url('/images/landing-bg.jpg')` }}
      />
      {/* Subtle depth gradient overlay to ensure razor-sharp typography contrast */}
      <div className="fixed inset-0 z-0 bg-black/30 pointer-events-none" />

      {/* 2. FLOATING FROSTED GLASS NAVBAR */}
      <header className="sticky top-4 z-50 max-w-5xl mx-auto px-4 w-full">
        <nav className="rounded-2xl border border-white/[0.1] bg-black/40 backdrop-blur-xl px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-2xl transition-all">
          {/* Brand Logo & Tagline */}
          <div 
            className="flex items-center gap-2.5 cursor-pointer group" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/[0.15] bg-white/[0.08] backdrop-blur-md group-hover:border-white/30 transition-colors">
              <Store className="h-4 w-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-black tracking-tight text-white lowercase font-heading leading-tight">
                myob
              </span>
              <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider leading-none hidden sm:block">
                Mind Your Own Business
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-7 text-xs font-medium text-zinc-300">
            <button 
              onClick={() => scrollTo('features')} 
              className="hover:text-white transition-colors cursor-pointer"
            >
              Features
            </button>
            <button 
              onClick={() => scrollTo('pricing')} 
              className="hover:text-white transition-colors cursor-pointer"
            >
              Pricing
            </button>
            <button 
              onClick={() => scrollTo('about')} 
              className="hover:text-white transition-colors cursor-pointer"
            >
              About
            </button>
            <button 
              onClick={() => scrollTo('contact')} 
              className="hover:text-white transition-colors cursor-pointer"
            >
              Contact
            </button>
          </div>

          {/* Auth Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <SignInButton mode="modal">
              <button className="text-xs font-medium text-zinc-300 hover:text-white transition-colors px-2 py-1 cursor-pointer">
                Sign In
              </button>
            </SignInButton>

            <SignUpButton mode="modal">
              <button className="rounded-xl bg-white px-3.5 sm:px-4 py-1.5 text-xs font-semibold text-zinc-950 hover:bg-zinc-200 active:scale-95 transition-all shadow-md cursor-pointer">
                Open Store
              </button>
            </SignUpButton>
          </div>
        </nav>
      </header>

      {/* 3. HERO SECTION */}
      <section className="relative z-10 min-h-[84vh] flex flex-col items-center justify-center text-center px-4 sm:px-6 pt-16 pb-24 max-w-5xl mx-auto space-y-6">
        {/* Release Pill Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.06] backdrop-blur-md px-4 py-1 text-xs text-zinc-300 shadow-lg"
        >
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-white font-mono uppercase tracking-wider">myob</span>
          <span className="text-zinc-500">•</span>
          <span className="text-zinc-300 font-sans">Next-Gen Retail & Supermarket OS</span>
        </motion.div>

        {/* Main Tagline Headline with Editorial Italic Serif */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight text-white leading-[1.04]"
        >
          Mind.{' '}
          <span className="font-serif italic font-normal text-white">Your Own.</span>{' '}
          Business.
        </motion.h1>

        {/* Meaningful Subtitle for MYOB */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          className="text-sm sm:text-base md:text-lg text-zinc-300/90 max-w-2xl mx-auto font-normal leading-relaxed"
        >
          Stop losing money to expired supermarket stock and slow checkout counters. <span className="text-white font-semibold">myob</span> auto-calculates clearance markdowns before goods spoil, tracks 50,000+ SKUs in real time, and bills shoppers on UPI in seconds.
        </motion.p>

        {/* Hero CTA Button with Glowing Halo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
          className="pt-2 flex flex-col items-center gap-4"
        >
          <SignUpButton mode="modal">
            <button className="hero-glow-btn px-8 py-3.5 rounded-full text-xs sm:text-sm font-bold tracking-wider text-white uppercase cursor-pointer flex items-center gap-2.5 shadow-2xl">
              <span>LAUNCH YOUR STORE WORKSPACE</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </SignUpButton>

          {/* Social Proof Feature Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-[11px] text-zinc-400 font-mono pt-1">
            <span>✓ Perishable FIFO Clearance AI</span>
            <span>•</span>
            <span>✓ Optical Barcode & UPI POS</span>
            <span>•</span>
            <span>✓ Up to 50k SKU Scale</span>
            <span>•</span>
            <span>✓ Multi-Tenant Cloud Sync</span>
          </div>
        </motion.div>
      </section>

      {/* 4. FEATURES SECTION (INTERACTIVE LIVE SUPERMARKET CORE) */}
      <section id="features" className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-20 scroll-mt-24">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-heading">
            Engineered for Retail Operations
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-zinc-300/90 max-w-2xl mx-auto leading-relaxed">
            Generic inventory tools don&apos;t understand perishable batch shelf-life. myob was built from day one around perishable turnover, automated stepped markdowns, and lightning-fast cashiering.
          </p>
        </div>

        {/* Interactive Glassmorphic Demo Window */}
        <div className="relative rounded-3xl border border-white/[0.1] bg-black/45 backdrop-blur-2xl overflow-hidden shadow-2xl">
          {/* Header tab controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between border-b border-white/[0.08] px-5 py-3 bg-zinc-950/70 gap-3">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                <div className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                <div className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
              </div>
              <span className="text-[11px] text-zinc-400 font-mono ml-2">myob • Supermarket Operations Simulator</span>
            </div>

            {/* Tab switcher */}
            <div className="flex gap-1 bg-zinc-900/90 p-1 rounded-xl border border-white/[0.06]">
              <button
                onClick={() => setDemoTab('expiry')}
                className={`px-3.5 py-1 text-xs rounded-lg transition-all cursor-pointer ${
                  demoTab === 'expiry' ? 'bg-zinc-800 text-white font-semibold shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Expiry Radar & Markdowns
              </button>
              <button
                onClick={() => setDemoTab('inventory')}
                className={`px-3.5 py-1 text-xs rounded-lg transition-all cursor-pointer ${
                  demoTab === 'inventory' ? 'bg-zinc-800 text-white font-semibold shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Master Inventory
              </button>
              <button
                onClick={() => setDemoTab('pos')}
                className={`px-3.5 py-1 text-xs rounded-lg transition-all cursor-pointer ${
                  demoTab === 'pos' ? 'bg-zinc-800 text-white font-semibold shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Express POS Counter
              </button>
            </div>
          </div>

          {/* Demo Content: Expiry Radar */}
          {demoTab === 'expiry' && (
            <div className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/[0.06] pb-3.5 gap-2">
                <div>
                  <div className="text-xs font-bold text-white font-heading">Automated Stepped Clearance Markdowns</div>
                  <div className="text-[11px] text-zinc-400">Dynamic discounting engine protects gross margins before batch expiration</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-zinc-400 font-mono">Test Markdown:</span>
                  {[20, 30, 50].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => setDemoDiscount(pct)}
                      className={`px-2.5 py-0.5 text-xs font-mono rounded-lg border transition-all cursor-pointer ${
                        demoDiscount === pct
                          ? 'border-amber-400/60 bg-amber-500/20 text-amber-300 font-bold shadow-sm'
                          : 'border-white/[0.06] bg-zinc-900/60 text-zinc-400 hover:text-white'
                      }`}
                    >
                      -{pct}%
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="rounded-2xl border border-white/[0.06] bg-zinc-900/50 p-4 space-y-3">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded font-mono">DAIR-00102</span>
                    <span className="text-rose-400 bg-rose-950/70 px-2 py-0.5 rounded-full font-semibold border border-rose-800/50">Expires in 1d</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white font-heading">Amul Desi Cow Milk 1L</h4>
                    <div className="text-[11px] text-zinc-400 font-mono">Batch #BAT-402 • 35 bottles</div>
                  </div>
                  <div className="rounded-xl bg-zinc-950/80 p-3 flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-zinc-500 block">Retail MRP</span>
                      <span className="line-through text-zinc-500">₹65.00</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-amber-400 block font-sans">-{demoDiscount}% Markdown</span>
                      <span className="text-emerald-400 font-bold">₹{(65 * (1 - demoDiscount / 100)).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/[0.06] bg-zinc-900/50 p-4 space-y-3">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded font-mono">BAKE-00214</span>
                    <span className="text-amber-400 bg-amber-950/70 px-2 py-0.5 rounded-full font-semibold border border-amber-800/50">Expires in 2d</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white font-heading">Whole Wheat Atta Bread 400g</h4>
                    <div className="text-[11px] text-zinc-400 font-mono">Batch #BAT-881 • 18 loaves</div>
                  </div>
                  <div className="rounded-xl bg-zinc-950/80 p-3 flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-zinc-500 block">Retail MRP</span>
                      <span className="line-through text-zinc-500">₹45.00</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-amber-400 block font-sans">-{demoDiscount}% Markdown</span>
                      <span className="text-emerald-400 font-bold">₹{(45 * (1 - demoDiscount / 100)).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/[0.06] bg-zinc-900/50 p-4 space-y-3">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded font-mono">PROD-00045</span>
                    <span className="text-amber-400 bg-amber-950/70 px-2 py-0.5 rounded-full font-semibold border border-amber-800/50">Expires in 3d</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white font-heading">Alphonso Mangoes 1kg Pack</h4>
                    <div className="text-[11px] text-zinc-400 font-mono">Batch #BAT-119 • 24 kg</div>
                  </div>
                  <div className="rounded-xl bg-zinc-950/80 p-3 flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-zinc-500 block">Retail MRP</span>
                      <span className="line-through text-zinc-500">₹450.00</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-amber-400 block font-sans">-{demoDiscount}% Markdown</span>
                      <span className="text-emerald-400 font-bold">₹{(450 * (1 - demoDiscount / 100)).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Demo Content: Master Inventory */}
          {demoTab === 'inventory' && (
            <div className="p-5 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-white/[0.08] text-zinc-400 text-[11px] font-mono uppercase">
                  <tr>
                    <th className="pb-2.5 px-3">Product</th>
                    <th className="pb-2.5 px-3">Department</th>
                    <th className="pb-2.5 px-3">Stock Buffer</th>
                    <th className="pb-2.5 px-3">Wholesale</th>
                    <th className="pb-2.5 px-3">Retail Price</th>
                    <th className="pb-2.5 px-3 text-right">Gross Margin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] text-zinc-300">
                  <tr>
                    <td className="py-3 px-3 font-semibold text-white">Tata Royal Basmati Rice 5kg</td>
                    <td className="py-3 px-3 text-zinc-400">Pantry & Grains</td>
                    <td className="py-3 px-3 font-mono text-emerald-400">42 bags (Optimal)</td>
                    <td className="py-3 px-3 font-mono">₹380.00</td>
                    <td className="py-3 px-3 font-mono font-bold text-white">₹540.00</td>
                    <td className="py-3 px-3 font-mono text-emerald-400 text-right font-bold">42%</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-semibold text-white">Amul Pure Desi Ghee 1L Tin</td>
                    <td className="py-3 px-3 text-zinc-400">Dairy & Spreads</td>
                    <td className="py-3 px-3 font-mono text-amber-400">6 tins (Low Stock)</td>
                    <td className="py-3 px-3 font-mono">₹540.00</td>
                    <td className="py-3 px-3 font-mono font-bold text-white">₹680.00</td>
                    <td className="py-3 px-3 font-mono text-emerald-400 text-right font-bold">26%</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-semibold text-white">Organic Himalayan Walnuts 500g</td>
                    <td className="py-3 px-3 text-zinc-400">Dry Fruits</td>
                    <td className="py-3 px-3 font-mono text-emerald-400">28 packs (Optimal)</td>
                    <td className="py-3 px-3 font-mono">₹390.00</td>
                    <td className="py-3 px-3 font-mono font-bold text-white">₹590.00</td>
                    <td className="py-3 px-3 font-mono text-emerald-400 text-right font-bold">51%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Demo Content: Express POS */}
          {demoTab === 'pos' && (
            <div className="p-6 grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
              <div className="sm:col-span-7 space-y-3">
                <div className="text-xs font-bold text-white font-heading">Live Scanned Basket • Express Lane #1</div>
                <div className="rounded-2xl border border-white/[0.08] bg-zinc-900/60 p-4 space-y-2.5 text-xs">
                  <div className="flex justify-between items-center text-zinc-300">
                    <span>1x Amul Desi Cow Milk 1L (-30% Clearance)</span>
                    <span className="font-mono font-semibold text-white">₹45.50</span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-300">
                    <span>1x Tata Royal Basmati Rice 5kg</span>
                    <span className="font-mono font-semibold text-white">₹540.00</span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-300">
                    <span>2x Whole Wheat Sourdough (-20% Markdown)</span>
                    <span className="font-mono font-semibold text-white">₹192.00</span>
                  </div>
                  <div className="border-t border-white/[0.08] pt-2.5 flex justify-between items-center font-bold text-sm text-white">
                    <span>Total Payable (GST Included)</span>
                    <span className="font-mono text-emerald-400 text-base">₹777.50</span>
                  </div>
                </div>
              </div>

              <div className="sm:col-span-5 rounded-2xl border border-white/[0.08] bg-zinc-950/90 p-5 text-center space-y-2.5">
                <div className="text-xs text-zinc-300 font-mono font-semibold">Dynamic UPI QR Code</div>
                <div className="h-28 w-28 mx-auto bg-white rounded-xl p-2 flex items-center justify-center shadow-lg">
                  <QrCode className="h-24 w-24 text-zinc-950" />
                </div>
                <div className="text-[10px] text-zinc-400 font-mono">Google Pay • PhonePe • Paytm • BHIM</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 5. PLANS AND PRICING SECTION (DOT-GRID RETAIL PLANS) */}
      <section id="pricing" className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-20 scroll-mt-24">
        {/* Section Header */}
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight font-heading">
            Plans and Pricing
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-zinc-300/90 max-w-xl mx-auto font-normal leading-relaxed">
            From independent single-counter grocery stores to high-volume multi-register supermarket chains. Flexible pricing built for retail margins.
          </p>
        </div>

        {/* 5-Plan Grid */}
        <div className="space-y-4">
          {/* Top Row: 2 Primary Cards (Pro Store & Starter Free) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: PRO STORE (Popular) */}
            <div className="relative rounded-2xl border border-white/[0.14] bg-black/45 backdrop-blur-xl bg-dot-grid p-6 space-y-6 shadow-2xl transition-all hover:border-white/[0.22]">
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-white/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white border border-white/15">
                  PRO STORE
                </span>
                <span className="flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-amber-300 border border-amber-500/30">
                  <Sparkles className="h-3 w-3 text-amber-300" />
                  <span>Popular Choice</span>
                </span>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-white font-mono">₹1,499</span>
                <span className="text-xs text-zinc-400 font-mono">/month</span>
              </div>

              <ul className="space-y-2.5 text-xs text-zinc-200">
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Up to 10,000 SKUs with automated batch tracking</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>AI Stepped Clearance Markdown Recommendations</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Smart Upsell & Cross-Sell counter recommendations</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>1-Click WhatsApp digital e-receipts & thermal PDF</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Daily shift-close Z-Report & cash drawer float audit</span>
                </li>
              </ul>

              <SignUpButton mode="modal">
                <button className="w-full rounded-xl bg-white py-2.5 text-xs font-bold text-zinc-950 hover:bg-zinc-200 active:scale-95 transition-all shadow-md cursor-pointer">
                  Upgrade to Pro Store
                </button>
              </SignUpButton>
            </div>

            {/* Card 2: STARTER (Free) */}
            <div className="relative rounded-2xl border border-white/[0.08] bg-black/35 backdrop-blur-xl bg-dot-grid p-6 space-y-6 shadow-2xl transition-all hover:border-white/[0.16]">
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-white/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-zinc-300 border border-white/10">
                  STARTER FREE
                </span>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-white font-mono">₹0</span>
                <span className="text-xs text-zinc-400 font-mono">/month</span>
              </div>

              <ul className="space-y-2.5 text-xs text-zinc-300">
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
                  <span>Up to 500 catalog inventory items</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
                  <span>Fast express barcode POS checkout register</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
                  <span>Dynamic UPI QR code payments (GPay/PhonePe)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
                  <span>Standard FIFO batch expiry alert notifications</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
                  <span>Cloud synchronization via MongoDB Atlas</span>
                </li>
              </ul>

              <SignUpButton mode="modal">
                <button className="w-full rounded-xl border border-white/[0.15] bg-white/[0.05] py-2.5 text-xs font-semibold text-white hover:bg-white/[0.1] active:scale-95 transition-all cursor-pointer">
                  Start Free Store
                </button>
              </SignUpButton>
            </div>
          </div>

          {/* Middle Row: 2 Secondary Cards (Retail Team & Supermarket Business) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 3: RETAIL TEAM */}
            <div className="relative rounded-2xl border border-white/[0.08] bg-black/35 backdrop-blur-xl bg-dot-grid p-6 space-y-6 shadow-2xl transition-all hover:border-white/[0.16]">
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-white/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-zinc-300 border border-white/10">
                  RETAIL TEAM
                </span>
                <SignUpButton mode="modal">
                  <button className="rounded-xl border border-white/[0.15] bg-white/[0.05] px-3.5 py-1 text-xs font-semibold text-white hover:bg-white/[0.1] active:scale-95 transition-all cursor-pointer">
                    Select Plan
                  </button>
                </SignUpButton>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-white font-mono">₹2,999</span>
                <span className="text-xs text-zinc-400 font-mono">/month</span>
              </div>

              <ul className="space-y-2.5 text-xs text-zinc-300">
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
                  <span>Up to 35,000 SKUs across multiple checkout lanes</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
                  <span>Cashier float reconciliation & discrepancy alerts</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
                  <span>Automated low-stock supplier purchase orders</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
                  <span>Customer CRM & VIP loyalty points tracking</span>
                </li>
              </ul>
            </div>

            {/* Card 4: SUPERMARKET BUSINESS */}
            <div className="relative rounded-2xl border border-white/[0.08] bg-black/35 backdrop-blur-xl bg-dot-grid p-6 space-y-6 shadow-2xl transition-all hover:border-white/[0.16]">
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-white/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-zinc-300 border border-white/10">
                  SUPERMARKET BUSINESS
                </span>
                <SignUpButton mode="modal">
                  <button className="rounded-xl border border-white/[0.15] bg-white/[0.05] px-3.5 py-1 text-xs font-semibold text-white hover:bg-white/[0.1] active:scale-95 transition-all cursor-pointer">
                    Select Plan
                  </button>
                </SignUpButton>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-white font-mono">₹6,999</span>
                <span className="text-xs text-zinc-400 font-mono">/month</span>
              </div>

              <ul className="space-y-2.5 text-xs text-zinc-300">
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
                  <span>Up to 100,000 SKUs with Chunked Cloud Streaming</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
                  <span>Offline-resilient IndexedDB browser auto-sync</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
                  <span>Optical barcode laser & digital scale auto-tare</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
                  <span>Complete historical stock audit trail & analytics</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Row: Full-Width Enterprise Card */}
          <div className="relative rounded-2xl border border-white/[0.08] bg-black/35 backdrop-blur-xl bg-dot-grid p-6 space-y-4 shadow-2xl transition-all hover:border-white/[0.16]">
            <div className="flex items-center justify-between">
              <span className="rounded-md bg-white/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-zinc-300 border border-white/10">
                ENTERPRISE CHAIN
              </span>
              <button 
                onClick={() => scrollTo('contact')}
                className="rounded-xl border border-white/[0.15] bg-white/[0.05] px-4 py-1.5 text-xs font-semibold text-white hover:bg-white/[0.1] active:scale-95 transition-all cursor-pointer"
              >
                Contact Sales
              </button>
            </div>

            <div className="text-3xl font-black text-white font-heading">
              Custom Quote
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-zinc-300 pt-1">
              <div className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-zinc-400 shrink-0" />
                <span>Multi-outlet centralized warehouse distribution</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-zinc-400 shrink-0" />
                <span>Dedicated MongoDB Atlas cluster & enterprise SAML SSO</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-zinc-400 shrink-0" />
                <span>Custom ERP data pipeline & bulk CSV batch loaders</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-zinc-400 shrink-0" />
                <span>24/7 dedicated support SLA & on-site staff training</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. ABOUT US SECTION (MATCHING VIDEO FRAME 12 WITH CANVAS CORNER HANDLES) */}
      <section id="about" className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-20 scroll-mt-24">
        {/* Section Header */}
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight font-heading">
            About myob
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-zinc-300/90 max-w-xl mx-auto font-normal leading-relaxed">
            Why we built Mind Your Own Business for modern retail.
          </p>
        </div>

        {/* Card with 4 White Corner Selection Bounding Box Handles */}
        <div className="relative rounded-3xl border border-white/[0.15] bg-black/45 backdrop-blur-2xl bg-dot-grid p-8 sm:p-12 shadow-2xl space-y-6">
          {/* 4 White Corner Square Handles (Canvas Style) */}
          <span className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white shadow-sm pointer-events-none" />
          <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white shadow-sm pointer-events-none" />
          <span className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white shadow-sm pointer-events-none" />
          <span className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white shadow-sm pointer-events-none" />

          <p className="text-base sm:text-xl font-medium text-zinc-100 leading-relaxed font-sans">
            We believe independent supermarkets, grocery stores, and retail businesses deserve software that actually protects their bottom line. Traditional retail software is notoriously clunky, slow, and completely blind to perishable shelf-life.
          </p>

          <p className="text-base sm:text-xl font-medium text-zinc-300 leading-relaxed font-sans">
            <span className="text-white font-bold">myob (Mind Your Own Business)</span> replaces legacy desktop billing with an ultra-fast retail operating system. By combining predictive FIFO expiry clearance markdowns, instant optical barcode cashiering, and automated vendor purchase orders, myob empowers store owners to run with speed, clarity, and zero stock waste.
          </p>
        </div>
      </section>

      {/* 7. GET IN TOUCH (CONTACT) SECTION (MATCHING VIDEO FRAME 14 WITH CORNER CROSSHAIRS) */}
      <section id="contact" className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-20 pb-32 scroll-mt-24">
        {/* Card with 4 Corner Crosshairs */}
        <div className="relative rounded-3xl border border-white/[0.15] bg-black/45 backdrop-blur-2xl bg-dot-grid p-8 sm:p-12 shadow-2xl">
          {/* 4 White Crosshair '+' Markers at the Corners */}
          <span className="absolute -top-3 -left-3 text-white text-lg font-mono select-none font-light leading-none pointer-events-none">+</span>
          <span className="absolute -top-3 -right-3 text-white text-lg font-mono select-none font-light leading-none pointer-events-none">+</span>
          <span className="absolute -bottom-3 -left-3 text-white text-lg font-mono select-none font-light leading-none pointer-events-none">+</span>
          <span className="absolute -bottom-3 -right-3 text-white text-lg font-mono select-none font-light leading-none pointer-events-none">+</span>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
            {/* Left Column: Contact Information */}
            <div className="md:col-span-6 space-y-6">
              <div>
                <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-heading">
                  Get in touch
                </h3>
                <p className="text-xs sm:text-sm text-zinc-300/90 mt-2.5 leading-relaxed">
                  Have questions about migrating your store catalog, connecting barcode hardware, or setting up multi-lane POS? We do our best to respond within 1 business day.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                {/* Email Item */}
                <div className="flex items-center gap-3.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-zinc-300">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-zinc-400 font-heading">Email</div>
                    <div className="text-sm font-semibold text-white font-mono">hello@myob.store</div>
                  </div>
                </div>

                {/* Phone Item */}
                <div className="flex items-center gap-3.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-zinc-300">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-zinc-400 font-heading">Support Hotline</div>
                    <div className="text-sm font-semibold text-white font-mono">+91 (022) 2854-9000</div>
                  </div>
                </div>

                {/* Address Item */}
                <div className="flex items-center gap-3.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-zinc-300">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-zinc-400 font-heading">HQ Locations</div>
                    <div className="text-sm font-semibold text-white">Mumbai & Bengaluru, India</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Contact Form */}
            <div className="md:col-span-6">
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5 font-heading">
                    Your Name or Store Name
                  </label>
                  <input
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 transition-all font-sans"
                    placeholder="e.g. Rahul Sharma (Metro Supermarket)"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5 font-heading">
                    Business Email
                  </label>
                  <input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 transition-all font-sans"
                    placeholder="rahul@metrosupermarket.in"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5 font-heading">
                    Mobile Number (WhatsApp Enabled)
                  </label>
                  <input
                    type="tel"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 transition-all font-sans"
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5 font-heading">
                    How can we help your store?
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 transition-all font-sans resize-none"
                    placeholder="Tell us about your inventory size, number of registers, or current billing software..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-white py-2.5 text-xs sm:text-sm font-bold text-zinc-950 hover:bg-zinc-200 active:scale-95 transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  {contactSubmitted ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>Inquiry Sent! We will contact you shortly.</span>
                    </>
                  ) : (
                    <span>Send Inquiry</span>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* 8. MINIMALIST FOOTER */}
      <footer className="relative z-10 border-t border-white/[0.08] bg-black/50 backdrop-blur-xl py-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white lowercase">myob</span>
            <span>•</span>
            <span>Mind Your Own Business (Retail Intelligence OS)</span>
          </div>

          <div className="flex items-center gap-6 text-zinc-400">
            <button onClick={() => scrollTo('features')} className="hover:text-white transition-colors cursor-pointer">Features</button>
            <button onClick={() => scrollTo('pricing')} className="hover:text-white transition-colors cursor-pointer">Pricing</button>
            <button onClick={() => scrollTo('about')} className="hover:text-white transition-colors cursor-pointer">About</button>
            <button onClick={() => scrollTo('contact')} className="hover:text-white transition-colors cursor-pointer">Contact</button>
          </div>

          <div className="text-[11px] font-mono text-zinc-500">
            India Edition (INR ₹) • Multi-Tenant Atlas
          </div>
        </div>
      </footer>
    </div>
  );
};
