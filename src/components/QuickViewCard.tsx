'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { createClient } from '@/utils/supabase/client'
import { toggleFavorite } from '@/app/actions/favorite'
import Link from 'next/link'

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
  slug?: string
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
  venue_games?: any[]
  reviews?: any[]
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

interface Announcement {
  id: string
  title: string
  content: string
  created_at: string
  venue_id: string
}

export default function QuickViewCard({ venue, onClose }: QuickViewCardProps) {
  const { data: session } = useSession()
  const [isFavorite, setIsFavorite] = useState(false)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loadingFavorite, setLoadingFavorite] = useState(false)

  const formattedSchedule = formatSchedule(venue.schedule)
  const typeLabel = venue.type ? VENUE_TYPE_LABELS[venue.type] : null

  // Fetch announcements and favorites dynamically on component mount
  useEffect(() => {
    const fetchVenueDetails = async () => {
      const supabase = createClient()

      // Fetch announcements
      const { data: anns } = await supabase
        .from('announcements')
        .select('*')
        .eq('venue_id', venue.id)
        .order('created_at', { ascending: false })

      if (anns) {
        setAnnouncements(anns)
      }

      // Fetch favorite status if user is logged in
      if (session?.user?.email) {
        const { data: fav } = await supabase
          .from('favorites')
          .select('*')
          .eq('user_email', session.user.email)
          .eq('venue_id', venue.id)
          .single()

        setIsFavorite(!!fav)
      }
    }

    fetchVenueDetails()
  }, [venue.id, session])

  const handleFavoriteToggle = async () => {
    if (!session?.user?.email) {
      alert('Debes iniciar sesión para guardar favoritos.')
      return
    }

    setLoadingFavorite(true)
    try {
      const res = await toggleFavorite(venue.id)
      if (res.success) {
        setIsFavorite(res.isFavorite ?? false)
      } else {
        alert(res.error || 'Error al actualizar favoritos.')
      }
    } catch (err) {
      console.error(err)
      alert('Error de conexión.')
    } finally {
      setLoadingFavorite(false)
    }
  }

  return (
    <div
      data-testid="quick-view-card"
      className="bg-[#F5F0E9] text-[#3A3A3A] p-5 rounded-2xl shadow-2xl border border-[#3A3A3A]/10 flex flex-col gap-3 w-full md:max-w-sm backdrop-blur-md bg-opacity-95 animate-in slide-in-from-bottom duration-300"
    >
      {/* Card Header */}
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
            <div className="w-12 h-12 rounded-xl bg-[#8367C7]/10 text-[#8367C7] flex items-center justify-center flex-shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6"
              >
                <path d="M12 2c-1.66 0-3 1.34-3 3 0 1.13.62 2.1 1.54 2.61C9.62 8.1 8.8 8.8 8 9.5L5.5 12A1 1 0 0 0 5 13.5h2v6.5A1 1 0 0 0 8 21h3.5l1-3.5 1 3.5H17a1 1 0 0 0 1-1v-6.5h2a1 1 0 0 0-.5-1.5L17 9.5c-.8-.7-1.62-1.4-2.54-1.89C15.38 7.1 16 6.13 16 5c0-1.66-1.34-3-3-3h-1z" />
              </svg>
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

      {/* Render Venue Type Badge and Favorite Button */}
      <div className="flex items-center justify-between gap-2">
        {typeLabel && (
          <span className="px-2.5 py-0.5 text-xs font-extrabold bg-[#8367C7]/15 text-[#8367C7] rounded-md uppercase tracking-wide border border-[#8367C7]/10">
            {typeLabel}
          </span>
        )}

        {/* Favorite ⭐ Button */}
        {session?.user && (
          <button
            onClick={handleFavoriteToggle}
            disabled={loadingFavorite}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all border cursor-pointer flex items-center gap-1.5 ${
              isFavorite
                ? 'bg-yellow-500/15 border-yellow-500/40 text-yellow-700'
                : 'bg-white hover:bg-[#3A3A3A]/5 border-[#3A3A3A]/15 text-[#3A3A3A]/70'
            }`}
          >
            {isFavorite ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-yellow-500"><path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" /></svg>
                Favorito
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 text-[#3A3A3A]/60"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499c.195-.397.683-.397.878 0l2.082 5.006 5.404.434c.834.066 1.17 1.115.57 1.729l-4.117 3.527 1.257 5.273c.193 1.11-.964 1.98-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.6-.614-.265-1.663.57-1.729l5.404-.434 2.082-5.005Z" /></svg>
                Guardar Favorito
              </>
            )}
          </button>
        )}
      </div>

      {/* Divider */}
      <div className="border-b border-[#3A3A3A]/10 my-1"></div>

      {/* Details Body */}
      <div className="flex flex-col gap-3">
        <p className="text-sm text-[#3A3A3A]/80 leading-relaxed">
          {venue.description}
        </p>

        {/* Specialty Tags */}
        <div className="flex flex-wrap gap-1.5 my-0.5">
          {(venue.tags || []).map((tag) => (
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
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[#3A3A3A]/60"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
          <span className="leading-snug">{formattedSchedule}</span>
        </div>

        {/* Announcements Bulletin Board */}
        {announcements.length > 0 && (
          <div className="border-t border-[#3A3A3A]/10 pt-3.5 flex flex-col gap-2.5">
            <span className="text-[10px] font-extrabold text-[#8367C7] uppercase tracking-wider">Cartelera de Anuncios</span>
            <div className="flex flex-col gap-2.5 max-h-36 overflow-y-auto pr-1">
              {announcements.map((ann) => (
                <div key={ann.id} className="bg-[#8367C7]/5 p-3 rounded-xl border border-[#8367C7]/10 flex flex-col gap-1.5">
                  <span className="font-extrabold text-xs text-[#3A3A3A]">{ann.title}</span>
                  <p className="text-[11px] text-[#3A3A3A]/80 leading-relaxed">{ann.content}</p>
                  <span className="text-[8px] text-[#3A3A3A]/45 self-end">
                    {new Date(ann.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions: Social Links and Full Profile Link CTA */}
      <div className="flex items-center gap-2 mt-1 border-t border-[#3A3A3A]/10 pt-3">
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

        {/* Premium Full Profile Link CTA */}
        <a
          href={`/venue/${venue.slug || venue.id}`}
          className="flex-1 py-2.5 bg-[#8367C7] hover:bg-[#6f53b3] text-[#F5F0E9] font-bold rounded-xl shadow-md transition-all duration-200 cursor-pointer text-center text-sm flex items-center justify-center gap-1.5 group"
        >
          <span>Ver Perfil y Ludoteca</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
        </a>
      </div>
    </div>
  )
}
