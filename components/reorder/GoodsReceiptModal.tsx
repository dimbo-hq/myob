'use client';

import React, { useState } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { PurchaseOrder } from '@/types/inventory';
import { CheckCircle2, PackageCheck, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GoodsReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  po: PurchaseOrder;
}

export const GoodsReceiptModal: React.FC<GoodsReceiptModalProps> = ({
  isOpen,
  onClose,
  po
}) => {
  const { receivePurchaseOrder } = useInventory();

  const [receivedMap, setReceivedMap] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    po.items.forEach((item) => {
      initial[item.itemId] = item.orderedQty;
    });
    return initial;
  });

  if (!isOpen) return null;

  const handleQuantityChange = (itemId: string, val: number) => {
    setReceivedMap((prev) => ({
      ...prev,
      [itemId]: Math.max(0, val)
    }));
  };

  const handleAcceptAll = () => {
    const full: Record<string, number> = {};
    po.items.forEach((i) => {
      full[i.itemId] = i.orderedQty;
    });
    setReceivedMap(full);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    receivePurchaseOrder(po.id, receivedMap);
    onClose();
  };

  const totalUnits = Object.values(receivedMap).reduce((a, b) => a + b, 0);

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
          className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d0d10] shadow-2xl z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.06] p-4 bg-[#09090b]/50">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.08] bg-zinc-900 text-zinc-300">
                <PackageCheck className="h-3.5 w-3.5" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-white tracking-tight">
                  Goods Receipt Inward ({po.poNumber})
                </h3>
                <p className="text-[11px] text-zinc-500">
                  Supplier: {po.supplierName}
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

          <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Delivery Ordered on {po.orderDate}</span>
              <button
                type="button"
                onClick={handleAcceptAll}
                className="text-[11px] text-zinc-300 hover:text-white underline underline-offset-2"
              >
                Accept 100% Quantities
              </button>
            </div>

            {/* Lines List */}
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {po.items.map((line) => (
                <div
                  key={line.itemId}
                  className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-zinc-900/40 p-3"
                >
                  <div className="flex-1 pr-3">
                    <div className="font-medium text-white">{line.name}</div>
                    <div className="text-[10px] text-zinc-500 font-mono">SKU: {line.sku} • Cost: ${line.unitCost.toFixed(2)}</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right text-[11px] text-zinc-500">
                      <div>Ordered:</div>
                      <div className="font-mono text-zinc-300">{line.orderedQty} {line.unit}</div>
                    </div>

                    <div className="w-20">
                      <div className="text-[10px] text-zinc-400 mb-0.5">Received:</div>
                      <input
                        type="number"
                        min="0"
                        value={receivedMap[line.itemId] ?? line.orderedQty}
                        onChange={(e) => handleQuantityChange(line.itemId, Number(e.target.value) || 0)}
                        className="w-full rounded border border-white/[0.08] bg-zinc-950 px-2 py-1 text-xs font-mono font-medium text-white text-center"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-lg border border-white/[0.04] bg-zinc-900/40 p-3 flex justify-between items-center text-xs">
              <span className="text-zinc-400">Total Units to Restock:</span>
              <span className="font-mono font-medium text-white text-sm">{totalUnits} Units</span>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-2 border-t border-white/[0.06]">
              <button
                type="submit"
                disabled={totalUnits === 0}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-zinc-100 py-2 text-xs font-semibold text-zinc-900 hover:bg-white active:scale-95 disabled:opacity-40 transition-all shadow-sm"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Confirm & Restock Store</span>
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
