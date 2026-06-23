import React from 'react'

export interface Venue {
  id: string
  name: string
  lat: number
  lng: number
  tags: string[]
  schedule: string
  address: string
  description: string
}

interface QuickViewCardProps {
  venue: Venue
  onClose: () => void
}

export default function QuickViewCard({ venue, onClose }: QuickViewCardProps) {
  return (
    <div
      data-testid="quick-view-card"
      className="bg-[#F5F0E9] text-[#3A3A3A] p-5 rounded-2xl shadow-2xl border border-[#3A3A3A]/10 flex flex-col gap-3 w-full md:max-w-sm backdrop-blur-md bg-opacity-95 animate-in slide-in-from-bottom duration-300"
    >
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-extrabold text-[#3A3A3A] leading-tight">
            {venue.name}
          </h2>
          <p className="text-xs font-semibold text-[#8367C7] tracking-wider uppercase mt-0.5">
            {venue.address}
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="close-card"
          className="text-[#3A3A3A]/40 hover:text-[#FF9E8A] transition-colors duration-200 p-1 rounded-full hover:bg-[#3A3A3A]/5 cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <p className="text-sm text-[#3A3A3A]/80 leading-relaxed">
        {venue.description}
      </p>

      <div className="flex flex-wrap gap-1.5 my-1">
        {venue.tags.map((tag) => (
          <span
            key={tag}
            className="px-2.5 py-1 text-xs font-bold bg-[#8367C7]/10 text-[#8367C7] rounded-lg"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-2 text-xs text-[#3A3A3A]/70 font-semibold bg-[#3A3A3A]/5 p-2.5 rounded-xl">
        <span role="img" aria-label="clock" className="text-sm">🕒</span>
        <span>{venue.schedule}</span>
      </div>

      <button className="w-full py-2.5 bg-[#73D8D4] hover:bg-[#5ec4c0] text-[#3A3A3A] font-bold rounded-xl shadow-md transition-all duration-200 cursor-pointer text-center text-sm mt-1">
        Ver Perfil Completo
      </button>
    </div>
  )
}
