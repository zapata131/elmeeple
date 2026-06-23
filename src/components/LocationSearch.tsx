'use client'

import { useState, useEffect } from 'react'

interface Suggestion {
  place_id: number
  display_name: string
  lat: string
  lon: string
}

interface LocationSearchProps {
  onSelectLocation: (lat: number, lon: number, name: string) => void
}

export default function LocationSearch({ onSelectLocation }: LocationSearchProps) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (query.trim().length < 3) {
      return
    }

    const fetchSuggestions = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
        )
        if (response.ok) {
          const data = await response.json()
          setSuggestions(data)
        }
      } catch (error) {
        console.error('Error fetching location suggestions:', error)
      } finally {
        setIsLoading(false)
      }
    }

    const delayDebounceFn = setTimeout(() => {
      fetchSuggestions()
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [query])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    if (value.trim().length < 3) {
      setSuggestions([])
    }
  }

  return (
    <div className="relative w-full">
      <div className="relative flex items-center">
        <input
          type="text"
          placeholder="Buscar dirección o zona..."
          value={query}
          onChange={handleInputChange}
          className="w-full px-10 py-2.5 bg-white text-[#3A3A3A] border border-[#3A3A3A]/25 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8367C7]/50 focus:border-[#8367C7] text-sm shadow-inner"
        />
        {/* Search Pin Icon */}
        <span className="absolute left-3.5 text-[#3A3A3A]/40 text-sm pointer-events-none" role="img" aria-label="pin">
          📍
        </span>
        {isLoading && (
          <span className="absolute right-3.5 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8367C7] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#8367C7]"></span>
          </span>
        )}
      </div>

      {suggestions.length > 0 && (
        <ul className="absolute left-0 right-0 mt-1.5 bg-white border border-[#3A3A3A]/10 rounded-xl shadow-xl max-h-60 overflow-y-auto z-50 divide-y divide-[#3A3A3A]/5">
          {suggestions.map((suggestion) => (
            <li key={suggestion.place_id}>
              <button
                type="button"
                onClick={() => {
                  onSelectLocation(
                    parseFloat(suggestion.lat),
                    parseFloat(suggestion.lon),
                    suggestion.display_name
                  )
                  setQuery('')
                  setSuggestions([])
                }}
                className="w-full text-left px-4 py-3 text-xs text-[#3A3A3A] hover:bg-[#8367C7]/10 transition-colors duration-150 font-medium leading-relaxed"
              >
                {suggestion.display_name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
