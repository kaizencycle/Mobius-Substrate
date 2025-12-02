'use client'

import { useEffect, useState } from 'react'

export default function MetricsView() {
  const [metrics, setMetrics] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
        const response = await fetch(`${apiUrl}/metrics`)
        const text = await response.text()
        setMetrics(text)
      } catch (error) {
        console.error('Failed to fetch metrics:', error)
        setMetrics('Failed to load metrics')
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
    const interval = setInterval(fetchMetrics, 10000) // Refresh every 10s
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Prometheus Metrics</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-auto text-xs font-mono">
          {metrics}
        </pre>
      )}
    </div>
  )
}
