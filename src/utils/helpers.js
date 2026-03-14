/**
 * Format a number as Indian Rupees.
 */
export const formatCurrency = (amount) =>
  `₹${Number(amount ?? 0).toLocaleString('en-IN')}`;

/**
 * Format an ISO date string to a locale date.
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

/**
 * Format ISO datetime to locale string.
 */
export const formatDateTime = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

/**
 * Return CSS color variable name based on payment / complaint status.
 */
export const statusColor = {
  // Payment
  PENDING:     'amber',
  PAID:        'green',
  OVERDUE:     'rose',
  WAIVED:      'blue',
  FAILED:      'rose',
  // Complaint
  IN_PROGRESS: 'blue',
  RESOLVED:    'green',
  REJECTED:    'rose',
  // Room
  AVAILABLE:   'green',
  FULL:        'rose',
  MAINTENANCE: 'amber',
  RESERVED:    'blue',
  // Student
  ACTIVE:      'green',
  INACTIVE:    'gray',
  CHECKED_OUT: 'rose',
};

/**
 * Truncate a string to maxLen characters.
 */
export const truncate = (str, maxLen = 80) =>
  str && str.length > maxLen ? `${str.substring(0, maxLen)}…` : str;

/**
 * Generate a YYYY-MM string for the current month.
 */
export const currentYearMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};
