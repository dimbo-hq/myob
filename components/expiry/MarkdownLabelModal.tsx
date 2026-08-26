'use client';

import React from 'react';
import { InventoryItem, BatchInfo } from '@/types/inventory';
import { Printer, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatINR } from '@/lib/currency';

interface MarkdownLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem;
  batch: BatchInfo;
  daysRemaining: number;
}

export const MarkdownLabelModal: React.FC<MarkdownLabelModalProps> = ({
  isOpen,
  onClose,
  item,
  batch,
  daysRemaining
}) => {
  if (!isOpen) return null;

  const originalPrice = item.sellingPrice;
  const markdownPercent = batch.markdownPercentage || 25;
  const markdownPrice = batch.markdownPrice || (originalPrice * (1 - markdownPercent / 100));

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
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 10 }}
          className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d0d10] p-6 shadow-2xl z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div>
              <h3 className="text-xs font-semibold text-white tracking-tight">
                Clearance Price Sticker
              </h3>
              <p className="text-[11px] text-zinc-500">
                Yellow reduction label for near-expiry item
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-zinc-500 hover:bg-zinc-800 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="pt-4 space-y-4">
            {/* Shelf Sticker */}
            <div className="rounded-xl border border-amber-400/80 bg-amber-400/90 p-4 text-zinc-950 shadow-lg">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider pb-1 border-b border-zinc-900/20">
                <span className="bg-zinc-950 text-amber-300 px-1.5 py-0.2 rounded">SPECIAL REDUCTION</span>
                <span>EXP: {batch.expiryDate}</span>
              </div>

              <div className="text-sm font-bold text-zinc-950 mt-2 line-clamp-1">{item.name}</div>
              <div className="text-[10px] text-zinc-800">Batch #{batch.batchNumber} • Qty: {batch.quantity}</div>

              <div className="my-2.5 flex items-baseline justify-between rounded-lg bg-zinc-950 p-2.5 text-white">
                <div>
                  <div className="text-[9px] text-zinc-400">WAS:</div>
                  <div className="text-sm font-mono text-zinc-500 line-through">{formatINR(originalPrice)}</div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] font-bold text-amber-300">-{markdownPercent}% NOW</div>
                  <div className="text-xl font-mono font-black text-emerald-400">{formatINR(markdownPrice)}</div>
                </div>
              </div>

              <div className="text-center pt-1 border-t border-zinc-900/20 space-y-0.5">
                <div className="mx-auto flex justify-center py-0.5">
                  <div className="h-8 w-40 bg-[repeating-linear-gradient(90deg,#000_0px,#000_2px,transparent_2px,transparent_4px,#000_4px,#000_7px,transparent_7px,transparent_9px)]" />
                </div>
                <div className="font-mono text-[9px] text-zinc-800 font-bold">{item.barcode}</div>
              </div>
            </div>

            {/* Print Controls */}
            <div className="flex gap-2 pt-1 border-t border-white/[0.06]">
              <button
                onClick={handlePrint}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-zinc-100 py-2 text-xs font-semibold text-zinc-900 hover:bg-white active:scale-95 transition-all shadow-sm"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print Tag</span>
              </button>
              <button
                onClick={onClose}
                className="rounded-lg border border-white/[0.08] bg-zinc-900 px-4 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
