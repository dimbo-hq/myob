'use client';

import React from 'react';

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans">
      {/* 1. Top Navbar Skeleton */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#09090b]/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo & Store Title */}
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-lg bg-zinc-800 animate-pulse border border-white/[0.04]" />
            <div className="space-y-1">
              <div className="h-3 w-16 rounded bg-zinc-800 animate-pulse" />
              <div className="h-2.5 w-24 rounded bg-zinc-900 animate-pulse" />
            </div>
            <div className="hidden sm:block h-3.5 w-px bg-zinc-800" />
            <div className="hidden sm:flex h-5 w-28 rounded-full bg-zinc-900 animate-pulse border border-white/[0.03]" />
          </div>

          {/* Center Alert Pill */}
          <div className="hidden md:flex h-6 w-56 rounded-full bg-zinc-900/80 animate-pulse border border-white/[0.04]" />

          {/* Actions */}
          <div className="flex items-center gap-2">
            <div className="h-7 w-16 rounded-lg bg-zinc-900 animate-pulse border border-white/[0.04]" />
            <div className="h-7 w-14 rounded-lg bg-zinc-900 animate-pulse border border-white/[0.04]" />
            <div className="h-7 w-20 rounded-lg bg-zinc-900 animate-pulse border border-white/[0.04]" />
            <div className="h-7 w-16 rounded-lg bg-zinc-800 animate-pulse border border-white/[0.06]" />
            <div className="h-7 w-7 rounded-full bg-zinc-800 animate-pulse ml-1 border border-white/[0.04]" />
          </div>
        </div>
      </header>

      {/* 2. Main Content Area Skeleton */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-5 space-y-5">
        {/* Navigation Tabs Skeleton */}
        <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
          <div className="h-8 w-28 rounded-xl bg-zinc-800 animate-pulse border border-white/[0.06]" />
          <div className="h-8 w-36 rounded-xl bg-zinc-900/60 animate-pulse border border-white/[0.03]" />
          <div className="h-8 w-32 rounded-xl bg-zinc-900/60 animate-pulse border border-white/[0.03]" />
          <div className="h-8 w-36 rounded-xl bg-zinc-900/60 animate-pulse border border-white/[0.03]" />
          <div className="h-8 w-28 rounded-xl bg-zinc-900/60 animate-pulse border border-white/[0.03]" />
        </div>

        {/* 3. Top 4 KPI Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/[0.06] bg-[#111114] p-4.5 space-y-3 shadow-sm relative overflow-hidden"
            >
              {/* Shimmer sweep effect */}
              <div className="flex items-center justify-between">
                <div className="h-3 w-28 rounded bg-zinc-800/80 animate-pulse" />
                <div className="h-4 w-16 rounded-full bg-zinc-900 animate-pulse" />
              </div>
              <div className="h-7 w-36 rounded bg-zinc-700/60 animate-pulse" />
              <div className="flex items-center justify-between pt-1 border-t border-white/[0.03]">
                <div className="h-2.5 w-32 rounded bg-zinc-800/60 animate-pulse" />
                <div className="h-2.5 w-12 rounded bg-zinc-900 animate-pulse" />
              </div>
            </div>
          ))}
        </div>

        {/* 4. Large Analytics & Chart Visualizer Skeleton */}
        <div className="rounded-2xl border border-white/[0.06] bg-[#0f0f13] p-5 space-y-4 shadow-sm">
          {/* Chart Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-zinc-800 animate-pulse border border-white/[0.04]" />
              <div className="space-y-1.5">
                <div className="h-3.5 w-48 rounded bg-zinc-800 animate-pulse" />
                <div className="h-2.5 w-72 rounded bg-zinc-900 animate-pulse" />
              </div>
            </div>
            <div className="flex items-center gap-1.5 rounded-xl border border-white/[0.04] bg-zinc-950/60 p-1">
              <div className="h-6 w-24 rounded-lg bg-zinc-800 animate-pulse" />
              <div className="h-6 w-24 rounded-lg bg-zinc-900/60 animate-pulse" />
              <div className="h-6 w-24 rounded-lg bg-zinc-900/60 animate-pulse" />
            </div>
          </div>

          {/* Chart Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pt-2">
            {/* Donut Chart Skeleton */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center min-h-[250px] relative">
              <div className="h-44 w-44 rounded-full border-[18px] border-zinc-800/60 animate-pulse flex items-center justify-center">
                <div className="h-14 w-14 rounded-full bg-zinc-900 animate-pulse" />
              </div>
              <div className="flex gap-1 mt-4">
                <div className="h-5 w-16 rounded bg-zinc-800 animate-pulse" />
                <div className="h-5 w-14 rounded bg-zinc-900 animate-pulse" />
                <div className="h-5 w-14 rounded bg-zinc-900 animate-pulse" />
              </div>
            </div>

            {/* Department Breakdown Grid Skeleton */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[1, 2, 3, 4, 5, 6].map((k) => (
                <div
                  key={k}
                  className="rounded-xl border border-white/[0.04] bg-zinc-900/40 p-2.5 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-zinc-700 animate-pulse" />
                      <div className="h-3 w-24 rounded bg-zinc-800 animate-pulse" />
                    </div>
                    <div className="h-3 w-16 rounded bg-zinc-800 font-mono animate-pulse" />
                  </div>
                  <div className="flex justify-between">
                    <div className="h-2 w-20 rounded bg-zinc-900 animate-pulse" />
                    <div className="h-2 w-8 rounded bg-zinc-900 animate-pulse" />
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-zinc-950 overflow-hidden">
                    <div className="h-full rounded-full bg-zinc-800 animate-pulse" style={{ width: `${35 + k * 10}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 5. Radars Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Perishable Radar Skeleton */}
          <div className="rounded-2xl border border-white/[0.06] bg-[#111114] p-5 space-y-3.5 shadow-sm">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-zinc-800 animate-pulse" />
                <div className="space-y-1">
                  <div className="h-3 w-32 rounded bg-zinc-800 animate-pulse" />
                  <div className="h-2.5 w-44 rounded bg-zinc-900 animate-pulse" />
                </div>
              </div>
              <div className="h-3 w-20 rounded bg-zinc-850 animate-pulse" />
            </div>

            <div className="space-y-2">
              {[1, 2, 3, 4].map((j) => (
                <div
                  key={j}
                  className="flex items-center justify-between rounded-xl border border-white/[0.03] bg-zinc-900/30 p-3"
                >
                  <div className="space-y-1.5 flex-1 pr-3">
                    <div className="h-3 w-3/4 rounded bg-zinc-800 animate-pulse" />
                    <div className="h-2 w-1/2 rounded bg-zinc-900 animate-pulse" />
                  </div>
                  <div className="h-5 w-16 rounded bg-zinc-800 animate-pulse shrink-0" />
                </div>
              ))}
            </div>
          </div>

          {/* Stock Buffer Radar Skeleton */}
          <div className="rounded-2xl border border-white/[0.06] bg-[#111114] p-5 space-y-3.5 shadow-sm">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-zinc-800 animate-pulse" />
                <div className="space-y-1">
                  <div className="h-3 w-32 rounded bg-zinc-800 animate-pulse" />
                  <div className="h-2.5 w-44 rounded bg-zinc-900 animate-pulse" />
                </div>
              </div>
              <div className="h-3 w-20 rounded bg-zinc-850 animate-pulse" />
            </div>

            <div className="space-y-2">
              {[1, 2, 3, 4].map((j) => (
                <div
                  key={j}
                  className="flex items-center justify-between rounded-xl border border-white/[0.03] bg-zinc-900/30 p-3"
                >
                  <div className="space-y-1.5 flex-1 pr-3">
                    <div className="h-3 w-3/4 rounded bg-zinc-800 animate-pulse" />
                    <div className="h-2 w-1/2 rounded bg-zinc-900 animate-pulse" />
                  </div>
                  <div className="h-5 w-20 rounded-full bg-zinc-800 animate-pulse shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 6. Activity Ledger Skeleton */}
        <div className="rounded-2xl border border-white/[0.06] bg-[#0f0f13] p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-zinc-800 animate-pulse" />
              <div className="space-y-1">
                <div className="h-3 w-36 rounded bg-zinc-800 animate-pulse" />
                <div className="h-2.5 w-52 rounded bg-zinc-900 animate-pulse" />
              </div>
            </div>
            <div className="h-3 w-16 rounded bg-zinc-800 animate-pulse" />
          </div>

          <div className="space-y-2">
            {[1, 2, 3].map((m) => (
              <div
                key={m}
                className="flex items-center justify-between rounded-xl border border-white/[0.03] bg-zinc-900/30 p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-zinc-800 animate-pulse" />
                  <div className="space-y-1.5">
                    <div className="h-3 w-48 rounded bg-zinc-800 animate-pulse" />
                    <div className="h-2 w-32 rounded bg-zinc-900 animate-pulse" />
                  </div>
                </div>
                <div className="space-y-1 text-right">
                  <div className="h-3 w-12 rounded bg-zinc-800 ml-auto animate-pulse" />
                  <div className="h-2 w-16 rounded bg-zinc-900 ml-auto animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
