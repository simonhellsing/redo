'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface RevenueSlideProps {
  revenue: number
  changePercent: number
  previousRevenue: number
}

function AnimatedNumber({
  value,
  duration = 1.5,
}: {
  value: number
  duration?: number
}) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const startTime = Date.now()
    const startValue = 0

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / (duration * 1000), 1)

      // Easing function (ease-out)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(startValue + (value - startValue) * eased)

      setDisplayValue(current)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [value, duration])

  return (
    <span>
      {new Intl.NumberFormat('sv-SE').format(displayValue)}
    </span>
  )
}

export function RevenueSlide({
  revenue,
  changePercent,
  previousRevenue,
}: RevenueSlideProps) {
  const isPositive = changePercent >= 0

  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      <motion.p
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-neutral-400 text-xl mb-4 tracking-wide"
      >
        Månadens intäkter
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="relative"
      >
        <h2 className="text-6xl md:text-8xl font-bold text-white">
          <AnimatedNumber value={revenue} />
          <span className="text-3xl md:text-4xl ml-2 text-neutral-400">kr</span>
        </h2>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="mt-8 flex items-center gap-3"
      >
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-full ${
            isPositive
              ? 'bg-emerald-500/20 text-emerald-400'
              : 'bg-red-500/20 text-red-400'
          }`}
        >
          <span className="text-2xl">
            {isPositive ? '↑' : '↓'}
          </span>
          <span className="text-xl font-semibold">
            {isPositive ? '+' : ''}
            {changePercent.toFixed(0)}%
          </span>
        </div>
        <span className="text-neutral-500">vs förra månaden</span>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="mt-6 text-neutral-500"
      >
        Förra månaden: {new Intl.NumberFormat('sv-SE').format(previousRevenue)} kr
      </motion.p>
    </div>
  )
}

