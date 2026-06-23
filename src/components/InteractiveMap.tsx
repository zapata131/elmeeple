'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import QuickViewCard, { Venue } from '@/components/QuickViewCard'

const MOCK_VENUES: Venue[] = [
  {
    id: '1',
    name: 'Orcs Stories',
    lat: 19.4165,
    lng: -99.1620,
    tags: ['Eurogames', 'TCGs', 'Café'],
    schedule: {
      mon: null,
      tue: { open: '14:00', close: '22:00' },
      wed: { open: '14:00', close: '22:00' },
      thu: { open: '14:00', close: '22:00' },
      fri: { open: '14:00', close: '22:00' },
      sat: { open: '14:00', close: '22:00' },
      sun: { open: '14:00', close: '22:00' }
    },
    address: 'Roma Norte, CDMX',
    description: 'Café de especialidad con una increíble ludoteca de juegos de mesa y comunidad activa de TCGs.',
    type: 'hibrido',
    instagram: 'orcs_stories',
    discord: 'https://discord.gg/orcsstories',
    logoUrl: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=150&h=150&fit=crop'
  },
  {
    id: '2',
    name: 'El Duende',
    lat: 19.3750,
    lng: -99.1780,
    tags: ['TCGs', 'Magic: The Gathering', 'Torneos'],
    schedule: {
      mon: { open: '11:00', close: '21:00' },
      tue: { open: '11:00', close: '21:00' },
      wed: { open: '11:00', close: '21:00' },
      thu: { open: '11:00', close: '21:00' },
      fri: { open: '11:00', close: '21:00' },
      sat: { open: '11:00', close: '21:00' },
      sun: { open: '11:00', close: '21:00' }
    },
    address: 'Coyoacán, CDMX',
    description: 'El punto de encuentro para torneos de cartas coleccionables y comunidad de juegos de mesa.',
    type: 'tienda',
    instagram: 'elduendetcg',
    discord: 'https://discord.gg/elduendetcg',
    logoUrl: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=150&h=150&fit=crop'
  },
  {
    id: '3',
    name: 'Ravenfolks',
    lat: 19.4184,
    lng: -99.1627,
    tags: ['Eurogames', 'Café', 'Ludoteca'],
    schedule: {
      mon: null,
      tue: { open: '14:00', close: '22:00' },
      wed: { open: '14:00', close: '22:00' },
      thu: { open: '14:00', close: '22:00' },
      fri: { open: '14:00', close: '22:00' },
      sat: { open: '14:00', close: '22:00' },
      sun: { open: '14:00', close: '22:00' }
    },
    address: 'Roma Norte, CDMX',
    description: 'El primer board game café de la Ciudad de México. Cientos de juegos de mesa, comida deliciosa y excelente café de especialidad.',
    type: 'cafe',
    instagram: 'ravenfolks',
    logoUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=150&h=150&fit=crop'
  }
]

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
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todos')

  // Filter venues based on search query and selected category chip
  const filteredVenues = MOCK_VENUES.filter((venue) => {
    // Category Filter
    if (selectedCategory === 'Cafés' && venue.type !== 'cafe') return false
    if (selectedCategory === 'Tiendas' && venue.type !== 'tienda') return false
    if (selectedCategory === 'Híbridos' && venue.type !== 'hibrido') return false

    // Search Filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase()
      const matchesName = venue.name.toLowerCase().includes(query)
      const matchesAddress = venue.address.toLowerCase().includes(query)
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
        <div className="p-4 md:px-6 md:py-4 flex flex-col gap-3 border-b border-[#3A3A3A]/5">
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
