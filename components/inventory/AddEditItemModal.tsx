'use client';

import React, { useState } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { InventoryItem, CategoryType, UnitType, TempZone } from '@/types/inventory';
import { getRelativeDate } from '@/lib/dateUtils';
import { Package, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatINR, CURRENCY_SYMBOL } from '@/lib/currency';

interface AddEditItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemToEdit?: InventoryItem | null;
}

export const AddEditItemModal: React.FC<AddEditItemModalProps> = ({
  isOpen,
  onClose,
  itemToEdit
}) => {
  const { addItem, updateItem, suppliers } = useInventory();

  const isEditing = !!itemToEdit;

  const [name, setName] = useState(itemToEdit?.name || '');
  const [brand, setBrand] = useState(itemToEdit?.brand || '');
  const [sku, setSku] = useState(itemToEdit?.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`);
  const [barcode, setBarcode] = useState(itemToEdit?.barcode || `890100${Math.floor(100000 + Math.random() * 900000)}`);
  const [category, setCategory] = useState<CategoryType>(itemToEdit?.category || 'Fresh Produce');
  const [subcategory, setSubcategory] = useState(itemToEdit?.subcategory || 'General');
  const [unit, setUnit] = useState<UnitType>(itemToEdit?.unit || 'pcs');
  const [tempZone, setTempZone] = useState<TempZone>(itemToEdit?.location.tempZone || 'ambient');

  // Stock
  const [currentStock, setCurrentStock] = useState<number>(itemToEdit?.currentStock ?? 30);
  const [minStockLevel, setMinStockLevel] = useState<number>(itemToEdit?.minStockLevel ?? 10);
  const [reorderPoint, setReorderPoint] = useState<number>(itemToEdit?.reorderPoint ?? 15);
  const [optimalStockLevel, setOptimalStockLevel] = useState<number>(itemToEdit?.optimalStockLevel ?? 50);

  // Pricing
  const [costPrice, setCostPrice] = useState<number>(itemToEdit?.costPrice ?? 2.50);
  const [sellingPrice, setSellingPrice] = useState<number>(itemToEdit?.sellingPrice ?? 4.99);
  const [vatRate, setVatRate] = useState<number>(itemToEdit?.vatRate ?? 0.0);

  // Location
  const [aisle, setAisle] = useState(itemToEdit?.location.aisle || 'Aisle 01');
  const [shelf, setShelf] = useState(itemToEdit?.location.shelf || 'Bay 01');
  const [section, setSection] = useState(itemToEdit?.location.section || 'General Shelving');

  // Supplier
  const [supplierId, setSupplierId] = useState(itemToEdit?.supplierId || suppliers[0]?.id || 'sup-1');

  // Initial Batch
  const [initialBatchExpiry, setInitialBatchExpiry] = useState(getRelativeDate(14));

  if (!isOpen) return null;

  const categories: CategoryType[] = [
    'Fresh Produce',
    'Dairy & Eggs',
    'Bakery & Deli',
    'Meat & Seafood',
    'Beverages',
    'Pantry & Dry Goods',
    'Frozen Foods',
    'Snacks & Confectionery',
    'Household & Personal Care'
  ];

  const units: UnitType[] = ['pcs', 'kg', 'g', 'litres', 'ml', 'pack', 'box', 'crate', 'bunch', 'bottle'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const supplierObj = (suppliers && suppliers.length > 0 && suppliers.find((s) => s.id === supplierId)) || suppliers?.[0] || {
      id: supplierId || 'sup-1',
      name: 'Primary Wholesale Dist.'
    };

    if (isEditing && itemToEdit) {
      updateItem(itemToEdit.id, {
        name,
        brand,
        sku,
        barcode,
        category,
        subcategory,
        unit,
        currentStock,
        minStockLevel,
        reorderPoint,
        optimalStockLevel,
        costPrice,
        sellingPrice,
        vatRate,
        location: {
          aisle,
          shelf,
          section,
          tempZone
        },
        supplierId: supplierObj?.id || 'sup-1',
        supplierName: supplierObj?.name || 'Primary Wholesale Dist.'
      });
    } else {
      const newBatches = currentStock > 0 ? [
        {
          id: 'b-' + Math.random().toString(36).substring(2, 8),
          batchNumber: `BAT-${Math.floor(100 + Math.random() * 900)}`,
          quantity: currentStock,
          expiryDate: initialBatchExpiry,
          costPrice,
          markdownPercentage: 0,
          status: 'safe' as const
        }
      ] : [];

      addItem({
        name,
        brand: brand || 'Store Brand',
        sku,
        barcode,
        category,
        subcategory,
        description: `${brand || 'Premium'} ${name} in ${category}.`,
        currentStock,
        unit,
        minStockLevel,
        reorderPoint,
        optimalStockLevel,
        maxCapacity: optimalStockLevel * 1.5,
        location: {
          aisle,
          shelf,
          section,
          tempZone
        },
        costPrice,
        sellingPrice,
        vatRate,
        batches: newBatches,
        supplierId: supplierObj?.id || 'sup-1',
        supplierName: supplierObj?.name || 'Primary Wholesale Dist.',
        salesVelocity: {
          dailyAverage: Math.max(1, Math.round(optimalStockLevel / 7)),
          weeklySales: Math.max(7, optimalStockLevel),
          turnoverRate: 4.0,
          lastRestockedAt: 'Today',
          lastSoldAt: 'Just added'
        },
        tags: [category, tempZone]
      });
    }

    onClose();
  };

  const marginDollar = Math.max(0, sellingPrice - costPrice);
  const marginPercent = sellingPrice > 0 ? Math.round((marginDollar / sellingPrice) * 100) : 0;

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
          className="relative flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d0d10] shadow-2xl z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.06] p-4 bg-[#09090b]/50">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.08] bg-zinc-900 text-zinc-300">
                <Package className="h-3.5 w-3.5" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-white tracking-tight">
                  {isEditing ? 'Edit Product' : 'Add New Product'}
                </h3>
                <p className="text-[11px] text-zinc-500">
                  Inventory specifications, threshold levels and pricing
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

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
            {/* 1. Identification */}
            <div className="space-y-2">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                1. Product Identification
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Organic Almond Milk 1L"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-white/[0.06] bg-zinc-900/80 px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Brand / Producer</label>
                  <input
                    type="text"
                    placeholder="e.g. Alpine Crest"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full rounded-lg border border-white/[0.06] bg-zinc-900/80 px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Barcode (EAN-13)</label>
                  <input
                    type="text"
                    required
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    className="w-full font-mono rounded-lg border border-white/[0.06] bg-zinc-900/80 px-3 py-1.5 text-xs text-zinc-200 focus:border-zinc-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">SKU</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full font-mono rounded-lg border border-white/[0.06] bg-zinc-900/80 px-3 py-1.5 text-xs text-zinc-200 focus:border-zinc-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 2. Department & Cold Chain */}
            <div className="space-y-2 border-t border-white/[0.04] pt-3">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                2. Department & Storage
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as CategoryType)}
                    className="w-full rounded-lg border border-white/[0.06] bg-zinc-900/80 px-2.5 py-1.5 text-xs text-white focus:border-zinc-500 focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Unit</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as UnitType)}
                    className="w-full rounded-lg border border-white/[0.06] bg-zinc-900/80 px-2.5 py-1.5 text-xs text-white focus:border-zinc-500 focus:outline-none"
                  >
                    {units.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Temperature Zone</label>
                  <select
                    value={tempZone}
                    onChange={(e) => setTempZone(e.target.value as TempZone)}
                    className="w-full rounded-lg border border-white/[0.06] bg-zinc-900/80 px-2.5 py-1.5 text-xs text-white focus:border-zinc-500 focus:outline-none"
                  >
                    <option value="ambient">Ambient (Dry Shelf)</option>
                    <option value="chilled">Chilled (4°C Fridge)</option>
                    <option value="frozen">Frozen (-18°C Freezer)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 3. Stock Levels */}
            <div className="space-y-2 border-t border-white/[0.04] pt-3">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                3. Stock Levels & Thresholds
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Current Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={currentStock}
                    onChange={(e) => setCurrentStock(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full font-mono rounded-lg border border-white/[0.06] bg-zinc-900/80 px-2.5 py-1.5 text-xs text-white font-medium focus:border-zinc-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Min Safety Buffer</label>
                  <input
                    type="number"
                    min="1"
                    value={minStockLevel}
                    onChange={(e) => setMinStockLevel(Math.max(1, Number(e.target.value) || 1))}
                    className="w-full font-mono rounded-lg border border-white/[0.06] bg-zinc-900/80 px-2.5 py-1.5 text-xs text-zinc-300 focus:border-zinc-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Reorder Point</label>
                  <input
                    type="number"
                    min="1"
                    value={reorderPoint}
                    onChange={(e) => setReorderPoint(Math.max(1, Number(e.target.value) || 1))}
                    className="w-full font-mono rounded-lg border border-white/[0.06] bg-zinc-900/80 px-2.5 py-1.5 text-xs text-zinc-300 focus:border-zinc-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Target Max</label>
                  <input
                    type="number"
                    min="1"
                    value={optimalStockLevel}
                    onChange={(e) => setOptimalStockLevel(Math.max(1, Number(e.target.value) || 1))}
                    className="w-full font-mono rounded-lg border border-white/[0.06] bg-zinc-900/80 px-2.5 py-1.5 text-xs text-zinc-300 focus:border-zinc-500 focus:outline-none"
                  />
                </div>
              </div>

              {!isEditing && (
                <div className="pt-1">
                  <label className="text-[11px] text-zinc-400 block mb-1">Initial Batch Expiry Date</label>
                  <input
                    type="date"
                    value={initialBatchExpiry}
                    onChange={(e) => setInitialBatchExpiry(e.target.value)}
                    className="w-full md:w-56 rounded-lg border border-white/[0.06] bg-zinc-900/80 px-2.5 py-1.5 text-xs text-white focus:border-zinc-500 focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* 4. Pricing & Margin */}
            <div className="space-y-2 border-t border-white/[0.04] pt-3">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                4. Cost & Retail Pricing
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Supplier Cost (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={costPrice}
                    onChange={(e) => setCostPrice(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full font-mono rounded-lg border border-white/[0.06] bg-zinc-900/80 px-2.5 py-1.5 text-xs text-white focus:border-zinc-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Retail Selling Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full font-mono rounded-lg border border-white/[0.06] bg-zinc-900/80 px-2.5 py-1.5 text-xs text-white focus:border-zinc-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Gross Margin</label>
                  <div className="flex h-[32px] items-center justify-between rounded-lg border border-white/[0.06] bg-zinc-900/50 px-2.5 text-xs">
                    <span className="text-zinc-500 font-mono">+{formatINR(marginDollar)}</span>
                    <span className="font-mono text-emerald-400 font-medium">{marginPercent}% Margin</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Location & Supplier */}
            <div className="space-y-2 border-t border-white/[0.04] pt-3">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                5. Shelf Placement & Supplier
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Aisle</label>
                  <input
                    type="text"
                    value={aisle}
                    onChange={(e) => setAisle(e.target.value)}
                    className="w-full rounded-lg border border-white/[0.06] bg-zinc-900/80 px-2.5 py-1.5 text-xs text-white focus:border-zinc-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Shelf / Bay</label>
                  <input
                    type="text"
                    value={shelf}
                    onChange={(e) => setShelf(e.target.value)}
                    className="w-full rounded-lg border border-white/[0.06] bg-zinc-900/80 px-2.5 py-1.5 text-xs text-white focus:border-zinc-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Supplier</label>
                  <select
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="w-full rounded-lg border border-white/[0.06] bg-zinc-900/80 px-2.5 py-1.5 text-xs text-white focus:border-zinc-500 focus:outline-none"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-2 pt-3 border-t border-white/[0.06]">
              <button
                type="submit"
                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-zinc-100 py-2 text-xs font-semibold text-zinc-900 hover:bg-white active:scale-95 transition-all shadow-sm"
              >
                <Check className="h-3.5 w-3.5" />
                <span>{isEditing ? 'Save Changes' : 'Add to Inventory'}</span>
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
