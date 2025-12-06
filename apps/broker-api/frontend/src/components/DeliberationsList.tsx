'use client'

import { useEffect, useState } from 'react'

interface Deliberation {
  id: string;
  status?: string;
  [key: string]: unknown;
}

export default function DeliberationsList() {
  const [deliberations, setDeliberations] = useState<Deliberation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDeliberations = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4005'
        const response = await fetch(`${apiUrl}/v1/deliberations`)
        const data = await response.json()
        if (data.success && data.data) {
          setDeliberations(data.data)
        }
      } catch (error) {
        console.error('Failed to fetch deliberations:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDeliberations()
    const interval = setInterval(fetchDeliberations, 10000) // Refresh every 10s
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Active Deliberations</h2>
      {loading ? (
        <p>Loading...</p>
      ) : deliberations.length === 0 ? (
        <p className="text-gray-500">No active deliberations</p>
      ) : (
        <div className="space-y-4">
          {deliberations.map((delib) => (
            <div key={delib.id} className="border rounded p-4">
              <h3 className="font-semibold">{delib.id}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Status: {delib.status || 'Unknown'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
