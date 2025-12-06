'use client'

import { useEffect, useState } from 'react'
import DeliberationsList from '@/components/DeliberationsList'
import HealthStatusComponent from '@/components/HealthStatus'
import TrialStats from '@/components/TrialStats'

interface HealthData {
  status: string;
  timestamp?: string;
  version?: string;
  [key: string]: unknown;
}

export default function Home() {
  const [health, setHealth] = useState<HealthData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4005'
        const response = await fetch(`${apiUrl}/healthz`)
        const data = await response.json()
        setHealth(data)
      } catch (error) {
        console.error('Failed to fetch health:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchHealth()
    const interval = setInterval(fetchHealth, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-mobius-primary">
          Thought Broker Dashboard
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <HealthStatusComponent health={health} loading={loading} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DeliberationsList />
          <TrialStats />
        </div>
      </div>
    </main>
  )
}
