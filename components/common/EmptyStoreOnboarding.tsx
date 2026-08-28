'use client';

import React from 'react';
import { 
  FileSpreadsheet, 
  Plus, 
  Store, 
  ArrowRight
} from 'lucide-react';

interface EmptyStoreOnboardingProps {
  onOpenImport: () => void;
  onOpenAddProduct: () => void;
}

export const EmptyStoreOnboarding: React.FC<EmptyStoreOnboardingProps> = ({
  onOpenImport,
  onOpenAddProduct
}) => {
  return (
    <div className="surface-card rounded-2xl p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-6 my-6">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-zinc-900 text-zinc-200 shadow-xl">
        <Store className="h-7 w-7" />
      </div>

      <div className="space-y-2 max-w-md mx-auto">
        <h3 className="text-xl font-semibold tracking-tight text-white">
          Welcome to Your Supermarket Workspace
        </h3>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Your inventory database is ready and isolated to your store account. Choose how you would like to add products:
        </p>
      </div>

      {/* 2 Onboarding Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left pt-2">
        {/* Card 1: Import */}
        <div
          onClick={onOpenImport}
          className="group cursor-pointer rounded-xl border border-white/[0.06] bg-zinc-950/60 p-5 hover:border-emerald-500/30 hover:bg-zinc-900/60 transition-all flex flex-col justify-between"
        >
          <div className="space-y-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.06] bg-zinc-900 text-emerald-400 group-hover:bg-emerald-500/10 transition-colors">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-semibold text-white">Import from CSV / Excel</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Upload existing spreadsheet catalogues or POS exports with automated column mapping.
            </p>
          </div>
          <div className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-emerald-400 group-hover:text-emerald-300 pt-3 border-t border-white/[0.04]">
            <span>Import Spreadsheet</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 2: Manual Entry */}
        <div
          onClick={onOpenAddProduct}
          className="group cursor-pointer rounded-xl border border-white/[0.06] bg-zinc-950/60 p-5 hover:border-white/[0.2] hover:bg-zinc-900/60 transition-all flex flex-col justify-between"
        >
          <div className="space-y-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.06] bg-zinc-900 text-zinc-200 group-hover:text-white transition-colors">
              <Plus className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-semibold text-white">Add Products Manually</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Create individual SKUs, barcodes, supplier costs, and shelf locations one by one.
            </p>
          </div>
          <div className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-zinc-200 group-hover:text-white pt-3 border-t border-white/[0.04]">
            <span>Create SKU</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};
