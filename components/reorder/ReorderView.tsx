'use client';

import React, { useState } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { PurchaseOrder } from '@/types/inventory';
import { 
  Building, 
  CheckCircle2, 
  FileText, 
  PackageCheck, 
  Plus, 
  Send, 
  Truck, 
  Zap,
  Mail,
  Phone,
  Star
} from 'lucide-react';
import { POStatusBadge } from '../common/Badge';
import { StatCard } from '../common/StatCard';
import { CreatePOModal } from './CreatePOModal';
import { GoodsReceiptModal } from './GoodsReceiptModal';
import { formatINR } from '@/lib/currency';

export const ReorderView: React.FC = () => {
  const {
    items,
    suppliers,
    purchaseOrders,
    updatePOStatus,
    autoGenerateReorderPOs,
    summary
  } = useInventory();

  const [activeTab, setActiveTab] = useState<'recommendations' | 'orders' | 'suppliers'>('recommendations');
  const [poFilter, setPoFilter] = useState<string>('all');
  const [isCreatePOOpen, setIsCreatePOOpen] = useState(false);
  const [receivingPO, setReceivingPO] = useState<PurchaseOrder | null>(null);

  const itemsNeedingOrder = items.filter((item) => item.currentStock <= item.reorderPoint);

  const totalRecommendedCost = itemsNeedingOrder.reduce((acc, item) => {
    const qty = Math.max(10, item.optimalStockLevel - item.currentStock);
    return acc + qty * item.costPrice;
  }, 0);

  const handleAutoReorder = () => {
    const count = autoGenerateReorderPOs();
    if (count > 0) {
      setActiveTab('orders');
    }
  };

  const filteredPOs = purchaseOrders.filter((po) => {
    if (poFilter === 'all') return true;
    return po.status === poFilter;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white tracking-tight">
            Replenishment & Supplier Orders
          </h2>
          <p className="text-xs text-zinc-500">
            Safety buffer monitoring and automated purchase requisitions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAutoReorder}
            disabled={itemsNeedingOrder.length === 0}
            className="flex items-center gap-1.5 rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-900 hover:bg-white active:scale-95 disabled:opacity-40 transition-all shadow-sm"
          >
            <Zap className="h-3.5 w-3.5 fill-zinc-900" />
            <span>Auto-Generate Draft POs</span>
          </button>

          <button
            onClick={() => setIsCreatePOOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Manual PO</span>
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <StatCard
          title="Stockout Lines"
          value={`${summary.outOfStockCount} SKUs`}
          subtitle="Immediate order needed"
          accentColor="rose"
        />
        <StatCard
          title="Below Reorder Trigger"
          value={`${itemsNeedingOrder.length} Products`}
          subtitle={`Est. Cost: $${totalRecommendedCost.toFixed(2)}`}
          accentColor="amber"
        />
        <StatCard
          title="Pending / In-Transit POs"
          value={`${summary.pendingOrdersCount} Shipments`}
          subtitle="Awaiting warehouse receipt"
        />
        <StatCard
          title="Registered Vendors"
          value={`${suppliers.length} Suppliers`}
          subtitle="Avg Lead Time: 2.1 Days"
        />
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === 'recommendations'
                ? 'bg-zinc-800 text-white font-semibold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <span>Reorder Recommendations</span>
            <span className="text-[10px] bg-zinc-900 text-zinc-400 px-1.5 py-0.2 rounded">
              {itemsNeedingOrder.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === 'orders'
                ? 'bg-zinc-800 text-white font-semibold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <span>Purchase Orders</span>
            <span className="text-[10px] bg-zinc-900 text-zinc-400 px-1.5 py-0.2 rounded">
              {purchaseOrders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('suppliers')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === 'suppliers'
                ? 'bg-zinc-800 text-white font-semibold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <span>Vendors</span>
            <span className="text-[10px] bg-zinc-900 text-zinc-400 px-1.5 py-0.2 rounded">
              {suppliers.length}
            </span>
          </button>
        </div>

        {activeTab === 'orders' && (
          <div className="flex gap-1">
            {['all', 'draft', 'pending', 'sent', 'in-transit', 'received'].map((st) => (
              <button
                key={st}
                onClick={() => setPoFilter(st)}
                className={`capitalize rounded px-2 py-0.5 text-[11px] font-medium transition-all ${
                  poFilter === st
                    ? 'bg-zinc-800 text-white font-semibold'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* TAB 1: RECOMMENDATIONS */}
      {activeTab === 'recommendations' && (
        <div className="surface-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/[0.06] bg-zinc-950/40 text-zinc-400 font-medium text-[11px]">
                <tr>
                  <th className="py-2.5 px-4">Product</th>
                  <th className="py-2.5 px-4">Current / Min</th>
                  <th className="py-2.5 px-4">Target Stock</th>
                  <th className="py-2.5 px-4">Velocity</th>
                  <th className="py-2.5 px-4">Suggested Qty</th>
                  <th className="py-2.5 px-4">Supplier</th>
                  <th className="py-2.5 px-4 text-right">Est. Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-zinc-300">
                {itemsNeedingOrder.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-zinc-500">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto mb-1.5" />
                      All inventory lines are above safety reorder thresholds.
                    </td>
                  </tr>
                ) : (
                  itemsNeedingOrder.map((item) => {
                    const suggestedQty = Math.max(10, item.optimalStockLevel - item.currentStock);
                    const lineCost = suggestedQty * item.costPrice;
                    const isOut = item.currentStock === 0;

                    return (
                      <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-medium text-white">{item.name}</div>
                          <div className="text-[10px] text-zinc-500 font-mono">{item.sku} • {item.location.aisle}</div>
                        </td>
                        <td className="py-3 px-4 font-mono">
                          <span className={isOut ? 'text-rose-400 font-semibold' : 'text-amber-400'}>
                            {item.currentStock} {item.unit}
                          </span>
                          <span className="text-zinc-600"> / min {item.minStockLevel}</span>
                        </td>
                        <td className="py-3 px-4 font-mono text-zinc-400">
                          {item.optimalStockLevel} {item.unit}
                        </td>
                        <td className="py-3 px-4 text-zinc-400">
                          ~{item.salesVelocity.dailyAverage} {item.unit}/day
                        </td>
                        <td className="py-3 px-4 font-mono font-medium text-emerald-400">
                          +{suggestedQty} {item.unit}
                        </td>
                        <td className="py-3 px-4 text-zinc-300">
                          {item.supplierName}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-medium text-white">
                          ${lineCost.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PURCHASE ORDERS */}
      {activeTab === 'orders' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredPOs.map((po) => {
            const isReceived = po.status === 'received';
            const canReceive = ['sent', 'in-transit', 'pending'].includes(po.status);

            return (
              <div
                key={po.id}
                className="surface-card rounded-xl p-4 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-medium text-white">
                      {po.poNumber}
                    </span>
                    <POStatusBadge status={po.status} />
                  </div>

                  <div>
                    <div className="text-[10px] text-zinc-500">Vendor</div>
                    <div className="text-xs font-medium text-zinc-200">{po.supplierName}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs border-t border-white/[0.04] pt-2">
                    <div>
                      <span className="text-[10px] text-zinc-500">Ordered</span>
                      <div className="text-zinc-300 font-mono text-[11px]">{po.orderDate}</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500">Est. Delivery</span>
                      <div className="text-zinc-300 font-mono text-[11px]">{po.expectedDeliveryDate}</div>
                    </div>
                  </div>

                  {/* Lines preview */}
                  <div className="rounded-lg border border-white/[0.04] bg-zinc-900/40 p-2.5 space-y-1 text-xs">
                    {po.items.slice(0, 2).map((it, idx) => (
                      <div key={idx} className="flex justify-between text-zinc-300">
                        <span className="truncate pr-2">{it.name}</span>
                        <span className="font-mono text-zinc-400 whitespace-nowrap">{it.orderedQty} {it.unit}</span>
                      </div>
                    ))}
                    {po.items.length > 2 && (
                      <div className="text-[10px] text-zinc-500">+{po.items.length - 2} more...</div>
                    )}
                  </div>

                  <div className="flex justify-between border-t border-white/[0.04] pt-2 text-xs">
                    <span className="text-zinc-500">Total PO Value:</span>
                    <span className="font-mono font-medium text-white">{formatINR(po.totalAmount)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-3 pt-2.5 border-t border-white/[0.04]">
                  {po.status === 'draft' && (
                    <button
                      onClick={() => updatePOStatus(po.id, 'sent')}
                      className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-white/[0.08] bg-zinc-900 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-800"
                    >
                      <Send className="h-3 w-3" />
                      <span>Send to Supplier</span>
                    </button>
                  )}

                  {po.status === 'sent' && (
                    <button
                      onClick={() => updatePOStatus(po.id, 'in-transit')}
                      className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-white/[0.08] bg-zinc-900 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-800"
                    >
                      <Truck className="h-3 w-3" />
                      <span>Mark Dispatched</span>
                    </button>
                  )}

                  {canReceive && (
                    <button
                      onClick={() => setReceivingPO(po)}
                      className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-zinc-100 py-1.5 text-xs font-semibold text-zinc-900 hover:bg-white transition-all shadow-sm"
                    >
                      <PackageCheck className="h-3.5 w-3.5" />
                      <span>Receive Shipment</span>
                    </button>
                  )}

                  {isReceived && (
                    <div className="text-center py-1 text-[11px] font-medium text-emerald-400">
                      Restocked on {po.receivedDate}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: SUPPLIERS */}
      {activeTab === 'suppliers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {suppliers.map((sup) => (
            <div
              key={sup.id}
              className="surface-card rounded-xl p-4 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-400 bg-zinc-800/80 px-1.5 py-0.5 rounded border border-zinc-700/50">
                  {sup.category}
                </span>
                <div className="flex items-center gap-1 text-xs text-zinc-300">
                  <Star className="h-3 w-3 fill-zinc-300 text-zinc-300" />
                  <span>{sup.rating}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-medium text-white">{sup.name}</h4>
                <div className="text-[11px] text-zinc-500 font-mono mt-0.5">{sup.code}</div>
              </div>

              <div className="space-y-1 text-xs text-zinc-400 border-t border-white/[0.04] pt-2">
                <div className="flex items-center gap-1.5">
                  <Mail className="h-3 w-3 text-zinc-500" />
                  <span>{sup.email}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="h-3 w-3 text-zinc-500" />
                  <span>{sup.phone}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 border-t border-white/[0.04] pt-2 text-[11px]">
                <div>
                  <span className="text-zinc-500">Lead Time:</span>
                  <div className="text-zinc-200 font-medium">{sup.leadTimeDays}d</div>
                </div>
                <div>
                  <span className="text-zinc-500">Min Order:</span>
                  <div className="text-zinc-200 font-medium font-mono">{formatINR(sup.minOrderValue, false)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <CreatePOModal
        isOpen={isCreatePOOpen}
        onClose={() => setIsCreatePOOpen(false)}
      />

      {receivingPO && (
        <GoodsReceiptModal
          isOpen={!!receivingPO}
          onClose={() => setReceivingPO(null)}
          po={receivingPO}
        />
      )}
    </div>
  );
};
