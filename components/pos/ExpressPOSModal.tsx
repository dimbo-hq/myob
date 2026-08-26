'use client';

import React, { useState } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { InventoryItem, POSCartItem } from '@/types/inventory';
import { 
  CreditCard, 
  DollarSign, 
  Minus, 
  Plus, 
  Scan, 
  Search, 
  ShoppingCart, 
  Trash2, 
  Smartphone, 
  X, 
  Check, 
  Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BarcodeScannerModal } from './BarcodeScannerModal';
import { ReceiptModal } from './ReceiptModal';

interface ExpressPOSModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExpressPOSModal: React.FC<ExpressPOSModalProps> = ({ isOpen, onClose }) => {
  const { items, processPOSSale, getDaysUntilExpiry } = useInventory();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [cart, setCart] = useState<POSCartItem[]>([]);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash' | 'contactless'>('card');
  const [completedOrder, setCompletedOrder] = useState<{
    orderId: string;
    items: POSCartItem[];
    subtotal: number;
    discountTotal: number;
    tax: number;
    total: number;
    paymentMethod: string;
  } | null>(null);

  if (!isOpen) return null;

  const categories = ['All', 'Fresh Produce', 'Dairy & Eggs', 'Bakery & Deli', 'Meat & Seafood', 'Beverages', 'Pantry & Dry Goods', 'Frozen Foods', 'Snacks & Confectionery'];

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesQuery = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.barcode.includes(searchQuery) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const getItemEffectivePrice = (item: InventoryItem) => {
    const discountedBatch = item.batches.find(
      (b) => b.quantity > 0 && (b.markdownPercentage > 0 || getDaysUntilExpiry(b.expiryDate) <= 2)
    );

    if (discountedBatch && discountedBatch.markdownPercentage > 0) {
      const price = discountedBatch.markdownPrice || (item.sellingPrice * (1 - discountedBatch.markdownPercentage / 100));
      return {
        unitPrice: price,
        originalPrice: item.sellingPrice,
        discountPercentage: discountedBatch.markdownPercentage,
        batch: discountedBatch
      };
    }

    return {
      unitPrice: item.discountPrice || item.sellingPrice,
      originalPrice: item.sellingPrice,
      discountPercentage: item.discountPrice ? Math.round((1 - item.discountPrice / item.sellingPrice) * 100) : 0,
      batch: undefined
    };
  };

  const handleAddToCart = (item: InventoryItem) => {
    if (item.currentStock <= 0) return;

    const priceInfo = getItemEffectivePrice(item);
    const existingIndex = cart.findIndex((c) => c.item.id === item.id);

    if (existingIndex > -1) {
      const existing = cart[existingIndex];
      if (existing.quantity >= item.currentStock) return;

      const updated = [...cart];
      const newQty = existing.quantity + 1;
      updated[existingIndex] = {
        ...existing,
        quantity: newQty,
        total: Math.round(newQty * priceInfo.unitPrice * 100) / 100
      };
      setCart(updated);
    } else {
      const newCartItem: POSCartItem = {
        item,
        batch: priceInfo.batch,
        quantity: 1,
        unitPrice: priceInfo.unitPrice,
        appliedDiscountPercentage: priceInfo.discountPercentage,
        total: priceInfo.unitPrice
      };
      setCart([...cart, newCartItem]);
    }
  };

  const handleUpdateQuantity = (index: number, delta: number) => {
    const target = cart[index];
    const newQty = target.quantity + delta;

    if (newQty <= 0) {
      setCart(cart.filter((_, i) => i !== index));
      return;
    }

    if (newQty > target.item.currentStock) return;

    const updated = [...cart];
    updated[index] = {
      ...target,
      quantity: newQty,
      total: Math.round(newQty * target.unitPrice * 100) / 100
    };
    setCart(updated);
  };

