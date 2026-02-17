'use client'

import { motion } from 'framer-motion'
import { Truck, Search, Shield, Clock, Mail, MapPin } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { AdminPanel } from '@/components/admin-panel'
import { TrackingForm } from '@/components/tracking-form'
import { TruckAnimation } from '@/components/truck-animation'

export default function Home() {
  
  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0f]">
      {/* Header */}
      <header className="border-b border-[#10b981]/20 bg-[#0a0a0f]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="relative">
                <motion.div
                  className="absolute inset-0 bg-[#10b981] rounded-lg blur-lg opacity-50"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <div className="relative bg-[#12121a] p-2 rounded-lg border border-[#10b981]/30">
                  <Truck className="w-8 h-8 text-[#10b981]" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold glow-text">Transport Vozila</h1>
                <p className="text-sm text-[#666]">Praćenje transporta u realnom vremenu</p>
              </div>
            </motion.div>
            
            {/* Stats */}
            <motion.div 
              className="hidden md:flex items-center gap-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="flex items-center gap-2 text-[#10b981]">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Real-time</span>
              </div>
              <div className="flex items-center gap-2 text-[#06b6d4]">
                <Mail className="w-4 h-4" />
                <span className="text-sm">Email Notifikacije</span>
              </div>
              <div className="flex items-center gap-2 text-[#8b5cf6]">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">GPS Praćenje</span>
              </div>
            </motion.div>
          </div>
        </div>
      </header>
      
      {/* Hero Section with Truck Animation */}
      <section className="relative overflow-hidden border-b border-[#10b981]/10">
        <div className="absolute inset-0 road-pattern" />
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-4"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-2">
              <span className="text-[#10b981]">Pratite</span> vaš transport
            </h2>
            <p className="text-[#666] max-w-xl mx-auto">
              Unesite broj za praćenje i budite u toku sa statusom vašeg vozila u svakom trenutku
            </p>
          </motion.div>
          
          {/* Animated Truck */}
          <div className="bg-[#12121a]/50 rounded-xl border border-[#10b981]/10 overflow-hidden">
            <TruckAnimation />
          </div>
        </div>
      </section>
      
      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <Tabs defaultValue="track" className="w-full">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <TabsList className="bg-[#12121a] border border-[#10b981]/20 w-full max-w-md mx-auto grid grid-cols-2 mb-8">
              <TabsTrigger 
                value="track" 
                className="data-[state=active]:bg-[#10b981]/20 data-[state=active]:text-[#10b981]"
              >
                <Search className="w-4 h-4 mr-2" />
                Praćenje
              </TabsTrigger>
              <TabsTrigger 
                value="admin"
                className="data-[state=active]:bg-[#10b981]/20 data-[state=active]:text-[#10b981]"
              >
                <Shield className="w-4 h-4 mr-2" />
                Admin
              </TabsTrigger>
            </TabsList>
          </motion.div>
          
          <TabsContent value="track">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <TrackingForm />
            </motion.div>
          </TabsContent>
          
          <TabsContent value="admin">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <AdminPanel />
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Features Section */}
      <section className="border-t border-[#10b981]/10 bg-[#0a0a0f]">
        <div className="container mx-auto px-4 py-12">
          <motion.h3 
            className="text-2xl font-bold text-center mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Zašto <span className="text-[#10b981]">mi?</span>
          </motion.h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Clock,
                title: 'Real-time Praćenje',
                description: 'Pratite status vašeg vozila u realnom vremenu sa detaljnim fazama transporta.',
                color: '#10b981'
              },
              {
                icon: Mail,
                title: 'Email Notifikacije',
                description: 'Automatske notifikacije pri svakoj promeni statusa ili faze transporta.',
                color: '#06b6d4'
              },
              {
                icon: Shield,
                title: 'Sigurnost',
                description: 'Vaši podaci su zaštićeni i dostupni samo putem jedinstvenog broja za praćenje.',
                color: '#8b5cf6'
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <Card className="bg-[#12121a] border-[#10b981]/10 h-full card-hover">
                  <CardContent className="p-6">
                    <feature.icon 
                      className="w-10 h-10 mb-4" 
                      style={{ color: feature.color }}
                    />
                    <h4 className="text-lg font-semibold mb-2">{feature.title}</h4>
                    <p className="text-[#666] text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="border-t border-[#10b981]/10 bg-[#0a0a0f] mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#10b981]" />
              <span className="text-[#666]">© 2024 Transport Vozila. Sva prava zadržana.</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-[#666]">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-[#10b981]" />
                24/7 Podrška
              </span>
              <span className="flex items-center gap-1">
                <Mail className="w-4 h-4 text-[#06b6d4]" />
                kontakt@transportvozila.rs
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
