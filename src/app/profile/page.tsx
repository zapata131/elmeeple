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
          <Link href="/" className="flex items-center gap-2 group">
            <svg className="w-6 h-6 text-[#8367C7] fill-current transition-transform group-hover:scale-105" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
              <path d="M256 54.99c-27 0-46.418 14.287-57.633 32.23-10.03 16.047-14.203 34.66-15.017 50.962-30.608 15.135-64.515 30.394-91.815 45.994-14.32 8.183-26.805 16.414-36.203 25.26C45.934 218.28 39 228.24 39 239.99c0 5 2.44 9.075 5.19 12.065 2.754 2.99 6.054 5.312 9.812 7.48 7.515 4.336 16.99 7.95 27.412 11.076 15.483 4.646 32.823 8.1 47.9 9.577-14.996 25.84-34.953 49.574-52.447 72.315C56.65 378.785 39 403.99 39 431.99c0 4-.044 7.123.31 10.26.355 3.137 1.256 7.053 4.41 10.156 3.155 3.104 7.017 3.938 10.163 4.28 3.146.345 6.315.304 10.38.304h111.542c8.097 0 14.026.492 20.125-3.43 6.1-3.92 8.324-9.275 12.67-17.275l.088-.16.08-.166s9.723-19.77 21.324-39.388c5.8-9.808 12.097-19.576 17.574-26.498 2.74-3.46 5.304-6.204 7.15-7.754.564-.472.82-.56 1.184-.76.363.2.62.288 1.184.76 1.846 1.55 4.41 4.294 7.15 7.754 5.477 6.922 11.774 16.69 17.574 26.498 11.6 19.618 21.324 39.387 21.324 39.387l.08.165.088.16c4.346 8 6.55 13.323 12.61 17.254 6.058 3.93 11.974 3.45 19.957 3.45H448c4 0 7.12.043 10.244-.304 3.123-.347 6.998-1.21 10.12-4.332 3.12-3.122 3.984-6.997 4.33-10.12.348-3.122.306-6.244.306-10.244 0-28-17.65-53.205-37.867-79.488-17.493-22.74-37.45-46.474-52.447-72.315 15.077-1.478 32.417-4.93 47.9-9.576 10.422-3.125 19.897-6.74 27.412-11.075 3.758-2.168 7.058-4.49 9.81-7.48 2.753-2.99 5.192-7.065 5.192-12.065 0-11.75-6.934-21.71-16.332-30.554-9.398-8.846-21.883-17.077-36.203-25.26-27.3-15.6-61.207-30.86-91.815-45.994-.814-16.3-4.988-34.915-15.017-50.96C302.418 69.276 283 54.99 256 54.99z" />
            </svg>
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
            <h2 className="text-lg font-extrabold text-[#3A3A3A] flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-4.5 h-4.5 text-yellow-500"><path d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" /></svg>
              Mis Locales Favoritos
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
                        <div className="w-10 h-10 rounded-lg bg-[#8367C7]/15 text-[#8367C7] flex items-center justify-center p-2">
                          <svg className="w-full h-full text-[#8367C7] fill-current" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                            <path d="M256 54.99c-27 0-46.418 14.287-57.633 32.23-10.03 16.047-14.203 34.66-15.017 50.962-30.608 15.135-64.515 30.394-91.815 45.994-14.32 8.183-26.805 16.414-36.203 25.26C45.934 218.28 39 228.24 39 239.99c0 5 2.44 9.075 5.19 12.065 2.754 2.99 6.054 5.312 9.812 7.48 7.515 4.336 16.99 7.95 27.412 11.076 15.483 4.646 32.823 8.1 47.9 9.577-14.996 25.84-34.953 49.574-52.447 72.315C56.65 378.785 39 403.99 39 431.99c0 4-.044 7.123.31 10.26.355 3.137 1.256 7.053 4.41 10.156 3.155 3.104 7.017 3.938 10.163 4.28 3.146.345 6.315.304 10.38.304h111.542c8.097 0 14.026.492 20.125-3.43 6.1-3.92 8.324-9.275 12.67-17.275l.088-.16.08-.166s9.723-19.77 21.324-39.388c5.8-9.808 12.097-19.576 17.574-26.498 2.74-3.46 5.304-6.204 7.15-7.754.564-.472.82-.56 1.184-.76.363.2.62.288 1.184.76 1.846 1.55 4.41 4.294 7.15 7.754 5.477 6.922 11.774 16.69 17.574 26.498 11.6 19.618 21.324 39.387 21.324 39.387l.08.165.088.16c4.346 8 6.55 13.323 12.61 17.254 6.058 3.93 11.974 3.45 19.957 3.45H448c4 0 7.12.043 10.244-.304 3.123-.347 6.998-1.21 10.12-4.332 3.12-3.122 3.984-6.997 4.33-10.12.348-3.122.306-6.244.306-10.244 0-28-17.65-53.205-37.867-79.488-17.493-22.74-37.45-46.474-52.447-72.315 15.077-1.478 32.417-4.93 47.9-9.576 10.422-3.125 19.897-6.74 27.412-11.075 3.758-2.168 7.058-4.49 9.81-7.48 2.753-2.99 5.192-7.065 5.192-12.065 0-11.75-6.934-21.71-16.332-30.554-9.398-8.846-21.883-17.077-36.203-25.26-27.3-15.6-61.207-30.86-91.815-45.994-.814-16.3-4.988-34.915-15.017-50.96C302.418 69.276 283 54.99 256 54.99z" />
                          </svg>
                        </div>
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
            <h2 className="text-lg font-extrabold text-[#3A3A3A] flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4.5 h-4.5 text-[#3A3A3A]"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v5.751z" /></svg>
              Historial de Reseñas
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
                          ★ {item.rating}/5
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
