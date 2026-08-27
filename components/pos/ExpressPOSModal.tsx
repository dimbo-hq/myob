'use client';

import React, { useState, useEffect } from 'react';
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
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ReceiptModal } from './ReceiptModal';
import { formatINR } from '@/lib/currency';

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
    storeName 
  } = useInventory();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [cart, setCart] = useState<POSCartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'cash' | 'card'>('upi');

  // Customer State
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerGstin, setCustomerGstin] = useState('');
  const [matchedCustomer, setMatchedCustomer] = useState<Customer | null>(null);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [isCustomerCollapsed, setIsCustomerCollapsed] = useState(false);

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

  if (!isOpen && !completedOrder) return null;

  const categories = ['All', 'Fresh Produce', 'Dairy & Eggs', 'Bakery & Deli', 'Meat & Seafood', 'Beverages', 'Pantry & Dry Goods', 'Frozen Foods', 'Snacks & Confectionery', 'Household & Personal Care'];

  // Filter items
  const filteredItems = items.filter((item) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = item.name.toLowerCase().includes(query) ||
      item.barcode.includes(query) ||
      item.sku.toLowerCase().includes(query);

    if (!matchesSearch) return false;
    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
    return true;
  });

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

  const handleAddToCart = (item: InventoryItem) => {
    if (item.currentStock <= 0) return;

    const priceInfo = getItemEffectivePrice(item);
    const existingIndex = cart.findIndex((c) => c.item.id === item.id);

    if (existingIndex !== -1) {
      const existing = cart[existingIndex];
      if (existing.quantity >= item.currentStock) return;

      const newQty = existing.quantity + 1;
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
        quantity: 1,
        unitPrice: priceInfo.unitPrice,
        appliedDiscountPercentage: priceInfo.discountPercentage,
        total: priceInfo.unitPrice,
        batch: priceInfo.batch
      };
      setCart([...cart, newCartItem]);
    }
  };

  const handleUpdateQuantity = (index: number, delta: number) => {
    const target = cart[index];
    const newQty = target.quantity + delta;

    if (newQty <= 0) {
      handleRemoveFromCart(index);
      return;
    }

    if (newQty > target.item.currentStock) return;

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
  };

  const handleClearCart = () => {
    setCart([]);
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

  // Calculations
  const subtotal = cart.reduce((acc, curr) => acc + (curr.quantity * curr.item.sellingPrice), 0);
  const totalAfterDiscount = cart.reduce((acc, curr) => acc + curr.total, 0);
  const discountTotal = Math.round((subtotal - totalAfterDiscount) * 100) / 100;
  const tax = Math.round(totalAfterDiscount * 0.05 * 100) / 100; // 5% GST
  const grandTotal = Math.round((totalAfterDiscount + tax) * 100) / 100;

  const handleCheckout = () => {
    if (cart.length === 0) return;

    // Prepare customer payload if phone is given
    const customerPayload = customerPhone.trim() ? {
      phone: customerPhone.trim(),
      name: customerName.trim() || 'Valued Customer',
      email: customerEmail.trim() || undefined,
      address: customerAddress.trim() || undefined,
      gstin: customerGstin.trim() || undefined
    } : null;

    const result = processPOSSale(cart, paymentMethod.toUpperCase(), customerPayload);
    if (result.success) {
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
      handleClearCustomer();
    }
  };

  return (
    <>
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
          />

          {/* POS Window */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            className="relative flex flex-col md:flex-row h-[92vh] w-full max-w-6xl overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d0d10] shadow-2xl z-10"
          >
            {/* LEFT SIDE: Catalog & Search (Flexible width with min-w-0) */}
            <div className="flex-1 min-w-0 flex flex-col border-r border-white/[0.06] bg-[#0d0d10] h-full overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3 bg-[#09090b]/80 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <ShoppingCart className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
                      Express POS Register
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {storeName || 'Store Terminal'}
                      </span>
                    </h2>
                    <p className="text-[11px] text-zinc-500">
                      Select items to build order & link customer by mobile number
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={onClose}
                    className="flex md:hidden rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Search & Category Filter */}
              <div className="p-3 border-b border-white/[0.04] space-y-2 bg-zinc-950/60 shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Search product name, barcode (890...), SKU..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="w-full rounded-xl border border-white/[0.06] bg-zinc-900/90 pl-8 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-zinc-400 focus:outline-none transition-colors"
                  />
                </div>

                <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`whitespace-nowrap rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${
                        selectedCategory === cat
                          ? 'bg-zinc-200 text-zinc-950 font-semibold shadow-sm'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Grid */}
              <div className="flex-1 overflow-y-auto p-3.5 grid grid-cols-2 lg:grid-cols-3 gap-2.5 content-start">
                {filteredItems.length === 0 ? (
                  <div className="col-span-full py-16 text-center text-xs text-zinc-500">
                    No products match your search query or department filter.
                  </div>
                ) : (
                  filteredItems.map((item) => {
                    const priceInfo = getItemEffectivePrice(item);
                    const isOutOfStock = item.currentStock <= 0;

                    return (
                      <div
                        key={item.id}
                        onClick={() => !isOutOfStock && handleAddToCart(item)}
                        className={`group relative flex flex-col justify-between rounded-xl border p-3 select-none transition-all ${
                          isOutOfStock
                            ? 'border-white/[0.02] bg-zinc-950/20 opacity-40 cursor-not-allowed'
                            : 'border-white/[0.04] bg-zinc-900/40 hover:bg-zinc-800/60 hover:border-emerald-500/30 active:scale-[0.98] cursor-pointer shadow-sm'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-1 mb-1">
                            <span className="text-[10px] text-zinc-500 font-mono truncate max-w-[120px]">
                              {item.sku}
                            </span>
                            {priceInfo.discountPercentage > 0 ? (
                              <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-300 border border-amber-500/30">
                                {priceInfo.discountPercentage}% OFF
                              </span>
                            ) : (
                              <span className="text-[10px] text-zinc-500">
                                {item.currentStock} {item.unit}
                              </span>
                            )}
                          </div>
                          <h4 className="text-xs font-semibold text-zinc-100 line-clamp-2 leading-tight">
                            {item.name}
                          </h4>
                        </div>

                        <div className="mt-3 flex items-baseline justify-between pt-1 border-t border-white/[0.03]">
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-mono text-sm font-bold text-white">
                              {formatINR(priceInfo.unitPrice)}
                            </span>
                            {priceInfo.discountPercentage > 0 && (
                              <span className="font-mono text-[10px] text-zinc-500 line-through">
                                {formatINR(priceInfo.originalPrice)}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-medium text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            + Add
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* RIGHT SIDE: Cart, Customer Lookup, & Checkout (Fixed 380px) */}
            <div className="w-full md:w-[380px] shrink-0 flex flex-col bg-[#09090c] h-full overflow-hidden">
              {/* Cart Header */}
              <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3 bg-[#0c0c10] shrink-0">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-zinc-400" />
                  <h3 className="text-xs font-semibold text-white">Active Order</h3>
                  <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-mono font-medium text-zinc-300">
                    {cart.reduce((a, c) => a + c.quantity, 0)} items
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {cart.length > 0 && (
                    <button
                      onClick={handleClearCart}
                      className="text-[11px] text-zinc-400 hover:text-rose-400 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="hidden md:flex rounded-lg p-1 text-zinc-500 hover:bg-zinc-800 hover:text-white transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* CUSTOMER SEARCH & ENROLLMENT SECTION (Key for Customer Tracking) */}
              <div className="border-b border-white/[0.06] bg-zinc-950/80 p-3 shrink-0">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-[11px] font-semibold text-zinc-200">Customer (Mobile No. Key)</span>
                  </div>
                  {matchedCustomer && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-800/40 px-1.5 py-0.5 rounded">
                      <CheckCircle2 className="h-2.5 w-2.5" /> Enrolled ({matchedCustomer.totalOrders} Visits)
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  {/* Phone Search Input */}
                  <div className="relative">
                    <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                    <input
                      type="tel"
                      placeholder="Enter Customer Mobile No. (e.g. 9876543210)"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full rounded-lg border border-white/[0.08] bg-zinc-900 pl-8 pr-7 py-1.5 text-xs text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none font-mono"
                    />
                    {customerPhone && (
                      <button
                        onClick={handleClearCustomer}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>

                  {/* Customer Information Preview / Inline Form */}
                  {customerPhone.trim().length >= 4 && (
                    <div className="rounded-lg border border-white/[0.06] bg-zinc-900/60 p-2 text-xs space-y-1.5">
                      {matchedCustomer ? (
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-zinc-100 flex items-center gap-1.5">
                              {matchedCustomer.name}
                              <span className="text-[10px] text-zinc-500 font-mono">({matchedCustomer.phone})</span>
                            </div>
                            <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                              Total Spent: <span className="text-emerald-400 font-semibold">{formatINR(matchedCustomer.totalSpent)}</span>
                              {matchedCustomer.gstin && <span className="ml-2 text-zinc-500">• GST: {matchedCustomer.gstin}</span>}
                            </div>
                          </div>
                          <button
                            onClick={() => setShowCustomerForm(!showCustomerForm)}
                            className="text-[10px] text-zinc-400 hover:text-zinc-200 underline"
                          >
                            {showCustomerForm ? 'Done' : 'Edit'}
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-amber-400 font-medium flex items-center gap-1">
                              <Sparkles className="h-3 w-3" /> New Customer
                            </span>
                            <span className="text-[10px] text-zinc-500">Collect details once</span>
                          </div>
                          <input
                            type="text"
                            placeholder="Customer Full Name *"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="w-full rounded border border-white/[0.08] bg-zinc-950 px-2 py-1 text-xs text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                      )}

                      {/* Extended Details Dropdown for GSTIN, Address, Email */}
                      {(showCustomerForm || (!matchedCustomer && customerPhone.trim().length >= 8)) && (
                        <div className="pt-1.5 border-t border-white/[0.04] space-y-1.5">
                          {matchedCustomer && (
                            <input
                              type="text"
                              placeholder="Customer Name"
                              value={customerName}
                              onChange={(e) => setCustomerName(e.target.value)}
                              className="w-full rounded border border-white/[0.08] bg-zinc-950 px-2 py-1 text-[11px] text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                            />
                          )}
                          <div className="grid grid-cols-2 gap-1.5">
                            <input
                              type="text"
                              placeholder="GSTIN (Optional)"
                              value={customerGstin}
                              onChange={(e) => setCustomerGstin(e.target.value.toUpperCase())}
                              className="w-full rounded border border-white/[0.08] bg-zinc-950 px-2 py-1 text-[11px] text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none font-mono"
                            />
                            <input
                              type="email"
                              placeholder="Email (Optional)"
                              value={customerEmail}
                              onChange={(e) => setCustomerEmail(e.target.value)}
                              className="w-full rounded border border-white/[0.08] bg-zinc-950 px-2 py-1 text-[11px] text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                            />
                          </div>
                          <input
                            type="text"
                            placeholder="Billing Address (Optional)"
                            value={customerAddress}
                            onChange={(e) => setCustomerAddress(e.target.value)}
                            className="w-full rounded border border-white/[0.08] bg-zinc-950 px-2 py-1 text-[11px] text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Cart Items List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {cart.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center text-zinc-500 p-6">
                    <div className="h-12 w-12 rounded-2xl bg-zinc-900 border border-white/[0.06] flex items-center justify-center mb-2.5">
                      <ShoppingCart className="h-5 w-5 text-zinc-600" />
                    </div>
                    <p className="text-xs font-medium text-zinc-400">Your cart is empty</p>
                    <p className="text-[11px] text-zinc-600 mt-1 max-w-[200px]">
                      Click products on the left to add items to this order.
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
                          <span className="w-8 text-center font-mono text-xs text-white font-medium">
                            {cartItem.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(idx, 1)}
                            disabled={cartItem.quantity >= cartItem.item.currentStock}
                            className="flex h-6 w-6 items-center justify-center rounded-lg border border-white/[0.06] bg-zinc-800 text-zinc-300 hover:bg-zinc-700 active:scale-95 disabled:opacity-40 cursor-pointer"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
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

              {/* Checkout Controls (Pinned Bottom) */}
              <div className="border-t border-white/[0.06] bg-[#0c0c10] p-4 space-y-3 shrink-0">
                <div className="space-y-1.5 text-xs text-zinc-400">
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
                  <div className="flex justify-between border-t border-white/[0.06] pt-2 text-sm font-semibold text-white">
                    <span>Total Payable</span>
                    <span className="font-mono text-emerald-400 text-base">{formatINR(grandTotal)}</span>
                  </div>
                </div>

                {/* Tender Method */}
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'upi', label: 'UPI / QR', icon: <QrCode className="h-3.5 w-3.5" /> },
                    { id: 'cash', label: 'Cash', icon: <Banknote className="h-3.5 w-3.5" /> },
                    { id: 'card', label: 'Card', icon: <CreditCard className="h-3.5 w-3.5" /> }
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`flex flex-col items-center justify-center gap-1 rounded-xl border py-2 text-[11px] font-medium transition-all cursor-pointer ${
                        paymentMethod === m.id
                          ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300 font-semibold'
                          : 'border-white/[0.04] bg-zinc-900/60 text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {m.icon}
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={cart.length === 0}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-100 py-3 text-xs font-bold text-zinc-900 hover:bg-white active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg cursor-pointer"
                >
                  <Check className="h-4 w-4" />
                  <span>
                    Charge {formatINR(grandTotal)}
                    {matchedCustomer ? ` (${matchedCustomer.name.split(' ')[0]})` : customerName.trim() ? ` (${customerName.trim().split(' ')[0]})` : ''}
                  </span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>

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
