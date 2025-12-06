'use client'
import { useState } from 'react'
import SearchResults from '@/components/SearchResults'

interface SearchItem {
  id: string;
  title: string;
  content: string;
  topics?: string[];
}

interface SearchResultsData {
  total?: number;
  items?: SearchItem[];
}

export default function Home() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResultsData | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/v1/encyclopedia?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-mobius-primary">Mobius Encyclopedia</h1>
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for civic answers..."
              className="flex-1 px-4 py-2 border rounded-lg"
            />
            <button type="submit" disabled={loading} className="px-6 py-2 bg-mobius-primary text-white rounded-lg">
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>
        <SearchResults results={results} />
      </div>
    </main>
  )
}
