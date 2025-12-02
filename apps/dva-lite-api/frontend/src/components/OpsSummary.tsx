'use client'

import { useEffect, useState } from 'react'

export default function OpsSummary() {
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
        const response = await fetch(`${apiUrl}/ops/summary`)
        const data = await response.json()
        setSummary(data)
      } catch (error) {
        console.error('Failed to fetch ops summary:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSummary()
    const interval = setInterval(fetchSummary, 5000) // Refresh every 5s
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Operations Summary</h2>
        <p>Loading...</p>
      </div>
    )
  }

  const miiStatus = summary?.miiCurrent >= (summary?.miiThreshold || 0.95) ? 'healthy' : 'warning'

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Operations Summary</h2>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600 dark:text-gray-400">MII Current:</span>
            <span className={`text-2xl font-bold ${
              miiStatus === 'healthy' ? 'text-green-600' : 'text-yellow-600'
            }`}>
              {(summary?.miiCurrent || 0).toFixed(3)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full ${
                miiStatus === 'healthy' ? 'bg-green-600' : 'bg-yellow-600'
              }`}
              style={{ width: `${(summary?.miiCurrent || 0) * 100}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Threshold: {(summary?.miiThreshold || 0.95).toFixed(3)}
          </p>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Safe Mode:</span>
          <span className={`font-semibold ${
            summary?.safeModeEnabled ? 'text-yellow-600' : 'text-green-600'
          }`}>
            {summary?.safeModeEnabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>

        {summary?.last24h && (
          <div className="mt-4 pt-4 border-t">
            <h3 className="font-semibold mb-2">Last 24 Hours</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Events:</span>
                <span>{summary.last24h.eventCount || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Alerts:</span>
                <span>{summary.last24h.alertCount || 0}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
