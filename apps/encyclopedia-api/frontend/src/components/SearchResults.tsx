'use client'
export default function SearchResults({ results }: { results: any }) {
  if (!results) return null
  return (
    <div>
      <p className="text-gray-600 mb-4">Found {results.total || 0} results</p>
      <div className="space-y-4">
        {results.items?.map((item: any) => (
          <div key={item.id} className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg">{item.title}</h3>
            <p className="text-gray-600 mt-2">{item.content}</p>
            {item.topics && item.topics.length > 0 && (
              <div className="mt-2 flex gap-2">
                {item.topics.map((topic: string) => (
                  <span key={topic} className="px-2 py-1 bg-mobius-secondary/20 rounded text-sm">
                    {topic}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
