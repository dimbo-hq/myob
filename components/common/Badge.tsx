'use client';

import React from 'react';
import { StockStatus, TempZone, POStatus } from '@/types/inventory';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'emerald' | 'cyan' | 'amber' | 'rose' | 'purple' | 'zinc';
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'sm',
  dot = false,
  className = ''
}) => {
  const variantStyles = {
    default: 'bg-zinc-800/70 text-zinc-300 border-zinc-700/50',
    emerald: 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40',
    cyan: 'bg-cyan-950/40 text-cyan-400 border-cyan-800/40',
    amber: 'bg-amber-950/40 text-amber-400 border-amber-800/40',
    rose: 'bg-rose-950/40 text-rose-400 border-rose-800/40',
    purple: 'bg-purple-950/40 text-purple-400 border-purple-800/40',
    zinc: 'bg-zinc-900 text-zinc-400 border-zinc-800'
  };

  const dotColors = {
    default: 'bg-zinc-400',
    emerald: 'bg-emerald-400',
    cyan: 'bg-cyan-400',
    amber: 'bg-amber-400',
    rose: 'bg-rose-400',
    purple: 'bg-purple-400',
    zinc: 'bg-zinc-500'
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[10px] gap-1.5 font-mono font-semibold tracking-wide uppercase',
    md: 'px-2.5 py-1 text-xs gap-1.5 font-heading font-semibold tracking-tight'
  };

  return (
    <span
      className={`inline-flex items-center rounded-lg border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {dot && (
        <span className={`h-1.5 w-1.5 rounded-full ${dotColors[variant]}`} />
      )}
      <span>{children}</span>
    </span>
  );
};

export const StockStatusBadge: React.FC<{ status: StockStatus; currentStock?: number; unit?: string }> = ({
  status,
  currentStock,
  unit
}) => {
  switch (status) {
    case 'out-of-stock':
      return (
        <Badge variant="rose" dot>
          Out of Stock
        </Badge>
      );
    case 'critical':
      return (
        <Badge variant="rose" dot>
          Critical ({currentStock} {unit})
        </Badge>
      );
    case 'low-stock':
      return (
        <Badge variant="amber" dot>
          Low Stock ({currentStock} {unit})
        </Badge>
      );
    case 'expiring-soon':
      return (
        <Badge variant="amber" dot>
          Expiring Soon
        </Badge>
      );
    case 'expired':
      return (
        <Badge variant="rose" dot>
          Batch Expired
        </Badge>
      );
    case 'in-stock':
    default:
      return (
        <Badge variant="emerald" dot>
          In Stock ({currentStock} {unit})
        </Badge>
      );
  }
};

export const TempZoneBadge: React.FC<{ zone: TempZone }> = ({ zone }) => {
  switch (zone) {
    case 'frozen':
      return (
        <Badge variant="cyan">
          Frozen -18°C
        </Badge>
      );
    case 'chilled':
      return (
        <Badge variant="cyan">
          Chilled 4°C
        </Badge>
      );
    case 'ambient':
    default:
      return (
        <Badge variant="zinc">
          Ambient
        </Badge>
      );
  }
};

export const POStatusBadge: React.FC<{ status: POStatus }> = ({ status }) => {
  switch (status) {
    case 'received':
      return (
        <Badge variant="emerald" dot>
          Received
        </Badge>
      );
    case 'in-transit':
      return (
        <Badge variant="cyan" dot>
          In Transit
        </Badge>
      );
    case 'sent':
      return (
        <Badge variant="purple" dot>
          Sent to Vendor
        </Badge>
      );
    case 'pending':
      return (
        <Badge variant="amber" dot>
          Pending
        </Badge>
      );
    case 'draft':
      return (
        <Badge variant="zinc" dot>
          Draft
        </Badge>
      );
    case 'cancelled':
      return (
        <Badge variant="rose" dot>
          Cancelled
        </Badge>
      );
  }
};
