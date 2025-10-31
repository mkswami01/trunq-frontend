type MessageCardProps = {
    text: string
    intent: string
    tags: string[]
    timestamp: string
    status: 'pushed' | 'retrieved'
    results?: Array<{
      text: string
      intent?: string
      tags?: string[]
      timestamp?: string
    }>
  }

  export function MessageCard({ text, intent, tags, timestamp, status, results }: MessageCardProps) {
    return (
      <div className="bg-black border border-gray-800 rounded-lg p-3 mb-4 text-left">

        {/* Header: User label and timestamp */}
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">
            {status === 'pushed' ? 'Recorded' : 'Retrieved'}
          </span>
          <span className="text-gray-500 text-xs">{timestamp}</span>
        </div>

        {/* Transcription text */}
        <p className="text-white text-base mb-4">{text}</p>

        {/* Intent badge */}
        {intent && (
          <div className="mb-3">
            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              {intent}
            </span>
          </div>
        )}

        {/* Tags as horizontal pills */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map((tag, i) => (
              <span key={i} className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-xs">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Results section - only show for queries */}
        {results && results.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <p className="text-gray-400 text-sm mb-3">Found {results.length} result{results.length > 1 ? 's' : ''}:</p>
            <div className="space-y-3">
              {results.map((result, i) => (
                <div key={i} className="bg-gray-900 rounded-lg p-3 border border-gray-700">
                  <p className="text-white text-sm mb-2">{result.text}</p>
                  {result.intent && (
                    <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs mr-2">
                      {result.intent}
                    </span>
                  )}
                  {result.tags && result.tags.map((tag, j) => (
                    <span key={j} className="bg-gray-700 text-gray-300 px-2 py-1 rounded-full text-xs mr-1">
                      {tag}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }