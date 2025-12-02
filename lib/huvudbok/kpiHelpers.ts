import { Transaction } from './parseHuvudbokCsv'

export type MonthlySummary = {
  year: number
  month: number // 1–12
  revenue: number
  expenses: number
  profit: number
}

export type KpiData = {
  revenue: number // sum of credits on income accounts (3000–3999)
  expenses: number // sum of debits on expense accounts (4000–7999)
  netProfit: number // revenue - expenses
  cashEnd: number // sum of net movement for cash/bank accounts (e.g. 1910, 1930, 1940)
  accountsReceivable: number // closing balance for account 1510 if available
  accountsPayable: number // closing balance for account 2440 if available
}

/**
 * Checks if an account number is in the income range (3000–3999)
 */
function isIncomeAccount(accountNumber: string): boolean {
  const num = parseInt(accountNumber, 10)
  return num >= 3000 && num <= 3999
}

/**
 * Checks if an account number is in the expense range (4000–7999)
 */
function isExpenseAccount(accountNumber: string): boolean {
  const num = parseInt(accountNumber, 10)
  return num >= 4000 && num <= 7999
}

/**
 * Checks if an account number is a cash/bank account
 */
function isCashAccount(accountNumber: string): boolean {
  const cashAccounts = ['1910', '1930', '1940', '1920', '1950']
  return cashAccounts.includes(accountNumber)
}

/**
 * Gets the closing balance for a specific account
 */
function getClosingBalance(
  transactions: Transaction[],
  accountNumber: string
): number {
  // Find the last transaction for this account
  const accountTransactions = transactions
    .filter((t) => t.accountNumber === accountNumber)
    .sort((a, b) => b.date.getTime() - a.date.getTime())

  if (accountTransactions.length === 0) {
    return 0
  }

  // Return the balanceAfter of the last transaction, or calculate from debit/credit
  const lastTransaction = accountTransactions[0]
  if (lastTransaction.balanceAfter !== null) {
    return lastTransaction.balanceAfter
  }

  // If balanceAfter is null, calculate from transactions
  let balance = 0
  for (const txn of accountTransactions) {
    balance += txn.debit - txn.credit
  }
  return balance
}

/**
 * Calculates KPIs from transactions
 */
export function calculateKpis(transactions: Transaction[]): KpiData {
  let revenue = 0
  let expenses = 0
  let cashNet = 0

  // Track cash accounts separately
  const cashAccounts = new Set<string>()

  for (const txn of transactions) {
    // Revenue: credits on income accounts
    if (isIncomeAccount(txn.accountNumber)) {
      revenue += txn.credit
    }

    // Expenses: debits on expense accounts
    if (isExpenseAccount(txn.accountNumber)) {
      expenses += txn.debit
    }

    // Cash: net movement (debit - credit) for cash accounts
    if (isCashAccount(txn.accountNumber)) {
      cashAccounts.add(txn.accountNumber)
      cashNet += txn.debit - txn.credit
    }
  }

  // Get closing balances for specific accounts
  const accountsReceivable = getClosingBalance(transactions, '1510')
  const accountsPayable = getClosingBalance(transactions, '2440')

  // For cash, use closing balance if available, otherwise use net movement
  let cashEnd = 0
  for (const account of cashAccounts) {
    const balance = getClosingBalance(transactions, account)
    if (balance !== 0) {
      cashEnd += balance
    } else {
      // Calculate from transactions if no closing balance
      const accountTxns = transactions.filter((t) => t.accountNumber === account)
      let accountBalance = 0
      for (const txn of accountTxns) {
        accountBalance += txn.debit - txn.credit
      }
      cashEnd += accountBalance
    }
  }

  // If we couldn't find closing balances, use net movement
  if (cashEnd === 0 && cashNet !== 0) {
    cashEnd = cashNet
  }

  return {
    revenue,
    expenses,
    netProfit: revenue - expenses,
    cashEnd,
    accountsReceivable,
    accountsPayable,
  }
}

/**
 * Builds monthly summaries from transactions
 */
export function buildMonthlySummaries(
  transactions: Transaction[]
): MonthlySummary[] {
  // Group transactions by year-month
  const monthlyData = new Map<string, { revenue: number; expenses: number }>()

  for (const txn of transactions) {
    const year = txn.date.getFullYear()
    const month = txn.date.getMonth() + 1
    const key = `${year}-${month.toString().padStart(2, '0')}`

    if (!monthlyData.has(key)) {
      monthlyData.set(key, { revenue: 0, expenses: 0 })
    }

    const data = monthlyData.get(key)!

    // Revenue: credits on income accounts
    if (isIncomeAccount(txn.accountNumber)) {
      data.revenue += txn.credit
    }

    // Expenses: debits on expense accounts
    if (isExpenseAccount(txn.accountNumber)) {
      data.expenses += txn.debit
    }
  }

  // Convert to array and sort by year-month
  const summaries: MonthlySummary[] = Array.from(monthlyData.entries())
    .map(([key, data]) => {
      const [yearStr, monthStr] = key.split('-')
      return {
        year: parseInt(yearStr, 10),
        month: parseInt(monthStr, 10),
        revenue: data.revenue,
        expenses: data.expenses,
        profit: data.revenue - data.expenses,
      }
    })
    .sort((a, b) => {
      if (a.year !== b.year) {
        return a.year - b.year
      }
      return a.month - b.month
    })

  return summaries
}

