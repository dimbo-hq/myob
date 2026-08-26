'use client';

import React, { useState } from 'react';
import { InventoryProvider, useInventory } from '@/context/InventoryContext';
import { Show, useAuth } from '@clerk/nextjs';
import { LandingPage } from '@/components/landing/LandingPage';
import { Navbar } from '@/components/layout/Navbar';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { InventoryView } from '@/components/inventory/InventoryView';
import { ExpiryView } from '@/components/expiry/ExpiryView';
import { ReorderView } from '@/components/reorder/ReorderView';
import { AuditView } from '@/components/audit/AuditView';
import { ExpressPOSModal } from '@/components/pos/ExpressPOSModal';
import { BarcodeScannerModal } from '@/components/pos/BarcodeScannerModal';
import { TimeSimulatorModal } from '@/components/common/TimeSimulatorModal';
import { AddEditItemModal } from '@/components/inventory/AddEditItemModal';
import { ImportModal } from '@/components/inventory/ImportModal';
import { EmptyStoreOnboarding } from '@/components/common/EmptyStoreOnboarding';
import { ToastContainer } from '@/components/common/ToastContainer';
import { 
  BarChart3, 
  Package, 
  Clock, 
  Truck, 
  Activity,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type TabKey = 'dashboard' | 'inventory' | 'expiry' | 'reorder' | 'audit';

function AuthenticatedStoreApp() {
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [isPOSOpen, setIsPOSOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isTimeSimOpen, setIsTimeSimOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  const { items, summary, isLoadingData } = useInventory();

  const navigationTabs = [
    {
      id: 'dashboard' as TabKey,
      label: 'Overview',
      icon: <BarChart3 className="h-3.5 w-3.5" />,
      badge: null
    },
    {
      id: 'inventory' as TabKey,
      label: 'Inventory Catalogue',
      icon: <Package className="h-3.5 w-3.5" />,
      badge: summary.totalItemsCount > 0 ? `${summary.totalItemsCount}` : null
    },
    {
      id: 'expiry' as TabKey,
      label: 'Expiry & Markdowns',
      icon: <Clock className="h-3.5 w-3.5" />,
      badge: summary.expiringSoonCount + summary.expiredCount > 0
        ? `${summary.expiringSoonCount + summary.expiredCount}`
        : null,
      isWarning: true
    },
    {
      id: 'reorder' as TabKey,
      label: 'Replenishment & POs',
      icon: <Truck className="h-3.5 w-3.5" />,
      badge: summary.outOfStockCount + summary.lowStockCount > 0
        ? `${summary.outOfStockCount + summary.lowStockCount}`
        : null
    },
    {
      id: 'audit' as TabKey,
      label: 'Activity Ledger',
      icon: <Activity className="h-3.5 w-3.5" />,
      badge: null
    }
  ];

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center text-zinc-500 gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
        <span className="text-xs font-medium">Connecting to isolated MongoDB store...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans selection:bg-zinc-700 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        onOpenPOS={() => setIsPOSOpen(true)}
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenTimeSimulator={() => setIsTimeSimOpen(true)}
        onOpenAddProduct={() => setIsAddProductOpen(true)}
        onOpenImport={() => setIsImportOpen(true)}
        onNavigateExpiry={() => setActiveTab('expiry')}
      />

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-5 space-y-5">
        {items.length === 0 ? (
          /* Empty Store Onboarding */
          <EmptyStoreOnboarding
            onOpenImport={() => setIsImportOpen(true)}
            onOpenAddProduct={() => setIsAddProductOpen(true)}
          />
        ) : (
          <>
            {/* Linear-style Segmented Control Bar */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none border-b border-white/[0.06]">
              {navigationTabs.map((tab) => {
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap ${
                      isActive
                        ? 'text-white'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTabPill"
                        className="absolute inset-0 rounded-lg bg-zinc-800 border border-white/[0.08] shadow-sm"
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}

                    <span className="relative z-10 flex items-center gap-1.5">
                      <span className={isActive ? 'text-white' : 'text-zinc-500'}>
                        {tab.icon}
                      </span>
                      <span>{tab.label}</span>
                      {tab.badge && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                            tab.isWarning
                              ? 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                              : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                          }`}
                        >
                          {tab.badge}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Tab Views */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
              >
                {activeTab === 'dashboard' && (
                  <DashboardView
                    onNavigate={(tab) => setActiveTab(tab)}
                    onOpenPOS={() => setIsPOSOpen(true)}
                    onOpenScanner={() => setIsScannerOpen(true)}
                    onOpenTimeSimulator={() => setIsTimeSimOpen(true)}
                    onOpenAddProduct={() => setIsAddProductOpen(true)}
                  />
                )}

                {activeTab === 'inventory' && <InventoryView />}

                {activeTab === 'expiry' && <ExpiryView />}

                {activeTab === 'reorder' && <ReorderView />}

                {activeTab === 'audit' && <AuditView />}
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.05] py-4 text-center text-xs text-zinc-600">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Aura Supermarket & Retail OS</span>
          <span className="font-mono text-[11px] text-zinc-600">
            Multi-Tenant Isolated MongoDB Database
          </span>
        </div>
      </footer>

      {/* Global Modals */}
      <ExpressPOSModal
        isOpen={isPOSOpen}
        onClose={() => setIsPOSOpen(false)}
      />

      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onSelectProduct={(scanned) => {
          setIsScannerOpen(false);
          setActiveTab('inventory');
        }}
      />

      <TimeSimulatorModal
        isOpen={isTimeSimOpen}
        onClose={() => setIsTimeSimOpen(false)}
      />

      <AddEditItemModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
      />

      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
      />

      <ToastContainer />
    </div>
  );
}

export default function Home() {
  return (
    <InventoryProvider>
      <Show when="signed-out">
        <LandingPage />
      </Show>

      <Show when="signed-in">
        <AuthenticatedStoreApp />
      </Show>
    </InventoryProvider>
  );
}
