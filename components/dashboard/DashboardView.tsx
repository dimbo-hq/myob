'use client';

import React, { useState, useMemo } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { 
  AlertTriangle, 
  ArrowRight, 
  Clock, 
  Flame, 
  Layers, 
  Plus, 
  ShoppingCart, 
  TrendingUp, 
  Truck, 
  Zap,
  CheckCircle2,
  PieChart as PieIcon,
  BarChart3,
  Calendar,
  Sparkles,
  ShieldAlert,
  Boxes,
  Percent,
  RefreshCw,
  FastForward,
  ChevronRight,
  TrendingDown,
  Building2,
  FileSpreadsheet,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Check
} from 'lucide-react';
import { StatCard } from '../common/StatCard';
import { StockStatusBadge } from '../common/Badge';
import { formatINR } from '@/lib/currency';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';

interface DashboardViewProps {
  onNavigate: (tab: 'inventory' | 'expiry' | 'reorder' | 'audit') => void;
  onOpenPOS: () => void;
  onOpenTimeSimulator: () => void;
  onOpenAddProduct: () => void;
}

// 9 Department Neon Color Mapping
const DEPARTMENT_COLORS: Record<string, string> = {
  'Fresh Produce': '#10b981', // Emerald
  'Dairy & Eggs': '#38bdf8', // Sky Blue
  'Bakery & Deli': '#f59e0b', // Amber
  'Meat & Seafood': '#f43f5e', // Rose
  'Beverages': '#a855f7', // Purple
  'Pantry & Dry Goods': '#ec4899', // Pink
  'Frozen Foods': '#06b6d4', // Cyan
  'Snacks & Confectionery': '#eab308', // Yellow
  'Household & Personal Care': '#8b5cf6' // Violet
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenPOS,
  onOpenTimeSimulator,
  onOpenAddProduct
}) => {
  const {
    items,
    summary,
    stockMovements,
    applySmartExpiryMarkdowns,
    getDaysUntilExpiry,
    simulatedDateOffset,
    storeName
  } = useInventory();

  const [pieMetric, setPieMetric] = useState<'value' | 'stock' | 'count'>('value');
  const [chartView, setChartView] = useState<'breakdown' | 'expiryHorizon' | 'margins' | 'velocity'>('breakdown');
  const [hasAppliedAI, setHasAppliedAI] = useState(false);

  // Urgent expiring items (< 3 days)
  const urgentExpiringItems = useMemo(() => {
    const list: { item: typeof items[0]; batch: typeof items[0]['batches'][0]; days: number }[] = [];
    items.forEach((item) => {
      item.batches.forEach((b) => {
        if (b.quantity > 0) {
          const days = getDaysUntilExpiry(b.expiryDate);
          if (days <= 3) {
            list.push({ item, batch: b, days });
          }
        }
      });
    });
    return list.sort((a, b) => a.days - b.days);
  }, [items, getDaysUntilExpiry]);

  // Critical Low Stock items
  const lowStockItems = useMemo(() => {
    return items
      .filter((i) => i.currentStock <= i.reorderPoint)
      .sort((a, b) => a.currentStock - b.currentStock);
  }, [items]);

  // Department Aggregations
  const departmentChartData = useMemo(() => {
    const map: Record<string, { name: string; count: number; stock: number; value: number; cost: number; marginTotal: number; weeklySalesTotal: number }> = {};
    
    items.forEach((i) => {
      if (!map[i.category]) {
        map[i.category] = {
          name: i.category,
          count: 0,
          stock: 0,
          value: 0,
          cost: 0,
          marginTotal: 0,
          weeklySalesTotal: 0
        };
      }
      map[i.category].count += 1;
      map[i.category].stock += i.currentStock;
      map[i.category].value += i.currentStock * i.sellingPrice;
      map[i.category].cost += i.currentStock * i.costPrice;
      map[i.category].weeklySalesTotal += i.salesVelocity?.weeklySales || Math.round(i.currentStock * 0.2);
      const margin = i.sellingPrice > 0 ? ((i.sellingPrice - i.costPrice) / i.sellingPrice) * 100 : 0;
      map[i.category].marginTotal += margin;
    });

    return Object.values(map).map((d) => ({
      name: d.name,
      value: Math.round(d.value),
      stock: d.stock,
      count: d.count,
      weeklySales: d.weeklySalesTotal,
      avgMargin: d.count > 0 ? Math.round(d.marginTotal / d.count) : 0,
      color: DEPARTMENT_COLORS[d.name] || '#71717a'
    })).sort((a, b) => b.value - a.value);
  }, [items]);

  // Expiry Horizon Data
  const expiryHorizonData = useMemo(() => {
    let expiredUnits = 0;
    let criticalUnits = 0;
    let warningUnits = 0;
    let safeUnits = 0;
    let longLifeUnits = 0;

    items.forEach((item) => {
      item.batches.forEach((b) => {
        if (b.quantity > 0) {
          const days = getDaysUntilExpiry(b.expiryDate);
          if (days < 0) expiredUnits += b.quantity;
          else if (days <= 2) criticalUnits += b.quantity;
          else if (days <= 7) warningUnits += b.quantity;
          else if (days <= 30) safeUnits += b.quantity;
          else longLifeUnits += b.quantity;
        }
      });
    });

    return [
      { horizon: 'Expired (<0d)', units: expiredUnits, fill: '#f43f5e', label: 'Expired' },
      { horizon: 'Critical (<48h)', units: criticalUnits, fill: '#fb923c', label: 'Clearance' },
      { horizon: 'Warning (3-7d)', units: warningUnits, fill: '#facc15', label: 'Early Markdown' },
      { horizon: 'Optimal (8-30d)', units: safeUnits, fill: '#22d3ee', label: 'Fresh' },
      { horizon: 'Long Life (>30d)', units: longLifeUnits, fill: '#34d399', label: 'Stable' }
    ];
  }, [items, getDaysUntilExpiry]);

  // Handle AI Auto Markdown with visual feedback
  const handleTriggerAIMarkdown = () => {
    const updatedCount = applySmartExpiryMarkdowns();
    setHasAppliedAI(true);
    setTimeout(() => setHasAppliedAI(false), 3000);
  };

  // Stock health ratio
  const inStockPct = summary.totalItemsCount > 0 
    ? Math.round(((summary.totalItemsCount - (summary.outOfStockCount + summary.lowStockCount)) / summary.totalItemsCount) * 100) 
    : 100;

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-xl border border-white/10 bg-[#121215]/95 backdrop-blur-md p-3 text-xs shadow-2xl space-y-1.5 min-w-[170px]">
          <div className="flex items-center gap-2 font-semibold text-white">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: data.color || data.fill }} />
            <span>{data.name || data.horizon}</span>
          </div>
          <div className="space-y-1 border-t border-white/[0.06] pt-1.5 font-mono text-[11px]">
            {data.value !== undefined && (
              <div className="flex justify-between text-zinc-300">
                <span className="text-zinc-500">Valuation:</span>
                <span className="text-emerald-400 font-medium">{formatINR(data.value, false)}</span>
              </div>
            )}
            {data.stock !== undefined && (
              <div className="flex justify-between text-zinc-300">
                <span className="text-zinc-500">Stock:</span>
                <span className="text-white font-medium">{data.stock.toLocaleString()} units</span>
              </div>
            )}
            {data.units !== undefined && (
              <div className="flex justify-between text-zinc-300">
                <span className="text-zinc-500">Volume:</span>
                <span className="text-white font-medium">{data.units.toLocaleString()} units</span>
              </div>
            )}
            {data.count !== undefined && (
              <div className="flex justify-between text-zinc-300">
                <span className="text-zinc-500">SKUs:</span>
                <span className="text-zinc-400">{data.count} items</span>
              </div>
            )}
            {data.avgMargin !== undefined && (
              <div className="flex justify-between text-zinc-300">
                <span className="text-zinc-500">Avg Margin:</span>
                <span className="text-amber-400">{data.avgMargin}%</span>
              </div>
            )}
            {data.weeklySales !== undefined && (
              <div className="flex justify-between text-zinc-300">
                <span className="text-zinc-500">Est. Sales:</span>
                <span className="text-cyan-400">~{data.weeklySales.toLocaleString()} units/wk</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* 1. BRAND HERO & STORE COMMAND CENTER HEADER */}
      <div className="surface-card rounded-2xl p-5 border border-white/[0.08] bg-gradient-to-r from-[#121217] via-[#0f0f14] to-[#14141c] relative overflow-hidden shadow-xl">
        {/* Subtle background ambient glows */}
        <div className="absolute top-0 right-1/4 w-96 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-32 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                <span className="lowercase font-extrabold text-white">myob</span>
                <span className="text-xs font-mono font-normal text-zinc-400">• Mind Your Own Business</span>
              </span>
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Active Store OS</span>
              </span>
            </div>
            <p className="text-xs text-zinc-400 max-w-2xl">
              Real-time supermarket intelligence, automated FIFO batch clearance, multi-tenant inventory control & express POS for <span className="font-semibold text-zinc-200">{storeName || 'Your Store'}</span>.
            </p>
          </div>

          {/* Quick Action Commands */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onOpenPOS}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-bold text-zinc-950 hover:bg-emerald-400 active:scale-95 transition-all shadow-lg shadow-emerald-950/40 cursor-pointer"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              <span>Express POS</span>
            </button>

            <button
              onClick={onOpenAddProduct}
              className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-800 hover:text-white active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 text-zinc-400" />
              <span>+ Product</span>
            </button>

            <button
              onClick={handleTriggerAIMarkdown}
              disabled={hasAppliedAI}
              className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-950/30 px-3 py-2 text-xs font-medium text-amber-400 hover:bg-amber-950/60 active:scale-95 transition-all cursor-pointer"
            >
              {hasAppliedAI ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Markdowns Synced!</span>
                </>
              ) : (
                <>
                  <Zap className="h-3.5 w-3.5 text-amber-400" />
                  <span>AI Markdowns</span>
                </>
              )}
            </button>

            <button
              onClick={onOpenTimeSimulator}
              className="flex items-center gap-1.5 rounded-xl border border-white/[0.06] bg-zinc-900/60 px-3 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-all cursor-pointer"
              title="Fast forward or rewind simulated store calendar"
            >
              <FastForward className="h-3.5 w-3.5" />
              <span>Sim Date ({simulatedDateOffset > 0 ? `+${simulatedDateOffset}d` : 'Today'})</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. TOP 4 KPI STAT STRIP WITH DYNAMIC METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <StatCard
          title="Total Store Valuation"
          value={formatINR(summary.totalRetailValuation, false)}
          subtitle={`Wholesale Cost: ${formatINR(summary.totalCostValuation, false)}`}
          trend={{ value: `${summary.averageMarginPercent}% Avg Margin`, isPositive: true }}
          onClick={() => onNavigate('inventory')}
        />

        <StatCard
          title="Inventory Stock Health"
          value={`${inStockPct}% In-Stock`}
          subtitle={`${summary.outOfStockCount} out of stock • ${summary.lowStockCount} low buffer`}
          trend={summary.outOfStockCount > 0 ? { value: `${summary.outOfStockCount} Stockouts`, isPositive: false } : { value: 'Well Balanced', isPositive: true }}
          onClick={() => onNavigate('reorder')}
        />

        <StatCard
          title="At-Risk Perishable Value"
          value={formatINR(summary.atRiskLossValue)}
          subtitle={`${summary.expiringSoonCount + summary.expiredCount} batches near or past date`}
          trend={summary.expiringSoonCount > 0 ? { value: 'Markdowns Active', isNeutral: true } : { value: 'Zero Spoilage', isPositive: true }}
          onClick={() => onNavigate('expiry')}
        />

        <StatCard
          title="Replenishment Orders"
          value={`${summary.pendingOrdersCount} In Transit`}
          subtitle="Loading bay shipment pipeline"
          trend={{ value: 'Vendor Active', isPositive: true }}
          onClick={() => onNavigate('reorder')}
        />
      </div>

      {/* 3. CENTER INTERACTIVE VISUALIZER HUB */}
      <div className="surface-card rounded-2xl p-5 border border-white/[0.08] bg-[#0f0f13] space-y-4 shadow-xl">
        {/* Chart Header & Tab Selectors */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 via-cyan-500/20 to-purple-500/20 border border-emerald-500/30 text-emerald-400">
              <BarChart3 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
                Store Analytics & Inventory Visualizer
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">Real-Time MongoDB</span>
              </h3>
              <p className="text-[11px] text-zinc-400">
                Live multi-dimensional analytics across departments, asset valuations, and shelf-life curves
              </p>
            </div>
          </div>

          {/* Interactive Visualizer Views */}
          <div className="flex items-center gap-1.5 rounded-xl border border-white/[0.06] bg-zinc-950/60 p-1 overflow-x-auto scrollbar-none">
            {[
              { id: 'breakdown', label: 'Department Share', icon: <PieIcon className="h-3 w-3" /> },
              { id: 'expiryHorizon', label: 'Expiry Horizon', icon: <Calendar className="h-3 w-3" /> },
              { id: 'margins', label: 'Gross Margin %', icon: <Percent className="h-3 w-3" /> },
              { id: 'velocity', label: 'Weekly Velocity', icon: <Activity className="h-3 w-3" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setChartView(tab.id as any)}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                  chartView === tab.id
                    ? 'bg-zinc-800 text-white font-semibold shadow-sm border border-white/[0.08]'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* VIEW 1: Department Donut & Valuation Distribution */}
        {chartView === 'breakdown' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pt-2">
            {/* Left: Donut Chart with Center KPI HUD */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center relative min-h-[270px]">
              <ResponsiveContainer width="100%" height={270}>
                <PieChart>
                  <Pie
                    data={departmentChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={76}
                    outerRadius={110}
                    paddingAngle={3}
                    dataKey={pieMetric}
                    stroke="#0f0f13"
                    strokeWidth={2}
                  >
                    {departmentChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Donut HUD */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                  {pieMetric === 'value' ? 'Total Value' : pieMetric === 'stock' ? 'Total Units' : 'Total SKUs'}
                </span>
                <span className="text-sm sm:text-base font-bold text-white font-mono mt-0.5">
                  {pieMetric === 'value'
                    ? formatINR(summary.totalRetailValuation, false)
                    : pieMetric === 'stock'
                    ? `${summary.totalStockUnits.toLocaleString()}`
                    : `${summary.totalItemsCount}`}
                </span>
                <span className="text-[10px] text-emerald-400 font-medium">{departmentChartData.length} Departments</span>
              </div>

              {/* Metric Selector Pills */}
              <div className="flex gap-1 mt-2 rounded-lg border border-white/[0.04] bg-zinc-950/60 p-0.5 text-[11px]">
                {(['value', 'stock', 'count'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setPieMetric(m)}
                    className={`rounded px-2.5 py-1 capitalize transition-all cursor-pointer ${
                      pieMetric === m ? 'bg-zinc-800 text-white font-medium shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {m === 'value' ? '₹ Valuation' : m === 'stock' ? 'Units' : 'SKUs'}
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Department Grid Legend with Progress Bars */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {departmentChartData.map((dept) => {
                const totalMetricVal = pieMetric === 'value' ? summary.totalRetailValuation : pieMetric === 'stock' ? summary.totalStockUnits : summary.totalItemsCount;
                const metricVal = pieMetric === 'value' ? dept.value : pieMetric === 'stock' ? dept.stock : dept.count;
                const share = totalMetricVal > 0 ? Math.round((metricVal / totalMetricVal) * 100) : 0;

                return (
                  <div
                    key={dept.name}
                    className="rounded-xl border border-white/[0.04] bg-zinc-900/40 p-2.5 hover:border-white/[0.08] hover:bg-zinc-900/60 transition-all group cursor-default"
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-2 truncate pr-2">
                        <span className="h-2 w-2 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: dept.color }} />
                        <span className="font-medium text-zinc-200 truncate">{dept.name}</span>
                      </div>
                      <span className="font-mono font-semibold text-white">
                        {pieMetric === 'value' ? formatINR(dept.value, false) : dept.stock.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono mb-1">
                      <span>{dept.count} SKUs • {dept.avgMargin}% Margin</span>
                      <span className="text-zinc-400">{share}%</span>
                    </div>

                    <div className="h-1.5 w-full rounded-full bg-zinc-950 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(4, share)}%`, backgroundColor: dept.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VIEW 2: Expiry Horizon Bar Graph */}
        {chartView === 'expiryHorizon' && (
          <div className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">Perishable Shelf-Life Curve</h4>
                <p className="text-[11px] text-zinc-500">Distribution of store batches grouped by days remaining to expiry</p>
              </div>

              <button
                onClick={handleTriggerAIMarkdown}
                className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-400 hover:bg-amber-500/20 transition-all shadow-sm cursor-pointer"
              >
                <Zap className="h-3.5 w-3.5" />
                <span>Auto-Apply Markdowns</span>
              </button>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={expiryHorizonData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="horizon" stroke="#71717a" fontSize={11} tickLine={false} />
                  <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Bar dataKey="units" radius={[6, 6, 0, 0]}>
                    {expiryHorizonData.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* VIEW 3: Margin Matrix */}
        {chartView === 'margins' && (
          <div className="space-y-4 pt-2">
            <div>
              <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">Gross Profit Margin Matrix</h4>
              <p className="text-[11px] text-zinc-500">Average profit markup achieved across each supermarket department</p>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentChartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                  <XAxis type="number" unit="%" stroke="#71717a" fontSize={11} domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" stroke="#a1a1aa" fontSize={11} tickLine={false} width={130} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Bar dataKey="avgMargin" radius={[0, 4, 4, 0]}>
                    {departmentChartData.map((entry, index) => (
                      <Cell key={`margin-bar-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* VIEW 4: Weekly Velocity */}
        {chartView === 'velocity' && (
          <div className="space-y-4 pt-2">
            <div>
              <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">Department Sales Velocity</h4>
              <p className="text-[11px] text-zinc-500">Estimated weekly unit consumption and turnover drivers</p>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentChartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} />
                  <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Bar dataKey="weeklySales" radius={[6, 6, 0, 0]}>
                    {departmentChartData.map((entry, index) => (
                      <Cell key={`vel-bar-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* 4. OPERATIONAL RADARS (PERISHABLE RADAR & REORDER BUFFER) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Perishable Expiry Radar */}
        <div className="surface-card rounded-2xl p-5 flex flex-col justify-between border border-white/[0.08] shadow-lg">
          <div>
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-3.5">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
                  <Flame className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-white tracking-tight">
                    Perishable Expiry Radar
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    Urgent batches requiring clearance markdowns
                  </p>
                </div>
              </div>

              <button
                onClick={() => onNavigate('expiry')}
                className="text-xs font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                Clearance Hub →
              </button>
            </div>

            {/* Items list */}
            <div className="space-y-2">
              {urgentExpiringItems.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-500">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto mb-1.5" />
                  <div className="font-medium text-zinc-300">All Perishables Fresh</div>
                  <div className="text-zinc-500 text-[11px] mt-0.5">Zero products expiring in the next 3 days.</div>
                </div>
              ) : (
                urgentExpiringItems.slice(0, 4).map(({ item, batch, days }, index) => {
                  const isExp = days < 0;
                  const hasMarkdown = batch.markdownPercentage > 0;
                  const discountPrice = batch.markdownPrice || (item.sellingPrice * (1 - (batch.markdownPercentage || 0) / 100));

                  return (
                    <div
                      key={`${item.id}-${batch.id}-${index}`}
                      className="flex items-center justify-between rounded-xl border border-white/[0.04] bg-zinc-900/40 p-3 hover:border-white/[0.08] transition-all"
                    >
                      <div className="space-y-0.5 pr-2 truncate">
                        <div className="text-xs font-medium text-zinc-200 truncate">{item.name}</div>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-mono">
                          <span>Batch #{batch.batchNumber}</span>
                          <span>•</span>
                          <span>{batch.quantity} {item.unit}</span>
                          <span>•</span>
                          <span className={hasMarkdown ? 'text-emerald-400' : 'text-zinc-400'}>
                            {formatINR(hasMarkdown ? discountPrice : item.sellingPrice)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-medium ${
                          isExp
                            ? 'bg-rose-950/60 text-rose-400 border border-rose-800/40'
                            : 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                        }`}>
                          {isExp ? `Expired ${Math.abs(days)}d` : days === 0 ? 'Expires Today' : `${days}d left`}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-3.5 pt-3 border-t border-white/[0.04]">
            <button
              onClick={() => onNavigate('expiry')}
              className="flex items-center gap-1 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
            >
              <span>View Expiry & Markdown Hub</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Right: Stock Buffer & Replenishment Radar */}
        <div className="surface-card rounded-2xl p-5 flex flex-col justify-between border border-white/[0.08] shadow-lg">
          <div>
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-3.5">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <Boxes className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-white tracking-tight">
                    Stock Buffer & Reorder Alerts
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    Products below safety stock thresholds
                  </p>
                </div>
              </div>

              <button
                onClick={() => onNavigate('reorder')}
                className="text-xs font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                Reorder Hub →
              </button>
            </div>

            {/* Items list */}
            <div className="space-y-2">
              {lowStockItems.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-500">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto mb-1.5" />
                  <div className="font-medium text-zinc-300">Inventory Well Stocked</div>
                  <div className="text-zinc-500 text-[11px] mt-0.5">All products exceed reorder points.</div>
                </div>
              ) : (
                lowStockItems.slice(0, 4).map((item, idx) => {
                  const isOut = item.currentStock <= 0;
                  const suggested = Math.max(10, item.optimalStockLevel - item.currentStock);

                  return (
                    <div
                      key={`${item.id}-${idx}`}
                      className="flex items-center justify-between rounded-xl border border-white/[0.04] bg-zinc-900/40 p-3 hover:border-white/[0.08] transition-all"
                    >
                      <div className="space-y-0.5 pr-2 truncate">
                        <div className="text-xs font-medium text-zinc-200 truncate">{item.name}</div>
                        <div className="text-[11px] text-zinc-500">
                          {item.location.aisle} • Vendor: {item.supplierName} • Need +{suggested} {item.unit}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <StockStatusBadge
                          status={isOut ? 'out-of-stock' : 'low-stock'}
                          currentStock={item.currentStock}
                          unit={item.unit}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-3.5 pt-3 border-t border-white/[0.04]">
            <button
              onClick={() => onNavigate('reorder')}
              className="flex items-center gap-1 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
            >
              <span>View Supplier Purchase Orders</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* 5. RECENT STORE ACTIVITY & LIVE STREAM */}
      <div className="surface-card rounded-2xl p-5 border border-white/[0.08] bg-[#0f0f13] space-y-3 shadow-lg">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Clock className="h-3.5 w-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
                Live Store Activity & Audit Stream
              </h3>
              <p className="text-[11px] text-zinc-500">Real-time inventory changes, POS checkouts, and adjustments</p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('audit')}
            className="text-xs font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            Full Ledger →
          </button>
        </div>

        <div className="space-y-2">
          {stockMovements.length === 0 ? (
            <div className="py-6 text-center text-xs text-zinc-500">
              No store activity movements recorded yet.
            </div>
          ) : (
            stockMovements.slice(0, 5).map((mov, idx) => {
              const isPositive = mov.quantityDelta > 0;
              const isSale = mov.type === 'SALE';

              return (
                <div
                  key={`${mov.id}-${idx}`}
                  className="flex items-center justify-between rounded-xl border border-white/[0.03] bg-zinc-900/30 p-3 text-xs hover:border-white/[0.06] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-mono font-bold ${
                      isSale
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : isPositive
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {isSale ? 'POS' : isPositive ? '+IN' : 'ADJ'}
                    </div>

                    <div className="space-y-0.5">
                      <div className="font-medium text-zinc-200">{mov.itemName}</div>
                      <div className="text-[11px] text-zinc-500">
                        {mov.reason} • By {mov.performedBy}
                      </div>
                    </div>
                  </div>

                  <div className="text-right whitespace-nowrap pl-3 font-mono">
                    <div className={`font-semibold text-xs ${
                      isPositive ? 'text-emerald-400' : mov.quantityDelta < 0 ? 'text-rose-400' : 'text-amber-400'
                    }`}>
                      {isPositive ? `+${mov.quantityDelta}` : mov.quantityDelta !== 0 ? mov.quantityDelta : 'Updated'}
                    </div>
                    {mov.financialImpact !== 0 && (
                      <div className="text-[10px] text-zinc-400">
                        {formatINR(Math.abs(mov.financialImpact))}
                      </div>
                    )}
                    <div className="text-[10px] text-zinc-600">{mov.timestamp}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
