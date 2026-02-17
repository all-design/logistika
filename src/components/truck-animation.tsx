'use client'

import { motion } from 'framer-motion'

export function TruckAnimation() {
  return (
    <div className="relative w-full h-20 overflow-hidden">
      <motion.div
        className="absolute flex items-center"
        animate={{
          x: ['-100%', '100vw']
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'linear'
        }}
      >
        {/* Truck SVG */}
        <svg width="80" height="40" viewBox="0 0 80 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Trailer */}
          <rect x="0" y="5" width="45" height="25" rx="2" fill="#1a1a2e" stroke="#10b981" strokeWidth="1.5"/>
          {/* Cab */}
          <rect x="45" y="10" width="25" height="20" rx="2" fill="#12121a" stroke="#10b981" strokeWidth="1.5"/>
          {/* Window */}
          <rect x="52" y="13" width="15" height="8" rx="1" fill="#06b6d4" opacity="0.6"/>
          {/* Wheels */}
          <circle cx="15" cy="32" r="5" fill="#2a2a3e" stroke="#10b981" strokeWidth="1"/>
          <circle cx="35" cy="32" r="5" fill="#2a2a3e" stroke="#10b981" strokeWidth="1"/>
          <circle cx="60" cy="32" r="5" fill="#2a2a3e" stroke="#10b981" strokeWidth="1"/>
          {/* Wheel centers */}
          <circle cx="15" cy="32" r="2" fill="#10b981"/>
          <circle cx="35" cy="32" r="2" fill="#10b981"/>
          <circle cx="60" cy="32" r="2" fill="#10b981"/>
          {/* Glow effect */}
          <rect x="0" y="5" width="45" height="25" rx="2" fill="url(#truckGlow)" opacity="0.3"/>
          <defs>
            <linearGradient id="truckGlow" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#10b981"/>
              <stop offset="100%" stopColor="#06b6d4"/>
            </linearGradient>
          </defs>
        </svg>
        
        {/* Car on trailer */}
        <svg width="35" height="18" viewBox="0 0 35 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="-ml-20 mt-1">
          <rect x="2" y="6" width="28" height="9" rx="3" fill="#2a2a3e" stroke="#06b6d4" strokeWidth="1"/>
          <rect x="8" y="2" width="16" height="8" rx="2" fill="#1a1a2e" stroke="#06b6d4" strokeWidth="1"/>
          <circle cx="8" cy="15" r="2.5" fill="#2a2a3e" stroke="#06b6d4" strokeWidth="0.75"/>
          <circle cx="24" cy="15" r="2.5" fill="#2a2a3e" stroke="#06b6d4" strokeWidth="0.75"/>
        </svg>
      </motion.div>
      
      {/* Road lines */}
      <div className="absolute bottom-0 w-full h-1 bg-gradient-to-r from-transparent via-[#10b981]/30 to-transparent"/>
    </div>
  )
}

export function StaticTruckIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="48" height="28" viewBox="0 0 80 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Trailer */}
      <rect x="0" y="5" width="45" height="25" rx="2" fill="#1a1a2e" stroke="#10b981" strokeWidth="1.5"/>
      {/* Cab */}
      <rect x="45" y="10" width="25" height="20" rx="2" fill="#12121a" stroke="#10b981" strokeWidth="1.5"/>
      {/* Window */}
      <rect x="52" y="13" width="15" height="8" rx="1" fill="#06b6d4" opacity="0.6"/>
      {/* Wheels */}
      <circle cx="15" cy="32" r="5" fill="#2a2a3e" stroke="#10b981" strokeWidth="1"/>
      <circle cx="35" cy="32" r="5" fill="#2a2a3e" stroke="#10b981" strokeWidth="1"/>
      <circle cx="60" cy="32" r="5" fill="#2a2a3e" stroke="#10b981" strokeWidth="1"/>
    </svg>
  )
}
