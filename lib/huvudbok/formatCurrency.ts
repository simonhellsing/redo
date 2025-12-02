/**
 * Formats a number as Swedish currency (SEK)
 * Uses space as thousands separator and "kr" suffix
 */
export function formatCurrencySEK(value: number): string {
  return new Intl.NumberFormat('sv-SE', {
    style: 'currency',
    currency: 'SEK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

/**
 * Formats a number as Swedish currency without the "kr" suffix
 * Useful for tables where currency is indicated in column header
 */
export function formatNumberSEK(value: number): string {
  return new Intl.NumberFormat('sv-SE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

