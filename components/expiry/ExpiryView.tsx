'use client';

import React, { useState } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { InventoryItem, BatchInfo } from '@/types/inventory';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Flame, 
  Printer, 
  Trash2, 
  Zap
} from 'lucide-react';
import { MarkdownLabelModal } from './MarkdownLabelModal';
import { WasteLogModal } from './WasteLogModal';
import { TempZoneBadge } from '../common/Badge';
import { StatCard } from '../common/StatCard';

export const ExpiryView: React.FC = () => {
  const {
    items,
    getDaysUntilExpiry,
    getEffectiveBatchStatus,
    applyBatchMarkdown,
    applySmartExpiryMarkdowns,
    wastageLogs,
    summary
  } = useInventory();

  const [activeTab, setActiveTab] = useState<'all' | 'critical' | 'warning' | 'expired' | 'logs'>('all');
  const [selectedLabelItem, setSelectedLabelItem] = useState<{ item: InventoryItem; batch: BatchInfo; days: number } | null>(null);
  const [selectedWasteItem, setSelectedWasteItem] = useState<{ item: InventoryItem; batch?: BatchInfo } | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  interface FlattenedBatch {
    item: InventoryItem;
    batch: BatchInfo;
    daysLeft: number;
    status: 'safe' | 'warning' | 'critical' | 'expired';
  }

  const allBatches: FlattenedBatch[] = [];
  items.forEach((item) => {
    item.batches.forEach((batch) => {
      if (batch.quantity > 0) {
        const daysLeft = getDaysUntilExpiry(batch.expiryDate);
        const status = getEffectiveBatchStatus(batch.expiryDate);
        allBatches.push({
          item,
          batch,
          daysLeft,
          status
        });
      }
    });
  });

  // Sort batches by expiry urgency
  allBatches.sort((a, b) => a.daysLeft - b.daysLeft);

  const filteredBatches = allBatches.filter((b) => {
    const matchesSearch = b.item.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      b.batch.batchNumber.toLowerCase().includes(searchFilter.toLowerCase()) ||
      b.item.category.toLowerCase().includes(searchFilter.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'critical') return b.daysLeft >= 0 && b.daysLeft <= 2;
    if (activeTab === 'warning') return b.daysLeft > 2 && b.daysLeft <= 7;
    if (activeTab === 'expired') return b.daysLeft < 0;
    if (activeTab === 'logs') return true;
    return true;
  });

  const criticalCount = allBatches.filter((b) => b.daysLeft >= 0 && b.daysLeft <= 2).length;
  const warningCount = allBatches.filter((b) => b.daysLeft > 2 && b.daysLeft <= 7).length;
  const expiredCount = allBatches.filter((b) => b.daysLeft < 0).length;

  const totalWastageCost = wastageLogs.reduce((acc, curr) => acc + curr.totalLoss, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white tracking-tight">
            Expiry Prevention & Dynamic Markdowns
          </h2>
          <p className="text-xs text-zinc-500">
            Automated shelf-life tracking and phased clearance pricing
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => applySmartExpiryMarkdowns()}
            className="flex items-center gap-1.5 rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-900 hover:bg-white active:scale-95 transition-all shadow-sm"
          >
            <Zap className="h-3.5 w-3.5 fill-zinc-900" />
            <span>Apply Dynamic Markdowns</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <StatCard
          title="Critical Expiry (< 48h)"
          value={`${criticalCount} Batches`}
          subtitle="Immediate markdown clearance"
          accentColor="rose"
        />
        <StatCard
          title="Approaching (3 - 7 Days)"
          value={`${warningCount} Batches`}
          subtitle="Early discount window"
          accentColor="amber"
        />
        <StatCard
          title="At-Risk Loss Value"
          value={`$${summary.atRiskLossValue.toFixed(2)}`}
          subtitle="Inventory cost basis"
        />
        <StatCard
          title="Logged Wastage"
          value={`$${totalWastageCost.toFixed(2)}`}
          subtitle={`${wastageLogs.length} disposal logs`}
        />
      </div>

      {/* Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-2">
        <div className="flex gap-1 overflow-x-auto">
          {[
            { id: 'all', label: 'All Batches', count: allBatches.length },
            { id: 'critical', label: 'Critical < 48h', count: criticalCount, isCritical: criticalCount > 0 },
            { id: 'warning', label: 'Warning 3-7d', count: warningCount },
            { id: 'expired', label: 'Expired', count: expiredCount },
            { id: 'logs', label: 'Wastage Log', count: wastageLogs.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded ${
                tab.isCritical ? 'bg-rose-950 text-rose-400 font-bold' : 'bg-zinc-900 text-zinc-400'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="w-full sm:w-60">
          <input
            type="text"
            placeholder="Filter by product..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full rounded-lg border border-white/[0.06] bg-zinc-950/60 px-3 py-1 text-xs text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Content */}
      {activeTab === 'logs' ? (
        <div className="surface-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/[0.06] bg-zinc-950/40 text-zinc-400 font-medium text-[11px]">
                <tr>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Product</th>
                  <th className="py-2.5 px-4">Batch</th>
                  <th className="py-2.5 px-4">Quantity</th>
                  <th className="py-2.5 px-4">Reason</th>
                  <th className="py-2.5 px-4">Channel</th>
                  <th className="py-2.5 px-4 text-right">Cost Loss</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-zinc-300">
                {wastageLogs.map((w) => (
                  <tr key={w.id} className="hover:bg-white/[0.02]">
                    <td className="py-2.5 px-4 text-zinc-500 font-mono text-[11px]">{w.timestamp}</td>
                    <td className="py-2.5 px-4 font-medium text-white">{w.itemName}</td>
                    <td className="py-2.5 px-4 font-mono text-zinc-400">{w.batchNumber}</td>
                    <td className="py-2.5 px-4 font-medium">{w.quantity} {w.unit}</td>
                    <td className="py-2.5 px-4 text-zinc-400 capitalize">{w.reason.replace('_', ' ')}</td>
                    <td className="py-2.5 px-4 text-zinc-500 capitalize">{w.disposalMethod.replace('_', ' ')}</td>
                    <td className="py-2.5 px-4 text-right font-mono font-medium text-rose-400">
                      -${w.totalLoss.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredBatches.length === 0 ? (
            <div className="col-span-full py-12 text-center text-xs text-zinc-500 surface-card rounded-xl">
              No batches match the selected filter.
            </div>
          ) : (
            filteredBatches.map(({ item, batch, daysLeft, status }) => {
              const originalPrice = item.sellingPrice;
              const hasMarkdown = batch.markdownPercentage > 0;
              const markdownPrice = batch.markdownPrice || (originalPrice * (1 - (batch.markdownPercentage || 0) / 100));

              return (
                <div
                  key={batch.id}
                  className="surface-card rounded-xl p-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-zinc-400 bg-zinc-800/80 px-1.5 py-0.5 rounded border border-zinc-700/50 truncate">
                        {item.category}
                      </span>
                      <TempZoneBadge zone={item.location.tempZone} />
                    </div>

                    <div>
                      <h4 className="text-xs font-medium text-white">{item.name}</h4>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-500 mt-0.5">
                        <span>Batch #{batch.batchNumber}</span>
                        <span>•</span>
                        <span>{batch.quantity} {item.unit}</span>
                      </div>
                    </div>

                    {/* Expiry Pill */}
                    <div className="rounded-lg border border-white/[0.04] bg-zinc-900/40 p-2.5 flex items-center justify-between text-xs">
                      <div>
                        <div className="text-[10px] text-zinc-500">Expiry Date</div>
                        <div className="font-mono text-zinc-200">{batch.expiryDate}</div>
                      </div>
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                        daysLeft < 0
                          ? 'bg-rose-950/50 text-rose-400 border border-rose-800/40'
                          : daysLeft <= 2
                          ? 'bg-amber-950/50 text-amber-400 border border-amber-800/40'
                          : 'bg-zinc-800 text-zinc-300'
                      }`}>
                        {daysLeft < 0 ? `Expired ${Math.abs(daysLeft)}d` : daysLeft === 0 ? 'Expires Today' : `${daysLeft}d left`}
                      </span>
                    </div>

                    {/* Pricing */}
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-zinc-500">Price</span>
                        <div className={`font-mono ${hasMarkdown ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>
                          ${originalPrice.toFixed(2)}
                        </div>
                      </div>

                      {hasMarkdown && (
                        <div className="text-right">
                          <span className="text-[10px] text-amber-400 font-medium">-{batch.markdownPercentage}% Markdown</span>
                          <div className="font-mono font-medium text-emerald-400">
                            ${markdownPrice.toFixed(2)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions & Presets */}
                  <div className="mt-3.5 pt-3 border-t border-white/[0.04] space-y-2">
                    {status !== 'expired' && (
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-zinc-500">Clearance:</span>
                        <div className="flex gap-1">
                          {[0, 20, 35, 50].map((pct) => (
                            <button
                              key={pct}
                              onClick={() => applyBatchMarkdown(item.id, batch.id, pct)}
                              className={`rounded px-1.5 py-0.5 text-[10px] font-medium transition-all ${
                                batch.markdownPercentage === pct
                                  ? 'bg-zinc-200 text-zinc-900 font-semibold'
                                  : 'bg-zinc-900 text-zinc-400 hover:text-white'
                              }`}
                            >
                              {pct === 0 ? '0%' : `-${pct}%`}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-1.5 pt-1">
                      <button
                        onClick={() => setSelectedLabelItem({ item, batch, days: daysLeft })}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-white/[0.08] bg-zinc-900 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white"
                      >
                        <Printer className="h-3.5 w-3.5" />
                        <span>Print Tag</span>
                      </button>

                      <button
                        onClick={() => setSelectedWasteItem({ item, batch })}
                        className="rounded-lg border border-white/[0.06] bg-zinc-900 p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-zinc-800"
                        title="Write off spoilage"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Label Modal */}
      {selectedLabelItem && (
        <MarkdownLabelModal
          isOpen={!!selectedLabelItem}
          onClose={() => setSelectedLabelItem(null)}
          item={selectedLabelItem.item}
          batch={selectedLabelItem.batch}
          daysRemaining={selectedLabelItem.days}
        />
      )}

      {/* Spoilage Modal */}
      {selectedWasteItem && (
        <WasteLogModal
          isOpen={!!selectedWasteItem}
          onClose={() => setSelectedWasteItem(null)}
          item={selectedWasteItem.item}
          batch={selectedWasteItem.batch}
        />
      )}
    </div>
  );
};
