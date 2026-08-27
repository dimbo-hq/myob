'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { SalesOrder, RefundRecord, RefundItem } from '@/types/inventory';
import { 
  RotateCcw, 
  Search, 
  X, 
  Check, 
  Receipt, 
  User, 
  Phone, 
  Calendar, 
  AlertCircle, 
  Building2, 
  Printer, 
  ArrowLeft,
  Coins,
  QrCode,
  CreditCard,
  Layers,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { formatINR } from '@/lib/currency';
import { motion, AnimatePresence } from 'motion/react';

interface ReturnRefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrderNumber?: string;
}

export const ReturnRefundModal: React.FC<ReturnRefundModalProps> = ({
  isOpen,
  onClose,
  initialOrderNumber
}) => {
  const { salesOrders, processOrderReturn, addToast } = useInventory();

  const [orderQuery, setOrderQuery] = useState(initialOrderNumber || '');
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);

  // Return Items State: itemId -> { quantity: number, returnToInventory: boolean, reason: string }
  const [returnItemsState, setReturnItemsState] = useState<
    Record<string, { quantity: number; returnToInventory: boolean; reason: string }>
  >({});

  const [refundMethod, setRefundMethod] = useState<'CASH' | 'UPI' | 'STORE_CREDIT' | 'CARD'>('CASH');
  const [returnNotes, setReturnNotes] = useState('');
  const [completedRefund, setCompletedRefund] = useState<RefundRecord | null>(null);

  // When initialOrderNumber changes or modal opens
  useEffect(() => {
    if (initialOrderNumber) {
      setOrderQuery(initialOrderNumber);
      const found = salesOrders.find((o) => o.orderNumber === initialOrderNumber);
      if (found) {
        handleSelectOrder(found);
      }
    }
  }, [initialOrderNumber, salesOrders]);

  if (!isOpen) return null;

  // Search orders matching query
  const matchingOrders = useMemo(() => {
    const q = orderQuery.toLowerCase().trim();
    if (!q) return [];
    return salesOrders.filter((o) => {
      const matchOrder = o.orderNumber.toLowerCase().includes(q);
      const matchPhone = o.customer?.phone.toLowerCase().includes(q) || false;
      const matchName = o.customer?.name.toLowerCase().includes(q) || false;
      return matchOrder || matchPhone || matchName;
    }).slice(0, 6);
  }, [salesOrders, orderQuery]);

  const handleSelectOrder = (order: SalesOrder) => {
    setSelectedOrder(order);
    const initialMap: Record<string, { quantity: number; returnToInventory: boolean; reason: string }> = {};
    order.items.forEach((it) => {
      initialMap[it.itemId] = {
        quantity: 0,
        returnToInventory: true,
        reason: 'Customer return / exchange'
      };
    });
    setReturnItemsState(initialMap);
  };

  const handleQuantityChange = (itemId: string, qty: number, maxQty: number) => {
    const validQty = Math.max(0, Math.min(qty, maxQty));
    setReturnItemsState((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        quantity: validQty
      }
    }));
  };

  const handleToggleRestock = (itemId: string) => {
    setReturnItemsState((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        returnToInventory: !prev[itemId]?.returnToInventory
      }
    }));
  };

  // Calculate Refund Totals
  const refundSubtotal = useMemo(() => {
    if (!selectedOrder) return 0;
    let sum = 0;
    selectedOrder.items.forEach((it) => {
      const ret = returnItemsState[it.itemId];
      if (ret && ret.quantity > 0) {
        sum += it.unitPrice * ret.quantity;
      }
    });
    return Math.round(sum * 100) / 100;
  }, [selectedOrder, returnItemsState]);

  const refundTax = Math.round(refundSubtotal * 0.05 * 100) / 100;
  const grandRefundTotal = Math.round((refundSubtotal + refundTax) * 100) / 100;

  const totalItemsToReturnCount = Object.values(returnItemsState).filter((v) => v.quantity > 0).length;

  const handleProcessRefund = () => {
    if (!selectedOrder) return;
    if (totalItemsToReturnCount === 0) {
      addToast({
        type: 'warning',
        title: 'No Items Selected',
        message: 'Please choose at least 1 item and quantity to return.'
      });
      return;
    }

    const payload = selectedOrder.items
      .filter((it) => returnItemsState[it.itemId]?.quantity > 0)
      .map((it) => ({
        itemId: it.itemId,
        quantity: returnItemsState[it.itemId].quantity,
        returnToInventory: returnItemsState[it.itemId].returnToInventory,
        reason: returnItemsState[it.itemId].reason || returnNotes || 'Customer Return'
      }));

    const result = processOrderReturn(selectedOrder.orderNumber, payload, refundMethod, returnNotes);
    if (result.success && result.refundRecord) {
      setCompletedRefund(result.refundRecord);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative flex h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-950 shadow-2xl z-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] p-4 bg-zinc-900/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <RotateCcw className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>1-Click Return & Refund Terminal</span>
                <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-1.5 py-0.2 rounded border border-zinc-700">
                  POS Counter
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                Lookup receipt ID, specify returned units, and restock or write off defective goods
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Content */}
        {!completedRefund ? (
          <div className="flex flex-1 flex-col overflow-y-auto p-4 space-y-4">
            {/* Step 1: Search Order */}
            {!selectedOrder ? (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Enter Receipt # (e.g. ORD-849201) or Customer Mobile (e.g. 9876...)..."
                    value={orderQuery}
                    onChange={(e) => setOrderQuery(e.target.value)}
                    className="w-full rounded-xl border border-white/[0.08] bg-zinc-900 pl-9 pr-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
                    autoFocus
                  />
                </div>

                {matchingOrders.length > 0 ? (
                  <div className="space-y-2">
                    <span className="text-[11px] font-semibold text-zinc-400 font-mono">
                      Matching Transactions ({matchingOrders.length}):
                    </span>
                    <div className="space-y-1.5">
                      {matchingOrders.map((o) => (
                        <div
                          key={o.id}
                          onClick={() => handleSelectOrder(o)}
                          className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-zinc-900/40 p-3 hover:bg-zinc-800/60 hover:border-amber-500/30 cursor-pointer transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <div className="font-mono font-bold text-amber-400 text-xs">
                              #{o.orderNumber}
                            </div>
                            <div className="text-xs text-zinc-300">
                              {o.customer ? `${o.customer.name} (${o.customer.phone})` : 'Walk-in Guest'}
                            </div>
                            <div className="text-[10px] text-zinc-500 font-mono">
                              {new Date(o.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="font-mono font-bold text-white text-xs">
                              {formatINR(o.total)}
                            </span>
                            <span className="text-[10px] rounded bg-zinc-800 px-2 py-0.5 text-zinc-300 font-mono">
                              {o.itemCount} items
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : orderQuery.trim() ? (
                  <div className="p-8 text-center text-zinc-500 text-xs">
                    No orders found matching "{orderQuery}". Verify receipt number.
                  </div>
                ) : (
                  <div className="p-8 text-center text-zinc-500 text-xs">
                    Scan or type the customer's receipt number to start a return.
                  </div>
                )}
              </div>
            ) : (
              /* Step 2: Selected Order Items Return Form */
              <div className="space-y-4">
                {/* Order Summary Strip */}
                <div className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-zinc-900/60 p-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="rounded-lg bg-zinc-800 p-1.5 text-zinc-400 hover:text-white"
                      title="Choose different order"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                    </button>
                    <div>
                      <div className="font-mono font-bold text-white text-xs flex items-center gap-2">
                        <span>Receipt #{selectedOrder.orderNumber}</span>
                        <span className="text-[10px] font-normal px-2 py-0.2 rounded bg-zinc-800 text-zinc-300">
                          {selectedOrder.paymentMethod}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">
                        {selectedOrder.customer ? `${selectedOrder.customer.name} • ${selectedOrder.customer.phone}` : 'Walk-in Guest'} • Original Total: <strong className="text-emerald-400">{formatINR(selectedOrder.total)}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Line Items Table */}
                <div className="rounded-xl border border-white/[0.06] overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-white/[0.06] bg-zinc-900/80 text-[10px] uppercase font-mono text-zinc-400">
                      <tr>
                        <th className="px-3 py-2.5">Item</th>
                        <th className="px-3 py-2.5 text-center">Purchased</th>
                        <th className="px-3 py-2.5 text-center">Return Qty</th>
                        <th className="px-3 py-2.5 text-center">Disposition</th>
                        <th className="px-3 py-2.5 text-right">Refund</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04] text-zinc-300">
                      {selectedOrder.items.map((item) => {
                        const retState = returnItemsState[item.itemId] || {
                          quantity: 0,
                          returnToInventory: true,
                          reason: ''
                        };
                        const itemRefund = Math.round(item.unitPrice * retState.quantity * 100) / 100;

                        return (
                          <tr key={item.itemId} className="hover:bg-zinc-900/40">
                            <td className="px-3 py-2.5">
                              <div className="font-semibold text-white">{item.itemName}</div>
                              <div className="text-[10px] text-zinc-500 font-mono">{item.sku} • {formatINR(item.unitPrice)}/{item.unit}</div>
                            </td>
                            <td className="px-3 py-2.5 text-center font-mono text-zinc-400">
                              {item.quantity} {item.unit}
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              <input
                                type="number"
                                min="0"
                                max={item.quantity}
                                step={item.unit === 'kg' || item.unit === 'g' ? '0.1' : '1'}
                                value={retState.quantity}
                                onChange={(e) => handleQuantityChange(item.itemId, parseFloat(e.target.value) || 0, item.quantity)}
                                className="w-16 text-center font-mono text-xs font-bold rounded bg-zinc-900 border border-white/[0.1] text-white py-1"
                              />
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              {retState.quantity > 0 ? (
                                <button
                                  type="button"
                                  onClick={() => handleToggleRestock(item.itemId)}
                                  className={`rounded-lg px-2 py-1 text-[10px] font-bold transition-all ${
                                    retState.returnToInventory
                                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                  }`}
                                >
                                  {retState.returnToInventory ? '✅ Restock to Shelf' : '🗑️ Defective / Wastage'}
                                </button>
                              ) : (
                                <span className="text-zinc-600">—</span>
                              )}
                            </td>
                            <td className="px-3 py-2.5 text-right font-mono font-bold text-white">
                              {retState.quantity > 0 ? formatINR(itemRefund) : '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Refund Method & Notes */}
                {totalItemsToReturnCount > 0 && (
                  <div className="rounded-xl border border-white/[0.08] bg-zinc-900/40 p-3.5 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                          Refund Tender Method
                        </label>
                        <div className="grid grid-cols-4 gap-1">
                          {(['CASH', 'UPI', 'CARD', 'STORE_CREDIT'] as const).map((m) => (
                            <button
                              key={m}
                              type="button"
                              onClick={() => setRefundMethod(m)}
                              className={`rounded-lg py-1.5 text-[10px] font-bold font-mono transition-all ${
                                refundMethod === m
                                  ? 'bg-amber-500 text-zinc-950 shadow-md'
                                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/[0.04]'
                              }`}
                            >
                              {m}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                          Return Reason / Notes
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Size exchange, packaging damaged, duplicate purchase"
                          value={returnNotes}
                          onChange={(e) => setReturnNotes(e.target.value)}
                          className="w-full rounded-lg border border-white/[0.08] bg-zinc-900 px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Refund Summary Strip */}
                    <div className="flex items-center justify-between border-t border-white/[0.06] pt-3 text-xs">
                      <div className="text-zinc-400">
                        Items Returning: <strong className="text-white font-mono">{totalItemsToReturnCount}</strong>
                      </div>
                      <div className="flex items-center gap-3 font-mono">
                        <span className="text-zinc-400">Subtotal: {formatINR(refundSubtotal)}</span>
                        <span className="text-zinc-400">GST (5%): {formatINR(refundTax)}</span>
                        <span className="text-sm font-bold text-amber-400 border-l border-white/[0.1] pl-3">
                          Total Refund: {formatINR(grandRefundTotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Step 3: Completed Refund Credit Voucher Receipt */
          <div className="flex flex-1 flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <Check className="h-6 w-6" />
            </div>

            <div>
              <h4 className="text-base font-bold text-white">Refund Successfully Processed</h4>
              <p className="text-xs text-zinc-400 mt-1 font-mono">
                Credit Voucher #{completedRefund.refundNumber} for Original #{completedRefund.originalOrderNumber}
              </p>
            </div>

            <div className="w-full max-w-sm rounded-xl border border-white/[0.08] bg-zinc-900/60 p-4 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400">Total Refunded:</span>
                <span className="font-mono font-bold text-amber-400 text-sm">
                  {formatINR(completedRefund.totalRefundAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Tender Mode:</span>
                <span className="font-mono text-zinc-200">{completedRefund.refundMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Items Returned:</span>
                <span className="font-mono text-zinc-200">{completedRefund.items.length} line items</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-zinc-800 px-4 py-2 text-xs font-bold text-white hover:bg-zinc-700 cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print Credit Voucher</span>
              </button>
              <button
                onClick={onClose}
                className="rounded-lg bg-zinc-100 px-4 py-2 text-xs font-bold text-zinc-950 hover:bg-white cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        {!completedRefund && selectedOrder && (
          <div className="border-t border-white/[0.06] bg-zinc-900/80 p-3.5 flex items-center justify-between shrink-0">
            <button
              onClick={() => setSelectedOrder(null)}
              className="text-xs font-semibold text-zinc-400 hover:text-white"
            >
              Cancel Selection
            </button>

            <button
              onClick={handleProcessRefund}
              disabled={totalItemsToReturnCount === 0}
              className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-zinc-950 hover:bg-amber-400 active:scale-95 disabled:opacity-40 transition-all shadow-md cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Issue Refund ({formatINR(grandRefundTotal)})</span>
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
