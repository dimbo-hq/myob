'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import {
  InventoryItem,
  Supplier,
  PurchaseOrder,
  StockMovement,
  WastageLog,
  Customer,
  SalesOrder,
  SalesOrderItem,
  RefundRecord,
  RefundItem,
  ZReportRecord,
  POSCartItem,
  ToastMessage,
  BatchInfo,
  MovementType,
  POStatus,
  StockStatus
} from '@/types/inventory';
import {
  INITIAL_INVENTORY,
  INITIAL_SUPPLIERS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_STOCK_MOVEMENTS,
  INITIAL_WASTAGE_LOGS
} from '@/data/initialData';
import { getRelativeDate } from '@/lib/dateUtils';
import { 
  saveOfflineStoreData, 
  getOfflineStoreData, 
  clearOfflineStoreData 
} from '@/lib/offlineStorage';

interface InventoryContextType {
  items: InventoryItem[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  stockMovements: StockMovement[];
  wastageLogs: WastageLog[];
  customers: Customer[];
  salesOrders: SalesOrder[];
  refundRecords: RefundRecord[];
  zReports: ZReportRecord[];
  storeName: string;
  simulatedDateOffset: number;
  toasts: ToastMessage[];
  isLoadingData: boolean;
  isSyncing: boolean;
  
  // Store Settings
  updateStoreName: (name: string) => void;
  
  // Customer Operations
  lookupCustomerByPhone: (phone: string) => Customer | undefined;
  addOrUpdateCustomer: (customerData: { phone: string; name: string; email?: string; address?: string; gstin?: string; notes?: string }) => Customer;
  deleteCustomer: (phoneOrId: string) => void;
  
  // Expiry & Status Helpers
  getDaysUntilExpiry: (expiryDateStr: string) => number;
  getEffectiveBatchStatus: (expiryDateStr: string) => 'safe' | 'warning' | 'critical' | 'expired';
  getItemStatus: (item: InventoryItem) => StockStatus;
  
  // Analytics & Summary
  summary: {
    totalItemsCount: number;
    totalStockUnits: number;
    totalCostValuation: number;
    totalRetailValuation: number;
    potentialProfit: number;
    averageMarginPercent: number;
    outOfStockCount: number;
    lowStockCount: number;
    expiringSoonCount: number;
    expiredCount: number;
    atRiskLossValue: number;
    pendingOrdersCount: number;
    totalCustomersCount: number;
    totalSalesOrdersCount: number;
    totalLifetimeRevenue: number;
    totalRefundsCount: number;
  };
  
  // Item Operations
  addItem: (item: Omit<InventoryItem, 'id'>) => string;
  updateItem: (id: string, updates: Partial<InventoryItem>) => void;
  deleteItem: (id: string) => void;
  clearAllInventory: () => void;
  adjustStock: (itemId: string, delta: number, reason: string, type?: MovementType, batchNumber?: string) => void;
  importBulkItems: (items: InventoryItem[], replaceExisting?: boolean) => Promise<void>;
  
  // Expiry Operations
  applyBatchMarkdown: (itemId: string, batchId: string, markdownPercent: number) => void;
  applySmartExpiryMarkdowns: () => number;
  writeOffBatch: (
    itemId: string,
    batchId: string,
    quantity: number,
    reason: WastageLog['reason'],
    disposal: WastageLog['disposalMethod'],
    notes?: string
  ) => void;
  
  // Purchase Order Operations
  createPurchaseOrder: (poData: Omit<PurchaseOrder, 'id' | 'poNumber'>) => string;
  updatePOStatus: (poId: string, status: POStatus) => void;
  receivePurchaseOrder: (poId: string, receivedMap: Record<string, number>) => void;
  autoGenerateReorderPOs: () => number;
  
  // POS & Sales
  processPOSSale: (
    cartItems: POSCartItem[], 
    paymentMethod: string,
    customerInfo?: { phone: string; name?: string; email?: string; address?: string; gstin?: string } | null,
    paymentDetails?: {
      paymentBreakdown?: { cash?: number; upi?: number; card?: number };
      cashChange?: { tendered?: number; changeDue?: number };
    }
  ) => { success: boolean; orderId: string; customer?: Customer | null };
  
  // Returns & Refunds
  processOrderReturn: (
    orderNumber: string,
    returnedItems: { itemId: string; quantity: number; returnToInventory: boolean; reason: string }[],
    refundMethod: string,
    notes?: string
  ) => { success: boolean; refundRecord: RefundRecord | null };
  
  // End-of-Day Z-Report
  generateZReport: (
    openingCash: number,
    countedCash: number,
    notes?: string
  ) => ZReportRecord;

  // Simulator & Utilities
  advanceSimulatedDays: (days: number) => void;
  resetSimulatedDate: () => void;
  wipeAllStoreData: () => Promise<void>;
  resetToDemoData: () => void;
  seedSampleData: () => Promise<void>;
  
  // Notifications
  addToast: (toast: Omit<ToastMessage, 'id' | 'timestamp'>) => void;
  dismissToast: (id: string) => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userId, isSignedIn, isLoaded: isAuthLoaded } = useAuth();
  const { user } = useUser();

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [wastageLogs, setWastageLogs] = useState<WastageLog[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [refundRecords, setRefundRecords] = useState<RefundRecord[]>([]);
  const [zReports, setZReports] = useState<ZReportRecord[]>([]);
  const [storeName, setStoreName] = useState<string>('');
  const [simulatedDateOffset, setSimulatedDateOffset] = useState<number>(0);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoadCompleteRef = useRef<boolean>(false);
  const hasUserMutatedRef = useRef<boolean>(false);

  // Helper to save store data in IndexedDB (handles 50,000+ items without 5MB quota errors)
  const saveLocalBackup = useCallback(async (userIdKey: string, storeData: any) => {
    try {
      if (typeof window !== 'undefined' && userIdKey) {
        await saveOfflineStoreData(userIdKey, storeData);
      }
    } catch (e) {
      console.warn('IndexedDB backup save warning:', e);
    }
  }, []);

  // 1. Fetch User Data with IndexedDB Offline Fallback & Zero Data Loss
  useEffect(() => {
    if (!isAuthLoaded) return;

    // Clear any pending sync timeout from previous session
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
    isInitialLoadCompleteRef.current = false;
    hasUserMutatedRef.current = false;

    if (!isSignedIn || !userId) {
      setItems([]);
      setSuppliers([]);
      setPurchaseOrders([]);
      setStockMovements([]);
      setWastageLogs([]);
      setStoreName('');
      setIsLoadingData(false);
      return;
    }

    const fetchDatabaseStore = async () => {
      setIsLoadingData(true);

      // Fast check: retrieve IndexedDB offline cache first so UI never falls blank
      let cachedData: any = null;
      try {
        cachedData = await getOfflineStoreData(userId);
        if (cachedData && cachedData.items && cachedData.items.length > 0) {
          setItems(cachedData.items);
          setSuppliers(cachedData.suppliers || []);
          setPurchaseOrders(cachedData.purchaseOrders || []);
          setStockMovements(cachedData.stockMovements || []);
          setWastageLogs(cachedData.wastageLogs || []);
          setCustomers(cachedData.customers || []);
          setSalesOrders(cachedData.salesOrders || []);
          setRefundRecords(cachedData.refundRecords || []);
          setZReports(cachedData.zReports || []);
          if (cachedData.settings?.storeName) {
            setStoreName(cachedData.settings.storeName);
          }
        }
      } catch (e) {
        console.warn('IndexedDB cache read warning:', e);
      }

      try {
        const res = await fetch('/api/store-data');
        if (res.ok) {
          const data = await res.json();
          const hasDbItems = data.items && data.items.length > 0;
          const hasDbStoreName = data.settings?.storeName && data.settings.storeName.trim() !== '';

          if (hasDbItems || hasDbStoreName || (data.customers && data.customers.length > 0) || (data.salesOrders && data.salesOrders.length > 0)) {
            setItems(data.items || []);
            setSuppliers(data.suppliers || []);
            setPurchaseOrders(data.purchaseOrders || []);
            setStockMovements(data.stockMovements || []);
            setWastageLogs(data.wastageLogs || []);
            setCustomers(data.customers || []);
            setSalesOrders(data.salesOrders || []);
            setRefundRecords(data.refundRecords || []);
            setZReports(data.zReports || []);
            if (data.settings?.storeName) {
              setStoreName(data.settings.storeName);
            }
            saveLocalBackup(userId, data);
          } else if (cachedData && cachedData.items && cachedData.items.length > 0) {
            // DB was empty but local cache has user data - restore to DB
            console.log('Restoring user catalogue from local cache to MongoDB...');
            hasUserMutatedRef.current = true;
          } else {
            // Truly empty new user store
            setItems([]);
            setSuppliers([]);
            setPurchaseOrders([]);
            setStockMovements([]);
            setWastageLogs([]);
            setCustomers([]);
            setSalesOrders([]);
            setRefundRecords([]);
            setZReports([]);
            setStoreName('');
          }
        }
      } catch (err) {
        console.error('Error fetching MongoDB store data:', err);
      } finally {
        isInitialLoadCompleteRef.current = true;
        setIsLoadingData(false);
      }
    };

    fetchDatabaseStore();
  }, [isAuthLoaded, isSignedIn, userId, saveLocalBackup]);

  // 2. Real-Time Sync of User Mutations to MongoDB (Chunked Streaming for High-Scale Datasets)
  const syncToMongoDB = useCallback(
    async (
      newItems: InventoryItem[],
      newSuppliers: Supplier[],
      newPOs: PurchaseOrder[],
      newMovements: StockMovement[],
      newWastage: WastageLog[],
      newCustomers: Customer[],
      newSalesOrders: SalesOrder[],
      newRefunds: RefundRecord[],
      newZReports: ZReportRecord[],
      currentStoreName: string,
      isExplicitClear?: boolean
    ) => {
      // Guard: Never sync if user is not signed in or if data hasn't completed initial load or has not been mutated
      if (!isSignedIn || !userId || !isInitialLoadCompleteRef.current || !hasUserMutatedRef.current) {
        return;
      }

      // Save to high-capacity IndexedDB immediately (non-blocking)
      saveLocalBackup(userId, {
        items: newItems,
        suppliers: newSuppliers,
        purchaseOrders: newPOs,
        stockMovements: newMovements,
        wastageLogs: newWastage,
        customers: newCustomers,
        salesOrders: newSalesOrders,
        refundRecords: newRefunds,
        zReports: newZReports,
        settings: { storeName: currentStoreName }
      });

      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);

      syncTimeoutRef.current = setTimeout(async () => {
        setIsSyncing(true);
        try {
          // If dataset is massive (>2500 products), stream in chunks to stay well below 10MB HTTP limits
          if (newItems.length > 2500) {
            // Step 1: Initialize sync & store metadata
            await fetch('/api/store-data', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                isChunked: true,
                action: 'init_sync',
                suppliers: newSuppliers,
                purchaseOrders: newPOs,
                stockMovements: newMovements,
                wastageLogs: newWastage,
                customers: newCustomers,
                salesOrders: newSalesOrders,
                refundRecords: newRefunds,
                zReports: newZReports,
                settings: { storeName: currentStoreName }
              })
            });

            // Step 2: Stream product catalogue in 2,000 item chunks
            const CHUNK_SIZE = 2000;
            for (let i = 0; i < newItems.length; i += CHUNK_SIZE) {
              const chunk = newItems.slice(i, i + CHUNK_SIZE);
              await fetch('/api/store-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  isChunked: true,
                  action: 'append_items',
                  chunk
                })
              });
            }

