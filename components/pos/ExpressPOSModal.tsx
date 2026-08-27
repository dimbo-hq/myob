'use client';

import React, { useState } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { InventoryItem, POSCartItem } from '@/types/inventory';
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
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ReceiptModal } from './ReceiptModal';
import { formatINR } from '@/lib/currency';

interface ExpressPOSModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExpressPOSModal: React.FC<ExpressPOSModalProps> = ({ isOpen, onClose }) => {
  const { items, processPOSSale, getDaysUntilExpiry, storeName } = useInventory();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [cart, setCart] = useState<POSCartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'cash' | 'card'>('upi');
  const [completedOrder, setCompletedOrder] = useState<{
    orderId: string;
    items: POSCartItem[];
    subtotal: number;
    discountTotal: number;
    tax: number;
    total: number;
    paymentMethod: string;
  } | null>(null);

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
    // Find active batch with highest markdown or earliest expiry
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

  // Calculations
  const subtotal = cart.reduce((acc, curr) => acc + (curr.quantity * curr.item.sellingPrice), 0);
  const totalAfterDiscount = cart.reduce((acc, curr) => acc + curr.total, 0);
  const discountTotal = Math.round((subtotal - totalAfterDiscount) * 100) / 100;
  const tax = Math.round(totalAfterDiscount * 0.05 * 100) / 100; // 5% GST
  const grandTotal = Math.round((totalAfterDiscount + tax) * 100) / 100;

  const handleCheckout = () => {
    if (cart.length === 0) return;

    const result = processPOSSale(cart, paymentMethod.toUpperCase());
    if (result.success) {
      setCompletedOrder({
        orderId: result.orderId,
        items: [...cart],
        subtotal,
        discountTotal,
        tax,
        total: grandTotal,
        paymentMethod: paymentMethod.toUpperCase()
      });
      setCart([]);
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
                      <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {storeName || 'Store Terminal'}
                      </span>
                    </h2>
                    <p className="text-[11px] text-zinc-500">
                      Click products or search SKU to build order
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
                            : 'border-white/[0.06] bg-[#121216] hover:border-emerald-500/40 hover:bg-[#16161c] cursor-pointer shadow-sm'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between text-[10px] text-zinc-500 mb-1">
                            <span className="truncate font-mono">{item.sku}</span>
                            {priceInfo.discountPercentage > 0 && (
                              <span className="font-medium text-amber-400 bg-amber-950/60 px-1 py-0.2 rounded border border-amber-800/40">
                                -{priceInfo.discountPercentage}% Exp
                              </span>
                            )}
                          </div>

                          <h4 className="text-xs font-medium text-white line-clamp-2 leading-snug">
                            {item.name}
                          </h4>
                          <span className="text-[10px] text-zinc-400 truncate block mt-0.5">
                            {item.brand}
                          </span>
                        </div>

                        <div className="mt-2.5 flex items-end justify-between border-t border-white/[0.04] pt-2">
                          <div>
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-xs font-semibold text-white font-mono">
                                {formatINR(priceInfo.unitPrice)}
                              </span>
                              {priceInfo.discountPercentage > 0 && (
                                <span className="text-[10px] text-zinc-500 line-through font-mono">
                                  {formatINR(priceInfo.originalPrice)}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-zinc-500">
                              {isOutOfStock ? 'Out of stock' : `${item.currentStock} ${item.unit}`}
                            </span>
                          </div>

                          <span className="flex h-5 w-5 items-center justify-center rounded bg-zinc-800 text-zinc-300 group-hover:bg-emerald-500 group-hover:text-zinc-950 transition-colors">
                            <Plus className="h-3 w-3" />
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* RIGHT SIDE: Active Cart & Checkout (Fixed pinned sidebar w-84 to w-96) */}
            <div className="w-full md:w-84 lg:w-96 shrink-0 flex flex-col bg-[#09090b] h-full overflow-hidden border-t md:border-t-0 md:border-l border-white/[0.06]">
              {/* Cart Header */}
              <div className="flex items-center justify-between border-b border-white/[0.06] p-3.5 bg-[#0d0d10] shrink-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
                    Cart Items ({cart.reduce((a, c) => a + c.quantity, 0)})
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  {cart.length > 0 && (
                    <button
                      onClick={handleClearCart}
                      className="text-[11px] text-zinc-500 hover:text-rose-400 transition-colors"
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
                            className="flex h-6 w-6 items-center justify-center rounded-lg border border-white/[0.06] bg-zinc-800 text-zinc-300 hover:bg-zinc-700 active:scale-95"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center font-mono text-xs text-white font-medium">
                            {cartItem.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(idx, 1)}
                            disabled={cartItem.quantity >= cartItem.item.currentStock}
                            className="flex h-6 w-6 items-center justify-center rounded-lg border border-white/[0.06] bg-zinc-800 text-zinc-300 hover:bg-zinc-700 active:scale-95 disabled:opacity-40"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => handleRemoveFromCart(idx)}
                          className="text-zinc-500 hover:text-rose-400 p-1 transition-colors"
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
                      className={`flex flex-col items-center justify-center gap-1 rounded-xl border py-2 text-[11px] font-medium transition-all ${
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
                  <span>Charge {formatINR(grandTotal)}</span>
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
        />
      )}
    </>
  );
};
