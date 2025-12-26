'use client'

import { motion } from 'framer-motion'

interface ForecastSlideProps {
  yearEndRevenue: number
  yearEndProfit: number
  yearEndCash: number
  monthsRemaining: number
  currentMonthProfit: number
}

export function ForecastSlide({
  yearEndRevenue,
  yearEndProfit,
  yearEndCash,
  monthsRemaining,
  currentMonthProfit,
}: ForecastSlideProps) {
  const isPositiveProfit = yearEndProfit >= 0

  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      <motion.p
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-neutral-400 text-xl mb-2 tracking-wide"
      >
        Framtidsprognos
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-neutral-500 text-lg mb-10"
      >
        Om resten av året ser ut som den här månaden...
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl"
      >
        {/* Annual revenue */}
        <div className="bg-neutral-800/50 rounded-2xl p-6 border border-neutral-700">
          <p className="text-neutral-400 text-sm mb-2">Årsintäkt</p>
          <p className="text-3xl md:text-4xl font-bold text-white">
            {(yearEndRevenue / 1000000).toFixed(1).replace('.', ',')} mkr
          </p>
        </div>

        {/* Annual profit */}
        <div
          className={`rounded-2xl p-6 border ${
            isPositiveProfit
              ? 'bg-emerald-500/10 border-emerald-500/30'
              : 'bg-red-500/10 border-red-500/30'
          }`}
        >
          <p className="text-neutral-400 text-sm mb-2">Årsresultat</p>
          <p
            className={`text-3xl md:text-4xl font-bold ${
              isPositiveProfit ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {isPositiveProfit ? '+' : ''}
            {(yearEndProfit / 1000000).toFixed(1).replace('.', ',')} mkr
          </p>
        </div>

        {/* Year-end cash */}
        <div className="bg-neutral-800/50 rounded-2xl p-6 border border-neutral-700">
          <p className="text-neutral-400 text-sm mb-2">Kassa vid årsskiftet</p>
          <p className="text-3xl md:text-4xl font-bold text-white">
            {(yearEndCash / 1000000).toFixed(1).replace('.', ',')} mkr
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="mt-10 text-neutral-500"
      >
        <p>
          Baserat på att de återstående{' '}
          <span className="text-white">{monthsRemaining} månaderna</span>{' '}
          ser ut som denna månad
        </p>
        <p className="mt-2">
          Månatligt resultat:{' '}
          <span
            className={
              currentMonthProfit >= 0 ? 'text-emerald-400' : 'text-red-400'
            }
          >
            {currentMonthProfit >= 0 ? '+' : ''}
            {new Intl.NumberFormat('sv-SE').format(currentMonthProfit)} kr
          </span>
        </p>
      </motion.div>
    </div>
  )
}


