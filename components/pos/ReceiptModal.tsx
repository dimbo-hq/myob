'use client';

import React from 'react';
import { POSCartItem } from '@/types/inventory';
import { Printer, CheckCircle2, X, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-slate-700 bg-white text-slate-900 shadow-2xl z-10 font-mono"
        >
          {/* Top Receipt header with zig-zag edge simulation */}
          <div className="bg-emerald-600 px-6 py-4 text-center text-white font-sans">
            <div className="flex justify-between items-center mb-2">
              <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
                <CheckCircle2 className="h-4 w-4" /> Transaction Complete
              </span>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <h2 className="text-xl font-black tracking-tight">AURA SUPERMARKET</h2>
            <p className="text-[11px] text-emerald-100 mt-0.5">
              108 Organic Market Row, Tech City
            </p>
          </div>

          <div className="p-6 text-xs space-y-4">
            {/* Meta info */}
            <div className="border-b border-dashed border-slate-300 pb-3 space-y-1 text-slate-600">
              <div className="flex justify-between">
                <span>Receipt #:</span>
                <span className="font-bold text-slate-900">{orderId}</span>
              </div>
              <div className="flex justify-between">
                <span>Date & Time:</span>
                <span>{new Date().toLocaleString()}</span>
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

            {/* Item list */}
            <div className="border-b border-dashed border-slate-300 pb-3 space-y-2 max-h-48 overflow-y-auto">
              <div className="flex justify-between font-bold text-slate-900 pb-1 border-b border-slate-200">
                <span>ITEM</span>
                <span>TOTAL</span>
              </div>
              {items.map((cart, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="flex justify-between text-slate-800 font-medium">
                    <span className="truncate max-w-[180px]">{cart.item.name}</span>
                    <span>${cart.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>
                      {cart.quantity} {cart.item.unit} @ ${cart.unitPrice.toFixed(2)}
                    </span>
                    {cart.appliedDiscountPercentage > 0 && (
                      <span className="text-rose-600 font-bold">
                        -{cart.appliedDiscountPercentage}% Exp Markdown
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Summary */}
            <div className="space-y-1.5 text-slate-700">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {discountTotal > 0 && (
                <div className="flex justify-between text-rose-600 font-semibold">
                  <span>Total Savings:</span>
                  <span>-${discountTotal.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Sales Tax / VAT:</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-slate-950 border-t border-slate-800 pt-2 mt-2">
                <span>TOTAL PAID:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Barcode & Footer */}
            <div className="text-center pt-2 space-y-2">
              <div className="mx-auto flex justify-center py-1">
                {/* Barcode representation */}
                <div className="h-9 w-44 bg-[repeating-linear-gradient(90deg,#000_0px,#000_2px,transparent_2px,transparent_4px,#000_4px,#000_7px,transparent_7px,transparent_9px)]" />
              </div>
              <p className="text-[10px] text-slate-500">
                Thank you for shopping fresh at Aura!
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={handlePrint}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-all"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print Receipt</span>
              </button>
              <button
                onClick={onClose}
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
