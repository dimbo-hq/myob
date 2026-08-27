'use client';

import React, { useState, useMemo } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { Customer } from '@/types/inventory';
import { 
  Users, 
  Search, 
  Plus, 
  Phone, 
  Mail, 
  MapPin, 
  Receipt, 
  Calendar, 
  Download, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Sparkles, 
  Building2, 
  ArrowUpDown,
  ShoppingBag,
  TrendingUp,
  X,
  CreditCard,
  UserPlus
} from 'lucide-react';
import { formatINR } from '@/lib/currency';
import { motion, AnimatePresence } from 'motion/react';

interface CustomersViewProps {
  onOpenPOSForCustomer?: (phone: string) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({ onOpenPOSForCustomer }) => {
  const { customers, addOrUpdateCustomer, addToast } = useInventory();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'spent' | 'orders' | 'name'>('recent');
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State for Add / Edit
  const [formPhone, setFormPhone] = useState('');
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formGstin, setFormGstin] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const openAddModal = () => {
    setEditingCustomer(null);
    setFormPhone('');
    setFormName('');
    setFormEmail('');
    setFormAddress('');
    setFormGstin('');
    setFormNotes('');
    setIsAddModalOpen(true);
  };

  const openEditModal = (cust: Customer) => {
    setEditingCustomer(cust);
    setFormPhone(cust.phone);
    setFormName(cust.name);
    setFormEmail(cust.email || '');
    setFormAddress(cust.address || '');
    setFormGstin(cust.gstin || '');
    setFormNotes(cust.notes || '');
    setIsAddModalOpen(true);
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPhone.trim() || !formName.trim()) {
      addToast({
        type: 'warning',
        title: 'Required Fields Missing',
        message: 'Please provide both Customer Mobile Number and Full Name.'
      });
      return;
    }

    addOrUpdateCustomer({
      phone: formPhone.trim(),
      name: formName.trim(),
      email: formEmail.trim() || undefined,
      address: formAddress.trim() || undefined,
      gstin: formGstin.trim().toUpperCase() || undefined,
      notes: formNotes.trim() || undefined
    });

    addToast({
      type: 'success',
      title: editingCustomer ? 'Customer Updated' : 'Customer Registered',
      message: `Customer profile for "${formName.trim()}" (${formPhone.trim()}) saved to database.`
    });

