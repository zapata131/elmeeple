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
    schedule: 'Mar - Dom: 14:00 - 22:00',
    address: 'Roma Norte, CDMX',
    description: 'Café de especialidad con una increíble ludoteca de juegos de mesa y comunidad activa de TCGs.'
  },
  {
    id: '2',
    name: 'El Duende',
    lat: 19.3750,
    lng: -99.1780,
    tags: ['TCGs', 'Magic: The Gathering', 'Torneos'],
    schedule: 'Lun - Dom: 11:00 - 21:00',
    address: 'Coyoacán, CDMX',
    description: 'El punto de encuentro para torneos de cartas coleccionables y comunidad de juegos de mesa.'
  },
  {
    id: '3',
    name: 'Ravenfolks',
    lat: 19.4184,
    lng: -99.1627,
    tags: ['Eurogames', 'Café', 'Ludoteca'],
    schedule: 'Mar - Dom: 14:00 - 22:00',
    address: 'Roma Norte, CDMX',
    description: 'El primer board game café de la Ciudad de México. Cientos de juegos de mesa, comida deliciosa y excelente café de especialidad.'
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

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#F5F0E9]">
      {/* Full screen Map Background */}
      <div className="absolute inset-0 w-full h-full z-0">
        <Map venues={MOCK_VENUES} onSelectVenue={setSelectedVenue} />
      </div>

      {/* Floating Brand Card */}
      <div className="absolute top-4 left-4 right-4 md:right-auto md:max-w-md z-10">
        <div className="bg-[#F5F0E9] text-[#3A3A3A] p-6 rounded-2xl shadow-2xl border border-[#3A3A3A]/10 flex flex-col gap-4 backdrop-blur-md bg-opacity-95">
          <div className="flex items-center gap-3">
            <span className="text-4xl" role="img" aria-label="dice">🎲</span>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-[#3A3A3A]">
                El Meeple
              </h1>
              <p className="text-sm font-semibold text-[#8367C7] tracking-wide uppercase">
                Directorio de Juegos
              </p>
            </div>
          </div>
          
          <p className="text-lg font-medium text-[#3A3A3A]/95 leading-snug">
            ¿Dónde jugamos hoy? Tu guía de cafés de juegos y tiendas TCG.
          </p>
          
          <p className="text-sm text-[#3A3A3A]/70 leading-relaxed">
            Encuentra los mejores locales para jugar juegos de mesa, cartas coleccionables y conocer a tu comunidad local en LATAM y España.
          </p>

          <div className="flex flex-col gap-2 mt-2">
            <button className="w-full py-3 bg-[#73D8D4] hover:bg-[#5ec4c0] text-[#3A3A3A] font-bold rounded-xl shadow-md transition-all duration-200 cursor-pointer text-center">
              Explorar Locales Cercanos
            </button>
            <Link href="/onboarding" className="w-full py-3 bg-[#F5F0E9] hover:bg-[#EAE2D5] text-[#3A3A3A] font-semibold rounded-xl border border-[#3A3A3A]/20 transition-all duration-200 cursor-pointer text-center">
              Registrar mi Local
            </Link>
          </div>
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
