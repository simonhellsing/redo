'use client'

import { motion } from 'framer-motion'

interface IntroSlideProps {
  companyName: string
  month: string
  year: number
}

export function IntroSlide({ companyName, month, year }: IntroSlideProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="space-y-6"
      >
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-neutral-400 text-lg tracking-widest uppercase"
        >
          Din ekonomiska sammanfattning
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="text-5xl md:text-7xl font-bold text-white"
        >
          {companyName}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="flex items-center justify-center gap-3"
        >
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-emerald-500" />
          <span className="text-2xl md:text-3xl text-emerald-400 font-medium">
            {month} {year}
          </span>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-emerald-500" />
        </motion.div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        className="absolute bottom-12 text-neutral-500 text-sm"
      >
        Klicka eller tryck → för att fortsätta
      </motion.p>
    </div>
  )
}


