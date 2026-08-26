'use client';

import React from 'react';
import { useInventory } from '@/context/InventoryContext';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useInventory();

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-400" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-rose-400" />;
      default:
        return <Info className="h-4 w-4 text-zinc-400" />;
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="pointer-events-auto relative flex items-start gap-2.5 rounded-xl border border-white/[0.08] bg-[#121215] p-3.5 shadow-xl text-xs backdrop-blur-xl"
          >
            <div className="mt-0.5 flex-shrink-0">{getIcon(toast.type)}</div>
            <div className="flex-1 pr-1">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-white tracking-tight">{toast.title}</h4>
                <span className="text-[10px] text-zinc-500 font-mono">{toast.timestamp}</span>
              </div>
              <p className="mt-0.5 text-[11px] text-zinc-400 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-zinc-600 hover:text-zinc-300 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
