'use client';

import React from 'react';
import { motion } from 'motion/react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
    isNeutral?: boolean;
  };
  icon?: React.ReactNode;
  accentColor?: 'emerald' | 'cyan' | 'amber' | 'rose' | 'purple' | 'zinc';
  onClick?: () => void;
  badge?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  accentColor = 'zinc',
  onClick,
  badge
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={onClick ? { y: -1 } : undefined}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      onClick={onClick}
      className={`relative flex flex-col justify-between rounded-xl border border-white/[0.07] bg-[#111114] p-5 shadow-[0_1px_2px_0_rgba(0,0,0,0.4)] ${
        onClick ? 'cursor-pointer hover:border-white/[0.14] hover:bg-[#141419]' : ''
      } transition-colors duration-150`}
    >
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-400 font-heading tracking-wider uppercase">
            {title}
          </span>
          {badge && (
            <span className="text-[10px] font-bold text-zinc-300 bg-zinc-800/80 px-2 py-0.5 rounded-md border border-zinc-700/60 font-mono tracking-tight">
              {badge}
            </span>
          )}
          {!badge && icon && (
            <span className="text-zinc-500">{icon}</span>
          )}
        </div>

        {/* Large Value */}
        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-white font-mono tabular-nums">
            {value}
          </span>
          {trend && (
            <span
              className={`flex items-center text-xs font-mono font-semibold ${
                trend.isNeutral
                  ? 'text-zinc-400'
                  : trend.isPositive
                  ? 'text-emerald-400'
                  : 'text-rose-400'
              }`}
            >
              {trend.value}
            </span>
          )}
        </div>
      </div>

      {subtitle && (
        <div className="mt-3 text-[11px] text-zinc-400 font-sans tracking-normal">
          {subtitle}
        </div>
      )}
    </motion.div>
  );
};
