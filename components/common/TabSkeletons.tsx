'use client';

import React from 'react';

// 1. Inventory Catalogue Skeleton
export const InventorySkeleton: React.FC = () => {
  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Header controls & stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
        <div className="space-y-1">
          <div className="h-4 w-40 rounded bg-zinc-800 animate-pulse" />
          <div className="h-3 w-56 rounded bg-zinc-900 animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-20 rounded-xl bg-zinc-900 animate-pulse border border-white/[0.04]" />
          <div className="h-8 w-24 rounded-xl bg-zinc-900 animate-pulse border border-white/[0.04]" />
          <div className="h-8 w-28 rounded-xl bg-zinc-800 animate-pulse border border-white/[0.06]" />
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="surface-card rounded-2xl p-4 border border-white/[0.06] bg-[#0f0f13] space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          <div className="h-9 rounded-xl bg-zinc-900/90 animate-pulse border border-white/[0.04]" />
          <div className="h-9 rounded-xl bg-zinc-900/80 animate-pulse border border-white/[0.04]" />
          <div className="h-9 rounded-xl bg-zinc-900/80 animate-pulse border border-white/[0.04]" />
          <div className="h-9 rounded-xl bg-zinc-900/80 animate-pulse border border-white/[0.04]" />
        </div>

        {/* Category Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="h-6 w-20 rounded-lg bg-zinc-900/60 animate-pulse shrink-0 border border-white/[0.02]"
            />
          ))}
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="surface-card rounded-2xl border border-white/[0.06] bg-[#0f0f13] overflow-hidden">
        {/* Table Header */}
        <div className="border-b border-white/[0.06] bg-zinc-950/80 px-4 py-3 grid grid-cols-12 gap-3 items-center">
          <div className="col-span-4 h-3 w-28 rounded bg-zinc-800 animate-pulse" />
          <div className="col-span-2 h-3 w-20 rounded bg-zinc-800 animate-pulse" />
          <div className="col-span-2 h-3 w-16 rounded bg-zinc-800 animate-pulse" />
          <div className="col-span-2 h-3 w-20 rounded bg-zinc-800 animate-pulse" />
          <div className="col-span-2 h-3 w-16 ml-auto rounded bg-zinc-800 animate-pulse" />
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-white/[0.03]">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((row) => (
            <div
              key={row}
              className="px-4 py-3.5 grid grid-cols-12 gap-3 items-center hover:bg-white/[0.01]"
            >
              <div className="col-span-4 flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-zinc-850 animate-pulse shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3 w-3/4 rounded bg-zinc-800 animate-pulse" />
                  <div className="h-2 w-1/2 rounded bg-zinc-900 font-mono animate-pulse" />
                </div>
              </div>
              <div className="col-span-2 space-y-1">
                <div className="h-3 w-24 rounded bg-zinc-800 animate-pulse" />
                <div className="h-2 w-16 rounded bg-zinc-900 animate-pulse" />
              </div>
              <div className="col-span-2">
                <div className="h-5 w-20 rounded-full bg-zinc-900 animate-pulse border border-white/[0.03]" />
              </div>
              <div className="col-span-2 space-y-1">
                <div className="h-3.5 w-16 rounded bg-zinc-800 font-mono animate-pulse" />
                <div className="h-2 w-12 rounded bg-zinc-900 font-mono animate-pulse" />
              </div>
              <div className="col-span-2 flex items-center justify-end gap-1.5">
                <div className="h-7 w-7 rounded-lg bg-zinc-900 animate-pulse" />
                <div className="h-7 w-7 rounded-lg bg-zinc-900 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 2. Expiry & Markdowns Skeleton
export const ExpirySkeleton: React.FC = () => {
  return (
    <div className="space-y-5 animate-fadeIn">
      {/* 3 Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-white/[0.06] bg-[#111114] p-4.5 space-y-2.5"
          >
            <div className="h-3 w-28 rounded bg-zinc-800/80 animate-pulse" />
            <div className="h-7 w-32 rounded bg-zinc-700/60 font-mono animate-pulse" />
            <div className="h-2.5 w-40 rounded bg-zinc-900 animate-pulse" />
          </div>
        ))}
      </div>

      {/* AI Markdown Banner Skeleton */}
      <div className="rounded-2xl border border-white/[0.06] bg-zinc-900/40 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-zinc-800 animate-pulse" />
          <div className="space-y-1.5">
            <div className="h-3.5 w-48 rounded bg-zinc-800 animate-pulse" />
            <div className="h-2.5 w-64 rounded bg-zinc-900 animate-pulse" />
          </div>
        </div>
        <div className="h-8 w-36 rounded-xl bg-zinc-800 animate-pulse" />
      </div>

      {/* Batch Table Skeleton */}
      <div className="surface-card rounded-2xl border border-white/[0.06] bg-[#0f0f13] overflow-hidden">
        <div className="border-b border-white/[0.06] bg-zinc-950/80 px-4 py-3 flex items-center justify-between">
          <div className="h-3.5 w-32 rounded bg-zinc-800 animate-pulse" />
          <div className="flex gap-1.5">
            <div className="h-6 w-16 rounded-lg bg-zinc-900 animate-pulse" />
            <div className="h-6 w-16 rounded-lg bg-zinc-900 animate-pulse" />
            <div className="h-6 w-16 rounded-lg bg-zinc-900 animate-pulse" />
          </div>
        </div>

        <div className="divide-y divide-white/[0.03]">
          {[1, 2, 3, 4, 5, 6].map((row) => (
            <div
              key={row}
              className="px-4 py-3.5 flex items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="h-3.5 w-1/3 rounded bg-zinc-800 animate-pulse" />
                <div className="h-2.5 w-1/4 rounded bg-zinc-900 font-mono animate-pulse" />
              </div>
              <div className="h-5 w-24 rounded-full bg-zinc-900 animate-pulse" />
              <div className="h-3.5 w-20 rounded bg-zinc-800 font-mono animate-pulse" />
              <div className="h-7 w-24 rounded-lg bg-zinc-850 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 3. Replenishment & POs Skeleton
export const ReorderSkeleton: React.FC = () => {
  return (
    <div className="space-y-5 animate-fadeIn">
      {/* 3 Reorder Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-white/[0.06] bg-[#111114] p-4.5 space-y-2.5"
          >
            <div className="h-3 w-32 rounded bg-zinc-800/80 animate-pulse" />
            <div className="h-7 w-28 rounded bg-zinc-700/60 font-mono animate-pulse" />
            <div className="h-2.5 w-36 rounded bg-zinc-900 animate-pulse" />
          </div>
        ))}
      </div>

      {/* Action Bar Skeleton */}
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
        <div className="flex gap-1.5">
          <div className="h-7 w-32 rounded-lg bg-zinc-800 animate-pulse" />
          <div className="h-7 w-28 rounded-lg bg-zinc-900 animate-pulse" />
          <div className="h-7 w-24 rounded-lg bg-zinc-900 animate-pulse" />
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-36 rounded-xl bg-zinc-850 animate-pulse" />
          <div className="h-8 w-28 rounded-xl bg-zinc-800 animate-pulse" />
        </div>
      </div>

      {/* PO Items List Skeleton */}
      <div className="surface-card rounded-2xl border border-white/[0.06] bg-[#0f0f13] overflow-hidden divide-y divide-white/[0.03]">
        {[1, 2, 3, 4, 5].map((row) => (
          <div
            key={row}
            className="p-4 flex items-center justify-between gap-4"
          >
            <div className="space-y-1.5 flex-1">
              <div className="h-3.5 w-1/3 rounded bg-zinc-800 animate-pulse" />
              <div className="h-2.5 w-1/2 rounded bg-zinc-900 animate-pulse" />
            </div>
            <div className="h-5 w-20 rounded-full bg-zinc-900 animate-pulse" />
            <div className="h-3.5 w-20 rounded bg-zinc-800 font-mono animate-pulse" />
            <div className="h-7 w-28 rounded-lg bg-zinc-800 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
};

// 4. Activity Ledger Skeleton
export const AuditSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Header & Filter Controls */}
      <div className="surface-card rounded-2xl p-4 border border-white/[0.06] bg-[#0f0f13] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="h-9 w-full sm:w-80 rounded-xl bg-zinc-900/90 animate-pulse border border-white/[0.04]" />
          <div className="h-8 w-28 rounded-xl bg-zinc-900 animate-pulse border border-white/[0.04]" />
        </div>

        {/* Activity Type Chips */}
        <div className="flex gap-1.5 overflow-x-auto pb-0.5">
          {[1, 2, 3, 4, 5, 6].map((k) => (
            <div
              key={k}
              className="h-6 w-20 rounded-lg bg-zinc-900/60 animate-pulse shrink-0 border border-white/[0.02]"
            />
          ))}
        </div>
      </div>

      {/* Movement Rows Skeleton */}
      <div className="surface-card rounded-2xl border border-white/[0.06] bg-[#0f0f13] overflow-hidden divide-y divide-white/[0.03]">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((row) => (
          <div
            key={row}
            className="p-3.5 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-zinc-800 animate-pulse shrink-0" />
              <div className="space-y-1.5">
                <div className="h-3.5 w-48 rounded bg-zinc-800 animate-pulse" />
                <div className="h-2.5 w-36 rounded bg-zinc-900 animate-pulse" />
              </div>
            </div>
            <div className="space-y-1 text-right">
              <div className="h-3 w-16 rounded bg-zinc-800 font-mono ml-auto animate-pulse" />
              <div className="h-2 w-20 rounded bg-zinc-900 ml-auto animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
