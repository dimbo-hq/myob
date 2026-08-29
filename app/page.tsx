'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { InventoryProvider, useInventory } from '@/context/InventoryContext';
import { Show } from '@clerk/nextjs';
import { LandingPage } from '@/components/landing/LandingPage';
import { Navbar } from '@/components/layout/Navbar';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { InventoryView } from '@/components/inventory/InventoryView';
import { ExpiryView } from '@/components/expiry/ExpiryView';
import { ReorderView } from '@/components/reorder/ReorderView';
import { CustomersView } from '@/components/customers/CustomersView';
import { AuditView } from '@/components/audit/AuditView';
import { ExpressPOSModal } from '@/components/pos/ExpressPOSModal';
import { ReturnRefundModal } from '@/components/pos/ReturnRefundModal';
import { ZReportModal } from '@/components/dashboard/ZReportModal';
import { TimeSimulatorModal } from '@/components/common/TimeSimulatorModal';
import { AddEditItemModal } from '@/components/inventory/AddEditItemModal';
import { ImportModal } from '@/components/inventory/ImportModal';
import { StoreNameModal } from '@/components/common/StoreNameModal';
import { CommandPaletteModal } from '@/components/common/CommandPaletteModal';
import { KeyboardShortcutsModal } from '@/components/common/KeyboardShortcutsModal';
import { EmptyStoreOnboarding } from '@/components/common/EmptyStoreOnboarding';
import { ToastContainer } from '@/components/common/ToastContainer';
import { DashboardSkeleton } from '@/components/common/DashboardSkeleton';
import { 
  InventorySkeleton, 
  ExpirySkeleton, 
  ReorderSkeleton, 
  AuditSkeleton 
} from '@/components/common/TabSkeletons';
import { 
  BarChart3, 
  Package, 
  Clock, 
  Truck, 
  Users, 
  Activity, 
  Boxes 
} from 'lucide-react';
import { motion } from 'motion/react';

type TabKey = 'dashboard' | 'inventory' | 'expiry' | 'reorder' | 'customers' | 'audit';

