import React from 'react'

export interface DailySchedule {
  open: string
  close: string
}

export interface StructuredSchedule {
  mon: DailySchedule | null
  tue: DailySchedule | null
  wed: DailySchedule | null
  thu: DailySchedule | null
  fri: DailySchedule | null
  sat: DailySchedule | null
  sun: DailySchedule | null
}

export interface Venue {
  id: string
  name: string
  lat: number
  lng: number
  tags: string[]
  schedule: StructuredSchedule | string
  address: string
  description: string
  type?: 'cafe' | 'tienda' | 'hibrido' | 'comunidad'
  instagram?: string
  discord?: string
  logoUrl?: string
}

interface QuickViewCardProps {
  venue: Venue
  onClose: () => void
}

const VENUE_TYPE_LABELS = {
  cafe: 'Café de Juegos',
  tienda: 'Tienda de Juegos / TCG',
  hibrido: 'Híbrido (Café y Tienda)',
  comunidad: 'Club / Comunidad'
}

export function formatSchedule(schedule: StructuredSchedule | string): string {
  if (typeof schedule === 'string') return schedule
  if (!schedule) return 'Horario no disponible'

  const DAYS_ORDER = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const
  const DAY_LABELS = {
    mon: 'Lun',
    tue: 'Mar',
    wed: 'Mié',
    thu: 'Jue',
    fri: 'Vie',
    sat: 'Sáb',
    sun: 'Dom'
  }

  const groups: string[] = []
  let startDay: typeof DAYS_ORDER[number] | null = null
  let endDay: typeof DAYS_ORDER[number] | null = null
  let lastHours: string | null = null

  for (let i = 0; i <= DAYS_ORDER.length; i++) {
    const day = i < DAYS_ORDER.length ? DAYS_ORDER[i] : null
    const dayHours = day && schedule[day] ? `${schedule[day]!.open} - ${schedule[day]!.close}` : 'Cerrado'

    if (dayHours !== 'Cerrado' && dayHours === lastHours) {
      endDay = day
    } else {
      if (startDay && lastHours) {
        const range = startDay === endDay ? DAY_LABELS[startDay] : `${DAY_LABELS[startDay]} - ${DAY_LABELS[endDay!]}`
        groups.push(`${range}: ${lastHours}`)
      }
      if (dayHours !== 'Cerrado') {
        startDay = day
        endDay = day
        lastHours = dayHours
      } else {
        startDay = null
        endDay = null
        lastHours = null
      }
    }
  }

  return groups.length > 0 ? groups.join(' | ') : 'Cerrado todos los días'
}

export default function QuickViewCard({ venue, onClose }: QuickViewCardProps) {
  const formattedSchedule = formatSchedule(venue.schedule)
  const typeLabel = venue.type ? VENUE_TYPE_LABELS[venue.type] : null

  return (
    <div
      data-testid="quick-view-card"
      className="bg-[#F5F0E9] text-[#3A3A3A] p-5 rounded-2xl shadow-2xl border border-[#3A3A3A]/10 flex flex-col gap-3 w-full md:max-w-sm backdrop-blur-md bg-opacity-95 animate-in slide-in-from-bottom duration-300"
    >
      <div className="flex justify-between items-start gap-3">
        <div className="flex items-start gap-3">
          {/* Render Logo if exists */}
          {venue.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={venue.logoUrl}
              alt={`Logo ${venue.name}`}
              className="w-12 h-12 rounded-xl object-cover border border-[#3A3A3A]/10 flex-shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-[#8367C7]/10 text-[#8367C7] flex items-center justify-center text-xl font-bold flex-shrink-0">
              🎲
            </div>
          )}
          
          <div>
            <h2 className="text-xl font-extrabold text-[#3A3A3A] leading-tight">
              {venue.name}
            </h2>
            <p className="text-xs font-semibold text-[#8367C7] tracking-wider uppercase mt-0.5">
              {venue.address}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          aria-label="close-card"
          className="text-[#3A3A3A]/40 hover:text-[#FF9E8A] transition-colors duration-200 p-1 rounded-full hover:bg-[#3A3A3A]/5 cursor-pointer flex-shrink-0"
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

      {/* Render Venue Type Badge */}
      {typeLabel && (
        <div className="flex">
          <span className="px-2.5 py-0.5 text-xs font-extrabold bg-[#8367C7]/15 text-[#8367C7] rounded-md uppercase tracking-wide border border-[#8367C7]/10">
            {typeLabel}
          </span>
        </div>
      )}

      <p className="text-sm text-[#3A3A3A]/80 leading-relaxed">
        {venue.description}
      </p>

      {/* Specialty Tags */}
      <div className="flex flex-wrap gap-1.5 my-0.5">
        {venue.tags.map((tag) => (
          <span
            key={tag}
            className="px-2.5 py-1 text-xs font-bold bg-[#3A3A3A]/5 text-[#3A3A3A]/85 rounded-lg"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Schedule Info */}
      <div className="flex items-center gap-2 text-xs text-[#3A3A3A]/70 font-semibold bg-[#3A3A3A]/5 p-2.5 rounded-xl">
        <span role="img" aria-label="clock" className="text-sm">🕒</span>
        <span className="leading-snug">{formattedSchedule}</span>
      </div>

      {/* Footer Actions: Social Links and Full Profile CTA */}
      <div className="flex items-center gap-2 mt-1">
        {/* Instagram Link */}
        {venue.instagram && (
          <a
            href={`https://instagram.com/${venue.instagram}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="visit-instagram"
            className="p-2.5 bg-[#F5F0E9] border border-[#3A3A3A]/20 hover:border-[#8367C7] text-[#3A3A3A] hover:text-[#8367C7] rounded-xl transition-all duration-200 flex items-center justify-center cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </a>
        )}

        {/* Discord Link */}
        {venue.discord && (
          <a
            href={venue.discord}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="visit-discord"
            className="p-2.5 bg-[#F5F0E9] border border-[#3A3A3A]/20 hover:border-[#8367C7] text-[#3A3A3A] hover:text-[#8367C7] rounded-xl transition-all duration-200 flex items-center justify-center cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
          </a>
        )}

        {/* Full Profile CTA */}
        <button className="flex-1 py-2.5 bg-[#73D8D4] hover:bg-[#5ec4c0] text-[#3A3A3A] font-bold rounded-xl shadow-md transition-all duration-200 cursor-pointer text-center text-sm">
          Ver Perfil Completo
        </button>
      </div>
    </div>
  )
}
