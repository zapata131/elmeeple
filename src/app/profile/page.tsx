import React from 'react'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export default async function PlayerProfilePage() {
  const session = await getServerSession()
  
  if (!session?.user) {
    redirect('/login')
  }

  const user = session.user
  const supabase = await createClient()

  // Fetch favorite venues
  const { data: favorites } = await supabase
    .from('favorites')
    .select('venues (id, name, type, logo_url)')
    .eq('user_email', user.email)

  // Fetch user reviews
  const { data: reviews } = await supabase
    .from('reviews')
    .select('id, content, rating, created_at, venues (name)')
    .eq('user_email', user.email)

  const favList = favorites || []
  const reviewList = reviews || []

  return (
    <div className="min-h-screen bg-[#F5F0E9] text-[#3A3A3A] py-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        
        {/* Navigation / Header */}
        <div className="flex justify-between items-center border-b border-[#3A3A3A]/10 pb-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🎲</span>
            <span className="text-xl font-extrabold text-[#3A3A3A]">El Meeple</span>
          </Link>
          <Link href="/" className="text-sm font-bold text-[#8367C7] hover:underline">
            ← Volver al Mapa
          </Link>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#3A3A3A]/10 shadow-sm flex flex-col sm:flex-row items-center gap-6">
          <div className="w-20 h-20 bg-[#8367C7]/10 text-[#8367C7] rounded-full flex items-center justify-center text-3xl font-black">
            {user.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div className="text-center sm:text-left flex-1">
            <h1 className="text-2xl font-extrabold text-[#3A3A3A]">{user.name || 'Usuario'}</h1>
            <p className="text-sm text-[#3A3A3A]/75 mt-1">{user.email}</p>
            <span className="inline-block bg-[#8367C7]/15 text-[#8367C7] text-xs font-bold px-2.5 py-1 rounded-md mt-3 uppercase tracking-wider">
              Rol: {(user as unknown as { role?: string }).role || 'player'}
            </span>
          </div>
        </div>

        {/* Main Grid: Favorites & Reviews */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Favorite Venues */}
          <div className="bg-white rounded-2xl p-6 border border-[#3A3A3A]/10 shadow-sm flex flex-col gap-4">
            <h2 className="text-lg font-extrabold text-[#3A3A3A] flex items-center gap-2">
              ⭐ Mis Locales Favoritos
            </h2>
            
            {favList.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#3A3A3A]/50 font-medium">
                Aún no has guardado ningún local como favorito.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {favList.map((fav: unknown) => {
                  const item = fav as { venues?: { id: string; name: string; type: string; logo_url?: string } | null }
                  const venue = item.venues
                  if (!venue) return null
                  return (
                    <Link
                      key={venue.id}
                      href={`/?venue=${venue.id}`}
                      className="flex items-center gap-3 p-3 border border-[#3A3A3A]/5 hover:border-[#8367C7]/40 bg-[#3A3A3A]/5 hover:bg-[#8367C7]/5 rounded-xl transition-all"
                    >
                      {venue.logo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={venue.logo_url} alt={venue.name} className="w-10 h-10 rounded-lg object-cover bg-white border border-[#3A3A3A]/10" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-[#8367C7]/15 text-[#8367C7] flex items-center justify-center font-bold">🎲</div>
                      )}
                      <div>
                        <p className="text-xs font-extrabold text-[#3A3A3A]">{venue.name}</p>
                        <p className="text-[10px] font-bold text-[#8367C7] uppercase mt-0.5">{venue.type}</p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          {/* Review History */}
          <div className="bg-white rounded-2xl p-6 border border-[#3A3A3A]/10 shadow-sm flex flex-col gap-4">
            <h2 className="text-lg font-extrabold text-[#3A3A3A] flex items-center gap-2">
              💬 Historial de Reseñas
            </h2>

            {reviewList.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#3A3A3A]/50 font-medium">
                No has escrito ninguna reseña todavía.
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {reviewList.map((review: unknown) => {
                  const item = review as { id: string; content: string; rating: number; created_at: string; venues?: { name: string } | null }
                  return (
                    <div key={item.id} className="p-4 border border-[#3A3A3A]/5 bg-[#3A3A3A]/5 rounded-xl flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-extrabold text-[#3A3A3A]">
                          {item.venues?.name || 'Local'}
                        </span>
                        <span className="text-xs font-bold text-[#8367C7] bg-[#8367C7]/10 px-2 py-0.5 rounded">
                          ⭐ {item.rating}/5
                        </span>
                      </div>
                      <p className="text-xs text-[#3A3A3A]/85 italic leading-relaxed">
                        &ldquo;{item.content}&rdquo;
                      </p>
                      <span className="text-[9px] text-[#3A3A3A]/40 self-end">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  )
}
