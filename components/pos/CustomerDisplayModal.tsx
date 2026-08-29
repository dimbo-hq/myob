'use client';

import React from 'react';
import { POSCartItem, Customer } from '@/types/inventory';
import { 
  Store, 
  Sparkles, 
  QrCode, 
  CheckCircle2, 
  X, 
  ShoppingBag, 
  Percent, 
  Coins,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatINR } from '@/lib/currency';

interface CustomerDisplayModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: POSCartItem[];
  subtotal: number;
  discountTotal: number;
  tax: number;
  total: number;
  customer: {
    name?: string;
    phone?: string;
    lifetimeSpend?: number;
  } | null;
  storeName: string;
}

export const CustomerDisplayModal: React.FC<CustomerDisplayModalProps> = ({
  isOpen,
  onClose,
  cart,
  subtotal,
  discountTotal,
  tax,
  total,
  customer,
  storeName
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/95 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          className="relative w-full max-w-6xl h-[92vh] rounded-3xl border border-white/[0.1] bg-[#0c0c10] shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Top Brand Bar */}
          <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-4 bg-zinc-950/80 shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-md">
                <Store className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white font-heading tracking-tight flex items-center gap-2">
                  <span>{storeName || 'My Supermarket'}</span>
                  <span className="rounded-full bg-emerald-950/80 px-2.5 py-0.5 text-[10px] font-mono font-bold text-emerald-400 border border-emerald-800/50">
                    Live Checkout
                  </span>
                </h2>
                <p className="text-xs text-zinc-400 font-sans">
                  Customer Display • Order Summary & UPI Payment
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {customer?.name && (
                <div className="hidden sm:flex items-center gap-2 rounded-xl bg-zinc-900 border border-white/[0.08] px-3.5 py-1.5 text-xs text-zinc-200">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  <span>Welcome, <strong>{customer.name}</strong></span>
                </div>
              )}

              <button
                onClick={onClose}
                className="rounded-xl p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
                title="Close Customer Display"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Main 2-Column Split: Scanned Cart on Left, UPI & Bill on Right */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden">
            {/* Left: Scanned Items Feed */}
            <div className="lg:col-span-7 flex flex-col border-b lg:border-b-0 lg:border-r border-white/[0.08] bg-[#09090c] p-6 overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] shrink-0">
                <div className="flex items-center gap-2 text-sm font-semibold text-zinc-300 font-heading">
                  <ShoppingBag className="h-4 w-4 text-emerald-400" />
                  <span>Your Basket ({cart.reduce((acc, c) => acc + c.quantity, 0)} items)</span>
                </div>
                {discountTotal > 0 && (
                  <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2.5 py-1 rounded-full animate-pulse">
                    <Percent className="h-3.5 w-3.5" />
                    <span>Saved {formatINR(discountTotal)}</span>
                  </span>
                )}
              </div>

              <div className="flex-1 overflow-y-auto pt-3 space-y-2.5 pr-2">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 text-zinc-500 space-y-3">
                    <div className="h-16 w-16 rounded-3xl bg-zinc-900 border border-white/[0.06] flex items-center justify-center text-zinc-600">
                      <ShoppingBag className="h-8 w-8" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-base font-semibold text-zinc-300 font-heading">Ready for First Item</h4>
                      <p className="text-xs text-zinc-500 max-w-xs">
                        Items scanned by the cashier will appear here with live savings and prices.
                      </p>
                    </div>
                  </div>
                ) : (
                  cart.map((c, idx) => (
                    <motion.div
                      key={`${c.item.id}-${idx}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between gap-4 rounded-2xl border border-white/[0.06] bg-zinc-900/70 p-3.5 shadow-sm"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-white font-heading truncate">
                          {c.item.name}
                        </div>
                        <div className="text-xs text-zinc-400 font-mono mt-0.5">
                          {c.quantity} {c.item.unit} × {formatINR(c.unitPrice)}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-base font-bold text-white font-mono">
                          {formatINR(c.total)}
                        </div>
                        {c.unitPrice < c.item.sellingPrice && (
                          <div className="text-[11px] font-mono text-amber-400 line-through">
                            {formatINR(c.item.sellingPrice * c.quantity)}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* Right: Payment & Live UPI QR Code */}
            <div className="lg:col-span-5 flex flex-col justify-between bg-zinc-950 p-6 sm:p-8 space-y-6">
              {/* Financial Summary */}
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/[0.08] bg-[#121216] p-5 space-y-3 shadow-inner">
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>Subtotal</span>
                    <span className="font-mono text-zinc-200">{formatINR(subtotal)}</span>
                  </div>

                  {discountTotal > 0 && (
                    <div className="flex justify-between text-xs text-amber-400 font-semibold">
                      <span>Clearance Savings</span>
                      <span className="font-mono">-{formatINR(discountTotal)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-xs text-zinc-500">
                    <span>Applicable GST (5%)</span>
                    <span className="font-mono">{formatINR(tax)}</span>
                  </div>

                  <div className="flex items-baseline justify-between border-t border-white/[0.08] pt-3 text-white">
                    <span className="text-sm font-bold font-heading">Total Payable</span>
                    <span className="text-3xl font-extrabold text-emerald-400 font-mono tracking-tight">
                      {formatINR(total)}
                    </span>
                  </div>
                </div>

                {/* Live UPI QR Code Card */}
                {total > 0 && (
                  <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5 flex flex-col items-center text-center space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300 font-heading">
                      <Smartphone className="h-4 w-4 text-emerald-400" />
                      <span>Instant UPI Scan & Pay</span>
                    </div>

                    {/* QR Code Container */}
                    <div className="p-3 bg-white rounded-2xl shadow-xl">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                          `upi://pay?pa=store@upi&pn=${encodeURIComponent(storeName || 'Supermarket')}&am=${total}&cu=INR`
                        )}`}
                        alt="UPI Payment QR Code"
                        className="h-36 w-36 object-contain"
                      />
                    </div>

                    <div className="text-[11px] text-zinc-400">
                      Scan with GPay, PhonePe, Paytm or any UPI App
                    </div>
                  </div>
                )}
              </div>

              {/* Secure Checkout Footer Note */}
              <div className="flex items-center justify-center gap-2 text-xs text-zinc-500 font-sans border-t border-white/[0.06] pt-4">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>Verified Retail Terminal • Thank you for shopping with us!</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
