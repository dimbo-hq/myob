'use client';

import React, { useState } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { InventoryItem } from '@/types/inventory';
import { Scan, X, Search, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct?: (item: InventoryItem) => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct
}) => {
  const { items } = useInventory();
  const [manualCode, setManualCode] = useState('');
  const [scannedItem, setScannedItem] = useState<InventoryItem | null>(null);

  if (!isOpen) return null;

  const handleScanCode = (code: string) => {
    const clean = code.trim();
    const found = items.find(
      (it) => it.barcode.toLowerCase() === clean.toLowerCase() || it.sku.toLowerCase() === clean.toLowerCase()
    );
    setScannedItem(found || null);
  };

  const handleConfirm = () => {
    if (scannedItem) {
      if (onSelectProduct) {
        onSelectProduct(scannedItem);
      }
      onClose();
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
          className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d0d10] shadow-2xl z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.06] p-4 bg-[#09090b]/50">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.08] bg-zinc-900 text-zinc-300">
                <Scan className="h-3.5 w-3.5" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-white tracking-tight">
                  Barcode Scanner
                </h3>
                <p className="text-[11px] text-zinc-500">
                  Scan EAN-13 barcode or SKU
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

          <div className="p-5 space-y-4">
            {/* Camera Viewfinder */}
            <div className="relative mx-auto flex h-40 w-full flex-col items-center justify-center overflow-hidden rounded-xl border border-white/[0.06] bg-zinc-950/80">
              <div className="absolute top-3 left-3 h-4 w-4 border-t-2 border-l-2 border-zinc-400" />
              <div className="absolute top-3 right-3 h-4 w-4 border-t-2 border-r-2 border-zinc-400" />
              <div className="absolute bottom-3 left-3 h-4 w-4 border-b-2 border-l-2 border-zinc-400" />
              <div className="absolute bottom-3 right-3 h-4 w-4 border-b-2 border-r-2 border-zinc-400" />

              <div className="absolute left-4 right-4 h-[1px] bg-red-400/80 animate-laser-line" />

              {scannedItem ? (
                <div className="flex flex-col items-center text-center p-3">
                  <CheckCircle2 className="h-6 w-6 text-emerald-400 mb-1" />
                  <span className="text-xs font-medium text-white max-w-xs truncate">
                    {scannedItem.name}
                  </span>
                  <span className="font-mono text-[10px] text-zinc-500 mt-0.5">
                    {scannedItem.barcode} • ${scannedItem.sellingPrice.toFixed(2)}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1.5 text-center text-zinc-600">
                  <Scan className="h-6 w-6" />
                  <span className="text-[11px]">Position barcode in viewfinder</span>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="flex gap-1.5">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Type barcode or SKU..."
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleScanCode(manualCode);
                  }}
                  className="w-full rounded-lg border border-white/[0.06] bg-zinc-900 pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
                />
              </div>
              <button
                onClick={() => handleScanCode(manualCode)}
                className="rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-900 hover:bg-white active:scale-95 transition-all shadow-sm"
              >
                Scan
              </button>
            </div>

            {/* Scanned result */}
            {scannedItem && (
              <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-3 space-y-2 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-white">{scannedItem.name}</div>
                    <div className="text-[11px] text-zinc-500">{scannedItem.category} • {scannedItem.location.aisle}</div>
                  </div>
                  <div className="font-mono font-medium text-white">${scannedItem.sellingPrice.toFixed(2)}</div>
                </div>

                <button
                  onClick={handleConfirm}
                  className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-zinc-100 py-2 text-xs font-semibold text-zinc-900 hover:bg-white transition-all shadow-sm"
                >
                  <span>Use Selected Item</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Presets */}
            <div>
              <label className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1.5">
                Quick Sample Barcodes:
              </label>
              <div className="grid grid-cols-2 gap-1.5 max-h-28 overflow-y-auto">
                {items.slice(0, 4).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setManualCode(item.barcode);
                      handleScanCode(item.barcode);
                    }}
                    className="rounded border border-white/[0.04] bg-zinc-900/40 p-2 text-left hover:border-white/[0.1] hover:bg-zinc-800/40 transition-all text-xs"
                  >
                    <div className="text-zinc-200 font-medium truncate">{item.name}</div>
                    <div className="font-mono text-[10px] text-zinc-500">{item.barcode}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
