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
      whileHover={onClick ? { y: -2 } : undefined}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      onClick={onClick}
      className={`group relative flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#111114] p-4.5 sm:p-5 shadow-[0_1px_2px_0_rgba(0,0,0,0.4)] ${
        onClick ? 'cursor-pointer hover:border-white/[0.16] hover:bg-[#15151b]' : ''
      } transition-all duration-150 overflow-hidden`}
    >
      <div>
        {/* Card Header: Title on Left, Trend Badge on Right */}
        <div className="flex items-center justify-between gap-2 min-h-[22px]">
          <span className="text-[11px] font-bold text-zinc-400 font-heading tracking-wider uppercase truncate">
            {title}
          </span>
          
          {badge ? (
            <span className="text-[10px] font-bold text-zinc-300 bg-zinc-800/90 px-2 py-0.5 rounded-full border border-zinc-700/60 font-mono tracking-tight shrink-0">
              {badge}
            </span>
          ) : trend ? (
            <span
              className={`inline-flex items-center text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border shrink-0 ${
                trend.isNeutral
                  ? 'bg-zinc-800/70 text-zinc-300 border-zinc-700/60'
                  : trend.isPositive
                  ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800/50'
                  : 'bg-rose-950/70 text-rose-300 border-rose-800/50'
              }`}
            >
              {trend.value}
            </span>
          ) : icon ? (
            <span className="text-zinc-500 shrink-0">{icon}</span>
          ) : null}
        </div>

        {/* Large Value: Dedicated Row with Full Width */}
        <div className="mt-3 flex items-baseline">
          <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white font-mono tabular-nums truncate max-w-full">
            {value}
          </span>
        </div>
      </div>

      {/* Subtitle / Footer */}
      {subtitle && (
        <div className="mt-3 text-[11px] text-zinc-400 font-sans tracking-normal border-t border-white/[0.04] pt-2.5 truncate">
          {subtitle}
        </div>
      )}
    </motion.div>
  );
};
