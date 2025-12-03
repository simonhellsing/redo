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

/**
 * Formats a number in compact "mkr" (million kronor) format
 * Example: 3450000 -> "3,45 mkr"
 */
export function formatMillionSEK(value: number): string {
  const millions = value / 1000000
  return new Intl.NumberFormat('sv-SE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(millions) + ' mkr'
}

