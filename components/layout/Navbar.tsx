'use client';

import React from 'react';
import { useInventory } from '@/context/InventoryContext';
import { 
  SignInButton, 
  SignUpButton, 
  Show, 
  UserButton 
} from '@clerk/nextjs';
import { 
  FastForward, 
  RotateCcw, 
  ShoppingCart, 
  Store,
  Plus,
  LogIn,
  UserPlus,
  FileSpreadsheet,
  RefreshCw,
  Edit2,
  Users,
  Moon
} from 'lucide-react';

interface NavbarProps {
  onOpenPOS: () => void;
  onOpenTimeSimulator: () => void;
  onOpenAddProduct: () => void;
  onOpenImport: () => void;
  onOpenStoreNameModal: () => void;
  onNavigateExpiry: () => void;
  onNavigateCustomers?: () => void;
  onOpenZReport?: () => void;
  onOpenReturns?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenPOS,
  onOpenTimeSimulator,
  onOpenAddProduct,
  onOpenImport,
  onOpenStoreNameModal,
  onNavigateExpiry,
  onNavigateCustomers,
  onOpenZReport,
  onOpenReturns
}) => {
  const {
    storeName,
    simulatedDateOffset,
    summary,
    resetToDemoData,
    isSyncing
  } = useInventory();

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.07] bg-[#09090b]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand & Dynamic Store Name */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-zinc-900 overflow-hidden shadow-sm">
            <img src="/logo.png" alt="myob" className="h-full w-full object-contain p-0.5" />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-white lowercase leading-tight">
                myob
              </span>
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest leading-none hidden md:block">
                Mind Your Own Business
              </span>
            </div>

            {/* Clickable Store Name */}
            <button
              onClick={onOpenStoreNameModal}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white font-normal pl-2.5 border-l border-zinc-800 transition-colors group"
              title="Click to rename your store"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="font-medium text-zinc-200 group-hover:text-white truncate max-w-[180px]">
                {storeName || 'Name Your Store'}
              </span>
              <Edit2 className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 text-zinc-400 transition-opacity" />
            </button>

            {isSyncing && (
              <span className="hidden md:inline-flex items-center gap-1 text-[10px] text-zinc-500 font-mono pl-1">
                <RefreshCw className="h-3 w-3 animate-spin text-zinc-500" />
                <span>MongoDB Sync</span>
              </span>
            )}
          </div>
        </div>

        {/* Center Live Alert Pill */}
        {(summary.expiringSoonCount > 0 || summary.expiredCount > 0) && (
          <button
            onClick={onNavigateExpiry}
            className="hidden md:flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs text-amber-400 hover:bg-amber-500/15 transition-all"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            <span>{summary.expiringSoonCount + summary.expiredCount} items require clearance markdown</span>
          </button>
        )}

        {/* Action Controls & Auth */}
        <div className="flex items-center gap-2">
          {/* Import CSV / Excel */}
          <button
            onClick={onOpenImport}
            className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-zinc-900/80 px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all"
            title="Import CSV or Excel products"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-zinc-400" />
            <span className="hidden sm:inline">Import</span>
          </button>

          {/* Time Simulator */}
          <button
            onClick={onOpenTimeSimulator}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all ${
              simulatedDateOffset > 0
                ? 'border-cyan-500/40 bg-cyan-950/40 text-cyan-300'
                : 'border-white/[0.08] bg-zinc-900/80 text-zinc-300 hover:bg-zinc-800 hover:text-white'
            }`}
            title="Fast forward simulation date"
          >
            <FastForward className="h-3.5 w-3.5 text-zinc-400" />
            <span>{simulatedDateOffset === 0 ? 'Sim' : `+${simulatedDateOffset}d`}</span>
          </button>

          {/* New Item */}
          <button
            onClick={onOpenAddProduct}
            className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-zinc-900/80 px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all"
          >
            <Plus className="h-3.5 w-3.5 text-zinc-400" />
            <span className="hidden sm:inline">Product</span>
          </button>

          {/* Customers Directory */}
          {onNavigateCustomers && (
            <button
              onClick={onNavigateCustomers}
              className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-zinc-900/80 px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all cursor-pointer"
              title="Customer Directory & Loyalty"
            >
              <Users className="h-3.5 w-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Customers</span>
            </button>
          )}

          {/* Customer Returns & Refunds */}
          {onOpenReturns && (
            <button
              onClick={onOpenReturns}
              className="hidden lg:flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-zinc-900/80 px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all cursor-pointer"
              title="Process Customer Return / Refund"
            >
              <RotateCcw className="h-3.5 w-3.5 text-amber-400" />
              <span>Returns</span>
            </button>
          )}

          {/* End-of-Day Z-Report */}
          {onOpenZReport && (
            <button
              onClick={onOpenZReport}
              className="hidden sm:flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-950/40 px-2.5 py-1.5 text-xs font-medium text-indigo-300 hover:bg-indigo-900/50 hover:text-white transition-all cursor-pointer"
              title="End-of-Day Shift Close & Cash Reconciliation"
            >
              <Moon className="h-3.5 w-3.5 text-indigo-400" />
              <span className="hidden md:inline">Day Close</span>
            </button>
          )}

          {/* POS Terminal */}
          <button
            onClick={onOpenPOS}
            className="flex items-center gap-1.5 rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-950 hover:bg-white active:scale-95 transition-all shadow-sm cursor-pointer"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">POS</span>
          </button>

          {/* Reset Demo Data */}
          <button
            onClick={resetToDemoData}
            className="rounded-lg border border-white/[0.06] bg-zinc-900/60 p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 transition-colors"
            title="Reset Store Demo Data"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          {/* Clerk Auth Section */}
          <div className="pl-1.5 ml-1 border-l border-zinc-800 flex items-center">
            <Show when="signed-out">
              <div className="flex items-center gap-1.5">
                <SignInButton mode="modal">
                  <button className="flex items-center gap-1 rounded-lg border border-white/[0.08] bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-800 hover:text-white transition-all">
                    <LogIn className="h-3 w-3 text-zinc-400" />
                    <span>Sign In</span>
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="flex items-center gap-1 rounded-lg bg-zinc-100 px-2.5 py-1.5 text-xs font-semibold text-zinc-950 hover:bg-white transition-all">
                    <UserPlus className="h-3 w-3" />
                    <span>Sign Up</span>
                  </button>
                </SignUpButton>
              </div>
            </Show>

            <Show when="signed-in">
              <div className="flex items-center gap-2">
                <UserButton
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "h-7 w-7 rounded-md border border-white/[0.1]",
                    }
                  }}
                />
              </div>
            </Show>
          </div>
        </div>
      </div>
    </header>
  );
};
