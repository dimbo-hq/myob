'use client';

import React, { useState } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { POLineItem } from '@/types/inventory';
import { getRelativeDate } from '@/lib/dateUtils';
import { FileText, Plus, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CreatePOModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreatePOModal: React.FC<CreatePOModalProps> = ({ isOpen, onClose }) => {
  const { suppliers, items, createPurchaseOrder } = useInventory();

  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [lineItems, setLineItems] = useState<POLineItem[]>([]);
  const [selectedProductToAdd, setSelectedProductToAdd] = useState<string>('');
  const [orderQuantity, setOrderQuantity] = useState<number>(20);
  const [shippingFee, setShippingFee] = useState<number>(15.0);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const currentSupplier = suppliers.find((s) => s.id === supplierId) || suppliers[0];
  const supplierProducts = items.filter((it) => it.supplierId === currentSupplier?.id || it.supplierName === currentSupplier?.name);

  const handleAddLineItem = () => {
    if (!selectedProductToAdd) return;
    const product = items.find((i) => i.id === selectedProductToAdd);
    if (!product) return;
    if (lineItems.some((l) => l.itemId === product.id)) return;

    const newLine: POLineItem = {
      itemId: product.id,
      sku: product.sku,
      name: product.name,
      unit: product.unit,
      orderedQty: orderQuantity,
      receivedQty: 0,
      unitCost: product.costPrice,
      totalCost: Math.round(orderQuantity * product.costPrice * 100) / 100
    };

    setLineItems([...lineItems, newLine]);
    setSelectedProductToAdd('');
    setOrderQuantity(20);
  };

  const handleRemoveLine = (itemId: string) => {
    setLineItems(lineItems.filter((l) => l.itemId !== itemId));
  };

  const handleUpdateLineQty = (itemId: string, qty: number) => {
    setLineItems(
      lineItems.map((l) => {
        if (l.itemId === itemId) {
          const safeQty = Math.max(1, qty);
          return {
            ...l,
            orderedQty: safeQty,
            totalCost: Math.round(safeQty * l.unitCost * 100) / 100
          };
        }
        return l;
      })
    );
  };

  const subtotal = lineItems.reduce((acc, curr) => acc + curr.totalCost, 0);
  const totalAmount = Math.round((subtotal + shippingFee) * 100) / 100;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (lineItems.length === 0) return;

    createPurchaseOrder({
      supplierId: currentSupplier.id,
      supplierName: currentSupplier.name,
      status: 'pending',
      orderDate: getRelativeDate(0),
      expectedDeliveryDate: getRelativeDate(currentSupplier.leadTimeDays || 2),
      items: lineItems,
      subtotal,
      tax: 0,
      shippingFee,
      totalAmount,
      notes: notes || 'Standard replenishment order',
      createdBy: 'Store Manager'
    });

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
          className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d0d10] shadow-2xl z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.06] p-4 bg-[#09090b]/50">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.08] bg-zinc-900 text-zinc-300">
                <FileText className="h-3.5 w-3.5" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-white tracking-tight">
                  Create Purchase Order
                </h3>
                <p className="text-[11px] text-zinc-500">
                  Compose replenishment order to supplier
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
            {/* Vendor Selector */}
            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400">Supplier Vendor</label>
              <select
                value={supplierId}
                onChange={(e) => {
                  setSupplierId(e.target.value);
                  setLineItems([]);
                }}
                className="w-full rounded-lg border border-white/[0.06] bg-zinc-900 px-3 py-1.5 text-xs text-white focus:border-zinc-500 focus:outline-none"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code}) • Lead Time: {s.leadTimeDays}d
                  </option>
                ))}
              </select>
            </div>

            {/* Product Picker */}
            <div className="rounded-lg border border-white/[0.06] bg-zinc-900/40 p-3 space-y-2">
              <div className="text-[11px] font-medium text-zinc-300">Add Line Item</div>
              <div className="flex gap-2">
                <select
                  value={selectedProductToAdd}
                  onChange={(e) => setSelectedProductToAdd(e.target.value)}
                  className="flex-1 rounded-lg border border-white/[0.06] bg-zinc-900 px-2.5 py-1 text-xs text-white focus:border-zinc-500 focus:outline-none"
                >
                  <option value="">Select product...</option>
                  {(supplierProducts.length > 0 ? supplierProducts : items).map((it) => (
                    <option key={it.id} value={it.id}>
                      {it.name} (${it.costPrice.toFixed(2)}/{it.unit}) • Stock: {it.currentStock}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  min="1"
                  value={orderQuantity}
                  onChange={(e) => setOrderQuantity(Math.max(1, Number(e.target.value) || 1))}
                  className="w-16 rounded-lg border border-white/[0.06] bg-zinc-900 px-2 py-1 text-xs text-white text-center font-mono focus:border-zinc-500 focus:outline-none"
                />

                <button
                  type="button"
                  onClick={handleAddLineItem}
                  disabled={!selectedProductToAdd}
                  className="rounded-lg border border-white/[0.08] bg-zinc-800 px-3 py-1 text-xs text-zinc-200 hover:bg-zinc-700 disabled:opacity-40"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Lines List */}
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {lineItems.length === 0 ? (
                <div className="text-center py-5 text-zinc-600 text-xs border border-dashed border-white/[0.06] rounded-lg">
                  No line items added yet.
                </div>
              ) : (
                lineItems.map((line) => (
                  <div
                    key={line.itemId}
                    className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-zinc-900/60 p-2.5 text-xs"
                  >
                    <div className="flex-1 pr-2 truncate">
                      <div className="font-medium text-white truncate">{line.name}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">${line.unitCost.toFixed(2)} / {line.unit}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        value={line.orderedQty}
                        onChange={(e) => handleUpdateLineQty(line.itemId, Number(e.target.value) || 1)}
                        className="w-14 rounded border border-white/[0.06] bg-zinc-950 px-1.5 py-0.5 text-xs font-mono text-center text-white"
                      />
                      <span className="font-mono text-white text-xs w-16 text-right font-medium">
                        ${line.totalCost.toFixed(2)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveLine(line.itemId)}
                        className="text-zinc-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Financial summary */}
            <div className="rounded-lg border border-white/[0.04] bg-zinc-900/40 p-3 space-y-1 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal ({lineItems.length} lines)</span>
                <span className="font-mono text-zinc-200">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Freight</span>
                <span className="font-mono text-zinc-200">${shippingFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-white/[0.06] pt-1.5 font-medium text-white">
                <span>Total PO</span>
                <span className="font-mono text-emerald-400 font-semibold">${totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400">Order Notes</label>
              <input
                type="text"
                placeholder="Optional supplier instructions..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-lg border border-white/[0.06] bg-zinc-900 px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t border-white/[0.06]">
              <button
                type="submit"
                disabled={lineItems.length === 0}
                className="flex-1 rounded-lg bg-zinc-100 py-2 text-xs font-semibold text-zinc-900 hover:bg-white active:scale-95 disabled:opacity-40 transition-all shadow-sm"
              >
                Submit Purchase Order
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
