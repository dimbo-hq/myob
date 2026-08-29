'use client';

import React from 'react';
import { 
  Keyboard, 
  X, 
  Command, 
  ShoppingCart, 
  Moon, 
  Plus, 
  RotateCcw, 
  Search, 
  Sparkles, 
  ArrowRight,
  Layers,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { soundFx } from '@/lib/soundEffects';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPOS: () => void;
  onOpenZReport: () => void;
  onOpenAddProduct: () => void;
  onOpenReturns: () => void;
  onOpenCommandPalette: () => void;
  onNavigate: (tab: 'dashboard' | 'inventory' | 'expiry' | 'reorder' | 'customers' | 'audit') => void;
}

interface ShortcutItem {
  title: string;
  keys: string[];
  desc: string;
  icon?: React.ReactNode;
  action?: () => void;
}

interface ShortcutGroup {
  group: string;
  items: ShortcutItem[];
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
  onOpenPOS,
  onOpenZReport,
  onOpenAddProduct,
  onOpenReturns,
  onOpenCommandPalette,
  onNavigate
}) => {
  if (!isOpen) return null;

  const shortcutGroups: ShortcutGroup[] = [
    {
      group: 'Core Actions & Modals',
      items: [
        {
          title: 'Universal Command Palette',
          keys: ['⌘', 'K'],
          desc: 'Search SKUs, customers, suppliers & run quick actions',
          icon: <Search className="h-4 w-4 text-emerald-400" />,
          action: () => { onClose(); onOpenCommandPalette(); }
        },
        {
          title: 'Express POS Counter',
          keys: ['⌘', 'P'],
          desc: 'Scan barcodes & bill customer baskets',
          icon: <ShoppingCart className="h-4 w-4 text-emerald-400" />,
          action: () => { onClose(); onOpenPOS(); }
        },
        {
          title: 'Day-Close Shift Z-Report',
          keys: ['⌘', 'Z'],
          desc: 'Audit cash drawer float & reconcile registers',
          icon: <Moon className="h-4 w-4 text-indigo-400" />,
          action: () => { onClose(); onOpenZReport(); }
        },
        {
          title: 'Add New Product SKU',
          keys: ['⌘', 'N'],
          desc: 'Create new catalog item with batch info',
          icon: <Plus className="h-4 w-4 text-cyan-400" />,
          action: () => { onClose(); onOpenAddProduct(); }
        },
        {
          title: 'Process Return & Refund',
          keys: ['⌘', 'R'],
          desc: 'Look up receipt order ID & restock items',
          icon: <RotateCcw className="h-4 w-4 text-amber-400" />,
          action: () => { onClose(); onOpenReturns(); }
        }
      ]
    },
    {
      group: 'Quick Navigation (Number Keys)',
      items: [
        {
          title: 'Dashboard & Analytics',
          keys: ['1'],
          desc: 'Store valuation & KPI health metrics',
          action: () => { onClose(); onNavigate('dashboard'); }
        },
        {
          title: 'Master Inventory Catalog',
          keys: ['2'],
          desc: 'Product list, safety stock & aisle locations',
          action: () => { onClose(); onNavigate('inventory'); }
        },
        {
          title: 'FIFO Expiry Tracker',
          keys: ['3'],
          desc: 'Perishable batch tracking & smart markdowns',
          action: () => { onClose(); onNavigate('expiry'); }
        },
        {
          title: 'Reorder & Purchase Orders',
          keys: ['4'],
          desc: 'Low stock pipeline & vendor management',
          action: () => { onClose(); onNavigate('reorder'); }
        },
        {
          title: 'Customer CRM & Loyalty',
          keys: ['5'],
          desc: 'Shopper purchase history & VIP tier perks',
          action: () => { onClose(); onNavigate('customers'); }
        },
        {
          title: 'Stock Movement Audit Log',
          keys: ['6'],
          desc: 'Audit trail for all sales, returns & adjustments',
          action: () => { onClose(); onNavigate('audit'); }
        }
      ]
    },
    {
      group: 'General & POS Scanner',
      items: [
        {
          title: 'Auto-Add Barcode Match',
          keys: ['Enter'],
          desc: 'Instantly add exact barcode scan to POS cart'
        },
        {
          title: 'Keyboard Shortcuts Modal',
          keys: ['?'],
          desc: 'Toggle this cheat sheet modal from anywhere'
        },
        {
          title: 'Close Modal / Cancel',
          keys: ['Esc'],
          desc: 'Dismiss active dialog or return to dashboard'
        }
      ]
    }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
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
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.16, ease: 'easeOut' }}
          className="relative w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden rounded-3xl border border-white/[0.1] bg-[#0c0c10] text-zinc-100 shadow-2xl z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-4 bg-zinc-950/80 shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-zinc-800 border border-white/[0.08] text-zinc-200">
                <Keyboard className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-heading tracking-tight flex items-center gap-2">
                  <span>Keyboard Shortcuts</span>
                  <span className="rounded-md bg-zinc-800/90 px-2 py-0.5 text-[10px] font-mono text-zinc-400 border border-zinc-700/60">
                    Raycast Style
                  </span>
                </h3>
                <p className="text-xs text-zinc-400 font-sans">
                  Quick key bindings for high-velocity cashiering & store navigation
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-xl p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
            >
              <kbd className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 border border-zinc-700">ESC</kbd>
            </button>
          </div>

          {/* Shortcuts Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {shortcutGroups.map((grp) => (
              <div key={grp.group} className="space-y-2.5">
                <div className="text-[11px] font-bold text-zinc-400 uppercase font-heading tracking-wider">
                  {grp.group}
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {grp.items.map((item) => (
                    <div
                      key={item.title}
                      onClick={() => {
                        if (item.action) {
                          soundFx.playCartTick();
                          item.action();
                        }
                      }}
                      className={`flex items-center justify-between gap-3 rounded-2xl border border-white/[0.05] bg-zinc-900/50 px-4 py-2.5 transition-all ${
                        item.action ? 'hover:bg-zinc-800/80 hover:border-white/[0.12] cursor-pointer group' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {item.icon && (
                          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-zinc-950 border border-white/[0.04] shrink-0">
                            {item.icon}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-white font-heading truncate group-hover:text-emerald-300 transition-colors">
                            {item.title}
                          </div>
                          <div className="text-[11px] text-zinc-400 font-sans truncate">
                            {item.desc}
                          </div>
                        </div>
                      </div>

                      {/* Keys Badge */}
                      <div className="flex items-center gap-1 shrink-0">
                        {item.keys.map((k) => (
                          <kbd
                            key={k}
                            className="flex min-w-[24px] items-center justify-center rounded-lg border border-zinc-700/80 bg-zinc-800/90 px-2 py-1 text-xs font-mono font-bold text-zinc-200 shadow-sm"
                          >
                            {k}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer Note */}
          <div className="border-t border-white/[0.06] bg-zinc-950 px-6 py-3 flex items-center justify-between text-xs text-zinc-500 font-sans shrink-0">
            <span>Press <kbd className="font-mono text-zinc-300 font-bold">?</kbd> at any time to open this cheatsheet</span>
            <span className="font-mono text-[11px]">myob Retail OS</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
