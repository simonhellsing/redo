'use client'

import { motion } from 'framer-motion'

interface ScenariosSlideProps {
  revenue: number
  totalCosts: number
  revenue10PctUp: {
    yearlyImpact: number
    newYearEndCash: number
  }
  costs10PctDown: {
    yearlyImpact: number
    newYearEndCash: number
  }
}

export function ScenariosSlide({
  revenue,
  totalCosts,
  revenue10PctUp,
  costs10PctDown,
}: ScenariosSlideProps) {
  const scenarios = [
    {
      title: '+10% intäkter',
      description: 'Om du ökar intäkterna med 10%',
      impact: revenue10PctUp.yearlyImpact,
      color: 'emerald',
      icon: '📈',
    },
    {
      title: '-10% kostnader',
      description: 'Om du minskar kostnaderna med 10%',
      impact: costs10PctDown.yearlyImpact,
      color: 'violet',
      icon: '✂️',
    },
    {
      title: '+5% pris',
      description: 'Om du höjer priset med 5%',
      impact: revenue * 0.05 * 12,
      color: 'amber',
      icon: '💰',
    },
  ]

  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      <motion.p
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-neutral-400 text-xl mb-2 tracking-wide"
      >
        What-If Scenarios
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-neutral-500 text-lg mb-10"
      >
        Små förändringar ger stor effekt på årsbasis
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl"
      >
        {scenarios.map((scenario, index) => (
          <motion.div
            key={scenario.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.15, duration: 0.5 }}
            className={`rounded-2xl p-6 border ${
              scenario.color === 'emerald'
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : scenario.color === 'violet'
                  ? 'bg-violet-500/10 border-violet-500/30'
                  : 'bg-amber-500/10 border-amber-500/30'
            }`}
          >
            <div className="text-4xl mb-4">{scenario.icon}</div>
            <h3 className="text-xl font-bold text-white mb-2">
              {scenario.title}
            </h3>
            <p className="text-neutral-400 text-sm mb-4">
              {scenario.description}
            </p>
            <div
              className={`text-3xl font-bold ${
                scenario.color === 'emerald'
                  ? 'text-emerald-400'
                  : scenario.color === 'violet'
                    ? 'text-violet-400'
                    : 'text-amber-400'
              }`}
            >
              +{new Intl.NumberFormat('sv-SE').format(scenario.impact)} kr
            </div>
            <p className="text-neutral-500 text-sm mt-1">per år</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="mt-10 text-neutral-500 max-w-lg"
      >
        Dessa beräkningar baseras på att förändringen appliceras konsekvent
        under hela året.
      </motion.p>
    </div>
  )
}

