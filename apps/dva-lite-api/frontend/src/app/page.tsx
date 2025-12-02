'use client'

import OpsSummary from '@/components/OpsSummary'
import MetricsView from '@/components/MetricsView'
import AlertsView from '@/components/AlertsView'

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-mobius-primary">
          DVA.LITE Observability Dashboard
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <OpsSummary />
          <AlertsView />
        </div>

        <div className="mt-6">
          <MetricsView />
        </div>
      </div>
    </main>
  )
}
