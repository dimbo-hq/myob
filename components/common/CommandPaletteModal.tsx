'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { 
  Search, 
  ShoppingCart, 
  RotateCcw, 
  Moon, 
  Plus, 
  FileSpreadsheet, 
  Users, 
  Package, 
  Building2, 
  Clock, 
  Sparkles, 
  X, 
  ArrowRight,
  Command,
  Zap,
  Volume2,
  VolumeX,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatINR } from '@/lib/currency';
import { soundFx } from '@/lib/soundEffects';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPOS: () => void;
  onOpenReturns: () => void;
  onOpenZReport: () => void;
  onOpenAddProduct: () => void;
  onOpenImport: () => void;
  onOpenTimeSimulator: () => void;
  onNavigate: (tab: 'inventory' | 'expiry' | 'reorder' | 'customers' | 'audit') => void;
}

interface CommandItem {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  badge?: string;
  shortcut?: string;
  action: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onOpenPOS,
  onOpenReturns,
  onOpenZReport,
  onOpenAddProduct,
  onOpenImport,
  onOpenTimeSimulator,
  onNavigate
}) => {
  const { 
    items, 
    customers, 
    suppliers, 
    storeName,
    applySmartExpiryMarkdowns,
    addToast
  } = useInventory();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(soundFx.getIsMuted());
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setIsMuted(soundFx.getIsMuted());
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Actions group
  const actionItems: CommandItem[] = useMemo(() => [
    {
      id: 'action-pos',
      category: 'Quick Actions',
      title: 'Open Express POS Counter',
      subtitle: 'Scan barcodes and bill customer orders',
      icon: <ShoppingCart className="h-4 w-4 text-emerald-400" />,
      shortcut: '⌘P',
      action: () => { onClose(); onOpenPOS(); }
    },
    {
      id: 'action-zreport',
      category: 'Quick Actions',
      title: 'End-of-Day Shift Close (Z-Report)',
      subtitle: 'Audit cash drawer float and reconcile registers',
      icon: <Moon className="h-4 w-4 text-indigo-400" />,
      shortcut: '⌘Z',
      action: () => { onClose(); onOpenZReport(); }
    },
    {
      id: 'action-returns',
      category: 'Quick Actions',
      title: 'Process Return & Refund',
      subtitle: 'Look up receipt order ID and restock items',
      icon: <RotateCcw className="h-4 w-4 text-amber-400" />,
      shortcut: '⌘R',
      action: () => { onClose(); onOpenReturns(); }
    },
    {
      id: 'action-add-product',
      category: 'Quick Actions',
      title: 'Add New Product SKU',
      subtitle: 'Create single catalog item with batch info',
      icon: <Plus className="h-4 w-4 text-cyan-400" />,
      shortcut: '⌘N',
      action: () => { onClose(); onOpenAddProduct(); }
    },
    {
      id: 'action-markdowns',
      category: 'Quick Actions',
      title: 'Run AI Smart Expiry Markdowns',
      subtitle: 'Apply 15% - 75% staged clearance tiers',
      icon: <Zap className="h-4 w-4 text-amber-400" />,
      action: () => {
        const count = applySmartExpiryMarkdowns();
        soundFx.playMarkdownChime();
        addToast({
          type: 'success',
          title: 'Markdowns Applied',
          message: `Dynamic clearance pricing recalculated for expiring batches.`
        });
        onClose();
      }
    },
    {
      id: 'action-sound-toggle',
      category: 'Preferences',
      title: isMuted ? 'Unmute Audio & Scanner Beeps' : 'Mute Audio & Scanner Beeps',
      subtitle: isMuted ? 'Enable tactile sound effects' : 'Disable tactile sound effects',
      icon: isMuted ? <VolumeX className="h-4 w-4 text-zinc-500" /> : <Volume2 className="h-4 w-4 text-emerald-400" />,
      action: () => {
        const newMuted = soundFx.toggleMute();
        setIsMuted(newMuted);
        if (!newMuted) soundFx.playCartTick();
      }
    },
    {
      id: 'action-import',
      category: 'Quick Actions',
      title: 'Import CSV / Excel Spreadsheet',
      subtitle: 'Bulk load products and batches into store',
      icon: <FileSpreadsheet className="h-4 w-4 text-emerald-400" />,
      action: () => { onClose(); onOpenImport(); }
    },
    {
      id: 'action-sim-date',
      category: 'Quick Actions',
      title: 'Open Time Simulator',
      subtitle: 'Fast forward store calendar to test FIFO expiries',
      icon: <Clock className="h-4 w-4 text-cyan-400" />,
      action: () => { onClose(); onOpenTimeSimulator(); }
    }
  ], [onClose, onOpenPOS, onOpenZReport, onOpenReturns, onOpenAddProduct, onOpenImport, onOpenTimeSimulator, applySmartExpiryMarkdowns, isMuted, addToast]);

  // Search Results
  const filteredResults: CommandItem[] = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) {
      return actionItems;
    }

    const matchedActions: CommandItem[] = actionItems.filter(
      (a) => a.title.toLowerCase().includes(q) || a.subtitle.toLowerCase().includes(q)
    );

    const matchedProducts: CommandItem[] = items
      .filter((it) => 
        it.name.toLowerCase().includes(q) || 
        it.sku.toLowerCase().includes(q) || 
        it.barcode.includes(q) ||
        it.brand.toLowerCase().includes(q)
      )
      .slice(0, 8)
      .map((it) => ({
        id: `prod-${it.id}`,
        category: 'Products & SKUs',
        title: it.name,
        subtitle: `${it.brand} • SKU: ${it.sku} • Stock: ${it.currentStock} ${it.unit}`,
        badge: formatINR(it.sellingPrice),
        icon: <Package className="h-4 w-4 text-emerald-400" />,
        action: () => {
          onClose();
          onNavigate('inventory');
        }
      }));

    const matchedCustomers: CommandItem[] = customers
      .filter((c) => c.name.toLowerCase().includes(q) || c.phone.includes(q))
      .slice(0, 5)
      .map((c) => ({
        id: `cust-${c.phone}`,
        category: 'Customers',
        title: c.name,
        subtitle: `Phone: ${c.phone} • Orders: ${c.totalOrders} • Spend: ${formatINR(c.totalSpent)}`,
        badge: c.totalSpent > 5000 ? 'VIP' : 'Customer',
        icon: <Users className="h-4 w-4 text-cyan-400" />,
        action: () => {
          onClose();
          onNavigate('customers');
        }
      }));

    const matchedSuppliers: CommandItem[] = suppliers
      .filter((s) => s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q))
      .slice(0, 4)
      .map((s) => ({
        id: `supp-${s.id}`,
        category: 'Suppliers',
        title: s.name,
        subtitle: `${s.category} • Lead Time: ${s.leadTimeDays}d • ${s.phone}`,
        icon: <Building2 className="h-4 w-4 text-amber-400" />,
        action: () => {
          onClose();
          onNavigate('reorder');
        }
      }));

    return [...matchedActions, ...matchedProducts, ...matchedCustomers, ...matchedSuppliers];
  }, [query, actionItems, items, customers, suppliers, onClose, onNavigate]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredResults.length));
      soundFx.playCartTick();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredResults.length) % Math.max(1, filteredResults.length));
      soundFx.playCartTick();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredResults[selectedIndex]) {
        filteredResults[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 pt-[12vh]">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Palette Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -15 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-white/[0.1] bg-[#0d0d11] shadow-2xl z-10 flex flex-col max-h-[75vh]"
        >
          {/* Top Search Input */}
          <div className="flex items-center gap-3 border-b border-white/[0.08] px-4 py-3.5 bg-zinc-950/80">
            <Search className="h-4 w-4 text-zinc-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Type a command, product SKU, barcode, customer phone..."
              className="w-full bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none font-sans"
            />
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-zinc-500 hover:text-white transition-colors"
            >
              <kbd className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 border border-zinc-700">ESC</kbd>
            </button>
          </div>

          {/* Results List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredResults.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-500">
                No matching actions, products, or customers found.
              </div>
            ) : (
              filteredResults.map((item, index) => {
                const isSelected = index === selectedIndex;
                return (
                  <div
                    key={item.id}
                    onClick={() => item.action()}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`flex items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-zinc-800/90 text-white shadow-sm border border-white/[0.08]'
                        : 'text-zinc-300 hover:bg-zinc-900/60 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg border shrink-0 ${
                        isSelected ? 'bg-zinc-700/80 border-white/[0.1]' : 'bg-zinc-900 border-white/[0.04]'
                      }`}>
                        {item.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold font-heading tracking-tight truncate">
                            {item.title}
                          </span>
                          <span className="text-[9px] font-mono text-zinc-500 uppercase">
                            {item.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 truncate font-sans">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {item.badge && (
                        <span className="rounded-md bg-zinc-800/80 px-2 py-0.5 text-[10px] font-mono font-bold text-zinc-300 border border-zinc-700/60">
                          {item.badge}
                        </span>
                      )}
                      {item.shortcut && (
                        <kbd className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 border border-zinc-700">
                          {item.shortcut}
                        </kbd>
                      )}
                      <ArrowRight className={`h-3.5 w-3.5 transition-transform ${
                        isSelected ? 'translate-x-0.5 text-white' : 'text-transparent'
                      }`} />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Shortcuts Navigation Bar */}
          <div className="flex items-center justify-between border-t border-white/[0.06] bg-zinc-950 px-4 py-2 text-[11px] text-zinc-500 font-mono">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="rounded bg-zinc-800 px-1 text-[10px]">↑</kbd>
                <kbd className="rounded bg-zinc-800 px-1 text-[10px]">↓</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded bg-zinc-800 px-1 text-[10px]">↵</kbd>
                Select
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span>{storeName || 'myob'}</span>
              <span>•</span>
              <span>⌘K Spotlight</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
