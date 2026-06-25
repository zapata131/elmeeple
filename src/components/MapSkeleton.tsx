import React from 'react'

export default function MapSkeleton() {
  return (
    <div
      data-testid="map-skeleton"
      className="relative w-full h-full min-h-[350px] md:h-full bg-[#F5F0E9] overflow-hidden flex items-center justify-center border border-[#3A3A3A]/5 rounded-2xl"
    >
      {/* Simulated Map Street Grid Background */}
      <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-20 pointer-events-none">
        {Array.from({ length: 36 }).map((_, i) => (
          <div
            key={i}
            data-testid="skeleton-grid-block"
            className="border-r border-b border-[#3A3A3A]/10 bg-[#3A3A3A]/5 animate-pulse"
            style={{
              animationDelay: `${(i % 5) * 150}ms`,
              animationDuration: '2s',
            }}
          />
        ))}
      </div>

      {/* Simulated Diagonal Map Roads/Streets */}
      <div className="absolute inset-0 opacity-15 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[10%] w-[2px] h-[150%] bg-[#3A3A3A]/20 transform rotate-[35deg]" />
        <div className="absolute top-[-10%] left-[40%] w-[3px] h-[150%] bg-[#3A3A3A]/20 transform rotate-[35deg]" />
        <div className="absolute top-[-30%] left-[80%] w-[2px] h-[150%] bg-[#3A3A3A]/20 transform rotate-[35deg]" />
        <div className="absolute top-[20%] left-[-10%] w-[150%] h-[2px] bg-[#3A3A3A]/20 transform rotate-[-25deg]" />
        <div className="absolute top-[60%] left-[-10%] w-[150%] h-[3px] bg-[#3A3A3A]/20 transform rotate-[-25deg]" />
      </div>

      {/* Pulsing Map Radar effect in the center */}
      <div className="absolute flex items-center justify-center z-10 pointer-events-none">
        <div className="w-24 h-24 rounded-full border border-[#8367C7]/20 bg-[#8367C7]/5 animate-ping absolute duration-1000" />
        <div className="w-16 h-16 rounded-full border border-[#8367C7]/30 bg-[#8367C7]/10 animate-pulse absolute duration-1000" />
        <div className="w-6 h-6 rounded-full bg-[#8367C7] shadow-lg shadow-[#8367C7]/50 relative z-20 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-[#F5F0E9]" />
        </div>
      </div>

      {/* Stylized Pulsing Pins (Venues) scattered across the map */}
      <div
        data-testid="skeleton-pin"
        className="absolute top-[25%] left-[20%] w-4 h-4 rounded-full bg-[#8367C7]/40 border-2 border-white animate-pulse shadow-sm z-10"
        style={{ animationDelay: '200ms', animationDuration: '1.8s' }}
      />
      <div
        data-testid="skeleton-pin"
        className="absolute top-[40%] left-[75%] w-5 h-5 rounded-full bg-[#8367C7]/30 border-2 border-white animate-pulse shadow-sm z-10"
        style={{ animationDelay: '600ms', animationDuration: '1.8s' }}
      />
      <div
        data-testid="skeleton-pin"
        className="absolute top-[70%] left-[35%] w-4.5 h-4.5 rounded-full bg-[#8367C7]/35 border-2 border-white animate-pulse shadow-sm z-10"
        style={{ animationDelay: '400ms', animationDuration: '1.8s' }}
      />
      <div
        data-testid="skeleton-pin"
        className="absolute top-[60%] left-[85%] w-4 h-4 rounded-full bg-[#8367C7]/30 border-2 border-white animate-pulse shadow-sm z-10"
        style={{ animationDelay: '800ms', animationDuration: '1.8s' }}
      />

      {/* Floating Search Bar Placeholder at top/left mimicking map layout */}
      <div
        data-testid="skeleton-search-bar"
        className="absolute top-4 left-4 right-4 md:right-auto md:w-80 bg-white/90 backdrop-blur-sm border border-[#3A3A3A]/10 rounded-xl p-3 shadow-md flex items-center gap-3 z-20 animate-pulse pointer-events-none"
      >
        <div className="w-4 h-4 rounded-full border-2 border-[#3A3A3A]/40 flex-shrink-0" />
        <div className="h-4 bg-[#3A3A3A]/20 rounded-md w-2/3" />
      </div>

      {/* Floating Zoom Controls Placeholder on Right */}
      <div className="absolute right-4 bottom-24 flex flex-col gap-1 z-20 pointer-events-none">
        <div className="w-8 h-8 rounded-lg bg-white border border-[#3A3A3A]/10 shadow-sm flex items-center justify-center text-[#3A3A3A]/40 font-bold animate-pulse">+</div>
        <div className="w-8 h-8 rounded-lg bg-white border border-[#3A3A3A]/10 shadow-sm flex items-center justify-center text-[#3A3A3A]/40 font-bold animate-pulse">-</div>
      </div>

      {/* Bottom Loading Badge */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-white/95 backdrop-blur-sm border border-[#8367C7]/35 rounded-full shadow-lg flex items-center gap-2.5 z-20 pointer-events-none">
        <svg className="animate-spin h-4.5 w-4.5 text-[#8367C7]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="text-xs font-black text-[#8367C7] uppercase tracking-wider">Cargando Mapa</span>
      </div>
    </div>
  )
}
