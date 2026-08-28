'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { StockMovement, MovementType, SalesOrder, POSCartItem } from '@/types/inventory';
import { 
  Receipt, 
  Search, 
  Download, 
  Printer, 
  ArrowUpRight, 
  ArrowDownRight, 
  ChevronDown, 
  ChevronUp, 
  Phone, 
  User, 
  Calendar, 
  CreditCard, 
  Building2, 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Truck, 
  Sparkles, 
  FileSpreadsheet, 
  Activity, 
  Filter, 
  CheckCircle2, 
  Clock,
  ExternalLink,
  Layers,
  ShoppingBag
} from 'lucide-react';
import { formatINR } from '@/lib/currency';
import { ReceiptModal } from '@/components/pos/ReceiptModal';
import { motion, AnimatePresence } from 'motion/react';

type AuditTabMode = 'sales_orders' | 'operations_ledger';

export const AuditView: React.FC = () => {
  const { stockMovements, salesOrders, addToast } = useInventory();

  const [activeTab, setActiveTab] = useState<AuditTabMode>('sales_orders');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMovementType, setSelectedMovementType] = useState<string>('ALL');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('ALL');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Selected Order for Receipt Modal
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState<SalesOrder | null>(null);

  // Filter Sales Orders
  const filteredSalesOrders = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return salesOrders.filter((order) => {
      // Payment filter
      if (selectedPaymentMethod !== 'ALL' && order.paymentMethod !== selectedPaymentMethod) {
        return false;
      }
      if (!q) return true;

      // Match order #, customer phone, name, email, gstin, or any purchased item name / sku
      const matchOrderNum = order.orderNumber.toLowerCase().includes(q);
      const matchCustName = order.customer?.name.toLowerCase().includes(q) || false;
      const matchCustPhone = order.customer?.phone.toLowerCase().includes(q) || false;
      const matchCustGstin = order.customer?.gstin?.toLowerCase().includes(q) || false;
      const matchItem = order.items.some(
        (it) => it.itemName.toLowerCase().includes(q) || it.sku.toLowerCase().includes(q)
      );

      return matchOrderNum || matchCustName || matchCustPhone || matchCustGstin || matchItem;
    });
  }, [salesOrders, searchQuery, selectedPaymentMethod]);

  // Filter Stock Movements
  const movementTypes: { id: string; label: string }[] = [
    { id: 'ALL', label: 'All Operations' },
    { id: 'SALE', label: 'POS Sales' },
    { id: 'PRODUCT_CREATED', label: 'Products Added' },
    { id: 'PRODUCT_UPDATED', label: 'Product Edits' },
    { id: 'PRODUCT_DELETED', label: 'Product Deletions' },
    { id: 'RESTOCK', label: 'Restocks & Receipts' },
    { id: 'PO_CREATED', label: 'Purchase Orders' },
    { id: 'RETURN', label: 'Returns & Refunds' },
    { id: 'ADJUSTMENT', label: 'Cycle Count Audits' },
    { id: 'MARKDOWN_APPLIED', label: 'AI Markdowns' },
    { id: 'WASTE_EXPIRED', label: 'Wastage Disposals' },
    { id: 'CUSTOMER_ENROLLED', label: 'Customer Enrollments' },
    { id: 'BULK_IMPORT', label: 'Spreadsheet Imports' }
  ];

  const filteredMovements = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return stockMovements.filter((mov) => {
      if (selectedMovementType !== 'ALL' && mov.type !== selectedMovementType) {
        return false;
      }
      if (!q) return true;

      return (
        mov.itemName.toLowerCase().includes(q) ||
        mov.sku.toLowerCase().includes(q) ||
        mov.reason.toLowerCase().includes(q) ||
        mov.performedBy.toLowerCase().includes(q)
      );
    });
  }, [stockMovements, searchQuery, selectedMovementType]);

  // Lazy Loading States
  const [visibleSalesCount, setVisibleSalesCount] = useState(30);
  const [visibleMovementsCount, setVisibleMovementsCount] = useState(40);

  useEffect(() => {
    setVisibleSalesCount(30);
  }, [searchQuery, selectedPaymentMethod]);

  useEffect(() => {
    setVisibleMovementsCount(40);
  }, [searchQuery, selectedMovementType]);

  const displayedSalesOrders = useMemo(() => {
    return filteredSalesOrders.slice(0, visibleSalesCount);
  }, [filteredSalesOrders, visibleSalesCount]);

  const displayedMovements = useMemo(() => {
    return filteredMovements.slice(0, visibleMovementsCount);
  }, [filteredMovements, visibleMovementsCount]);

  const handleLoadMoreSales = () => {
    setVisibleSalesCount((prev) => Math.min(prev + 30, filteredSalesOrders.length));
  };

  const handleLoadMoreMovements = () => {
    setVisibleMovementsCount((prev) => Math.min(prev + 40, filteredMovements.length));
  };

  // Export Sales Orders to CSV
  const handleExportSalesOrdersCSV = () => {
    if (filteredSalesOrders.length === 0) return;

    const headers = [
      'Order Number',
      'Date & Time',
      'Customer Name',
      'Customer Phone',
      'Customer GSTIN',
      'Payment Method',
      'Total Items Count',
      'Total Units',
      'Gross Subtotal (INR)',
      'Discounts (INR)',
      'Tax (INR)',
      'Grand Total (INR)',
      'Purchased Items Breakdown'
    ];

    const rows = filteredSalesOrders.map((o) => {
      const itemsSummary = o.items.map((i) => `${i.quantity}x ${i.itemName} (${formatINR(i.total)})`).join('; ');
      return [
        `"${o.orderNumber}"`,
        `"${o.timestamp}"`,
        `"${o.customer?.name || 'Walk-in Guest'}"`,
        `"${o.customer?.phone || ''}"`,
        `"${o.customer?.gstin || ''}"`,
        `"${o.paymentMethod}"`,
        o.itemCount,
        o.totalUnits,
        o.subtotal,
        o.discountTotal,
        o.tax,
        o.total,
        `"${itemsSummary}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Sales_Transactions_History_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast({
      type: 'info',
      title: 'Sales History Exported',
      message: `Exported ${filteredSalesOrders.length} transaction records to CSV.`
    });
  };

  // Export Stock Movements to CSV
  const handleExportMovementsCSV = () => {
    if (filteredMovements.length === 0) return;

    const headers = [
      'Timestamp',
      'Operation Type',
      'Product / Entity',
      'SKU / Identifier',
      'Delta Qty',
      'Previous Stock',
      'New Stock',
      'Batch Number',
      'Description / Reason',
      'Operator',
      'Financial Impact (INR)'
    ];

    const rows = filteredMovements.map((m) => [
      `"${m.timestamp}"`,
      `"${m.type}"`,
      `"${m.itemName}"`,
      `"${m.sku}"`,
      m.quantityDelta,
      m.previousStock,
      m.newStock,
      `"${m.batchNumber || ''}"`,
      `"${m.reason}"`,
      `"${m.performedBy}"`,
      m.financialImpact
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Store_Operations_Audit_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast({
      type: 'info',
      title: 'Operations Ledger Exported',
      message: `Exported ${filteredMovements.length} audit records to CSV.`
    });
  };

  // Helper to format exact date and time
  const formatExactTimestamp = (ts: string) => {
    if (!ts || ts === 'Just now') {
      const now = new Date();
      return {
        date: now.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
      };
    }

    const d = new Date(ts);
    if (!isNaN(d.getTime())) {
      return {
        date: d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
        time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
      };
    }

    if (ts.includes(',') || ts.includes(':')) {
      const parts = ts.split(',');
      return {
        date: parts[0]?.trim() || new Date().toLocaleDateString([], { month: 'short', day: 'numeric' }),
        time: parts[1]?.trim() || ts
      };
    }

    return {
      date: ts,
      time: ''
    };
  };

  // Helper for Badge
  const getMovementBadge = (type: MovementType) => {
    switch (type) {
      case 'SALE':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">POS Sale</span>;
      case 'PRODUCT_CREATED':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">Product Added</span>;
      case 'PRODUCT_UPDATED':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">Product Edit</span>;
      case 'PRODUCT_DELETED':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">Product Deleted</span>;
      case 'RESTOCK':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Restock / GRN</span>;
      case 'PO_CREATED':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">PO Created</span>;
      case 'RETURN':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">Refund / Return</span>;
      case 'MARKDOWN_APPLIED':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">AI Markdown</span>;
      case 'WASTE_EXPIRED':
      case 'WASTE_DAMAGED':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20">Wastage</span>;
      case 'CUSTOMER_ENROLLED':
      case 'CUSTOMER_UPDATED':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">Customer</span>;
      case 'BULK_IMPORT':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/20">Spreadsheet</span>;
      case 'ADJUSTMENT':
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">Audit Count</span>;
    }
  };

  // Convert SalesOrder to POSCartItem[] for ReceiptModal
  const convertOrderToCartItems = (order: SalesOrder): POSCartItem[] => {
    return order.items.map((it) => ({
      item: {
        id: it.itemId,
        name: it.itemName,
        sku: it.sku,
        barcode: it.sku,
        brand: '',
        category: (it.category as any) || 'Pantry & Dry Goods',
        subcategory: '',
        description: '',
        currentStock: 100,
        unit: (it.unit as any) || 'pcs',
        minStockLevel: 5,
        reorderPoint: 10,
        optimalStockLevel: 50,
        maxCapacity: 100,
        location: { aisle: 'A1', shelf: 'S1', section: 'Sec1', tempZone: 'ambient' },
        costPrice: it.unitPrice * 0.7,
        sellingPrice: it.originalPrice || it.unitPrice,
        vatRate: 0.05,
        batches: [],
        supplierId: 'sup-1',
        supplierName: 'Direct',
        salesVelocity: { dailyAverage: 2, weeklySales: 10, turnoverRate: 5, lastRestockedAt: '', lastSoldAt: '' },
        tags: []
      },
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      appliedDiscountPercentage: it.appliedDiscountPercentage,
      total: it.total,
      batch: it.batchNumber ? {
        id: 'b-temp',
        batchNumber: it.batchNumber,
        quantity: it.quantity,
        expiryDate: '2026-12-31',
        costPrice: it.unitPrice * 0.7,
        markdownPercentage: it.appliedDiscountPercentage,
        status: 'safe'
      } : undefined
    }));
  };

  return (
    <div className="space-y-5">
      {/* Top Header with Switcher Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Activity className="h-5 w-5 text-emerald-400" />
            Activity & Sales Transactions Ledger
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Complete transaction history of what each customer purchased, plus real-time audit trail of product changes and stock flows.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'sales_orders' ? (
            <button
              onClick={handleExportSalesOrdersCSV}
              disabled={filteredSalesOrders.length === 0}
              className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all disabled:opacity-40 cursor-pointer"
              title="Export customer sales transactions to CSV"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Sales CSV</span>
            </button>
          ) : (
            <button
              onClick={handleExportMovementsCSV}
              disabled={filteredMovements.length === 0}
              className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all disabled:opacity-40 cursor-pointer"
              title="Export operations ledger to CSV"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Ledger CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Segmented View Switcher */}
      <div className="flex items-center gap-2 border-b border-white/[0.06] pb-2">
        <button
          onClick={() => { setActiveTab('sales_orders'); setSearchQuery(''); }}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'sales_orders'
              ? 'bg-zinc-100 text-zinc-950 shadow-md'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Receipt className="h-4 w-4" />
          <span>Customer Purchase History & Bills</span>
          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
            activeTab === 'sales_orders' ? 'bg-zinc-300 text-zinc-900' : 'bg-zinc-800 text-zinc-400'
          }`}>
            {salesOrders.length}
          </span>
        </button>

        <button
          onClick={() => { setActiveTab('operations_ledger'); setSearchQuery(''); }}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'operations_ledger'
              ? 'bg-zinc-100 text-zinc-950 shadow-md'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Store Operations & Inventory Audit Trail</span>
          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
            activeTab === 'operations_ledger' ? 'bg-zinc-300 text-zinc-900' : 'bg-zinc-800 text-zinc-400'
          }`}>
            {stockMovements.length}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: SALES & CUSTOMER PURCHASE TRANSACTION HISTORY                     */}
      {/* ========================================================================= */}
      {activeTab === 'sales_orders' && (
        <div className="space-y-4">
          {/* Search & Payment Method Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between bg-zinc-950/60 p-2.5 rounded-xl border border-white/[0.06]">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
              <input
                type="text"
                placeholder="Search by Customer Phone (e.g. 9876...), Customer Name, Receipt # (ORD-...), or Item..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-white/[0.06] bg-zinc-900 pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-zinc-500 hidden sm:inline">Tender:</span>
              {['ALL', 'UPI', 'CASH', 'CARD'].map((pm) => (
                <button
                  key={pm}
                  onClick={() => setSelectedPaymentMethod(pm)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                    selectedPaymentMethod === pm
                      ? 'bg-zinc-200 text-zinc-950 font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                  }`}
                >
                  {pm}
                </button>
              ))}
            </div>
          </div>

          {/* Orders List / Accordion */}
          {filteredSalesOrders.length === 0 ? (
            <div className="rounded-2xl border border-white/[0.06] bg-zinc-900/20 p-12 text-center space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-zinc-900 border border-white/[0.08] flex items-center justify-center mx-auto text-zinc-500">
                <Receipt className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-200">
                  {searchQuery ? 'No matching sales records found' : 'No sales transactions recorded yet'}
                </h3>
                <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                  {searchQuery
                    ? 'Try searching with a different mobile number, customer name, or receipt ID.'
                    : 'Sales processed in the Express POS register with complete customer details and itemized breakdowns will be recorded here.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {displayedSalesOrders.map((order) => {
                const isExpanded = expandedOrderId === order.id;

                return (
                  <div
                    key={order.id}
                    className="rounded-xl border border-white/[0.08] bg-zinc-900/40 hover:border-white/[0.14] transition-all overflow-hidden"
                  >
                    {/* Header Row (Click to toggle accordion) */}
                    <div
                      onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                      className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
                    >
                      {/* Left: Order # & Timestamp */}
                      <div className="flex items-start sm:items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-bold text-xs">
                          <Receipt className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-bold text-white text-xs">
                              #{order.orderNumber}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                              {order.paymentMethod}
                            </span>
                            <span className="text-[11px] text-zinc-500 font-mono">
                              {new Date(order.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          {/* Customer Identity Badge */}
                          <div className="flex items-center gap-2 mt-1 text-xs">
                            {order.customer ? (
                              <div className="flex items-center gap-1.5 text-zinc-200">
                                <span className="font-semibold text-emerald-400 flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {order.customer.name}
                                </span>
                                <span className="text-zinc-500 font-mono flex items-center gap-1">
                                  <Phone className="h-2.5 w-2.5" />
                                  {order.customer.phone}
                                </span>
                                {order.customer.gstin && (
                                  <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800/80 px-1.5 py-0.2 rounded border border-zinc-700">
                                    GST: {order.customer.gstin}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-zinc-500 italic flex items-center gap-1">
                                <User className="h-3 w-3" />
                                Retail Walk-in Guest
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Items Count, Grand Total & Actions */}
                      <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-white/[0.04]">
                        <div className="text-left sm:text-right">
                          <div className="text-sm sm:text-base font-bold font-mono text-emerald-400">
                            {formatINR(order.total)}
                          </div>
                          <div className="text-[11px] text-zinc-500">
                            {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'} • {order.totalUnits} {order.totalUnits === 1 ? 'unit' : 'units'}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOrderForReceipt(order);
                            }}
                            className="flex items-center gap-1 rounded-lg border border-white/[0.08] bg-zinc-800/80 px-2.5 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 hover:text-white transition-colors cursor-pointer"
                            title="View / Print Tax Invoice Receipt"
                          >
                            <Printer className="h-3.5 w-3.5 text-zinc-400" />
                            <span className="hidden sm:inline">Receipt</span>
                          </button>

                          <div className="rounded-lg p-1.5 text-zinc-400 hover:text-white transition-transform">
                            <ChevronDown
                              className={`h-4 w-4 transition-transform duration-200 ${
                                isExpanded ? 'rotate-180 text-emerald-400' : ''
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Accordion Content: Detailed Purchased Items Breakdown */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="border-t border-white/[0.06] bg-zinc-950/60 p-4 space-y-3"
                        >
                          <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 flex items-center justify-between">
                            <span>Itemized Invoice Breakdown ({order.items.length} line items)</span>
                            <span className="text-zinc-500">VAT/GST applied at 5%</span>
                          </div>

                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                              <thead className="border-b border-white/[0.06] text-zinc-500 font-mono text-[10px] uppercase">
                                <tr>
                                  <th className="py-2 px-3">Item Description</th>
                                  <th className="py-2 px-3">SKU</th>
                                  <th className="py-2 px-3 text-center">Batch</th>
                                  <th className="py-2 px-3 text-center">Qty</th>
                                  <th className="py-2 px-3 text-right">Unit Price</th>
                                  <th className="py-2 px-3 text-right">Discount</th>
                                  <th className="py-2 px-3 text-right">Line Total</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/[0.03] text-zinc-300 font-mono">
                                {order.items.map((it, idx) => (
                                  <tr key={`${it.itemId}-${idx}`} className="hover:bg-zinc-900/40">
                                    <td className="py-2 px-3 font-sans font-medium text-white">
                                      {it.itemName}
                                    </td>
                                    <td className="py-2 px-3 text-zinc-400 text-[11px]">
                                      {it.sku}
                                    </td>
                                    <td className="py-2 px-3 text-center text-zinc-400 text-[11px]">
                                      {it.batchNumber || '—'}
                                    </td>
                                    <td className="py-2 px-3 text-center font-bold text-white">
                                      {it.quantity} {it.unit}
                                    </td>
                                    <td className="py-2 px-3 text-right text-zinc-300">
                                      {formatINR(it.originalPrice || it.unitPrice)}
                                    </td>
                                    <td className="py-2 px-3 text-right text-amber-400">
                                      {it.appliedDiscountPercentage > 0 ? `-${it.appliedDiscountPercentage}%` : '—'}
                                    </td>
                                    <td className="py-2 px-3 text-right font-bold text-emerald-400">
                                      {formatINR(it.total)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Financial Summary Strip */}
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 border-t border-white/[0.04] text-xs">
                            <div className="text-zinc-500 text-[11px]">
                              {order.customer?.address && (
                                <div className="flex items-center gap-1 text-zinc-400">
                                  <Building2 className="h-3 w-3 text-zinc-500" />
                                  <span>Billing Address: {order.customer.address}</span>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-4 font-mono text-xs">
                              <div className="text-zinc-400">
                                Subtotal: <strong className="text-zinc-200">{formatINR(order.subtotal)}</strong>
                              </div>
                              {order.discountTotal > 0 && (
                                <div className="text-amber-400">
                                  Saved: <strong>-{formatINR(order.discountTotal)}</strong>
                                </div>
                              )}
                              <div className="text-zinc-400">
                                GST (5%): <strong className="text-zinc-200">{formatINR(order.tax)}</strong>
                              </div>
                              <div className="text-sm font-bold text-emerald-400 border-l border-white/[0.1] pl-3">
                                Grand Total: {formatINR(order.total)}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}

              {/* Lazy Load Footer for Sales Orders */}
              {visibleSalesCount < filteredSalesOrders.length && (
                <div className="p-3.5 rounded-xl border border-white/[0.06] bg-zinc-950/60 flex items-center justify-between text-xs text-zinc-400">
                  <span className="font-mono text-[11px]">
                    Showing {displayedSalesOrders.length} of {filteredSalesOrders.length} transactions
                  </span>
                  <button
                    onClick={handleLoadMoreSales}
                    className="rounded-lg border border-white/[0.08] bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 hover:text-white transition-all cursor-pointer"
                  >
                    Load More (+30 sales)
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: COMPREHENSIVE STORE OPERATIONS & INVENTORY AUDIT TRAIL             */}
      {/* ========================================================================= */}
      {activeTab === 'operations_ledger' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="surface-card rounded-xl p-3 flex flex-col gap-2.5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
              <input
                type="text"
                placeholder="Search operation movements, product names, SKUs, or operators..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-white/[0.06] bg-zinc-950/60 pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {movementTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedMovementType(type.id)}
                  className={`whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                    selectedMovementType === type.id
                      ? 'bg-zinc-200 text-zinc-950 font-semibold shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Movements Table */}
          <div className="surface-card rounded-2xl overflow-hidden border border-white/[0.06]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-white/[0.06] bg-zinc-950/80 text-zinc-400 font-medium text-[11px] uppercase tracking-wider font-mono">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Event Type</th>
                    <th className="py-3 px-4">Product / Target</th>
                    <th className="py-3 px-4 text-center">Stock Delta</th>
                    <th className="py-3 px-4 text-center">Ledger Flow</th>
                    <th className="py-3 px-4">Operational Reason</th>
                    <th className="py-3 px-4">Operator</th>
                    <th className="py-3 px-4 text-right">Flow (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] text-zinc-300">
                  {filteredMovements.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-zinc-500">
                        No activity records found matching filter criteria.
                      </td>
                    </tr>
                  ) : (
                    displayedMovements.map((mov) => {
                      const isPositive = mov.quantityDelta > 0;
                      const isNegative = mov.quantityDelta < 0;

                      return (
                        <tr key={mov.id} className="hover:bg-zinc-900/60 transition-colors">
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="flex flex-col font-mono">
                              <span className="text-zinc-200 text-xs font-semibold">
                                {formatExactTimestamp(mov.timestamp).date}
                              </span>
                              {formatExactTimestamp(mov.timestamp).time && (
                                <span className="text-zinc-400 text-[10px] flex items-center gap-1 mt-0.5">
                                  <Clock className="h-2.5 w-2.5 text-zinc-500" />
                                  {formatExactTimestamp(mov.timestamp).time}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            {getMovementBadge(mov.type)}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-white text-xs">{mov.itemName}</div>
                            <div className="text-[10px] text-zinc-500 font-mono">
                              {mov.sku} {mov.batchNumber && `• Batch #${mov.batchNumber}`}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            {mov.quantityDelta !== 0 ? (
                              <span className={`inline-flex items-center gap-0.5 font-mono font-bold text-xs ${
                                isPositive ? 'text-emerald-400' : isNegative ? 'text-rose-400' : 'text-amber-400'
                              }`}>
                                {isPositive && <ArrowUpRight className="h-3 w-3" />}
                                {isNegative && <ArrowDownRight className="h-3 w-3" />}
                                {isPositive ? `+${mov.quantityDelta}` : mov.quantityDelta}
                              </span>
                            ) : (
                              <span className="text-zinc-600 font-mono">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-mono text-xs text-zinc-400 text-center whitespace-nowrap">
                            {mov.previousStock !== mov.newStock ? (
                              <span>
                                {mov.previousStock} <span className="text-zinc-600">→</span> <strong className="text-zinc-200">{mov.newStock}</strong>
                              </span>
                            ) : (
                              <span className="text-zinc-600">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-zinc-300 max-w-sm">
                            {mov.reason}
                          </td>
                          <td className="py-3 px-4 text-zinc-500 whitespace-nowrap font-mono text-[11px]">
                            {mov.performedBy}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-semibold whitespace-nowrap">
                            {mov.financialImpact !== 0 ? (
                              <span className={mov.type === 'SALE' ? 'text-emerald-400' : mov.financialImpact < 0 ? 'text-rose-400' : 'text-zinc-300'}>
                                {mov.type === 'SALE' ? `+${formatINR(mov.financialImpact)}` : mov.financialImpact < 0 ? `-${formatINR(Math.abs(mov.financialImpact))}` : formatINR(mov.financialImpact)}
                              </span>
                            ) : (
                              <span className="text-zinc-600">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Lazy Load Footer for Operations Movements */}
            {visibleMovementsCount < filteredMovements.length && (
              <div className="p-3.5 border-t border-white/[0.06] bg-zinc-950/60 flex items-center justify-between text-xs text-zinc-400">
                <span className="font-mono text-[11px]">
                  Showing {displayedMovements.length} of {filteredMovements.length} ledger movements
                </span>
                <button
                  onClick={handleLoadMoreMovements}
                  className="rounded-lg border border-white/[0.08] bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 hover:text-white transition-all cursor-pointer"
                >
                  Load More (+40 movements)
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Global Receipt Modal Re-opener */}
      {selectedOrderForReceipt && (
        <ReceiptModal
          isOpen={true}
          onClose={() => setSelectedOrderForReceipt(null)}
          orderId={selectedOrderForReceipt.orderNumber}
          items={convertOrderToCartItems(selectedOrderForReceipt)}
          subtotal={selectedOrderForReceipt.subtotal}
          discountTotal={selectedOrderForReceipt.discountTotal}
          tax={selectedOrderForReceipt.tax}
          total={selectedOrderForReceipt.total}
          paymentMethod={selectedOrderForReceipt.paymentMethod}
          customer={selectedOrderForReceipt.customer ? {
            id: selectedOrderForReceipt.customer.id || 'cust-1',
            phone: selectedOrderForReceipt.customer.phone,
            name: selectedOrderForReceipt.customer.name,
            email: selectedOrderForReceipt.customer.email,
            address: selectedOrderForReceipt.customer.address,
            gstin: selectedOrderForReceipt.customer.gstin,
            totalOrders: 1,
            totalSpent: selectedOrderForReceipt.total,
            createdAt: selectedOrderForReceipt.timestamp
          } : null}
        />
      )}
    </div>
  );
};
