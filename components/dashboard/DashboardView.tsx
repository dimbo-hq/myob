'use client';

import React from 'react';
import { useInventory } from '@/context/InventoryContext';
import { 
  AlertTriangle, 
  ArrowRight, 
  Clock, 
  Flame, 
  Layers, 
  Plus, 
  Scan, 
  ShoppingCart, 
  TrendingUp, 
  Truck, 
  Zap,
  CheckCircle2
} from 'lucide-react';
import { StatCard } from '../common/StatCard';
import { StockStatusBadge } from '../common/Badge';
import { formatINR } from '@/lib/currency';

interface DashboardViewProps {
  onNavigate: (tab: 'inventory' | 'expiry' | 'reorder' | 'audit') => void;
  onOpenPOS: () => void;
  onOpenScanner: () => void;
  onOpenTimeSimulator: () => void;
  onOpenAddProduct: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenPOS,
  onOpenScanner,
  onOpenTimeSimulator,
  onOpenAddProduct
}) => {
  const {
    items,
    summary,
    stockMovements,
    applySmartExpiryMarkdowns,
    getDaysUntilExpiry
  } = useInventory();

  // Urgent expiring items (< 3 days)
  const urgentExpiringItems: { item: typeof items[0]; batch: typeof items[0]['batches'][0]; days: number }[] = [];
  items.forEach((item) => {
    item.batches.forEach((b) => {
      if (b.quantity > 0) {
        const days = getDaysUntilExpiry(b.expiryDate);
        if (days <= 3) {
          urgentExpiringItems.push({ item, batch: b, days });
        }
      }
    });
  });
  urgentExpiringItems.sort((a, b) => a.days - b.days);

  // Critical Low Stock items
  const lowStockItems = items.filter((i) => i.currentStock <= i.reorderPoint);
  lowStockItems.sort((a, b) => a.currentStock - b.currentStock);

  // Category distribution
  const categoryStats: Record<string, { count: number; stock: number; value: number }> = {};
  items.forEach((i) => {
    if (!categoryStats[i.category]) {
      categoryStats[i.category] = { count: 0, stock: 0, value: 0 };
    }
    categoryStats[i.category].count += 1;
    categoryStats[i.category].stock += i.currentStock;
    categoryStats[i.category].value += i.currentStock * i.sellingPrice;
  });

  return (
    <div className="space-y-6">
      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <StatCard
          title="Total Inventory Value"
          value={formatINR(summary.totalRetailValuation, false)}
          subtitle={`Cost Basis: ${formatINR(summary.totalCostValuation, false)}`}
          trend={{ value: `${summary.averageMarginPercent}% Margin`, isPositive: true }}
          onClick={() => onNavigate('inventory')}
        />

        <StatCard
          title="Restock Required"
          value={`${summary.outOfStockCount + summary.lowStockCount} Products`}
          subtitle={`${summary.outOfStockCount} out of stock • ${summary.lowStockCount} low`}
          trend={summary.outOfStockCount > 0 ? { value: 'Critical Stockout', isPositive: false } : undefined}
          onClick={() => onNavigate('reorder')}
        />

        <StatCard
          title="At-Risk Perishable Loss"
          value={formatINR(summary.atRiskLossValue)}
          subtitle={`${summary.expiringSoonCount + summary.expiredCount} batches near expiration`}
          trend={summary.expiringSoonCount > 0 ? { value: 'Markdown Recommended', isNeutral: true } : undefined}
          onClick={() => onNavigate('expiry')}
        />

        <StatCard
          title="Active Purchase Orders"
          value={`${summary.pendingOrdersCount} In Transit`}
          subtitle="Awaiting loading bay delivery"
          onClick={() => onNavigate('reorder')}
        />
      </div>

      {/* Two Column Grid: Expiry Radar & Low Stock Buffer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Perishable Expiry Radar */}
        <div className="surface-card rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-3.5">
              <div>
                <h3 className="text-sm font-semibold text-white tracking-tight">
                  Perishable Expiry Radar
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Batches expiring within 72 hours
                </p>
              </div>

              <button
                onClick={() => applySmartExpiryMarkdowns()}
                className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-400 hover:bg-amber-500/20 transition-all"
              >
                <Zap className="h-3 w-3" />
                <span>Auto-Markdown</span>
              </button>
            </div>

            {/* Items list */}
            <div className="space-y-2">
              {urgentExpiringItems.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-500">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto mb-1.5" />
                  <div className="font-medium text-zinc-300">All Perishables Fresh</div>
                  <div className="text-zinc-500 text-[11px] mt-0.5">No products expiring in the next 3 days.</div>
                </div>
              ) : (
                urgentExpiringItems.slice(0, 4).map(({ item, batch, days }, index) => {
                  const isExp = days < 0;
                  const isToday = days === 0;

                  return (
                    <div
                      key={`${item.id}-${batch.id}-${index}`}
                      className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-zinc-900/40 p-3 hover:border-white/[0.08] transition-all"
                    >
                      <div className="space-y-0.5 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-zinc-200">{item.name}</span>
                          {batch.markdownPercentage > 0 && (
                            <span className="text-[10px] font-medium text-amber-400 bg-amber-950/40 px-1.5 py-0.2 rounded border border-amber-800/40">
                              -{batch.markdownPercentage}%
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-zinc-500">
                          Batch #{batch.batchNumber} • {batch.quantity} {item.unit} • {formatINR(item.sellingPrice)}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                          isExp
                            ? 'bg-rose-950/50 text-rose-400 border border-rose-800/40'
                            : isToday
                            ? 'bg-amber-950/50 text-amber-400 border border-amber-800/40'
                            : 'bg-zinc-800 text-zinc-300'
                        }`}>
                          {isExp ? `Expired ${Math.abs(days)}d` : isToday ? 'Expires Today' : `${days}d left`}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-3.5 pt-3 border-t border-white/[0.04]">
            <button
              onClick={() => onNavigate('expiry')}
              className="flex items-center gap-1 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <span>View Expiry & Markdown Hub</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Right: Low Stock Buffer Alerts */}
        <div className="surface-card rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-3.5">
              <div>
                <h3 className="text-sm font-semibold text-white tracking-tight">
                  Stock Buffer & Reorder Alerts
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Products below safety stock thresholds
                </p>
              </div>

              <button
                onClick={() => onNavigate('reorder')}
                className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-zinc-800/80 px-2.5 py-1 text-xs font-medium text-zinc-300 hover:bg-zinc-700 transition-all"
              >
                <span>Reorder Hub</span>
              </button>
            </div>

            {/* List */}
            <div className="space-y-2">
              {lowStockItems.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-500">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto mb-1.5" />
                  <div className="font-medium text-zinc-300">Inventory Well Stocked</div>
                  <div className="text-zinc-500 text-[11px] mt-0.5">All products exceed reorder points.</div>
                </div>
              ) : (
                lowStockItems.slice(0, 4).map((item, idx) => {
                  const isOut = item.currentStock <= 0;
                  const suggested = Math.max(10, item.optimalStockLevel - item.currentStock);

                  return (
                    <div
                      key={`${item.id}-${idx}`}
                      className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-zinc-900/40 p-3 hover:border-white/[0.08] transition-all"
                    >
                      <div className="space-y-0.5 pr-2">
                        <div className="text-xs font-medium text-zinc-200">{item.name}</div>
                        <div className="text-[11px] text-zinc-500">
                          {item.location.aisle} • Vendor: {item.supplierName} • Need +{suggested} {item.unit}
                        </div>
                      </div>

                      <div className="text-right">
                        <StockStatusBadge
                          status={isOut ? 'out-of-stock' : 'low-stock'}
                          currentStock={item.currentStock}
                          unit={item.unit}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-3.5 pt-3 border-t border-white/[0.04]">
            <button
              onClick={() => onNavigate('reorder')}
              className="flex items-center gap-1 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <span>View Supplier Purchase Orders</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Breakdown & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Department Asset Share */}
        <div className="surface-card rounded-xl p-5 space-y-3">
          <h3 className="text-xs font-semibold text-zinc-300 tracking-tight uppercase tracking-wider">
            Department Inventory Share
          </h3>

          <div className="space-y-2.5">
            {Object.entries(categoryStats).map(([catName, data]) => {
              const share = summary.totalRetailValuation > 0
                ? Math.round((data.value / summary.totalRetailValuation) * 100)
                : 0;

              return (
                <div key={catName} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400 truncate pr-2">{catName}</span>
                    <span className="font-medium text-zinc-200 font-mono">{formatINR(data.value, false)}</span>
                  </div>
                  <div className="h-1 w-full rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-zinc-400"
                      style={{ width: `${Math.max(4, share)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="lg:col-span-2 surface-card rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-3.5">
              <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                Recent Store Activity
              </h3>
              <button
                onClick={() => onNavigate('audit')}
                className="text-xs font-medium text-zinc-400 hover:text-white transition-colors"
              >
                Full Ledger →
              </button>
            </div>

            <div className="space-y-2">
              {stockMovements.slice(0, 4).map((mov, idx) => (
                <div
                  key={`${mov.id}-${idx}`}
                  className="flex items-center justify-between rounded-lg border border-white/[0.03] bg-zinc-900/30 p-2.5 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-medium text-zinc-200">{mov.itemName}</div>
                    <div className="text-[11px] text-zinc-500 truncate max-w-sm">
                      {mov.reason} • {mov.performedBy}
                    </div>
                  </div>

                  <div className="text-right whitespace-nowrap pl-3">
                    <div className={`font-mono text-xs font-medium ${
                      mov.quantityDelta > 0 ? 'text-emerald-400' : mov.quantityDelta < 0 ? 'text-rose-400' : 'text-amber-400'
                    }`}>
                      {mov.quantityDelta > 0 ? `+${mov.quantityDelta}` : mov.quantityDelta !== 0 ? mov.quantityDelta : 'Discount'}
                    </div>
                    <div className="text-[10px] text-zinc-600 font-mono">{mov.timestamp}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3.5 pt-3 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-zinc-500">
            <span>Synchronized with POS registers and cold chain sensors</span>
            <span className="text-emerald-500 font-medium">● Online</span>
          </div>
        </div>
      </div>
    </div>
  );
};
