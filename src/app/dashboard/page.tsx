import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import React from 'react'

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
            Ingresa tu correo electrónico para ver el estado de tus locales registrados.
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

  return (
    <div className="min-h-screen bg-[#F5F0E9] py-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#3A3A3A]/10 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">🎲</span>
              <span className="text-xl font-extrabold text-[#3A3A3A]">El Meeple</span>
            </div>
            <h1 className="text-2xl font-extrabold text-[#3A3A3A]">Portal del Propietario</h1>
            <p className="text-sm text-[#8367C7] font-semibold">{email}</p>
          </div>
          <Link
            href={`/onboarding?email=${encodeURIComponent(email)}`}
            className="px-5 py-3 bg-[#8367C7] hover:bg-[#6f53b3] text-[#F5F0E9] font-bold rounded-xl shadow-md transition-all text-sm cursor-pointer"
          >
            Registrar Nuevo Local
          </Link>
        </div>

        {/* Venues Section */}
        <div>
          <h2 className="text-lg font-bold text-[#3A3A3A] mb-4">Mis Locales Registrados</h2>

          {error && (
            <div className="p-4 bg-[#FF9E8A]/20 text-[#3A3A3A] font-bold rounded-xl border border-[#FF9E8A]/30 mb-6 text-sm">
              Error al cargar locales: {error.message}
            </div>
          )}

          {!venues || venues.length === 0 ? (
            <div className="bg-white border border-[#3A3A3A]/10 rounded-2xl p-8 text-center shadow-inner">
              <span className="text-3xl mb-2 block">🏪</span>
              <p className="text-sm font-semibold text-[#3A3A3A]/70">No tienes ningún local registrado aún.</p>
              <p className="text-xs text-[#3A3A3A]/50 mt-1">Registra tu primer local para comenzar.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {venues.map((venue) => {
                const status = venue.verification_status || 'pending'
                return (
                  <div
                    key={venue.id}
                    className="bg-white border border-[#3A3A3A]/10 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm hover:shadow transition-shadow"
                  >
                    <div className="flex-1">
                      <h3 className="text-base font-extrabold text-[#3A3A3A]">{venue.name}</h3>
                      <p className="text-xs text-[#3A3A3A]/65 mt-1">{venue.description || 'Sin descripción'}</p>
                      {venue.business_tax_id && (
                        <p className="text-xs text-[#3A3A3A]/50 font-mono mt-2">ID Fiscal: {venue.business_tax_id}</p>
                      )}
                    </div>

                    <div className="flex flex-col sm:items-end gap-2">
                      {status === 'approved' && (
                        <span className="px-3 py-1 bg-green-100 text-green-800 border border-green-200 text-xs font-bold rounded-full">
                          Aprobado
                        </span>
                      )}
                      {status === 'pending' && (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 border border-yellow-200 text-xs font-bold rounded-full">
                          Pendiente
                        </span>
                      )}
                      {status === 'rejected' && (
                        <div className="flex flex-col sm:items-end gap-1">
                          <span className="px-3 py-1 bg-red-100 text-red-800 border border-red-200 text-xs font-bold rounded-full">
                            Rechazado
                          </span>
                          {venue.rejection_reason && (
                            <span className="text-[10px] text-[#FF9E8A] font-bold max-w-xs text-left sm:text-right">
                              Motivo: {venue.rejection_reason}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
