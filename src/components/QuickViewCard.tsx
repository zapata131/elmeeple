'use client'
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { createClient } from '@/utils/supabase/client'
import { toggleFavorite } from '@/app/actions/favorite'
import { submitReview } from '@/app/actions/reviews'

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

const VIBE_TAGS_PRESETS = ['Eurogames', 'TCGs', 'Café', 'Comida', 'Familiar', 'Torneos', 'Rol']

export default function QuickViewCard({ venue, onClose }: QuickViewCardProps) {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState<'general' | 'ludoteca' | 'reviews'>('general')
  const [isFavorite, setIsFavorite] = useState(false)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loadingFavorite, setLoadingFavorite] = useState(false)

  // Sync state with props or fetch dynamically
  const [games, setGames] = useState<any[]>(venue.venue_games || [])
  const [reviews, setReviews] = useState<any[]>(venue.reviews || [])

  // Review Form state
  const [newRating, setNewRating] = useState<number>(5)
  const [newComment, setNewComment] = useState('')
  const [selectedVibeTags, setSelectedVibeTags] = useState<string[]>([])
  const [submittingReview, setSubmittingReview] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const formattedSchedule = formatSchedule(venue.schedule)
  const typeLabel = venue.type ? VENUE_TYPE_LABELS[venue.type] : null

  // Fetch details (announcements, favorites, games, and reviews)
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

      // Fetch games
      const { data: dbGames } = await supabase
        .from('venue_games')
        .select('*')
        .eq('venue_id', venue.id)
      if (dbGames) {
        setGames(dbGames)
      }

      // Fetch reviews
      const { data: dbReviews } = await supabase
        .from('reviews')
        .select('*')
        .eq('venue_id', venue.id)
        .order('created_at', { ascending: false })
      if (dbReviews) {
        setReviews(dbReviews)
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

  const handleVibeTagToggle = (tag: string) => {
    setSelectedVibeTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user?.email) return

    setSubmittingReview(true)
    setFormError(null)

    try {
      const res = await submitReview(venue.id, newRating, newComment, selectedVibeTags)
      if (res.success) {
        // Add review locally to update the UI instantly
        const newReviewObj = {
          id: Math.random().toString(), // temporary id
          user_email: session.user.email,
          rating: newRating,
          comment: newComment.trim(),
          vibe_tags: selectedVibeTags,
          created_at: new Date().toISOString()
        }
        setReviews((prev) => [newReviewObj, ...prev])
        
        // Reset form
        setNewComment('')
        setNewRating(5)
        setSelectedVibeTags([])
      } else {
        setFormError(res.error || 'Error al enviar la reseña.')
      }
    } catch (err) {
      setFormError('Error de conexión al enviar la reseña.')
    } finally {
      setSubmittingReview(false)
    }
  }

  // Calculate statistics
  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0'

  // Calculate community vibe tags frequencies
  const vibeStats: Record<string, number> = {}
  reviews.forEach((r) => {
    if (r.vibe_tags && Array.isArray(r.vibe_tags)) {
      r.vibe_tags.forEach((tag: string) => {
        vibeStats[tag] = (vibeStats[tag] || 0) + 1
      })
    }
  })

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
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all border cursor-pointer flex items-center gap-1 ${
              isFavorite
                ? 'bg-yellow-500/15 border-yellow-500/40 text-yellow-700'
                : 'bg-white hover:bg-[#3A3A3A]/5 border-[#3A3A3A]/15 text-[#3A3A3A]/70'
            }`}
          >
            {isFavorite ? 'Favorito ⭐' : 'Favorito ☆'}
          </button>
        )}
      </div>

      {/* Tabs Header */}
      <div className="flex border-b border-[#3A3A3A]/10 my-1">
        <button
          onClick={() => setActiveTab('general')}
          className={`flex-1 py-2 text-xs font-extrabold border-b-2 transition-all cursor-pointer ${
            activeTab === 'general'
              ? 'border-[#8367C7] text-[#8367C7]'
              : 'border-transparent text-[#3A3A3A]/60 hover:text-[#3A3A3A]'
          }`}
        >
          Detalles
        </button>
        <button
          onClick={() => setActiveTab('ludoteca')}
          className={`flex-1 py-2 text-xs font-extrabold border-b-2 transition-all cursor-pointer ${
            activeTab === 'ludoteca'
              ? 'border-[#8367C7] text-[#8367C7]'
              : 'border-transparent text-[#3A3A3A]/60 hover:text-[#3A3A3A]'
          }`}
        >
          Ludoteca
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`flex-1 py-2 text-xs font-extrabold border-b-2 transition-all cursor-pointer ${
            activeTab === 'reviews'
              ? 'border-[#8367C7] text-[#8367C7]'
              : 'border-transparent text-[#3A3A3A]/60 hover:text-[#3A3A3A]'
          }`}
        >
          Reseñas
        </button>
      </div>

      {/* Tab Content: General (Details) */}
      {activeTab === 'general' && (
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
            <span role="img" aria-label="clock" className="text-sm">🕒</span>
            <span className="leading-snug">{formattedSchedule}</span>
          </div>

          {/* Announcements Bulletin Board */}
          {announcements.length > 0 && (
            <div className="border-t border-[#3A3A3A]/10 pt-3.5 flex flex-col gap-2.5">
              <span className="text-[10px] font-extrabold text-[#8367C7] uppercase tracking-wider">📢 Cartelera de Anuncios</span>
              <div className="flex flex-col gap-2.5 max-h-36 overflow-y-auto pr-1">
                {announcements.map((ann) => (
                  <div key={ann.id} className="bg-[#8367C7]/5 p-3 rounded-xl border border-[#8367C7]/10 flex flex-col gap-1.5">
                    <span className="font-extrabold text-xs text-[#3A3A3A]">{ann.title}</span>
                    <p className="text-[11px] text-[#3A3A3A]/80 leading-relaxed">{ann.content}</p>
                    <span className="text-[8px] text-[#3A3A3A]/40 self-end">
                      {new Date(ann.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Ludoteca */}
      {activeTab === 'ludoteca' && (
        <div className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-1">
          <span className="text-[10px] font-extrabold text-[#8367C7] uppercase tracking-wider">🎲 Catálogo de Juegos</span>
          {games.length === 0 ? (
            <p className="text-xs text-[#3A3A3A]/60 italic py-4 text-center">Este local aún no tiene juegos registrados.</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {games.map((game) => (
                <div key={game.id} className="flex gap-2 bg-white p-2 rounded-xl border border-[#3A3A3A]/10 items-center shadow-sm">
                  {game.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={game.thumbnail} alt={game.name} className="w-10 h-10 object-cover rounded-lg flex-shrink-0 shadow-sm" />
                  ) : (
                    <div className="w-10 h-10 bg-[#8367C7]/15 text-[#8367C7] rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0">🎲</div>
                  )}
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-[#3A3A3A] truncate" title={game.name}>{game.name}</span>
                    <span className="text-[9px] font-semibold text-[#3A3A3A]/50">
                      {game.min_players && game.max_players
                        ? `${game.min_players}-${game.max_players} jug.`
                        : game.min_players
                          ? `${game.min_players}+ jug.`
                          : 'Jugadores N/A'}
                      {game.playing_time ? ` | ${game.playing_time} min` : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Reseñas */}
      {activeTab === 'reviews' && (
        <div className="flex flex-col gap-4 max-h-96 overflow-y-auto pr-1">
          {/* Averages */}
          <div className="bg-white p-3 rounded-xl border border-[#3A3A3A]/10 flex justify-between items-center">
            <div>
              <span className="text-[10px] font-extrabold text-[#3A3A3A]/50 uppercase tracking-wider">Calificación Promedio</span>
              <p className="text-lg font-black text-[#8367C7] mt-0.5">{averageRating} / 5.0</p>
            </div>
            <div className="flex gap-0.5 text-yellow-500 text-sm">
              {'★'.repeat(Math.round(parseFloat(averageRating)))}{'☆'.repeat(5 - Math.round(parseFloat(averageRating)))}
            </div>
          </div>

          {/* Vibe tags progress bars */}
          {Object.keys(vibeStats).length > 0 && (
            <div className="bg-white p-3 rounded-xl border border-[#3A3A3A]/10 flex flex-col gap-2">
              <span className="text-[10px] font-extrabold text-[#3A3A3A]/50 uppercase tracking-wider mb-1">Vibra del Local</span>
              {Object.entries(vibeStats).map(([tag, count]) => {
                const percentage = Math.round((count / reviews.length) * 100)
                return (
                  <div key={tag} className="flex flex-col gap-1">
                    <div className="flex justify-between text-[10px] font-bold text-[#3A3A3A]/70">
                      <span>{tag}</span>
                      <span>{percentage}%</span>
                    </div>
                    <div className="w-full bg-[#3A3A3A]/10 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#8367C7] h-full transition-all duration-500" style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Write Review Form */}
          {session?.user ? (
            <form onSubmit={handleReviewSubmit} className="bg-white p-4 rounded-xl border border-[#3A3A3A]/10 flex flex-col gap-3">
              <span className="text-[10px] font-extrabold text-[#8367C7] uppercase tracking-wider">✍️ Escribir Reseña</span>
              
              {/* Star selection */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#3A3A3A]/75 font-semibold">Tu Calificación:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className={`text-lg transition-colors cursor-pointer ${
                        star <= newRating ? 'text-yellow-500' : 'text-gray-300'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              {/* Vibe Tags selector */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] text-[#3A3A3A]/60 font-semibold">Tags (selecciona vibras):</span>
                <div className="flex flex-wrap gap-1">
                  {VIBE_TAGS_PRESETS.map((tag) => {
                    const isSelected = selectedVibeTags.includes(tag)
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleVibeTagToggle(tag)}
                        className={`px-2 py-0.5 text-[9px] font-bold rounded transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#8367C7] text-[#F5F0E9]'
                            : 'bg-[#3A3A3A]/5 text-[#3A3A3A]/70 hover:bg-[#3A3A3A]/10'
                        }`}
                      >
                        {tag}
                      </button>
                    )
                  })}
                </div>
              </div>

              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escribe tu reseña aquí..."
                required
                rows={2}
                className="w-full p-2 border border-[#3A3A3A]/20 rounded-lg text-xs text-[#3A3A3A] focus:outline-none focus:border-[#8367C7] resize-none"
              />

              {formError && <p className="text-[10px] text-red-600 font-bold">{formError}</p>}

              <button
                type="submit"
                disabled={submittingReview}
                className="py-2 bg-[#8367C7] hover:bg-[#6f53b3] disabled:bg-[#3A3A3A]/10 text-[#F5F0E9] font-bold rounded-lg text-xs cursor-pointer shadow-sm transition-all"
              >
                {submittingReview ? 'Enviando...' : 'Enviar Reseña'}
              </button>
            </form>
          ) : (
            <div className="bg-[#3A3A3A]/5 p-3 rounded-xl text-center text-xs text-[#3A3A3A]/60 font-semibold border border-dashed border-[#3A3A3A]/15">
              🔑 Inicia sesión para escribir una reseña.
            </div>
          )}

          {/* Reviews Feed */}
          <div className="flex flex-col gap-2.5">
            <span className="text-[10px] font-extrabold text-[#3A3A3A]/50 uppercase tracking-wider">Comentarios de la Comunidad</span>
            {reviews.length === 0 ? (
              <p className="text-xs text-[#3A3A3A]/60 italic py-2">Sé el primero en dejar una reseña para este local.</p>
            ) : (
              reviews.map((rev) => (
                <div key={rev.id} className="bg-white p-3 rounded-xl border border-[#3A3A3A]/10 flex flex-col gap-1.5 shadow-sm">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[10px] text-[#3A3A3A]/70 truncate max-w-[180px]" title={rev.user_email}>
                      {rev.user_email}
                    </span>
                    <div className="text-yellow-500 text-[10px]">
                      {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                    </div>
                  </div>
                  {rev.comment && <p className="text-xs text-[#3A3A3A] leading-relaxed">{rev.comment}</p>}
                  {rev.vibe_tags && rev.vibe_tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {rev.vibe_tags.map((vt: string) => (
                        <span key={vt} className="px-1.5 py-0.5 text-[8px] font-bold bg-[#8367C7]/10 text-[#8367C7] rounded">
                          {vt}
                        </span>
                      ))}
                    </div>
                  )}
                  <span className="text-[8px] text-[#3A3A3A]/45 self-end">
                    {new Date(rev.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

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
        <button className="flex-1 py-2.5 bg-[#8367C7] hover:bg-[#6f53b3] text-[#F5F0E9] font-bold rounded-xl shadow-md transition-all duration-200 cursor-pointer text-center text-sm">
          Ver Perfil Completo
        </button>
      </div>
    </div>
  )
}
