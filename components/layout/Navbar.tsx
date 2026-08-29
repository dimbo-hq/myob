'use client';

import React, { useState } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { 
  SignInButton, 
  SignUpButton, 
  Show, 
  UserButton 
} from '@clerk/nextjs';
import { 
  ShoppingCart, 
  Plus, 
  LogIn, 
  UserPlus, 
  RefreshCw, 
  Edit2, 
  Menu,
  LayoutGrid,
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { OperationsDrawer } from './OperationsDrawer';

interface NavbarProps {
  onOpenPOS: () => void;
  onOpenTimeSimulator: () => void;
  onOpenAddProduct: () => void;
  onOpenImport: () => void;
  onOpenStoreNameModal: () => void;
  onNavigateExpiry: () => void;
  onNavigateCustomers: () => void;
  onOpenZReport: () => void;
  onOpenReturns: () => void;
  onOpenCommandPalette?: () => void;
  onOpenShortcuts?: () => void;
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
  onOpenReturns,
  onOpenCommandPalette,
  onOpenShortcuts
}) => {
  const {
    storeName,
    simulatedDateOffset,
    summary,
    isSyncing
  } = useInventory();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const totalExpiryAlerts = summary.expiringSoonCount + summary.expiredCount;

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#09090b]/80 backdrop-blur-xl transition-all">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left: Brand Identity & Live Multi-Tenant Store Badge */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-base font-black tracking-tight text-white font-heading">
                myob
              </span>
              <span className="rounded-md bg-zinc-800/80 px-1.5 py-0.5 text-[10px] font-mono font-bold text-zinc-400 border border-zinc-700/60">
                v2.1
              </span>
            </div>

            <div className="h-4 w-px bg-zinc-800 hidden sm:block" />

            {/* Active Store Name Selector */}
            <button
              onClick={onOpenStoreNameModal}
              className="hidden sm:flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-800/60 hover:text-white transition-colors cursor-pointer group"
              title="Click to rename store"
            >
              <span className="font-semibold text-zinc-200 group-hover:text-white truncate max-w-[140px] md:max-w-[220px] font-heading">
                {storeName || 'My Supermarket'}
              </span>
              <Edit2 className="h-2.5 w-2.5 text-zinc-500 group-hover:text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            {/* Cloud Sync Status Pulse */}
            <div className="flex items-center gap-1.5 pl-1" title={isSyncing ? 'Syncing to Cloud MongoDB...' : 'Cloud Database Synced'}>
              <span className={`h-2 w-2 rounded-full ${isSyncing ? 'bg-amber-400 animate-ping' : 'bg-emerald-500 led-glow-emerald'}`} />
              <span className="text-[10px] font-mono text-zinc-500 hidden md:inline">
                {isSyncing ? 'Syncing...' : 'MongoDB Cloud'}
              </span>
            </div>
          </div>

          {/* Center: Live Expiry Warning Pill (Minimalist) */}
          {totalExpiryAlerts > 0 && (
            <button
              onClick={onNavigateExpiry}
              className="hidden lg:flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs text-amber-400 hover:bg-amber-500/15 hover:border-amber-500/30 transition-all cursor-pointer shadow-sm font-sans"
              title="Click to manage clearance discounts"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="font-medium font-heading">{totalExpiryAlerts} clearance markdowns required</span>
            </button>
          )}

          {/* Right: Uncluttered Actions + Operations Drawer Trigger + Auth */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Simulation Date Badge if Active */}
            {simulatedDateOffset > 0 && (
              <button
                onClick={onOpenTimeSimulator}
                className="hidden sm:inline-flex items-center gap-1 rounded-xl border border-cyan-500/30 bg-cyan-950/30 px-2.5 py-1 text-[11px] font-mono font-semibold text-cyan-300 hover:bg-cyan-900/40 transition-colors cursor-pointer"
                title="Simulated store date is active. Click to adjust."
              >
                <Clock className="h-3 w-3 text-cyan-400" />
                <span>+{simulatedDateOffset}d Sim</span>
              </button>
            )}

            {/* Global Spotlight ⌘K Button */}
            {onOpenCommandPalette && (
              <button
                onClick={onOpenCommandPalette}
                className="hidden md:flex items-center gap-2 rounded-xl border border-white/[0.08] bg-zinc-900/60 px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 transition-all cursor-pointer shadow-sm group"
                title="Open Global Command Palette (⌘K / Ctrl+K)"
              >
                <span className="font-sans text-[11px]">Search</span>
                <kbd className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 border border-zinc-700 group-hover:border-zinc-500">⌘K</kbd>
              </button>
            )}

            {/* Keyboard Shortcuts Trigger Button */}
            {onOpenShortcuts && (
              <button
                onClick={onOpenShortcuts}
                className="hidden lg:flex items-center justify-center rounded-xl border border-white/[0.08] bg-zinc-900/60 h-8 w-8 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 transition-all cursor-pointer shadow-sm"
                title="Keyboard Shortcuts Cheat Sheet (Press ?)"
              >
                <span className="font-mono text-xs font-bold">?</span>
              </button>
            )}

            {/* Quick Add Product Button */}
            <button
              onClick={onOpenAddProduct}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-zinc-900/80 px-2.5 py-1.5 text-xs font-heading font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 text-zinc-400" />
              <span>Product</span>
            </button>

            {/* POS Checkout Button */}
            <button
              onClick={onOpenPOS}
              className="flex items-center gap-1.5 rounded-xl bg-zinc-100 px-3.5 py-1.5 text-xs font-heading font-extrabold text-zinc-950 hover:bg-white active:scale-95 transition-all shadow-md cursor-pointer"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              <span>POS</span>
            </button>

            {/* Operations & Control Hub Drawer Trigger */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-zinc-900/90 px-3 py-1.5 text-xs font-heading font-bold text-zinc-200 hover:bg-zinc-800 hover:text-white active:scale-95 transition-all cursor-pointer group"
              title="Open Operations Hub (Z-Report, Returns, Import, Customers, Utilities)"
            >
              <LayoutGrid className="h-3.5 w-3.5 text-emerald-400 group-hover:rotate-12 transition-transform" />
              <span className="hidden sm:inline">Operations</span>
            </button>

            {/* Clerk Auth Section */}
            <div className="pl-1.5 ml-0.5 border-l border-zinc-800 flex items-center">
              <Show when="signed-out">
                <div className="flex items-center gap-1.5">
                  <SignInButton mode="modal">
                    <button className="flex items-center gap-1 rounded-lg border border-white/[0.08] bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-800 hover:text-white transition-all cursor-pointer">
                      <LogIn className="h-3 w-3 text-zinc-400" />
                      <span>Sign In</span>
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="flex items-center gap-1 rounded-lg bg-zinc-100 px-2.5 py-1.5 text-xs font-semibold text-zinc-950 hover:bg-white transition-all cursor-pointer">
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
                        userButtonAvatarBox: "h-7 w-7 rounded-lg border border-white/[0.1]",
                      }
                    }}
                  />
                </div>
              </Show>
            </div>
          </div>
        </div>
      </header>

      {/* Slide-out Operations Drawer */}
      <OperationsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onOpenPOS={onOpenPOS}
        onOpenReturns={onOpenReturns}
        onOpenZReport={onOpenZReport}
        onOpenAddProduct={onOpenAddProduct}
        onOpenImport={onOpenImport}
        onOpenStoreNameModal={onOpenStoreNameModal}
        onOpenTimeSimulator={onOpenTimeSimulator}
        onNavigateExpiry={onNavigateExpiry}
        onNavigateCustomers={onNavigateCustomers}
      />
    </>
  );
};
