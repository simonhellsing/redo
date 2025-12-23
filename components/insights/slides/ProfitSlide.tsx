'use client'

import { motion } from 'framer-motion'

interface ProfitSlideProps {
  netProfit: number
  profitMargin: number
  revenue: number
}

export function ProfitSlide({
  netProfit,
  profitMargin,
  revenue,
}: ProfitSlideProps) {
  const isPositive = netProfit >= 0
  const marginPercent = (profitMargin * 100).toFixed(0)

  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      <motion.p
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-neutral-400 text-xl mb-4 tracking-wide"
      >
        Nettoresultat
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <h2
          className={`text-6xl md:text-8xl font-bold ${
            isPositive ? 'text-emerald-400' : 'text-red-400'
          }`}
        >
          {isPositive ? '+' : ''}
          {new Intl.NumberFormat('sv-SE').format(netProfit)}
          <span className="text-3xl md:text-4xl ml-2 opacity-70">kr</span>
        </h2>
      </motion.div>

      {/* Profit margin */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="mt-10"
      >
        <div
          className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl ${
            isPositive ? 'bg-emerald-500/10' : 'bg-red-500/10'
          }`}
        >
          <span className="text-4xl font-bold text-white">
            {marginPercent}%
          </span>
          <span className="text-neutral-400">vinstmarginal</span>
        </div>
      </motion.div>

      {/* Visual breakdown */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="mt-10 text-neutral-500"
      >
        <div className="flex items-center justify-center gap-4">
          <span className="text-white">
            {new Intl.NumberFormat('sv-SE').format(revenue)} kr
          </span>
          <span>intäkter</span>
          <span className="text-2xl">→</span>
          <span
            className={isPositive ? 'text-emerald-400' : 'text-red-400'}
          >
            {new Intl.NumberFormat('sv-SE').format(netProfit)} kr
          </span>
          <span>resultat</span>
        </div>
      </motion.div>

      {isPositive && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.5 }}
          className="mt-8 text-emerald-400/80 text-lg"
        >
          ✓ Du går med vinst den här månaden
        </motion.p>
      )}

      {!isPositive && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.5 }}
          className="mt-8 text-red-400/80 text-lg"
        >
          ⚠ Du går med förlust den här månaden
        </motion.p>
      )}
    </div>
  )
}

