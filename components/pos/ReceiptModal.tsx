'use client';

import React from 'react';
import { useInventory } from '@/context/InventoryContext';
import { POSCartItem } from '@/types/inventory';
import { Printer, CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatINR } from '@/lib/currency';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  items: POSCartItem[];
  subtotal: number;
  discountTotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
}

// Authentic SVG Barcode generator that renders crisp black bars on screen and print
const BarcodeSvg: React.FC<{ value: string }> = ({ value }) => {
  // Deterministic bar widths for consistent crisp barcode pattern
  const barSequence = [2, 1, 3, 1, 2, 2, 1, 3, 1, 1, 2, 3, 1, 2, 1, 3, 2, 1, 1, 2, 3, 1, 2, 1, 3, 1, 2, 2, 1, 3, 1, 1, 2, 3, 1, 2, 1, 2, 1, 3, 1, 2];

  let currentX = 6;
  return (
    <div className="flex flex-col items-center justify-center pt-2 pb-1">
      <svg
        className="w-48 h-9 overflow-visible"
        viewBox="0 0 190 32"
        fill="#000000"
        xmlns="http://www.w3.org/2000/svg"
      >
        {barSequence.map((width, idx) => {
          const x = currentX;
          currentX += width + 2;
          if (idx % 2 === 0 && currentX <= 184) {
            return (
              <rect
                key={idx}
                x={x}
                y="0"
                width={width}
                height="32"
                fill="#000000"
              />
            );
          }
          return null;
        })}
      </svg>
      <span className="font-mono text-[10px] tracking-widest text-slate-800 font-bold mt-1 block">
        * {value} *
      </span>
    </div>
  );
};

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  orderId,
  items,
  subtotal,
  discountTotal,
  tax,
  total,
  paymentMethod
}) => {
  const { storeName } = useInventory();

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const displayName = storeName ? storeName.toUpperCase() : 'MYOB STORE';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
        {/* Backdrop (hidden during print) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-sm no-print"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-slate-700 bg-white text-slate-900 shadow-2xl z-10 font-mono"
        >
          {/* Printable Receipt Area */}
          <div id="printable-receipt" className="bg-white text-slate-900">
            {/* Top Receipt header */}
            <div className="bg-zinc-900 px-5 py-3.5 text-center text-white font-sans border-b border-zinc-800">
              <div className="flex justify-between items-center mb-1.5 no-print">
                <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Paid in Full
                </span>
                <button
                  onClick={onClose}
                  className="text-white/80 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center justify-center gap-2">
                <h2 className="text-base font-black tracking-tight uppercase text-white">{displayName}</h2>
              </div>
              <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                myob Retail Intelligence OS
              </p>
            </div>

            {/* Receipt Body */}
            <div className="p-5 text-xs space-y-3 font-mono">
              {/* Meta info */}
              <div className="border-b border-dashed border-slate-300 pb-2.5 space-y-1 text-slate-600 text-[11px]">
                <div className="flex justify-between">
                  <span>Receipt #:</span>
                  <span className="font-bold text-slate-900">{orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date & Time:</span>
                  <span>{new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Mode:</span>
                  <span className="font-bold text-slate-900">{paymentMethod.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cashier Terminal:</span>
                  <span>POS-01 (Express Lane)</span>
                </div>
              </div>

              {/* Line Items */}
              <div className="space-y-1.5 border-b border-dashed border-slate-300 pb-2.5 max-h-52 overflow-y-auto">
                {items.map((cartItem, idx) => (
                  <div key={idx} className="space-y-0.5 text-xs">
                    <div className="flex justify-between font-bold text-slate-800">
                      <span className="truncate pr-2">{cartItem.item.name}</span>
                      <span className="shrink-0">{formatINR(cartItem.total)}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>
                        {cartItem.quantity} x {formatINR(cartItem.unitPrice)}
                        {cartItem.appliedDiscountPercentage > 0 && (
                          <span className="text-amber-700 font-bold ml-1">
                            (-{cartItem.appliedDiscountPercentage}% OFF)
                          </span>
                        )}
                      </span>
                      {cartItem.appliedDiscountPercentage > 0 && (
                        <span className="line-through">
                          {formatINR(cartItem.quantity * cartItem.item.sellingPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Financial Calculations */}
              <div className="space-y-1 text-slate-700 text-xs">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatINR(subtotal)}</span>
                </div>
                {discountTotal > 0 && (
                  <div className="flex justify-between text-amber-800 font-bold">
                    <span>Total Savings:</span>
                    <span>-{formatINR(discountTotal)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>GST (5%):</span>
                  <span>{formatINR(tax)}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-slate-950 border-t-2 border-slate-900 pt-1.5 mt-1.5">
                  <span>TOTAL PAID:</span>
                  <span className="text-base">{formatINR(total)}</span>
                </div>
              </div>

              {/* Barcode & Footer */}
              <div className="text-center pt-1 space-y-1.5 border-t border-dashed border-slate-300">
                {/* Crisp SVG Barcode */}
                <BarcodeSvg value={orderId} />

                <p className="text-[10px] text-slate-600 font-sans">
                  Thank you for shopping at {displayName}!
                </p>
              </div>

              {/* On-Screen Action Buttons (hidden during print) */}
              <div className="flex gap-2 pt-2 no-print font-sans">
                <button
                  onClick={handlePrint}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-slate-800 active:scale-95 transition-all shadow-md cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={onClose}
                  className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
