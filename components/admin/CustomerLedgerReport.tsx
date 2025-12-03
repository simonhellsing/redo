'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
import { Text } from '@/components/ui/Text'
import { Transaction } from '@/lib/huvudbok/parseHuvudbokCsv'
import { calculateKpis, buildMonthlySummaries } from '@/lib/huvudbok/kpiHelpers'
import { formatCurrencySEK, formatNumberSEK } from '@/lib/huvudbok/formatCurrency'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

interface CustomerLedgerReportProps {
  transactions: Transaction[]
}

const monthNames = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Maj',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Okt',
  'Nov',
  'Dec',
]

export function CustomerLedgerReport({
  transactions,
}: CustomerLedgerReportProps) {
  const kpis = calculateKpis(transactions)
  const monthlySummaries = buildMonthlySummaries(transactions)

  // Format monthly data for charts
  const chartData = monthlySummaries.map((summary) => ({
    month: `${monthNames[summary.month - 1]} ${summary.year}`,
    monthShort: monthNames[summary.month - 1],
    revenue: summary.revenue,
    expenses: summary.expenses,
    profit: summary.profit,
  }))

  // Get latest 10 transactions sorted by date descending
  const latestTransactions = [...transactions]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 10)

  // Format date for display
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('sv-SE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date)
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card padding="lg">
          <div className="flex flex-col gap-2">
            <Text variant="label-small" className="text-[var(--neutral-500)]">
              Totala intäkter
            </Text>
            <Text variant="headline-medium" className="text-[var(--neutral-900)]">
              {formatCurrencySEK(kpis.revenue)}
            </Text>
            <Text variant="label-small" className="text-[var(--neutral-500)]">
              För perioden i huvudboken
            </Text>
          </div>
        </Card>

        <Card padding="lg">
          <div className="flex flex-col gap-2">
            <Text variant="label-small" className="text-[var(--neutral-500)]">
              Totala kostnader
            </Text>
            <Text variant="headline-medium" className="text-[var(--neutral-900)]">
              {formatCurrencySEK(kpis.expenses)}
            </Text>
            <Text variant="label-small" className="text-[var(--neutral-500)]">
              För perioden i huvudboken
            </Text>
          </div>
        </Card>

        <Card padding="lg">
          <div className="flex flex-col gap-2">
            <Text variant="label-small" className="text-[var(--neutral-500)]">
              Nettoresultat
            </Text>
            <Text
              variant="headline-medium"
              className={
                kpis.netProfit >= 0
                  ? 'text-[var(--positive-500)]'
                  : 'text-[var(--negative-500)]'
              }
            >
              {formatCurrencySEK(kpis.netProfit)}
            </Text>
            <Text variant="label-small" className="text-[var(--neutral-500)]">
              För perioden i huvudboken
            </Text>
          </div>
        </Card>

        <Card padding="lg">
          <div className="flex flex-col gap-2">
            <Text variant="label-small" className="text-[var(--neutral-500)]">
              Kassa vid periodens slut
            </Text>
            <Text variant="headline-medium" className="text-[var(--neutral-900)]">
              {formatCurrencySEK(kpis.cashEnd)}
            </Text>
            <Text variant="label-small" className="text-[var(--neutral-500)]">
              För perioden i huvudboken
            </Text>
          </div>
        </Card>

        <Card padding="lg">
          <div className="flex flex-col gap-2">
            <Text variant="label-small" className="text-[var(--neutral-500)]">
              Kundfordringar (1510)
            </Text>
            <Text variant="headline-medium" className="text-[var(--neutral-900)]">
              {formatCurrencySEK(kpis.accountsReceivable)}
            </Text>
            <Text variant="label-small" className="text-[var(--neutral-500)]">
              För perioden i huvudboken
            </Text>
          </div>
        </Card>

        <Card padding="lg">
          <div className="flex flex-col gap-2">
            <Text variant="label-small" className="text-[var(--neutral-500)]">
              Leverantörsskulder (2440)
            </Text>
            <Text variant="headline-medium" className="text-[var(--neutral-900)]">
              {formatCurrencySEK(kpis.accountsPayable)}
            </Text>
            <Text variant="label-small" className="text-[var(--neutral-500)]">
              För perioden i huvudboken
            </Text>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Profit Line Chart */}
        <Card padding="lg">
          <div className="flex flex-col gap-4">
            <Text variant="title-small" className="text-[var(--neutral-900)]">
              Månadsvis resultat
            </Text>
            <ChartContainer
              config={{
                profit: {
                  label: 'Resultat',
                  color: 'var(--positive-500)',
                },
              }}
              className="h-[300px] w-full"
            >
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--neutral-200)" />
                <XAxis
                  dataKey="monthShort"
                  stroke="var(--neutral-500)"
                  style={{ fontSize: '12px' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="var(--neutral-500)"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => formatNumberSEK(value)}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value: any) => formatCurrencySEK(Number(value))}
                    />
                  }
                />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="var(--positive-500)"
                  strokeWidth={2}
                  dot={{ fill: 'var(--positive-500)', r: 4 }}
                />
              </LineChart>
            </ChartContainer>
          </div>
        </Card>

        {/* Revenue vs Expenses Bar Chart */}
        <Card padding="lg">
          <div className="flex flex-col gap-4">
            <Text variant="title-small" className="text-[var(--neutral-900)]">
              Intäkter vs Kostnader
            </Text>
            <ChartContainer
              config={{
                revenue: {
                  label: 'Intäkter',
                  color: 'var(--positive-500)',
                },
                expenses: {
                  label: 'Kostnader',
                  color: 'var(--negative-500)',
                },
              }}
              className="h-[300px] w-full"
            >
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--neutral-200)" />
                <XAxis
                  dataKey="monthShort"
                  stroke="var(--neutral-500)"
                  style={{ fontSize: '12px' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="var(--neutral-500)"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => formatNumberSEK(value)}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value: any) => formatCurrencySEK(Number(value))}
                    />
                  }
                />
                <Legend />
                <Bar
                  dataKey="revenue"
                  fill="var(--positive-500)"
                  name="Intäkter"
                  radius={4}
                />
                <Bar
                  dataKey="expenses"
                  fill="var(--negative-500)"
                  name="Kostnader"
                  radius={4}
                />
              </BarChart>
            </ChartContainer>
          </div>
        </Card>
      </div>

      {/* Transaction Preview Table */}
      <Card padding="lg">
        <div className="flex flex-col gap-4">
          <Text variant="headline-small" className="text-[var(--neutral-900)]">
            Senaste transaktioner
          </Text>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[var(--neutral-200)]">
                  <th className="text-left py-2 px-3">
                    <Text
                      variant="label-small"
                      className="text-[var(--neutral-500)] font-semibold"
                    >
                      Datum
                    </Text>
                  </th>
                  <th className="text-left py-2 px-3">
                    <Text
                      variant="label-small"
                      className="text-[var(--neutral-500)] font-semibold"
                    >
                      Konto
                    </Text>
                  </th>
                  <th className="text-left py-2 px-3">
                    <Text
                      variant="label-small"
                      className="text-[var(--neutral-500)] font-semibold"
                    >
                      Text
                    </Text>
                  </th>
                  <th className="text-right py-2 px-3">
                    <Text
                      variant="label-small"
                      className="text-[var(--neutral-500)] font-semibold"
                    >
                      Debet
                    </Text>
                  </th>
                  <th className="text-right py-2 px-3">
                    <Text
                      variant="label-small"
                      className="text-[var(--neutral-500)] font-semibold"
                    >
                      Kredit
                    </Text>
                  </th>
                </tr>
              </thead>
              <tbody>
                {latestTransactions.map((txn, index) => (
                  <tr
                    key={index}
                    className="border-b border-[var(--neutral-100)] hover:bg-[var(--neutral-50)]"
                  >
                    <td className="py-3 px-3">
                      <Text variant="body-small" className="text-[var(--neutral-900)]">
                        {formatDate(txn.date)}
                      </Text>
                    </td>
                    <td className="py-3 px-3">
                      <Text variant="body-small" className="text-[var(--neutral-900)]">
                        {txn.accountNumber} - {txn.accountName}
                      </Text>
                    </td>
                    <td className="py-3 px-3">
                      <Text variant="body-small" className="text-[var(--neutral-900)]">
                        {txn.text}
                      </Text>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Text variant="body-small" className="text-[var(--neutral-900)]">
                        {txn.debit > 0 ? formatNumberSEK(txn.debit) : '-'}
                      </Text>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Text variant="body-small" className="text-[var(--neutral-900)]">
                        {txn.credit > 0 ? formatNumberSEK(txn.credit) : '-'}
                      </Text>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  )
}

