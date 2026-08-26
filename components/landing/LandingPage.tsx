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
  Scan, 
  ShieldCheck, 
  ShoppingCart, 
  Sparkles, 
  Store, 
  Truck, 
  Zap,
  ArrowRight,
  Database,
  FileSpreadsheet,
  Users
} from 'lucide-react';
import { motion } from 'motion/react';

export const LandingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'expiry' | 'reorder' | 'pos'>('expiry');

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans selection:bg-zinc-700 selection:text-white relative overflow-hidden">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#09090b]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-zinc-900 text-zinc-200 shadow-md">
              <Store className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-tight text-white lowercase">
                myob <span className="text-zinc-500 font-normal">retail os</span>
              </span>
              <span className="hidden sm:inline-block rounded-full bg-zinc-900 border border-white/[0.06] text-[10px] text-zinc-400 px-2 py-0.5 font-mono">
                Multi-Tenant MongoDB
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <SignInButton mode="modal">
              <button className="rounded-lg border border-white/[0.08] bg-zinc-900/80 px-3.5 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-800 hover:text-white transition-all">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="flex items-center gap-1.5 rounded-lg bg-zinc-100 px-3.5 py-1.5 text-xs font-semibold text-zinc-950 hover:bg-white active:scale-95 transition-all shadow-sm">
                <span>Launch Store Workspace</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </SignUpButton>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center space-y-7">
        {/* Release Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-zinc-900/80 px-3.5 py-1 text-xs text-zinc-300 backdrop-blur-md shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-medium text-white">myob Supermarket Intelligence 2026</span>
          <span className="text-zinc-500">•</span>
          <span className="text-zinc-400">Isolated Cloud Database</span>
        </div>

        {/* Main Headline */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-[1.12]">
            The Operating System for Modern Supermarkets & Retail.
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Keep track of active stock in real time, forecast supplier purchase orders before stockout, and eradicate food spoilage with phased dynamic clearance pricing.
          </p>
        </div>

        {/* CTA Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <SignUpButton mode="modal">
            <button className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-zinc-100 px-6 py-3 text-sm font-semibold text-zinc-950 hover:bg-white active:scale-95 transition-all shadow-xl shadow-white/5">
              <span>Start Free as Store Owner</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </SignUpButton>

          <SignInButton mode="modal">
            <button className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-zinc-900/80 px-6 py-3 text-sm font-medium text-zinc-200 hover:bg-zinc-800 hover:text-white transition-all">
              <span>Sign In to Existing Store</span>
            </button>
          </SignInButton>
        </div>

        {/* Feature Badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-zinc-500 pt-4">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Clerk Protected Auth</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Database className="h-4 w-4 text-cyan-400" />
            <span>Isolated MongoDB Dataspace</span>
          </div>
          <div className="flex items-center gap-1.5">
            <FileSpreadsheet className="h-4 w-4 text-amber-400" />
            <span>CSV / Excel Import Engine</span>
          </div>
        </div>
      </section>

      {/* Interactive Feature Demo Showcase */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 w-full">
        <div className="surface-card rounded-2xl border border-white/[0.08] overflow-hidden p-6 sm:p-8 space-y-6">
          {/* Showcase Tabs */}
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-white">Explore Core Supermarket Workflows</h3>
              <p className="text-xs text-zinc-500">Click tabs to view real-time operations and intelligence</p>
            </div>

            <div className="flex gap-1 bg-zinc-950/60 p-1 rounded-xl border border-white/[0.06]">
              {[
                { id: 'expiry', label: 'Dynamic Markdowns', icon: <Clock className="h-3.5 w-3.5" /> },
                { id: 'reorder', label: 'Auto-Replenishment', icon: <Truck className="h-3.5 w-3.5" /> },
                { id: 'pos', label: 'Express POS & Barcode', icon: <ShoppingCart className="h-3.5 w-3.5" /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-zinc-800 text-white font-semibold shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab 1: Expiry */}
          {activeTab === 'expiry' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="surface-card rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[10px] text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded">Fresh Produce</span>
                  <span className="text-[11px] font-medium text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/40">Expires in 1d</span>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-white">Organic Hass Avocados</h4>
                  <div className="text-[11px] text-zinc-500 font-mono">Batch #BAT-402 • 36 pcs</div>
                </div>
                <div className="rounded-lg bg-zinc-900/60 p-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-zinc-500">Retail Was:</span>
                    <div className="line-through text-zinc-500 font-mono">$2.49</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-amber-400 font-medium">-50% Clearance</span>
                    <div className="text-emerald-400 font-mono font-semibold">$1.25</div>
                  </div>
                </div>
                <div className="text-[10px] text-zinc-400 bg-zinc-950/50 p-2 rounded border border-white/[0.04]">
                  💡 <strong>Smart AI Trigger:</strong> Markdown automatically suggested to clear shelf before spoilage.
                </div>
              </div>

              <div className="surface-card rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[10px] text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded">Dairy & Eggs</span>
                  <span className="text-[11px] font-medium text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">Expires in 3d</span>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-white">Organic Greek Yogurt 500g</h4>
                  <div className="text-[11px] text-zinc-500 font-mono">Batch #BAT-881 • 18 pcs</div>
                </div>
                <div className="rounded-lg bg-zinc-900/60 p-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-zinc-500">Retail Was:</span>
                    <div className="line-through text-zinc-500 font-mono">$5.49</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-amber-400 font-medium">-30% Early Bird</span>
                    <div className="text-emerald-400 font-mono font-semibold">$3.84</div>
                  </div>
                </div>
                <div className="text-[10px] text-zinc-400 bg-zinc-950/50 p-2 rounded border border-white/[0.04]">
                  🏷️ <strong>Shelf Tag Ready:</strong> 1-click printable yellow clearance sticker with barcode.
                </div>
              </div>

              <div className="surface-card rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[10px] text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded">Bakery</span>
                  <span className="text-[11px] font-medium text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">Expires in 6d</span>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-white">Artisan Brioche Buns 4pk</h4>
                  <div className="text-[11px] text-zinc-500 font-mono">Batch #BAT-119 • 24 packs</div>
                </div>
                <div className="rounded-lg bg-zinc-900/60 p-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-zinc-500">Standard Price:</span>
                    <div className="text-zinc-200 font-mono">$4.29</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-500">Status</span>
                    <div className="text-zinc-300 font-mono font-medium">Optimal Shelf Life</div>
                  </div>
                </div>
                <div className="text-[10px] text-zinc-400 bg-zinc-950/50 p-2 rounded border border-white/[0.04]">
                  📊 <strong>Velocity Check:</strong> Selling 4 packs/day. Projected sell-out in 4.5 days.
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Reorder */}
          {activeTab === 'reorder' && (
            <div className="surface-card rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-white/[0.06] bg-zinc-950/60 text-zinc-400 text-[11px]">
                  <tr>
                    <th className="py-2.5 px-4">Item Name</th>
                    <th className="py-2.5 px-4">Current Stock</th>
                    <th className="py-2.5 px-4">Safety Buffer</th>
                    <th className="py-2.5 px-4">Daily Velocity</th>
                    <th className="py-2.5 px-4">Suggested PO</th>
                    <th className="py-2.5 px-4 text-right">Vendor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] text-zinc-300">
                  <tr className="hover:bg-white/[0.02]">
                    <td className="py-2.5 px-4 font-medium text-white">Farm Fresh Whole Milk 1L</td>
                    <td className="py-2.5 px-4 font-mono text-rose-400 font-semibold">4 bottles (Low)</td>
                    <td className="py-2.5 px-4 font-mono text-zinc-400">12 min</td>
                    <td className="py-2.5 px-4 text-zinc-400">~8 / day</td>
                    <td className="py-2.5 px-4 font-mono text-emerald-400 font-medium">+40 bottles</td>
                    <td className="py-2.5 px-4 text-right text-zinc-300">Alpine Dairy Co.</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02]">
                    <td className="py-2.5 px-4 font-medium text-white">Organic Bananas (Bunch)</td>
                    <td className="py-2.5 px-4 font-mono text-amber-400 font-semibold">8 bunches</td>
                    <td className="py-2.5 px-4 font-mono text-zinc-400">15 min</td>
                    <td className="py-2.5 px-4 text-zinc-400">~12 / day</td>
                    <td className="py-2.5 px-4 font-mono text-emerald-400 font-medium">+50 bunches</td>
                    <td className="py-2.5 px-4 text-right text-zinc-300">Green Valley Farms</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02]">
                    <td className="py-2.5 px-4 font-medium text-white">Prime Ribeye Steak 400g</td>
                    <td className="py-2.5 px-4 font-mono text-rose-400 font-semibold">0 packs (Stockout)</td>
                    <td className="py-2.5 px-4 font-mono text-zinc-400">5 min</td>
                    <td className="py-2.5 px-4 text-zinc-400">~4 / day</td>
                    <td className="py-2.5 px-4 font-mono text-emerald-400 font-medium">+20 packs</td>
                    <td className="py-2.5 px-4 text-right text-zinc-300">Prime Harbor Meats</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Tab 3: POS */}
          {activeTab === 'pos' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="surface-card rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <Scan className="h-4 w-4 text-cyan-400" />
                  <span>Optical Camera Laser Scanner</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Instant scanning of EAN-13 barcodes, shelf stickers, or manual SKU searches with real-time stock deduction.
                </p>
                <div className="rounded-lg bg-zinc-950/80 p-3 text-center border border-white/[0.06]">
                  <div className="font-mono text-xs text-emerald-400">SCAN DETECTED: 840129001015</div>
                  <div className="text-[11px] text-zinc-400 mt-1">Organic Hass Avocados (Stock: 36 → 35)</div>
                </div>
              </div>

              <div className="surface-card rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <ShoppingCart className="h-4 w-4 text-emerald-400" />
                  <span>Cashier POS Register Terminal</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Automatic recognition of dynamic clearance discounts, payment tender options (Card/Cash/NFC), and thermal receipt generator.
                </p>
                <div className="rounded-lg bg-zinc-950/80 p-3 flex justify-between items-center border border-white/[0.06] text-xs">
                  <div>
                    <div className="text-zinc-400">Total Charged:</div>
                    <div className="text-sm font-mono font-bold text-white">$24.85</div>
                  </div>
                  <span className="text-[11px] text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/40">
                    Receipt #REC-1092 Generated
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Feature Grid: 4 Pillars */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="surface-card rounded-xl p-5 space-y-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 border border-white/[0.08] text-white">
            <Clock className="h-4 w-4" />
          </div>
          <h4 className="text-xs font-semibold text-white">Expiry Radar & Markdowns</h4>
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            Multi-batch expiration tracking with automated stepped discounts (-20%, -35%, -50%) to maximize revenue.
          </p>
        </div>

        <div className="surface-card rounded-xl p-5 space-y-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 border border-white/[0.08] text-white">
            <Truck className="h-4 w-4" />
          </div>
          <h4 className="text-xs font-semibold text-white">Automated Replenishment</h4>
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            1-Click supplier purchase order generation based on daily sales velocity and minimum safety buffers.
          </p>
        </div>

        <div className="surface-card rounded-xl p-5 space-y-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 border border-white/[0.08] text-white">
            <FileSpreadsheet className="h-4 w-4" />
          </div>
          <h4 className="text-xs font-semibold text-white">CSV & Excel Importer</h4>
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            Seamlessly import thousands of product lines from existing spreadsheets, suppliers, or legacy POS exports.
          </p>
        </div>

        <div className="surface-card rounded-xl p-5 space-y-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 border border-white/[0.08] text-white">
            <Database className="h-4 w-4" />
          </div>
          <h4 className="text-xs font-semibold text-white">Isolated MongoDB Space</h4>
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            Every store owner gets an isolated, encrypted multi-tenant dataspace with concurrent access support.
          </p>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-white/[0.06] bg-zinc-950/60 py-16 px-4 text-center">
        <div className="max-w-xl mx-auto space-y-5">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Ready to streamline your supermarket operations?
          </h2>
          <p className="text-xs text-zinc-400">
            Sign up in seconds, import your product spreadsheet, or launch our sample store.
          </p>
          <SignUpButton mode="modal">
            <button className="inline-flex items-center gap-2 rounded-xl bg-zinc-100 px-6 py-3 text-xs font-semibold text-zinc-950 hover:bg-white active:scale-95 transition-all shadow-xl shadow-white/5">
              <span>Create Store Account</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </SignUpButton>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.05] py-6 text-center text-xs text-zinc-600">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="lowercase font-medium text-zinc-400">myob <span className="text-zinc-600 font-normal">• Store Management Intelligence</span></span>
          <span className="font-mono text-[11px] text-zinc-600">
            Secured by Clerk • Multi-Tenant MongoDB
          </span>
        </div>
      </footer>
    </div>
  );
};
