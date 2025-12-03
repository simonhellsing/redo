import Papa from 'papaparse'

export type Transaction = {
  accountNumber: string // e.g. "1510"
  accountName: string // e.g. "Kundfordringar"
  date: Date
  text: string
  info: string
  debit: number // positive number
  credit: number // positive number
  balanceAfter: number | null
}

type RawRow = {
  konto: string | null
  namnVernr: string | null
  ks: string | null
  datum: string | null
  text: string | null
  transaktionsinfo: string | null
  debet: string | null
  kredit: string | null
  saldo: string | null
}

/**
 * Normalizes Swedish-formatted numbers to JavaScript numbers.
 * Handles:
 * - Non-breaking spaces as thousands separators
 * - Commas as decimal separators
 * - Unicode minus signs (U+2212) converted to regular minus
 * - Regular spaces stripped
 */
export function normalizeSwedishNumber(
  input: string | null,
  options?: { allowNull?: boolean }
): number | null {
  if (!input || input.trim() === '') {
    return options?.allowNull ? null : 0
  }

  // Replace non-breaking space (U+00A0) and regular spaces
  let cleaned = input.replace(/\u00A0/g, '').replace(/\s/g, '')
  
  // Replace Unicode minus (U+2212) with regular minus
  cleaned = cleaned.replace(/\u2212/g, '-')
  
  // Replace comma with dot for decimal separator
  cleaned = cleaned.replace(/,/g, '.')
  
  // Handle negative numbers that might be at the end (e.g., "813,−813")
  // If there's a minus at the end, it's a negative number
  if (cleaned.endsWith('−')) {
    cleaned = '-' + cleaned.slice(0, -1)
  }
  
  const parsed = parseFloat(cleaned)
  
  if (isNaN(parsed)) {
    return options?.allowNull ? null : 0
  }
  
  return parsed
}

/**
 * Checks if a row is a summary row that should be skipped
 */
function isSummaryRow(text: string | null): boolean {
  if (!text) return false
  const normalized = text.trim()
  return (
    normalized === 'Ingående balans' ||
    normalized === 'Ingående saldo' ||
    normalized === 'Omslutning' ||
    normalized === 'Utgående saldo'
  )
}

/**
 * Checks if a row is a separator row (e.g., "-------------------------")
 */
function isSeparatorRow(row: string[]): boolean {
  return row.some(cell => cell && cell.trim().startsWith('---'))
}

/**
 * Checks if a string is a valid account number (3-4 digits)
 */
function isAccountNumber(value: string | null): boolean {
  if (!value) return false
  return /^[0-9]{3,4}$/.test(value.trim())
}

/**
 * Finds the header row index in the CSV data
 */
function findHeaderRowIndex(rows: string[][]): number {
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    if (row.length >= 10 && row[0]?.trim() === 'Konto') {
      // Check if it matches the expected header structure
      const expectedHeaders = [
        'Konto',
        'Namn/Vernr',
        'Ks',
        '', // blank column
        'Datum',
        'Text',
        'Transaktionsinfo',
        'Debet',
        'Kredit',
        'Saldo',
      ]
      
      let matches = true
      for (let j = 0; j < Math.min(row.length, expectedHeaders.length); j++) {
        if (expectedHeaders[j] !== '' && row[j]?.trim() !== expectedHeaders[j]) {
          matches = false
          break
        }
      }
      
      if (matches) {
        return i
      }
    }
  }
  return -1
}

/**
 * Parses a huvudbok CSV from text string (for server-side use)
 */
