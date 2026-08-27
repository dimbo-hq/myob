'use client';

import React, { useState } from 'react';
import { 
  SignInButton, 
  SignUpButton 
} from '@clerk/nextjs';
import { 
  ArrowRight, 
  Check, 
  Clock, 
  Database, 
  FileSpreadsheet, 
  Layers, 
  Package, 
  QrCode, 
  Receipt, 
  ShieldCheck, 
  ShoppingCart, 
  Sparkles, 
  Store, 
  Truck, 
  Zap,
  TrendingDown,
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Boxes,
  Minus,
  Plus
} from 'lucide-react';
import { motion } from 'motion/react';
import { formatINR } from '@/lib/currency';

export const LandingPage: React.FC = () => {
  const [demoTab, setDemoTab] = useState<'inventory' | 'expiry' | 'pos'>('expiry');
  const [demoDiscount, setDemoDiscount] = useState<number>(30);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans selection:bg-zinc-800 selection:text-white">
      {/* 1. TOP HEADER */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#09090b]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-zinc-900 overflow-hidden shadow-sm">
              <img src="/logo.png" alt="myob" className="h-full w-full object-contain p-0.5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white lowercase">
                myob
              </span>
              <span className="text-[11px] text-zinc-500 font-mono hidden sm:inline-block border-l border-zinc-800 pl-2">
                Mind Your Own Business
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <SignInButton mode="modal">
              <button className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="flex items-center gap-1.5 rounded-lg bg-zinc-100 px-3.5 py-1.5 text-xs font-semibold text-zinc-950 hover:bg-white active:scale-95 transition-all shadow-sm cursor-pointer">
                <span>Open Store</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </SignUpButton>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="pt-16 pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center space-y-6">
        {/* Release Tag */}
        <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-zinc-900/80 px-3.5 py-1 text-xs text-zinc-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span className="font-medium text-white">myob Retail OS</span>
          <span className="text-zinc-600">•</span>
          <span className="text-zinc-400">India INR (₹) Edition</span>
        </div>

        {/* Hero Title & Subhead */}
        <div className="space-y-3.5 max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.12]">
            Retail inventory that stops you from losing money on expired stock.
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            <span className="text-zinc-200 font-semibold">myob</span> (Mind Your Own Business) tracks supermarket batches in Indian Rupees, auto-calculates clearance markdowns before goods spoil, and rings up sales on UPI in seconds.
          </p>
        </div>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
          <SignUpButton mode="modal">
            <button className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-zinc-100 px-5 py-2.5 text-xs font-semibold text-zinc-950 hover:bg-white active:scale-95 transition-all shadow-md cursor-pointer">
              <span>Start Free Store Workspace</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </SignUpButton>

          <SignInButton mode="modal">
            <button className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-zinc-900 px-5 py-2.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all cursor-pointer">
              <span>Sign In to Your Store</span>
            </button>
          </SignInButton>
        </div>

        {/* Feature badges */}
        <div className="flex flex-wrap items-center justify-center gap-5 text-[11px] text-zinc-500 pt-2 font-mono">
          <span>✓ Multi-Tenant MongoDB Atlas</span>
          <span>•</span>
          <span>✓ Up to 50,000 SKU Scale</span>
          <span>•</span>
          <span>✓ GS1 890 Barcode Ready</span>
          <span>•</span>
          <span>✓ Instant UPI QR POS</span>
        </div>
      </section>

      {/* 3. INTERACTIVE PRODUCT UI SHOWCASE (THE MAIN HERO VISUAL) */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 w-full">
        <div className="rounded-2xl border border-white/[0.08] bg-[#0d0d10] overflow-hidden shadow-2xl">
          {/* Browser Window Chrome */}
          <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-2.5 bg-[#09090b]">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-zinc-800" />
                <div className="h-2.5 w-2.5 rounded-full bg-zinc-800" />
                <div className="h-2.5 w-2.5 rounded-full bg-zinc-800" />
              </div>
              <span className="text-[11px] text-zinc-500 font-mono ml-2">myob • Pratik General Store (Mumbai)</span>
            </div>

            {/* Interactive Tab Switcher */}
            <div className="flex gap-1 bg-zinc-900/80 p-0.5 rounded-lg border border-white/[0.04]">
              <button
                onClick={() => setDemoTab('expiry')}
                className={`px-2.5 py-1 text-[11px] font-medium rounded transition-all cursor-pointer ${
                  demoTab === 'expiry' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Expiry Radar & Markdowns
              </button>
              <button
                onClick={() => setDemoTab('inventory')}
                className={`px-2.5 py-1 text-[11px] font-medium rounded transition-all cursor-pointer ${
                  demoTab === 'inventory' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Inventory Catalogue
              </button>
              <button
                onClick={() => setDemoTab('pos')}
                className={`px-2.5 py-1 text-[11px] font-medium rounded transition-all cursor-pointer ${
                  demoTab === 'pos' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Express POS Checkout
              </button>
            </div>
          </div>

          {/* Tab Content: Expiry Radar */}
          {demoTab === 'expiry' && (
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.04] pb-3">
                <div>
                  <div className="text-xs font-semibold text-white">Dynamic Clearance Engine</div>
                  <div className="text-[11px] text-zinc-500">Automated stepped markdowns based on batch shelf-life countdown</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-zinc-400 font-mono">Simulate Markdown:</span>
                  {[20, 30, 50].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => setDemoDiscount(pct)}
                      className={`px-2 py-0.5 text-[11px] font-mono rounded border transition-all cursor-pointer ${
                        demoDiscount === pct
                          ? 'border-amber-500/40 bg-amber-950/40 text-amber-300 font-bold'
                          : 'border-white/[0.04] bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      -{pct}%
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Item 1 */}
                <div className="rounded-xl border border-white/[0.04] bg-zinc-900/30 p-3.5 space-y-3">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-zinc-400 bg-zinc-800 px-1.5 py-0.2 rounded font-mono">DAIR-000102</span>
                    <span className="text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded font-medium border border-rose-800/40">Expires in 1d</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-white">Amul Desi Cow Milk 1L</h4>
                    <div className="text-[11px] text-zinc-500 font-mono">Batch #BAT-402 • 35 bottles</div>
                  </div>
                  <div className="rounded-lg bg-zinc-950/80 p-2.5 flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-zinc-500 block">Retail MRP</span>
                      <span className="line-through text-zinc-500">₹65.00</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-amber-400 block font-sans">-{demoDiscount}% Discount</span>
                      <span className="text-emerald-400 font-bold">₹{(65 * (1 - demoDiscount / 100)).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Item 2 */}
                <div className="rounded-xl border border-white/[0.04] bg-zinc-900/30 p-3.5 space-y-3">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-zinc-400 bg-zinc-800 px-1.5 py-0.2 rounded font-mono">BAKE-000214</span>
                    <span className="text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded font-medium border border-amber-800/40">Expires in 2d</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-white">Whole Wheat Atta Bread 400g</h4>
                    <div className="text-[11px] text-zinc-500 font-mono">Batch #BAT-881 • 18 loaves</div>
                  </div>
                  <div className="rounded-lg bg-zinc-950/80 p-2.5 flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-zinc-500 block">Retail MRP</span>
                      <span className="line-through text-zinc-500">₹45.00</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-amber-400 block font-sans">-{demoDiscount}% Discount</span>
                      <span className="text-emerald-400 font-bold">₹{(45 * (1 - demoDiscount / 100)).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Item 3 */}
                <div className="rounded-xl border border-white/[0.04] bg-zinc-900/30 p-3.5 space-y-3">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-zinc-400 bg-zinc-800 px-1.5 py-0.2 rounded font-mono">PROD-000045</span>
                    <span className="text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded font-medium border border-amber-800/40">Expires in 3d</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-white">Alphonso Mangoes 1kg Pack</h4>
                    <div className="text-[11px] text-zinc-500 font-mono">Batch #BAT-119 • 24 kg</div>
                  </div>
                  <div className="rounded-lg bg-zinc-950/80 p-2.5 flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-zinc-500 block">Retail MRP</span>
                      <span className="line-through text-zinc-500">₹450.00</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-amber-400 block font-sans">-{demoDiscount}% Discount</span>
                      <span className="text-emerald-400 font-bold">₹{(450 * (1 - demoDiscount / 100)).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content: Inventory Catalogue */}
          {demoTab === 'inventory' && (
            <div className="p-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-white/[0.06] text-zinc-500 text-[11px] font-mono uppercase">
                  <tr>
                    <th className="pb-2 px-3">Product</th>
                    <th className="pb-2 px-3">Category</th>
                    <th className="pb-2 px-3">Stock Level</th>
                    <th className="pb-2 px-3">Wholesale Cost</th>
                    <th className="pb-2 px-3">Selling Price</th>
                    <th className="pb-2 px-3 text-right">Margin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03] text-zinc-300 text-xs">
                  <tr>
                    <td className="py-2.5 px-3 font-medium text-white">Tata Royal Basmati Rice 5kg</td>
                    <td className="py-2.5 px-3 text-zinc-400">Pantry & Dry Goods</td>
                    <td className="py-2.5 px-3 font-mono text-emerald-400">42 bags (In Stock)</td>
                    <td className="py-2.5 px-3 font-mono">₹380.00</td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-white">₹540.00</td>
                    <td className="py-2.5 px-3 font-mono text-emerald-400 text-right font-medium">42%</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-medium text-white">Amul Pure Desi Ghee 1L Tin</td>
                    <td className="py-2.5 px-3 text-zinc-400">Dairy & Eggs</td>
                    <td className="py-2.5 px-3 font-mono text-amber-400">6 tins (Low Buffer)</td>
                    <td className="py-2.5 px-3 font-mono">₹540.00</td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-white">₹680.00</td>
                    <td className="py-2.5 px-3 font-mono text-emerald-400 text-right font-medium">26%</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-medium text-white">Patanjali Pure Honey 500g</td>
                    <td className="py-2.5 px-3 text-zinc-400">Pantry & Dry Goods</td>
                    <td className="py-2.5 px-3 font-mono text-emerald-400">28 jars (In Stock)</td>
                    <td className="py-2.5 px-3 font-mono">₹145.00</td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-white">₹210.00</td>
                    <td className="py-2.5 px-3 font-mono text-emerald-400 text-right font-medium">45%</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-medium text-white">Atlantic Fresh Salmon 500g</td>
                    <td className="py-2.5 px-3 text-zinc-400">Meat & Seafood</td>
                    <td className="py-2.5 px-3 font-mono text-rose-400">0 packs (Out of Stock)</td>
                    <td className="py-2.5 px-3 font-mono">₹620.00</td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-white">₹890.00</td>
                    <td className="py-2.5 px-3 font-mono text-zinc-500 text-right font-medium">Restock PO Active</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Tab Content: Express POS */}
          {demoTab === 'pos' && (
            <div className="p-5 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              <div className="sm:col-span-7 space-y-3">
                <div className="text-xs font-semibold text-white">Express Register #1</div>
                <div className="rounded-xl border border-white/[0.04] bg-zinc-900/40 p-3 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-zinc-300">
                    <span>1x Amul Desi Cow Milk 1L (Batch #402 • -30% Exp)</span>
                    <span className="font-mono text-white">₹45.50</span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-300">
                    <span>1x Tata Basmati Rice 5kg</span>
                    <span className="font-mono text-white">₹540.00</span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-300">
                    <span>2x Sourdough Bread Loaf (-20% Exp)</span>
                    <span className="font-mono text-white">₹192.00</span>
                  </div>
                  <div className="border-t border-white/[0.06] pt-2 flex justify-between items-center font-bold text-sm text-white">
                    <span>Total Due (GST Included)</span>
                    <span className="font-mono text-emerald-400">₹777.50</span>
                  </div>
                </div>
              </div>

              <div className="sm:col-span-5 rounded-xl border border-white/[0.06] bg-zinc-950 p-4 text-center space-y-2">
                <div className="text-[11px] text-zinc-400 font-mono">Scan UPI QR to Pay</div>
                <div className="h-28 w-28 mx-auto bg-white rounded-lg p-2 flex items-center justify-center">
                  <QrCode className="h-24 w-24 text-zinc-950" />
                </div>
                <div className="text-[10px] text-zinc-500 font-mono">Google Pay • PhonePe • Paytm • BHIM</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4. REAL PROBLEMS SOLVED (THE 3 BIG PAIN POINTS) */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-8">
        <div className="border-t border-white/[0.06] pt-12">
          <div className="max-w-xl">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Built for real supermarket operations, not spreadsheets.
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Generic inventory tools don&apos;t know what a batch expiry is. myob was built from day one around perishable turnover and cash flow.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1 */}
          <div className="rounded-2xl border border-white/[0.06] bg-[#111114] p-5 space-y-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <Clock className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">Eradicate Dumpster Spoilage</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Supermarkets lose thousands every month to unnoticed expired inventory. myob alerts you days in advance and triggers stepped markdowns so stock sells before it spoils.
            </p>
          </div>

          {/* Card 2 */}
          <div className="rounded-2xl border border-white/[0.06] bg-[#111114] p-5 space-y-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Truck className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">Never Run Out of Top Sellers</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Stockouts kill customer trust. When staples dip below your safety threshold, myob drafts ready-to-order purchase orders grouped by vendor with 1 click.
            </p>
          </div>

          {/* Card 3 */}
          <div className="rounded-2xl border border-white/[0.06] bg-[#111114] p-5 space-y-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <ShoppingCart className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">Sub-Second Counter Checkout</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Fast barcode recognition, live stock deduction, automatic discount application, and seamless UPI QR / Cash settlement with instant itemized receipts.
            </p>
          </div>
        </div>
      </section>

      {/* 5. DATA SOVEREIGNTY & SPEED */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="rounded-2xl border border-white/[0.06] bg-zinc-950 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-lg">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-cyan-400">
              <Database className="h-3.5 w-3.5" />
              <span>Multi-Tenant Architecture</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Your store data stays strictly yours.
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Every store account gets an encrypted, isolated database partition in MongoDB Atlas. Import up to 50,000 products from CSV in seconds with zero lag.
            </p>
          </div>

          <div className="flex flex-col gap-2 w-full sm:w-auto">
            <SignUpButton mode="modal">
              <button className="flex items-center justify-center gap-1.5 rounded-xl bg-zinc-100 px-5 py-2.5 text-xs font-semibold text-zinc-950 hover:bg-white active:scale-95 transition-all shadow-sm cursor-pointer">
                <span>Create Free Store</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </SignUpButton>
            <span className="text-[10px] text-zinc-500 text-center font-mono">No credit card required</span>
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="mt-auto border-t border-white/[0.06] py-6 bg-[#09090b]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="lowercase font-bold text-white">myob</span>
            <span>•</span>
            <span className="text-zinc-400">Mind Your Own Business (Retail OS)</span>
          </div>
          <div className="font-mono text-[11px]">
            Protected by Clerk Auth • MongoDB Atlas • India INR (₹)
          </div>
        </div>
      </footer>
    </div>
  );
};
