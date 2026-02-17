'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Package, Truck, MapPin, Clock, Check, AlertCircle, Mail, Car } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TruckAnimation } from './truck-animation'
import { PhaseTimeline } from './phase-timeline'

interface Phase {
  id: string
  name: string
  description?: string | null
  order: number
  defaultDaysToComplete: number
  color: string
  iconName: string
}

interface PhaseHistory {
  id: string
  phaseId: string
  phaseName: string
  changedAt: Date | string
  notes?: string | null
  daysInPhase?: number | null
}

interface Transport {
  id: string
  trackingNumber: string
  customerEmail: string
  customerName: string
  vehicleMake: string
  vehicleModel: string
  vehicleYear?: string | null
  vehicleVin?: string | null
  originLocation: string
  destinationLocation: string
  currentPhase: Phase
  status: string
  phaseStartedAt: Date | string
  daysToCompletePhase: number
  notes?: string | null
  estimatedDelivery?: Date | string | null
  phaseHistory: PhaseHistory[]
}

export function TrackingForm() {
  const [trackingNumber, setTrackingNumber] = useState('')
  const [transport, setTransport] = useState<Transport | null>(null)
  const [allPhases, setAllPhases] = useState<Phase[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!trackingNumber.trim()) return
    
    setIsLoading(true)
    setError('')
    setHasSearched(true)
    
    try {
      const res = await fetch(`/api/track?number=${encodeURIComponent(trackingNumber.trim())}`)
      const data = await res.json()
      
      if (data.error) {
        setError(data.error)
        setTransport(null)
      } else {
        setTransport(data.transport)
        setAllPhases(data.allPhases)
      }
    } catch {
      setError('Greška pri pretrazi. Pokušajte ponovo.')
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="space-y-6">
      {/* Search Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <form onSubmit={handleSearch} className="relative">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#10b981]" />
            <Input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Unesite broj za praćenje (npr. TR-XXXXX-XXXX)"
              className="pl-12 pr-4 h-14 bg-[#12121a] border-[#10b981]/30 text-lg focus:border-[#10b981] transition-all"
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 h-12 bg-[#10b981] hover:bg-[#059669] btn-glow text-lg"
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Package className="w-6 h-6" />
              </motion.div>
            ) : (
              <>
                <Search className="w-5 h-5 mr-2" />
                Pronađi Transport
              </>
            )}
          </Button>
        </form>
      </motion.div>
      
      {/* Results */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Card className="bg-[#12121a] border-red-500/30 max-w-2xl mx-auto">
              <CardContent className="py-8 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-400 text-lg">{error}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
        
        {transport && allPhases.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Status Banner */}
            <Card className={`glow-border ${
              transport.status === 'completed' ? 'border-[#10b981]' :
              transport.status === 'cancelled' ? 'border-red-500' :
              'border-[#06b6d4]'
            }`}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Package className="w-6 h-6 text-[#10b981]" />
                      <span className="font-mono text-xl text-[#10b981] font-bold">
                        {transport.trackingNumber}
                      </span>
                      <Badge 
                        variant={transport.status === 'completed' ? 'default' : transport.status === 'cancelled' ? 'destructive' : 'secondary'}
                        className="ml-2"
                      >
                        {transport.status === 'active' ? 'U toku' : 
                         transport.status === 'completed' ? 'Završen' : 'Otkazan'}
                      </Badge>
                    </div>
                    <h2 className="text-2xl font-bold mb-1">
                      {transport.vehicleMake} {transport.vehicleModel} {transport.vehicleYear}
                    </h2>
                    <p className="text-[#888]">
                      {transport.customerName}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 text-lg">
                    <MapPin className="w-5 h-5 text-[#06b6d4]" />
                    <span>{transport.originLocation}</span>
                    <TruckAnimation_mini />
                    <span className="text-[#10b981]">{transport.destinationLocation}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Phase Timeline */}
            <Card className="bg-[#12121a] border-[#10b981]/20">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#10b981]" />
                  Trenutna Faza
                </h3>
                
                <div className="mb-6">
                  <Badge 
                    className="text-lg px-4 py-2"
                    style={{ 
                      backgroundColor: `${transport.currentPhase.color}20`,
                      color: transport.currentPhase.color,
                      borderColor: transport.currentPhase.color,
                      borderWidth: 1
                    }}
                  >
                    {transport.currentPhase.name}
                  </Badge>
                  
                  {transport.status === 'active' && (
                    <div className="mt-4">
                      <PhaseTimeline
                        phases={allPhases}
                        currentPhaseId={transport.currentPhase.id}
                        phaseStartedAt={transport.phaseStartedAt}
                        daysToCompletePhase={transport.daysToCompletePhase}
                      />
                    </div>
                  )}
                </div>
                
                {/* Phase History */}
                <div className="mt-8">
                  <h4 className="text-md font-semibold mb-4 flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#10b981]" />
                    Istorija Transporta
                  </h4>
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {transport.phaseHistory.map((history, index) => (
                      <motion.div
                        key={history.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-3 p-3 bg-[#1a1a2e] rounded-lg"
                      >
                        <div className="w-2 h-2 rounded-full bg-[#10b981]" />
                        <div className="flex-1">
                          <p className="font-medium">{history.phaseName}</p>
                          <p className="text-sm text-[#666]">
                            {new Date(history.changedAt).toLocaleString('sr-RS')}
                          </p>
                        </div>
                        {history.daysInPhase && (
                          <Badge variant="outline" className="text-xs">
                            {history.daysInPhase} dana
                          </Badge>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Vehicle Details */}
            <Card className="bg-[#12121a] border-[#10b981]/20">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Car className="w-5 h-5 text-[#10b981]" />
                  Detalji Vozila
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-[#666]">Marka</p>
                    <p className="font-medium">{transport.vehicleMake}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-[#666]">Model</p>
                    <p className="font-medium">{transport.vehicleModel}</p>
                  </div>
                  {transport.vehicleYear && (
                    <div className="space-y-2">
                      <p className="text-sm text-[#666]">Godina</p>
                      <p className="font-medium">{transport.vehicleYear}</p>
                    </div>
                  )}
                  {transport.vehicleVin && (
                    <div className="space-y-2">
                      <p className="text-sm text-[#666]">VIN</p>
                      <p className="font-mono text-sm">{transport.vehicleVin}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Notification Info */}
            <Card className="bg-[#12121a] border-[#06b6d4]/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-[#06b6d4]" />
                  <p className="text-[#888]">
                    Email notifikacije se šalju na: <span className="text-[#06b6d4]">{transport.customerEmail}</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
        
        {!transport && !error && hasSearched && !isLoading && (
          <Card className="bg-[#12121a] border-[#2a2a3e] max-w-2xl mx-auto">
            <CardContent className="py-8 text-center">
              <Package className="w-12 h-12 text-[#3a3a4e] mx-auto mb-4" />
              <p className="text-[#666]">Unesite broj za praćenje da biste videli status transporta</p>
            </CardContent>
          </Card>
        )}
      </AnimatePresence>
    </div>
  )
}

// Mini truck animation for inline use
function TruckAnimation_mini() {
  return (
    <motion.div
      className="flex items-center"
      initial={{ x: 0 }}
      animate={{ x: [0, 5, 0] }}
      transition={{ duration: 1, repeat: Infinity }}
    >
      <span className="mx-2 text-[#888]">→</span>
    </motion.div>
  )
}
