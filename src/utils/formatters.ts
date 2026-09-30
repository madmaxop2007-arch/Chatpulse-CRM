/**
 * Indian currency formatters and general real estate helpers
 */

export function formatINR(amount: number | undefined | null, compact = true): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹ 0';

  if (!compact) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  }

  // Indian compact notation (Cr, Lacs, K)
  const abs = Math.abs(amount);
  if (abs >= 10000000) {
    const cr = amount / 10000000;
    return `₹ ${cr.toFixed(cr % 1 === 0 ? 0 : 2)} Cr`;
  }
  if (abs >= 100000) {
    const lac = amount / 100000;
    return `₹ ${lac.toFixed(lac % 1 === 0 ? 0 : 2)} Lac`;
  }
  if (abs >= 1000) {
    return `₹ ${(amount / 1000).toFixed(0)}K`;
  }

  return `₹ ${amount.toLocaleString('en-IN')}`;
}

export function formatDate(dateString?: string): string {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatTime(timeString?: string): string {
  if (!timeString) return '';
  return timeString;
}

export function formatDateTime(dateString?: string, timeString?: string): string {
  if (!dateString) return '—';
  const d = formatDate(dateString);
  return timeString ? `${d}, ${timeString}` : d;
}

export function isValidPhone(phone: string): boolean {
  if (!phone) return false;
  // Allow Indian 10 digits, +91 prefixes, or international standard with min 8 max 15 digits
  const cleaned = phone.replace(/[\s\-\(\)\+]/g, '');
  return cleaned.length >= 8 && cleaned.length <= 15 && /^\d+$/.test(cleaned);
}

export function isValidEmail(email: string): boolean {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function getInitials(name: string): string {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
