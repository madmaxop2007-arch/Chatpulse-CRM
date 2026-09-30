import React from 'react';

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'neutral'
  | 'purple'
  | 'hot'
  | 'warm'
  | 'cold';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  className?: string;
  showDot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  showDot = false,
}) => {
  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-0.5 font-medium',
  };

  const variants: Record<BadgeVariant, { bg: string; dot: string }> = {
    default: {
      bg: 'bg-slate-100 text-slate-700 border-slate-200/80',
      dot: 'bg-slate-500',
    },
    primary: {
      bg: 'bg-indigo-50/80 text-indigo-700 border-indigo-200/80',
      dot: 'bg-indigo-600',
    },
    success: {
      bg: 'bg-emerald-50/80 text-emerald-700 border-emerald-200/80',
      dot: 'bg-emerald-600',
    },
    warning: {
      bg: 'bg-amber-50/80 text-amber-700 border-amber-200/80',
      dot: 'bg-amber-600',
    },
    danger: {
      bg: 'bg-rose-50/80 text-rose-700 border-rose-200/80',
      dot: 'bg-rose-600',
    },
    neutral: {
      bg: 'bg-zinc-100 text-zinc-700 border-zinc-200/80',
      dot: 'bg-zinc-500',
    },
    purple: {
      bg: 'bg-purple-50/80 text-purple-700 border-purple-200/80',
      dot: 'bg-purple-600',
    },
    hot: {
      bg: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold',
      dot: 'bg-rose-600',
    },
    warm: {
      bg: 'bg-amber-50 text-amber-800 border-amber-200 font-semibold',
      dot: 'bg-amber-600',
    },
    cold: {
      bg: 'bg-sky-50 text-sky-800 border-sky-200 font-semibold',
      dot: 'bg-sky-600',
    },
  };

  const current = variants[variant] || variants.default;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border tracking-tight leading-tight select-none transition-colors ${sizes[size]} ${current.bg} ${className}`}
    >
      {(showDot || variant === 'hot' || variant === 'warm' || variant === 'cold') && (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${current.dot}`} aria-hidden="true" />
      )}
      <span>{children}</span>
    </span>
  );
};
