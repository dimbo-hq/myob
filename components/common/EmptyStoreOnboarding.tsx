'use client';

import React from 'react';
import { useInventory } from '@/context/InventoryContext';
import { 
  FileSpreadsheet, 
  Sparkles, 
  Plus, 
  Store, 
  ArrowRight,
  Package,
  Layers,
  Zap
} from 'lucide-react';

interface EmptyStoreOnboardingProps {
  onOpenImport: () => void;
  onOpenAddProduct: () => void;
}

export const EmptyStoreOnboarding: React.FC<EmptyStoreOnboardingProps> = ({
  onOpenImport,
  onOpenAddProduct
}) => {
  const { seedSampleData } = useInventory();

  return (
    <div className="surface-card rounded-2xl p-8 sm:p-12 text-center max-w-3xl mx-auto space-y-6 my-6">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-zinc-900 text-zinc-200 shadow-xl">
        <Store className="h-7 w-7" />
      </div>

      <div className="space-y-2 max-w-md mx-auto">
        <h3 className="text-xl font-semibold tracking-tight text-white">
          Welcome to Your Supermarket Workspace
        </h3>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Your inventory database is ready and isolated to your store account. Choose how you would like to get started:
        </p>
      </div>

      {/* 3 Onboarding Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-left pt-2">
        {/* Card 1: Import */}
        <div
          onClick={onOpenImport}
          className="group cursor-pointer rounded-xl border border-white/[0.06] bg-zinc-950/60 p-4 hover:border-white/[0.15] hover:bg-zinc-900/60 transition-all flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.06] bg-zinc-900 text-zinc-300 group-hover:text-white">
              <FileSpreadsheet className="h-4 w-4" />
            </div>
            <h4 className="text-xs font-semibold text-white">Import from CSV / Excel</h4>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Upload existing spreadsheet catalogues or POS exports with automated column mapping.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-[11px] font-medium text-zinc-300 group-hover:text-white pt-2 border-t border-white/[0.03]">
            <span>Import Spreadsheet</span>
            <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Card 2: Demo Sample Data */}
        <div
          onClick={() => seedSampleData()}
          className="group cursor-pointer rounded-xl border border-white/[0.06] bg-zinc-950/60 p-4 hover:border-white/[0.15] hover:bg-zinc-900/60 transition-all flex flex-col justify-between relative overflow-hidden"
        >
          <div className="space-y-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.06] bg-zinc-900 text-amber-300 group-hover:text-amber-200">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-semibold text-white">Load Supermarket Demo</h4>
              <span className="rounded bg-amber-950/60 border border-amber-800/40 text-[9px] font-semibold text-amber-400 px-1 py-0.2">
                1-Click
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Seed 16 fresh grocery products, multi-batch expiry dates, vendors, and draft POs instantly.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-[11px] font-medium text-amber-400 group-hover:text-amber-300 pt-2 border-t border-white/[0.03]">
            <span>Populate Demo Store</span>
            <Zap className="h-3 w-3 fill-amber-400" />
          </div>
        </div>

        {/* Card 3: Manual Entry */}
        <div
          onClick={onOpenAddProduct}
          className="group cursor-pointer rounded-xl border border-white/[0.06] bg-zinc-950/60 p-4 hover:border-white/[0.15] hover:bg-zinc-900/60 transition-all flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.06] bg-zinc-900 text-zinc-300 group-hover:text-white">
              <Plus className="h-4 w-4" />
            </div>
            <h4 className="text-xs font-semibold text-white">Add Products Manually</h4>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Create individual SKUs, barcodes, supplier costs, and shelf locations one by one.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-[11px] font-medium text-zinc-300 group-hover:text-white pt-2 border-t border-white/[0.03]">
            <span>Create SKU</span>
            <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};
