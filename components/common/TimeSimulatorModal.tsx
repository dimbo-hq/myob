'use client';

import React from 'react';
import { useInventory } from '@/context/InventoryContext';
import { getRelativeDate } from '@/lib/dateUtils';
import { Clock, FastForward, RotateCcw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TimeSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TimeSimulatorModal: React.FC<TimeSimulatorModalProps> = ({ isOpen, onClose }) => {
  const {
    simulatedDateOffset,
    advanceSimulatedDays,
    resetSimulatedDate,
    summary
  } = useInventory();

  if (!isOpen) return null;

  const simulatedDate = getRelativeDate(simulatedDateOffset);

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
          className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d0d10] p-5 shadow-2xl z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.08] bg-zinc-900 text-zinc-300">
                <FastForward className="h-3.5 w-3.5" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-white tracking-tight">
                  Time-Travel Simulation
                </h3>
                <p className="text-[11px] text-zinc-500">
                  Fast-forward dates to test expiry & auto-markdown triggers
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

          {/* Current State */}
          <div className="my-4 rounded-xl border border-white/[0.04] bg-zinc-900/40 p-3.5 space-y-3">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-zinc-500" />
                Simulated Calendar:
              </span>
              <span className="font-mono text-zinc-200 font-medium">
                {simulatedDate} ({simulatedDateOffset === 0 ? 'Today' : `+${simulatedDateOffset}d`})
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 border-t border-white/[0.03] pt-2.5 text-center text-xs">
              <div>
                <div className="text-[10px] text-zinc-500">Expiring Soon</div>
                <div className="font-mono font-medium text-amber-400 mt-0.5">{summary.expiringSoonCount}</div>
              </div>
              <div>
                <div className="text-[10px] text-zinc-500">Expired</div>
                <div className="font-mono font-medium text-rose-400 mt-0.5">{summary.expiredCount}</div>
              </div>
              <div>
                <div className="text-[10px] text-zinc-500">At-Risk Value</div>
                <div className="font-mono font-medium text-zinc-200 mt-0.5">${summary.atRiskLossValue.toFixed(2)}</div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="space-y-2">
            <label className="text-[11px] text-zinc-500 uppercase tracking-wider block">
              Fast-Forward Store Date:
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { days: 1, label: '+1 Day' },
                { days: 3, label: '+3 Days' },
                { days: 7, label: '+7 Days' },
                { days: 14, label: '+14 Days' }
              ].map(({ days, label }) => (
                <button
                  key={days}
                  onClick={() => advanceSimulatedDays(days)}
                  className="rounded-lg border border-white/[0.06] bg-zinc-900/80 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all active:scale-95"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-5 flex items-center justify-between border-t border-white/[0.06] pt-3">
            <button
              onClick={resetSimulatedDate}
              disabled={simulatedDateOffset === 0}
              className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-300 disabled:opacity-30 transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset to Today</span>
            </button>

            <button
              onClick={onClose}
              className="rounded-lg bg-zinc-100 px-3.5 py-1.5 text-xs font-semibold text-zinc-900 hover:bg-white active:scale-95 transition-all shadow-sm"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
