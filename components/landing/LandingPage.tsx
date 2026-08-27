'use client';

import React, { useState } from 'react';
import { 
  SignInButton, 
  SignUpButton 
} from '@clerk/nextjs';
import { 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  Flame, 
  Layers, 
  Package, 
  ShieldCheck, 
  ShoppingCart, 
  Sparkles, 
  Store, 
  Truck, 
  Zap, 
  ArrowRight, 
  Database, 
  FileSpreadsheet, 
  Users,
  QrCode,
  TrendingUp,
  Percent,
  Check,
  ChevronRight,
  Boxes,
  Lock,
  Cpu,
  Receipt,
  Activity
} from 'lucide-react';
import { motion } from 'motion/react';
import { formatINR } from '@/lib/currency';

export const LandingPage: React.FC = () => {
  const [activeWorkflow, setActiveWorkflow] = useState<'markdowns' | 'replenish' | 'pos' | 'analytics'>('markdowns');

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans selection:bg-emerald-950 selection:text-emerald-300 relative overflow-x-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-b from-emerald-500/10 via-cyan-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -left-48 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-2/3 -right-48 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navbar */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#09090b]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 via-zinc-900 to-zinc-950 border border-emerald-500/30 text-emerald-400 shadow-md">
              <Store className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2.5">
              <div className="flex flex-col">
                <span className="text-base font-extrabold tracking-tight text-white lowercase leading-none">
                  myob
                </span>
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest leading-tight mt-0.5">
                  Mind Your Own Business
                </span>
              </div>
              <span className="hidden sm:inline-block rounded-full bg-zinc-900 border border-white/[0.06] text-[10px] text-emerald-400 px-2 py-0.5 font-mono">
                Retail Intelligence OS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <SignInButton mode="modal">
              <button className="rounded-xl border border-white/[0.08] bg-zinc-900/80 px-4 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-800 hover:text-white transition-all cursor-pointer">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="flex items-center gap-1.5 rounded-xl bg-zinc-100 px-4 py-2 text-xs font-bold text-zinc-950 hover:bg-white active:scale-95 transition-all shadow-lg shadow-white/5 cursor-pointer">
                <span>Start Store Free</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </SignUpButton>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center space-y-7">
        {/* Release Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/30 px-4 py-1.5 text-xs text-emerald-300 backdrop-blur-md shadow-sm">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-white">myob</span>
          <span className="text-zinc-500">•</span>
          <span className="font-mono text-zinc-300">Mind Your Own Business</span>
          <span className="text-zinc-500">•</span>
          <span className="text-emerald-400 font-medium">India INR (₹) Retail Edition</span>
        </div>

        {/* Main Headline */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
            Mind Your Own Business. <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              We&apos;ll Run The Science Behind It.
            </span>
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed pt-1">
            The all-in-one operating system engineered for modern supermarkets, grocers, and retail chains. Real-time multi-tenant stock control, automated FIFO batch clearance AI, smart reorder POs, and sub-second POS checkout.
          </p>
        </div>

        {/* CTA Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
          <SignUpButton mode="modal">
            <button className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-7 py-3.5 text-sm font-bold text-zinc-950 hover:bg-emerald-300 active:scale-95 transition-all shadow-xl shadow-emerald-500/10 cursor-pointer">
              <span>Launch Your Store Workspace</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </SignUpButton>

          <SignInButton mode="modal">
            <button className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-zinc-900/80 px-6 py-3.5 text-sm font-medium text-zinc-200 hover:bg-zinc-800 hover:text-white transition-all cursor-pointer">
              <span>Sign In to Existing Store</span>
            </button>
          </SignInButton>
        </div>

        {/* Live System Trust Highlights */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400 pt-6">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Clerk Protected Auth</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Database className="h-4 w-4 text-cyan-400" />
            <span>Isolated Multi-Tenant MongoDB</span>
          </div>
          <div className="flex items-center gap-1.5">
            <FileSpreadsheet className="h-4 w-4 text-amber-400" />
            <span>50,000+ SKU Importer</span>
          </div>
          <div className="flex items-center gap-1.5">
            <QrCode className="h-4 w-4 text-purple-400" />
            <span>Instant UPI & Cash POS</span>
          </div>
        </div>
      </section>

      {/* Live Metrics Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          <div className="surface-card rounded-2xl p-4 border border-white/[0.06] bg-[#111114] space-y-1">
            <div className="text-[11px] text-zinc-500 font-medium">Active Asset Valuation</div>
            <div className="text-xl sm:text-2xl font-bold text-white font-mono">₹5.38 Cr+</div>
            <div className="text-[10px] text-emerald-400 font-medium">Real-time Retail Margins</div>
          </div>

          <div className="surface-card rounded-2xl p-4 border border-white/[0.06] bg-[#111114] space-y-1">
            <div className="text-[11px] text-zinc-500 font-medium">Perishable Clearance AI</div>
            <div className="text-xl sm:text-2xl font-bold text-emerald-400 font-mono">99.4%</div>
            <div className="text-[10px] text-zinc-400 font-medium">Zero Food Spoilage Target</div>
          </div>

          <div className="surface-card rounded-2xl p-4 border border-white/[0.06] bg-[#111114] space-y-1">
            <div className="text-[11px] text-zinc-500 font-medium">Catalogue Scalability</div>
            <div className="text-xl sm:text-2xl font-bold text-cyan-400 font-mono">50,000+</div>
            <div className="text-[10px] text-zinc-400 font-medium">Sub-second Query Latency</div>
          </div>

          <div className="surface-card rounded-2xl p-4 border border-white/[0.06] bg-[#111114] space-y-1">
            <div className="text-[11px] text-zinc-500 font-medium">Tenant Isolation</div>
            <div className="text-xl sm:text-2xl font-bold text-purple-400 font-mono">100%</div>
            <div className="text-[10px] text-zinc-400 font-medium">Encrypted MongoDB Atlas</div>
          </div>
        </div>
      </section>

      {/* Interactive Core Workflow Showcase */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="surface-card rounded-3xl border border-white/[0.08] overflow-hidden p-6 sm:p-8 space-y-6 shadow-2xl bg-gradient-to-b from-[#111116] to-[#0c0c10]">
          {/* Showcase Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-5">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>The myob Operating Engine</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">Interactive Demo</span>
              </h3>
              <p className="text-xs text-zinc-400">
                Explore the automated features powering retail stores from front-desk checkout to back-of-house procurement.
              </p>
            </div>

            <div className="flex gap-1.5 bg-zinc-950/80 p-1.5 rounded-2xl border border-white/[0.06] overflow-x-auto scrollbar-none">
              {[
                { id: 'markdowns', label: 'Dynamic Expiry AI', icon: <Clock className="h-3.5 w-3.5" /> },
                { id: 'replenish', label: 'Auto-Replenish POs', icon: <Truck className="h-3.5 w-3.5" /> },
                { id: 'pos', label: 'Express POS & Register', icon: <ShoppingCart className="h-3.5 w-3.5" /> },
                { id: 'analytics', label: 'Department Analytics', icon: <BarChart3 className="h-3.5 w-3.5" /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveWorkflow(tab.id as any)}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                    activeWorkflow === tab.id
                      ? 'bg-zinc-800 text-white font-semibold shadow-sm border border-white/[0.08]'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Workflow 1: Dynamic Expiry AI */}
          {activeWorkflow === 'markdowns' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeIn">
              <div className="surface-card rounded-2xl p-5 space-y-3.5 border border-white/[0.06] bg-zinc-900/40">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[10px] text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded font-medium">Fresh Produce</span>
                  <span className="text-[11px] font-semibold text-rose-400 bg-rose-950/60 px-2.5 py-0.5 rounded-full border border-rose-800/40">Expires in 1d</span>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Organic Alphonso Mangoes 1kg</h4>
                  <div className="text-[11px] text-zinc-400 font-mono mt-0.5">Batch #BAT-402 • 36 kg remaining</div>
                </div>
                <div className="rounded-xl bg-zinc-950/80 p-3 flex items-center justify-between text-xs border border-white/[0.04]">
                  <div>
                    <span className="text-[10px] text-zinc-500">Retail MRP:</span>
                    <div className="line-through text-zinc-500 font-mono">₹450.00</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-amber-400 font-semibold">-50% Clearance</span>
                    <div className="text-emerald-400 font-mono font-bold text-sm">₹225.00</div>
                  </div>
                </div>
                <div className="text-[11px] text-zinc-400 bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-500/20 flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>AI Trigger:</strong> 50% discount automatically applied to sell out remaining inventory before 24h expiration.</span>
                </div>
              </div>

              <div className="surface-card rounded-2xl p-5 space-y-3.5 border border-white/[0.06] bg-zinc-900/40">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[10px] text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded font-medium">Dairy & Eggs</span>
                  <span className="text-[11px] font-semibold text-amber-400 bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-800/40">Expires in 3d</span>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Desi Cow Ghee 500g Jar</h4>
                  <div className="text-[11px] text-zinc-400 font-mono mt-0.5">Batch #BAT-881 • 18 jars</div>
                </div>
                <div className="rounded-xl bg-zinc-950/80 p-3 flex items-center justify-between text-xs border border-white/[0.04]">
                  <div>
                    <span className="text-[10px] text-zinc-500">Retail MRP:</span>
                    <div className="line-through text-zinc-500 font-mono">₹580.00</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-amber-400 font-semibold">-25% Stepped Markdown</span>
                    <div className="text-emerald-400 font-mono font-bold text-sm">₹435.00</div>
                  </div>
                </div>
                <div className="text-[11px] text-zinc-400 bg-amber-950/20 p-2.5 rounded-xl border border-amber-500/20 flex items-start gap-2">
                  <Zap className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Shelf Sticker Ready:</strong> 1-click printable yellow price-markdown barcode sticker generated for staff.</span>
                </div>
              </div>

              <div className="surface-card rounded-2xl p-5 space-y-3.5 border border-white/[0.06] bg-zinc-900/40">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[10px] text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded font-medium">Bakery & Deli</span>
                  <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800/40">Optimal 7d</span>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Artisan Sourdough Loaf 400g</h4>
                  <div className="text-[11px] text-zinc-400 font-mono mt-0.5">Batch #BAT-119 • 24 loaves</div>
                </div>
                <div className="rounded-xl bg-zinc-950/80 p-3 flex items-center justify-between text-xs border border-white/[0.04]">
                  <div>
                    <span className="text-[10px] text-zinc-500">Standard Price:</span>
                    <div className="text-zinc-200 font-mono font-medium">₹120.00</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-500">Status</span>
                    <div className="text-emerald-400 font-mono font-semibold">100% Margin Retention</div>
                  </div>
                </div>
                <div className="text-[11px] text-zinc-400 bg-zinc-950/60 p-2.5 rounded-xl border border-white/[0.04] flex items-start gap-2">
                  <Activity className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span><strong>Velocity Velocity:</strong> Selling 6 units/day. Projected sell-out in 4 days with zero loss.</span>
                </div>
              </div>
            </div>
          )}

          {/* Workflow 2: Reorder */}
          {activeWorkflow === 'replenish' && (
            <div className="surface-card rounded-2xl overflow-hidden border border-white/[0.06] animate-fadeIn">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-white/[0.06] bg-zinc-950/80 text-zinc-400 text-[11px] uppercase">
                  <tr>
                    <th className="py-3 px-4">Item Name</th>
                    <th className="py-3 px-4">Current Stock</th>
                    <th className="py-3 px-4">Safety Buffer</th>
                    <th className="py-3 px-4">Daily Velocity</th>
                    <th className="py-3 px-4">Suggested Restock PO</th>
                    <th className="py-3 px-4 text-right">Vendor Partner</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] text-zinc-300">
                  <tr className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4 font-semibold text-white">Desi Buffalo Milk 1L Pack</td>
                    <td className="py-3 px-4 font-mono text-rose-400 font-semibold">4 packs (Critical)</td>
                    <td className="py-3 px-4 font-mono text-zinc-400">15 min buffer</td>
                    <td className="py-3 px-4 text-zinc-300 font-mono">~18 / day</td>
                    <td className="py-3 px-4 font-mono text-emerald-400 font-semibold">+60 packs (₹2,160)</td>
                    <td className="py-3 px-4 text-right text-zinc-300">Amul Dairy Dist.</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4 font-semibold text-white">Royal Basmati Rice 5kg Bag</td>
                    <td className="py-3 px-4 font-mono text-amber-400 font-semibold">8 bags (Low Buffer)</td>
                    <td className="py-3 px-4 font-mono text-zinc-400">20 min buffer</td>
                    <td className="py-3 px-4 text-zinc-300 font-mono">~6 / day</td>
                    <td className="py-3 px-4 font-mono text-emerald-400 font-semibold">+40 bags (₹14,400)</td>
                    <td className="py-3 px-4 text-right text-zinc-300">Tata Milling Co.</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4 font-semibold text-white">Tiger Prawns Jumbo Fresh</td>
                    <td className="py-3 px-4 font-mono text-rose-400 font-semibold">0 kg (Stockout)</td>
                    <td className="py-3 px-4 font-mono text-zinc-400">8 kg buffer</td>
                    <td className="py-3 px-4 text-zinc-300 font-mono">~5 kg / day</td>
                    <td className="py-3 px-4 font-mono text-emerald-400 font-semibold">+25 kg (₹18,750)</td>
                    <td className="py-3 px-4 text-right text-zinc-300">Prime Harbor Meats</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Workflow 3: POS */}
          {activeWorkflow === 'pos' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
              <div className="surface-card rounded-2xl p-5 space-y-3.5 border border-white/[0.06] bg-zinc-900/40">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                    <QrCode className="h-4 w-4" />
                  </div>
                  <span>Instant SKU & Optical Lookup</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Real-time product search by Indian GS1 EAN-13 barcodes (`890XXXXXXXXXX`), internal department SKU, or product title with zero input lag.
                </p>
                <div className="rounded-xl bg-zinc-950/90 p-3.5 border border-white/[0.06] space-y-1">
                  <div className="font-mono text-xs text-emerald-400 flex items-center justify-between">
                    <span>BARCODE MATCH: 890100002012</span>
                    <span className="text-[10px] bg-emerald-950/60 text-emerald-400 px-2 py-0.2 rounded">In Stock</span>
                  </div>
                  <div className="text-xs text-white font-medium">Desi Cow Milk 1L Bottle</div>
                  <div className="text-[11px] text-zinc-400 font-mono">MRP: ₹65.00 • Aisle 02 • Auto-added to cart</div>
                </div>
              </div>

              <div className="surface-card rounded-2xl p-5 space-y-3.5 border border-white/[0.06] bg-zinc-900/40">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <Receipt className="h-4 w-4" />
                  </div>
                  <span>High-Speed Checkout & Tender</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Automatically honors FIFO batch clearance discounts, item-level markdowns, and generates instant printable GST tax receipts.
                </p>
                <div className="rounded-xl bg-zinc-950/90 p-3.5 border border-white/[0.06] flex justify-between items-center text-xs">
                  <div>
                    <div className="text-zinc-500 text-[11px]">Total Tender:</div>
                    <div className="text-base font-mono font-bold text-emerald-400">₹845.00</div>
                    <div className="text-[10px] text-zinc-400">Paid via UPI / QR • 5% GST Included</div>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-lg border border-emerald-800/40">
                    Receipt #REC-1092
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Workflow 4: Analytics */}
          {activeWorkflow === 'analytics' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeIn">
              <div className="surface-card rounded-2xl p-5 space-y-2 border border-white/[0.06] bg-zinc-900/40">
                <div className="text-xs font-semibold text-zinc-300">Department Share</div>
                <div className="text-2xl font-bold text-white font-mono">9 Categories</div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Interactive multi-metric donut charts visualizing valuation, stock volumes, and active SKUs across departments.
                </p>
              </div>

              <div className="surface-card rounded-2xl p-5 space-y-2 border border-white/[0.06] bg-zinc-900/40">
                <div className="text-xs font-semibold text-zinc-300">Perishable Shelf-Life Curve</div>
                <div className="text-2xl font-bold text-amber-400 font-mono">5 Time Horizons</div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Categorizes batches from critical (&lt;48h) to long-life (&gt;30d) for automated stepped markdowns.
                </p>
              </div>

              <div className="surface-card rounded-2xl p-5 space-y-2 border border-white/[0.06] bg-zinc-900/40">
                <div className="text-xs font-semibold text-zinc-300">Gross Margin Matrix</div>
                <div className="text-2xl font-bold text-emerald-400 font-mono">35% - 85% Margins</div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Direct profit margin tracking comparing wholesale procurement costs against live retail selling prices.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4 Core Pillars of myob */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Engineered for Retail Precision
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            Everything your store requires to operate with mathematical accuracy and maximum profitability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="surface-card rounded-2xl p-5 space-y-3 border border-white/[0.06] hover:border-emerald-500/30 transition-all group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform">
              <Clock className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-semibold text-white">Dynamic Expiry AI</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Multi-batch tracking with automatic stepped discounts (-20%, -35%, -50%) to eliminate food waste and recover lost capital.
            </p>
          </div>

          <div className="surface-card rounded-2xl p-5 space-y-3 border border-white/[0.06] hover:border-cyan-500/30 transition-all group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 group-hover:scale-105 transition-transform">
              <Truck className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-semibold text-white">Predictive Replenishment</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              1-Click purchase order generation based on daily sales velocity, supplier lead times, and safety buffer thresholds.
            </p>
          </div>

          <div className="surface-card rounded-2xl p-5 space-y-3 border border-white/[0.06] hover:border-amber-500/30 transition-all group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 group-hover:scale-105 transition-transform">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-semibold text-white">High-Scale Importer</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Upload spreadsheets with 500 to 50,000+ items in seconds. Supports clean overwrites, batch appending, and auto-mapping.
            </p>
          </div>

          <div className="surface-card rounded-2xl p-5 space-y-3 border border-white/[0.06] hover:border-purple-500/30 transition-all group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 group-hover:scale-105 transition-transform">
              <Lock className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-semibold text-white">Isolated Tenant Security</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Every store account is strictly isolated in MongoDB Atlas with authenticated tenant keys and zero cross-store leakage.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="border-t border-white/[0.06] bg-gradient-to-b from-[#09090b] via-[#101015] to-[#09090b] py-20 px-4 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-zinc-900 px-3.5 py-1 text-xs text-zinc-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>Instant Setup • No Credit Card Required</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Ready to mind your own business with precision?
          </h2>
          <p className="text-sm text-zinc-400 max-w-lg mx-auto">
            Create your store account in seconds, import your product catalogue, and experience next-generation retail operating intelligence.
          </p>

          <div className="pt-2">
            <SignUpButton mode="modal">
              <button className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-8 py-3.5 text-sm font-bold text-zinc-950 hover:bg-emerald-300 active:scale-95 transition-all shadow-xl shadow-emerald-500/10 cursor-pointer">
                <span>Create Store Account Now</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </SignUpButton>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.05] py-8 text-center text-xs text-zinc-600 bg-[#09090b]">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="lowercase font-bold text-white text-sm">myob</span>
            <span className="text-zinc-500">•</span>
            <span className="font-medium text-zinc-400">Mind Your Own Business (Retail Intelligence OS)</span>
          </div>
          <div className="font-mono text-[11px] text-zinc-500">
            Secured by Clerk Auth • Multi-Tenant MongoDB Atlas • India INR (₹)
          </div>
        </div>
      </footer>
    </div>
  );
};
