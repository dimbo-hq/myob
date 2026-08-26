'use client';

import React, { useState } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { InventoryItem, MovementType } from '@/types/inventory';
import { SlidersHorizontal, Plus, Minus, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface QuickAdjustModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem;
}

export const QuickAdjustModal: React.FC<QuickAdjustModalProps> = ({
  isOpen,
  onClose,
  item
}) => {
  const { adjustStock } = useInventory();

  const [mode, setMode] = useState<'add' | 'remove'>('add');
  const [amount, setAmount] = useState<number>(5);
  const [reason, setReason] = useState('Store Cycle Count Audit');
  const [selectedBatch, setSelectedBatch] = useState<string>(item.batches[0]?.batchNumber || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    const delta = mode === 'add' ? amount : -amount;
    const movementType: MovementType = 'ADJUSTMENT';

    adjustStock(item.id, delta, reason, movementType, selectedBatch || undefined);
    onClose();
  };

  const resultingStock = Math.max(0, item.currentStock + (mode === 'add' ? amount : -amount));

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
          className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d0d10] p-5 shadow-2xl z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.08] bg-zinc-900 text-zinc-300">
                <SlidersHorizontal className="h-3.5 w-3.5" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-white tracking-tight">
                  Stock Adjustment
                </h3>
                <p className="text-[11px] text-zinc-500">
                  {item.name} ({item.currentStock} {item.unit})
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-zinc-500 hover:bg-zinc-800 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="pt-4 space-y-3.5 text-xs">
            {/* Mode toggle */}
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setMode('add')}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition-all ${
                  mode === 'add'
                    ? 'bg-zinc-200 text-zinc-900 font-semibold'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white'
                }`}
              >
                <Plus className="h-3 w-3" />
                <span>Restock / Add (+)</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('remove')}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition-all ${
                  mode === 'remove'
                    ? 'bg-zinc-200 text-zinc-900 font-semibold'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white'
                }`}
              >
                <Minus className="h-3 w-3" />
                <span>Deduct (-)</span>
              </button>
            </div>

            {/* Quantity */}
            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400">Adjustment Quantity ({item.unit})</label>
              <div className="flex gap-1.5">
                <input
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full font-mono rounded-lg border border-white/[0.06] bg-zinc-900 px-3 py-1.5 text-xs text-white focus:border-zinc-500 focus:outline-none"
                />
                <div className="flex gap-1">
                  {[5, 10, 20].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmount(val)}
                      className="rounded-lg border border-white/[0.06] bg-zinc-900 px-2 py-1 text-xs text-zinc-400 hover:text-white"
                    >
                      +{val}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Target Batch */}
            {item.batches.length > 0 && (
              <div className="space-y-1">
                <label className="text-[11px] text-zinc-400">Target Batch</label>
                <select
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  className="w-full rounded-lg border border-white/[0.06] bg-zinc-900 px-2.5 py-1.5 text-xs text-white focus:border-zinc-500 focus:outline-none"
                >
                  <option value="">General Shelf Inventory</option>
                  {item.batches.map((b) => (
                    <option key={b.id} value={b.batchNumber}>
                      #{b.batchNumber} ({b.quantity} {item.unit} • Exp: {b.expiryDate})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Reason */}
            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400">Audit Reason</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-lg border border-white/[0.06] bg-zinc-900 px-2.5 py-1.5 text-xs text-white focus:border-zinc-500 focus:outline-none"
              >
                <option value="Store Cycle Count Audit">Physical Shelf Count</option>
                <option value="Supplier Direct Top-Up">Supplier Direct Top-Up</option>
                <option value="Customer Return to Stock">Customer Return</option>
                <option value="Inter-store Transfer">Warehouse Transfer</option>
              </select>
            </div>

            {/* Result preview */}
            <div className="rounded-lg border border-white/[0.04] bg-zinc-900/40 p-2.5 flex items-center justify-between text-xs text-zinc-400">
              <span>Resulting Stock:</span>
              <span className="font-mono text-white">
                {item.currentStock} → <strong className="text-white font-medium">{resultingStock} {item.unit}</strong>
              </span>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-2 border-t border-white/[0.06]">
              <button
                type="submit"
                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-zinc-100 py-2 text-xs font-semibold text-zinc-900 hover:bg-white active:scale-95 transition-all shadow-sm"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Save Stock</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-white/[0.08] bg-zinc-900 px-4 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
