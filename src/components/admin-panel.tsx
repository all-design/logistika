'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Lock, LogIn, LogOut, Plus, Edit, Trash2, Save, X, 
  Truck, User, Mail, MapPin, Car, Calendar, Settings,
  ChevronDown, ChevronUp, Clock, AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { TruckAnimation, StaticTruckIcon } from './truck-animation'
import { useToast } from '@/hooks/use-toast'

interface Phase {
  id: string
  name: string
  description?: string | null
  order: number
  defaultDaysToComplete: number
  color: string
  iconName: string
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
  createdAt: Date | string
}

export function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [needsSetup, setNeedsSetup] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  
  const [phases, setPhases] = useState<Phase[]>([])
  const [transports, setTransports] = useState<Transport[]>([])
  
  const [editingPhase, setEditingPhase] = useState<Phase | null>(null)
  const [editingTransport, setEditingTransport] = useState<Transport | null>(null)
  
  const [showNewPhase, setShowNewPhase] = useState(false)
  const [showNewTransport, setShowNewTransport] = useState(false)
  
  const [newPhase, setNewPhase] = useState({ name: '', description: '', defaultDaysToComplete: 5, color: '#10b981' })
  const [newTransport, setNewTransport] = useState({
    customerEmail: '',
    customerName: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    vehicleVin: '',
    originLocation: '',
    destinationLocation: '',
    phaseId: '',
    notes: ''
  })
  
  const { toast } = useToast()
  
  // Check auth status on mount
  useEffect(() => {
    checkAuth()
  }, [])
  
  const checkAuth = async () => {
    try {
      const res = await fetch('/api/admin/login')
      const data = await res.json()
      setIsAuthenticated(data.isAuthenticated)
      setNeedsSetup(data.needsSetup || false)
      if (data.isAuthenticated) {
        await fetchPhases()
        await fetchTransports()
      }
    } catch {
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }
  
  const fetchPhases = async () => {
    try {
      const res = await fetch('/api/phases')
      const data = await res.json()
      setPhases(data.phases || [])
    } catch {
      toast({ title: 'Greška', description: 'Ne mogu da učitam faze', variant: 'destructive' })
    }
  }
  
  const fetchTransports = async () => {
    try {
      const res = await fetch('/api/transports')
      const data = await res.json()
      setTransports(data.transports || [])
    } catch {
      toast({ title: 'Greška', description: 'Ne mogu da učitam transporte', variant: 'destructive' })
    }
  }
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, setup: needsSetup })
      })
      const data = await res.json()
      
      if (data.success) {
        setIsAuthenticated(true)
        setNeedsSetup(false)
        setUsername('')
        setPassword('')
        await fetchPhases()
        await fetchTransports()
        toast({ title: needsSetup ? 'Admin nalog kreiran!' : 'Uspešno ste se prijavili!' })
      } else {
        toast({ title: 'Greška', description: data.error, variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Greška', description: 'Greška na serveru', variant: 'destructive' })
    }
  }
  
  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    setIsAuthenticated(false)
    setPhases([])
    setTransports([])
    toast({ title: 'Uspešno ste se odjavili' })
  }
  
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/admin/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      })
      const data = await res.json()
      
      if (data.success) {
        setCurrentPassword('')
        setNewPassword('')
        toast({ title: 'Lozinka uspešno promenjena!' })
      } else {
        toast({ title: 'Greška', description: data.error, variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Greška', description: 'Greška na serveru', variant: 'destructive' })
    }
  }
  
  const handleCreatePhase = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/phases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPhase)
      })
      const data = await res.json()
      
      if (data.phase) {
        setPhases([...phases, data.phase])
        setNewPhase({ name: '', description: '', defaultDaysToComplete: 5, color: '#10b981' })
        setShowNewPhase(false)
        toast({ title: 'Faza kreirana!' })
      } else {
        toast({ title: 'Greška', description: data.error, variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Greška', description: 'Greška na serveru', variant: 'destructive' })
    }
  }
  
  const handleUpdatePhase = async (phase: Phase) => {
    try {
      const res = await fetch('/api/phases', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(phase)
      })
      const data = await res.json()
      
      if (data.phase) {
        setPhases(phases.map(p => p.id === data.phase.id ? data.phase : p))
        setEditingPhase(null)
        toast({ title: 'Faza ažurirana!' })
      }
    } catch {
      toast({ title: 'Greška', description: 'Greška na serveru', variant: 'destructive' })
    }
  }
  
  const handleDeletePhase = async (id: string) => {
    if (!confirm('Da li ste sigurni da želite da obrišete ovu fazu?')) return
    
    try {
      await fetch(`/api/phases?id=${id}`, { method: 'DELETE' })
      setPhases(phases.filter(p => p.id !== id))
      toast({ title: 'Faza obrisana!' })
    } catch {
      toast({ title: 'Greška', description: 'Greška na serveru', variant: 'destructive' })
    }
  }
  
  const handleCreateTransport = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/transports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTransport)
      })
      const data = await res.json()
      
      if (data.transport) {
        setTransports([data.transport, ...transports])
        setNewTransport({
          customerEmail: '',
          customerName: '',
          vehicleMake: '',
          vehicleModel: '',
          vehicleYear: '',
          vehicleVin: '',
          originLocation: '',
          destinationLocation: '',
          phaseId: '',
          notes: ''
        })
        setShowNewTransport(false)
        toast({ title: 'Transport kreiran!', description: `Tracking: ${data.transport.trackingNumber}` })
      } else {
        toast({ title: 'Greška', description: data.error, variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Greška', description: 'Greška na serveru', variant: 'destructive' })
    }
  }
  
  const handleUpdateTransport = async (transport: Transport, updates: Partial<Transport>) => {
    try {
      const res = await fetch('/api/transports', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: transport.id, ...updates })
      })
      const data = await res.json()
      
      if (data.transport) {
        setTransports(transports.map(t => t.id === data.transport.id ? data.transport : t))
        setEditingTransport(null)
        toast({ title: 'Transport ažuriran!', description: updates.phaseId ? 'Email notifikacija poslata!' : '' })
      }
    } catch {
      toast({ title: 'Greška', description: 'Greška na serveru', variant: 'destructive' })
    }
  }
  
  const handleDeleteTransport = async (id: string) => {
    if (!confirm('Da li ste sigurni da želite da obrišete ovaj transport?')) return
    
    try {
      await fetch(`/api/transports?id=${id}`, { method: 'DELETE' })
      setTransports(transports.filter(t => t.id !== id))
      toast({ title: 'Transport obrisan!' })
    } catch {
      toast({ title: 'Greška', description: 'Greška na serveru', variant: 'destructive' })
    }
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Truck className="w-12 h-12 text-[#10b981]" />
        </motion.div>
      </div>
    )
  }
  
  // Login/Setup form
  if (!isAuthenticated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto"
      >
        <Card className="glow-border bg-[#12121a] border-[#10b981]/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#10b981]">
              <Lock className="w-5 h-5" />
              {needsSetup ? 'Kreiraj Admin Nalog' : 'Admin Prijava'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {needsSetup && (
                <div className="p-3 bg-[#10b981]/10 rounded-lg border border-[#10b981]/20 mb-4">
                  <p className="text-sm text-[#10b981]">Prvo kreirajte admin nalog</p>
                </div>
              )}
              {needsSetup && (
                <div className="space-y-2">
                  <Label htmlFor="username">Korisničko ime</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin"
                    required
                    className="bg-[#1a1a2e] border-[#2a2a3e]"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="password">Lozinka</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="bg-[#1a1a2e] border-[#2a2a3e]"
                />
              </div>
              <Button type="submit" className="w-full bg-[#10b981] hover:bg-[#059669] btn-glow">
                {needsSetup ? 'Kreiraj Nalog' : 'Prijavi se'}
                <LogIn className="w-4 h-4 ml-2" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    )
  }
  
  // Admin dashboard
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <StaticTruckIcon className="w-10 h-10" />
          <h2 className="text-2xl font-bold glow-text">Admin Panel</h2>
        </div>
        <Button onClick={handleLogout} variant="outline" className="border-[#10b981]/30">
          <LogOut className="w-4 h-4 mr-2" />
          Odjavi se
        </Button>
      </div>
      
      {/* Truck animation */}
      <div className="bg-[#12121a] rounded-lg p-4 border border-[#10b981]/20">
        <TruckAnimation />
      </div>
      
      <Tabs defaultValue="transports" className="w-full">
        <TabsList className="bg-[#12121a] border border-[#10b981]/20">
          <TabsTrigger value="transports" className="data-[state=active]:bg-[#10b981]/20">
            <Truck className="w-4 h-4 mr-2" />
            Transporti
          </TabsTrigger>
          <TabsTrigger value="phases" className="data-[state=active]:bg-[#10b981]/20">
            <Clock className="w-4 h-4 mr-2" />
            Faze
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-[#10b981]/20">
            <Settings className="w-4 h-4 mr-2" />
            Podešavanja
          </TabsTrigger>
        </TabsList>
        
        {/* Transports Tab */}
        <TabsContent value="transports" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Lista Transporta</h3>
            <Button onClick={() => setShowNewTransport(true)} className="bg-[#10b981] hover:bg-[#059669] btn-glow">
              <Plus className="w-4 h-4 mr-2" />
              Novi Transport
            </Button>
          </div>
          
          {/* New Transport Form */}
          <AnimatePresence>
            {showNewTransport && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Card className="bg-[#12121a] border-[#10b981]/20">
                  <CardHeader>
                    <CardTitle className="text-[#10b981]">Kreiraj Novi Transport</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreateTransport} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label><User className="w-4 h-4 inline mr-1" /> Ime kupca *</Label>
                        <Input
                          value={newTransport.customerName}
                          onChange={(e) => setNewTransport({...newTransport, customerName: e.target.value})}
                          className="bg-[#1a1a2e] border-[#2a2a3e]"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label><Mail className="w-4 h-4 inline mr-1" /> Email *</Label>
                        <Input
                          type="email"
                          value={newTransport.customerEmail}
                          onChange={(e) => setNewTransport({...newTransport, customerEmail: e.target.value})}
                          className="bg-[#1a1a2e] border-[#2a2a3e]"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label><Car className="w-4 h-4 inline mr-1" /> Marka vozila *</Label>
                        <Input
                          value={newTransport.vehicleMake}
                          onChange={(e) => setNewTransport({...newTransport, vehicleMake: e.target.value})}
                          className="bg-[#1a1a2e] border-[#2a2a3e]"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Model vozila *</Label>
                        <Input
                          value={newTransport.vehicleModel}
                          onChange={(e) => setNewTransport({...newTransport, vehicleModel: e.target.value})}
                          className="bg-[#1a1a2e] border-[#2a2a3e]"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Godina</Label>
                        <Input
                          value={newTransport.vehicleYear}
                          onChange={(e) => setNewTransport({...newTransport, vehicleYear: e.target.value})}
                          className="bg-[#1a1a2e] border-[#2a2a3e]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>VIN</Label>
                        <Input
                          value={newTransport.vehicleVin}
                          onChange={(e) => setNewTransport({...newTransport, vehicleVin: e.target.value})}
                          className="bg-[#1a1a2e] border-[#2a2a3e]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label><MapPin className="w-4 h-4 inline mr-1" /> Polazak *</Label>
                        <Input
                          value={newTransport.originLocation}
                          onChange={(e) => setNewTransport({...newTransport, originLocation: e.target.value})}
                          className="bg-[#1a1a2e] border-[#2a2a3e]"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label><MapPin className="w-4 h-4 inline mr-1" /> Destinacija *</Label>
                        <Input
                          value={newTransport.destinationLocation}
                          onChange={(e) => setNewTransport({...newTransport, destinationLocation: e.target.value})}
                          className="bg-[#1a1a2e] border-[#2a2a3e]"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Početna faza</Label>
                        <Select value={newTransport.phaseId} onValueChange={(v) => setNewTransport({...newTransport, phaseId: v})}>
                          <SelectTrigger className="bg-[#1a1a2e] border-[#2a2a3e]">
                            <SelectValue placeholder="Izaberi fazu" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#12121a] border-[#2a2a3e]">
                            {phases.map(p => (
                              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Napomene</Label>
                        <Textarea
                          value={newTransport.notes}
                          onChange={(e) => setNewTransport({...newTransport, notes: e.target.value})}
                          className="bg-[#1a1a2e] border-[#2a2a3e]"
                        />
                      </div>
                      <div className="md:col-span-2 flex gap-2">
                        <Button type="submit" className="bg-[#10b981] hover:bg-[#059669] btn-glow">
                          <Save className="w-4 h-4 mr-2" />
                          Sačuvaj
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setShowNewTransport(false)}>
                          <X className="w-4 h-4 mr-2" />
                          Otkaži
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Transport List */}
          <div className="grid gap-4 max-h-[600px] overflow-y-auto pr-2">
            {transports.length === 0 ? (
              <Card className="bg-[#12121a] border-[#2a2a3e]">
                <CardContent className="py-8 text-center text-[#4a4a5e]">
                  Nema transporta. Kliknite "Novi Transport" da kreirate.
                </CardContent>
              </Card>
            ) : (
              transports.map((transport, index) => (
                <motion.div
                  key={transport.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="bg-[#12121a] border-[#10b981]/20 card-hover">
                    <CardContent className="p-4">
                      {editingTransport?.id === transport.id ? (
                        // Edit mode
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Trenutna faza</Label>
                              <Select 
                                value={editingTransport.currentPhase.id}
                                onValueChange={(v) => {
                                  const phase = phases.find(p => p.id === v)
                                  if (phase) {
                                    setEditingTransport({
                                      ...editingTransport,
                                      currentPhase: phase,
                                      daysToCompletePhase: phase.defaultDaysToComplete
                                    })
                                  }
                                }}
                              >
                                <SelectTrigger className="bg-[#1a1a2e] border-[#2a2a3e]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#12121a] border-[#2a2a3e]">
                                  {phases.map(p => (
                                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Dana do završetka faze</Label>
                              <Input
                                type="number"
                                value={editingTransport.daysToCompletePhase}
                                onChange={(e) => setEditingTransport({
                                  ...editingTransport,
                                  daysToCompletePhase: parseInt(e.target.value) || 0
                                })}
                                className="bg-[#1a1a2e] border-[#2a2a3e]"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Status</Label>
                              <Select 
                                value={editingTransport.status}
                                onValueChange={(v) => setEditingTransport({...editingTransport, status: v})}
                              >
                                <SelectTrigger className="bg-[#1a1a2e] border-[#2a2a3e]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#12121a] border-[#2a2a3e]">
                                  <SelectItem value="active">Aktivan</SelectItem>
                                  <SelectItem value="completed">Završen</SelectItem>
                                  <SelectItem value="cancelled">Otkazan</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              onClick={() => handleUpdateTransport(transport, {
                                phaseId: editingTransport.currentPhase.id,
                                daysToCompletePhase: editingTransport.daysToCompletePhase,
                                status: editingTransport.status
                              })}
                              className="bg-[#10b981] hover:bg-[#059669]"
                            >
                              <Save className="w-4 h-4 mr-2" />
                              Sačuvaj
                            </Button>
                            <Button variant="outline" onClick={() => setEditingTransport(null)}>
                              <X className="w-4 h-4 mr-2" />
                              Otkaži
                            </Button>
                          </div>
                        </div>
                      ) : (
                        // View mode
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[#10b981] font-bold">{transport.trackingNumber}</span>
                              <Badge variant={transport.status === 'completed' ? 'default' : transport.status === 'cancelled' ? 'destructive' : 'secondary'}>
                                {transport.status === 'active' ? 'Aktivan' : transport.status === 'completed' ? 'Završen' : 'Otkazan'}
                              </Badge>
                            </div>
                            <p className="text-sm text-[#888]">
                              {transport.customerName} • {transport.customerEmail}
                            </p>
                            <p className="text-sm">
                              {transport.vehicleMake} {transport.vehicleModel} {transport.vehicleYear}
                            </p>
                            <p className="text-sm text-[#06b6d4]">
                              {transport.originLocation} → {transport.destinationLocation}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge 
                              style={{ 
                                backgroundColor: `${transport.currentPhase.color}20`,
                                color: transport.currentPhase.color,
                                borderColor: transport.currentPhase.color
                              }}
                              variant="outline"
                            >
                              {transport.currentPhase.name}
                            </Badge>
                            <CountdownDisplay 
                              startedAt={transport.phaseStartedAt} 
                              daysToComplete={transport.daysToCompletePhase}
                            />
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setEditingTransport(transport)}
                              >
                                <Edit className="w-4 h-4 mr-1" />
                                Uredi
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleDeleteTransport(transport.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </TabsContent>
        
        {/* Phases Tab */}
        <TabsContent value="phases" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Faze Transporta</h3>
            <Button onClick={() => setShowNewPhase(true)} className="bg-[#10b981] hover:bg-[#059669] btn-glow">
              <Plus className="w-4 h-4 mr-2" />
              Nova Faza
            </Button>
          </div>
          
          {/* New Phase Form */}
          <AnimatePresence>
            {showNewPhase && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Card className="bg-[#12121a] border-[#10b981]/20">
                  <CardHeader>
                    <CardTitle className="text-[#10b981]">Kreiraj Novu Fazu</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreatePhase} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Naziv faze *</Label>
                        <Input
                          value={newPhase.name}
                          onChange={(e) => setNewPhase({...newPhase, name: e.target.value})}
                          className="bg-[#1a1a2e] border-[#2a2a3e]"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Podrazumevano dana do završetka</Label>
                        <Input
                          type="number"
                          value={newPhase.defaultDaysToComplete}
                          onChange={(e) => setNewPhase({...newPhase, defaultDaysToComplete: parseInt(e.target.value) || 5})}
                          className="bg-[#1a1a2e] border-[#2a2a3e]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Boja</Label>
                        <Input
                          type="color"
                          value={newPhase.color}
                          onChange={(e) => setNewPhase({...newPhase, color: e.target.value})}
                          className="bg-[#1a1a2e] border-[#2a2a3e] h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Opis</Label>
                        <Input
                          value={newPhase.description}
                          onChange={(e) => setNewPhase({...newPhase, description: e.target.value})}
                          className="bg-[#1a1a2e] border-[#2a2a3e]"
                        />
                      </div>
                      <div className="md:col-span-2 flex gap-2">
                        <Button type="submit" className="bg-[#10b981] hover:bg-[#059669] btn-glow">
                          <Save className="w-4 h-4 mr-2" />
                          Sačuvaj
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setShowNewPhase(false)}>
                          <X className="w-4 h-4 mr-2" />
                          Otkaži
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Phases List */}
          <div className="grid gap-3">
            {phases.length === 0 ? (
              <Card className="bg-[#12121a] border-[#2a2a3e]">
                <CardContent className="py-8 text-center text-[#4a4a5e]">
                  Nema faza. Kliknite "Nova Faza" da kreirate.
                </CardContent>
              </Card>
            ) : (
              phases.map((phase, index) => (
                <motion.div
                  key={phase.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="bg-[#12121a] border-[#10b981]/20 card-hover">
                    <CardContent className="p-4">
                      {editingPhase?.id === phase.id ? (
                        <div className="flex flex-wrap gap-4 items-end">
                          <div className="space-y-2">
                            <Label className="text-xs">Naziv</Label>
                            <Input
                              value={editingPhase.name}
                              onChange={(e) => setEditingPhase({...editingPhase, name: e.target.value})}
                              className="bg-[#1a1a2e] border-[#2a2a3e] h-9"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Dana</Label>
                            <Input
                              type="number"
                              value={editingPhase.defaultDaysToComplete}
                              onChange={(e) => setEditingPhase({...editingPhase, defaultDaysToComplete: parseInt(e.target.value) || 5})}
                              className="bg-[#1a1a2e] border-[#2a2a3e] h-9 w-20"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Boja</Label>
                            <Input
                              type="color"
                              value={editingPhase.color}
                              onChange={(e) => setEditingPhase({...editingPhase, color: e.target.value})}
                              className="bg-[#1a1a2e] border-[#2a2a3e] h-9 w-14"
                            />
                          </div>
                          <Button 
                            size="sm"
                            onClick={() => handleUpdatePhase(editingPhase)}
                            className="bg-[#10b981] hover:bg-[#059669]"
                          >
                            <Save className="w-4 h-4 mr-1" />
                            Sačuvaj
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingPhase(null)}>
                            <X className="w-4 h-4 mr-1" />
                            Otkaži
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: phase.color, boxShadow: `0 0 10px ${phase.color}` }}
                            />
                            <span className="font-medium">{phase.name}</span>
                            {phase.description && (
                              <span className="text-sm text-[#666]">- {phase.description}</span>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {phase.defaultDaysToComplete} dana
                            </Badge>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => setEditingPhase(phase)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              className="text-red-500 hover:text-red-400"
                              onClick={() => handleDeletePhase(phase.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </TabsContent>
        
        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card className="bg-[#12121a] border-[#10b981]/20">
            <CardHeader>
              <CardTitle className="text-[#10b981]">Promena Lozinke</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label>Trenutna lozinka</Label>
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="bg-[#1a1a2e] border-[#2a2a3e]"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nova lozinka</Label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-[#1a1a2e] border-[#2a2a3e]"
                    required
                    minLength={6}
                  />
                </div>
                <Button type="submit" className="bg-[#10b981] hover:bg-[#059669] btn-glow">
                  <Save className="w-4 h-4 mr-2" />
                  Promeni Lozinku
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function CountdownDisplay({ startedAt, daysToComplete }: { startedAt: Date | string; daysToComplete: number }) {
  const start = typeof startedAt === 'string' ? new Date(startedAt) : startedAt
  const endTime = new Date(start.getTime() + daysToComplete * 24 * 60 * 60 * 1000)
  const now = new Date()
  const diff = endTime.getTime() - now.getTime()
  
  const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)))
  const isExpired = diff <= 0
  
  let colorClass = 'text-[#10b981]'
  if (isExpired || days <= 1) colorClass = 'text-red-500'
  else if (days <= 3) colorClass = 'text-yellow-500'
  
  return (
    <div className={`flex items-center gap-1 text-sm ${colorClass}`}>
      <Clock className="w-4 h-4" />
      {isExpired ? (
        <span className="flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          Prekoračeno
        </span>
      ) : (
        <span>{days} dana</span>
      )}
    </div>
  )
}
