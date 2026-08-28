'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { InventoryItem } from '@/types/inventory';
import { 
  Edit3, 
  Grid, 
  Layers, 
  List, 
  Plus, 
  Search, 
  SlidersHorizontal, 
  Trash2, 
  Copy,
  MapPin,
  ArrowUpDown,
  FileSpreadsheet,
  Download
} from 'lucide-react';
import { StockStatusBadge, TempZoneBadge } from '../common/Badge';
import { AddEditItemModal } from './AddEditItemModal';
import { QuickAdjustModal } from './QuickAdjustModal';
import { BatchDetailsModal } from './BatchDetailsModal';
import { ImportModal } from './ImportModal';
import { formatINR } from '@/lib/currency';

export const InventoryView: React.FC = () => {
  const {
    items,
    deleteItem,
    getItemStatus,
    addToast
  } = useInventory();

  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedTempZone, setSelectedTempZone] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'name' | 'stock_asc' | 'stock_desc' | 'margin'>('stock_asc');

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [adjustingItem, setAdjustingItem] = useState<InventoryItem | null>(null);
  const [batchModalItem, setBatchModalItem] = useState<InventoryItem | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const categories = ['All', 'Fresh Produce', 'Dairy & Eggs', 'Bakery & Deli', 'Meat & Seafood', 'Beverages', 'Pantry & Dry Goods', 'Frozen Foods', 'Snacks & Confectionery', 'Household & Personal Care'];

  // Filter items
  const filteredItems = items.filter((item) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = item.name.toLowerCase().includes(query) ||
      item.brand.toLowerCase().includes(query) ||
      item.sku.toLowerCase().includes(query) ||
      item.barcode.includes(query) ||
      item.location.aisle.toLowerCase().includes(query);

    if (!matchesSearch) return false;
    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
    if (selectedTempZone !== 'All' && item.location.tempZone !== selectedTempZone) return false;

    if (selectedStatus !== 'All') {
      const status = getItemStatus(item);
      if (selectedStatus === 'out-of-stock' && status !== 'out-of-stock') return false;
      if (selectedStatus === 'low-stock' && !['low-stock', 'critical'].includes(status)) return false;
      if (selectedStatus === 'expiring-soon' && !['expiring-soon', 'expired'].includes(status)) return false;
      if (selectedStatus === 'in-stock' && status !== 'in-stock') return false;
    }

    return true;
  });

  // Lazy Loading State
  const [visibleCount, setVisibleCount] = useState(40);

  useEffect(() => {
    setVisibleCount(40);
  }, [searchQuery, selectedCategory, selectedTempZone, selectedStatus, sortBy]);

  // Displayed slice for fast DOM rendering
  const displayedItems = useMemo<InventoryItem[]>(() => {
    return filteredItems.slice(0, visibleCount);
  }, [filteredItems, visibleCount]);

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + 40, filteredItems.length));
  };

  const handleCopyBarcode = (barcode: string) => {
    navigator.clipboard.writeText(barcode);
    addToast({
      type: 'info',
      title: 'Barcode Copied',
      message: `Copied "${barcode}" to clipboard.`
    });
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Brand', 'SKU', 'Barcode', 'Category', 'CurrentStock', 'Unit', 'CostPrice', 'SellingPrice', 'Aisle', 'TempZone'];
    const rows = filteredItems.map((it) => [
      `"${it.name}"`,
      `"${it.brand}"`,
      `"${it.sku}"`,
      `"${it.barcode}"`,
      `"${it.category}"`,
      it.currentStock,
      `"${it.unit}"`,
      it.costPrice,
      it.sellingPrice,
      `"${it.location.aisle}"`,
      `"${it.location.tempZone}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `supermarket_inventory_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast({
      type: 'info',
      title: 'Catalogue Exported',
      message: `Exported ${filteredItems.length} products to CSV.`
    });
  };

  return (
    <div className="space-y-4">
      {/* Header Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white tracking-tight">
            Inventory Catalogue
          </h2>
          <p className="text-xs text-zinc-500">
            {filteredItems.length} products across departments
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition-all"
            title="Export CSV"
          >
            <Download className="h-3.5 w-3.5 text-zinc-400" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            onClick={() => setIsImportOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition-all"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-zinc-400" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-900 hover:bg-white active:scale-95 transition-all shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Product</span>
          </button>

          <div className="flex rounded-lg border border-white/[0.08] bg-zinc-900 p-0.5">
            <button
              onClick={() => setViewMode('table')}
              className={`rounded-md p-1 transition-all ${
                viewMode === 'table' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title="Table View"
            >
              <List className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`rounded-md p-1 transition-all ${
                viewMode === 'grid' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title="Grid View"
            >
              <Grid className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Surface */}
      <div className="surface-card rounded-xl p-3 space-y-2.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search product, SKU, barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-white/[0.06] bg-zinc-950/60 pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-lg border border-white/[0.06] bg-zinc-950/60 px-2.5 py-1.5 text-xs text-zinc-300 focus:border-zinc-500 focus:outline-none"
          >
            <option value="All">All Stock Levels</option>
            <option value="out-of-stock">Out of Stock</option>
            <option value="low-stock">Low Stock</option>
            <option value="expiring-soon">Expiring Soon</option>
            <option value="in-stock">In Stock</option>
          </select>

          <select
            value={selectedTempZone}
            onChange={(e) => setSelectedTempZone(e.target.value)}
            className="rounded-lg border border-white/[0.06] bg-zinc-950/60 px-2.5 py-1.5 text-xs text-zinc-300 focus:border-zinc-500 focus:outline-none"
          >
            <option value="All">All Temperature Zones</option>
            <option value="ambient">Ambient (Dry Shelf)</option>
            <option value="chilled">Chilled (4°C Fridge)</option>
            <option value="frozen">Frozen (-18°C Freezer)</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-lg border border-white/[0.06] bg-zinc-950/60 px-2.5 py-1.5 text-xs text-zinc-300 focus:border-zinc-500 focus:outline-none"
          >
            <option value="stock_asc">Sort: Lowest Stock First</option>
            <option value="stock_desc">Sort: Highest Stock First</option>
            <option value="name">Sort: Name A-Z</option>
            <option value="margin">Sort: Profit Margin</option>
          </select>
        </div>

        {/* Category Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 border-t border-white/[0.04] pt-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap rounded-md px-2.5 py-1 text-[11px] font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table View */}
      {viewMode === 'table' ? (
        <div className="surface-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/[0.06] bg-zinc-950/40 text-zinc-400 font-medium text-[11px]">
                <tr>
                  <th className="py-2.5 px-4">Product</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4">Location</th>
                  <th className="py-2.5 px-4">Stock</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Price</th>
                  <th className="py-2.5 px-4">Batches</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-zinc-300">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-zinc-500">
                      No products match the selected criteria.
                    </td>
                  </tr>
                ) : (
                  displayedItems.map((item, idx) => {
                    const status = getItemStatus(item);
                    const margin = item.sellingPrice > 0
                      ? Math.round(((item.sellingPrice - item.costPrice) / item.sellingPrice) * 100)
                      : 0;

                    return (
                      <tr key={`${item.id}-${idx}`} className="hover:bg-white/[0.02] transition-colors group">
                        {/* Product */}
                        <td className="py-3 px-4">
                          <div className="font-medium text-white text-xs">{item.name}</div>
                          <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono mt-0.5">
                            <span>{item.sku}</span>
                            <span>•</span>
                            <button
                              onClick={() => handleCopyBarcode(item.barcode)}
                              className="hover:text-zinc-300"
                              title="Copy Barcode"
                            >
                              {item.barcode}
                            </button>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-4 text-zinc-400">
                          <div>{item.category}</div>
                          <div className="mt-1">
                            <TempZoneBadge zone={item.location.tempZone} />
                          </div>
                        </td>

                        {/* Location */}
                        <td className="py-3 px-4">
                          <div className="text-zinc-300 font-medium">{item.location.aisle}</div>
                          <div className="text-[10px] text-zinc-500">{item.location.shelf}</div>
                        </td>

                        {/* Stock */}
                        <td className="py-3 px-4">
                          <div className="font-mono font-medium text-white text-xs">
                            {item.currentStock} {item.unit}
                          </div>
                          <div className="text-[10px] text-zinc-500">
                            min {item.minStockLevel} / opt {item.optimalStockLevel}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4">
                          <StockStatusBadge
                            status={status}
                            currentStock={item.currentStock}
                            unit={item.unit}
                          />
                        </td>

                        {/* Price */}
                        <td className="py-3 px-4">
                          <div className="font-mono text-white text-xs">{formatINR(item.sellingPrice)}</div>
                          <div className="text-[10px] text-zinc-500 font-mono">
                            Cost {formatINR(item.costPrice)} • {margin}% margin
                          </div>
                        </td>

                        {/* Batches */}
                        <td className="py-3 px-4">
                          <button
                            onClick={() => setBatchModalItem(item)}
                            className="text-[11px] font-medium text-zinc-400 hover:text-white underline underline-offset-2"
                          >
                            {item.batches.length} batch(es)
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setAdjustingItem(item)}
                              className="rounded border border-white/[0.06] bg-zinc-900 px-2 py-1 text-[11px] text-zinc-300 hover:bg-zinc-800 cursor-pointer"
                              title="Quick Stock Adjust"
                            >
                              Count +/-
                            </button>

                            <button
                              onClick={() => setEditingItem(item)}
                              className="rounded border border-white/[0.06] bg-zinc-900 p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
                              title="Edit Product"
                            >
                              <Edit3 className="h-3 w-3" />
                            </button>

                            <button
                              onClick={() => deleteItem(item.id)}
                              className="rounded border border-white/[0.06] bg-zinc-900 p-1 text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 cursor-pointer"
                              title="Delete Product"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Lazy Load Footer for Table */}
          {visibleCount < filteredItems.length && (
            <div className="p-3 border-t border-white/[0.06] bg-zinc-950/60 flex items-center justify-between text-xs text-zinc-400">
              <span className="font-mono text-[11px]">
                Showing {displayedItems.length} of {filteredItems.length} products
              </span>
              <button
                onClick={handleLoadMore}
                className="rounded-lg border border-white/[0.08] bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 hover:text-white transition-all cursor-pointer"
              >
                Load More (+40 items)
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Grid View */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {displayedItems.map((item, idx) => {
              const status = getItemStatus(item);

              return (
                <div
                  key={`${item.id}-${idx}`}
                  className="surface-card rounded-xl p-4 flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-zinc-400 bg-zinc-800/80 px-1.5 py-0.5 rounded border border-zinc-700/50">
                        {item.category}
                      </span>
                      <TempZoneBadge zone={item.location.tempZone} />
                    </div>

                    <div>
                      <h4 className="text-xs font-medium text-white">{item.name}</h4>
                      <div className="text-[11px] text-zinc-500 font-mono mt-0.5">
                        {item.sku} • {item.location.aisle}
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/[0.04] pt-2 text-xs">
                      <div>
                        <div className="text-[10px] text-zinc-500">In Stock</div>
                        <div className="font-mono text-zinc-200 font-medium">{item.currentStock} {item.unit}</div>
                      </div>
                      <StockStatusBadge
                        status={status}
                        currentStock={item.currentStock}
                        unit={item.unit}
                      />
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-white/[0.04] flex items-center justify-between">
                    <button
                      onClick={() => setBatchModalItem(item)}
                      className="text-[11px] text-zinc-400 hover:text-white cursor-pointer"
                    >
                      {item.batches.length} Batches
                    </button>

                    <div className="flex gap-1">
                      <button
                        onClick={() => setAdjustingItem(item)}
                        className="rounded border border-white/[0.06] bg-zinc-900 px-2 py-1 text-[11px] text-zinc-300 hover:bg-zinc-800 cursor-pointer"
                      >
                        Count +/-
                      </button>
                      <button
                        onClick={() => setEditingItem(item)}
                        className="rounded border border-white/[0.06] bg-zinc-900 p-1 text-zinc-400 hover:text-white cursor-pointer"
                      >
                        <Edit3 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Lazy Load Footer for Grid */}
          {visibleCount < filteredItems.length && (
            <div className="p-4 rounded-xl border border-white/[0.06] bg-zinc-950/60 flex items-center justify-between text-xs text-zinc-400">
              <span className="font-mono text-[11px]">
                Showing {displayedItems.length} of {filteredItems.length} products
              </span>
              <button
                onClick={handleLoadMore}
                className="rounded-lg border border-white/[0.08] bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 hover:text-white transition-all cursor-pointer"
              >
                Load More (+40 items)
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Modal */}
      {(isAddOpen || editingItem) && (
        <AddEditItemModal
          isOpen={isAddOpen || !!editingItem}
          onClose={() => {
            setIsAddOpen(false);
            setEditingItem(null);
          }}
          itemToEdit={editingItem}
        />
      )}

      {/* Import Modal */}
      {isImportOpen && (
        <ImportModal
          isOpen={isImportOpen}
          onClose={() => setIsImportOpen(false)}
        />
      )}

      {/* Quick Adjust Modal */}
      {adjustingItem && (
        <QuickAdjustModal
          isOpen={!!adjustingItem}
          onClose={() => setAdjustingItem(null)}
          item={adjustingItem}
        />
      )}

      {/* Batches Modal */}
      {batchModalItem && (
        <BatchDetailsModal
          isOpen={!!batchModalItem}
          onClose={() => setBatchModalItem(null)}
          item={batchModalItem}
        />
      )}
    </div>
  );
};
