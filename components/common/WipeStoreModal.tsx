'use client';

import React, { useState } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { 
  AlertTriangle, 
  Trash2, 
  X, 
  Loader2, 
  ShieldAlert, 
  Package, 
  Users, 
  Receipt, 
  Coins, 
  Building2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WipeStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WipeStoreModal: React.FC<WipeStoreModalProps> = ({
  isOpen,
  onClose
}) => {
  const { wipeAllStoreData, storeName } = useInventory();
  const [confirmText, setConfirmText] = useState('');
  const [isWiping, setIsWiping] = useState(false);

  const isConfirmed = confirmText.trim().toUpperCase() === 'DELETE';

  const handleWipe = async () => {
    if (!isConfirmed || isWiping) return;

    setIsWiping(true);
    try {
      await wipeAllStoreData();
      setConfirmText('');
      onClose();
    } catch (err) {
      console.error('Wipe failed:', err);
    } finally {
      setIsWiping(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => !isWiping && onClose()}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-rose-500/30 bg-[#0d0d10] p-6 shadow-2xl z-10 space-y-5"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-rose-500/20 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30">
                <ShieldAlert className="h-5 w-5 text-rose-500" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Permanent Store Wipe</span>
                  <span className="rounded bg-rose-950/80 px-2 py-0.5 text-[10px] font-mono font-bold text-rose-300 border border-rose-800/60 uppercase">
                    Danger Zone
                  </span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {storeName ? `Store: "${storeName}"` : 'Active Supermarket Workspace'}
                </p>
              </div>
            </div>

            <button
              onClick={() => !isWiping && onClose()}
              disabled={isWiping}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors disabled:opacity-40"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Warning Banner */}
          <div className="rounded-xl border border-rose-500/20 bg-rose-950/20 p-3.5 flex items-start gap-3 text-xs text-rose-200">
            <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-semibold text-rose-300">This action is irreversible and permanent.</div>
              <div className="text-[11px] text-rose-400/90 leading-relaxed">
                All cloud records stored in MongoDB Atlas and local workspace backups for this store account will be immediately deleted.
              </div>
            </div>
          </div>

          {/* What will be deleted checklist */}
          <div className="rounded-xl border border-white/[0.06] bg-zinc-950/60 p-3.5 space-y-2 text-xs">
            <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
              Data to be permanently deleted:
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-300">
              <div className="flex items-center gap-2">
                <Package className="h-3.5 w-3.5 text-rose-400/80" />
                <span>All Products & Batches</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-3.5 w-3.5 text-rose-400/80" />
                <span>Customer Directory</span>
              </div>
              <div className="flex items-center gap-2">
                <Receipt className="h-3.5 w-3.5 text-rose-400/80" />
                <span>Sales Orders & Receipts</span>
              </div>
              <div className="flex items-center gap-2">
                <Coins className="h-3.5 w-3.5 text-rose-400/80" />
                <span>Shift Z-Reports & Cash</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5 text-rose-400/80" />
                <span>Vendors & Purchase Orders</span>
              </div>
              <div className="flex items-center gap-2">
                <Trash2 className="h-3.5 w-3.5 text-rose-400/80" />
                <span>Audit & Spoilage Logs</span>
              </div>
            </div>
          </div>

          {/* Verification input */}
          <div className="space-y-2">
            <label className="block text-xs text-zinc-300">
              Type <strong className="text-rose-400 font-mono font-bold">DELETE</strong> below to confirm:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type DELETE to enable wipe"
              disabled={isWiping}
              className="w-full rounded-xl border border-rose-500/30 bg-zinc-900/90 px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500/50 font-mono"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={onClose}
              disabled={isWiping}
              className="rounded-xl border border-white/[0.08] bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all cursor-pointer disabled:opacity-40"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleWipe}
              disabled={!isConfirmed || isWiping}
              className="flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-lg shadow-rose-900/30 cursor-pointer"
            >
              {isWiping ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Deleting Cloud Data...</span>
                </>
              ) : (
                <>
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Permanently Wipe Store Data</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
