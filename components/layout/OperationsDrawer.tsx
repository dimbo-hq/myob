'use client';

import React, { useState } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { 
  X, 
  ShoppingCart, 
  RotateCcw, 
  Moon, 
  Plus, 
  FileSpreadsheet, 
  Users, 
  Tag, 
  Edit2, 
  FastForward, 
  RefreshCw, 
  Trash2,
  Store, 
  Layers, 
  Clock, 
  ShieldCheck, 
  ChevronRight,
  Database,
  Sparkles,
  Receipt,
  Scale
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatINR } from '@/lib/currency';
import { WipeStoreModal } from '../common/WipeStoreModal';

interface OperationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPOS: () => void;
  onOpenReturns: () => void;
  onOpenZReport: () => void;
  onOpenAddProduct: () => void;
  onOpenImport: () => void;
  onOpenStoreNameModal: () => void;
  onOpenTimeSimulator: () => void;
  onNavigateExpiry: () => void;
  onNavigateCustomers: () => void;
}

export const OperationsDrawer: React.FC<OperationsDrawerProps> = ({
  isOpen,
  onClose,
  onOpenPOS,
  onOpenReturns,
  onOpenZReport,
  onOpenAddProduct,
  onOpenImport,
  onOpenStoreNameModal,
  onOpenTimeSimulator,
  onNavigateExpiry,
  onNavigateCustomers
}) => {
  const {
    storeName,
    summary,
    simulatedDateOffset,
    isSyncing,
    customers,
    items
  } = useInventory();

  const [isWipeModalOpen, setIsWipeModalOpen] = useState(false);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div key="operations-drawer-container" className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              key="operations-drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            />

            {/* Slide-over Drawer Panel */}
            <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
              <motion.div
                key="operations-drawer-panel"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="w-screen max-w-md border-l border-white/[0.08] bg-[#0c0c10] shadow-2xl flex flex-col"
              >
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-white/[0.06] p-4 bg-zinc-950/80">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm">
                  <Store className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                    <span>Operations & Control Hub</span>
                  </h3>
                  <p className="text-[11px] text-zinc-400 font-mono flex items-center gap-1.5 mt-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span className="truncate max-w-[200px]">{storeName || 'My Supermarket'}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="rounded-xl border border-white/[0.06] bg-zinc-900 p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
                title="Close drawer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin">
              {/* Group 1: Counter & Cashier Operations */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-zinc-400 px-1">
                  <span>Checkout & Cashier Terminal</span>
                  <span className="text-[10px] text-emerald-400 font-semibold">POS</span>
                </div>

                <div className="space-y-1.5">
                  {/* Express POS Button */}
                  <button
                    onClick={() => {
                      onClose();
                      onOpenPOS();
                    }}
                    className="w-full flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3 text-left hover:bg-emerald-950/40 hover:border-emerald-500/50 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        <ShoppingCart className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                          Express POS Checkout
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          Barcode scanning, weighed produce, cash change
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-zinc-500 group-hover:text-white transition-colors" />
                  </button>

                  {/* Returns & Refunds */}
                  <button
                    onClick={() => {
                      onClose();
                      onOpenReturns();
                    }}
                    className="w-full flex items-center justify-between rounded-xl border border-white/[0.06] bg-zinc-900/50 p-3 text-left hover:bg-zinc-800/70 hover:border-amber-500/30 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <RotateCcw className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-zinc-200 group-hover:text-white">
                          Returns & Refund Terminal
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          1-Click return by receipt ID, restock or defect write-off
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-zinc-500 group-hover:text-white transition-colors" />
                  </button>

                  {/* Day Close Z-Report */}
                  <button
                    onClick={() => {
                      onClose();
                      onOpenZReport();
                    }}
                    className="w-full flex items-center justify-between rounded-xl border border-white/[0.06] bg-zinc-900/50 p-3 text-left hover:bg-zinc-800/70 hover:border-indigo-500/30 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        <Moon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-zinc-200 group-hover:text-white">
                          End-of-Day Shift Close (Z-Report)
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          Cash drawer tally, tender reconciliation & audit slip
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-zinc-500 group-hover:text-white transition-colors" />
                  </button>
                </div>
              </div>

              {/* Group 2: Inventory & Catalogue Management */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-zinc-400 px-1">
                  <span>Inventory & Catalogue</span>
                  <span className="text-[10px] text-zinc-500 font-mono">{items.length} Products</span>
                </div>

                <div className="space-y-1.5">
                  {/* Add Product */}
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAddProduct();
                    }}
                    className="w-full flex items-center justify-between rounded-xl border border-white/[0.06] bg-zinc-900/50 p-3 text-left hover:bg-zinc-800/70 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        <Plus className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-zinc-200 group-hover:text-white">
                          Add New Product
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          Create custom SKU, barcode, initial batch & pricing
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-zinc-500 group-hover:text-white transition-colors" />
                  </button>

                  {/* Import Products */}
                  <button
                    onClick={() => {
                      onClose();
                      onOpenImport();
                    }}
                    className="w-full flex items-center justify-between rounded-xl border border-white/[0.06] bg-zinc-900/50 p-3 text-left hover:bg-zinc-800/70 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20">
                        <FileSpreadsheet className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-zinc-200 group-hover:text-white">
                          Import CSV / Excel Sheet
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          Bulk import products or replace entire store catalogue
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-zinc-500 group-hover:text-white transition-colors" />
                  </button>

                  {/* Customer CRM */}
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateCustomers();
                    }}
                    className="w-full flex items-center justify-between rounded-xl border border-white/[0.06] bg-zinc-900/50 p-3 text-left hover:bg-zinc-800/70 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <Users className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-zinc-200 group-hover:text-white flex items-center gap-1.5">
                          <span>Customer Directory & Loyalty</span>
                          <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 text-[9px] font-bold text-emerald-300 font-mono">
                            {customers.length}
                          </span>
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          Phone directory, lifetime spend & transaction records
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-zinc-500 group-hover:text-white transition-colors" />
                  </button>

                  {/* Expiry & Markdowns */}
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateExpiry();
                    }}
                    className="w-full flex items-center justify-between rounded-xl border border-white/[0.06] bg-zinc-900/50 p-3 text-left hover:bg-zinc-800/70 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <Tag className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-zinc-200 group-hover:text-white flex items-center gap-1.5">
                          <span>Expiry & Clearance Markdowns</span>
                          {(summary.expiringSoonCount + summary.expiredCount > 0) && (
                            <span className="rounded bg-amber-500/20 px-1.5 py-0.2 text-[9px] font-bold text-amber-400 font-mono">
                              {summary.expiringSoonCount + summary.expiredCount} alerts
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          FIFO dynamic pricing, markdown schedule & write-offs
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-zinc-500 group-hover:text-white transition-colors" />
                  </button>
                </div>
              </div>

              {/* Group 3: Store Utilities & Simulation */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-zinc-400 px-1">
                  <span>Store Utilities & Config</span>
                  <span className="text-[10px] text-zinc-500 font-mono">Sim & Tools</span>
                </div>

                <div className="space-y-1.5">
                  {/* Rename Store */}
                  <button
                    onClick={() => {
                      onClose();
                      onOpenStoreNameModal();
                    }}
                    className="w-full flex items-center justify-between rounded-xl border border-white/[0.06] bg-zinc-900/50 p-3 text-left hover:bg-zinc-800/70 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-zinc-300 border border-white/[0.06]">
                        <Edit2 className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-zinc-200 group-hover:text-white">
                          Rename Store
                        </div>
                        <div className="text-[11px] text-zinc-400 truncate max-w-[240px]">
                          Current: {storeName || 'Not Set'}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-zinc-500 group-hover:text-white transition-colors" />
                  </button>

                  {/* Time Simulator */}
                  <button
                    onClick={() => {
                      onClose();
                      onOpenTimeSimulator();
                    }}
                    className="w-full flex items-center justify-between rounded-xl border border-white/[0.06] bg-zinc-900/50 p-3 text-left hover:bg-zinc-800/70 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        <FastForward className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-zinc-200 group-hover:text-white flex items-center gap-1.5">
                          <span>Time Travel Simulator</span>
                          {simulatedDateOffset > 0 && (
                            <span className="rounded bg-cyan-500/20 px-1.5 py-0.2 text-[9px] font-bold text-cyan-300 font-mono">
                              +{simulatedDateOffset}d
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          Fast forward store calendar to test FIFO expiries
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-zinc-500 group-hover:text-white transition-colors" />
                  </button>

                  {/* Danger Zone: Permanent Store Wipe */}
                  <button
                    onClick={() => setIsWipeModalOpen(true)}
                    className="w-full flex items-center justify-between rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-left hover:bg-rose-500/15 hover:border-rose-500/50 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
                        <Trash2 className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-rose-300 group-hover:text-rose-200 flex items-center gap-1.5">
                          <span>Permanent Store Wipe</span>
                          <span className="rounded bg-rose-950 px-1.5 py-0.2 text-[9px] font-mono font-bold text-rose-400 border border-rose-800/60 uppercase">
                            Danger
                          </span>
                        </div>
                        <div className="text-[11px] text-zinc-400 mt-0.5">
                          Erase all cloud products, customers, orders & registers
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-rose-400 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="border-t border-white/[0.06] bg-zinc-950 p-3.5 flex items-center justify-between text-xs text-zinc-500 shrink-0">
              <div className="flex items-center gap-2">
                <Database className="h-3.5 w-3.5 text-emerald-500" />
                <span className="font-mono text-[11px]">
                  {isSyncing ? 'Syncing to Cloud...' : 'Multi-Tenant MongoDB Connected'}
                </span>
              </div>
              <span className="font-mono text-[10px] text-zinc-600">v2.0 • myob</span>
            </div>
          </motion.div>
        </div>
      </div>
        )}
      </AnimatePresence>

      {/* High-Security Wipe Modal */}
      {isWipeModalOpen && (
        <WipeStoreModal
          isOpen={isWipeModalOpen}
          onClose={() => {
            setIsWipeModalOpen(false);
            onClose();
          }}
        />
      )}
    </>
  );
};
