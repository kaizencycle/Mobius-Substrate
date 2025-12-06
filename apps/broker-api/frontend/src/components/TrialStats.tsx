'use client'

import { useEffect, useState } from 'react'

interface TrialStatsData {
  totalTrials?: number;
  activeTrials?: number;
  completedTrials?: number;
  [key: string]: unknown;
}

export default function TrialStats() {
  const [stats, setStats] = useState<TrialStatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4005'
        const response = await fetch(`${apiUrl}/v1/trials/ktt-001/stats`)
        const data = await response.json()
        if (data.success && data.data) {
          setStats(data.data)
        }
      } catch (error) {
        console.error('Failed to fetch trial stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 15000) // Refresh every 15s
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">KTT-001 Trial Statistics</h2>
      {loading ? (
        <p>Loading...</p>
      ) : stats ? (
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Total Trials:</span>
            <span className="font-semibold">{stats.totalTrials || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Active Trials:</span>
            <span className="font-semibold">{stats.activeTrials || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Completed Trials:</span>
            <span className="font-semibold">{stats.completedTrials || 0}</span>
          </div>
        </div>
      ) : (
        <p className="text-gray-500">No statistics available</p>
      )}
    </div>
  )
}