  const handleRemoveFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const subtotal = cart.reduce((acc, curr) => acc + curr.item.sellingPrice * curr.quantity, 0);
  const cartTotal = cart.reduce((acc, curr) => acc + curr.total, 0);
  const discountTotal = Math.max(0, subtotal - cartTotal);
  const tax = cart.reduce((acc, curr) => acc + curr.total * (curr.item.vatRate || 0), 0);
  const grandTotal = Math.round((cartTotal + tax) * 100) / 100;

  const handleCheckout = () => {
    if (cart.length === 0) return;

    const res = processPOSSale(cart, paymentMethod);
    if (res.success) {
      setCompletedOrder({
        orderId: res.orderId,
        items: [...cart],
        subtotal: Math.round(subtotal * 100) / 100,
        discountTotal: Math.round(discountTotal * 100) / 100,
        tax: Math.round(tax * 100) / 100,
        total: grandTotal,
        paymentMethod
      });
      setCart([]);
    }
  };

  return (
    <>
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

          {/* POS Terminal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            className="relative flex h-[90vh] w-full max-w-5xl overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d0d10] shadow-2xl z-10"
          >
            {/* LEFT SIDE: Product Explorer */}
            <div className="flex flex-1 flex-col border-r border-white/[0.06] bg-[#09090b]/50">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/[0.06] p-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-zinc-900 text-zinc-200">
                    <ShoppingCart className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-white tracking-tight">
                      POS Register
                    </h2>
                    <p className="text-[11px] text-zinc-500">
                      Live store inventory checkout
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsScannerOpen(true)}
                    className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition-all"
                  >
                    <Scan className="h-3.5 w-3.5 text-zinc-400" />
                    <span>Scan</span>
                  </button>
                  <button
                    onClick={onClose}
                    className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-white transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Search & Category Pills */}
              <div className="border-b border-white/[0.06] p-3 space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Search product, barcode or SKU..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg border border-white/[0.06] bg-zinc-900/80 pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
                  />
                </div>

                <div className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-none">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`whitespace-nowrap rounded px-2 py-0.5 text-[11px] font-medium transition-all ${
                        selectedCategory === cat
                          ? 'bg-zinc-200 text-zinc-950 font-semibold'
                          : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Grid */}
              <div className="flex-1 overflow-y-auto p-3.5 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {filteredItems.map((item) => {
                  const priceInfo = getItemEffectivePrice(item);
                  const isOutOfStock = item.currentStock <= 0;

                  return (
                    <div
                      key={item.id}
                      onClick={() => !isOutOfStock && handleAddToCart(item)}
                      className={`group relative flex flex-col justify-between rounded-xl border p-3 select-none transition-all ${
                        isOutOfStock
                          ? 'border-white/[0.02] bg-zinc-950/20 opacity-40 cursor-not-allowed'
                          : 'border-white/[0.05] bg-[#111114] hover:border-white/[0.12] hover:bg-[#15151a] cursor-pointer'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between text-[10px] text-zinc-500 mb-1">
                          <span className="truncate">{item.brand}</span>
                          {priceInfo.discountPercentage > 0 && (
                            <span className="font-medium text-amber-400 bg-amber-950/40 px-1 py-0.2 rounded border border-amber-800/40">
                              -{priceInfo.discountPercentage}% Exp
                            </span>
                          )}
                        </div>

                        <h4 className="text-xs font-medium text-white line-clamp-2 leading-snug">
                          {item.name}
                        </h4>
                      </div>

                      <div className="mt-3 flex items-end justify-between border-t border-white/[0.04] pt-2">
                        <div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-xs font-semibold text-white font-mono">
                              ${priceInfo.unitPrice.toFixed(2)}
                            </span>
                            {priceInfo.discountPercentage > 0 && (
                              <span className="text-[10px] text-zinc-500 line-through font-mono">
                                ${priceInfo.originalPrice.toFixed(2)}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-zinc-500">
                            {isOutOfStock ? 'Out of stock' : `${item.currentStock} ${item.unit}`}
                          </span>
                        </div>

                        <span className="flex h-5 w-5 items-center justify-center rounded bg-zinc-800 text-zinc-300 group-hover:bg-zinc-700">
                          <Plus className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT SIDE: Active Cart */}
            <div className="flex w-80 flex-col bg-[#09090b]">
              <div className="flex items-center justify-between border-b border-white/[0.06] p-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
                    Order Summary ({cart.reduce((a, c) => a + c.quantity, 0)})
                  </h3>
                </div>
                {cart.length > 0 && (
                  <button
                    onClick={handleClearCart}
                    className="text-[11px] text-zinc-500 hover:text-rose-400 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-2">
                {cart.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center text-zinc-500">
                    <ShoppingCart className="h-8 w-8 text-zinc-700 mb-2" />
                    <p className="text-xs">Cart is empty</p>
                    <p className="text-[11px] text-zinc-600 mt-0.5">
                      Select items or scan barcode
                    </p>
                  </div>
                ) : (
                  cart.map((cartItem, idx) => (
                    <div
                      key={cartItem.item.id}
                      className="rounded-lg border border-white/[0.04] bg-zinc-900/40 p-2.5 space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h5 className="text-xs font-medium text-white line-clamp-1">
                            {cartItem.item.name}
                          </h5>
                          <div className="text-[10px] text-zinc-500 font-mono">
                            ${cartItem.unitPrice.toFixed(2)} / {cartItem.item.unit}
                            {cartItem.appliedDiscountPercentage > 0 && (
                              <span className="text-amber-400 font-medium ml-1">
                                (-{cartItem.appliedDiscountPercentage}%)
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-xs font-mono font-medium text-white">
                          ${cartItem.total.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between border-t border-white/[0.03] pt-1.5">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleUpdateQuantity(idx, -1)}
                            className="flex h-5 w-5 items-center justify-center rounded border border-white/[0.06] bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                          >
                            <Minus className="h-2.5 w-2.5" />
                          </button>
                          <span className="w-6 text-center font-mono text-xs text-white">
                            {cartItem.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(idx, 1)}
                            disabled={cartItem.quantity >= cartItem.item.currentStock}
                            className="flex h-5 w-5 items-center justify-center rounded border border-white/[0.06] bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-40"
                          >
                            <Plus className="h-2.5 w-2.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => handleRemoveFromCart(idx)}
                          className="text-zinc-600 hover:text-rose-400 p-0.5"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Checkout Controls */}
              <div className="border-t border-white/[0.06] bg-[#0d0d10] p-4 space-y-3">
                <div className="space-y-1 text-xs text-zinc-400">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-mono text-zinc-200">${subtotal.toFixed(2)}</span>
                  </div>
                  {discountTotal > 0 && (
                    <div className="flex justify-between text-amber-400">
                      <span>Markdown Savings</span>
                      <span className="font-mono">-${discountTotal.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[11px] text-zinc-500">
                    <span>Estimated Tax</span>
                    <span className="font-mono">${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-white/[0.06] pt-2 text-sm font-semibold text-white">
                    <span>Total Due</span>
                    <span className="font-mono text-emerald-400">${grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Tender Method */}
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { id: 'card', label: 'Card', icon: <CreditCard className="h-3.5 w-3.5" /> },
                    { id: 'cash', label: 'Cash', icon: <DollarSign className="h-3.5 w-3.5" /> },
                    { id: 'contactless', label: 'NFC', icon: <Smartphone className="h-3.5 w-3.5" /> }
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`flex flex-col items-center justify-center gap-1 rounded-lg border py-1.5 text-[11px] font-medium transition-all ${
                        paymentMethod === m.id
                          ? 'border-white/[0.2] bg-zinc-800 text-white font-semibold'
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
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-zinc-100 py-2.5 text-xs font-semibold text-zinc-900 hover:bg-white active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Charge ${grandTotal.toFixed(2)}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>

      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onSelectProduct={(scanned) => {
          handleAddToCart(scanned);
          setIsScannerOpen(false);
        }}
      />

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
