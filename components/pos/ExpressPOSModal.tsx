'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { InventoryItem, POSCartItem, Customer } from '@/types/inventory';
import { 
  CreditCard, 
  Banknote, 
  Minus, 
  Plus, 
  Search, 
  ShoppingCart, 
  Trash2, 
  Smartphone, 
  X, 
  Check, 
  Tag, 
  QrCode, 
  Store, 
  Layers, 
  User, 
  UserPlus, 
  Phone, 
  Sparkles, 
  Building2, 
  MapPin, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Scale, 
  Split, 
  Coins, 
  AlertCircle,
  Monitor,
  Flame,
  Volume2,
  VolumeX
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ReceiptModal } from './ReceiptModal';
import { CustomerDisplayModal } from './CustomerDisplayModal';
import { formatINR } from '@/lib/currency';
import { soundFx } from '@/lib/soundEffects';

interface ExpressPOSModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExpressPOSModal: React.FC<ExpressPOSModalProps> = ({ isOpen, onClose }) => {
  const { 
    items, 
    processPOSSale, 
    lookupCustomerByPhone, 
    customers, 
    storeName,
    addToast
  } = useInventory();
  
  const [isCustomerDisplayOpen, setIsCustomerDisplayOpen] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [cart, setCart] = useState<POSCartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'cash' | 'card' | 'split'>('upi');

  // Cash Change Calculator State
  const [cashTendered, setCashTendered] = useState<string>('');

  // Split Payment State
  const [splitCash, setSplitCash] = useState<string>('');
  const [splitUpi, setSplitUpi] = useState<string>('');
  const [splitCard, setSplitCard] = useState<string>('');

