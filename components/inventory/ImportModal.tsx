'use client';

import React, { useState, useRef } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { InventoryItem, CategoryType, UnitType, TempZone } from '@/types/inventory';
import { getRelativeDate } from '@/lib/dateUtils';
import { UploadCloud, FileSpreadsheet, Download, Check, AlertCircle, X, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose }) => {
  const { importBulkItems, addToast } = useInventory();

  const [parsedItems, setParsedItems] = useState<Partial<InventoryItem>[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDownloadSampleCSV = () => {
    const sampleHeaders = ['Name', 'Brand', 'SKU', 'Barcode', 'Category', 'CurrentStock', 'Unit', 'CostPrice', 'SellingPrice', 'ExpiryDate', 'Aisle', 'TempZone'];
    const sampleRows = [
      ['Organic Hass Avocados', 'Green Valley Organic', 'PROD-AVO-01', '840129001015', 'Fresh Produce', '48', 'pcs', '1.10', '2.29', getRelativeDate(3), 'Aisle 01', 'ambient'],
      ['Farm Fresh Whole Milk 1L', 'Alpine Crest', 'DAIR-MLK-01', '840129002012', 'Dairy & Eggs', '25', 'bottle', '2.40', '4.29', getRelativeDate(5), 'Aisle 02', 'chilled'],
      ['Artisan Sourdough Loaf', 'Artisan Heritage', 'BAKE-SRD-01', '840129003019', 'Bakery & Deli', '15', 'pcs', '2.20', '5.49', getRelativeDate(2), 'Aisle 03', 'ambient'],
      ['Prime Ribeye Steak 400g', 'Prime Harbor', 'MEAT-RIB-01', '840129004016', 'Meat & Seafood', '12', 'pack', '12.50', '21.99', getRelativeDate(4), 'Aisle 04', 'chilled'],
      ['Cold Brew Nitro Coffee 330ml', 'Artisan Heritage', 'BEV-CBW-01', '840129005013', 'Beverages', '60', 'bottle', '1.65', '3.89', getRelativeDate(60), 'Aisle 05', 'chilled'],
      ['Organic Basmati Rice 2kg', 'Global Pantry', 'PAN-RIC-02', '840129006027', 'Pantry & Dry Goods', '40', 'pack', '4.10', '8.49', getRelativeDate(300), 'Aisle 06', 'ambient']
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + [sampleHeaders.join(','), ...sampleRows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'supermarket_inventory_sample_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast({
      type: 'info',
      title: 'Sample CSV Downloaded',
      message: 'Template saved. Populate rows and upload here.'
    });
  };

  const processRowData = (rows: any[]) => {
    try {
      const items: Partial<InventoryItem>[] = [];

      rows.forEach((row, idx) => {
        // Map keys case-insensitively
        const getVal = (keyNames: string[]) => {
          for (const key of Object.keys(row)) {
            const cleanKey = key.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
            for (const target of keyNames) {
              if (cleanKey === target.toLowerCase().replace(/[^a-z0-9]/g, '')) {
                return row[key];
              }
            }
          }
          return undefined;
        };

        const name = getVal(['name', 'productname', 'title', 'item']);
        if (!name) return; // Skip empty rows

        const brand = getVal(['brand', 'producer', 'vendor']) || 'Store Brand';
        const sku = getVal(['sku', 'itemcode', 'code']) || `SKU-${Math.floor(1000 + Math.random() * 9000)}`;
        const barcode = getVal(['barcode', 'ean', 'upc', 'gtin']) || `84012900${Math.floor(1000 + Math.random() * 9000)}`;
        const category = (getVal(['category', 'dept', 'department']) || 'Fresh Produce') as CategoryType;
        const currentStock = Number(getVal(['currentstock', 'stock', 'qty', 'quantity']) || 20);
        const unit = (getVal(['unit', 'uom']) || 'pcs') as UnitType;
        const costPrice = Number(getVal(['costprice', 'cost', 'unitcost']) || 2.00);
        const sellingPrice = Number(getVal(['sellingprice', 'price', 'retailprice']) || 4.00);
        const expiryDate = getVal(['expirydate', 'exp', 'expiration', 'bestbefore']) || getRelativeDate(14);
        const aisle = getVal(['aisle', 'location', 'shelf']) || 'Aisle 01';
        const tempZone = (getVal(['tempzone', 'storage', 'temperature']) || 'ambient') as TempZone;

        const uniqueId = typeof crypto !== 'undefined' && crypto.randomUUID 
          ? crypto.randomUUID() 
          : `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

        const batch = {
          id: `b-imp-${idx}-${uniqueId}`,
          batchNumber: `BAT-${Math.floor(100 + Math.random() * 900)}`,
          quantity: currentStock,
          expiryDate: String(expiryDate).split('T')[0],
          costPrice,
          markdownPercentage: 0,
          status: 'safe' as const
        };

        items.push({
          id: `item-imp-${idx}-${uniqueId}`,
          name: String(name),
          brand: String(brand),
          sku: String(sku),
          barcode: String(barcode),
          category,
          subcategory: 'Imported',
          description: `${brand} ${name}`,
          currentStock,
          unit,
          minStockLevel: Math.max(5, Math.round(currentStock * 0.3)),
          reorderPoint: Math.max(8, Math.round(currentStock * 0.5)),
          optimalStockLevel: Math.max(30, Math.round(currentStock * 1.5)),
          maxCapacity: Math.max(50, Math.round(currentStock * 2)),
          costPrice,
          sellingPrice,
          vatRate: 0.0,
          batches: currentStock > 0 ? [batch] : [],
          location: {
            aisle: String(aisle),
            shelf: 'Bay 01',
            section: 'General',
            tempZone
          },
          supplierId: 'sup-1',
          supplierName: 'Primary Wholesale Dist.',
          salesVelocity: {
            dailyAverage: Math.max(1, Math.round(currentStock / 7)),
            weeklySales: currentStock,
            turnoverRate: 4.0,
            lastRestockedAt: 'Today',
            lastSoldAt: 'Just imported'
          },
          tags: ['Imported', category]
        });
      });

      if (items.length === 0) {
        setErrorMsg('Could not find valid product rows in file. Please ensure columns include "Name", "SKU", "Price".');
      } else {
        setParsedItems(items);
        setErrorMsg(null);
      }
    } catch (err: any) {
      setErrorMsg(`Parsing error: ${err.message}`);
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
      await importBulkItems(parsedItems as InventoryItem[]);
      addToast({
        type: 'success',
        title: 'Import Successful',
        message: `Imported ${parsedItems.length} products to your store catalogue.`
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

          <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
            {/* Download Template Banner */}
            <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-zinc-900/40 p-3.5">
              <div className="space-y-0.5">
                <div className="font-medium text-white">Need a spreadsheet template?</div>
                <div className="text-[11px] text-zinc-500">
                  Download our pre-formatted sample CSV with all supermarket columns.
                </div>
              </div>
              <button
                onClick={handleDownloadSampleCSV}
                className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-700 transition-all shadow-sm"
              >
                <Download className="h-3.5 w-3.5 text-zinc-400" />
                <span>Sample CSV</span>
              </button>
            </div>

            {/* Dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer flex flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.1] bg-zinc-950/60 p-6 text-center hover:border-white/[0.2] hover:bg-zinc-900/40 transition-all"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv, .xlsx, .xls"
                onChange={handleFileUpload}
                className="hidden"
              />
              <UploadCloud className="h-8 w-8 text-zinc-500 mb-2" />
              <div className="text-xs font-medium text-zinc-300">
                {fileName ? fileName : 'Click to select CSV or Excel (.xlsx) file'}
              </div>
              <div className="text-[11px] text-zinc-500 mt-1">
                Supports PapaParse CSV and Microsoft Excel (.xlsx, .xls)
              </div>
            </div>

            {/* Error message */}
            {errorMsg && (
              <div className="flex items-center gap-2 rounded-lg border border-rose-800/40 bg-rose-950/40 p-3 text-rose-300 text-xs">
                <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Preview table */}
            {parsedItems.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-white">
                    Parsed Products ({parsedItems.length} ready to import):
                  </span>
                  <button
                    onClick={() => {
                      setParsedItems([]);
                      setFileName('');
                    }}
                    className="text-[11px] text-zinc-500 hover:text-rose-400"
                  >
                    Clear File
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
                          <td className="py-2 px-3 font-mono">${p.costPrice?.toFixed(2)}</td>
                          <td className="py-2 px-3 font-mono font-medium text-white">${p.sellingPrice?.toFixed(2)}</td>
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
              <span>{isLoading ? 'Importing...' : `Import ${parsedItems.length} Products`}</span>
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
