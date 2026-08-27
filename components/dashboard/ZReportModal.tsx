'use client';

import React, { useState, useMemo } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { ZReportRecord } from '@/types/inventory';
import { 
  Moon, 
  X, 
  Check, 
  Printer, 
  Download, 
  Coins, 
  Banknote, 
  CreditCard, 
  QrCode, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Building2, 
  Calendar, 
  Layers, 
  ShoppingBag,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { formatINR } from '@/lib/currency';
import { motion, AnimatePresence } from 'motion/react';

interface ZReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ZReportModal: React.FC<ZReportModalProps> = ({ isOpen, onClose }) => {
  const { salesOrders, refundRecords, storeName, generateZReport, addToast } = useInventory();

  const todayStr = new Date().toISOString().slice(0, 10);
  const [openingCashInput, setOpeningCashInput] = useState<string>('2000');
  const [countedCashInput, setCountedCashInput] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [savedZReport, setSavedZReport] = useState<ZReportRecord | null>(null);

  // Compute today's live register metrics
  const todayOrders = useMemo(() => {
    return salesOrders.filter((o) => {
      const oDate = o.timestamp ? o.timestamp.slice(0, 10) : '';
      return oDate === todayStr && o.status !== 'cancelled';
    });
  }, [salesOrders, todayStr]);

  const totalOrdersCount = todayOrders.length;
  const totalUnitsSold = todayOrders.reduce((a, o) => a + o.totalUnits, 0);
  const grossSales = todayOrders.reduce((a, o) => a + o.subtotal, 0);
  const totalDiscounts = todayOrders.reduce((a, o) => a + o.discountTotal, 0);
  const taxCollected = todayOrders.reduce((a, o) => a + o.tax, 0);
  const grandTotal = todayOrders.reduce((a, o) => a + o.total, 0);

  // Tender breakdowns
  let cashSales = 0;
  let upiSales = 0;
  let cardSales = 0;
  let splitSales = 0;

  todayOrders.forEach((o) => {
    if (o.paymentMethod === 'CASH') cashSales += o.total;
    else if (o.paymentMethod === 'UPI') upiSales += o.total;
    else if (o.paymentMethod === 'CARD') cardSales += o.total;
    else if (o.paymentMethod === 'SPLIT' && o.paymentBreakdown) {
      cashSales += o.paymentBreakdown.cash || 0;
      upiSales += o.paymentBreakdown.upi || 0;
      cardSales += o.paymentBreakdown.card || 0;
      splitSales += o.total;
    } else {
      cashSales += o.total;
    }
  });

  // Today's refunds
  const todayRefunds = refundRecords.filter((r) => r.timestamp.slice(0, 10) === todayStr);
  const totalRefundsAmount = todayRefunds.reduce((a, r) => a + r.totalRefundAmount, 0);
  const cashRefunds = todayRefunds
    .filter((r) => r.refundMethod === 'CASH')
    .reduce((a, r) => a + r.totalRefundAmount, 0);

  // Cash Drawer Calculations
  const openingCash = parseFloat(openingCashInput) || 0;
  const expectedCash = Math.round((openingCash + cashSales - cashRefunds) * 100) / 100;
  const countedCash = countedCashInput.trim() !== '' ? parseFloat(countedCashInput) || 0 : expectedCash;
  const discrepancy = Math.round((countedCash - expectedCash) * 100) / 100;

  // Top selling products
  const topSellingItems = useMemo(() => {
    const itemMap: Record<string, { name: string; quantity: number; revenue: number }> = {};
    todayOrders.forEach((o) => {
      o.items.forEach((it) => {
        if (!itemMap[it.itemId]) {
          itemMap[it.itemId] = { name: it.itemName, quantity: 0, revenue: 0 };
        }
        itemMap[it.itemId].quantity += it.quantity;
        itemMap[it.itemId].revenue += it.total;
      });
    });
    return Object.values(itemMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [todayOrders]);

  if (!isOpen) return null;

  const handleSaveReport = () => {
    const record = generateZReport(openingCash, countedCash, notes);
    setSavedZReport(record);
  };

  const handlePrint = () => {
    window.print();
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
        className="relative flex h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-950 shadow-2xl z-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] p-4 bg-zinc-900/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Moon className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>End-of-Day Register Tally (Z-Report)</span>
                <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-1.5 py-0.2 rounded border border-zinc-700">
                  {todayStr}
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                Reconcile physical cash in drawer against POS tender receipts before closing register
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

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* Top Performance Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-3">
              <div className="text-[10px] uppercase font-mono text-zinc-400">Total Revenue</div>
              <div className="text-base font-bold font-mono text-emerald-400 mt-0.5">
                {formatINR(grandTotal)}
              </div>
              <div className="text-[10px] text-zinc-500">{totalOrdersCount} Completed Sales</div>
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-3">
              <div className="text-[10px] uppercase font-mono text-zinc-400">Gross Sales</div>
              <div className="text-base font-bold font-mono text-white mt-0.5">
                {formatINR(grossSales)}
              </div>
              <div className="text-[10px] text-zinc-500">{totalUnitsSold} Units Sold</div>
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-3">
              <div className="text-[10px] uppercase font-mono text-zinc-400">GST (5%) Collected</div>
              <div className="text-base font-bold font-mono text-sky-400 mt-0.5">
                {formatINR(taxCollected)}
              </div>
              <div className="text-[10px] text-zinc-500">Tax Liability</div>
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-3">
              <div className="text-[10px] uppercase font-mono text-zinc-400">Discounts Given</div>
              <div className="text-base font-bold font-mono text-amber-400 mt-0.5">
                -{formatINR(totalDiscounts)}
              </div>
              <div className="text-[10px] text-zinc-500">Clearance AI + Deals</div>
            </div>
          </div>

          {/* Tender Settlement Breakdown Table */}
          <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-3.5 space-y-2.5">
            <h4 className="text-xs font-bold text-white flex items-center justify-between">
              <span>Tender Settlement Breakdown</span>
              <span className="text-[10px] font-mono text-zinc-500">Verified by POS</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="rounded-lg bg-zinc-900/90 border border-white/[0.04] p-2.5">
                <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] mb-1">
                  <Banknote className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Cash Sales</span>
                </div>
                <div className="font-mono font-bold text-sm text-white">{formatINR(cashSales)}</div>
              </div>

              <div className="rounded-lg bg-zinc-900/90 border border-white/[0.04] p-2.5">
                <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] mb-1">
                  <QrCode className="h-3.5 w-3.5 text-sky-400" />
                  <span>UPI / QR</span>
                </div>
                <div className="font-mono font-bold text-sm text-white">{formatINR(upiSales)}</div>
              </div>

              <div className="rounded-lg bg-zinc-900/90 border border-white/[0.04] p-2.5">
                <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] mb-1">
                  <CreditCard className="h-3.5 w-3.5 text-purple-400" />
                  <span>Card EDC</span>
                </div>
                <div className="font-mono font-bold text-sm text-white">{formatINR(cardSales)}</div>
              </div>

              <div className="rounded-lg bg-zinc-900/90 border border-white/[0.04] p-2.5">
                <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] mb-1">
                  <RotateCcw className="h-3.5 w-3.5 text-rose-400" />
                  <span>Returns / Refunds</span>
                </div>
                <div className="font-mono font-bold text-sm text-rose-400">-{formatINR(totalRefundsAmount)}</div>
              </div>
            </div>
          </div>

          {/* Cash Drawer Reconciliation Box (Crucial for Cashier Shift) */}
          <div className="rounded-xl border border-white/[0.08] bg-zinc-900/70 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Coins className="h-4 w-4 text-amber-400" />
                <span>Physical Cash Drawer Tally</span>
              </h4>
              <span className="text-[10px] font-mono text-zinc-400">Shift End Verification</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  Opening Cash Float (Morning)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-mono">₹</span>
                  <input
                    type="number"
                    value={openingCashInput}
                    onChange={(e) => setOpeningCashInput(e.target.value)}
                    className="w-full rounded-lg border border-white/[0.08] bg-zinc-950 pl-7 pr-3 py-1.5 text-xs text-white font-mono font-bold focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  Physical Counted Cash in Drawer
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-mono">₹</span>
                  <input
                    type="number"
                    placeholder={`Expected: ₹${expectedCash}`}
                    value={countedCashInput}
                    onChange={(e) => setCountedCashInput(e.target.value)}
                    className="w-full rounded-lg border border-white/[0.08] bg-zinc-950 pl-7 pr-3 py-1.5 text-xs text-white font-mono font-bold focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Reconciliation Comparison Result */}
            <div className="rounded-xl border border-white/[0.06] bg-zinc-950/80 p-3 space-y-2">
              <div className="flex justify-between text-zinc-400 text-xs">
                <span>Expected Drawer Cash (Opening + Cash Sales - Refunds):</span>
                <span className="font-mono font-bold text-white">{formatINR(expectedCash)}</span>
              </div>
              <div className="flex justify-between text-zinc-400 text-xs">
                <span>Cashier Counted Drawer Cash:</span>
                <span className="font-mono font-bold text-white">{formatINR(countedCash)}</span>
              </div>

              <div className="flex items-center justify-between border-t border-white/[0.06] pt-2">
                <span className="font-bold text-xs text-white">Register Discrepancy Status:</span>
                {discrepancy === 0 ? (
                  <span className="flex items-center gap-1 text-emerald-400 font-mono font-bold text-xs bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Exact Balanced (₹0.00)
                  </span>
                ) : discrepancy > 0 ? (
                  <span className="flex items-center gap-1 text-sky-400 font-mono font-bold text-xs bg-sky-500/10 px-2.5 py-0.5 rounded border border-sky-500/20">
                    <TrendingUp className="h-3.5 w-3.5" />
                    Overage (+{formatINR(discrepancy)})
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-rose-400 font-mono font-bold text-xs bg-rose-500/10 px-2.5 py-0.5 rounded border border-rose-500/20">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Shortage (-{formatINR(Math.abs(discrepancy))})
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                Shift Notes / Handover Remarks
              </label>
              <input
                type="text"
                placeholder="e.g. Counter handed over to evening supervisor. All UPI receipts cross-verified."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-lg border border-white/[0.06] bg-zinc-950 px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:border-zinc-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Top Selling Products Summary */}
          {topSellingItems.length > 0 && (
            <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-3.5 space-y-2">
              <h4 className="text-xs font-bold text-white">Top 5 Best-Selling Products of the Day</h4>
              <div className="space-y-1.5">
                {topSellingItems.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs text-zinc-300">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-zinc-500">#{idx + 1}</span>
                      <span className="font-semibold text-white">{item.name}</span>
                      <span className="text-zinc-500 font-mono text-[11px]">({item.quantity} units)</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-400">{formatINR(item.revenue)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-white/[0.06] bg-zinc-900/80 p-3.5 flex items-center justify-between shrink-0">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 hover:text-white cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5 text-emerald-400" />
            <span>Print Z-Report Slip</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-lg border border-white/[0.08] px-3 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveReport}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 active:scale-95 transition-all shadow-md cursor-pointer"
            >
              <Check className="h-4 w-4" />
              <span>Close Shift & Save Z-Report</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
