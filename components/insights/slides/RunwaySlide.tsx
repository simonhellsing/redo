'use client'

import { motion } from 'framer-motion'

interface RunwaySlideProps {
  cashBalance: number
  monthsOfCash: number
  isCritical: boolean
  bankruptcyMonths?: number
  netProfit: number
}

export function RunwaySlide({
  cashBalance,
  monthsOfCash,
  isCritical,
  bankruptcyMonths,
  netProfit,
}: RunwaySlideProps) {
  const isProfitable = netProfit >= 0

  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      <motion.p
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-neutral-400 text-xl mb-4 tracking-wide"
      >
        Likviditet & Runway
      </motion.p>

      {/* Cash balance */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="mb-8"
      >
        <h2 className="text-5xl md:text-7xl font-bold text-white">
          {new Intl.NumberFormat('sv-SE').format(cashBalance)}
          <span className="text-2xl md:text-3xl ml-2 text-neutral-400">kr</span>
        </h2>
        <p className="text-neutral-500 mt-2">på kontot</p>
      </motion.div>

      {/* Runway indicator */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className={`px-8 py-6 rounded-3xl ${
          isCritical
            ? 'bg-red-500/10 border border-red-500/30'
            : isProfitable
              ? 'bg-emerald-500/10 border border-emerald-500/30'
              : 'bg-amber-500/10 border border-amber-500/30'
        }`}
      >
        {isProfitable ? (
          <>
            <p className="text-emerald-400 text-lg mb-2">
              ✓ Positivt kassaflöde
            </p>
            <p className="text-4xl md:text-5xl font-bold text-white">
              {monthsOfCash} månader
            </p>
            <p className="text-neutral-400 mt-2">
              buffert vid nuvarande kostnader
            </p>
          </>
        ) : (
          <>
            <p
              className={`text-lg mb-2 ${
                isCritical ? 'text-red-400' : 'text-amber-400'
              }`}
            >
              {isCritical ? '⚠ Kritisk nivå' : '⚡ Uppmärksamhet krävs'}
            </p>
            <p className="text-4xl md:text-5xl font-bold text-white">
              {bankruptcyMonths || monthsOfCash} månader
            </p>
            <p className="text-neutral-400 mt-2">
              innan pengarna tar slut
            </p>
          </>
        )}
      </motion.div>

      {/* Warning message for critical runway */}
      {isCritical && bankruptcyMonths && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="mt-8 max-w-md"
        >
          <p className="text-red-400 text-xl font-medium">
            I den här takten är du i konkurs om {bankruptcyMonths} månader.
          </p>
          <p className="text-neutral-500 mt-2">
            Du behöver öka intäkterna eller minska kostnaderna.
          </p>
        </motion.div>
      )}

      {isProfitable && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="mt-8 text-neutral-500 max-w-md"
        >
          Med positivt kassaflöde växer din buffert varje månad.
          <br />
          <span className="text-emerald-400">
            +{new Intl.NumberFormat('sv-SE').format(netProfit)} kr/mån
          </span>
        </motion.p>
      )}
    </div>
  )
}


