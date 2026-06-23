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

// Dynamically import the Map component with SSR disabled
const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#F5F0E9]">
      <div className="text-center">
        <span className="text-lg font-semibold text-[#8367C7] animate-pulse">Cargando Mapa...</span>
      </div>
    </div>
  ),
})

export default function InteractiveMap() {
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [mapCenter, setMapCenter] = useState<[number, number] | undefined>(undefined)

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
            description,
            schedule,
            lat,
            lng,
            type,
            instagram,
            discord,
            logo_url,
            verified,
            venue_tags (
              tags (
                name
              )
            )
          `)
          .eq('verified', true)

        if (error) {
          console.error('Error fetching venues:', error)
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
            lat: v.lat,
            lng: v.lng,
            tags: tagsList,
            schedule: v.schedule,
            address: getFriendlyAddress(v.lat, v.lng),
            description: v.description,
            type: v.type,
            instagram: v.instagram,
            discord: v.discord,
            logoUrl: v.logo_url || undefined
          }
        })

        setVenues(formatted)
      } catch (err) {
        console.error('Unexpected error fetching venues:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchVenues()
  }, [])

  // Filter venues based on search query and selected category chip
  const filteredVenues = venues.filter((venue) => {
    // Category Filter
    if (selectedCategory === 'Cafés' && venue.type !== 'cafe') return false
    if (selectedCategory === 'Tiendas' && venue.type !== 'tienda') return false
    if (selectedCategory === 'Híbridos' && venue.type !== 'hibrido') return false

    // Search Filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase()
      const matchesName = venue.name.toLowerCase().includes(query)
      const matchesAddress = venue.address ? venue.address.toLowerCase().includes(query) : false
      const matchesTags = venue.tags.some(tag => tag.toLowerCase().includes(query))
      return matchesName || matchesAddress || matchesTags
    }

    return true
  })

  const handleSelectVenue = (venue: Venue) => {
    setSelectedVenue(venue)
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#F5F0E9]">
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
        {/* Brand Header */}
        <div className="p-4 md:p-6 flex flex-col gap-2 md:gap-4 border-b border-[#3A3A3A]/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              <span className="text-2xl md:text-4xl" role="img" aria-label="dice">🎲</span>
              <div>
                <h1 className="text-xl md:text-3xl font-extrabold tracking-tight text-[#3A3A3A]">
                  El Meeple
                </h1>
                <p className="text-xs md:text-sm font-semibold text-[#8367C7] tracking-wide uppercase">
                  Directorio de Juegos
                </p>
              </div>
            </div>
            <Link href="/onboarding" className="text-xs font-bold text-[#8367C7] hover:underline md:hidden">
              Registrar Local
            </Link>
          </div>
          
          <p className="hidden md:block text-lg font-medium text-[#3A3A3A]/95 leading-snug">
            ¿Dónde jugamos hoy? Tu guía de cafés de juegos y tiendas TCG.
          </p>
          
          <p className="hidden md:block text-sm text-[#3A3A3A]/70 leading-relaxed">
            Encuentra los mejores locales para jugar juegos de mesa, cartas coleccionables y conocer a tu comunidad local en LATAM y España.
          </p>
        </div>

        {/* Search and Category Filters */}
        <div className="p-4 md:px-6 md:py-4 flex flex-col gap-3 border-b border-[#3A3A3A]/5 text-sm">
          <LocationSearch onSelectLocation={(lat, lon) => setMapCenter([lat, lon])} />
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar locales..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 bg-white text-[#3A3A3A] border border-[#3A3A3A]/25 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8367C7]/50 focus:border-[#8367C7] text-sm shadow-inner"
            />
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
        </div>

        {/* Scrollable Venue List */}
        <div
          data-testid="venue-list"
          className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-3 max-h-[40vh] md:max-h-none"
        >
          {loading ? (
            <div className="text-center py-8">
              <span className="text-sm font-semibold text-[#8367C7] animate-pulse">Cargando locales...</span>
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
                    <h3 className="font-bold text-sm text-[#3A3A3A] truncate">{venue.name}</h3>
                    <p className="text-xs text-[#3A3A3A]/70 truncate mb-1.5">{venue.address}</p>
                    <div className="flex flex-wrap gap-1">
                      {venue.tags.slice(0, 3).map((tag) => (
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
                <div className="text-center py-8">
                  <span className="text-2xl block mb-2" role="img" aria-label="sad-face">🔍</span>
                  <p className="text-xs font-semibold text-[#3A3A3A]/50">No se encontraron locales.</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Link (Desktop Only) */}
        <div className="hidden md:block p-4 bg-[#F5F0E9]/50 border-t border-[#3A3A3A]/5">
          <Link href="/onboarding" className="block text-xs font-bold text-[#8367C7] hover:underline text-center cursor-pointer">
            ¿Eres propietario? Registrar mi Local
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
