'use client'

import dynamic from 'next/dynamic'

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
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#F5F0E9]">
      {/* Full screen Map Background */}
      <div className="absolute inset-0 w-full h-full z-0">
        <Map />
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
            <button className="w-full py-3 bg-[#F5F0E9] hover:bg-[#EAE2D5] text-[#3A3A3A] font-semibold rounded-xl border border-[#3A3A3A]/20 transition-all duration-200 cursor-pointer text-center">
              Registrar mi Local
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
