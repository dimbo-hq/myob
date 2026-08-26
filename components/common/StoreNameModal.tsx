'use client';

import React, { useState, useEffect } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { Store, X, Check, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface StoreNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  isInitialPrompt?: boolean;
}

export const StoreNameModal: React.FC<StoreNameModalProps> = ({
  isOpen,
  onClose,
  isInitialPrompt = false
}) => {
  const { storeName, updateStoreName } = useInventory();
  const [nameInput, setNameInput] = useState(storeName || '');

  useEffect(() => {
    setNameInput(storeName || '');
  }, [storeName]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    updateStoreName(nameInput.trim());
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => !isInitialPrompt && onClose()}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 10 }}
          className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d0d10] p-6 shadow-2xl z-10 space-y-4"
        >
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-zinc-900 text-zinc-200">
                <Store className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white tracking-tight">
                  {isInitialPrompt ? 'Name Your Store' : 'Edit Store Name'}
                </h3>
                <p className="text-[11px] text-zinc-500">
                  Appears in your header, customer receipts, and purchase orders
                </p>
              </div>
            </div>

            {!isInitialPrompt && (
              <button
                onClick={onClose}
                className="rounded-lg p-1 text-zinc-500 hover:bg-zinc-800 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs pt-1">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-zinc-300">
                Store or Branch Name *
              </label>
              <input
                type="text"
                required
                autoFocus
                placeholder="e.g. Greenfields Supermarket, Metro Fresh Mart"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full rounded-xl border border-white/[0.08] bg-zinc-900/80 px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none shadow-inner"
              />
            </div>

            {/* Quick Suggestions */}
            <div>
              <label className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1.5">
                Suggestions:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {['Downtown Supermarket', 'Fresh Harvest Mart', 'Metro Grocery & Deli', 'Bimbok General Store'].map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => setNameInput(sug)}
                    className="rounded border border-white/[0.06] bg-zinc-900/50 px-2 py-0.5 text-[10px] text-zinc-400 hover:border-white/[0.15] hover:text-white"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-white/[0.06]">
              <button
                type="submit"
                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-zinc-100 py-2 text-xs font-semibold text-zinc-900 hover:bg-white active:scale-95 transition-all shadow-sm"
              >
                <Check className="h-3.5 w-3.5" />
                <span>{isInitialPrompt ? 'Save & Launch Store' : 'Update Store Name'}</span>
              </button>
              {!isInitialPrompt && (
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-white/[0.08] bg-zinc-900 px-4 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
