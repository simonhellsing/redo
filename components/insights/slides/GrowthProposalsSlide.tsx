'use client'

import { motion } from 'framer-motion'
import type { GrowthProposal } from '@/lib/insights/mockData'

interface GrowthProposalsSlideProps {
  proposals: GrowthProposal[]
  hasPositiveCashflow: boolean
}

export function GrowthProposalsSlide({
  proposals,
  hasPositiveCashflow,
}: GrowthProposalsSlideProps) {
  if (!hasPositiveCashflow) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-md"
        >
          <div className="text-6xl mb-6">⚠️</div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Fokusera på lönsamhet först
          </h2>
          <p className="text-neutral-400 text-lg">
            Innan vi föreslår tillväxtinvesteringar behöver du nå positivt
            kassaflöde. Fokusera på att öka intäkter eller minska kostnader.
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      <motion.p
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-neutral-400 text-xl mb-2 tracking-wide"
      >
        Tillväxtförslag
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-neutral-500 text-lg mb-10"
      >
        Med positivt kassaflöde kan du investera i tillväxt
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl"
      >
        {proposals.map((proposal, index) => (
          <motion.div
            key={proposal.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.15, duration: 0.5 }}
            className="bg-neutral-800/50 rounded-2xl p-6 border border-neutral-700 text-left"
          >
            <h3 className="text-xl font-bold text-white mb-2">
              {proposal.name}
            </h3>
            <p className="text-neutral-400 text-sm mb-4">
              {proposal.description}
            </p>

            <div className="space-y-2 text-sm">
              {proposal.investment > 0 && (
                <div className="flex justify-between">
                  <span className="text-neutral-500">Investering</span>
                  <span className="text-red-400">
                    -{new Intl.NumberFormat('sv-SE').format(proposal.investment)} kr
                  </span>
                </div>
              )}

              {proposal.monthlyCost && (
                <div className="flex justify-between">
                  <span className="text-neutral-500">Kostnad/mån</span>
                  <span className="text-neutral-300">
                    {new Intl.NumberFormat('sv-SE').format(proposal.monthlyCost)} kr
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-neutral-500">Förväntad avkastning</span>
                <span className="text-emerald-400">
                  +{new Intl.NumberFormat('sv-SE').format(proposal.expectedReturn)} kr
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-neutral-500">Tidsram</span>
                <span className="text-neutral-300">
                  {proposal.timeframeMonths} månader
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-neutral-700">
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">ROI</span>
                <span
                  className={`text-2xl font-bold ${
                    proposal.roi === Infinity
                      ? 'text-emerald-400'
                      : proposal.roi > 100
                        ? 'text-emerald-400'
                        : 'text-amber-400'
                  }`}
                >
                  {proposal.roi === Infinity ? '∞' : `${proposal.roi}%`}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}


