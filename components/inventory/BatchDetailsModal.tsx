'use client';

import React, { useState } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { InventoryItem, BatchInfo } from '@/types/inventory';
import { getRelativeDate } from '@/lib/dateUtils';
import { Layers, Plus, Trash2, X, Printer } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MarkdownLabelModal } from '../expiry/MarkdownLabelModal';
import { WasteLogModal } from '../expiry/WasteLogModal';

interface BatchDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem;
}

export const BatchDetailsModal: React.FC<BatchDetailsModalProps> = ({
  isOpen,
  onClose,
  item
}) => {
  const {
    getDaysUntilExpiry,
    applyBatchMarkdown,
    updateItem
  } = useInventory();

  const [isAddingBatch, setIsAddingBatch] = useState(false);
  const [newBatchNumber, setNewBatchNumber] = useState(`BAT-${Math.floor(100 + Math.random() * 900)}`);
  const [newBatchQty, setNewBatchQty] = useState(15);
  const [newBatchExpiry, setNewBatchExpiry] = useState(getRelativeDate(14));
  const [selectedLabel, setSelectedLabel] = useState<{ batch: BatchInfo; days: number } | null>(null);
  const [selectedWaste, setSelectedWaste] = useState<BatchInfo | null>(null);

  if (!isOpen) return null;

  const handleAddNewBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBatchQty <= 0) return;

    const newBatch: BatchInfo = {
      id: 'b-' + Math.random().toString(36).substring(2, 8),
      batchNumber: newBatchNumber,
      quantity: newBatchQty,
      expiryDate: newBatchExpiry,
      costPrice: item.costPrice,
      markdownPercentage: 0,
      status: 'safe'
    };

    updateItem(item.id, {
      currentStock: item.currentStock + newBatchQty,
      batches: [newBatch, ...item.batches]
    });

    setIsAddingBatch(false);
    setNewBatchNumber(`BAT-${Math.floor(100 + Math.random() * 900)}`);
  };

  return (
    <>
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
            className="relative flex max-h-[85vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d0d10] shadow-2xl z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.06] p-4 bg-[#09090b]/50">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.08] bg-zinc-900 text-zinc-300">
                  <Layers className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-white tracking-tight">
                    Batch Tracking & Shelf Life
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    {item.name} • Total: {item.currentStock} {item.unit}
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

            <div className="flex-1 overflow-y-auto p-5 space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Active Batches ({item.batches.length})
                </span>
                <button
                  onClick={() => setIsAddingBatch(!isAddingBatch)}
                  className="flex items-center gap-1 rounded-lg border border-white/[0.08] bg-zinc-900 px-2.5 py-1 text-xs text-zinc-300 hover:bg-zinc-800"
                >
                  <Plus className="h-3 w-3" />
                  <span>{isAddingBatch ? 'Cancel' : 'Add Batch'}</span>
                </button>
              </div>

              {/* Add form */}
              {isAddingBatch && (
                <form
                  onSubmit={handleAddNewBatch}
                  className="rounded-lg border border-white/[0.08] bg-zinc-900/60 p-3 space-y-2.5"
                >
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-zinc-400">Batch Code</label>
                      <input
                        type="text"
                        value={newBatchNumber}
                        onChange={(e) => setNewBatchNumber(e.target.value)}
                        className="w-full font-mono rounded border border-white/[0.06] bg-zinc-950 px-2 py-1 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-400">Qty ({item.unit})</label>
                      <input
                        type="number"
                        min="1"
                        value={newBatchQty}
                        onChange={(e) => setNewBatchQty(Math.max(1, Number(e.target.value) || 1))}
                        className="w-full font-mono rounded border border-white/[0.06] bg-zinc-950 px-2 py-1 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-400">Expiry Date</label>
                      <input
                        type="date"
                        value={newBatchExpiry}
                        onChange={(e) => setNewBatchExpiry(e.target.value)}
                        className="w-full rounded border border-white/[0.06] bg-zinc-950 px-2 py-1 text-xs text-white"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-zinc-100 py-1.5 text-xs font-semibold text-zinc-900 hover:bg-white"
                  >
                    Add Batch
                  </button>
                </form>
              )}

              {/* Batches list */}
              <div className="space-y-2">
                {item.batches.map((b) => {
                  const daysLeft = getDaysUntilExpiry(b.expiryDate);
                  const isExpired = daysLeft < 0;
                  const isCritical = daysLeft >= 0 && daysLeft <= 2;
                  const hasMarkdown = b.markdownPercentage > 0;

                  return (
                    <div
                      key={b.id}
                      className="rounded-lg border border-white/[0.04] bg-zinc-900/40 p-3 space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-semibold text-white">
                              #{b.batchNumber}
                            </span>
                            <span className="font-mono text-xs text-zinc-300">
                              {b.quantity} {item.unit}
                            </span>
                            {hasMarkdown && (
                              <span className="text-[10px] font-medium text-amber-400 bg-amber-950/40 px-1 py-0.2 rounded border border-amber-800/40">
                                -{b.markdownPercentage}%
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-zinc-500 mt-0.5">
                            Expiry: {b.expiryDate} ({daysLeft < 0 ? `Expired ${Math.abs(daysLeft)}d` : `${daysLeft}d left`})
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setSelectedLabel({ batch: b, days: daysLeft })}
                            className="rounded border border-white/[0.06] bg-zinc-800 p-1 text-zinc-400 hover:text-white"
                            title="Print Label"
                          >
                            <Printer className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => setSelectedWaste(b)}
                            className="rounded border border-white/[0.06] bg-zinc-800 p-1 text-zinc-500 hover:text-rose-400"
                            title="Write-off"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      {!isExpired && (
                        <div className="flex items-center justify-between border-t border-white/[0.03] pt-1.5 text-[11px]">
                          <span className="text-zinc-500">Markdown:</span>
                          <div className="flex gap-1">
                            {[0, 20, 35, 50].map((pct) => (
                              <button
                                key={pct}
                                onClick={() => applyBatchMarkdown(item.id, b.id, pct)}
                                className={`rounded px-1.5 py-0.5 text-[10px] ${
                                  b.markdownPercentage === pct
                                    ? 'bg-zinc-200 text-zinc-900 font-semibold'
                                    : 'bg-zinc-900 text-zinc-500 hover:text-white'
                                }`}
                              >
                                {pct === 0 ? '0%' : `-${pct}%`}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-white/[0.06] p-3 bg-[#09090b]/50 flex justify-end">
              <button
                onClick={onClose}
                className="rounded-lg border border-white/[0.08] bg-zinc-900 px-4 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>

      {selectedLabel && (
        <MarkdownLabelModal
          isOpen={!!selectedLabel}
          onClose={() => setSelectedLabel(null)}
          item={item}
          batch={selectedLabel.batch}
          daysRemaining={selectedLabel.days}
        />
      )}

      {selectedWaste && (
        <WasteLogModal
          isOpen={!!selectedWaste}
          onClose={() => setSelectedWaste(null)}
          item={item}
          batch={selectedWaste}
        />
      )}
    </>
  );
};
