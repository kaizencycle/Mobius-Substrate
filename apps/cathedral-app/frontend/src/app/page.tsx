'use client'
import { useEffect, useState } from 'react'

export default function Home() {
  const [governance, setGovernance] = useState<any>(null)
  const [policies, setPolicies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'
        const [govRes, polRes] = await Promise.all([
          fetch(`${apiUrl}/governance`),
          fetch(`${apiUrl}/policies`)
        ])
        setGovernance(await govRes.json())
        setPolicies(await polRes.json())
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-mobius-primary">Cathedral Governance</h1>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Governance Stats</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Active Proposals:</span>
                  <span className="font-semibold">{governance?.activeProposals || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Proposals:</span>
                  <span className="font-semibold">{governance?.totalProposals || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Voting Power:</span>
                  <span className="font-semibold">{governance?.votingPower || 0}</span>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Policies</h2>
              {policies.length === 0 ? (
                <p className="text-gray-500">No policies available</p>
              ) : (
                <ul className="space-y-2">
                  {policies.map((policy: any, idx: number) => (
                    <li key={idx} className="border-b pb-2">{policy.name || `Policy ${idx + 1}`}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