export async function parseHuvudbokCsvFromText(
  csvText: string,
  fileName?: string
): Promise<Transaction[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      encoding: 'UTF-8',
      complete: (results) => {
        try {
          const rows = results.data as string[][]
          
          // Find the header row
          const headerIndex = findHeaderRowIndex(rows)
          if (headerIndex === -1) {
            reject(new Error('Could not find header row in CSV'))
            return
          }
          
          // Start processing from after the header row
          const dataRows = rows.slice(headerIndex + 1)
          
          const transactions: Transaction[] = []
          let currentAccountNumber: string | null = null
          let currentAccountName: string | null = null
          
          for (const row of dataRows) {
            // Skip empty rows or separator rows
            if (row.length === 0 || isSeparatorRow(row)) {
              continue
            }
            
            // Map row to RawRow structure
            const rawRow: RawRow = {
              konto: row[0]?.trim() || null,
              namnVernr: row[1]?.trim() || null,
              ks: row[2]?.trim() || null,
              datum: row[4]?.trim() || null, // Skip blank column at index 3
              text: row[5]?.trim() || null,
              transaktionsinfo: row[6]?.trim() || null,
              debet: row[7]?.trim() || null,
              kredit: row[8]?.trim() || null,
              saldo: row[9]?.trim() || null,
            }
            
            // Check if this is a new account section
            if (isAccountNumber(rawRow.konto)) {
              currentAccountNumber = rawRow.konto
              currentAccountName = rawRow.namnVernr || ''
              continue
            }
            
            // Skip if we don't have a current account
            if (!currentAccountNumber || !currentAccountName) {
              continue
            }
            
            // Skip summary rows
            if (isSummaryRow(rawRow.text)) {
              continue
            }
            
            // Skip rows without a date (not a transaction)
            if (!rawRow.datum || rawRow.datum.trim() === '') {
              continue
            }
            
            // Parse the date
            let date: Date
            try {
              // Parse YYYY-MM-DD format
              const dateParts = rawRow.datum.split('-')
              if (dateParts.length === 3) {
                date = new Date(
                  parseInt(dateParts[0], 10),
                  parseInt(dateParts[1], 10) - 1, // Month is 0-indexed
                  parseInt(dateParts[2], 10)
                )
              } else {
                // Try parsing as-is
                date = new Date(rawRow.datum)
              }
              
              if (isNaN(date.getTime())) {
                continue // Skip invalid dates
              }
            } catch {
              continue // Skip rows with invalid dates
            }
            
            // Parse amounts
            const debit = normalizeSwedishNumber(rawRow.debet) || 0
            const credit = normalizeSwedishNumber(rawRow.kredit) || 0
            const balanceAfter = normalizeSwedishNumber(rawRow.saldo, { allowNull: true })
            
            // Create transaction
            transactions.push({
              accountNumber: currentAccountNumber,
              accountName: currentAccountName,
              date,
              text: rawRow.text || '',
              info: rawRow.transaktionsinfo || '',
              debit,
              credit,
              balanceAfter,
            })
          }
          
          resolve(transactions)
        } catch (error) {
          reject(error)
        }
      },
      error: (error: any) => {
        reject(new Error(`Failed to parse CSV: ${error?.message || String(error)}`))
      },
    })
  })
}

/**
 * Parses a huvudbok CSV file and returns an array of transactions
 */
export async function parseHuvudbokCsv(file: File): Promise<Transaction[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      encoding: 'UTF-8',
      complete: (results) => {
        try {
          const rows = results.data as string[][]
          
          // Find the header row
          const headerIndex = findHeaderRowIndex(rows)
          if (headerIndex === -1) {
            reject(new Error('Could not find header row in CSV'))
            return
          }
          
          // Start processing from after the header row
          const dataRows = rows.slice(headerIndex + 1)
          
          const transactions: Transaction[] = []
          let currentAccountNumber: string | null = null
          let currentAccountName: string | null = null
          
          for (const row of dataRows) {
            // Skip empty rows or separator rows
            if (row.length === 0 || isSeparatorRow(row)) {
              continue
            }
            
            // Map row to RawRow structure
            const rawRow: RawRow = {
              konto: row[0]?.trim() || null,
              namnVernr: row[1]?.trim() || null,
              ks: row[2]?.trim() || null,
              datum: row[4]?.trim() || null, // Skip blank column at index 3
              text: row[5]?.trim() || null,
              transaktionsinfo: row[6]?.trim() || null,
              debet: row[7]?.trim() || null,
              kredit: row[8]?.trim() || null,
              saldo: row[9]?.trim() || null,
            }
            
            // Check if this is a new account section
            if (isAccountNumber(rawRow.konto)) {
              currentAccountNumber = rawRow.konto
              currentAccountName = rawRow.namnVernr || ''
              continue
            }
            
            // Skip if we don't have a current account
            if (!currentAccountNumber || !currentAccountName) {
              continue
            }
            
            // Skip summary rows
            if (isSummaryRow(rawRow.text)) {
              continue
            }
            
            // Skip rows without a date (not a transaction)
            if (!rawRow.datum || rawRow.datum.trim() === '') {
              continue
            }
            
            // Parse the date
            let date: Date
            try {
              // Parse YYYY-MM-DD format
              const dateParts = rawRow.datum.split('-')
              if (dateParts.length === 3) {
                date = new Date(
                  parseInt(dateParts[0], 10),
                  parseInt(dateParts[1], 10) - 1, // Month is 0-indexed
                  parseInt(dateParts[2], 10)
                )
              } else {
                // Try parsing as-is
                date = new Date(rawRow.datum)
              }
              
              if (isNaN(date.getTime())) {
                continue // Skip invalid dates
              }
            } catch {
              continue // Skip rows with invalid dates
            }
            
            // Parse amounts
            const debit = normalizeSwedishNumber(rawRow.debet) || 0
            const credit = normalizeSwedishNumber(rawRow.kredit) || 0
            const balanceAfter = normalizeSwedishNumber(rawRow.saldo, { allowNull: true })
            
            // Create transaction
            transactions.push({
              accountNumber: currentAccountNumber,
              accountName: currentAccountName,
              date,
              text: rawRow.text || '',
              info: rawRow.transaktionsinfo || '',
              debit,
              credit,
              balanceAfter,
            })
          }
          
          resolve(transactions)
        } catch (error) {
          reject(error)
        }
      },
      error: (error: any) => {
        reject(new Error(`Failed to parse CSV: ${error?.message || String(error)}`))
      },
    })
  })
}