  // Customer State
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerGstin, setCustomerGstin] = useState('');
  const [matchedCustomer, setMatchedCustomer] = useState<Customer | null>(null);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [isCustomerCollapsed, setIsCustomerCollapsed] = useState(false);

  // Weighed Item Modal State
  const [weighedItem, setWeighedItem] = useState<InventoryItem | null>(null);
  const [weighedQuantity, setWeighedQuantity] = useState<string>('1.000');

  // Search input ref for hardware scanner focus
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [completedOrder, setCompletedOrder] = useState<{
    orderId: string;
    items: POSCartItem[];
    subtotal: number;
    discountTotal: number;
    tax: number;
    total: number;
    paymentMethod: string;
    customer?: Customer | null;
  } | null>(null);

  // Live customer lookup on phone input change
  useEffect(() => {
    if (!customerPhone || customerPhone.trim().length < 4) {
      setMatchedCustomer(null);
      return;
    }

    const found = lookupCustomerByPhone(customerPhone);
    if (found) {
      setMatchedCustomer(found);
      setCustomerName(found.name);
      setCustomerEmail(found.email || '');
      setCustomerAddress(found.address || '');
      setCustomerGstin(found.gstin || '');
    } else {
      setMatchedCustomer(null);
    }
  }, [customerPhone, lookupCustomerByPhone]);

  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const categories = ['All', 'Fresh Produce', 'Dairy & Eggs', 'Bakery & Deli', 'Meat & Seafood', 'Beverages', 'Pantry & Dry Goods', 'Frozen Foods', 'Snacks & Confectionery', 'Household & Personal Care'];

  // Lazy Loading State
  const [visibleCount, setVisibleCount] = useState(32);

  useEffect(() => {
    setVisibleCount(32);
  }, [searchQuery, selectedCategory]);

  // Filter 100% of items in memory for search & barcode match
  const filteredItems = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return items.filter((item) => {
      const matchesSearch = !query || 
        item.name.toLowerCase().includes(query) ||
        item.barcode.toLowerCase().includes(query) ||
        item.sku.toLowerCase().includes(query);

      if (!matchesSearch) return false;
      if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
      return true;
    });
  }, [items, searchQuery, selectedCategory]);

  // Displayed slice for 60fps DOM lazy rendering
  const displayedItems = useMemo<InventoryItem[]>(() => {
    return filteredItems.slice(0, visibleCount);
  }, [filteredItems, visibleCount]);

  const handleGridScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 200) {
      if (visibleCount < filteredItems.length) {
        setVisibleCount((prev) => Math.min(prev + 32, filteredItems.length));
      }
    }
  };

  // Calculate pricing considering FIFO batch markdown
  const getItemEffectivePrice = (item: InventoryItem): {
    unitPrice: number;
    originalPrice: number;
    discountPercentage: number;
    batch?: typeof item['batches'][0];
  } => {
    const activeBatches = item.batches
      .filter((b) => b.quantity > 0)
      .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

    if (activeBatches.length > 0) {
      const earliestBatch = activeBatches[0];
      if (earliestBatch.markdownPercentage > 0) {
        const discounted = earliestBatch.markdownPrice || (item.sellingPrice * (1 - earliestBatch.markdownPercentage / 100));
        return {
          unitPrice: Math.round(discounted * 100) / 100,
          originalPrice: item.sellingPrice,
          discountPercentage: earliestBatch.markdownPercentage,
          batch: earliestBatch
        };
      }
    }

    return {
      unitPrice: item.sellingPrice,
      originalPrice: item.sellingPrice,
      discountPercentage: 0,
      batch: activeBatches[0]
    };
  };

  const isWeighedItem = (item: InventoryItem) => {
    const unit = item.unit.toLowerCase();
    return unit === 'kg' || unit === 'g' || unit === 'gram' || unit === 'grams' || unit === 'litre' || unit === 'litres' || unit === 'l';
  };

  const handleAddToCart = (item: InventoryItem, customQty?: number) => {
    if (item.currentStock <= 0) {
      addToast({
        type: 'warning',
        title: 'Out of Stock',
        message: `"${item.name}" has 0 stock available.`
      });
      return;
    }

    // If it's a weighed item and no customQty passed, open weighed scale input
    if (isWeighedItem(item) && customQty === undefined) {
      setWeighedItem(item);
      setWeighedQuantity('0.500');
      return;
    }

    const qtyToAdd = customQty !== undefined ? customQty : 1;
    const priceInfo = getItemEffectivePrice(item);
    const existingIndex = cart.findIndex((c) => c.item.id === item.id);

    // Audio feedback
    soundFx.playScanBeep();

    if (existingIndex !== -1) {
      const existing = cart[existingIndex];
      const newQty = Math.round((existing.quantity + qtyToAdd) * 1000) / 1000;
      if (newQty > item.currentStock) {
        soundFx.playErrorThud();
        addToast({
          type: 'warning',
          title: 'Max Stock Exceeded',
          message: `Only ${item.currentStock} ${item.unit} available in stock.`
        });
        return;
      }

      const updatedCart = [...cart];
      updatedCart[existingIndex] = {
        ...existing,
        quantity: newQty,
        total: Math.round(newQty * existing.unitPrice * 100) / 100
      };
      setCart(updatedCart);
    } else {
      const newCartItem: POSCartItem = {
        item,
        quantity: qtyToAdd,
        unitPrice: priceInfo.unitPrice,
        appliedDiscountPercentage: priceInfo.discountPercentage,
        total: Math.round(qtyToAdd * priceInfo.unitPrice * 100) / 100,
        batch: priceInfo.batch
      };
      setCart([...cart, newCartItem]);
    }
  };

  // Hardware Barcode Scanner Handler (Auto-Add on Enter)
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      const exactMatch = items.find(
        (it) => it.barcode.toLowerCase() === searchQuery.trim().toLowerCase() ||
                it.sku.toLowerCase() === searchQuery.trim().toLowerCase()
      );

      if (exactMatch) {
        handleAddToCart(exactMatch);
        setSearchQuery('');
      } else {
        soundFx.playErrorThud();
      }
    }
  };

  const handleUpdateQuantity = (index: number, delta: number) => {
    const target = cart[index];
    const step = isWeighedItem(target.item) ? 0.25 : 1;
    const newQty = Math.round((target.quantity + (delta > 0 ? step : -step)) * 1000) / 1000;

    if (newQty <= 0) {
      handleRemoveFromCart(index);
      soundFx.playCartTick();
      return;
    }

    if (newQty > target.item.currentStock) {
      soundFx.playErrorThud();
      return;
    }

    soundFx.playCartTick();
    const updatedCart = [...cart];
    updatedCart[index] = {
      ...target,
      quantity: newQty,
      total: Math.round(newQty * target.unitPrice * 100) / 100
    };
    setCart(updatedCart);
  };

  const handleDirectQuantityChange = (index: number, valStr: string) => {
    const val = parseFloat(valStr);
    const target = cart[index];
    if (isNaN(val) || val <= 0) return;

    const newQty = Math.min(val, target.item.currentStock);
    const updatedCart = [...cart];
    updatedCart[index] = {
      ...target,
      quantity: newQty,
      total: Math.round(newQty * target.unitPrice * 100) / 100
    };
    setCart(updatedCart);
  };

  const handleRemoveFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
    soundFx.playCartTick();
  };

  const handleClearCart = () => {
    setCart([]);
    setCashTendered('');
    setSplitCash('');
    setSplitUpi('');
    setSplitCard('');
  };

  const handleClearCustomer = () => {
    setCustomerPhone('');
    setCustomerName('');
    setCustomerEmail('');
    setCustomerAddress('');
    setCustomerGstin('');
    setMatchedCustomer(null);
    setShowCustomerForm(false);
  };

  // Smart Upsell Recommendations (Complementary fast-moving items not in cart)
  const upsellRecommendations = useMemo(() => {
    if (cart.length === 0) return [];
    const inCartIds = new Set(cart.map((c) => c.item.id));
    return items
      .filter((it) => !inCartIds.has(it.id) && it.currentStock > 0)
      .slice(0, 5);
  }, [cart, items]);

  // Calculations
  const subtotal = cart.reduce((acc, curr) => acc + (curr.quantity * curr.item.sellingPrice), 0);
  const totalAfterDiscount = cart.reduce((acc, curr) => acc + curr.total, 0);
  const discountTotal = Math.round((subtotal - totalAfterDiscount) * 100) / 100;
  const tax = Math.round(totalAfterDiscount * 0.05 * 100) / 100; // 5% GST
  const grandTotal = Math.round((totalAfterDiscount + tax) * 100) / 100;

  // Cash Change Calculation
  const parsedCashTendered = parseFloat(cashTendered) || 0;
  const cashChangeDue = Math.max(0, Math.round((parsedCashTendered - grandTotal) * 100) / 100);

  // Split Tender Calculation
  const parsedSplitCash = parseFloat(splitCash) || 0;
  const parsedSplitUpi = parseFloat(splitUpi) || 0;
  const parsedSplitCard = parseFloat(splitCard) || 0;
  const totalSplitTendered = Math.round((parsedSplitCash + parsedSplitUpi + parsedSplitCard) * 100) / 100;
  const splitRemainingBalance = Math.round((grandTotal - totalSplitTendered) * 100) / 100;

  const handleCheckout = () => {
    if (cart.length === 0) return;

    // Validate Cash Tender
    if (paymentMethod === 'cash' && parsedCashTendered < grandTotal && parsedCashTendered > 0) {
      soundFx.playErrorThud();
      addToast({
        type: 'warning',
        title: 'Insufficient Cash Tendered',
        message: `Tendered amount (₹${parsedCashTendered}) is less than Total (₹${grandTotal}).`
      });
      return;
    }

    // Validate Split Tender
    if (paymentMethod === 'split' && splitRemainingBalance !== 0) {
      soundFx.playErrorThud();
      addToast({
        type: 'warning',
        title: 'Split Payment Unbalanced',
        message: splitRemainingBalance > 0 
          ? `Remaining balance of ₹${splitRemainingBalance} must be allocated.`
          : `Split sum exceeds total by ₹${Math.abs(splitRemainingBalance)}.`
      });
      return;
    }

    // Prepare customer payload if phone is given
    const customerPayload = customerPhone.trim() ? {
      phone: customerPhone.trim(),
      name: customerName.trim() || 'Valued Customer',
      email: customerEmail.trim() || undefined,
      address: customerAddress.trim() || undefined,
      gstin: customerGstin.trim() || undefined
    } : null;

    // Payment details payload
    const paymentDetails = {
      paymentBreakdown: paymentMethod === 'split' ? {
        cash: parsedSplitCash,
        upi: parsedSplitUpi,
        card: parsedSplitCard
      } : paymentMethod === 'cash' ? { cash: grandTotal } : paymentMethod === 'upi' ? { upi: grandTotal } : { card: grandTotal },
      cashChange: paymentMethod === 'cash' ? {
        tendered: parsedCashTendered || grandTotal,
        changeDue: cashChangeDue
      } : undefined
    };

    const result = processPOSSale(cart, paymentMethod.toUpperCase(), customerPayload, paymentDetails);
    if (result.success) {
      soundFx.playCheckoutChime();
      setCompletedOrder({
        orderId: result.orderId,
        items: [...cart],
        subtotal,
        discountTotal,
        tax,
        total: grandTotal,
        paymentMethod: paymentMethod.toUpperCase(),
        customer: result.customer || null
      });
      setCart([]);
      setCashTendered('');
      setSplitCash('');
      setSplitUpi('');
      setSplitCard('');
      handleClearCustomer();
    } else {
      soundFx.playErrorThud();
    }
  };

  if (!isOpen && !completedOrder) return null;

  return (
    <>
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative flex h-[94vh] max-h-[920px] w-full max-w-[96vw] xl:max-w-7xl flex-col lg:flex-row overflow-hidden rounded-2xl border border-white/[0.08] bg-[#09090b] shadow-2xl z-10"
          >
            {/* Left Panel: Catalog Browser & Quick Barcode Scanner */}
            <div className="flex flex-1 flex-col min-w-0 min-h-0 border-b lg:border-b-0 lg:border-r border-white/[0.06] bg-[#0c0c0e]">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/[0.06] p-3.5 sm:p-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Store className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
                      <span>Express Checkout Counter</span>
                      <span className="rounded-md bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 border border-zinc-700">
                        {storeName || 'Supermarket POS'}
                      </span>
                    </h3>
                    <p className="text-[11px] text-zinc-400">
                      Scan barcodes directly or tap products to bill
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCustomerDisplayOpen(true)}
                    className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-zinc-900 px-2.5 py-1.5 text-xs font-heading font-semibold text-zinc-200 hover:bg-zinc-800 hover:text-white transition-all cursor-pointer shadow-sm"
                    title="Open Customer-Facing Dual Screen with Live UPI QR"
                  >
                    <Monitor className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="hidden md:inline">Customer Display</span>
                  </button>

                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-zinc-500 bg-zinc-900 px-2 py-1 rounded-md border border-white/[0.04]">
                    <span>Enter ➔ Auto-Add</span>
                  </span>
                  <button
                    onClick={onClose}
                    className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Search & Category Filter */}
              <div className="p-3.5 space-y-2.5 border-b border-white/[0.06] bg-zinc-950/40">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Scan Barcode (Laser Reader) or search product name / SKU..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    className="w-full rounded-xl border border-white/[0.06] bg-zinc-900/80 pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-medium transition-all cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-sm'
                          : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Grid */}
              <div 
                onScroll={handleGridScroll}
                className="flex-1 overflow-y-auto min-h-0 p-3.5 space-y-4"
              >
                {filteredItems.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center text-zinc-500">
                    <p className="text-xs">No products match your search.</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5">
                      {displayedItems.map((item) => {
                        const priceInfo = getItemEffectivePrice(item);
                        const isOutOfStock = item.currentStock <= 0;
                        const hasMarkdown = priceInfo.discountPercentage > 0;
                        const isWeighed = isWeighedItem(item);

                        return (
                          <button
                            key={item.id}
                            disabled={isOutOfStock}
                            onClick={() => handleAddToCart(item)}
                            className={`flex flex-col text-left rounded-xl border p-3 transition-all relative overflow-hidden group cursor-pointer ${
                              isOutOfStock
                                ? 'border-white/[0.02] bg-zinc-900/20 opacity-40 cursor-not-allowed'
                                : 'border-white/[0.05] bg-zinc-900/40 hover:bg-zinc-800/60 hover:border-white/[0.1] active:scale-[0.98]'
                            }`}
                          >
                            {hasMarkdown && (
                              <span className="absolute top-2 right-2 flex items-center gap-0.5 rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-400 border border-amber-500/30">
                                <Tag className="h-2 w-2" />
                                -{priceInfo.discountPercentage}%
                              </span>
                            )}

                            {isWeighed && (
                              <span className="absolute top-2 left-2 flex items-center gap-0.5 rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-300 border border-emerald-500/30 font-mono">
                                <Scale className="h-2 w-2" />
                                Weighed
                              </span>
                            )}

                            <div className={`text-xs font-medium text-zinc-200 line-clamp-2 ${isWeighed ? 'mt-4' : ''}`}>
                              {item.name}
                            </div>
                            
                            <div className="text-[10px] text-zinc-500 font-mono mt-1">
                              {item.sku}
                            </div>

                            <div className="mt-auto pt-2 flex items-end justify-between">
                              <div>
                                <div className="text-xs font-bold font-mono text-emerald-400">
                                  {formatINR(priceInfo.unitPrice)}
                                  <span className="text-[10px] text-zinc-500 font-normal"> / {item.unit}</span>
                                </div>
                                {hasMarkdown && (
                                  <div className="text-[10px] text-zinc-500 line-through font-mono">
                                    {formatINR(priceInfo.originalPrice)}
                                  </div>
                                )}
                              </div>

                              <span className="text-[10px] font-mono text-zinc-400">
                                Stock: {item.currentStock}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {visibleCount < filteredItems.length && (
                      <div className="py-2.5 text-center text-[11px] font-mono text-zinc-500 flex items-center justify-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Showing {displayedItems.length} of {filteredItems.length} products (Scroll down to load more)</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Right Panel: POS Cart, Customer Enrollment, Change Return & Split Tender */}
            <div className="flex w-full lg:w-[380px] xl:w-[420px] flex-col bg-zinc-950 shrink-0 min-h-0 border-l border-white/[0.06]">
              {/* Customer Linkage / Mobile Fast-Lookup Strip */}
              <div className="border-b border-white/[0.06] bg-zinc-900/70 p-3 space-y-2 shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                    <User className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Customer Details</span>
                    {matchedCustomer && (
                      <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                        {matchedCustomer.totalOrders} visits
                      </span>
                    )}
                  </div>

                  {customerPhone && (
                    <button
                      onClick={handleClearCustomer}
                      className="text-[10px] text-zinc-500 hover:text-zinc-300 cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="relative">
                    <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                    <input
                      type="tel"
                      placeholder="Customer Mobile No. (e.g. 9876...)"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full rounded-lg border border-white/[0.08] bg-zinc-950 pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none font-mono"
                    />
                  </div>

                  {matchedCustomer ? (
                    <div className="space-y-1.5">
                      <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-2 flex items-center justify-between text-xs">
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="font-semibold text-emerald-300 truncate">{matchedCustomer.name}</div>
                          <div className="text-[10px] text-zinc-400 truncate">
                            {matchedCustomer.gstin ? `GST: ${matchedCustomer.gstin}` : 'Retail Member'} • Lifetime: {formatINR(matchedCustomer.totalSpent)}
                          </div>
                          {matchedCustomer.address && (
                            <div className="text-[10px] text-zinc-500 truncate mt-0.5">
                              📍 {matchedCustomer.address}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => setShowCustomerForm(!showCustomerForm)}
                            className="rounded px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 hover:text-white bg-zinc-900 border border-white/[0.08] cursor-pointer"
                            title="Edit customer details"
                          >
                            {showCustomerForm ? 'Hide' : 'Edit'}
                          </button>
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        </div>
                      </div>

                      {/* Expanded Editable Fields for Existing Customer */}
                      {showCustomerForm && (
                        <div className="rounded-lg border border-white/[0.08] bg-zinc-950 p-2 space-y-1.5 text-xs animate-fadeIn">
                          <div className="text-[10px] font-semibold text-zinc-400 font-mono">
                            Update Customer Profile:
                          </div>
                          <input
                            type="text"
                            placeholder="Customer Full Name"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="w-full rounded border border-white/[0.08] bg-zinc-900 px-2 py-1 text-xs text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                          />
                          <div className="grid grid-cols-2 gap-1.5">
                            <input
                              type="text"
                              placeholder="GSTIN (e.g. 29ABCDE...)"
                              value={customerGstin}
                              onChange={(e) => setCustomerGstin(e.target.value.toUpperCase())}
                              className="w-full rounded border border-white/[0.08] bg-zinc-900 px-2 py-1 text-xs text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none font-mono"
                            />
                            <input
                              type="email"
                              placeholder="Email (for e-receipt)"
                              value={customerEmail}
                              onChange={(e) => setCustomerEmail(e.target.value)}
                              className="w-full rounded border border-white/[0.08] bg-zinc-900 px-2 py-1 text-xs text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                            />
                          </div>
                          <input
                            type="text"
                            placeholder="Billing Address / City (Optional)"
                            value={customerAddress}
                            onChange={(e) => setCustomerAddress(e.target.value)}
                            className="w-full rounded border border-white/[0.08] bg-zinc-900 px-2 py-1 text-xs text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                      )}
                    </div>
                  ) : customerPhone.trim().length >= 4 && (
                    <div className="space-y-1.5 pt-0.5">
                      <input
                        type="text"
                        placeholder="Customer Full Name (New Member)"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full rounded-lg border border-white/[0.08] bg-zinc-950 px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                      />

                      {/* Additional Details Toggle for New Customer */}
                      <div className="pt-0.5">
                        <button
                          type="button"
                          onClick={() => setShowCustomerForm(!showCustomerForm)}
                          className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-emerald-400 font-medium transition-colors cursor-pointer"
                        >
                          <ChevronDown className={`h-3 w-3 transition-transform ${showCustomerForm ? 'rotate-180 text-emerald-400' : ''}`} />
                          <span>{showCustomerForm ? 'Hide Additional Details' : '+ Add GSTIN, Email & Address'}</span>
                          {(customerGstin || customerEmail || customerAddress) && (
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          )}
                        </button>

                        {(showCustomerForm || customerGstin || customerEmail || customerAddress) && (
                          <div className="rounded-lg border border-white/[0.06] bg-zinc-950 p-2 space-y-1.5 mt-1.5 animate-fadeIn">
                            <div className="grid grid-cols-2 gap-1.5">
                              <input
                                type="text"
                                placeholder="GSTIN (B2B Tax)"
                                value={customerGstin}
                                onChange={(e) => setCustomerGstin(e.target.value.toUpperCase())}
                                className="w-full rounded border border-white/[0.08] bg-zinc-900 px-2 py-1 text-[11px] text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none font-mono"
                              />
                              <input
                                type="email"
                                placeholder="Email (E-Receipt)"
                                value={customerEmail}
                                onChange={(e) => setCustomerEmail(e.target.value)}
                                className="w-full rounded border border-white/[0.08] bg-zinc-900 px-2 py-1 text-[11px] text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                              />
                            </div>
                            <input
                              type="text"
                              placeholder="Billing Address / City (Optional)"
                              value={customerAddress}
                              onChange={(e) => setCustomerAddress(e.target.value)}
                              className="w-full rounded border border-white/[0.08] bg-zinc-900 px-2 py-1 text-[11px] text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Cart Items List */}
              <div className="flex-1 overflow-y-auto min-h-0 p-3 space-y-2 bg-[#09090b]">
                {cart.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center text-zinc-500 p-6">
                    <div className="h-12 w-12 rounded-2xl bg-zinc-900 border border-white/[0.06] flex items-center justify-center mb-2.5">
                      <ShoppingCart className="h-5 w-5 text-zinc-600" />
                    </div>
                    <p className="text-xs font-medium text-zinc-400">Your cart is empty</p>
                    <p className="text-[11px] text-zinc-600 mt-1 max-w-[200px]">
                      Scan barcode or tap products on the left.
                    </p>
                  </div>
                ) : (
                  cart.map((cartItem, idx) => (
                    <div
                      key={`${cartItem.item.id}-${idx}`}
                      className="rounded-xl border border-white/[0.04] bg-zinc-900/50 p-2.5 space-y-2 hover:border-white/[0.08] transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h5 className="text-xs font-medium text-white truncate">
                            {cartItem.item.name}
                          </h5>
                          <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                            {formatINR(cartItem.unitPrice)} / {cartItem.item.unit}
                            {cartItem.appliedDiscountPercentage > 0 && (
                              <span className="text-amber-400 font-medium ml-1">
                                (-{cartItem.appliedDiscountPercentage}%)
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-xs font-mono font-semibold text-white whitespace-nowrap">
                          {formatINR(cartItem.total)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between border-t border-white/[0.03] pt-2">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleUpdateQuantity(idx, -1)}
                            className="flex h-6 w-6 items-center justify-center rounded-lg border border-white/[0.06] bg-zinc-800 text-zinc-300 hover:bg-zinc-700 active:scale-95 cursor-pointer"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          
                          <input
                            type="number"
                            step={isWeighedItem(cartItem.item) ? '0.05' : '1'}
                            min="0.01"
                            max={cartItem.item.currentStock}
                            value={cartItem.quantity}
                            onChange={(e) => handleDirectQuantityChange(idx, e.target.value)}
                            className="w-14 text-center font-mono text-xs text-white font-bold bg-zinc-950 border border-white/[0.08] rounded py-0.5"
                          />

                          <button
                            onClick={() => handleUpdateQuantity(idx, 1)}
                            disabled={cartItem.quantity >= cartItem.item.currentStock}
                            className="flex h-6 w-6 items-center justify-center rounded-lg border border-white/[0.06] bg-zinc-800 text-zinc-300 hover:bg-zinc-700 active:scale-95 disabled:opacity-40 cursor-pointer"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                          <span className="text-[10px] text-zinc-500">{cartItem.item.unit}</span>
                        </div>

                        <button
                          onClick={() => handleRemoveFromCart(idx)}
                          className="text-zinc-500 hover:text-rose-400 p-1 transition-colors cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Smart Upsell Recommendations Bar */}
              {cart.length > 0 && upsellRecommendations.length > 0 && (
                <div className="border-t border-white/[0.04] bg-zinc-950/60 p-2.5 space-y-1.5 shrink-0">
                  <div className="flex items-center justify-between text-[11px] font-heading font-semibold text-amber-300">
                    <span className="flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-amber-400" />
                      Frequently Paired with Basket
                    </span>
                    <span className="text-[9px] font-mono text-zinc-500 uppercase">AI Upsell</span>
                  </div>
                  <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
                    {upsellRecommendations.map((up) => (
                      <button
                        key={up.id}
                        type="button"
                        onClick={() => handleAddToCart(up)}
                        className="flex items-center gap-1.5 rounded-xl border border-white/[0.06] bg-zinc-900/90 px-2.5 py-1 text-[11px] text-zinc-200 hover:bg-zinc-800 hover:border-amber-500/30 transition-all shrink-0 cursor-pointer shadow-sm group"
                      >
                        <span className="truncate max-w-[110px] font-medium">{up.name}</span>
                        <span className="font-mono font-bold text-amber-400">{formatINR(up.sellingPrice)}</span>
                        <Plus className="h-3 w-3 text-zinc-400 group-hover:text-white" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Checkout Controls (Pinned Bottom) */}
              <div className="border-t border-white/[0.08] bg-zinc-950 p-3.5 space-y-2.5 shrink-0">
                {/* Financial Breakdown */}
                <div className="space-y-1 text-xs text-zinc-400">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-mono text-zinc-200">{formatINR(subtotal)}</span>
                  </div>
                  {discountTotal > 0 && (
                    <div className="flex justify-between text-amber-400">
                      <span>Markdown Savings</span>
                      <span className="font-mono">-{formatINR(discountTotal)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[11px] text-zinc-500">
                    <span>GST (5%)</span>
                    <span className="font-mono">{formatINR(tax)}</span>
                  </div>
                  <div className="flex justify-between border-t border-white/[0.06] pt-1.5 text-sm font-semibold text-white">
                    <span>Total Payable</span>
                    <span className="font-mono text-emerald-400 text-base">{formatINR(grandTotal)}</span>
                  </div>
                </div>

                {/* Tender Method Selector */}
                <div className="grid grid-cols-4 gap-1">
                  {[
                    { id: 'upi', label: 'UPI / QR', icon: <QrCode className="h-3 w-3" /> },
                    { id: 'cash', label: 'Cash', icon: <Banknote className="h-3 w-3" /> },
                    { id: 'card', label: 'Card', icon: <CreditCard className="h-3 w-3" /> },
                    { id: 'split', label: 'Split', icon: <Split className="h-3 w-3" /> }
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`flex flex-col items-center justify-center gap-0.5 rounded-lg border py-1.5 text-[10px] font-medium transition-all cursor-pointer ${
                        paymentMethod === m.id
                          ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300 font-bold'
                          : 'border-white/[0.04] bg-zinc-900/60 text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {m.icon}
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>

                {/* Cash Change Calculator Panel */}
                {paymentMethod === 'cash' && (
                  <div className="rounded-xl border border-white/[0.08] bg-zinc-950 p-2.5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400 flex items-center gap-1 font-medium">
                        <Coins className="h-3.5 w-3.5 text-amber-400" />
                        Cash Tendered:
                      </span>
                      <input
                        type="number"
                        placeholder={`₹${grandTotal}`}
                        value={cashTendered}
                        onChange={(e) => setCashTendered(e.target.value)}
                        className="w-24 text-right font-mono text-xs font-bold text-white bg-zinc-900 border border-white/[0.1] rounded px-2 py-1 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    {/* Quick Currency Note Buttons */}
                    <div className="flex gap-1 overflow-x-auto scrollbar-none">
                      {[grandTotal, 100, 200, 500, 1000, 2000].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setCashTendered(amt.toString())}
                          className="rounded bg-zinc-900 px-2 py-0.5 text-[10px] font-mono text-zinc-300 hover:bg-zinc-800 hover:text-white border border-white/[0.04]"
                        >
                          {amt === grandTotal ? 'Exact' : `₹${amt}`}
                        </button>
                      ))}
                    </div>

                    {/* Return Change Banner */}
                    {parsedCashTendered >= grandTotal && (
                      <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2 flex items-center justify-between text-xs">
                        <span className="text-zinc-300 font-medium">Return Change:</span>
                        <span className="font-mono text-sm font-bold text-emerald-400">
                          {formatINR(cashChangeDue)}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Split Payment Panel */}
                {paymentMethod === 'split' && (
                  <div className="rounded-xl border border-white/[0.08] bg-zinc-950 p-2.5 space-y-2 text-xs">
                    <div className="text-[11px] font-semibold text-zinc-400 flex justify-between">
                      <span>Split Tender Allocation</span>
                      <span className={splitRemainingBalance === 0 ? 'text-emerald-400 font-mono' : 'text-amber-400 font-mono'}>
                        {splitRemainingBalance === 0 ? 'Balanced ✅' : `Remaining: ₹${splitRemainingBalance}`}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5">
                      <div>
                        <label className="text-[10px] text-zinc-500">Cash</label>
                        <input
                          type="number"
                          placeholder="0"
                          value={splitCash}
                          onChange={(e) => setSplitCash(e.target.value)}
                          className="w-full rounded bg-zinc-900 border border-white/[0.08] px-2 py-1 text-xs text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-zinc-500">UPI</label>
                        <input
                          type="number"
                          placeholder="0"
                          value={splitUpi}
                          onChange={(e) => setSplitUpi(e.target.value)}
                          className="w-full rounded bg-zinc-900 border border-white/[0.08] px-2 py-1 text-xs text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-zinc-500">Card</label>
                        <input
                          type="number"
                          placeholder="0"
                          value={splitCard}
                          onChange={(e) => setSplitCard(e.target.value)}
                          className="w-full rounded bg-zinc-900 border border-white/[0.08] px-2 py-1 text-xs text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Main Charge Button */}
                <button
                  onClick={handleCheckout}
                  disabled={cart.length === 0 || (paymentMethod === 'split' && splitRemainingBalance !== 0)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-100 py-3 text-xs font-bold text-zinc-900 hover:bg-white active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg cursor-pointer"
                >
                  <Check className="h-4 w-4" />
                  <span>
                    Charge {formatINR(grandTotal)}
                    {paymentMethod === 'cash' && cashChangeDue > 0 ? ` (Change: ${formatINR(cashChangeDue)})` : ''}
                  </span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>

      {/* Weighed Item Modal (Scale Input for Fruits / Veggies / Grains) */}
      <AnimatePresence>
        {weighedItem && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setWeighedItem(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm rounded-2xl border border-white/[0.1] bg-zinc-950 p-5 shadow-2xl z-10 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Scale className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{weighedItem.name}</h4>
                    <p className="text-[10px] text-zinc-400 font-mono">
                      Rate: {formatINR(weighedItem.sellingPrice)} / {weighedItem.unit}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setWeighedItem(null)}
                  className="rounded-lg p-1 text-zinc-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Enter Net Weight ({weighedItem.unit})
                  </label>
                  <input
                    type="number"
                    step="0.005"
                    min="0.005"
                    max={weighedItem.currentStock}
                    value={weighedQuantity}
                    onChange={(e) => setWeighedQuantity(e.target.value)}
                    className="w-full text-center font-mono text-xl font-bold rounded-xl border border-white/[0.1] bg-zinc-900 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Quick Weight Chips */}
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { label: '100g', val: '0.100' },
                    { label: '250g', val: '0.250' },
                    { label: '500g', val: '0.500' },
                    { label: '1.0kg', val: '1.000' }
                  ].map((chip) => (
                    <button
                      key={chip.val}
                      type="button"
                      onClick={() => setWeighedQuantity(chip.val)}
                      className="rounded-lg border border-white/[0.06] bg-zinc-900 py-1.5 text-xs font-mono font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>

                {/* Calculated Item Total Preview */}
                <div className="rounded-xl bg-zinc-900/60 p-2.5 flex items-center justify-between text-xs">
                  <span className="text-zinc-400">Total Price:</span>
                  <span className="font-mono text-sm font-bold text-emerald-400">
                    {formatINR(Math.round((parseFloat(weighedQuantity) || 0) * weighedItem.sellingPrice * 100) / 100)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const qty = parseFloat(weighedQuantity);
                    if (qty > 0) {
                      handleAddToCart(weighedItem, qty);
                      setWeighedItem(null);
                    }
                  }}
                  className="w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 active:scale-95 transition-all shadow-md"
                >
                  Add to Cart ({weighedQuantity} {weighedItem.unit})
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Customer-Facing Live Display */}
      {isCustomerDisplayOpen && (
        <CustomerDisplayModal
          isOpen={isCustomerDisplayOpen}
          onClose={() => setIsCustomerDisplayOpen(false)}
          cart={cart}
          subtotal={subtotal}
          discountTotal={discountTotal}
          tax={tax}
          total={grandTotal}
          customer={matchedCustomer || (customerPhone ? { name: customerName || 'Valued Customer', phone: customerPhone } : null)}
          storeName={storeName}
        />
      )}

      {completedOrder && (
        <ReceiptModal
          isOpen={!!completedOrder}
          onClose={() => setCompletedOrder(null)}
          orderId={completedOrder.orderId}
          items={completedOrder.items}
          subtotal={completedOrder.subtotal}
          discountTotal={completedOrder.discountTotal}
          tax={completedOrder.tax}
          total={completedOrder.total}
          paymentMethod={completedOrder.paymentMethod}
          customer={completedOrder.customer}
        />
      )}
    </>
  );
};