            // Step 3: Finalize
            await fetch('/api/store-data', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                isChunked: true,
                action: 'finalize_sync'
              })
            });
          } else {
            // Standard single-request sync for normal datasets
            await fetch('/api/store-data', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                items: newItems,
                suppliers: newSuppliers,
                purchaseOrders: newPOs,
                stockMovements: newMovements,
                wastageLogs: newWastage,
                customers: newCustomers,
                salesOrders: newSalesOrders,
                refundRecords: newRefunds,
                zReports: newZReports,
                settings: { storeName: currentStoreName },
                isExplicitClear: isExplicitClear || false
              })
            });
          }
        } catch (err) {
          console.error('Failed to sync changes with MongoDB:', err);
        } finally {
          setIsSyncing(false);
        }
      }, 600);
    },
    [isSignedIn, userId, saveLocalBackup]
  );

  // Sync with MongoDB whenever state changes after user mutation
  useEffect(() => {
    if (isLoadingData || !isSignedIn || !isInitialLoadCompleteRef.current || !hasUserMutatedRef.current) {
      return;
    }
    syncToMongoDB(items, suppliers, purchaseOrders, stockMovements, wastageLogs, customers, salesOrders, refundRecords, zReports, storeName);
  }, [items, suppliers, purchaseOrders, stockMovements, wastageLogs, customers, salesOrders, refundRecords, zReports, storeName, isLoadingData, isSignedIn, syncToMongoDB]);

  // Toast Helpers
  const addToast = useCallback((toastData: Omit<ToastMessage, 'id' | 'timestamp'>) => {
    const newToast: ToastMessage = {
      ...toastData,
      id: 'toast-' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setToasts((prev) => [newToast, ...prev.slice(0, 4)]);

    setTimeout(() => {
      setToasts((current) => current.filter((t) => t.id !== newToast.id));
    }, 4500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  // Update store name action
  const updateStoreName = useCallback((name: string) => {
    hasUserMutatedRef.current = true;
    setStoreName(name);
    addToast({
      type: 'success',
      title: 'Store Name Updated',
      message: `Store workspace renamed to "${name}".`
    });
  }, [addToast]);

  // Helper to normalize phone numbers (removes spaces, dashes, country code prefix)
  const normalizePhone = useCallback((phone: string): string => {
    return phone.replace(/[^0-9]/g, '').slice(-10);
  }, []);

  // Customer Lookup By Phone (Key for customer identification)
  const lookupCustomerByPhone = useCallback((phone: string): Customer | undefined => {
    const cleanPhone = normalizePhone(phone);
    if (!cleanPhone || cleanPhone.length < 4) return undefined;
    return customers.find((c) => {
      const cPhoneClean = normalizePhone(c.phone);
      return cPhoneClean === cleanPhone || c.phone.replace(/[^0-9]/g, '').includes(cleanPhone);
    });
  }, [customers, normalizePhone]);

  // Add or Update Customer
  const addOrUpdateCustomer = useCallback((customerData: { phone: string; name: string; email?: string; address?: string; gstin?: string; notes?: string }): Customer => {
    hasUserMutatedRef.current = true;
    const cleanPhone = normalizePhone(customerData.phone) || customerData.phone.trim();
    
    const existingIdx = customers.findIndex((c) => normalizePhone(c.phone) === cleanPhone);
    let targetCustomer: Customer;

    if (existingIdx !== -1) {
      targetCustomer = {
        ...customers[existingIdx],
        name: customerData.name || customers[existingIdx].name,
        email: customerData.email ?? customers[existingIdx].email,
        address: customerData.address ?? customers[existingIdx].address,
        gstin: customerData.gstin ?? customers[existingIdx].gstin,
        notes: customerData.notes ?? customers[existingIdx].notes
      };
      setCustomers((prev) => {
        const next = [...prev];
        next[existingIdx] = targetCustomer;
        return next;
      });

      const mov: StockMovement = {
        id: 'mov-' + Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toISOString(),
        itemId: targetCustomer.id,
        itemName: targetCustomer.name,
        sku: targetCustomer.phone,
        type: 'CUSTOMER_UPDATED',
        quantityDelta: 0,
        previousStock: 0,
        newStock: 0,
        reason: `Customer profile updated for ${targetCustomer.name} (Phone: ${targetCustomer.phone})`,
        performedBy: user?.fullName || 'Store Manager',
        unitCost: 0,
        financialImpact: 0
      };
      setStockMovements((prev) => [mov, ...prev]);
    } else {
      targetCustomer = {
        id: 'cust-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
        phone: customerData.phone.trim(),
        name: customerData.name.trim(),
        email: customerData.email?.trim(),
        address: customerData.address?.trim(),
        gstin: customerData.gstin?.trim(),
        totalOrders: 0,
        totalSpent: 0,
        loyaltyPoints: 0,
        createdAt: new Date().toISOString(),
        notes: customerData.notes?.trim()
      };
      setCustomers((prev) => [targetCustomer, ...prev]);

      const mov: StockMovement = {
        id: 'mov-' + Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toISOString(),
        itemId: targetCustomer.id,
        itemName: targetCustomer.name,
        sku: targetCustomer.phone,
        type: 'CUSTOMER_ENROLLED',
        quantityDelta: 0,
        previousStock: 0,
        newStock: 0,
        reason: `New customer enrolled: ${targetCustomer.name} (Phone: ${targetCustomer.phone})`,
        performedBy: user?.fullName || 'POS Cashier',
        unitCost: 0,
        financialImpact: 0
      };
      setStockMovements((prev) => [mov, ...prev]);
    }

    return targetCustomer;
  }, [customers, user, normalizePhone]);

  // Delete Customer
  const deleteCustomer = useCallback((phoneOrId: string) => {
    hasUserMutatedRef.current = true;
    const clean = normalizePhone(phoneOrId);
    
    const target = customers.find((c) => c.id === phoneOrId || (clean && normalizePhone(c.phone) === clean) || c.phone === phoneOrId);
    if (!target) return;

    const nextCustomers = customers.filter((c) => c.id !== target.id);
    setCustomers(nextCustomers);

    const mov: StockMovement = {
      id: 'mov-' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      itemId: target.id,
      itemName: target.name,
      sku: target.phone,
      type: 'CUSTOMER_UPDATED',
      quantityDelta: 0,
      previousStock: 0,
      newStock: 0,
      reason: `Customer ${target.name} (${target.phone}) removed from directory`,
      performedBy: user?.fullName || 'Store Manager',
      unitCost: 0,
      financialImpact: 0
    };
    setStockMovements((prev) => [mov, ...prev]);

    syncToMongoDB(items, suppliers, purchaseOrders, [mov, ...stockMovements], wastageLogs, nextCustomers, salesOrders, refundRecords, zReports, storeName, true);

    addToast({
      type: 'info',
      title: 'Customer Removed',
      message: `Customer ${target.name} (${target.phone}) was deleted.`
    });
  }, [customers, items, suppliers, purchaseOrders, stockMovements, wastageLogs, salesOrders, refundRecords, zReports, storeName, syncToMongoDB, normalizePhone, user, addToast]);

  // Expiry Calculations considering simulated date offset
  const getDaysUntilExpiry = useCallback((expiryDateStr: string): number => {
    if (!expiryDateStr) return 999;
    const now = new Date();
    now.setDate(now.getDate() + simulatedDateOffset);
    now.setHours(0, 0, 0, 0);

    const expiry = new Date(expiryDateStr);
    expiry.setHours(0, 0, 0, 0);

    const diffTime = expiry.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [simulatedDateOffset]);

  const getEffectiveBatchStatus = useCallback((expiryDateStr: string): 'safe' | 'warning' | 'critical' | 'expired' => {
    const days = getDaysUntilExpiry(expiryDateStr);
    if (days < 0) return 'expired';
    if (days <= 2) return 'critical';
    if (days <= 7) return 'warning';
    return 'safe';
  }, [getDaysUntilExpiry]);

  const getItemStatus = useCallback((item: InventoryItem): StockStatus => {
    if (item.currentStock <= 0) return 'out-of-stock';
    if (item.currentStock <= item.minStockLevel) return 'critical';
    
    const hasExpired = item.batches.some(b => b.quantity > 0 && getDaysUntilExpiry(b.expiryDate) < 0);
    if (hasExpired) return 'expired';

    const hasCriticalExpiry = item.batches.some(b => b.quantity > 0 && getDaysUntilExpiry(b.expiryDate) <= 2);
    if (hasCriticalExpiry) return 'expiring-soon';

    if (item.currentStock <= item.reorderPoint) return 'low-stock';
    return 'in-stock';
  }, [getDaysUntilExpiry]);

  // Live Summary Metrics
  const summary = useMemo(() => {
    let totalStockUnits = 0;
    let totalCostValuation = 0;
    let totalRetailValuation = 0;
    let outOfStockCount = 0;
    let lowStockCount = 0;
    let expiringSoonCount = 0;
    let expiredCount = 0;
    let atRiskLossValue = 0;

    items.forEach((item) => {
      totalStockUnits += item.currentStock;
      totalCostValuation += item.currentStock * item.costPrice;
      
      let itemRetailVal = 0;
      let accountedUnits = 0;
      
      item.batches.forEach((b) => {
        if (b.quantity > 0) {
          const unitSell = b.markdownPrice || (item.sellingPrice * (1 - (b.markdownPercentage || 0) / 100));
          itemRetailVal += b.quantity * unitSell;
          accountedUnits += b.quantity;

          const daysLeft = getDaysUntilExpiry(b.expiryDate);
          if (daysLeft < 0) {
            expiredCount += 1;
            atRiskLossValue += b.quantity * item.costPrice;
          } else if (daysLeft <= 3) {
            expiringSoonCount += 1;
            atRiskLossValue += b.quantity * item.costPrice;
          }
        }
      });

      const remainingUnbatched = Math.max(0, item.currentStock - accountedUnits);
      itemRetailVal += remainingUnbatched * (item.discountPrice || item.sellingPrice);
      totalRetailValuation += itemRetailVal;

      if (item.currentStock <= 0) {
        outOfStockCount++;
      } else if (item.currentStock <= item.reorderPoint) {
        lowStockCount++;
      }
    });

    const potentialProfit = Math.max(0, totalRetailValuation - totalCostValuation);
    const averageMarginPercent = totalRetailValuation > 0
      ? Math.round((potentialProfit / totalRetailValuation) * 100 * 10) / 10
      : 0;

    const pendingOrdersCount = purchaseOrders.filter((po) =>
      ['pending', 'sent', 'in-transit'].includes(po.status)
    ).length;

    const totalSalesOrdersCount = salesOrders.length;
    const totalLifetimeRevenue = Math.round(salesOrders.reduce((a, o) => a + o.total, 0) * 100) / 100;

    return {
      totalItemsCount: items.length,
      totalStockUnits,
      totalCostValuation: Math.round(totalCostValuation * 100) / 100,
      totalRetailValuation: Math.round(totalRetailValuation * 100) / 100,
      potentialProfit: Math.round(potentialProfit * 100) / 100,
      averageMarginPercent,
      outOfStockCount,
      lowStockCount,
      expiringSoonCount,
      expiredCount,
      atRiskLossValue: Math.round(atRiskLossValue * 100) / 100,
      pendingOrdersCount,
      totalCustomersCount: customers.length,
      totalSalesOrdersCount: salesOrders.length,
      totalLifetimeRevenue,
      totalRefundsCount: refundRecords.length
    };
  }, [items, purchaseOrders, customers, salesOrders, refundRecords, getDaysUntilExpiry]);

  // Seed sample supermarket data into isolated user workspace in MongoDB
  const seedSampleData = useCallback(async () => {
    hasUserMutatedRef.current = true;
    setItems(INITIAL_INVENTORY);
    setSuppliers(INITIAL_SUPPLIERS);
    setPurchaseOrders(INITIAL_PURCHASE_ORDERS);
    setStockMovements(INITIAL_STOCK_MOVEMENTS);
    setWastageLogs(INITIAL_WASTAGE_LOGS);

    addToast({
      type: 'success',
      title: 'Demo Store Seeded',
      message: 'Populated 16 supermarket items, batches, and suppliers to your MongoDB account.'
    });
  }, [addToast]);

  // Bulk Import Items from CSV / Excel into MongoDB
  const importBulkItems = useCallback(async (newItems: InventoryItem[], replaceExisting: boolean = true) => {
    hasUserMutatedRef.current = true;
    if (replaceExisting) {
      setItems(newItems);
    } else {
      setItems((prev) => [...newItems, ...prev]);
    }

    const bulkMov: StockMovement = {
      id: 'mov-imp-' + Date.now(),
      timestamp: new Date().toISOString(),
      itemId: 'bulk-import',
      itemName: replaceExisting
        ? `Catalogue Replaced (${newItems.length} Products)`
        : `Spreadsheet Import (${newItems.length} Products Added)`,
      sku: 'BULK-IMPORT',
      type: 'BULK_IMPORT',
      quantityDelta: newItems.reduce((a, c) => a + c.currentStock, 0),
      previousStock: 0,
      newStock: newItems.reduce((a, c) => a + c.currentStock, 0),
      reason: replaceExisting ? 'Fresh Catalogue Overwrite (CSV/Excel)' : 'Bulk Data Upload (CSV/Excel)',
      performedBy: user?.fullName || 'Store Owner',
      unitCost: 0,
      financialImpact: 0
    };
    setStockMovements((prev) => [bulkMov, ...prev]);
  }, [user]);

  // Clear all inventory items
  const clearAllInventory = useCallback(() => {
    hasUserMutatedRef.current = true;
    setItems([]);
    syncToMongoDB([], suppliers, purchaseOrders, stockMovements, wastageLogs, customers, salesOrders, refundRecords, zReports, storeName, true);
    addToast({
      type: 'info',
      title: 'Catalogue Reset',
      message: 'All inventory products have been removed.'
    });
  }, [suppliers, purchaseOrders, stockMovements, wastageLogs, customers, salesOrders, refundRecords, zReports, storeName, syncToMongoDB, addToast]);

  // Item Actions
  const addItem = useCallback((itemData: Omit<InventoryItem, 'id'>): string => {
    hasUserMutatedRef.current = true;
    const id = 'item-' + Math.random().toString(36).substring(2, 8);
    const newItem: InventoryItem = {
      ...itemData,
      id
    };
    setItems((prev) => [newItem, ...prev]);

    const movement: StockMovement = {
      id: 'mov-' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      itemId: id,
      itemName: newItem.name,
      sku: newItem.sku,
      type: 'PRODUCT_CREATED',
      quantityDelta: newItem.currentStock,
      previousStock: 0,
      newStock: newItem.currentStock,
      reason: `New product '${newItem.name}' added with ${newItem.currentStock} ${newItem.unit} initial stock`,
      performedBy: user?.fullName || 'Store Manager',
      unitCost: newItem.costPrice,
      financialImpact: newItem.currentStock * newItem.costPrice
    };
    setStockMovements((prev) => [movement, ...prev]);

    addToast({
      type: 'success',
      title: 'Item Created',
      message: `"${newItem.name}" added to inventory successfully.`
    });

    return id;
  }, [user, addToast]);

  const updateItem = useCallback((id: string, updates: Partial<InventoryItem>) => {
    hasUserMutatedRef.current = true;
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, ...updates };

          const mov: StockMovement = {
            id: 'mov-' + Math.random().toString(36).substring(2, 9),
            timestamp: new Date().toISOString(),
            itemId: id,
            itemName: updated.name,
            sku: updated.sku,
            type: 'PRODUCT_UPDATED',
            quantityDelta: 0,
            previousStock: item.currentStock,
            newStock: updated.currentStock,
            reason: `Product specs, pricing, or stock parameters modified for '${updated.name}'`,
            performedBy: user?.fullName || 'Store Manager',
            unitCost: updated.costPrice,
            financialImpact: 0
          };
          setStockMovements((mPrev) => [mov, ...mPrev]);

          return updated;
        }
        return item;
      })
    );

    addToast({
      type: 'info',
      title: 'Item Updated',
      message: 'Product specs and stock properties saved.'
    });
  }, [user, addToast]);

  const deleteItem = useCallback((id: string) => {
    hasUserMutatedRef.current = true;
    const itemToDelete = items.find((i) => i.id === id);
    if (!itemToDelete) return;

    setItems((prev) => prev.filter((i) => i.id !== id));

    const mov: StockMovement = {
      id: 'mov-' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      itemId: id,
      itemName: itemToDelete.name,
      sku: itemToDelete.sku,
      type: 'PRODUCT_DELETED',
      quantityDelta: -itemToDelete.currentStock,
      previousStock: itemToDelete.currentStock,
      newStock: 0,
      reason: `Product '${itemToDelete.name}' (${itemToDelete.sku}) deleted from catalogue`,
      performedBy: user?.fullName || 'Store Manager',
      unitCost: itemToDelete.costPrice,
      financialImpact: -(itemToDelete.currentStock * itemToDelete.costPrice)
    };
    setStockMovements((prev) => [mov, ...prev]);

    addToast({
      type: 'warning',
      title: 'Item Deleted',
      message: `"${itemToDelete.name}" removed from inventory catalogue.`
    });
  }, [items, user, addToast]);

  // Adjust Stock
  const adjustStock = useCallback((
    itemId: string,
    delta: number,
    reason: string,
    type: MovementType = 'ADJUSTMENT',
    batchNumber?: string
  ) => {
    hasUserMutatedRef.current = true;
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const newStock = Math.max(0, item.currentStock + delta);

        let updatedBatches = [...item.batches];
        if (batchNumber && updatedBatches.length > 0) {
          updatedBatches = updatedBatches.map((b) => {
            if (b.batchNumber === batchNumber) {
              return { ...b, quantity: Math.max(0, b.quantity + delta) };
            }
            return b;
          });
        }

        const movement: StockMovement = {
          id: 'mov-' + Math.random().toString(36).substring(2, 9),
          timestamp: new Date().toISOString(),
          itemId: item.id,
          itemName: item.name,
          sku: item.sku,
          type,
          quantityDelta: delta,
          previousStock: item.currentStock,
          newStock,
          batchNumber,
          reason,
          performedBy: user?.fullName || 'Staff Operator',
          unitCost: item.costPrice,
          financialImpact: Math.abs(delta) * (type === 'SALE' ? item.sellingPrice : item.costPrice)
        };
        setStockMovements((curr) => [movement, ...curr]);

        return {
          ...item,
          currentStock: newStock,
          batches: updatedBatches
        };
      })
    );

    addToast({
      type: delta >= 0 ? 'success' : 'warning',
      title: delta >= 0 ? 'Stock Increased' : 'Stock Reduced',
      message: `${Math.abs(delta)} unit(s) recorded (${reason})`
    });
  }, [user, addToast]);

  // Apply Batch Markdown Discount
  const applyBatchMarkdown = useCallback((itemId: string, batchId: string, markdownPercent: number) => {
    hasUserMutatedRef.current = true;
    let itemName = '';
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        itemName = item.name;

        const updatedBatches = item.batches.map((b) => {
          if (b.id === batchId) {
            const discountedPrice = Math.round(item.sellingPrice * (1 - markdownPercent / 100) * 100) / 100;
            return {
              ...b,
              markdownPercentage: markdownPercent,
              markdownPrice: discountedPrice,
              notes: markdownPercent > 0 ? `Dynamic Markdown ${markdownPercent}% applied` : undefined
            };
          }
          return b;
        });

        return { ...item, batches: updatedBatches };
      })
    );

    const movement: StockMovement = {
      id: 'mov-' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      itemId,
      itemName,
      sku: '',
      type: 'MARKDOWN_APPLIED',
      quantityDelta: 0,
      previousStock: 0,
      newStock: 0,
      reason: `Applied ${markdownPercent}% dynamic clearance discount to batch`,
      performedBy: 'Dynamic Expiry Engine',
      unitCost: 0,
      financialImpact: 0
    };
    setStockMovements((prev) => [movement, ...prev]);

    addToast({
      type: 'info',
      title: 'Discount Applied',
      message: `${markdownPercent}% clearance markdown active for selected batch.`
    });
  }, [addToast]);

  // Auto Smart Expiry Markdowns
  const applySmartExpiryMarkdowns = useCallback((): number => {
    hasUserMutatedRef.current = true;
    let affectedBatchesCount = 0;

    setItems((prev) =>
      prev.map((item) => {
        let changed = false;
        const updatedBatches = item.batches.map((b) => {
          if (b.quantity <= 0) return b;
          const daysLeft = getDaysUntilExpiry(b.expiryDate);

          if (daysLeft <= 1 && b.markdownPercentage < 50) {
            affectedBatchesCount++;
            changed = true;
            return {
              ...b,
              markdownPercentage: 50,
              markdownPrice: Math.round(item.sellingPrice * 0.5 * 100) / 100,
              notes: 'Smart Expiry Engine: 50% Urgent Clearance (<24-48h)'
            };
          } else if (daysLeft <= 3 && b.markdownPercentage < 25) {
            affectedBatchesCount++;
            changed = true;
            return {
              ...b,
              markdownPercentage: 25,
              markdownPrice: Math.round(item.sellingPrice * 0.75 * 100) / 100,
              notes: 'Smart Expiry Engine: 25% Early Clearance (<3d)'
            };
          }
          return b;
        });

        return changed ? { ...item, batches: updatedBatches } : item;
      })
    );

    if (affectedBatchesCount > 0) {
      addToast({
        type: 'success',
        title: 'Smart Markdowns Activated',
        message: `Applied dynamic discounts to ${affectedBatchesCount} near-expiry batch(es) to accelerate turnover.`
      });
    } else {
      addToast({
        type: 'info',
        title: 'All Good',
        message: 'No un-discounted batches requiring markdown at this time.'
      });
    }

    return affectedBatchesCount;
  }, [getDaysUntilExpiry, addToast]);

  // Write off spoiled/expired inventory
  const writeOffBatch = useCallback((
    itemId: string,
    batchId: string,
    quantity: number,
    reason: WastageLog['reason'],
    disposal: WastageLog['disposalMethod'],
    notes?: string
  ) => {
    hasUserMutatedRef.current = true;
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    const targetBatch = item.batches.find((b) => b.id === batchId);
    const batchNum = targetBatch?.batchNumber || 'UNKNOWN';
    const writeOffQty = Math.min(quantity, targetBatch ? targetBatch.quantity : item.currentStock);
    const totalLoss = Math.round(writeOffQty * item.costPrice * 100) / 100;

    const wastageEntry: WastageLog = {
      id: 'wst-' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      itemId: item.id,
      itemName: item.name,
      sku: item.sku,
      batchNumber: batchNum,
      quantity: writeOffQty,
      unit: item.unit,
      reason,
      unitCost: item.costPrice,
      totalLoss,
      disposalMethod: disposal,
      recordedBy: user?.fullName || 'Store Supervisor',
      notes: notes || `Disposal logged via Expiry Hub (${reason})`
    };
    setWastageLogs((prev) => [wastageEntry, ...prev]);

    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== itemId) return it;
        const newStock = Math.max(0, it.currentStock - writeOffQty);
        const updatedBatches = it.batches.map((b) => {
          if (b.id === batchId) {
            return { ...b, quantity: Math.max(0, b.quantity - writeOffQty) };
          }
          return b;
        });

        return {
          ...it,
          currentStock: newStock,
          batches: updatedBatches
        };
      })
    );

    const movement: StockMovement = {
      id: 'mov-' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      itemId: item.id,
      itemName: item.name,
      sku: item.sku,
      type: reason === 'expired' ? 'WASTE_EXPIRED' : 'WASTE_DAMAGED',
      quantityDelta: -writeOffQty,
      previousStock: item.currentStock,
      newStock: Math.max(0, item.currentStock - writeOffQty),
      batchNumber: batchNum,
      reason: `Wastage write-off: ${reason} (Disposal: ${disposal})`,
      performedBy: user?.fullName || 'Store Supervisor',
      unitCost: item.costPrice,
      financialImpact: -totalLoss
    };
    setStockMovements((prev) => [movement, ...prev]);

    addToast({
      type: 'warning',
      title: 'Disposal Logged',
      message: `${writeOffQty} ${item.unit} written off. Loss impact: $${totalLoss.toFixed(2)}.`
    });
  }, [items, user, addToast]);

  // Create Purchase Order
  const createPurchaseOrder = useCallback((poData: Omit<PurchaseOrder, 'id' | 'poNumber'>): string => {
    hasUserMutatedRef.current = true;
    const poNum = `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const id = 'po-' + Math.random().toString(36).substring(2, 9);
    
    const newPO: PurchaseOrder = {
      ...poData,
      id,
      poNumber: poNum
    };

    setPurchaseOrders((prev) => [newPO, ...prev]);

    const mov: StockMovement = {
      id: 'mov-' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      itemId: id,
      itemName: `Purchase Order (${poData.supplierName})`,
      sku: poNum,
      type: 'PO_CREATED',
      quantityDelta: poData.items.reduce((a, c) => a + c.orderedQty, 0),
      previousStock: 0,
      newStock: 0,
      reason: `Draft Purchase Order ${poNum} created for ${poData.supplierName} (${poData.items.length} line items)`,
      performedBy: user?.fullName || 'Procurement Team',
      unitCost: 0,
      financialImpact: poData.totalAmount
    };
    setStockMovements((prev) => [mov, ...prev]);

    addToast({
      type: 'success',
      title: 'Purchase Order Created',
      message: `${poNum} sent to ${poData.supplierName} ($${poData.totalAmount.toFixed(2)})`
    });

    return id;
  }, [user, addToast]);

  const updatePOStatus = useCallback((poId: string, status: POStatus) => {
    hasUserMutatedRef.current = true;
    setPurchaseOrders((prev) =>
      prev.map((po) => {
        if (po.id === poId) {
          return { ...po, status };
        }
        return po;
      })
    );

    addToast({
      type: 'info',
      title: 'PO Status Updated',
      message: `Purchase order moved to status "${status}".`
    });
  }, [addToast]);

  // Goods Receipt / Receive PO
  const receivePurchaseOrder = useCallback((poId: string, receivedMap: Record<string, number>) => {
    hasUserMutatedRef.current = true;
    const po = purchaseOrders.find((p) => p.id === poId);
    if (!po) return;

    let totalUnitsReceived = 0;
    const updatedItems = [...items];

    po.items.forEach((line) => {
      const qtyReceived = receivedMap[line.itemId] || line.orderedQty;
      if (qtyReceived > 0) {
        totalUnitsReceived += qtyReceived;
        const itemIdx = updatedItems.findIndex((it) => it.id === line.itemId);
        if (itemIdx !== -1) {
          const item = updatedItems[itemIdx];
          const newStock = item.currentStock + qtyReceived;
          const newBatchNumber = `${item.sku.split('-')[1] || 'BAT'}-${Date.now().toString().slice(-4)}`;

          const shelfLifeDays = item.category === 'Fresh Produce' ? 7 : item.category === 'Dairy & Eggs' ? 14 : 90;
          const newBatch: BatchInfo = {
            id: 'b-' + Math.random().toString(36).substring(2, 8),
            batchNumber: newBatchNumber,
            quantity: qtyReceived,
            expiryDate: getRelativeDate(shelfLifeDays),
            costPrice: line.unitCost,
            markdownPercentage: 0,
            status: 'safe'
          };

          updatedItems[itemIdx] = {
            ...item,
            currentStock: newStock,
            batches: [newBatch, ...item.batches],
            salesVelocity: {
              ...item.salesVelocity,
              lastRestockedAt: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          };

          const movement: StockMovement = {
            id: 'mov-' + Math.random().toString(36).substring(2, 9),
            timestamp: new Date().toISOString(),
            itemId: item.id,
            itemName: item.name,
            sku: item.sku,
            type: 'RESTOCK',
            quantityDelta: qtyReceived,
            previousStock: item.currentStock,
            newStock,
            batchNumber: newBatchNumber,
            reason: `Goods Receipt for PO ${po.poNumber}`,
            performedBy: user?.fullName || 'Warehouse Team',
            unitCost: line.unitCost,
            financialImpact: qtyReceived * line.unitCost
          };
          setStockMovements((prev) => [movement, ...prev]);
        }
      }
    });

    setItems(updatedItems);

    setPurchaseOrders((prev) =>
      prev.map((p) => {
        if (p.id === poId) {
          return {
            ...p,
            status: 'received',
            receivedDate: getRelativeDate(0),
            items: p.items.map((line) => ({
              ...line,
              receivedQty: receivedMap[line.itemId] || line.orderedQty
            }))
          };
        }
        return p;
      })
    );

    addToast({
      type: 'success',
      title: 'Goods Received & Stock Restocked',
      message: `Received ${totalUnitsReceived} units from PO ${po.poNumber}. Inventory updated.`
    });
  }, [items, purchaseOrders, user, addToast]);

  // Auto Generate Reorder POs
  const autoGenerateReorderPOs = useCallback((): number => {
    hasUserMutatedRef.current = true;
    const itemsNeedingOrder = items.filter((item) => item.currentStock <= item.reorderPoint);

    if (itemsNeedingOrder.length === 0) {
      addToast({
        type: 'info',
        title: 'Inventory Healthy',
        message: 'All products currently meet or exceed safety threshold levels.'
      });
      return 0;
    }

    const supplierGroups: Record<string, InventoryItem[]> = {};
    itemsNeedingOrder.forEach((item) => {
      if (!supplierGroups[item.supplierId]) {
        supplierGroups[item.supplierId] = [];
      }
      supplierGroups[item.supplierId].push(item);
    });

    const newPOs: PurchaseOrder[] = [];

    Object.entries(supplierGroups).forEach(([supId, groupItems]) => {
      const supplier = suppliers.find((s) => s.id === supId) || {
        id: supId,
        name: groupItems[0]?.supplierName || 'Primary Distributor',
        leadTimeDays: 2
      };

      const lineItems = groupItems.map((item) => {
        const orderQty = Math.max(10, item.optimalStockLevel - item.currentStock);
        return {
          itemId: item.id,
          sku: item.sku,
          name: item.name,
          unit: item.unit,
          orderedQty: orderQty,
          receivedQty: 0,
          unitCost: item.costPrice,
          totalCost: Math.round(orderQty * item.costPrice * 100) / 100,
          suggestedQty: orderQty
        };
      });

      const subtotal = lineItems.reduce((acc, curr) => acc + curr.totalCost, 0);
      const poNum = `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      newPOs.push({
        id: 'po-' + Math.random().toString(36).substring(2, 9),
        poNumber: poNum,
        supplierId: supplier.id,
        supplierName: supplier.name,
        status: 'draft',
        orderDate: getRelativeDate(0),
        expectedDeliveryDate: getRelativeDate(supplier.leadTimeDays || 2),
        items: lineItems,
        subtotal: Math.round(subtotal * 100) / 100,
        tax: 0,
        shippingFee: 15.00,
        totalAmount: Math.round((subtotal + 15.00) * 100) / 100,
        notes: `Smart Auto-Generated Draft Order for ${lineItems.length} low-stock lines.`,
        createdBy: 'Auto-Replenish AI Engine'
      });
    });

    setPurchaseOrders((prev) => [...newPOs, ...prev]);

    addToast({
      type: 'success',
      title: 'Auto-Reorder Generated',
      message: `Created ${newPOs.length} draft purchase order(s) for ${itemsNeedingOrder.length} SKU(s).`
    });

    return newPOs.length;
  }, [items, suppliers, addToast]);

  // Process POS Sale with Customer Linkage, Split/Cash Tender and Sales Order Generation
  const processPOSSale = useCallback((
    cartItems: POSCartItem[], 
    paymentMethod: string,
    customerInfo?: { phone: string; name?: string; email?: string; address?: string; gstin?: string } | null,
    paymentDetails?: {
      paymentBreakdown?: { cash?: number; upi?: number; card?: number };
      cashChange?: { tendered?: number; changeDue?: number };
    }
  ): { success: boolean; orderId: string; customer?: Customer | null } => {
    hasUserMutatedRef.current = true;
    if (cartItems.length === 0) return { success: false, orderId: '', customer: null };

    const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
    const updatedItems = [...items];
    const newMovements: StockMovement[] = [];
    const totalSaleAmount = cartItems.reduce((acc, ci) => acc + ci.total, 0);

    // Link or Enroll Customer
    let associatedCustomer: Customer | null = null;
    if (customerInfo && customerInfo.phone && customerInfo.phone.trim() !== '') {
      const cleanPhone = normalizePhone(customerInfo.phone) || customerInfo.phone.trim();
      const existing = customers.find((c) => normalizePhone(c.phone) === cleanPhone || c.phone.trim() === customerInfo.phone.trim());

      if (existing) {
        associatedCustomer = {
          ...existing,
          name: customerInfo.name?.trim() || existing.name,
          email: customerInfo.email?.trim() ?? existing.email,
          address: customerInfo.address?.trim() ?? existing.address,
          gstin: customerInfo.gstin?.trim() ?? existing.gstin,
          totalOrders: existing.totalOrders + 1,
          totalSpent: Math.round((existing.totalSpent + totalSaleAmount) * 100) / 100,
          loyaltyPoints: (existing.loyaltyPoints || 0) + Math.floor(totalSaleAmount / 100),
          lastPurchaseDate: new Date().toISOString()
        };
        setCustomers((prev) => prev.map((c) => c.id === existing.id ? associatedCustomer! : c));
      } else {
        associatedCustomer = {
          id: 'cust-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
          phone: customerInfo.phone.trim(),
          name: customerInfo.name?.trim() || 'Valued Customer',
          email: customerInfo.email?.trim(),
          address: customerInfo.address?.trim(),
          gstin: customerInfo.gstin?.trim(),
          totalOrders: 1,
          totalSpent: Math.round(totalSaleAmount * 100) / 100,
          loyaltyPoints: Math.floor(totalSaleAmount / 100),
          createdAt: new Date().toISOString(),
          lastPurchaseDate: new Date().toISOString()
        };
        setCustomers((prev) => [associatedCustomer!, ...prev]);
      }
    }

    const customerLabel = associatedCustomer 
      ? ` (${associatedCustomer.name} • ${associatedCustomer.phone})`
      : '';

    // 1. Deduct Stock & Generate Movement Records (Supports Decimal Quantities)
    cartItems.forEach((cartItem) => {
      const idx = updatedItems.findIndex((it) => it.id === cartItem.item.id);
      if (idx !== -1) {
        const item = updatedItems[idx];
        const newStock = Math.max(0, Math.round((item.currentStock - cartItem.quantity) * 1000) / 1000);

        let remainingQtyToDeduct = cartItem.quantity;
        const updatedBatches = item.batches.map((b) => {
          if (remainingQtyToDeduct <= 0) return b;
          if (cartItem.batch && b.id === cartItem.batch.id) {
            const deduct = Math.min(b.quantity, remainingQtyToDeduct);
            remainingQtyToDeduct -= deduct;
            return { ...b, quantity: Math.max(0, Math.round((b.quantity - deduct) * 1000) / 1000) };
          } else if (!cartItem.batch && b.quantity > 0) {
            const deduct = Math.min(b.quantity, remainingQtyToDeduct);
            remainingQtyToDeduct -= deduct;
            return { ...b, quantity: Math.max(0, Math.round((b.quantity - deduct) * 1000) / 1000) };
          }
          return b;
        });

        updatedItems[idx] = {
          ...item,
          currentStock: newStock,
          batches: updatedBatches,
          salesVelocity: {
            ...item.salesVelocity,
            weeklySales: item.salesVelocity.weeklySales + cartItem.quantity,
            lastSoldAt: 'Just now (' + orderId + ')'
          }
        };

        newMovements.push({
          id: 'mov-' + Math.random().toString(36).substring(2, 9),
          timestamp: new Date().toISOString(),
          itemId: item.id,
          itemName: item.name,
          sku: item.sku,
          type: 'SALE',
          quantityDelta: -cartItem.quantity,
          previousStock: item.currentStock,
          newStock,
          batchNumber: cartItem.batch?.batchNumber,
          reason: `POS Sale #${orderId} (${paymentMethod})${customerLabel}`,
          performedBy: user?.fullName || 'POS Cashier #1',
          unitCost: item.costPrice,
          financialImpact: cartItem.total
        });
      }
    });

    // 2. Build Complete Sales Order Transaction Record
    const orderItems: SalesOrderItem[] = cartItems.map((ci) => ({
      itemId: ci.item.id,
      itemName: ci.item.name,
      sku: ci.item.sku,
      category: ci.item.category,
      quantity: ci.quantity,
      unit: ci.item.unit,
      unitPrice: ci.unitPrice,
      originalPrice: ci.item.sellingPrice,
      appliedDiscountPercentage: ci.appliedDiscountPercentage,
      total: Math.round(ci.total * 100) / 100,
      batchNumber: ci.batch?.batchNumber
    }));

    const grossSubtotal = cartItems.reduce((acc, ci) => acc + (ci.quantity * ci.item.sellingPrice), 0);
    const totalDiscount = cartItems.reduce((acc, ci) => acc + Math.max(0, (ci.item.sellingPrice - ci.unitPrice) * ci.quantity), 0);
    const taxAmount = Math.round(totalSaleAmount * 0.05 * 100) / 100;
    const finalTotal = Math.round((totalSaleAmount + taxAmount) * 100) / 100;

    const newSalesOrder: SalesOrder = {
      id: orderId,
      orderNumber: orderId,
      timestamp: new Date().toISOString(),
      customer: associatedCustomer ? {
        id: associatedCustomer.id,
        phone: associatedCustomer.phone,
        name: associatedCustomer.name,
        email: associatedCustomer.email,
        address: associatedCustomer.address,
        gstin: associatedCustomer.gstin
      } : null,
      items: orderItems,
      itemCount: cartItems.length,
      totalUnits: Math.round(cartItems.reduce((acc, ci) => acc + ci.quantity, 0) * 100) / 100,
      subtotal: Math.round(grossSubtotal * 100) / 100,
      discountTotal: Math.round(totalDiscount * 100) / 100,
      tax: taxAmount,
      total: finalTotal,
      paymentMethod: paymentMethod.toUpperCase(),
      paymentBreakdown: paymentDetails?.paymentBreakdown,
      cashChange: paymentDetails?.cashChange,
      cashierName: user?.fullName || 'POS Cashier #1',
      status: 'completed'
    };

    setItems(updatedItems);
    setStockMovements((prev) => [...newMovements, ...prev]);
    setSalesOrders((prev) => [newSalesOrder, ...prev]);

    addToast({
      type: 'success',
      title: 'Sale Processed',
      message: `Receipt #${orderId} completed via ${paymentMethod}${associatedCustomer ? ` for ${associatedCustomer.name}` : ''}. Inventory auto-deducted.`
    });

    return { success: true, orderId, customer: associatedCustomer };
  }, [items, customers, user, normalizePhone, addToast]);

  // Process Item Return & Refund by Receipt ID
  const processOrderReturn = useCallback((
    orderNumber: string,
    returnedItems: { itemId: string; quantity: number; returnToInventory: boolean; reason: string }[],
    refundMethod: string,
    notes?: string
  ): { success: boolean; refundRecord: RefundRecord | null } => {
    hasUserMutatedRef.current = true;
    const orderIndex = salesOrders.findIndex((o) => o.orderNumber === orderNumber);
    if (orderIndex === -1) {
      addToast({
        type: 'warning',
        title: 'Order Not Found',
        message: `Receipt #${orderNumber} could not be located in records.`
      });
      return { success: false, refundRecord: null };
    }

    const order = salesOrders[orderIndex];
    let totalRefundAmount = 0;
    const refundItemsList: RefundItem[] = [];
    const newMovements: StockMovement[] = [];
    const newWastage: WastageLog[] = [];
    const updatedItems = [...items];

    returnedItems.forEach((ret) => {
      const orderItem = order.items.find((i) => i.itemId === ret.itemId);
      if (!orderItem || ret.quantity <= 0) return;

      const itemRefund = Math.round(orderItem.unitPrice * ret.quantity * 100) / 100;
      totalRefundAmount += itemRefund;

      refundItemsList.push({
        itemId: ret.itemId,
        itemName: orderItem.itemName,
        sku: orderItem.sku,
        quantity: ret.quantity,
        unit: orderItem.unit,
        unitPrice: orderItem.unitPrice,
        refundAmount: itemRefund,
        returnToInventory: ret.returnToInventory,
        batchNumber: orderItem.batchNumber
      });

      const invItemIndex = updatedItems.findIndex((it) => it.id === ret.itemId);
      if (invItemIndex !== -1) {
        const invItem = updatedItems[invItemIndex];

        if (ret.returnToInventory) {
          // Restock to inventory
          const newStock = Math.round((invItem.currentStock + ret.quantity) * 1000) / 1000;
          let updatedBatches = [...invItem.batches];
          if (orderItem.batchNumber && updatedBatches.some((b) => b.batchNumber === orderItem.batchNumber)) {
            updatedBatches = updatedBatches.map((b) =>
              b.batchNumber === orderItem.batchNumber
                ? { ...b, quantity: Math.round((b.quantity + ret.quantity) * 1000) / 1000 }
                : b
            );
          } else {
            // Add restock batch
            updatedBatches = [
              {
                id: 'b-ret-' + Math.random().toString(36).substring(2, 7),
                batchNumber: orderItem.batchNumber || 'RESTOCK-' + Date.now().toString().slice(-4),
                quantity: ret.quantity,
                expiryDate: getRelativeDate(30),
                costPrice: invItem.costPrice,
                markdownPercentage: 0,
                status: 'safe'
              },
              ...updatedBatches
            ];
          }

          updatedItems[invItemIndex] = {
            ...invItem,
            currentStock: newStock,
            batches: updatedBatches
          };

          newMovements.push({
            id: 'mov-' + Math.random().toString(36).substring(2, 9),
            timestamp: new Date().toISOString(),
            itemId: invItem.id,
            itemName: invItem.name,
            sku: invItem.sku,
            type: 'RETURN',
            quantityDelta: ret.quantity,
            previousStock: invItem.currentStock,
            newStock,
            batchNumber: orderItem.batchNumber,
            reason: `Customer Return for #${orderNumber}: ${ret.reason} (Restocked)`,
            performedBy: user?.fullName || 'POS Supervisor',
            unitCost: invItem.costPrice,
            financialImpact: -itemRefund
          });
        } else {
          // Damaged/Defective item -> Log to Wastage
          const wastageEntry: WastageLog = {
            id: 'wst-ret-' + Math.random().toString(36).substring(2, 9),
            timestamp: new Date().toISOString(),
            itemId: invItem.id,
            itemName: invItem.name,
            sku: invItem.sku,
            batchNumber: orderItem.batchNumber || 'DEFECT-RET',
            quantity: ret.quantity,
            unit: (invItem.unit as any) || 'pcs',
            reason: 'damaged',
            unitCost: invItem.costPrice,
            totalLoss: Math.round(ret.quantity * invItem.costPrice * 100) / 100,
            disposalMethod: 'supplier_claim',
            recordedBy: user?.fullName || 'POS Supervisor',
            notes: `Returned from Order #${orderNumber} (Defective/Damaged: ${ret.reason})`
          };
          newWastage.push(wastageEntry);

          newMovements.push({
            id: 'mov-' + Math.random().toString(36).substring(2, 9),
            timestamp: new Date().toISOString(),
            itemId: invItem.id,
            itemName: invItem.name,
            sku: invItem.sku,
            type: 'WASTE_DAMAGED',
            quantityDelta: 0,
            previousStock: invItem.currentStock,
            newStock: invItem.currentStock,
            batchNumber: orderItem.batchNumber,
            reason: `Customer Return #${orderNumber} Defect Write-off (${ret.reason})`,
            performedBy: user?.fullName || 'POS Supervisor',
            unitCost: invItem.costPrice,
            financialImpact: -itemRefund
          });
        }
      }
    });

    if (refundItemsList.length === 0) {
      addToast({
        type: 'warning',
        title: 'No Items Selected',
        message: 'Please specify items and quantities to return.'
      });
      return { success: false, refundRecord: null };
    }

    // Add tax (5%) to refund amount
    const taxRefund = Math.round(totalRefundAmount * 0.05 * 100) / 100;
    const finalRefundTotal = Math.round((totalRefundAmount + taxRefund) * 100) / 100;

    const refNum = `REF-${Math.floor(100000 + Math.random() * 900000)}`;
    const newRefundRecord: RefundRecord = {
      id: 'ref-' + Date.now(),
      refundNumber: refNum,
      originalOrderNumber: orderNumber,
      timestamp: new Date().toISOString(),
      customer: order.customer ? {
        phone: order.customer.phone,
        name: order.customer.name,
        gstin: order.customer.gstin
      } : null,
      items: refundItemsList,
      totalRefundAmount: finalRefundTotal,
      refundMethod,
      reason: notes || 'Customer Item Return',
      processedBy: user?.fullName || 'POS Supervisor'
    };

    // Update original order status
    const totalReturnedUnits = refundItemsList.reduce((a, c) => a + c.quantity, 0);
    const orderTotalUnits = order.totalUnits;
    const newStatus = totalReturnedUnits >= orderTotalUnits ? 'refunded' : 'partially_refunded';

    setSalesOrders((prev) =>
      prev.map((o) =>
        o.orderNumber === orderNumber
          ? { ...o, status: newStatus, notes: (o.notes ? o.notes + ' | ' : '') + `Refund ${refNum} (${refundMethod})` }
          : o
      )
    );

    setItems(updatedItems);
    if (newWastage.length > 0) setWastageLogs((prev) => [...newWastage, ...prev]);
    setStockMovements((prev) => [...newMovements, ...prev]);
    setRefundRecords((prev) => [newRefundRecord, ...prev]);

    // Adjust customer metrics if applicable
    if (order.customer?.phone) {
      const cleanPhone = normalizePhone(order.customer.phone);
      setCustomers((prev) =>
        prev.map((c) =>
          normalizePhone(c.phone) === cleanPhone
            ? { ...c, totalSpent: Math.max(0, Math.round((c.totalSpent - finalRefundTotal) * 100) / 100) }
            : c
        )
      );
    }

    addToast({
      type: 'info',
      title: 'Return Processed',
      message: `Refund #${refNum} processed for ₹${finalRefundTotal.toFixed(2)} via ${refundMethod}.`
    });

    return { success: true, refundRecord: newRefundRecord };
  }, [salesOrders, items, user, normalizePhone, addToast]);

  // Generate End-of-Day Z-Report Shift Reconciliation
  const generateZReport = useCallback((
    openingCash: number,
    countedCash: number,
    notes?: string
  ): ZReportRecord => {
    hasUserMutatedRef.current = true;
    const todayStr = new Date().toISOString().slice(0, 10);

    // Filter today's completed orders
    const todayOrders = salesOrders.filter((o) => {
      const oDate = o.timestamp ? o.timestamp.slice(0, 10) : '';
      return oDate === todayStr && o.status !== 'cancelled';
    });

    const totalOrdersCount = todayOrders.length;
    const totalUnitsSold = todayOrders.reduce((a, o) => a + o.totalUnits, 0);
    const grossSales = todayOrders.reduce((a, o) => a + o.subtotal, 0);
    const totalDiscounts = todayOrders.reduce((a, o) => a + o.discountTotal, 0);
    const taxCollected = todayOrders.reduce((a, o) => a + o.tax, 0);
    const grandTotal = todayOrders.reduce((a, o) => a + o.total, 0);
    const netSales = grossSales - totalDiscounts;

    // Payment breakdown
    let cashSales = 0;
    let upiSales = 0;
    let cardSales = 0;
    let splitSales = 0;

    todayOrders.forEach((o) => {
      if (o.paymentMethod === 'CASH') cashSales += o.total;
      else if (o.paymentMethod === 'UPI') upiSales += o.total;
      else if (o.paymentMethod === 'CARD') cardSales += o.total;
      else if (o.paymentMethod === 'SPLIT' && o.paymentBreakdown) {
        cashSales += o.paymentBreakdown.cash || 0;
        upiSales += o.paymentBreakdown.upi || 0;
        cardSales += o.paymentBreakdown.card || 0;
        splitSales += o.total;
      } else {
        cashSales += o.total;
      }
    });

    // Today's refunds
    const todayRefunds = refundRecords.filter((r) => r.timestamp.slice(0, 10) === todayStr);
    const refundsCount = todayRefunds.length;
    const totalRefundsAmount = todayRefunds.reduce((a, r) => a + r.totalRefundAmount, 0);
    const cashRefunds = todayRefunds
      .filter((r) => r.refundMethod === 'CASH')
      .reduce((a, r) => a + r.totalRefundAmount, 0);

    const expectedCash = Math.round((openingCash + cashSales - cashRefunds) * 100) / 100;
    const discrepancy = Math.round((countedCash - expectedCash) * 100) / 100;

    // Top selling items
    const itemMap: Record<string, { name: string; quantity: number; revenue: number }> = {};
    todayOrders.forEach((o) => {
      o.items.forEach((it) => {
        if (!itemMap[it.itemId]) {
          itemMap[it.itemId] = { name: it.itemName, quantity: 0, revenue: 0 };
        }
        itemMap[it.itemId].quantity += it.quantity;
        itemMap[it.itemId].revenue += it.total;
      });
    });

    const topSellingItems = Object.values(itemMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const zRecord: ZReportRecord = {
      id: 'zrep-' + Date.now(),
      reportDate: todayStr,
      generatedAt: new Date().toISOString(),
      storeName: storeName || 'Supermarket POS',
      totalOrdersCount,
      totalUnitsSold,
      grossSales: Math.round(grossSales * 100) / 100,
      totalDiscounts: Math.round(totalDiscounts * 100) / 100,
      netSales: Math.round(netSales * 100) / 100,
      taxCollected: Math.round(taxCollected * 100) / 100,
      grandTotal: Math.round(grandTotal * 100) / 100,
      paymentBreakdown: {
        cash: Math.round(cashSales * 100) / 100,
        upi: Math.round(upiSales * 100) / 100,
        card: Math.round(cardSales * 100) / 100,
        split: Math.round(splitSales * 100) / 100
      },
      cashDrawer: {
        openingCash,
        expectedCash,
        countedCash,
        discrepancy
      },
      refundsCount,
      totalRefundsAmount: Math.round(totalRefundsAmount * 100) / 100,
      topSellingItems,
      closedBy: user?.fullName || 'Store Manager',
      notes
    };

    setZReports((prev) => [zRecord, ...prev]);

    const mov: StockMovement = {
      id: 'mov-' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      itemId: zRecord.id,
      itemName: `Register Day Close (Z-Report)`,
      sku: todayStr,
      type: 'ADJUSTMENT',
      quantityDelta: 0,
      previousStock: 0,
      newStock: 0,
      reason: `Day-End Z-Report generated: Total Sales ₹${grandTotal.toFixed(2)}, Cash Discrepancy ₹${discrepancy >= 0 ? '+' : ''}${discrepancy.toFixed(2)}`,
      performedBy: user?.fullName || 'Store Manager',
      unitCost: 0,
      financialImpact: grandTotal
    };
    setStockMovements((prev) => [mov, ...prev]);

    addToast({
      type: discrepancy === 0 ? 'success' : discrepancy > 0 ? 'info' : 'warning',
      title: 'Day Close Z-Report Saved',
      message: `Shift closed. Register ${discrepancy === 0 ? 'Perfect Balanced' : discrepancy > 0 ? `Over by ₹${discrepancy}` : `Short by ₹${Math.abs(discrepancy)}`}.`
    });

    return zRecord;
  }, [salesOrders, refundRecords, storeName, user, addToast]);

  // Simulator Controls
  const advanceSimulatedDays = useCallback((days: number) => {
    setSimulatedDateOffset((prev) => prev + days);
    addToast({
      type: 'info',
      title: 'Simulated Date Advanced',
      message: `Store calendar fast-forwarded by ${days} day(s).`
    });
  }, [addToast]);

  const resetSimulatedDate = useCallback(() => {
    setSimulatedDateOffset(0);
    addToast({
      type: 'info',
      title: 'Time Reset',
      message: 'Simulation calendar reset to today.'
    });
  }, [addToast]);

  const wipeAllStoreData = useCallback(async () => {
    hasUserMutatedRef.current = true;
    setIsSyncing(true);

    try {
      // 1. Immediately wipe in-memory state
      setItems([]);
      setSuppliers([]);
      setPurchaseOrders([]);
      setStockMovements([]);
      setWastageLogs([]);
      setCustomers([]);
      setSalesOrders([]);
      setRefundRecords([]);
      setZReports([]);
      setStoreName('');
      setSimulatedDateOffset(0);

      // 2. Clear all local storage and IndexedDB caches
      if (typeof window !== 'undefined' && userId) {
        try {
          await clearOfflineStoreData(userId);
          localStorage.removeItem('myob_store_' + userId);
          localStorage.removeItem('myob_store_data_' + userId);
          localStorage.removeItem('myob_store_name_' + userId);
        } catch (e) {
          console.warn('Cache clear error:', e);
        }
      }

      // 3. Send DELETE request to MongoDB Atlas backend
      const res = await fetch('/api/store-data', {
        method: 'DELETE'
      });

      if (!res.ok) {
        throw new Error('Failed to delete cloud documents');
      }

      addToast({
        type: 'success',
        title: 'Store Data Permanently Wiped',
        message: 'All inventory, customers, purchase orders, sales history, and store settings were deleted.'
      });
    } catch (err: any) {
      console.error('Error wiping store data from database:', err);
      addToast({
        type: 'info',
        title: 'Store Cleared Locally',
        message: 'Store catalogue cleared. Backend will refresh on next connect.'
      });
    } finally {
      setIsSyncing(false);
    }
  }, [userId, addToast]);

  const resetToDemoData = useCallback(() => {
    wipeAllStoreData();
  }, [wipeAllStoreData]);

  return (
    <InventoryContext.Provider
      value={{
        items,
        suppliers,
        purchaseOrders,
        stockMovements,
        wastageLogs,
        customers,
        salesOrders,
        refundRecords,
        zReports,
        storeName,
        simulatedDateOffset,
        toasts,
        isLoadingData,
        isSyncing,
        updateStoreName,
        lookupCustomerByPhone,
        addOrUpdateCustomer,
        deleteCustomer,
        getDaysUntilExpiry,
        getEffectiveBatchStatus,
        getItemStatus,
        summary,
        addItem,
        updateItem,
        deleteItem,
        clearAllInventory,
        adjustStock,
        importBulkItems,
        applyBatchMarkdown,
        applySmartExpiryMarkdowns,
        writeOffBatch,
        createPurchaseOrder,
        updatePOStatus,
        receivePurchaseOrder,
        autoGenerateReorderPOs,
        processPOSSale,
        processOrderReturn,
        generateZReport,
        advanceSimulatedDays,
        resetSimulatedDate,
        wipeAllStoreData,
        resetToDemoData,
        seedSampleData,
        addToast,
        dismissToast
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = (): InventoryContextType => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
