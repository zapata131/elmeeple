/* eslint-disable @typescript-eslint/no-explicit-any */
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import React from 'react'
import AnnouncementForm from './AnnouncementForm'
import BggSyncForm from './BggSyncForm'

export default async function OwnerDashboard() {
  const session = await getServerSession(authOptions)

  // Server-side authentication and authorization check
  if (!session?.user) {
    redirect('/login?callbackUrl=/dashboard')
    return null
  }

  const role = (session.user as any).role
  if (role !== 'partner' && role !== 'admin') {
    redirect('/login?callbackUrl=/dashboard')
    return null
  }

  const email = session.user.email
  if (!email) {
    redirect('/login?callbackUrl=/dashboard')
    return null
  }

  const supabase = await createClient()
  const { data: venues, error } = await supabase
    .from('venues')
    .select('*')
    .eq('owner_email', email)

  const venueList = venues || []

  // Fetch games for all venues in parallel
  const venuesWithGames = await Promise.all(
    venueList.map(async (venue) => {
      const { data: games } = await supabase
        .from('venue_games')
        .select('*')
        .eq('venue_id', venue.id)
      return {
        ...venue,
        games: games || []
      }
    })
  )

  return (
    <div className="min-h-screen bg-[#F5F0E9] py-12 px-4 md:px-8 text-[#3A3A3A]">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#3A3A3A]/10 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-6 h-6 text-[#8367C7] fill-current" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                <path d="M256 54.99c-27 0-46.418 14.287-57.633 32.23-10.03 16.047-14.203 34.66-15.017 50.962-30.608 15.135-64.515 30.394-91.815 45.994-14.32 8.183-26.805 16.414-36.203 25.26C45.934 218.28 39 228.24 39 239.99c0 5 2.44 9.075 5.19 12.065 2.754 2.99 6.054 5.312 9.812 7.48 7.515 4.336 16.99 7.95 27.412 11.076 15.483 4.646 32.823 8.1 47.9 9.577-14.996 25.84-34.953 49.574-52.447 72.315C56.65 378.785 39 403.99 39 431.99c0 4-.044 7.123.31 10.26.355 3.137 1.256 7.053 4.41 10.156 3.155 3.104 7.017 3.938 10.163 4.28 3.146.345 6.315.304 10.38.304h111.542c8.097 0 14.026.492 20.125-3.43 6.1-3.92 8.324-9.275 12.67-17.275l.088-.16.08-.166s9.723-19.77 21.324-39.388c5.8-9.808 12.097-19.576 17.574-26.498 2.74-3.46 5.304-6.204 7.15-7.754.564-.472.82-.56 1.184-.76.363.2.62.288 1.184.76 1.846 1.55 4.41 4.294 7.15 7.754 5.477 6.922 11.774 16.69 17.574 26.498 11.6 19.618 21.324 39.387 21.324 39.387l.08.165.088.16c4.346 8 6.55 13.323 12.61 17.254 6.058 3.93 11.974 3.45 19.957 3.45H448c4 0 7.12.043 10.244-.304 3.123-.347 6.998-1.21 10.12-4.332 3.12-3.122 3.984-6.997 4.33-10.12.348-3.122.306-6.244.306-10.244 0-28-17.65-53.205-37.867-79.488-17.493-22.74-37.45-46.474-52.447-72.315 15.077-1.478 32.417-4.93 47.9-9.576 10.422-3.125 19.897-6.74 27.412-11.075 3.758-2.168 7.058-4.49 9.81-7.48 2.753-2.99 5.192-7.065 5.192-12.065 0-11.75-6.934-21.71-16.332-30.554-9.398-8.846-21.883-17.077-36.203-25.26-27.3-15.6-61.207-30.86-91.815-45.994-.814-16.3-4.988-34.915-15.017-50.96C302.418 69.276 283 54.99 256 54.99z" />
              </svg>
              <span className="text-xl font-extrabold text-[#3A3A3A]">El Meeple</span>
            </div>
            <h1 className="text-2xl font-extrabold text-[#3A3A3A]">Portal del Propietario</h1>
            <p className="text-xs font-semibold text-[#8367C7] mt-0.5">{email}</p>
          </div>
          <div className="flex gap-3">
            <Link
              href={`/onboarding?email=${encodeURIComponent(email)}`}
              className="px-5 py-3 bg-[#8367C7] hover:bg-[#6f53b3] text-[#F5F0E9] font-bold rounded-xl shadow-md transition-all text-xs cursor-pointer"
            >
              Registrar Nuevo Local
            </Link>
            <Link
              href="/"
              className="px-5 py-3 bg-white hover:bg-[#3A3A3A]/5 border border-[#3A3A3A]/15 text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              Ir al Mapa
            </Link>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-[#FF9E8A]/20 text-[#3A3A3A] font-bold rounded-xl border border-[#FF9E8A]/30 text-xs">
            Error al cargar locales: {error.message}
          </div>
        )}

        {/* Venues Grid */}
        <div className="flex flex-col gap-8">
          {venueList.length === 0 ? (
            <div className="bg-white border border-[#3A3A3A]/10 rounded-2xl p-12 text-center shadow-inner flex flex-col items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-[#3A3A3A]/40 mb-3"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 0-.75-.75h-1.5a.75.75 0 0 0-.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 0V21m.75-12h13.5m-12.75 0V5.25A2.25 2.25 0 0 1 4.75 3h10.5a2.25 2.25 0 0 1 2.25 2.25V9" /></svg>
              <p className="text-sm font-semibold text-[#3A3A3A]/70">No tienes ningún local registrado aún.</p>
              <p className="text-xs text-[#3A3A3A]/50 mt-1">Registra tu primer local para comenzar.</p>
            </div>
          ) : (
            venuesWithGames.map((venue) => {
              const status = venue.verification_status || 'pending'
              const venueGames = venue.games
              return (
                <div
                  key={venue.id}
                  className="bg-white border border-[#3A3A3A]/10 rounded-2xl p-6 md:p-8 flex flex-col lg:flex-row gap-8 shadow-sm hover:shadow transition-shadow"
                >
                  
                  {/* Left Column: Venue profile & Stats */}
                  <div className="flex-1 flex flex-col gap-6">
                    
                    {/* Profile Header */}
                    <div className="flex items-start gap-4">
                      {/* Active Status Ring */}
                      <div className="relative">
                        <div className={`w-16 h-16 rounded-full p-0.5 flex items-center justify-center border-2 ${
                          status === 'approved' ? 'border-green-500' :
                          status === 'rejected' ? 'border-red-500' :
                          'border-yellow-500 animate-pulse'
                        }`}>
                          {venue.logo_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={venue.logo_url} alt={venue.name} className="w-full h-full rounded-full object-cover bg-white" />
                          ) : (
                            <div className="w-full h-full rounded-full bg-[#8367C7]/15 text-[#8367C7] flex items-center justify-center p-3">
                              <svg className="w-full h-full text-[#8367C7] fill-current" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                                <path d="M256 54.99c-27 0-46.418 14.287-57.633 32.23-10.03 16.047-14.203 34.66-15.017 50.962-30.608 15.135-64.515 30.394-91.815 45.994-14.32 8.183-26.805 16.414-36.203 25.26C45.934 218.28 39 228.24 39 239.99c0 5 2.44 9.075 5.19 12.065 2.754 2.99 6.054 5.312 9.812 7.48 7.515 4.336 16.99 7.95 27.412 11.076 15.483 4.646 32.823 8.1 47.9 9.577-14.996 25.84-34.953 49.574-52.447 72.315C56.65 378.785 39 403.99 39 431.99c0 4-.044 7.123.31 10.26.355 3.137 1.256 7.053 4.41 10.156 3.155 3.104 7.017 3.938 10.163 4.28 3.146.345 6.315.304 10.38.304h111.542c8.097 0 14.026.492 20.125-3.43 6.1-3.92 8.324-9.275 12.67-17.275l.088-.16.08-.166s9.723-19.77 21.324-39.388c5.8-9.808 12.097-19.576 17.574-26.498 2.74-3.46 5.304-6.204 7.15-7.754.564-.472.82-.56 1.184-.76.363.2.62.288 1.184.76 1.846 1.55 4.41 4.294 7.15 7.754 5.477 6.922 11.774 16.69 17.574 26.498 11.6 19.618 21.324 39.387 21.324 39.387l.08.165.088.16c4.346 8 6.55 13.323 12.61 17.254 6.058 3.93 11.974 3.45 19.957 3.45H448c4 0 7.12.043 10.244-.304 3.123-.347 6.998-1.21 10.12-4.332 3.12-3.122 3.984-6.997 4.33-10.12.348-3.122.306-6.244.306-10.244 0-28-17.65-53.205-37.867-79.488-17.493-22.74-37.45-46.474-52.447-72.315 15.077-1.478 32.417-4.93 47.9-9.576 10.422-3.125 19.897-6.74 27.412-11.075 3.758-2.168 7.058-4.49 9.81-7.48 2.753-2.99 5.192-7.065 5.192-12.065 0-11.75-6.934-21.71-16.332-30.554-9.398-8.846-21.883-17.077-36.203-25.26-27.3-15.6-61.207-30.86-91.815-45.994-.814-16.3-4.988-34.915-15.017-50.96C302.418 69.276 283 54.99 256 54.99z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <span className={`absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-extrabold text-white ${
                          status === 'approved' ? 'bg-green-500' :
                          status === 'rejected' ? 'bg-red-500' :
                          'bg-yellow-500'
                        }`}>
                          {status === 'approved' ? '✓' : status === 'rejected' ? '✗' : '•'}
                        </span>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-extrabold text-[#3A3A3A]">{venue.name}</h3>
                        <p className="text-xs text-[#3A3A3A]/65 mt-1">{venue.description || 'Sin descripción'}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="inline-block bg-[#8367C7]/10 text-[#8367C7] text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                            {venue.type ? venue.type.split(',').join(' • ') : ''}
                          </span>
                          {venue.business_tax_id && (
                            <span className="inline-block bg-[#3A3A3A]/5 text-[#3A3A3A]/60 font-mono text-[10px] px-2 py-0.5 rounded">
                              Tax ID: {venue.business_tax_id}
                            </span>
                          )}
                          {/* Status text for backward compatibility with tests */}
                          <span className="sr-only">
                            {status === 'approved' && 'Aprobado'}
                            {status === 'pending' && 'Pendiente'}
                            {status === 'rejected' && 'Rechazado'}
                          </span>
                          {status === 'rejected' && venue.rejection_reason && (
                            <span className="sr-only">Motivo: {venue.rejection_reason}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Premium Mock Analytics Section */}
                    <div className="border-t border-[#3A3A3A]/10 pt-6">
                      <h4 className="text-xs font-extrabold text-[#3A3A3A]/50 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 text-[#3A3A3A]/50"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.281m5.94 2.28l-2.28 5.941" /></svg>
                        Rendimiento mensual (Mock)
                      </h4>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-[#3A3A3A]/5 p-3 rounded-xl border border-[#3A3A3A]/5">
                          <span className="text-[9px] font-bold text-[#3A3A3A]/50 uppercase">Visitas</span>
                          <p className="text-base font-black text-[#3A3A3A] mt-0.5">1,248</p>
                        </div>
                        <div className="bg-[#3A3A3A]/5 p-3 rounded-xl border border-[#3A3A3A]/5">
                          <span className="text-[9px] font-bold text-[#3A3A3A]/50 uppercase">Favorito</span>
                          <p className="text-base font-black text-[#8367C7] mt-0.5">142</p>
                        </div>
                        <div className="bg-[#3A3A3A]/5 p-3 rounded-xl border border-[#3A3A3A]/5">
                          <span className="text-[9px] font-bold text-[#3A3A3A]/50 uppercase">CTR</span>
                          <p className="text-base font-black text-green-600 mt-0.5">11.4%</p>
                        </div>
                      </div>
                    </div>

                    {/* Status Box */}
                    <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
                      status === 'approved' ? 'bg-green-55 text-green-800 border-green-200' :
                      status === 'rejected' ? 'bg-red-50 text-red-800 border-red-200' :
                      'bg-yellow-50 text-yellow-800 border-yellow-200'
                    }`}>
                      {status === 'approved' && (
                        <div>
                          <span className="font-bold">✓ Local Verificado:</span> Tu establecimiento aparece públicamente en el mapa de El Meeple. ¡Listo para recibir jugadores!
                        </div>
                      )}
                      {status === 'pending' && (
                        <div className="flex items-start gap-1.5">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-yellow-700 flex-shrink-0 mt-0.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          <div>
                            <span className="font-bold">Solicitud en Revisión:</span> El equipo de El Meeple está verificando tus documentos. Te notificaremos pronto por correo.
                          </div>
                        </div>
                      )}
                      {status === 'rejected' && (
                        <div>
                          <span className="font-bold">✗ Solicitud Rechazada:</span> {venue.rejection_reason || 'El comprobante cargado no es legible o es inválido.'} Por favor, contacta a soporte para más detalles.
                        </div>
                      )}
                    </div>

                    {/* Mi Ludoteca Visual Gallery */}
                    {status === 'approved' && (
                      <div className="border-t border-[#3A3A3A]/10 pt-6">
                        <h4 className="text-xs font-extrabold text-[#3A3A3A]/50 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-[#3A3A3A]/50 fill-current" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                            <path d="M256 54.99c-27 0-46.418 14.287-57.633 32.23-10.03 16.047-14.203 34.66-15.017 50.962-30.608 15.135-64.515 30.394-91.815 45.994-14.32 8.183-26.805 16.414-36.203 25.26C45.934 218.28 39 228.24 39 239.99c0 5 2.44 9.075 5.19 12.065 2.754 2.99 6.054 5.312 9.812 7.48 7.515 4.336 16.99 7.95 27.412 11.076 15.483 4.646 32.823 8.1 47.9 9.577-14.996 25.84-34.953 49.574-52.447 72.315C56.65 378.785 39 403.99 39 431.99c0 4-.044 7.123.31 10.26.355 3.137 1.256 7.053 4.41 10.156 3.155 3.104 7.017 3.938 10.163 4.28 3.146.345 6.315.304 10.38.304h111.542c8.097 0 14.026.492 20.125-3.43 6.1-3.92 8.324-9.275 12.67-17.275l.088-.16.08-.166s9.723-19.77 21.324-39.388c5.8-9.808 12.097-19.576 17.574-26.498 2.74-3.46 5.304-6.204 7.15-7.754.564-.472.82-.56 1.184-.76.363.2.62.288 1.184.76 1.846 1.55 4.41 4.294 7.15 7.754 5.477 6.922 11.774 16.69 17.574 26.498 11.6 19.618 21.324 39.387 21.324 39.387l.08.165.088.16c4.346 8 6.55 13.323 12.61 17.254 6.058 3.93 11.974 3.45 19.957 3.45H448c4 0 7.12.043 10.244-.304 3.123-.347 6.998-1.21 10.12-4.332 3.12-3.122 3.984-6.997 4.33-10.12.348-3.122.306-6.244.306-10.244 0-28-17.65-53.205-37.867-79.488-17.493-22.74-37.45-46.474-52.447-72.315 15.077-1.478 32.417-4.93 47.9-9.576 10.422-3.125 19.897-6.74 27.412-11.075 3.758-2.168 7.058-4.49 9.81-7.48 2.753-2.99 5.192-7.065 5.192-12.065 0-11.75-6.934-21.71-16.332-30.554-9.398-8.846-21.883-17.077-36.203-25.26-27.3-15.6-61.207-30.86-91.815-45.994-.814-16.3-4.988-34.915-15.017-50.96C302.418 69.276 283 54.99 256 54.99z" />
                          </svg>
                          Mi Ludoteca ({venueGames.length} juegos)
                        </h4>
                        {venueGames.length === 0 ? (
                          <p className="text-xs text-[#3A3A3A]/50 italic">
                            Aún no has sincronizado tu colección de BoardGameGeek.
                          </p>
                        ) : (
                          <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 max-h-64 overflow-y-auto pr-1">
                            {venueGames.map((game: any) => (
                              <div
                                key={game.id}
                                className="flex flex-col items-center gap-1 bg-[#3A3A3A]/5 p-2 rounded-xl border border-[#3A3A3A]/5 text-center group"
                              >
                                {game.thumbnail ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={game.thumbnail}
                                    alt={game.name}
                                    className="w-12 h-12 object-cover rounded-lg shadow-sm group-hover:scale-105 transition-transform"
                                  />
                                ) : (
                                  <div className="w-12 h-12 bg-[#8367C7]/15 text-[#8367C7] rounded-lg flex items-center justify-center p-2.5">
                                    <svg className="w-full h-full text-[#8367C7] fill-current" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M256 54.99c-27 0-46.418 14.287-57.633 32.23-10.03 16.047-14.203 34.66-15.017 50.962-30.608 15.135-64.515 30.394-91.815 45.994-14.32 8.183-26.805 16.414-36.203 25.26C45.934 218.28 39 228.24 39 239.99c0 5 2.44 9.075 5.19 12.065 2.754 2.99 6.054 5.312 9.812 7.48 7.515 4.336 16.99 7.95 27.412 11.076 15.483 4.646 32.823 8.1 47.9 9.577-14.996 25.84-34.953 49.574-52.447 72.315C56.65 378.785 39 403.99 39 431.99c0 4-.044 7.123.31 10.26.355 3.137 1.256 7.053 4.41 10.156 3.155 3.104 7.017 3.938 10.163 4.28 3.146.345 6.315.304 10.38.304h111.542c8.097 0 14.026.492 20.125-3.43 6.1-3.92 8.324-9.275 12.67-17.275l.088-.16.08-.166s9.723-19.77 21.324-39.388c5.8-9.808 12.097-19.576 17.574-26.498 2.74-3.46 5.304-6.204 7.15-7.754.564-.472.82-.56 1.184-.76.363.2.62.288 1.184.76 1.846 1.55 4.41 4.294 7.15 7.754 5.477 6.922 11.774 16.69 17.574 26.498 11.6 19.618 21.324 39.387 21.324 39.387l.08.165.088.16c4.346 8 6.55 13.323 12.61 17.254 6.058 3.93 11.974 3.45 19.957 3.45H448c4 0 7.12.043 10.244-.304 3.123-.347 6.998-1.21 10.12-4.332 3.12-3.122 3.984-6.997 4.33-10.12.348-3.122.306-6.244.306-10.244 0-28-17.65-53.205-37.867-79.488-17.493-22.74-37.45-46.474-52.447-72.315 15.077-1.478 32.417-4.93 47.9-9.576 10.422-3.125 19.897-6.74 27.412-11.075 3.758-2.168 7.058-4.49 9.81-7.48 2.753-2.99 5.192-7.065 5.192-12.065 0-11.75-6.934-21.71-16.332-30.554-9.398-8.846-21.883-17.077-36.203-25.26-27.3-15.6-61.207-30.86-91.815-45.994-.814-16.3-4.988-34.915-15.017-50.96C302.418 69.276 283 54.99 256 54.99z" />
                                    </svg>
                                  </div>
                                )}
                                <span
                                  className="text-[9px] font-bold text-[#3A3A3A] truncate w-full"
                                  title={game.name}
                                >
                                  {game.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                  </div>

                  {/* Right Column: Announcement & BGG Sync */}
                  <div className="w-full lg:w-96 flex flex-col gap-6 justify-start">
                    {status === 'approved' ? (
                      <>
                        <BggSyncForm
                          venueId={venue.id}
                          initialUsername={venue.bgg_username}
                          initialLastSyncedAt={venue.bgg_last_synced_at}
                        />
                        <AnnouncementForm venueId={venue.id} />
                      </>
                    ) : (
                      <div className="bg-[#3A3A3A]/5 p-6 rounded-2xl border border-dashed border-[#3A3A3A]/15 text-center flex flex-col items-center justify-center h-full py-12">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-[#3A3A3A]/40 mb-2"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
                        <h4 className="text-xs font-extrabold text-[#3A3A3A]/70 uppercase tracking-wide">Funciones Bloqueadas</h4>
                        <p className="text-[10px] text-[#3A3A3A]/50 max-w-xs mt-1">
                          Debes esperar a que tu local sea aprobado por los administradores para publicar anuncios e importar tu ludoteca de BGG.
                        </p>
                      </div>
                    )}
                  </div>

                </div>
              )
            })
          )}
        </div>

      </div>
    </div>
  )
}
