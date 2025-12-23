'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

interface CTASlideProps {
  companyName: string
}

export function CTASlide({ companyName }: CTASlideProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="max-w-xl"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-6xl mb-6"
        >
          🎯
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-4xl md:text-5xl font-bold text-white mb-6"
        >
          Vill du testa egna scenarios?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-neutral-400 text-xl mb-10"
        >
          Utforska hur olika beslut påverkar {companyName}s framtid
          med vår simuleringsmodul.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <Link
            href="/mock/simulations"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold text-xl px-10 py-5 rounded-2xl transition-all transform hover:scale-105 shadow-lg shadow-emerald-500/25"
          >
            <span>Simulera utfall</span>
            <span className="text-2xl">→</span>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="mt-12 flex items-center justify-center gap-6"
        >
          <button
            onClick={() => window.location.reload()}
            className="text-neutral-500 hover:text-neutral-300 transition-colors"
          >
            ← Se presentationen igen
          </button>
        </motion.div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        className="absolute bottom-12 text-neutral-600 text-sm"
      >
        Tack för att du tittade på din ekonomiska sammanfattning
      </motion.p>
    </div>
  )
}

