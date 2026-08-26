'use client';

import React, { useState } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { StockMovement, MovementType } from '@/types/inventory';
import { 
  ArrowDownRight, 
  ArrowUpRight, 
  Download, 
  Search
} from 'lucide-react';
import { formatINR } from '@/lib/currency';

export const AuditView: React.FC = () => {
  const { stockMovements, addToast } = useInventory();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');

  const movementTypes: { id: string; label: string }[] = [
    { id: 'ALL', label: 'All Activity' },
    { id: 'SALE', label: 'POS Sales' },
    { id: 'RESTOCK', label: 'Restocks' },
    { id: 'ADJUSTMENT', label: 'Audits' },
    { id: 'MARKDOWN_APPLIED', label: 'Markdowns' },
    { id: 'WASTE_EXPIRED', label: 'Disposals' }
  ];

  const filteredMovements = stockMovements.filter((mov) => {
    const matchesSearch = mov.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mov.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mov.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mov.performedBy.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (selectedType !== 'ALL' && mov.type !== selectedType) return false;
    return true;
  });

  const handleExportCSV = () => {
    const headers = ['Timestamp', 'Product Name', 'SKU', 'Type', 'Delta Qty', 'Previous Stock', 'New Stock', 'Batch #', 'Reason', 'Performed By', 'Financial Impact (₹)'];
    const rows = filteredMovements.map((m) => [
      `"${m.timestamp}"`,
      `"${m.itemName}"`,
      `"${m.sku}"`,
      `"${m.type}"`,
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
    link.setAttribute('download', `omnistock_audit_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast({
      type: 'info',
      title: 'Ledger Exported',
      message: `Exported ${filteredMovements.length} audit records to CSV.`
    });
  };

  const getTypeBadge = (type: MovementType) => {
    switch (type) {
      case 'SALE':
        return <span className="text-[11px] font-medium text-emerald-400">Sale</span>;
      case 'RESTOCK':
        return <span className="text-[11px] font-medium text-cyan-400">Restock</span>;
      case 'MARKDOWN_APPLIED':
        return <span className="text-[11px] font-medium text-amber-400">Markdown</span>;
      case 'WASTE_EXPIRED':
      case 'WASTE_DAMAGED':
        return <span className="text-[11px] font-medium text-rose-400">Wastage</span>;
      case 'ADJUSTMENT':
      default:
        return <span className="text-[11px] font-medium text-zinc-400">Audit</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white tracking-tight">
            Store Activity & Audit Ledger
          </h2>
          <p className="text-xs text-zinc-500">
            Immutable operational ledger of sales, receipts, audits and markdowns
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition-all shadow-sm"
        >
          <Download className="h-3.5 w-3.5 text-zinc-400" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="surface-card rounded-xl p-3 flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search activity records..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-white/[0.06] bg-zinc-950/60 pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
          />
        </div>

        <div className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-none">
          {movementTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`whitespace-nowrap rounded px-2.5 py-1 text-xs font-medium transition-all ${
                selectedType === type.id
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Movements Table */}
      <div className="surface-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/[0.06] bg-zinc-950/40 text-zinc-400 font-medium text-[11px]">
              <tr>
                <th className="py-2.5 px-4">Timestamp</th>
                <th className="py-2.5 px-4">Action</th>
                <th className="py-2.5 px-4">Product / SKU</th>
                <th className="py-2.5 px-4">Qty Change</th>
                <th className="py-2.5 px-4">Stock Ledger</th>
                <th className="py-2.5 px-4">Reason</th>
                <th className="py-2.5 px-4">Operator</th>
                <th className="py-2.5 px-4 text-right">Flow (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-zinc-300">
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-500">
                    No activity movements found.
                  </td>
                </tr>
              ) : (
                filteredMovements.map((mov) => {
                  const isPositive = mov.quantityDelta > 0;
                  const isNegative = mov.quantityDelta < 0;

                  return (
                    <tr key={mov.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-2.5 px-4">
                        <span className="font-mono text-zinc-500 text-[11px] block">{mov.timestamp}</span>
                        <span className="text-[10px] text-zinc-400 font-mono font-medium">{mov.type}</span>
                      </td>
                      <td className="py-2.5 px-4">
                        {getTypeBadge(mov.type)}
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="font-medium text-white text-xs">{mov.itemName}</div>
                        <div className="text-[10px] text-zinc-500 font-mono">
                          {mov.sku} {mov.batchNumber && `• Batch #${mov.batchNumber}`}
                        </div>
                      </td>
                      <td className="py-2.5 px-4">
                        <span className={`inline-flex items-center gap-0.5 font-mono font-semibold text-xs ${
                          isPositive ? 'text-emerald-400' : isNegative ? 'text-rose-400' : 'text-amber-400'
                        }`}>
                          {isPositive && <ArrowUpRight className="h-3 w-3" />}
                          {isNegative && <ArrowDownRight className="h-3 w-3" />}
                          {isPositive ? `+${mov.quantityDelta}` : mov.quantityDelta}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-mono text-xs text-zinc-400">
                        <span>{mov.previousStock}</span>
                        <span className="mx-1 text-zinc-600">→</span>
                        <strong className="text-zinc-200">{mov.newStock}</strong>
                      </td>
                      <td className="py-2.5 px-4 text-zinc-400 max-w-xs truncate">
                        {mov.reason}
                      </td>
                      <td className="py-2.5 px-4 text-zinc-500 whitespace-nowrap">
                        {mov.performedBy}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-medium">
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
      </div>
    </div>
  );
};
