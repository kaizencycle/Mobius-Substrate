'use client'

interface HealthStatusProps {
  health: any
  loading: boolean
}

export default function HealthStatus({ health, loading }: HealthStatusProps) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Health Status</h2>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Health Status</h2>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Status:</span>
          <span className={`font-semibold ${health?.status === 'healthy' ? 'text-green-600' : 'text-red-600'}`}>
            {health?.status || 'Unknown'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Service:</span>
          <span className="font-semibold">{health?.service || 'N/A'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Version:</span>
          <span className="font-semibold">{health?.version || 'N/A'}</span>
        </div>
        {health?.activeDeliberations !== undefined && (
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Active Deliberations:</span>
            <span className="font-semibold">{health.activeDeliberations}</span>
          </div>
        )}
      </div>
    </div>
  )
}
