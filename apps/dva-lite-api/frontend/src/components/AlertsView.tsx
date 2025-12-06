'use client'

import { useEffect, useState } from 'react'

interface AlertData {
  message?: string;
  timestamp?: string;
  [key: string]: unknown;
}

export default function AlertsView() {
  const [alerts, setAlerts] = useState<AlertData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
        const response = await fetch(`${apiUrl}/alerts`)
        const data = await response.json()
        if (Array.isArray(data)) {
          setAlerts(data)
        }
      } catch (error) {
        console.error('Failed to fetch alerts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAlerts()
    const interval = setInterval(fetchAlerts, 5000) // Refresh every 5s
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Active Alerts</h2>
      {loading ? (
        <p>Loading...</p>
      ) : alerts.length === 0 ? (
        <p className="text-green-600">No active alerts</p>
      ) : (
        <div className="space-y-2">
          {alerts.map((alert, index) => (
            <div
              key={index}
              className="border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded"
            >
              <p className="font-semibold">{alert.message || 'Alert'}</p>
              {alert.timestamp && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(alert.timestamp).toLocaleString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
