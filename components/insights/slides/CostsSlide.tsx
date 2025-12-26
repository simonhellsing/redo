'use client'

import { motion } from 'framer-motion'

interface CostsSlideProps {
  fixedCosts: number
  variableCosts: number
}

export function CostsSlide({ fixedCosts, variableCosts }: CostsSlideProps) {
  const totalCosts = fixedCosts + variableCosts
  const fixedPercent = (fixedCosts / totalCosts) * 100
  const variablePercent = (variableCosts / totalCosts) * 100

  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      <motion.p
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-neutral-400 text-xl mb-8 tracking-wide"
      >
        Kostnadsfördelning
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="mb-12"
      >
        <h2 className="text-5xl md:text-7xl font-bold text-white">
          {new Intl.NumberFormat('sv-SE').format(totalCosts)}
          <span className="text-2xl md:text-3xl ml-2 text-neutral-400">kr</span>
        </h2>
        <p className="text-neutral-500 mt-2">totala kostnader</p>
      </motion.div>

      {/* Cost bar visualization */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="w-full max-w-xl"
      >
        <div className="h-8 rounded-full overflow-hidden flex bg-neutral-800">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${fixedPercent}%` }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="bg-gradient-to-r from-violet-600 to-violet-500 h-full"
          />
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${variablePercent}%` }}
            transition={{ delay: 1, duration: 0.8 }}
            className="bg-gradient-to-r from-amber-500 to-amber-400 h-full"
          />
        </div>
      </motion.div>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="mt-8 flex flex-col md:flex-row gap-8"
      >
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-violet-500" />
          <div className="text-left">
            <p className="text-white font-semibold text-lg">
              {new Intl.NumberFormat('sv-SE').format(fixedCosts)} kr
            </p>
            <p className="text-neutral-400 text-sm">
              Fasta kostnader ({fixedPercent.toFixed(0)}%)
            </p>
            <p className="text-neutral-500 text-xs mt-1">
              Löner, hyra, försäkringar
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-amber-500" />
          <div className="text-left">
            <p className="text-white font-semibold text-lg">
              {new Intl.NumberFormat('sv-SE').format(variableCosts)} kr
            </p>
            <p className="text-neutral-400 text-sm">
              Rörliga kostnader ({variablePercent.toFixed(0)}%)
            </p>
            <p className="text-neutral-500 text-xs mt-1">
              Inköp, material, frakt
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}


