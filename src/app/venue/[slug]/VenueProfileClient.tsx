'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { createClient } from '@/utils/supabase/client'
import { toggleFavorite } from '@/app/actions/favorite'
import { submitReview } from '@/app/actions/reviews'
import Link from 'next/link'
import { Venue, formatSchedule } from '@/components/QuickViewCard'

interface VenueProfileClientProps {
  venue: Venue & { venue_games: any[]; reviews: any[] }
}

const VENUE_TYPE_LABELS = {
  cafe: 'Café de Juegos',
  tienda: 'Tienda de Juegos / TCG',
  hibrido: 'Híbrido (Café y Tienda)',
  comunidad: 'Club / Comunidad'
}

const VIBE_TAGS_PRESETS = ['Eurogames', 'TCGs', 'Café', 'Comida', 'Familiar', 'Torneos', 'Rol']

export default function VenueProfileClient({ venue }: VenueProfileClientProps) {
  const { data: session } = useSession()
  const [isFavorite, setIsFavorite] = useState(false)
  const [loadingFavorite, setLoadingFavorite] = useState(false)

  // Catalog state
  const [games, setGames] = useState<any[]>(venue.venue_games)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPlayerCount, setSelectedPlayerCount] = useState<'all' | 'solo' | '2' | '3-4' | '5+'>('all')
  const [selectedDuration, setSelectedDuration] = useState<'all' | 'short' | 'medium' | 'long'>('all')

  // Reviews state
  const [reviews, setReviews] = useState<any[]>(venue.reviews)
  const [newRating, setNewRating] = useState<number>(5)
  const [newComment, setNewComment] = useState('')
  const [selectedVibeTags, setSelectedVibeTags] = useState<string[]>([])
  const [submittingReview, setSubmittingReview] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const formattedSchedule = formatSchedule(venue.schedule)
  const typeLabel = venue.type ? VENUE_TYPE_LABELS[venue.type] : null

  // Fetch dynamic details on mount
  useEffect(() => {
    const fetchFavoriteStatus = async () => {
      if (session?.user?.email) {
        const supabase = createClient()
        const { data: fav } = await supabase
          .from('favorites')
          .select('*')
          .eq('user_email', session.user.email)
          .eq('venue_id', venue.id)
          .single()

        setIsFavorite(!!fav)
      }
    }
    fetchFavoriteStatus()
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
        const newReviewObj = {
          id: `rev-${Date.now()}`,
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

  // Calculate review stats
  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0'

  const vibeStats: Record<string, number> = {}
  reviews.forEach((r) => {
    if (r.vibe_tags && Array.isArray(r.vibe_tags)) {
      r.vibe_tags.forEach((tag: string) => {
        vibeStats[tag] = (vibeStats[tag] || 0) + 1
      })
    }
  })

  // Filter games based on search and filters
  const filteredGames = games.filter((game) => {
    // 1. Text Search Filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase()
      if (!game.name?.toLowerCase().includes(query)) return false
    }

    // 2. Player Count Filter
    if (selectedPlayerCount !== 'all') {
      const min = game.min_players ?? 0
      const max = game.max_players ?? 99
      if (selectedPlayerCount === 'solo' && (min > 1 || max < 1)) return false
      if (selectedPlayerCount === '2' && (min > 2 || max < 2)) return false
      if (selectedPlayerCount === '3-4' && (max < 3 || min > 4)) return false
      if (selectedPlayerCount === '5+' && max < 5) return false
    }

    // 3. Play Duration Filter
    if (selectedDuration !== 'all') {
      const time = game.playing_time ?? 0
      if (selectedDuration === 'short' && time > 30) return false
      if (selectedDuration === 'medium' && (time <= 30 || time > 60)) return false
      if (selectedDuration === 'long' && time <= 60) return false
    }

    return true
  })

  return (
    <div className="min-h-screen bg-[#F5F0E9] text-[#3A3A3A]">
      {/* Premium Store Header Banner */}
      <div className="w-full bg-white border-b border-[#3A3A3A]/10 py-8 px-4 md:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          
          {/* Left: Logo and Store Title */}
          <div className="flex items-center gap-4">
            {/* Back Button */}
            <Link
              href="/"
              className="mr-2 p-3 bg-[#3A3A3A]/5 hover:bg-[#3A3A3A]/10 text-[#3A3A3A] rounded-xl transition-all font-bold text-sm flex items-center gap-1 cursor-pointer"
            >
              <span>🎽</span> <span className="hidden sm:inline">Mapa</span>
            </Link>
            
            {venue.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={venue.logoUrl}
                alt={`Logo ${venue.name}`}
                className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover border border-[#3A3A3A]/10 shadow-md flex-shrink-0"
              />
            ) : (
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-[#8367C7]/10 text-[#8367C7] flex items-center justify-center text-3xl font-bold flex-shrink-0 shadow-md">
                🎲
              </div>
            )}
            
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl md:text-4xl font-black text-[#3A3A3A] tracking-tight">{venue.name}</h1>
                {typeLabel && (
                  <span className="px-3 py-0.5 text-[10px] md:text-xs font-extrabold bg-[#8367C7]/15 text-[#8367C7] rounded-md uppercase tracking-wide border border-[#8367C7]/10">
                    {typeLabel}
                  </span>
                )}
              </div>
              <p className="text-xs md:text-sm font-semibold text-[#8367C7] mt-1 flex items-center gap-1">
                <span>📍</span> {venue.address}
              </p>
            </div>
          </div>

          {/* Right: Action CTAs and Favorite Toggle */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            {session?.user && (
              <button
                onClick={handleFavoriteToggle}
                disabled={loadingFavorite}
                className={`px-5 py-3 text-xs font-black rounded-xl transition-all border cursor-pointer flex items-center gap-1.5 shadow-sm ${
                  isFavorite
                    ? 'bg-yellow-500/15 border-yellow-500/40 text-yellow-700'
                    : 'bg-white hover:bg-[#3A3A3A]/5 border-[#3A3A3A]/15 text-[#3A3A3A]/70'
                }`}
              >
                {isFavorite ? 'Favorito ⭐' : 'Guardar Favorito ☆'}
              </button>
            )}
            
            {venue.instagram && (
              <a
                href={`https://instagram.com/${venue.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-white border border-[#3A3A3A]/15 hover:border-[#8367C7] hover:text-[#8367C7] text-[#3A3A3A]/70 rounded-xl transition-all flex items-center justify-center shadow-sm"
                aria-label="Instagram"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
            )}
            
            {venue.discord && (
              <a
                href={venue.discord}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-white border border-[#3A3A3A]/15 hover:border-[#8367C7] hover:text-[#8367C7] text-[#3A3A3A]/70 rounded-xl transition-all flex items-center justify-center shadow-sm"
                aria-label="Discord"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
              </a>
            )}
          </div>

        </div>
      </div>

      {/* Main Body Grid */}
      <div className="max-w-7xl mx-auto py-8 px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* =======================================================
            LEFT COLUMN (60% / 7 Cols): Rich, Searchable Ludoteca Catalog
           ======================================================= */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Header Info details card */}
          <div className="bg-white p-6 rounded-2xl border border-[#3A3A3A]/10 shadow-sm flex flex-col gap-3">
            <h2 className="text-xs font-extrabold text-[#8367C7] uppercase tracking-wider">🏪 Acerca del Establecimiento</h2>
            <p className="text-sm text-[#3A3A3A]/85 leading-relaxed">{venue.description}</p>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {(venue.tags || []).map((tag) => (
                <span key={tag} className="px-2.5 py-1 text-xs font-extrabold bg-[#3A3A3A]/5 text-[#3A3A3A]/80 rounded-lg">
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2 text-xs text-[#3A3A3A]/75 font-bold bg-[#3A3A3A]/5 p-3 rounded-xl mt-2">
              <span>🕒</span> <span>{formattedSchedule}</span>
            </div>
          </div>

          {/* Catalog Dashboard */}
          <div className="bg-white p-6 rounded-2xl border border-[#3A3A3A]/10 shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-center flex-wrap gap-2 border-b border-[#3A3A3A]/5 pb-3">
              <div>
                <h3 className="text-lg font-extrabold text-[#3A3A3A] flex items-center gap-1.5">
                  <span>🎲</span> Ludoteca de Juegos
                </h3>
                <p className="text-xs text-[#3A3A3A]/60 mt-0.5">Explora e investiga los juegos disponibles para jugar libremente.</p>
              </div>
              <span className="px-3 py-1 text-xs font-black bg-[#8367C7]/10 text-[#8367C7] rounded-full">
                {filteredGames.length} juegos
              </span>
            </div>

            {/* Filter controls */}
            <div className="flex flex-col gap-3">
              {/* Search input */}
              <input
                type="text"
                placeholder="Buscar juego por título (ej. Scythe, Catan)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 bg-white text-[#3A3A3A] border border-[#3A3A3A]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8367C7]/50 focus:border-[#8367C7] text-xs shadow-inner"
              />

              {/* Player Count Chips */}
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="text-[#3A3A3A]/60 font-semibold">Jugadores:</span>
                {[
                  { id: 'all', label: 'Todos' },
                  { id: 'solo', label: '1 (Solo)' },
                  { id: '2', label: '2' },
                  { id: '3-4', label: '3-4' },
                  { id: '5+', label: '5+ (Party)' }
                ].map((chip) => (
                  <button
                    key={chip.id}
                    onClick={() => setSelectedPlayerCount(chip.id as any)}
                    className={`px-3 py-1 font-bold rounded-lg border transition-all cursor-pointer ${
                      selectedPlayerCount === chip.id
                        ? 'bg-[#8367C7] border-[#8367C7] text-[#F5F0E9] shadow-sm'
                        : 'bg-[#3A3A3A]/5 border-[#3A3A3A]/10 text-[#3A3A3A]/75 hover:bg-[#3A3A3A]/10'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {/* Playtime Duration Chips */}
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="text-[#3A3A3A]/60 font-semibold">Duración:</span>
                {[
                  { id: 'all', label: 'Cualquiera' },
                  { id: 'short', label: 'Rápido (<30 min)' },
                  { id: 'medium', label: 'Medio (30-60 min)' },
                  { id: 'long', label: 'Largo (60+ min)' }
                ].map((chip) => (
                  <button
                    key={chip.id}
                    onClick={() => setSelectedDuration(chip.id as any)}
                    className={`px-3 py-1 font-bold rounded-lg border transition-all cursor-pointer ${
                      selectedDuration === chip.id
                        ? 'bg-[#8367C7] border-[#8367C7] text-[#F5F0E9] shadow-sm'
                        : 'bg-[#3A3A3A]/5 border-[#3A3A3A]/10 text-[#3A3A3A]/75 hover:bg-[#3A3A3A]/10'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Visual Games Grid */}
            {filteredGames.length === 0 ? (
              <div className="text-center py-12 bg-[#3A3A3A]/5 rounded-2xl border border-dashed border-[#3A3A3A]/10">
                <span className="text-3xl block mb-2">🔍</span>
                <p className="text-xs font-extrabold text-[#3A3A3A]/60">No se encontraron juegos con los filtros seleccionados.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredGames.map((game) => (
                  <div
                    key={game.id}
                    className="flex gap-3 bg-[#3A3A3A]/5 p-3 rounded-2xl border border-[#3A3A3A]/10 items-center hover:shadow-md transition-all hover:bg-white duration-200"
                  >
                    {game.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={game.thumbnail}
                        alt={game.name}
                        className="w-14 h-14 object-cover rounded-xl flex-shrink-0 shadow-sm"
                      />
                    ) : (
                      <div className="w-14 h-14 bg-[#8367C7]/15 text-[#8367C7] rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0">
                        🎲
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
                      <div className="flex justify-between items-start gap-1">
                        <span className="text-sm font-extrabold text-[#3A3A3A] truncate pr-1" title={game.name}>
                          {game.name}
                        </span>
                        
                        {/* BoardGameGeek Link */}
                        <a
                          href={`https://boardgamegeek.com/boardgame/${game.bgg_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[9px] font-black text-[#8367C7] hover:underline bg-[#8367C7]/10 px-1.5 py-0.5 rounded flex-shrink-0"
                          title="Ver en BoardGameGeek"
                        >
                          BGG ↗
                        </a>
                      </div>
                      
                      <div className="flex gap-2 text-[10px] font-semibold text-[#3A3A3A]/60 mt-1">
                        <span className="bg-[#3A3A3A]/5 px-2 py-0.5 rounded">
                          👥 {game.min_players && game.max_players
                            ? `${game.min_players}-${game.max_players} jug.`
                            : game.min_players
                              ? `${game.min_players}+ jug.`
                              : 'N/A jug.'}
                        </span>
                        {game.playing_time && (
                          <span className="bg-[#3A3A3A]/5 px-2 py-0.5 rounded">
                            ⏱️ {game.playing_time} min
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

        {/* =======================================================
            RIGHT COLUMN (40% / 5 Cols): Rich Reviews & Vibe Hub
           ======================================================= */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Ratings Summary Card */}
          <div className="bg-white p-6 rounded-2xl border border-[#3A3A3A]/10 shadow-sm flex flex-col gap-4">
            <h3 className="text-sm font-extrabold text-[#3A3A3A]/50 uppercase tracking-wider border-b border-[#3A3A3A]/5 pb-2">
              🏆 Valoración de la Comunidad
            </h3>
            
            <div className="flex justify-between items-center">
              <div>
                <span className="text-3xl font-black text-[#8367C7]">{averageRating}</span>
                <span className="text-sm font-bold text-[#3A3A3A]/50"> / 5.0</span>
                <p className="text-[10px] text-[#3A3A3A]/60 font-semibold mt-1">Basado en {reviews.length} reseñas</p>
              </div>
              
              <div className="flex flex-col items-end gap-1">
                <div className="flex gap-0.5 text-yellow-500 text-lg">
                  {'★'.repeat(Math.round(parseFloat(averageRating)))}{'☆'.repeat(5 - Math.round(parseFloat(averageRating)))}
                </div>
                <span className="px-2 py-0.5 bg-green-500/10 text-green-700 text-[9px] font-black rounded uppercase">
                  Excelente
                </span>
              </div>
            </div>

            {/* Vibe Tags Progress Bars */}
            {Object.keys(vibeStats).length > 0 ? (
              <div className="border-t border-[#3A3A3A]/5 pt-4 flex flex-col gap-3">
                <span className="text-[10px] font-extrabold text-[#3A3A3A]/60 uppercase tracking-wider mb-1">Vibra del Local</span>
                {Object.entries(vibeStats).map(([tag, count]) => {
                  const percentage = Math.round((count / reviews.length) * 100)
                  return (
                    <div key={tag} className="flex flex-col gap-1">
                      <div className="flex justify-between text-[10px] font-bold text-[#3A3A3A]/70">
                        <span>{tag}</span>
                        <span>{percentage}%</span>
                      </div>
                      <div className="w-full bg-[#3A3A3A]/10 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#8367C7] h-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-xs text-[#3A3A3A]/50 italic pt-2 border-t border-[#3A3A3A]/5">Aún no se han definido etiquetas de vibras.</p>
            )}
          </div>

          {/* Write Review Form */}
          <div className="bg-white p-6 rounded-2xl border border-[#3A3A3A]/10 shadow-sm flex flex-col gap-4">
            <h3 className="text-sm font-extrabold text-[#3A3A3A] flex items-center gap-1.5 border-b border-[#3A3A3A]/5 pb-3">
              <span>✍️</span> Escribir Reseña
            </h3>

            {session?.user ? (
              <form onSubmit={handleReviewSubmit} className="flex flex-col gap-4">
                {/* Star Rating Select */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#3A3A3A]/75 font-semibold">Tu Calificación:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        className={`text-2xl transition-colors cursor-pointer ${
                          star <= newRating ? 'text-yellow-500' : 'text-gray-350'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                {/* Vibe Presets checkboxes */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] text-[#3A3A3A]/60 font-extrabold uppercase">Selecciona las vibras del local:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {VIBE_TAGS_PRESETS.map((tag) => {
                      const isSelected = selectedVibeTags.includes(tag)
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleVibeTagToggle(tag)}
                          className={`px-2.5 py-1 text-[10px] font-extrabold rounded-lg border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#8367C7] border-[#8367C7] text-[#F5F0E9] shadow-sm'
                              : 'bg-[#3A3A3A]/5 border-[#3A3A3A]/10 text-[#3A3A3A]/70 hover:bg-[#3A3A3A]/15'
                          }`}
                        >
                          {tag}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Comment Textarea */}
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Comparte tu opinión... ¿Es espacioso? ¿Tienen buen café? ¿La comunidad es amigable?"
                  required
                  rows={3}
                  className="w-full p-3 border border-[#3A3A3A]/20 rounded-xl text-xs text-[#3A3A3A] focus:outline-none focus:ring-2 focus:ring-[#8367C7]/50 focus:border-[#8367C7] resize-none shadow-inner bg-[#3A3A3A]/5"
                />

                {formError && <p className="text-[10px] text-red-600 font-bold">{formError}</p>}

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full py-3 bg-[#8367C7] hover:bg-[#6f53b3] disabled:bg-[#3A3A3A]/15 text-[#F5F0E9] font-extrabold rounded-xl shadow-md cursor-pointer transition-all text-xs"
                >
                  {submittingReview ? 'Publicando...' : 'Publicar Reseña'}
                </button>
              </form>
            ) : (
              <div className="bg-[#3A3A3A]/5 p-4 rounded-xl text-center text-xs text-[#3A3A3A]/55 font-semibold border border-dashed border-[#3A3A3A]/15 py-6">
                🔑 Inicia sesión para escribir una reseña en este local.
              </div>
            )}
          </div>

          {/* Player Reviews Feed */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-extrabold text-[#3A3A3A]/50 uppercase tracking-wider">
              💬 Comentarios de la Comunidad
            </h3>
            
            {reviews.length === 0 ? (
              <p className="text-xs text-[#3A3A3A]/60 italic py-4 bg-white rounded-2xl border border-[#3A3A3A]/10 text-center">
                Aún no hay reseñas. ¡Sé el primero en dejar una!
              </p>
            ) : (
              <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-1">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="bg-white p-4 rounded-2xl border border-[#3A3A3A]/10 flex flex-col gap-2 shadow-sm"
                  >
                    <div className="flex justify-between items-center">
                      <span
                        className="font-extrabold text-xs text-[#3A3A3A]/80 truncate max-w-[200px]"
                        title={rev.user_email}
                      >
                        {rev.user_email}
                      </span>
                      <div className="text-yellow-500 text-xs">
                        {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                      </div>
                    </div>
                    
                    {rev.comment && <p className="text-xs text-[#3A3A3A] leading-relaxed">{rev.comment}</p>}
                    
                    {rev.vibe_tags && rev.vibe_tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {rev.vibe_tags.map((vt: string) => (
                          <span key={vt} className="px-2 py-0.5 text-[9px] font-extrabold bg-[#8367C7]/10 text-[#8367C7] rounded">
                            {vt}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <span className="text-[9px] text-[#3A3A3A]/45 self-end mt-1 font-semibold">
                      {new Date(rev.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  )
}