function AuthenticatedStoreApp() {
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [pendingTab, setPendingTab] = useState<TabKey>('dashboard');
  const [isPending, startTransition] = useTransition();

  const [isPOSOpen, setIsPOSOpen] = useState(false);
  const [isReturnsOpen, setIsReturnsOpen] = useState(false);
  const [isZReportOpen, setIsZReportOpen] = useState(false);
  const [isTimeSimOpen, setIsTimeSimOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isStoreNameModalOpen, setIsStoreNameModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [hasPromptedStoreName, setHasPromptedStoreName] = useState(false);

  const { items, customers, summary, storeName, isLoadingData } = useInventory();

  const handleTabChange = (tab: TabKey) => {
    if (tab === activeTab) return;
    setPendingTab(tab);
    startTransition(() => {
      setActiveTab(tab);
    });
  };

  // Global Keyboard Shortcuts Listener (? , ⌘K, ⌘P, ⌘Z, ⌘N, ⌘R, 1-6)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || (activeEl as HTMLElement).isContentEditable);

      // Meta / Ctrl combinations
      if (e.metaKey || e.ctrlKey) {
        if (e.key === 'k' || e.key === 'K') {
          e.preventDefault();
          setIsCommandPaletteOpen((prev) => !prev);
          return;
        }
        if (e.key === 'p' || e.key === 'P') {
          e.preventDefault();
          setIsPOSOpen(true);
          return;
        }
        if (e.key === 'z' || e.key === 'Z') {
          e.preventDefault();
          setIsZReportOpen(true);
          return;
        }
        if (e.key === 'n' || e.key === 'N') {
          e.preventDefault();
          setIsAddProductOpen(true);
          return;
        }
        if (e.key === 'r' || e.key === 'R') {
          e.preventDefault();
          setIsReturnsOpen(true);
          return;
        }
      }

      // Single-key shortcuts (only when not typing in form inputs)
      if (!isInput) {
        if (e.key === '?' || (e.shiftKey && e.key === '/')) {
          e.preventDefault();
          setIsShortcutsOpen((prev) => !prev);
          return;
        }
        if (e.key === '1') handleTabChange('dashboard');
        if (e.key === '2') handleTabChange('inventory');
        if (e.key === '3') handleTabChange('expiry');
        if (e.key === '4') handleTabChange('reorder');
        if (e.key === '5') handleTabChange('customers');
        if (e.key === '6') handleTabChange('audit');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab]);

  // Prompt for store name on first login if not set yet
  useEffect(() => {
    if (!isLoadingData && !storeName && !hasPromptedStoreName) {
      setIsStoreNameModalOpen(true);
      setHasPromptedStoreName(true);
    }
  }, [isLoadingData, storeName, hasPromptedStoreName]);

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
      badge: items.length > 0 ? `${items.length}` : null
    },
    {
      id: 'expiry' as TabKey,
      label: 'Expiry & Markdowns',
      icon: <Clock className="h-3.5 w-3.5" />,
      badge: summary.expiringSoonCount + summary.expiredCount > 0 
        ? `${summary.expiringSoonCount + summary.expiredCount}` 
        : null,
      isWarning: summary.expiringSoonCount + summary.expiredCount > 0
    },
    {
      id: 'reorder' as TabKey,
      label: 'Replenishment & POs',
      icon: <Truck className="h-3.5 w-3.5" />,
      badge: summary.lowStockCount + summary.outOfStockCount > 0 
        ? `${summary.lowStockCount + summary.outOfStockCount}` 
        : null
    },
    {
      id: 'customers' as TabKey,
      label: 'Customers',
      icon: <Users className="h-3.5 w-3.5" />,
      badge: customers.length > 0 ? `${customers.length}` : null
    },
    {
      id: 'audit' as TabKey,
      label: 'Activity Ledger',
      icon: <Activity className="h-3.5 w-3.5" />,
      badge: null
    }
  ];

  if (isLoadingData) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans selection:bg-zinc-700 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        onOpenPOS={() => setIsPOSOpen(true)}
        onOpenTimeSimulator={() => setIsTimeSimOpen(true)}
        onOpenAddProduct={() => setIsAddProductOpen(true)}
        onOpenImport={() => setIsImportOpen(true)}
        onOpenStoreNameModal={() => setIsStoreNameModalOpen(true)}
        onNavigateExpiry={() => handleTabChange('expiry')}
        onNavigateCustomers={() => handleTabChange('customers')}
        onOpenZReport={() => setIsZReportOpen(true)}
        onOpenReturns={() => setIsReturnsOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
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
            <div className="flex items-center gap-1.5 border-b border-white/[0.06] pb-3 overflow-x-auto scrollbar-none">
              {navigationTabs.map((tab) => {
                const isActive = (isPending ? pendingTab : activeTab) === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`relative flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-heading font-semibold transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'text-white'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTabPill"
                        className="absolute inset-0 rounded-xl bg-zinc-800/90 border border-white/[0.09] shadow-sm"
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}

                    <span className="relative z-10 flex items-center gap-1.5">
                      <span className={isActive ? 'text-white' : 'text-zinc-500'}>
                        {tab.icon}
                      </span>
                      <span className="tracking-tight">{tab.label}</span>
                      {tab.badge && (
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded-md font-mono font-bold ${
                            tab.isWarning
                              ? 'bg-amber-950/80 text-amber-300 border border-amber-800/50'
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

            {/* Tab Views with Instant Transition & Smooth Tab Skeletons */}
            {isPending ? (
              pendingTab === 'inventory' ? <InventorySkeleton /> :
              pendingTab === 'expiry' ? <ExpirySkeleton /> :
              pendingTab === 'reorder' ? <ReorderSkeleton /> :
              pendingTab === 'audit' ? <AuditSkeleton /> :
              <DashboardSkeleton />
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.12 }}
              >
                {activeTab === 'dashboard' && (
                  <DashboardView
                    onNavigate={(tab) => handleTabChange(tab)}
                    onOpenPOS={() => setIsPOSOpen(true)}
                    onOpenTimeSimulator={() => setIsTimeSimOpen(true)}
                    onOpenAddProduct={() => setIsAddProductOpen(true)}
                    onOpenZReport={() => setIsZReportOpen(true)}
                    onOpenReturns={() => setIsReturnsOpen(true)}
                  />
                )}

                {activeTab === 'inventory' && <InventoryView />}

                {activeTab === 'expiry' && <ExpiryView />}

                {activeTab === 'reorder' && <ReorderView />}

                {activeTab === 'customers' && <CustomersView onOpenPOSForCustomer={() => setIsPOSOpen(true)} />}

                {activeTab === 'audit' && <AuditView />}
              </motion.div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.05] py-4 text-center text-xs text-zinc-600">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="lowercase font-semibold text-zinc-400">
            myob <span className="text-zinc-500 font-normal font-sans">• Mind Your Own Business (Retail Intelligence OS)</span>
          </span>
          <span className="font-mono text-[11px] text-zinc-600">
            {storeName ? `${storeName} • ` : ''}Multi-Tenant Isolated MongoDB Database
          </span>
        </div>
      </footer>

      {/* Global Modals */}
      <ExpressPOSModal
        isOpen={isPOSOpen}
        onClose={() => setIsPOSOpen(false)}
      />

      <ReturnRefundModal
        isOpen={isReturnsOpen}
        onClose={() => setIsReturnsOpen(false)}
      />

      <ZReportModal
        isOpen={isZReportOpen}
        onClose={() => setIsZReportOpen(false)}
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

      <StoreNameModal
        isOpen={isStoreNameModalOpen}
        onClose={() => setIsStoreNameModalOpen(false)}
      />

      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onOpenPOS={() => setIsPOSOpen(true)}
        onOpenReturns={() => setIsReturnsOpen(true)}
        onOpenZReport={() => setIsZReportOpen(true)}
        onOpenAddProduct={() => setIsAddProductOpen(true)}
        onOpenImport={() => setIsImportOpen(true)}
        onOpenTimeSimulator={() => setIsTimeSimOpen(true)}
        onNavigate={(tab) => handleTabChange(tab)}
      />

      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
        onOpenPOS={() => setIsPOSOpen(true)}
        onOpenZReport={() => setIsZReportOpen(true)}
        onOpenAddProduct={() => setIsAddProductOpen(true)}
        onOpenReturns={() => setIsReturnsOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onNavigate={(tab) => handleTabChange(tab)}
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
