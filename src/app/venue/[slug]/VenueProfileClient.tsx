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
  venue: Venue & { venue_games: any[]; reviews: any[]; bgg_last_synced_at?: string | null }
}

const VENUE_TYPE_LABELS = {
  cafe: 'Café de juegos',
  tienda: 'Tienda de juegos y TCG',
  hibrido: 'Híbrido (café y tienda)',
  comunidad: 'Club y comunidad'
}

const VIBE_TAGS_PRESETS = ['Eurogames', 'TCGs', 'Café', 'Comida', 'Familiar', 'Torneos', 'Rol']

export default function VenueProfileClient({ venue }: VenueProfileClientProps) {
  const { data: session } = useSession()
  const [isFavorite, setIsFavorite] = useState(false)
  const [loadingFavorite, setLoadingFavorite] = useState(false)

  // Mobile active tab state
  const [activeMobileTab, setActiveMobileTab] = useState<'catalog' | 'reviews'>('catalog')

  // Catalog state
  const games = venue.venue_games
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPlayerCount, setSelectedPlayerCount] = useState<'all' | 'solo' | '2' | '3-4' | '5+'>('all')
  const [selectedDuration, setSelectedDuration] = useState<'all' | 'short' | 'medium' | 'long'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

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
      alert('Inicia sesión para guardar favoritos.')
      return
    }

    setLoadingFavorite(true)
    try {
      const res = await toggleFavorite(venue.id)
      if (res.success) {
        setIsFavorite(res.isFavorite ?? false)
      } else {
        alert(res.error || 'No se pudieron actualizar tus favoritos.')
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
        setFormError(res.error || 'No se pudo enviar tu reseña. Por favor, inténtalo de nuevo.')
      }
    } catch {
      setFormError('Error de conexión. No se pudo enviar tu reseña.')
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
    <div className="min-h-screen bg-[#F5F0E9] dark:bg-[#121212] text-[#3A3A3A] dark:text-[#F5F0E9]">
      {/* Premium Store Header Banner */}
      <div className="w-full bg-white dark:bg-[#1E1E1E] border-b border-[#3A3A3A]/10 dark:border-[#F5F0E9]/10 py-8 px-4 md:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          
          {/* Left: Logo and Store Title */}
          <div className="flex items-center gap-4">
            {/* Back Button */}
            <Link
              href="/"
              className="mr-2 p-3 bg-[#3A3A3A]/5 dark:bg-[#2D2D2D] hover:bg-[#3A3A3A]/10 dark:hover:bg-[#F5F0E9]/10 text-[#3A3A3A] dark:text-[#F5F0E9] rounded-xl transition-all font-bold text-sm flex items-center gap-1.5 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
              <span className="hidden sm:inline">Mapa</span>
            </Link>
            
            {venue.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={venue.logoUrl}
                alt={`Logo ${venue.name}`}
                className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover border border-[#3A3A3A]/10 dark:border-[#F5F0E9]/10 shadow-md flex-shrink-0"
              />
            ) : (
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-[#8367C7]/10 text-[#8367C7] flex items-center justify-center flex-shrink-0 shadow-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 512 512"
                  fill="currentColor"
                  className="w-10 h-10"
                >
                  <path d="M256 54.99c-27 0-46.418 14.287-57.633 32.23-10.03 16.047-14.203 34.66-15.017 50.962-30.608 15.135-64.515 30.394-91.815 45.994-14.32 8.183-26.805 16.414-36.203 25.26C45.934 218.28 39 228.24 39 239.99c0 5 2.44 9.075 5.19 12.065 2.754 2.99 6.054 5.312 9.812 7.48 7.515 4.336 16.99 7.95 27.412 11.076 15.483 4.646 32.823 8.1 47.9 9.577-14.996 25.84-34.953 49.574-52.447 72.315C56.65 378.785 39 403.99 39 431.99c0 4-.044 7.123.31 10.26.355 3.137 1.256 7.053 4.41 10.156 3.155 3.104 7.017 3.938 10.163 4.28 3.146.345 6.315.304 10.38.304h111.542c8.097 0 14.026.492 20.125-3.43 6.1-3.92 8.324-9.275 12.67-17.275l.088-.16.08-.166s9.723-19.77 21.324-39.388c5.8-9.808 12.097-19.576 17.574-26.498 2.74-3.46 5.304-6.204 7.15-7.754.564-.472.82-.56 1.184-.76.363.2.62.288 1.184.76 1.846 1.55 4.41 4.294 7.15 7.754 5.477 6.922 11.774 16.69 17.574 26.498 11.6 19.618 21.324 39.387 21.324 39.387l.08.165.088.16c4.346 8 6.55 13.323 12.61 17.254 6.058 3.93 11.974 3.45 19.957 3.45H448c4 0 7.12.043 10.244-.304 3.123-.347 6.998-1.21 10.12-4.332 3.12-3.122 3.984-6.997 4.33-10.12.348-3.122.306-6.244.306-10.244 0-28-17.65-53.205-37.867-79.488-17.493-22.74-37.45-46.474-52.447-72.315 15.077-1.478 32.417-4.93 47.9-9.576 10.422-3.125 19.897-6.74 27.412-11.075 3.758-2.168 7.058-4.49 9.81-7.48 2.753-2.99 5.192-7.065 5.192-12.065 0-11.75-6.934-21.71-16.332-30.554-9.398-8.846-21.883-17.077-36.203-25.26-27.3-15.6-61.207-30.86-91.815-45.994-.814-16.3-4.988-34.915-15.017-50.96C302.418 69.276 283 54.99 256 54.99z" />
                </svg>
              </div>
            )}
            
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl md:text-4xl font-black text-[#3A3A3A] dark:text-[#F5F0E9] tracking-tight">{venue.name}</h1>
                {typeLabel && (
                  <span className="px-3 py-0.5 text-[10px] md:text-xs font-extrabold bg-[#8367C7]/15 text-[#8367C7] rounded-md tracking-wide border border-[#8367C7]/10 dark:border-[#8367C7]/20">
                    {typeLabel}
                  </span>
                )}
              </div>
              <p className="text-xs md:text-sm font-semibold text-[#8367C7] mt-1 flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-[#8367C7] flex-shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>
                {venue.address}
              </p>
            </div>
          </div>

          {/* Right: Action CTAs and Favorite Toggle */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            {session?.user && (
              <button
                onClick={handleFavoriteToggle}
                disabled={loadingFavorite}
                className={`px-5 py-3 text-xs font-black rounded-xl transition-all border cursor-pointer flex items-center gap-2 shadow-sm ${
                  isFavorite
                    ? 'bg-yellow-500/15 border-yellow-500/40 text-yellow-700'
                    : 'bg-white dark:bg-[#2D2D2D] hover:bg-[#3A3A3A]/5 dark:hover:bg-[#F5F0E9]/5 border-[#3A3A3A]/15 dark:border-[#F5F0E9]/15 text-[#3A3A3A]/70 dark:text-[#F5F0E9]/70'
                }`}
              >
                {isFavorite ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-yellow-500"><path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" /></svg>
                    Favorito
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[#3A3A3A]/60 dark:text-[#F5F0E9]/60"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499c.195-.397.683-.397.878 0l2.082 5.006 5.404.434c.834.066 1.17 1.115.57 1.729l-4.117 3.527 1.257 5.273c.193 1.11-.964 1.98-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.6-.614-.265-1.663.57-1.729l5.404-.434 2.082-5.005Z" /></svg>
                    Guardar en favoritos
                  </>
                )}
              </button>
            )}
            
            {venue.instagram && (
              <a
                href={`https://instagram.com/${venue.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-white dark:bg-[#2D2D2D] border border-[#3A3A3A]/15 dark:border-[#F5F0E9]/15 hover:border-[#8367C7] hover:text-[#8367C7] text-[#3A3A3A]/70 dark:text-[#F5F0E9]/70 rounded-xl transition-all flex items-center justify-center shadow-sm"
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
                className="p-3 bg-white dark:bg-[#2D2D2D] border border-[#3A3A3A]/15 dark:border-[#F5F0E9]/15 hover:border-[#8367C7] hover:text-[#8367C7] text-[#3A3A3A]/70 dark:text-[#F5F0E9]/70 rounded-xl transition-all flex items-center justify-center shadow-sm"
                aria-label="Discord"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
              </a>
            )}
          </div>

        </div>
      </div>

      {/* Tabbed Mobile Navigation Bar */}
      <div className="block lg:hidden border-b border-[#3A3A3A]/10 dark:border-b-[#F5F0E9]/10 bg-white dark:bg-[#1E1E1E]">
        <div className="flex max-w-7xl mx-auto px-4">
          <button
            onClick={() => setActiveMobileTab('catalog')}
            className={`flex-1 py-4 text-center text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeMobileTab === 'catalog'
                ? 'border-[#8367C7] text-[#8367C7]'
                : 'border-transparent text-[#3A3A3A]/60 dark:text-[#F5F0E9]/60'
            }`}
          >
            Ludoteca
          </button>
          <button
            onClick={() => setActiveMobileTab('reviews')}
            className={`flex-1 py-4 text-center text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeMobileTab === 'reviews'
                ? 'border-[#8367C7] text-[#8367C7]'
                : 'border-transparent text-[#3A3A3A]/60 dark:text-[#F5F0E9]/60'
            }`}
          >
            Comunidad
          </button>
        </div>
      </div>

      {/* Main Body Grid */}
      <div className="max-w-7xl mx-auto py-8 px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* =======================================================
            LEFT COLUMN (60% / 7 Cols): Rich, Searchable Ludoteca Catalog
           ======================================================= */}
        <div className={`lg:col-span-7 flex flex-col gap-6 ${activeMobileTab === 'catalog' ? 'flex' : 'hidden lg:flex'}`}>
          
          {/* Header Info details card */}
          <div className="bg-white dark:bg-[#1E1E1E] p-6 rounded-2xl border border-[#3A3A3A]/10 dark:border-[#F5F0E9]/10 shadow-sm flex flex-col gap-3">
            <h2 className="text-xs font-extrabold text-[#8367C7] tracking-wider">Acerca del establecimiento</h2>
            <p className="text-sm text-[#3A3A3A]/85 dark:text-[#F5F0E9]/85 leading-relaxed">{venue.description}</p>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {(venue.tags || []).map((tag) => (
                <span key={tag} className="px-2.5 py-1 text-xs font-extrabold bg-[#3A3A3A]/5 dark:bg-[#2D2D2D] text-[#3A3A3A]/80 dark:text-[#F5F0E9]/80 rounded-lg">
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2 text-xs text-[#3A3A3A]/75 dark:text-[#F5F0E9]/75 font-bold bg-[#3A3A3A]/5 dark:bg-[#2D2D2D] p-3 rounded-xl mt-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[#3A3A3A]/60 dark:text-[#F5F0E9]/60"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
              <span>{formattedSchedule}</span>
            </div>
          </div>

          {/* Catalog Dashboard */}
          <div className="bg-white dark:bg-[#1E1E1E] p-6 rounded-2xl border border-[#3A3A3A]/10 dark:border-[#F5F0E9]/10 shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-center flex-wrap gap-2 border-b border-[#3A3A3A]/5 dark:border-b-[#F5F0E9]/5 pb-3">
              <div>
                <h3 className="text-lg font-extrabold text-[#3A3A3A] dark:text-[#F5F0E9] flex items-center gap-1.5">
                  Ludoteca de juegos
                </h3>
                <p className="text-xs text-[#3A3A3A]/60 dark:text-[#F5F0E9]/60 mt-0.5">Explora la colección de juegos disponibles para jugar.</p>
                {venue.bgg_last_synced_at && (
                  <p className="text-[10px] text-[#8367C7] font-semibold mt-1 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
                    Sincronizado con BGG: {new Date(venue.bgg_last_synced_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                {/* View Mode Toggle Buttons (Grid vs List) */}
                <div className="flex bg-[#3A3A3A]/5 dark:bg-[#2D2D2D] p-0.5 rounded-lg border border-[#3A3A3A]/10 dark:border-[#F5F0E9]/10">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1 rounded-md transition-all cursor-pointer ${
                      viewMode === 'grid'
                        ? 'bg-[#8367C7] text-white shadow-sm'
                        : 'text-[#3A3A3A]/50 dark:text-[#F5F0E9]/50 hover:text-[#3A3A3A] dark:hover:text-[#F5F0E9]'
                    }`}
                    title="Vista de cuadrícula"
                    data-testid="view-mode-grid"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25A2.25 2.25 0 0 1 13.5 8.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1 rounded-md transition-all cursor-pointer ${
                      viewMode === 'list'
                        ? 'bg-[#8367C7] text-white shadow-sm'
                        : 'text-[#3A3A3A]/50 dark:text-[#F5F0E9]/50 hover:text-[#3A3A3A] dark:hover:text-[#F5F0E9]'
                    }`}
                    title="Vista de lista"
                    data-testid="view-mode-list"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 5.25h16.5m-16.5-10.5h16.5" />
                    </svg>
                  </button>
                </div>
                <span className="px-3 py-1 text-xs font-black bg-[#8367C7]/10 text-[#8367C7] rounded-full">
                  {filteredGames.length} juegos
                </span>
              </div>
            </div>

            {/* Filter controls */}
            <div className="flex flex-col gap-3">
              {/* Search input */}
              <input
                type="text"
                placeholder="Buscar juego por título (ej. Scythe, Catan)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 bg-white dark:bg-[#2D2D2D] text-[#3A3A3A] dark:text-[#F5F0E9] border border-[#3A3A3A]/20 dark:border-[#F5F0E9]/25 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8367C7]/50 focus:border-[#8367C7] text-xs shadow-inner"
              />

              {/* Player Count Chips */}
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="text-[#3A3A3A]/60 dark:text-[#F5F0E9]/60 font-semibold">Jugadores:</span>
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
                        : 'bg-[#3A3A3A]/5 dark:bg-[#2D2D2D] border-[#3A3A3A]/10 dark:border-[#F5F0E9]/10 text-[#3A3A3A]/75 dark:text-[#F5F0E9]/75 hover:bg-[#3A3A3A]/10 dark:hover:bg-[#F5F0E9]/10'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {/* Playtime Duration Chips */}
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="text-[#3A3A3A]/60 dark:text-[#F5F0E9]/60 font-semibold">Duración:</span>
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
                        : 'bg-[#3A3A3A]/5 dark:bg-[#2D2D2D] border-[#3A3A3A]/10 dark:border-[#F5F0E9]/10 text-[#3A3A3A]/75 dark:text-[#F5F0E9]/75 hover:bg-[#3A3A3A]/10 dark:hover:bg-[#F5F0E9]/10'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Visual Games Grid/List */}
            {filteredGames.length === 0 ? (
              <div className="text-center py-12 bg-[#3A3A3A]/5 dark:bg-[#2D2D2D]/50 rounded-2xl border border-dashed border-[#3A3A3A]/10 dark:border-[#F5F0E9]/10">
                <p className="text-xs font-extrabold text-[#3A3A3A]/60 dark:text-[#F5F0E9]/60">No se encontraron juegos con los filtros seleccionados.</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" data-testid="games-grid">
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
                      <div className="w-14 h-14 bg-[#8367C7]/15 text-[#8367C7] rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 512 512"
                          fill="currentColor"
                          className="w-5 h-5"
                        >
                          <path d="M256 54.99c-27 0-46.418 14.287-57.633 32.23-10.03 16.047-14.203 34.66-15.017 50.962-30.608 15.135-64.515 30.394-91.815 45.994-14.32 8.183-26.805 16.414-36.203 25.26C45.934 218.28 39 228.24 39 239.99c0 5 2.44 9.075 5.19 12.065 2.754 2.99 6.054 5.312 9.812 7.48 7.515 4.336 16.99 7.95 27.412 11.076 15.483 4.646 32.823 8.1 47.9 9.577-14.996 25.84-34.953 49.574-52.447 72.315C56.65 378.785 39 403.99 39 431.99c0 4-.044 7.123.31 10.26.355 3.137 1.256 7.053 4.41 10.156 3.155 3.104 7.017 3.938 10.163 4.28 3.146.345 6.315.304 10.38.304h111.542c8.097 0 14.026.492 20.125-3.43 6.1-3.92 8.324-9.275 12.67-17.275l.088-.16.08-.166s9.723-19.77 21.324-39.388c5.8-9.808 12.097-19.576 17.574-26.498 2.74-3.46 5.304-6.204 7.15-7.754.564-.472.82-.56 1.184-.76.363.2.62.288 1.184.76 1.846 1.55 4.41 4.294 7.15 7.754 5.477 6.922 11.774 16.69 17.574 26.498 11.6 19.618 21.324 39.387 21.324 39.387l.08.165.088.16c4.346 8 6.55 13.323 12.61 17.254 6.058 3.93 11.974 3.45 19.957 3.45H448c4 0 7.12.043 10.244-.304 3.123-.347 6.998-1.21 10.12-4.332 3.12-3.122 3.984-6.997 4.33-10.12.348-3.122.306-6.244.306-10.244 0-28-17.65-53.205-37.867-79.488-17.493-22.74-37.45-46.474-52.447-72.315 15.077-1.478 32.417-4.93 47.9-9.576 10.422-3.125 19.897-6.74 27.412-11.075 3.758-2.168 7.058-4.49 9.81-7.48 2.753-2.99 5.192-7.065 5.192-12.065 0-11.75-6.934-21.71-16.332-30.554-9.398-8.846-21.883-17.077-36.203-25.26-27.3-15.6-61.207-30.86-91.815-45.994-.814-16.3-4.988-34.915-15.017-50.96C302.418 69.276 283 54.99 256 54.99z" />
                        </svg>
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
                      <div className="flex justify-between items-start gap-1">
                        <span className="text-sm font-extrabold text-[#3A3A3A] truncate pr-1" title={game.name}>
                          {game.name}
                        </span>
                        
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
                          {game.min_players && game.max_players
                            ? `${game.min_players}-${game.max_players} jug.`
                            : game.min_players
                              ? `${game.min_players}+ jug.`
                              : 'N/A jug.'}
                        </span>
                        {game.playing_time && (
                          <span className="bg-[#3A3A3A]/5 px-2 py-0.5 rounded">
                            {game.playing_time} min
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-2" data-testid="games-list">
                {filteredGames.map((game) => (
                  <div
                    key={game.id}
                    className="flex items-center justify-between gap-3 bg-[#3A3A3A]/5 p-2.5 rounded-xl border border-[#3A3A3A]/10 hover:bg-white transition-all duration-200"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {game.thumbnail ? (
                        <img
                          src={game.thumbnail}
                          alt={game.name}
                          className="w-10 h-10 object-cover rounded-lg flex-shrink-0 shadow-sm"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-[#8367C7]/15 text-[#8367C7] rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" className="w-4 h-4">
                            <path d="M256 54.99c-27 0-46.418 14.287-57.633 32.23-10.03 16.047-14.203 34.66-15.017 50.962-30.608 15.135-64.515 30.394-91.815 45.994-14.32 8.183-26.805 16.414-36.203 25.26C45.934 218.28 39 228.24 39 239.99c0 5 2.44 9.075 5.19 12.065 2.754 2.99 6.054 5.312 9.812 7.48 7.515 4.336 16.99 7.95 27.412 11.076 15.483 4.646 32.823 8.1 47.9 9.577-14.996 25.84-34.953 49.574-52.447 72.315C56.65 378.785 39 403.99 39 431.99c0 4-.044 7.123.31 10.26.355 3.137 1.256 7.053 4.41 10.156 3.155 3.104 7.017 3.938 10.163 4.28 3.146.345 6.315.304 10.38.304h111.542c8.097 0 14.026.492 20.125-3.43 6.1-3.92 8.324-9.275 12.67-17.275l.088-.16.08-.166s9.723-19.77 21.324-39.388c5.8-9.808 12.097-19.576 17.574-26.498 2.74-3.46 5.304-6.204 7.15-7.754.564-.472.82-.56 1.184-.76.363.2.62.288 1.184.76 1.846 1.55 4.41 4.294 7.15 7.754 5.477 6.922 11.774 16.69 17.574 26.498 11.6 19.618 21.324 39.387 21.324 39.387l.08.165.088.16c4.346 8 6.55 13.323 12.61 17.254 6.058 3.93 11.974 3.45 19.957 3.45H448c4 0 7.12.043 10.244-.304 3.123-.347 6.998-1.21 10.12-4.332 3.12-3.122 3.984-6.997 4.33-10.12.348-3.122.306-6.244.306-10.244 0-28-17.65-53.205-37.867-79.488-17.493-22.74-37.45-46.474-52.447-72.315 15.077-1.478 32.417-4.93 47.9-9.576 10.422-3.125 19.897-6.74 27.412-11.075 3.758-2.168 7.058-4.49 9.81-7.48 2.753-2.99 5.192-7.065 5.192-12.065 0-11.75-6.934-21.71-16.332-30.554-9.398-8.846-21.883-17.077-36.203-25.26-27.3-15.6-61.207-30.86-91.815-45.994-.814-16.3-4.988-34.915-15.017-50.96C302.418 69.276 283 54.99 256 54.99z" />
                          </svg>
                        </div>
                      )}
                      <span className="text-xs font-bold text-[#3A3A3A] truncate" title={game.name}>
                        {game.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="flex gap-1 text-[9px] font-bold text-[#3A3A3A]/60">
                        <span className="bg-[#3A3A3A]/5 px-2 py-0.5 rounded">
                          {game.min_players && game.max_players
                            ? `${game.min_players}-${game.max_players} jug.`
                            : game.min_players
                              ? `${game.min_players}+ jug.`
                              : 'N/A jug.'}
                        </span>
                        {game.playing_time && (
                          <span className="bg-[#3A3A3A]/5 px-2 py-0.5 rounded">
                            {game.playing_time} min
                          </span>
                        )}
                      </div>

                      <a
                        href={`https://boardgamegeek.com/boardgame/${game.bgg_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[9px] font-black text-[#8367C7] hover:underline bg-[#8367C7]/10 px-2 py-0.5 rounded"
                        title="Ver en BoardGameGeek"
                      >
                        BGG ↗
                      </a>
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
        <div className={`lg:col-span-5 flex flex-col gap-6 ${activeMobileTab === 'reviews' ? 'flex' : 'hidden lg:flex'}`}>
          
          {/* Ratings Summary Card */}
          <div className="bg-white dark:bg-[#1E1E1E] p-6 rounded-2xl border border-[#3A3A3A]/10 dark:border-[#F5F0E9]/10 shadow-sm flex flex-col gap-4">
            <h3 className="text-sm font-extrabold text-[#3A3A3A]/50 dark:text-[#F5F0E9]/50 tracking-wider border-b border-[#3A3A3A]/5 dark:border-b-[#F5F0E9]/5 pb-2">
              Valoración de la comunidad
            </h3>
            
            <div className="flex justify-between items-center">
              <div>
                <span className="text-3xl font-black text-[#8367C7]">{averageRating}</span>
                <span className="text-sm font-bold text-[#3A3A3A]/50 dark:text-[#F5F0E9]/50"> / 5.0</span>
                <p className="text-[10px] text-[#3A3A3A]/60 dark:text-[#F5F0E9]/60 font-semibold mt-1">Basado en {reviews.length} reseñas</p>
              </div>
              
              <div className="flex flex-col items-end gap-1">
                <div className="flex gap-0.5 text-yellow-500 text-lg">
                  {'★'.repeat(Math.round(parseFloat(averageRating)))}{'☆'.repeat(5 - Math.round(parseFloat(averageRating)))}
                </div>
                <span className="px-2 py-0.5 bg-green-500/10 text-green-700 text-[9px] font-black rounded">
                  Excelente
                </span>
              </div>
            </div>

            {/* Vibe Tags Progress Bars */}
            {Object.keys(vibeStats).length > 0 ? (
              <div className="border-t border-[#3A3A3A]/5 dark:border-t-[#F5F0E9]/5 pt-4 flex flex-col gap-3">
                <span className="text-[10px] font-extrabold text-[#3A3A3A]/60 dark:text-[#F5F0E9]/60 tracking-wider mb-1">Vibra del local</span>
                {Object.entries(vibeStats).map(([tag, count]) => {
                  const percentage = Math.round((count / reviews.length) * 100)
                  return (
                    <div key={tag} className="flex flex-col gap-1">
                      <div className="flex justify-between text-[10px] font-bold text-[#3A3A3A]/70 dark:text-[#F5F0E9]/70">
                        <span>{tag}</span>
                        <span>{percentage}%</span>
                      </div>
                      <div className="w-full bg-[#3A3A3A]/10 dark:bg-[#F5F0E9]/10 h-1.5 rounded-full overflow-hidden">
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
              <p className="text-xs text-[#3A3A3A]/50 dark:text-[#F5F0E9]/50 italic pt-2 border-t border-[#3A3A3A]/5 dark:border-t-[#F5F0E9]/5">Aún no se han definido etiquetas de vibras.</p>
            )}
          </div>

          {/* Write Review Form */}
          <div className="bg-white dark:bg-[#1E1E1E] p-6 rounded-2xl border border-[#3A3A3A]/10 dark:border-[#F5F0E9]/10 shadow-sm flex flex-col gap-4">
            <h3 className="text-sm font-extrabold text-[#3A3A3A] dark:text-[#F5F0E9] flex items-center gap-1.5 border-b border-[#3A3A3A]/5 dark:border-b-[#F5F0E9]/5 pb-3">
              Escribir reseña
            </h3>

            {session?.user ? (
              <form onSubmit={handleReviewSubmit} className="flex flex-col gap-4">
                {/* Star Rating Select */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#3A3A3A]/75 dark:text-[#F5F0E9]/75 font-semibold">Tu calificación:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        className={`text-2xl transition-colors cursor-pointer ${
                          star <= newRating ? 'text-yellow-500' : 'text-brand-dark/20 dark:text-brand-dark/40'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                {/* Vibe Presets checkboxes */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] text-[#3A3A3A]/60 dark:text-[#F5F0E9]/60 font-extrabold">Selecciona las vibras del local:</span>
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
                              : 'bg-[#3A3A3A]/5 dark:bg-[#2D2D2D] border-[#3A3A3A]/10 dark:border-[#F5F0E9]/10 text-[#3A3A3A]/70 dark:text-[#F5F0E9]/70 hover:bg-[#3A3A3A]/15 dark:hover:bg-[#F5F0E9]/15'
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
                  placeholder="Comparte tu opinión... ¿Es amplio? ¿Tienen buen café? ¿El ambiente es amigable?"
                  required
                  rows={3}
                  className="w-full p-3 border border-[#3A3A3A]/20 dark:border-[#F5F0E9]/20 rounded-xl text-xs text-[#3A3A3A] dark:text-[#F5F0E9] focus:outline-none focus:ring-2 focus:ring-[#8367C7]/50 focus:border-[#8367C7] resize-none shadow-inner bg-[#3A3A3A]/5 dark:bg-[#2D2D2D]"
                />

                {formError && <p className="text-[10px] text-red-600 font-bold">{formError}</p>}

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full py-3 bg-[#8367C7] hover:bg-[#6f53b3] disabled:bg-[#3A3A3A]/15 dark:disabled:bg-[#F5F0E9]/15 text-[#F5F0E9] font-extrabold rounded-xl shadow-md cursor-pointer transition-all text-xs"
                >
                  {submittingReview ? 'Publicando...' : 'Publicar reseña'}
                </button>
              </form>
            ) : (
              <div className="bg-[#3A3A3A]/5 dark:bg-[#2D2D2D] p-4 rounded-xl text-center text-xs text-[#3A3A3A]/55 dark:text-[#F5F0E9]/55 border border-dashed border-[#3A3A3A]/15 dark:border-[#F5F0E9]/15 py-6">
                Inicia sesión para escribir una reseña en este local.
              </div>
            )}
          </div>

          {/* Player Reviews Feed */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-extrabold text-[#3A3A3A]/50 dark:text-[#F5F0E9]/50 tracking-wider">
              Comentarios de la comunidad
            </h3>
            
            {reviews.length === 0 ? (
              <p className="text-xs text-[#3A3A3A]/60 dark:text-[#F5F0E9]/60 italic py-4 bg-white dark:bg-[#1E1E1E] rounded-2xl border border-[#3A3A3A]/10 dark:border-[#F5F0E9]/10 text-center">
                Aún no hay reseñas. Escribe la primera reseña para este local.
              </p>
            ) : (
              <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-1">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="bg-white dark:bg-[#1E1E1E] p-4 rounded-2xl border border-[#3A3A3A]/10 dark:border-[#F5F0E9]/10 flex flex-col gap-2 shadow-sm"
                  >
                    <div className="flex justify-between items-center">
                      <span
                        className="font-extrabold text-xs text-[#3A3A3A]/80 dark:text-[#F5F0E9]/80 truncate max-w-[200px]"
                        title={rev.user_email}
                      >
                        {rev.user_email}
                      </span>
                      <div className="text-yellow-500 text-xs">
                        {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                      </div>
                    </div>
                    
                    {rev.comment && <p className="text-xs text-[#3A3A3A] dark:text-[#F5F0E9] leading-relaxed">{rev.comment}</p>}
                    
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
