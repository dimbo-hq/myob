'use client';

import React, { useState, useRef } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { InventoryItem, CategoryType, UnitType, TempZone } from '@/types/inventory';
import { getRelativeDate } from '@/lib/dateUtils';
import { UploadCloud, FileSpreadsheet, Download, Check, AlertCircle, X, Trash2, RefreshCw, PlusCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { formatINR } from '@/lib/currency';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose }) => {
  const { importBulkItems, addToast, items } = useInventory();

  const [parsedItems, setParsedItems] = useState<Partial<InventoryItem>[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDownloadSampleCSV = () => {
    const sampleHeaders = ['Name', 'Brand', 'SKU', 'Barcode', 'Category', 'CurrentStock', 'Unit', 'CostPrice', 'SellingPrice', 'ExpiryDate', 'Aisle', 'TempZone'];
    const sampleRows = [
      ['Organic Hass Avocados', 'Green Valley Organic', 'PROD-AVO-01', '890100001015', 'Fresh Produce', '48', 'pcs', '45.00', '75.00', getRelativeDate(3), 'Aisle 01', 'ambient'],
      ['Desi Cow Milk 1L', 'Amul Farms', 'DAIR-MLK-01', '890100002012', 'Dairy & Eggs', '25', 'bottle', '42.00', '65.00', getRelativeDate(5), 'Aisle 02', 'chilled'],
      ['Artisan Sourdough Loaf', 'Heritage Kitchens', 'BAKE-SRD-01', '890100003019', 'Bakery & Deli', '15', 'pcs', '55.00', '90.00', getRelativeDate(2), 'Aisle 03', 'ambient'],
      ['Royal Basmati Rice 2kg', 'Tata Milling', 'PAN-RIC-02', '890100006027', 'Pantry & Dry Goods', '40', 'pack', '180.00', '260.00', getRelativeDate(300), 'Aisle 06', 'ambient']
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + [sampleHeaders.join(','), ...sampleRows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'supermarket_inventory_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast({
      type: 'info',
      title: 'Template Downloaded',
      message: 'Sample CSV template downloaded for your store.'
    });
  };

  const processRowData = (rows: any[]) => {
    const validCategories: CategoryType[] = [
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

    const processed: Partial<InventoryItem>[] = [];

    rows.forEach((row, index) => {
      // Basic validation
      const name = row['Name'] || row['name'] || row['Product'] || row['product'];
      if (!name || typeof name !== 'string' || name.trim() === '') return;

      const categoryRaw = row['Category'] || row['category'] || 'Pantry & Dry Goods';
      const category: CategoryType = validCategories.includes(categoryRaw as any)
        ? (categoryRaw as CategoryType)
        : 'Pantry & Dry Goods';

      const sku = row['SKU'] || row['sku'] || `SKU-${Date.now()}-${index}`;
      const barcode = row['Barcode'] || row['barcode'] || `890${Math.floor(100000000 + Math.random() * 900000000)}`;
      const brand = row['Brand'] || row['brand'] || 'Generic Store Brand';
      const unit = (row['Unit'] || row['unit'] || 'pcs').toLowerCase() as UnitType;
      const currentStock = Math.max(0, parseInt(row['CurrentStock'] || row['Stock'] || row['stock'] || '10', 10) || 0);
      const costPrice = Math.max(0, parseFloat(row['CostPrice'] || row['Cost'] || row['cost'] || '20.00') || 0);
      const sellingPrice = Math.max(0, parseFloat(row['SellingPrice'] || row['Price'] || row['price'] || '35.00') || 0);
      const expiryDate = row['ExpiryDate'] || row['expiryDate'] || row['Expiry'] || getRelativeDate(14);
      const aisle = row['Aisle'] || row['aisle'] || 'Aisle 01';
      const tempZone = (row['TempZone'] || row['tempZone'] || (category === 'Dairy & Eggs' || category === 'Meat & Seafood' ? 'chilled' : category === 'Frozen Foods' ? 'frozen' : 'ambient')) as TempZone;

      // Unique random UUID for batch and item
      const itemUuid = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `imp-${index}-${Date.now()}`;
      const batchUuid = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `b-imp-${index}-${Date.now()}`;

      processed.push({
        id: `item-${itemUuid}`,
        name: name.trim(),
        brand: brand.trim(),
        sku: sku.trim(),
        barcode: barcode.trim(),
        category,
        subcategory: 'Imported',
        description: `${brand} ${name}`,
        currentStock,
        unit,
        minStockLevel: Math.max(5, Math.floor(currentStock * 0.3)),
        reorderPoint: Math.max(10, Math.floor(currentStock * 0.5)),
        optimalStockLevel: Math.max(25, Math.floor(currentStock * 1.5)),
        maxCapacity: Math.max(50, currentStock * 2),
        costPrice,
        sellingPrice,
        vatRate: 0,
        batches: [
          {
            id: `batch-${batchUuid}`,
            batchNumber: `BAT-${Math.floor(100 + Math.random() * 900)}`,
            expiryDate,
            quantity: currentStock,
            costPrice,
            markdownPercentage: 0,
            status: 'safe'
          }
        ],
        location: {
          aisle,
          shelf: 'Bay 01',
          section: 'Main',
          tempZone
        },
        supplierId: 'sup-1',
        supplierName: 'Primary Wholesale Dist.',
        salesVelocity: {
          dailyAverage: Math.max(1, Math.floor(currentStock * 0.15)),
          weeklySales: Math.max(7, Math.floor(currentStock * 1.0)),
          turnoverRate: 14,
          lastRestockedAt: new Date().toISOString().split('T')[0],
          lastSoldAt: 'Today'
        },
        tags: ['Imported', category]
      });
    });

    if (processed.length === 0) {
      setErrorMsg('No valid product rows found in spreadsheet. Check column headers.');
    } else {
      setParsedItems(processed);
      setErrorMsg(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsLoading(true);
    setErrorMsg(null);

    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

    if (isExcel) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const data = evt.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const json = XLSX.utils.sheet_to_json(firstSheet);
          processRowData(json);
        } catch (err: any) {
          setErrorMsg('Failed to parse Excel file: ' + err.message);
        } finally {
          setIsLoading(false);
        }
      };
      reader.readAsBinaryString(file);
    } else {
      // CSV
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          processRowData(results.data);
          setIsLoading(false);
        },
        error: (err) => {
          setErrorMsg('Failed to parse CSV file: ' + err.message);
          setIsLoading(false);
        }
      });
    }
  };

  const handleConfirmImport = async () => {
    if (parsedItems.length === 0) return;
    setIsLoading(true);
    try {
      const isReplace = importMode === 'replace';
      await importBulkItems(parsedItems as InventoryItem[], isReplace);
      addToast({
        type: 'success',
        title: isReplace ? 'Catalogue Overwritten' : 'Products Appended',
        message: isReplace
          ? `Replaced store catalogue with ${parsedItems.length} products.`
          : `Added ${parsedItems.length} products to your store catalogue.`
      });
      onClose();
    } catch (err: any) {
      setErrorMsg('Failed to import to database: ' + err.message);
    } finally {
      setIsLoading(false);
    }
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
          className="relative flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d0d10] shadow-2xl z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.06] p-4 bg-[#09090b]/50">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.08] bg-zinc-900 text-zinc-300">
                <FileSpreadsheet className="h-3.5 w-3.5" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-white tracking-tight">
                  Import Inventory (CSV / Excel)
                </h3>
                <p className="text-[11px] text-zinc-500">
                  Bulk upload products, stocks, prices and expiration dates
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

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Upload Box */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.1] bg-zinc-950/40 p-6 text-center hover:border-white/[0.2] hover:bg-zinc-950/60 cursor-pointer transition-all group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 border border-white/[0.06] text-zinc-400 group-hover:scale-105 group-hover:text-white transition-all mb-2">
                <UploadCloud className="h-5 w-5" />
              </div>
              <h4 className="text-xs font-medium text-white">
                {fileName ? fileName : 'Choose CSV or Excel Spreadsheet'}
              </h4>
              <p className="text-[11px] text-zinc-500 mt-1 max-w-sm">
                Drag and drop your catalogue file or click to browse. Supports .csv, .xlsx, .xls
              </p>
            </div>

            {/* Template Download & Info */}
            <div className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-zinc-900/30 p-3 text-xs">
              <div className="text-[11px] text-zinc-400">
                Need the standard structure? Download our pre-formatted template with all 12 columns.
              </div>
              <button
                type="button"
                onClick={handleDownloadSampleCSV}
                className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-zinc-900 px-2.5 py-1 text-[11px] font-medium text-zinc-200 hover:bg-zinc-800 transition-all whitespace-nowrap"
              >
                <Download className="h-3 w-3" />
                <span>Download Sample</span>
              </button>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Import Mode Selector */}
            {parsedItems.length > 0 && (
              <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-200">Import Destination Mode</span>
                  <span className="text-[11px] text-zinc-500">Current store items: {items.length}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setImportMode('replace')}
                    className={`flex items-start gap-2.5 rounded-lg border p-2.5 text-left transition-all ${
                      importMode === 'replace'
                        ? 'border-emerald-500/40 bg-emerald-950/30 text-white'
                        : 'border-white/[0.04] bg-zinc-900/60 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <RefreshCw className={`h-4 w-4 mt-0.5 shrink-0 ${importMode === 'replace' ? 'text-emerald-400' : 'text-zinc-500'}`} />
                    <div>
                      <div className="text-xs font-medium text-white">Replace Store Catalogue (Clean Overwrite)</div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">Wipes existing store items and replaces with this fresh {parsedItems.length}-item dataset.</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setImportMode('append')}
                    className={`flex items-start gap-2.5 rounded-lg border p-2.5 text-left transition-all ${
                      importMode === 'append'
                        ? 'border-cyan-500/40 bg-cyan-950/30 text-white'
                        : 'border-white/[0.04] bg-zinc-900/60 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <PlusCircle className={`h-4 w-4 mt-0.5 shrink-0 ${importMode === 'append' ? 'text-cyan-400' : 'text-zinc-500'}`} />
                    <div>
                      <div className="text-xs font-medium text-white">Append to Existing ({items.length + parsedItems.length} Total)</div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">Keeps current {items.length} items and adds the new {parsedItems.length} items.</div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Parsed Data Preview */}
            {parsedItems.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>Previewing {parsedItems.length} validated products:</span>
                  <button
                    onClick={() => {
                      setParsedItems([]);
                      setFileName('');
                    }}
                    className="text-[11px] text-zinc-500 hover:text-rose-400 flex items-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Clear File</span>
                  </button>
                </div>

                <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 overflow-hidden max-h-56 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-white/[0.06] bg-zinc-950/70 text-zinc-400 text-[10px] uppercase font-semibold">
                      <tr>
                        <th className="py-2 px-3">Name</th>
                        <th className="py-2 px-3">SKU</th>
                        <th className="py-2 px-3">Category</th>
                        <th className="py-2 px-3">Stock</th>
                        <th className="py-2 px-3">Cost</th>
                        <th className="py-2 px-3">Price</th>
                        <th className="py-2 px-3">Expiry</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04] text-zinc-300 text-[11px]">
                      {parsedItems.map((p, idx) => (
                        <tr key={idx} className="hover:bg-white/[0.02]">
                          <td className="py-2 px-3 font-medium text-white truncate max-w-[160px]">{p.name}</td>
                          <td className="py-2 px-3 font-mono text-zinc-400">{p.sku}</td>
                          <td className="py-2 px-3 text-zinc-400">{p.category}</td>
                          <td className="py-2 px-3 font-mono">{p.currentStock} {p.unit}</td>
                          <td className="py-2 px-3 font-mono">{formatINR(p.costPrice || 0)}</td>
                          <td className="py-2 px-3 font-mono font-medium text-white">{formatINR(p.sellingPrice || 0)}</td>
                          <td className="py-2 px-3 font-mono text-zinc-400">{p.batches?.[0]?.expiryDate || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-white/[0.06] p-4 bg-[#09090b]/50 flex gap-2">
            <button
              onClick={handleConfirmImport}
              disabled={parsedItems.length === 0 || isLoading}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-zinc-100 py-2 text-xs font-semibold text-zinc-900 hover:bg-white active:scale-95 disabled:opacity-30 transition-all shadow-sm"
            >
              <Check className="h-3.5 w-3.5" />
              <span>
                {isLoading
                  ? 'Importing...'
                  : importMode === 'replace'
                  ? `Overwrite Catalogue with ${parsedItems.length} Products`
                  : `Add ${parsedItems.length} Products to Store`}
              </span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg border border-white/[0.08] bg-zinc-900 px-4 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