    setIsAddModalOpen(false);
  };

  // Filter & Sort
  const filteredCustomers = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    let list = customers.filter((c) => {
      if (!query) return true;
      return (
        c.phone.toLowerCase().includes(query) ||
        c.name.toLowerCase().includes(query) ||
        (c.email && c.email.toLowerCase().includes(query)) ||
        (c.gstin && c.gstin.toLowerCase().includes(query)) ||
        (c.address && c.address.toLowerCase().includes(query))
      );
    });

    return list.sort((a, b) => {
      if (sortBy === 'recent') {
        const dateA = a.lastPurchaseDate ? new Date(a.lastPurchaseDate).getTime() : new Date(a.createdAt).getTime();
        const dateB = b.lastPurchaseDate ? new Date(b.lastPurchaseDate).getTime() : new Date(b.createdAt).getTime();
        return dateB - dateA;
      }
      if (sortBy === 'spent') return b.totalSpent - a.totalSpent;
      if (sortBy === 'orders') return b.totalOrders - a.totalOrders;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });
  }, [customers, searchQuery, sortBy]);

  // Statistics
  const totalRevenueFromCustomers = customers.reduce((acc, c) => acc + c.totalSpent, 0);
  const totalOrdersCount = customers.reduce((acc, c) => acc + c.totalOrders, 0);
  const repeatCustomersCount = customers.filter((c) => c.totalOrders > 1).length;
  const avgOrderValue = totalOrdersCount > 0 ? totalRevenueFromCustomers / totalOrdersCount : 0;

  // Export CSV
  const handleExportCSV = () => {
    if (customers.length === 0) return;

    const headers = ['Mobile Number', 'Customer Name', 'Email', 'GSTIN', 'Address', 'Total Orders', 'Total Spent (INR)', 'Created At', 'Last Visit'];
    const rows = customers.map((c) => [
      `"${c.phone}"`,
      `"${c.name}"`,
      `"${c.email || ''}"`,
      `"${c.gstin || ''}"`,
      `"${c.address || ''}"`,
      c.totalOrders,
      c.totalSpent,
      `"${c.createdAt || ''}"`,
      `"${c.lastPurchaseDate || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Customers_Directory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-400" />
            Customer Intelligence & Directory
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Identify customers instantly by mobile number during checkout. Track visits, loyalty, and tax invoices.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {customers.length > 0 && (
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all cursor-pointer"
              title="Export customer list to CSV"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </button>
          )}

          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 active:scale-95 transition-all shadow-sm cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Customer</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-3.5">
          <div className="text-[11px] text-zinc-400 font-medium">Enrolled Customers</div>
          <div className="text-xl font-bold text-white font-mono mt-1">{customers.length}</div>
          <div className="text-[10px] text-zinc-500 mt-0.5">Unique Mobile Identifiers</div>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-3.5">
          <div className="text-[11px] text-zinc-400 font-medium">Customer Revenue</div>
          <div className="text-xl font-bold text-emerald-400 font-mono mt-1">{formatINR(totalRevenueFromCustomers)}</div>
          <div className="text-[10px] text-zinc-500 mt-0.5">{totalOrdersCount} Completed POS Orders</div>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-3.5">
          <div className="text-[11px] text-zinc-400 font-medium">Repeat Customers</div>
          <div className="text-xl font-bold text-sky-400 font-mono mt-1">{repeatCustomersCount}</div>
          <div className="text-[10px] text-zinc-500 mt-0.5">
            {customers.length > 0 ? `${Math.round((repeatCustomersCount / customers.length) * 100)}% retention rate` : '0%'}
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-3.5">
          <div className="text-[11px] text-zinc-400 font-medium">Avg Order Value</div>
          <div className="text-xl font-bold text-amber-400 font-mono mt-1">{formatINR(avgOrderValue)}</div>
          <div className="text-[10px] text-zinc-500 mt-0.5">Per POS transaction</div>
        </div>
      </div>

      {/* Search & Sorting Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between bg-zinc-950/60 p-2.5 rounded-xl border border-white/[0.06]">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by Mobile No. (e.g. 9876...), Name, Email, or GSTIN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-white/[0.06] bg-zinc-900 pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-zinc-500 hidden sm:inline">Sort:</span>
          {[
            { id: 'recent', label: 'Recent Visit' },
            { id: 'spent', label: 'Top Spend' },
            { id: 'orders', label: 'Most Orders' },
            { id: 'name', label: 'Name (A-Z)' }
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setSortBy(s.id as any)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                sortBy === s.id
                  ? 'bg-zinc-200 text-zinc-950 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Customers List / Table */}
      {filteredCustomers.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.06] bg-zinc-900/20 p-12 text-center space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-zinc-900 border border-white/[0.08] flex items-center justify-center mx-auto text-zinc-500">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-200">
              {searchQuery ? 'No matching customers found' : 'No customers enrolled yet'}
            </h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? 'Try searching with a different mobile number or customer name.'
                : 'Customers will automatically be enrolled when you enter their mobile number in the Express POS terminal, or you can register them manually.'}
            </p>
          </div>
          {!searchQuery && (
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-500 active:scale-95 transition-all shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Enroll First Customer</span>
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/[0.06] bg-zinc-900/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/[0.06] bg-zinc-950/80 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider font-mono">
                <tr>
                  <th className="px-4 py-3">Mobile No. (Key)</th>
                  <th className="px-4 py-3">Customer Name</th>
                  <th className="px-4 py-3">GSTIN / Address</th>
                  <th className="px-4 py-3 text-center">Visits</th>
                  <th className="px-4 py-3 text-right">Total Spent</th>
                  <th className="px-4 py-3">Last Visit</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-zinc-300">
                {filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-zinc-900/60 transition-colors">
                    {/* Mobile Phone (Primary Key) */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <Phone className="h-3 w-3" />
                        </span>
                        <span className="font-mono font-bold text-white">{cust.phone}</span>
                      </div>
                    </td>

                    {/* Customer Name & Email */}
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-semibold text-zinc-100 flex items-center gap-1.5">
                          {cust.name}
                          {cust.totalOrders > 3 && (
                            <span className="rounded bg-emerald-500/20 px-1 py-0.2 text-[9px] font-bold text-emerald-300 border border-emerald-500/30">
                              VIP
                            </span>
                          )}
                        </div>
                        {cust.email && (
                          <div className="text-[11px] text-zinc-500 truncate max-w-[180px]">
                            {cust.email}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* GSTIN / Address */}
                    <td className="px-4 py-3 text-[11px] text-zinc-400">
                      <div>
                        {cust.gstin && (
                          <div className="font-mono text-zinc-300 flex items-center gap-1">
                            <Building2 className="h-3 w-3 text-zinc-500" />
                            <span>{cust.gstin}</span>
                          </div>
                        )}
                        {cust.address && (
                          <div className="text-zinc-500 truncate max-w-[200px] flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-zinc-600 shrink-0" />
                            <span>{cust.address}</span>
                          </div>
                        )}
                        {!cust.gstin && !cust.address && (
                          <span className="text-zinc-600 italic">Retail Walk-in</span>
                        )}
                      </div>
                    </td>

                    {/* Total Orders */}
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 font-mono text-[11px] text-zinc-200 font-semibold border border-zinc-700">
                        {cust.totalOrders} {cust.totalOrders === 1 ? 'order' : 'orders'}
                      </span>
                    </td>

                    {/* Total Spent */}
                    <td className="px-4 py-3 text-right whitespace-nowrap font-mono font-bold text-emerald-400 text-sm">
                      {formatINR(cust.totalSpent)}
                    </td>

                    {/* Last Visit */}
                    <td className="px-4 py-3 whitespace-nowrap text-[11px] text-zinc-500 font-mono">
                      {cust.lastPurchaseDate
                        ? new Date(cust.lastPurchaseDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
                        : 'New Member'}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(cust)}
                          className="rounded-lg border border-white/[0.06] bg-zinc-900/80 p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
                          title="Edit Customer Details"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Customer Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/[0.1] bg-zinc-950 p-6 shadow-2xl z-10 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <UserPlus className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-bold text-white">
                    {editingCustomer ? 'Edit Customer Information' : 'Enroll New Customer'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSaveCustomer} className="space-y-3.5 text-xs">
                {/* Phone (Key) */}
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Mobile Number (Primary Key) *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      className="w-full rounded-lg border border-white/[0.08] bg-zinc-900 pl-8 pr-3 py-2 text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-1">
                    This phone number is used for instant 1-second customer identification in POS billing.
                  </p>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Customer Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikram Sharma"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full rounded-lg border border-white/[0.08] bg-zinc-900 px-3 py-2 text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Email & GSTIN */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                      Email (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="vikram@example.com"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full rounded-lg border border-white/[0.08] bg-zinc-900 px-3 py-2 text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                      GSTIN (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="27ABCDE1234F1Z5"
                      value={formGstin}
                      onChange={(e) => setFormGstin(e.target.value.toUpperCase())}
                      className="w-full rounded-lg border border-white/[0.08] bg-zinc-900 px-3 py-2 text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none font-mono uppercase"
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Billing / Delivery Address (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Shop 4, MG Road, Pune, Maharashtra"
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    className="w-full rounded-lg border border-white/[0.08] bg-zinc-900 px-3 py-2 text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Notes / Preferences (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Prefers organic produce, regular morning visitor"
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="w-full rounded-lg border border-white/[0.08] bg-zinc-900 px-3 py-2 text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none resize-none"
                  />
                </div>

                {/* Modal Buttons */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.06]">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="rounded-lg border border-white/[0.08] px-3 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 active:scale-95 transition-all shadow-md cursor-pointer"
                  >
                    {editingCustomer ? 'Update Profile' : 'Save & Register Customer'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
