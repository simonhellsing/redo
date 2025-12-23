'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MonthlyFinancialData, CalculatedScenarios } from '@/lib/insights/mockData'
import { calculateInsights, calculateRevenueChange } from '@/lib/insights/calculateInsights'

import { IntroSlide } from './slides/IntroSlide'
import { RevenueSlide } from './slides/RevenueSlide'
import { CostsSlide } from './slides/CostsSlide'
import { ProfitSlide } from './slides/ProfitSlide'
import { RunwaySlide } from './slides/RunwaySlide'
import { ForecastSlide } from './slides/ForecastSlide'
import { ScenariosSlide } from './slides/ScenariosSlide'
import { GrowthProposalsSlide } from './slides/GrowthProposalsSlide'
import { CTASlide } from './slides/CTASlide'

interface InsightsPresentationProps {
  data: MonthlyFinancialData
}

export function InsightsPresentation({ data }: InsightsPresentationProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [direction, setDirection] = useState(0)

  const insights: CalculatedScenarios = calculateInsights(data)
  const revenueChange = calculateRevenueChange(data)

  const totalSlides = 9

  const goToNextSlide = useCallback(() => {
    if (currentSlide < totalSlides - 1) {
      setDirection(1)
      setCurrentSlide((prev) => prev + 1)
    }
  }, [currentSlide])

  const goToPrevSlide = useCallback(() => {
    if (currentSlide > 0) {
      setDirection(-1)
      setCurrentSlide((prev) => prev - 1)
    }
  }, [currentSlide])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        goToNextSlide()
      } else if (e.key === 'ArrowLeft' || e.key === 'Backspace') {
        e.preventDefault()
        goToPrevSlide()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goToNextSlide, goToPrevSlide])

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
    }),
  }

  const renderSlide = () => {
    switch (currentSlide) {
      case 0:
        return (
          <IntroSlide
            companyName={data.companyName}
            month={data.period.month}
            year={data.period.year}
          />
        )
      case 1:
        return (
          <RevenueSlide
            revenue={data.revenue}
            changePercent={revenueChange}
            previousRevenue={data.previousMonthRevenue}
          />
        )
      case 2:
        return (
          <CostsSlide
            fixedCosts={data.fixedCosts}
            variableCosts={data.variableCosts}
          />
        )
      case 3:
        return (
          <ProfitSlide
            netProfit={data.netProfit}
            profitMargin={data.profitMargin}
            revenue={data.revenue}
          />
        )
      case 4:
        return (
          <RunwaySlide
            cashBalance={data.cashBalance}
            monthsOfCash={insights.runway.monthsOfCash}
            isCritical={insights.runway.isCritical}
            bankruptcyMonths={insights.runway.bankruptcyMonths}
            netProfit={data.netProfit}
          />
        )
      case 5:
        return (
          <ForecastSlide
            yearEndRevenue={insights.statusQuo.yearEndRevenue}
            yearEndProfit={insights.statusQuo.yearEndProfit}
            yearEndCash={insights.statusQuo.yearEndCash}
            monthsRemaining={insights.statusQuo.monthsRemaining}
            currentMonthProfit={data.netProfit}
          />
        )
      case 6:
        return (
          <ScenariosSlide
            revenue={data.revenue}
            totalCosts={data.fixedCosts + data.variableCosts}
            revenue10PctUp={insights.revenue10PctUp}
            costs10PctDown={insights.costs10PctDown}
          />
        )
      case 7:
        return (
          <GrowthProposalsSlide
            proposals={insights.growthProposals}
            hasPositiveCashflow={data.netProfit >= 0}
          />
        )
      case 8:
        return <CTASlide companyName={data.companyName} />
      default:
        return null
    }
  }

  return (
    <div
      className="fixed inset-0 bg-neutral-900 overflow-hidden cursor-pointer"
      onClick={goToNextSlide}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-800" />
      
      {/* Subtle pattern overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Slide content */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentSlide}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          className="absolute inset-0"
        >
          {renderSlide()}
        </motion.div>
      </AnimatePresence>

      {/* Progress indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2">
        {Array.from({ length: totalSlides }).map((_, index) => (
          <button
            key={index}
            onClick={(e) => {
              e.stopPropagation()
              setDirection(index > currentSlide ? 1 : -1)
              setCurrentSlide(index)
            }}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'bg-white w-6'
                : index < currentSlide
                  ? 'bg-emerald-500/50'
                  : 'bg-neutral-600'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Navigation arrows */}
      {currentSlide > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            goToPrevSlide()
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-neutral-500 hover:text-white transition-colors"
          aria-label="Previous slide"
        >
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      )}

      {currentSlide < totalSlides - 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            goToNextSlide()
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-neutral-500 hover:text-white transition-colors"
          aria-label="Next slide"
        >
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      )}

      {/* Slide counter */}
      <div className="absolute top-4 right-4 text-neutral-600 text-sm font-mono">
        {currentSlide + 1} / {totalSlides}
      </div>

      {/* Exit button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          window.history.back()
        }}
        className="absolute top-4 left-4 p-2 text-neutral-500 hover:text-white transition-colors"
        aria-label="Exit presentation"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  )
}

