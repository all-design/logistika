import { db } from './src/lib/db'

async function seed() {
  console.log('🌱 Seeding database...')
  
  // Check if phases already exist
  const existingPhases = await db.transportPhase.count()
  
  if (existingPhases > 0) {
    console.log('✅ Phases already exist, skipping seed')
    return
  }
  
  // Create default phases
  const phases = [
    {
      name: 'Priprema',
      description: 'Priprema dokumentacije i ugovora',
      order: 0,
      defaultDaysToComplete: 2,
      color: '#06b6d4',
      iconName: 'file-text'
    },
    {
      name: 'Preuzimanje',
      description: 'Preuzimanje vozila sa lokacije',
      order: 1,
      defaultDaysToComplete: 3,
      color: '#8b5cf6',
      iconName: 'truck'
    },
    {
      name: 'Transport',
      description: 'Transport vozila do destinacije',
      order: 2,
      defaultDaysToComplete: 5,
      color: '#10b981',
      iconName: 'truck'
    },
    {
      name: 'Carinjenje',
      description: 'Carinska procedura',
      order: 3,
      defaultDaysToComplete: 2,
      color: '#f59e0b',
      iconName: 'shield'
    },
    {
      name: 'Dostava',
      description: 'Dostava vozila kupcu',
      order: 4,
      defaultDaysToComplete: 2,
      color: '#ef4444',
      iconName: 'map-pin'
    }
  ]
  
  for (const phase of phases) {
    await db.transportPhase.create({ data: phase })
    console.log(`✅ Created phase: ${phase.name}`)
  }
  
  console.log('🎉 Seed completed!')
}

seed()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
