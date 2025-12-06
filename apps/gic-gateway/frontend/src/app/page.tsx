'use client'
import { useEffect, useState } from 'react'

interface HealthStatus {
  status: string;
  timestamp?: string;
  version?: string;
  [key: string]: unknown;
}

export default function Home() {
  const [health, setHealth] = useState<HealthStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010'
        const response = await fetch(`${apiUrl}/health`)
        const data = await response.json()
        setHealth(data)
      } catch (error) {
        console.error('Failed to fetch health:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchHealth()
    const interval = setInterval(fetchHealth, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-mobius-primary">GIC Gateway</h1>
        {loading ? (
          <p>Loading...</p>
        ) : health ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Service Status</h2>
            <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-auto">
              {JSON.stringify(health, null, 2)}
            </pre>
          </div>
        ) : (
          <p>Unable to connect to service</p>
        )}
      </div>
    </main>
  )
}
