'use client';

import React, { useState } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { InventoryItem, BatchInfo, WastageLog } from '@/types/inventory';
import { Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WasteLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem;
  batch?: BatchInfo;
}

export const WasteLogModal: React.FC<WasteLogModalProps> = ({
  isOpen,
  onClose,
  item,
  batch
}) => {
  const { writeOffBatch } = useInventory();

  const maxQty = batch ? batch.quantity : item.currentStock;
  const [quantity, setQuantity] = useState<number>(batch ? batch.quantity : 1);
  const [reason, setReason] = useState<WastageLog['reason']>('expired');
  const [disposal, setDisposal] = useState<WastageLog['disposalMethod']>('compost');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const totalFinancialLoss = Math.round(quantity * item.costPrice * 100) / 100;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) return;

    const batchId = batch?.id || (item.batches[0]?.id ?? '');
    writeOffBatch(item.id, batchId, quantity, reason, disposal, notes);
    onClose();
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
          className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d0d10] p-5 shadow-2xl z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.08] bg-zinc-900 text-zinc-300">
                <Trash2 className="h-3.5 w-3.5" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-white tracking-tight">
                  Log Spoilage & Wastage
                </h3>
                <p className="text-[11px] text-zinc-500">
                  {item.name} ({batch ? `Batch #${batch.batchNumber}` : 'General Stock'})
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
            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400 flex justify-between">
                <span>Quantity to Write Off ({item.unit})</span>
                <span className="text-zinc-600">Available: {maxQty}</span>
              </label>
              <input
                type="number"
                min="1"
                max={maxQty}
                value={quantity}
                onChange={(e) => setQuantity(Math.min(maxQty, Math.max(1, Number(e.target.value) || 1)))}
                className="w-full font-mono rounded-lg border border-white/[0.06] bg-zinc-900 px-3 py-1.5 text-xs text-white focus:border-zinc-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400">Reason</label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'expired', label: 'Past Expiry' },
                  { id: 'damaged', label: 'Damaged' },
                  { id: 'spoiled_cold_chain', label: 'Cold Chain Fault' },
                  { id: 'packaging_defect', label: 'Packaging Defect' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setReason(opt.id as any)}
                    className={`rounded-lg border py-1.5 px-2 text-left text-xs transition-all ${
                      reason === opt.id
                        ? 'border-white/[0.2] bg-zinc-800 text-white font-medium'
                        : 'border-white/[0.04] bg-zinc-900/60 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400">Disposal Channel</label>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { id: 'compost', label: 'Compost' },
                  { id: 'supplier_claim', label: 'Supplier Claim' },
                  { id: 'landfill', label: 'General Waste' }
                ].map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDisposal(d.id as any)}
                    className={`rounded border py-1 px-1.5 text-[11px] text-center transition-all ${
                      disposal === d.id
                        ? 'border-white/[0.2] bg-zinc-800 text-white font-medium'
                        : 'border-white/[0.04] bg-zinc-900/60 text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400">Notes (Optional)</label>
              <input
                type="text"
                placeholder="Details..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-lg border border-white/[0.06] bg-zinc-900 px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
              />
            </div>

            <div className="rounded-lg border border-white/[0.04] bg-zinc-900/40 p-2.5 flex items-center justify-between text-xs text-zinc-400">
              <span>Financial Loss Impact:</span>
              <span className="font-mono text-rose-400 font-medium">-${totalFinancialLoss.toFixed(2)}</span>
            </div>

            <div className="flex gap-2 pt-2 border-t border-white/[0.06]">
              <button
                type="submit"
                className="flex-1 rounded-lg bg-rose-600 py-2 text-xs font-semibold text-white hover:bg-rose-500 active:scale-95 transition-all shadow-sm"
              >
                Confirm Write-Off
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
