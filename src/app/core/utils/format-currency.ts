/**
 * Formats a number as Indian Rupee currency, e.g. 12500 -> "₹12,500"
 * Uses the Indian numbering system (lakh/crore grouping) via Intl.
 */
export function formatCurrency(value: number): string {
  const rounded = Math.round((value + Number.EPSILON) * 100) / 100;
  const isNegative = rounded < 0;
  const abs = Math.abs(rounded);

  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: abs % 1 === 0 ? 0 : 2,
    minimumFractionDigits: 0,
  }).format(abs);

  return `${isNegative ? '-' : ''}₹${formatted}`;
}

export function formatCompactCurrency(value: number): string {
  if (Math.abs(value) >= 100000) {
    return `₹${(value / 100000).toFixed(1)}L`;
  }
  if (Math.abs(value) >= 1000) {
    return `₹${(value / 1000).toFixed(1)}K`;
  }
  return formatCurrency(value);
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatRelativeTime(iso: string): string {
  const now = new Date().getTime();
  const then = new Date(iso).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return formatDate(iso);
}
