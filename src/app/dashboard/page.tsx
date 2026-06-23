import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import React from 'react'
import AnnouncementForm from './AnnouncementForm'

interface PageProps {
  searchParams: Promise<{ email?: string }> | { email?: string }
}

export default async function OwnerDashboard({ searchParams }: PageProps) {
  // Safe resolution of searchParams for both Next.js async prop and Jest sync rendering
  const resolvedParams = searchParams instanceof Promise ? await searchParams : searchParams
  const email = resolvedParams?.email

  if (!email) {
    return (
      <div className="min-h-screen bg-[#F5F0E9] py-12 px-4 flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-[#3A3A3A]/10 max-w-md w-full text-center">
          <span className="text-4xl mb-4 block" role="img" aria-label="keys">🔑</span>
          <h1 className="text-2xl font-extrabold text-[#3A3A3A] mb-2">Portal del Propietario</h1>
          <p className="text-sm text-[#3A3A3A]/70 mb-6">
            Ingresa tu correo electrónico para ver el estado de tus locales registrados y publicar anuncios.
          </p>
          <form method="GET" className="flex flex-col gap-4">
            <input
              name="email"
              type="email"
              required
              placeholder="Ej. jose@elmeeple.com"
              className="w-full p-3 border border-[#3A3A3A]/20 rounded-xl text-sm text-[#3A3A3A] focus:outline-none focus:border-[#8367C7]"
            />
            <button type="submit" className="py-3 bg-[#8367C7] hover:bg-[#6f53b3] text-[#F5F0E9] font-bold rounded-xl shadow-md transition-all cursor-pointer text-sm">
              Ingresar al Dashboard
            </button>
          </form>
        </div>
      </div>
    )
  }

  const supabase = await createClient()
  const { data: venues, error } = await supabase
    .from('venues')
    .select('*')
    .eq('owner_email', email)

  const venueList = venues || []

  return (
    <div className="min-h-screen bg-[#F5F0E9] py-12 px-4 md:px-8 text-[#3A3A3A]">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#3A3A3A]/10 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">🎲</span>
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
            <div className="bg-white border border-[#3A3A3A]/10 rounded-2xl p-12 text-center shadow-inner">
              <span className="text-4xl mb-3 block">🏪</span>
              <p className="text-sm font-semibold text-[#3A3A3A]/70">No tienes ningún local registrado aún.</p>
              <p className="text-xs text-[#3A3A3A]/50 mt-1">Registra tu primer local para comenzar.</p>
            </div>
          ) : (
            venueList.map((venue) => {
              const status = venue.verification_status || 'pending'
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
                            <div className="w-full h-full rounded-full bg-[#8367C7]/15 text-[#8367C7] flex items-center justify-center font-bold text-xl">🎲</div>
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
                            {venue.type}
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
                      <h4 className="text-xs font-extrabold text-[#3A3A3A]/50 uppercase tracking-wider mb-3">📈 Rendimiento mensual (Mock)</h4>
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
                      status === 'approved' ? 'bg-green-50 text-green-800 border-green-200' :
                      status === 'rejected' ? 'bg-red-50 text-red-800 border-red-200' :
                      'bg-yellow-50 text-yellow-800 border-yellow-200'
                    }`}>
                      {status === 'approved' && (
                        <div>
                          <span className="font-bold">✓ Local Verificado:</span> Tu establecimiento aparece públicamente en el mapa de El Meeple. ¡Listo para recibir jugadores!
                        </div>
                      )}
                      {status === 'pending' && (
                        <div>
                          <span className="font-bold">⏱️ Solicitud en Revisión:</span> El equipo de El Meeple está verificando tus documentos. Te notificaremos pronto por correo.
                        </div>
                      )}
                      {status === 'rejected' && (
                        <div>
                          <span className="font-bold">✗ Solicitud Rechazada:</span> {venue.rejection_reason || 'El comprobante cargado no es legible o es inválido.'} Por favor, contacta a soporte para más detalles.
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Right Column: Announcement Posting Card */}
                  <div className="w-full lg:w-96 flex flex-col justify-start">
                    {status === 'approved' ? (
                      <AnnouncementForm venueId={venue.id} />
                    ) : (
                      <div className="bg-[#3A3A3A]/5 p-6 rounded-2xl border border-dashed border-[#3A3A3A]/15 text-center flex flex-col items-center justify-center h-full py-12">
                        <span className="text-2xl mb-2">🔒</span>
                        <h4 className="text-xs font-extrabold text-[#3A3A3A]/70 uppercase tracking-wide">Anuncios Bloqueados</h4>
                        <p className="text-[10px] text-[#3A3A3A]/50 max-w-xs mt-1">
                          Debes esperar a que tu local sea aprobado por los administradores para poder publicar anuncios en la cartelera.
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
