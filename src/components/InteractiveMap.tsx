'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import QuickViewCard, { Venue } from '@/components/QuickViewCard'
import LocationSearch from '@/components/LocationSearch'

// Helper function to map lat/lng coordinates to a friendly address description
function getFriendlyAddress(lat: number, lng: number): string {
  if (Math.abs(lat - 19.4165) < 0.001 && Math.abs(lng - (-99.1620)) < 0.001) {
    return 'Roma Norte, CDMX'
  }
  if (Math.abs(lat - 19.3750) < 0.001 && Math.abs(lng - (-99.1780)) < 0.001) {
    return 'Coyoacán, CDMX'
  }
  if (Math.abs(lat - 19.4184) < 0.001 && Math.abs(lng - (-99.1627)) < 0.001) {
    return 'Roma Norte, CDMX'
  }
  return 'CDMX, México'
}

import MapSkeleton from '@/components/MapSkeleton'

// Dynamically import the Map component with SSR disabled
const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => <MapSkeleton />,
})

import { MOCK_VENUES } from '@/utils/mockData'

// Haversine formula to calculate distance in km between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export default function InteractiveMap() {
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchMode, setSearchMode] = useState<'venues' | 'games'>('venues')
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [mapCenter, setMapCenter] = useState<[number, number] | undefined>(undefined)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [selectedRadius, setSelectedRadius] = useState<number | 'all'>('all')
  const [selectedTcg, setSelectedTcg] = useState<string>('all')

  // Request user location on component mount
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setUserLocation([latitude, longitude])
          setMapCenter([latitude, longitude])
        },
        (error) => {
          console.log('Geolocation permission denied or error. Using default center.')
        }
      )
    }
  }, [])

  // Fetch verified venues dynamically on component mount
  useEffect(() => {
    async function fetchVenues() {
      try {
        const { createClient } = await import('@/utils/supabase/client')
        const supabase = createClient()
        const { data, error } = await supabase
          .from('venues')
          .select(`
            id,
            name,
            slug,
            description,
            schedule,
            lat,
            lng,
            type,
            instagram,
            discord,
            logo_url,
            verification_status,
            venue_tags (
              tags (
                name
              )
            ),
            venue_games (
              id,
              name,
              thumbnail,
              min_players,
              max_players,
              playing_time
            ),
            reviews (
              id,
              user_email,
              rating,
              comment,
              vibe_tags,
              created_at
            )
          `)
          .eq('verification_status', 'approved')

        if (error) {
          console.warn('Supabase not configured or query error. Falling back to local mock venues.', error)
          setVenues(MOCK_VENUES)
          return
        }

        const formatted = (data || []).map((v: any) => {
          const tagsList = v.venue_tags
            ? v.venue_tags
                .map((vt: any) => vt.tags?.name)
                .filter(Boolean)
            : []

          return {
            id: v.id,
            name: v.name,
            slug: v.slug || undefined,
            lat: v.lat,
            lng: v.lng,
            tags: tagsList,
            schedule: v.schedule,
            address: getFriendlyAddress(v.lat, v.lng),
            description: v.description,
            type: v.type,
            instagram: v.instagram,
            discord: v.discord,
            logoUrl: v.logo_url || undefined,
            venue_games: v.venue_games || [],
            reviews: v.reviews || []
          }
        })

        // If database is connected but empty, also fall back to mock venues so local testing has pins
        if (formatted.length === 0) {
          setVenues(MOCK_VENUES)
        } else {
          setVenues(formatted)
        }
      } catch (err) {
        console.warn('Unexpected error connecting to Supabase. Falling back to local mock venues.', err)
        setVenues(MOCK_VENUES)
      } finally {
        setLoading(false)
      }
    }

    fetchVenues()
  }, [])


  // Filter venues based on search query, category, and radius
  const filteredVenues = venues.filter((venue) => {
    // Category Filter
    if (selectedCategory === 'Cafés' && venue.type !== 'cafe') return false
    if (selectedCategory === 'Tiendas' && venue.type !== 'tienda') return false
    if (selectedCategory === 'Híbridos' && venue.type !== 'hibrido') return false

    // Radius / Distance Filter
    if (selectedRadius !== 'all') {
      const refLat = mapCenter ? mapCenter[0] : (userLocation ? userLocation[0] : 19.4326)
      const refLng = mapCenter ? mapCenter[1] : (userLocation ? userLocation[1] : -99.1332)
      const distance = calculateDistance(refLat, refLng, venue.lat, venue.lng)
      if (distance > selectedRadius) return false
    }

    // TCG Filter
    if (selectedTcg !== 'all') {
      const hasTcg = venue.tags?.some((tag) => {
        const lowerTag = tag.toLowerCase()
        if (selectedTcg === 'magic') {
          return lowerTag.includes('magic') || lowerTag.includes('mtg')
        }
        if (selectedTcg === 'pokemon') {
          return lowerTag.includes('pokémon') || lowerTag.includes('pokemon')
        }
        if (selectedTcg === 'yugioh') {
          return lowerTag.includes('yu-gi-oh') || lowerTag.includes('yugioh')
        }
        if (selectedTcg === 'lorcana') {
          return lowerTag.includes('lorcana')
        }
        if (selectedTcg === 'onepiece') {
          return lowerTag.includes('one piece') || lowerTag.includes('onepiece')
        }
        return false
      })
      if (!hasTcg) return false
    }

    // Search Filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase()
      if (searchMode === 'venues') {
        const matchesName = venue.name.toLowerCase().includes(query)
        const matchesAddress = venue.address ? venue.address.toLowerCase().includes(query) : false
        const matchesTags = venue.tags.some(tag => tag.toLowerCase().includes(query))
        return matchesName || matchesAddress || matchesTags
      } else {
        const matchesGames = venue.venue_games
          ? (venue.venue_games as any[]).some((g: any) => g.name?.toLowerCase().includes(query))
          : false
        return matchesGames
      }
    }

    return true
  })

  const handleSelectVenue = (venue: Venue) => {
    setSelectedVenue(venue)
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#F5F0E9]">
      {/* Full screen Map Background */}
      <div className="absolute inset-0 w-full h-full z-0">
        <Map
          center={mapCenter}
          venues={filteredVenues}
          onSelectVenue={setSelectedVenue}
          selectedVenue={selectedVenue}
        />
      </div>

      {/* Left Sidebar (Desktop) / Top Search Header (Mobile) */}
      <div
        className={`absolute top-0 left-0 w-full md:w-96 h-auto md:h-full bg-[#F5F0E9] text-[#3A3A3A] z-10 border-b md:border-b-0 md:border-r border-[#3A3A3A]/10 shadow-2xl flex flex-col transition-all duration-300 backdrop-blur-md bg-opacity-95 ${
          selectedVenue ? 'hidden md:flex' : 'flex'
        }`}
      >


        {/* Search and Category Filters */}
        <div className="p-4 md:px-6 md:py-4 flex flex-col gap-3 border-b border-[#3A3A3A]/5 text-sm">
          <LocationSearch onSelectLocation={(lat, lon) => setMapCenter([lat, lon])} />
          <div className="relative">
            <input
              type="text"
              placeholder={searchMode === 'venues' ? 'Buscar locales...' : 'Buscar juegos de mesa...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 bg-white text-[#3A3A3A] border border-[#3A3A3A]/25 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8367C7]/50 focus:border-[#8367C7] text-sm shadow-inner"
            />
          </div>

          {/* Search Mode Toggle */}
          <div className="grid grid-cols-2 p-1 bg-[#3A3A3A]/5 rounded-xl border border-[#3A3A3A]/10 text-xs font-semibold">
            <button
              onClick={() => {
                setSearchMode('venues')
                setSearchQuery('')
              }}
              className={`py-1.5 px-3 rounded-lg transition-all duration-150 cursor-pointer text-center ${
                searchMode === 'venues'
                  ? 'bg-[#8367C7] text-[#F5F0E9] font-bold shadow-sm'
                  : 'text-[#3A3A3A]/60 hover:text-[#3A3A3A] hover:bg-[#3A3A3A]/5'
              }`}
            >
              Buscar locales
            </button>
            <button
              onClick={() => {
                setSearchMode('games')
                setSearchQuery('')
              }}
              className={`py-1.5 px-3 rounded-lg transition-all duration-150 cursor-pointer text-center ${
                searchMode === 'games'
                  ? 'bg-[#8367C7] text-[#F5F0E9] font-bold shadow-sm'
                  : 'text-[#3A3A3A]/60 hover:text-[#3A3A3A] hover:bg-[#3A3A3A]/5'
              }`}
            >
              Buscar juegos
            </button>
          </div>

          {/* Category Filter Chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {['Todos', 'Cafés', 'Tiendas', 'Híbridos'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 text-xs font-bold rounded-full border transition-all duration-150 cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-[#8367C7] border-[#8367C7] text-[#F5F0E9] shadow-sm'
                    : 'bg-white border-[#3A3A3A]/20 text-[#3A3A3A] hover:border-[#8367C7]/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Radius Filter Chips */}
          <div className="flex flex-col gap-1.5 mt-1.5">
            <div className="text-[10px] uppercase tracking-wider text-[#3A3A3A]/50 font-black">Distancia máxima</div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {[
                { label: 'Sin límite', value: 'all' },
                { label: '2 km', value: 2 },
                { label: '5 km', value: 5 },
                { label: '10 km', value: 10 },
                { label: '20 km', value: 20 },
              ].map((r) => (
                <button
                  key={r.label}
                  onClick={() => setSelectedRadius(r.value as number | 'all')}
                  className={`px-3 py-1 text-xs font-bold rounded-full border transition-all duration-150 cursor-pointer whitespace-nowrap ${
                    selectedRadius === r.value
                      ? 'bg-[#8367C7] border-[#8367C7] text-[#F5F0E9] shadow-sm'
                      : 'bg-white border-[#3A3A3A]/20 text-[#3A3A3A] hover:border-[#8367C7]/50'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* TCG Filter Chips */}
          <div className="flex flex-col gap-1.5 mt-2 border-t border-[#3A3A3A]/5 pt-2">
            <div className="text-[10px] uppercase tracking-wider text-[#3A3A3A]/50 font-black">Juegos de cartas (TCG)</div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {[
                { label: 'Todos TCG', value: 'all' },
                { label: 'Magic', value: 'magic' },
                { label: 'Pokémon', value: 'pokemon' },
                { label: 'Yu-Gi-Oh!', value: 'yugioh' },
                { label: 'Lorcana', value: 'lorcana' },
                { label: 'One Piece', value: 'onepiece' }
              ].map((t) => (
                <button
                  key={t.label}
                  onClick={() => setSelectedTcg(t.value)}
                  className={`px-3 py-1 text-xs font-bold rounded-full border transition-all duration-150 cursor-pointer whitespace-nowrap ${
                    selectedTcg === t.value
                      ? 'bg-[#8367C7] border-[#8367C7] text-[#F5F0E9] shadow-sm'
                      : 'bg-white border-[#3A3A3A]/20 text-[#3A3A3A] hover:border-[#8367C7]/50'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Scrollable Venue List */}
        <div
          data-testid="venue-list"
          className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-3 max-h-[40vh] md:max-h-none"
        >
          {loading ? (
            <div className="text-center py-8">
              <span className="text-sm font-semibold text-[#8367C7] animate-pulse">Cargando locales</span>
            </div>
          ) : (
            <>
              {filteredVenues.map((venue) => (
                <button
                  key={venue.id}
                  onClick={() => handleSelectVenue(venue)}
                  aria-label={`Seleccionar ${venue.name}`}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 flex gap-3 cursor-pointer ${
                    selectedVenue?.id === venue.id
                      ? 'bg-[#8367C7]/10 border-[#8367C7] shadow-sm'
                      : 'bg-white border-[#3A3A3A]/10 hover:border-[#8367C7]/30 hover:shadow-md shadow-sm'
                  }`}
                >
                  {venue.logoUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={venue.logoUrl}
                      alt={`Logo ${venue.name}`}
                      className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-[#3A3A3A]/5"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-1">
                      <h3 className="font-bold text-sm text-[#3A3A3A] truncate">{venue.name}</h3>
                      {venue.reviews && venue.reviews.length > 0 && (
                        <div className="flex items-center gap-0.5 text-xs text-amber-500 font-black flex-shrink-0">
                          <span>★</span>
                          <span>
                            {(
                              venue.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) /
                              venue.reviews.length
                            ).toFixed(1)}
                          </span>
                          <span className="text-[10px] text-[#3A3A3A]/50 font-semibold ml-0.5">
                            ({venue.reviews.length})
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-[#3A3A3A]/70 truncate mb-1">{venue.address}</p>
                    
                    {/* TCG & Official Tournament Badges */}
                    <div className="flex flex-wrap gap-1 mb-1.5">
                      {venue.tags?.some(tag => ['torneos oficiales', 'torneos', 'wpn', 'ots'].includes(tag.toLowerCase())) && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-500/10 text-amber-700 border border-amber-500/20 text-[8px] font-black rounded uppercase tracking-wider">
                          ★ Torneos Oficiales
                        </span>
                      )}
                      
                      {venue.tags?.some(tag => ['magic: the gathering', 'magic', 'mtg'].includes(tag.toLowerCase())) && (
                        <span className="inline-flex items-center px-1.5 py-0.5 bg-[#8367C7]/10 text-[#8367C7] border border-[#8367C7]/15 text-[8px] font-extrabold rounded">
                          Magic: The Gathering
                        </span>
                      )}

                      {venue.tags?.some(tag => ['pokémon', 'pokemon', 'pokémon tcg'].includes(tag.toLowerCase())) && (
                        <span className="inline-flex items-center px-1.5 py-0.5 bg-[#73D8D4]/15 text-[#3d8c89] border border-[#73D8D4]/25 text-[8px] font-extrabold rounded">
                          Pokémon
                        </span>
                      )}

                      {venue.tags?.some(tag => ['yu-gi-oh!', 'yugioh', 'yu-gi-oh! tcg'].includes(tag.toLowerCase())) && (
                        <span className="inline-flex items-center px-1.5 py-0.5 bg-rose-500/10 text-rose-700 border border-rose-500/20 text-[8px] font-extrabold rounded">
                          Yu-Gi-Oh!
                        </span>
                      )}

                      {venue.tags?.some(tag => ['lorcana', 'disney lorcana'].includes(tag.toLowerCase())) && (
                        <span className="inline-flex items-center px-1.5 py-0.5 bg-indigo-500/10 text-indigo-700 border border-indigo-500/20 text-[8px] font-extrabold rounded">
                          Lorcana
                        </span>
                      )}

                      {venue.tags?.some(tag => ['one piece', 'onepiece', 'one piece card game'].includes(tag.toLowerCase())) && (
                        <span className="inline-flex items-center px-1.5 py-0.5 bg-sky-500/10 text-sky-700 border border-sky-500/20 text-[8px] font-extrabold rounded">
                          One Piece
                        </span>
                      )}
                    </div>

                    {/* Game Match Badge */}
                    {searchMode === 'games' && searchQuery.trim() !== '' && (
                      <div className="mb-2">
                        {(() => {
                          const query = searchQuery.toLowerCase()
                          const matchingGames = (venue.venue_games || [])
                            .filter((g: any) => g.name?.toLowerCase().includes(query))
                            .map((g: any) => g.name)
                          
                          if (matchingGames.length === 0) return null

                          const displayedGames = matchingGames.slice(0, 2).join(', ')
                          const hasMore = matchingGames.length > 2

                          return (
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#8367C7]/5 border border-[#8367C7]/15 rounded-md text-[11px] font-bold text-[#8367C7] w-fit">
                              <svg className="w-3 h-3 text-[#8367C7] fill-current" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                                <path d="M256 54.99c-27 0-46.418 14.287-57.633 32.23-10.03 16.047-14.203 34.66-15.017 50.962-30.608 15.135-64.515 30.394-91.815 45.994-14.32 8.183-26.805 16.414-36.203 25.26C45.934 218.28 39 228.24 39 239.99c0 5 2.44 9.075 5.19 12.065 2.754 2.99 6.054 5.312 9.812 7.48 7.515 4.336 16.99 7.95 27.412 11.076 15.483 4.646 32.823 8.1 47.9 9.577-14.996 25.84-34.953 49.574-52.447 72.315C56.65 378.785 39 403.99 39 431.99c0 4-.044 7.123.31 10.26.355 3.137 1.256 7.053 4.41 10.156 3.155 3.104 7.017 3.938 10.163 4.28 3.146.345 6.315.304 10.38.304h111.542c8.097 0 14.026.492 20.125-3.43 6.1-3.92 8.324-9.275 12.67-17.275l.088-.16.08-.166s9.723-19.77 21.324-39.388c5.8-9.808 12.097-19.576 17.574-26.498 2.74-3.46 5.304-6.204 7.15-7.754.564-.472.82-.56 1.184-.76.363.2.62.288 1.184.76 1.846 1.55 4.41 4.294 7.15 7.754 5.477 6.922 11.774 16.69 17.574 26.498 11.6 19.618 21.324 39.387 21.324 39.387l.08.165.088.16c4.346 8 6.55 13.323 12.61 17.254 6.058 3.93 11.974 3.45 19.957 3.45H448c4 0 7.12.043 10.244-.304 3.123-.347 6.998-1.21 10.12-4.332 3.12-3.122 3.984-6.997 4.33-10.12.348-3.122.306-6.244.306-10.244 0-28-17.65-53.205-37.867-79.488-17.493-22.74-37.45-46.474-52.447-72.315 15.077-1.478 32.417-4.93 47.9-9.576 10.422-3.125 19.897-6.74 27.412-11.075 3.758-2.168 7.058-4.49 9.81-7.48 2.753-2.99 5.192-7.065 5.192-12.065 0-11.75-6.934-21.71-16.332-30.554-9.398-8.846-21.883-17.077-36.203-25.26-27.3-15.6-61.207-30.86-91.815-45.994-.814-16.3-4.988-34.915-15.017-50.96C302.418 69.276 283 54.99 256 54.99z" />
                              </svg>
                              <span>Tiene {displayedGames}{hasMore ? '...' : ''}</span>
                            </div>
                          )
                        })()}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-1">
                      {venue.tags
                        .filter(tag => !['magic: the gathering', 'magic', 'mtg', 'pokémon', 'pokemon', 'pokémon tcg', 'yu-gi-oh!', 'yugioh', 'yu-gi-oh! tcg', 'lorcana', 'disney lorcana', 'one piece', 'onepiece', 'one piece card game', 'torneos oficiales', 'torneos', 'wpn', 'ots'].includes(tag.toLowerCase()))
                        .slice(0, 3)
                        .map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 text-[10px] font-bold bg-[#F5F0E9] text-[#8367C7] rounded-md border border-[#8367C7]/10"
                          >
                            {tag}
                          </span>
                        ))}
                    </div>
                  </div>
                </button>
              ))}
              {filteredVenues.length === 0 && (
                <div 
                  data-testid="zero-state-search"
                  className="flex flex-col items-center text-center p-6 bg-white border border-[#3A3A3A]/10 rounded-2xl shadow-sm gap-4"
                >
                  <div className="w-12 h-12 rounded-full bg-[#8367C7]/5 border border-[#8367C7]/15 flex items-center justify-center text-[#8367C7]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2.0}
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                      />
                    </svg>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <h4 className="font-extrabold text-sm text-[#3A3A3A]">
                      No se encontraron resultados
                    </h4>
                    <p className="text-xs text-[#3A3A3A]/70 leading-relaxed max-w-[240px]">
                      No hay establecimientos que coincidan con tu búsqueda. Intenta limpiar tus filtros para ver todos los locales disponibles.
                    </p>
                  </div>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="w-full py-2 px-4 bg-[#8367C7] hover:bg-[#6f53b3] text-[#F5F0E9] text-xs font-black rounded-xl transition-all duration-150 shadow-sm cursor-pointer border border-transparent"
                  >
                    Limpiar filtros
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Link (Desktop Only) */}
        <div className="hidden md:block p-4 bg-[#F5F0E9]/50 border-t border-[#3A3A3A]/5">
          <Link href="/onboarding" className="block text-xs font-bold text-[#8367C7] hover:underline text-center cursor-pointer">
            ¿Eres propietario? Registra tu local
          </Link>
        </div>
      </div>

      {/* Floating Quick View Card Overlay */}
      {selectedVenue && (
        <div className="absolute bottom-6 left-4 right-4 md:left-auto md:right-4 md:w-96 z-10">
          <QuickViewCard
            venue={selectedVenue}
            onClose={() => setSelectedVenue(null)}
          />
        </div>
      )}
    </div>
  )
}
