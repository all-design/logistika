'use client'

import { motion } from 'framer-motion'
import { Check, Circle, Clock } from 'lucide-react'

interface Phase {
  id: string
  name: string
  description?: string | null
  order: number
  color: string
  iconName: string
}

interface PhaseTimelineProps {
  phases: Phase[]
  currentPhaseId: string
  phaseStartedAt: Date
  daysToCompletePhase: number
}

export function PhaseTimeline({ phases, currentPhaseId, phaseStartedAt, daysToCompletePhase }: PhaseTimelineProps) {
  const currentIndex = phases.findIndex(p => p.id === currentPhaseId)
  
  return (
    <div className="w-full py-8">
      <div className="relative">
        {/* Progress line */}
        <div className="absolute top-6 left-0 right-0 h-1 bg-[#1a1a2e] rounded-full">
          <motion.div
            className="h-full bg-gradient-to-r from-[#10b981] to-[#06b6d4] rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${((currentIndex + 1) / phases.length) * 100}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
        
        {/* Phase nodes */}
        <div className="relative flex justify-between">
          {phases.map((phase, index) => {
            const isCompleted = index < currentIndex
            const isCurrent = index === currentIndex
            const isPending = index > currentIndex
            
            return (
              <motion.div
                key={phase.id}
                className="flex flex-col items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {/* Phase circle */}
                <motion.div
                  className={`
                    relative w-12 h-12 rounded-full flex items-center justify-center z-10
                    ${isCompleted ? 'bg-[#10b981]' : ''}
                    ${isCurrent ? 'bg-[#12121a] border-2 border-[#10b981] animate-pulse-glow' : ''}
                    ${isPending ? 'bg-[#1a1a2e] border border-[#2a2a3e]' : ''}
                  `}
                  style={isCurrent ? { boxShadow: `0 0 20px ${phase.color}50, 0 0 40px ${phase.color}30` } : {}}
                  whileHover={{ scale: 1.1 }}
                >
                  {isCompleted && (
                    <Check className="w-6 h-6 text-[#0a0a0f]" />
                  )}
                  {isCurrent && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    >
                      <Clock className="w-5 h-5 text-[#10b981]" />
                    </motion.div>
                  )}
                  {isPending && (
                    <Circle className="w-4 h-4 text-[#3a3a4e]" />
                  )}
                </motion.div>
                
                {/* Phase name */}
                <motion.div
                  className={`
                    mt-3 text-center
                    ${isCompleted ? 'text-[#10b981]' : ''}
                    ${isCurrent ? 'text-white font-semibold' : ''}
                    ${isPending ? 'text-[#4a4a5e]' : ''}
                  `}
                >
                  <p className="text-sm font-medium">{phase.name}</p>
                  {isCurrent && (
                    <CountdownTimer 
                      startedAt={phaseStartedAt} 
                      daysToComplete={daysToCompletePhase} 
                    />
                  )}
                </motion.div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function CountdownTimer({ startedAt, daysToComplete }: { startedAt: Date | string; daysToComplete: number }) {
  const calculateTimeLeft = () => {
    const start = typeof startedAt === 'string' ? new Date(startedAt) : startedAt
    const endTime = new Date(start.getTime() + daysToComplete * 24 * 60 * 60 * 1000)
    const now = new Date()
    const diff = endTime.getTime() - now.getTime()
    
    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, expired: true }
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    return { days, hours, minutes, expired: false }
  }
  
  const timeLeft = calculateTimeLeft()
  
  const getStatusClass = () => {
    if (timeLeft.expired) return 'countdown-urgent'
    if (timeLeft.days <= 1) return 'countdown-urgent'
    if (timeLeft.days <= 3) return 'countdown-warning'
    return 'countdown-normal'
  }
  
  return (
    <motion.div 
      className={`mt-2 text-xs ${getStatusClass()}`}
      animate={{ opacity: [1, 0.7, 1] }}
      transition={{ duration: 1, repeat: Infinity }}
    >
      {timeLeft.expired ? (
        <span>Prekoračeno vreme!</span>
      ) : (
        <span>
          {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
        </span>
      )}
    </motion.div>
  )
}
