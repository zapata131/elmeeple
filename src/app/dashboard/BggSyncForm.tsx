'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { syncBggCollection } from '@/app/actions/bgg'

interface BggSyncFormProps {
  venueId: string
  initialUsername?: string
}

export default function BggSyncForm({ venueId, initialUsername = '' }: BggSyncFormProps) {
  const [bggUsername, setBggUsername] = useState(initialUsername)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const router = useRouter()

  const handleSync = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bggUsername.trim()) return

    setLoading(true)
    setMessage(null)

    try {
      const result = await syncBggCollection(venueId, bggUsername.trim())
      if (result.success) {
        setMessage({
          type: 'success',
          text: `¡Sincronización exitosa! Se importaron/actualizaron ${result.count} juegos.`
        })
        router.refresh()
      } else {
        setMessage({
          type: 'error',
          text: result.error || 'Ocurrió un error inesperado al sincronizar.'
        })
      }
    } catch {
      setMessage({
        type: 'error',
        text: 'Error de red o de servidor.'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-[#3A3A3A]/10 flex flex-col gap-4 shadow-sm">
      <div>
        <h4 className="text-sm font-extrabold text-[#3A3A3A] flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[#3A3A3A]"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v5.25c0 .621-.504 1.125-1.125 1.125h-2.25A1.125 1.125 0 013 18.375v-5.25zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125v-9.75zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v14.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>
          Sincronizar con BoardGameGeek
        </h4>
        <p className="text-xs text-[#3A3A3A]/60 mt-1">
          Importa automáticamente el catálogo de juegos de mesa de tu local ingresando tu usuario de BGG.
        </p>
      </div>

      <form onSubmit={handleSync} className="flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={bggUsername}
            onChange={(e) => setBggUsername(e.target.value)}
            placeholder="Usuario de BGG (ej. mi_usuario)"
            required
            disabled={loading}
            className="flex-1 px-3 py-2 border border-[#3A3A3A]/20 rounded-xl text-xs text-[#3A3A3A] focus:outline-none focus:border-[#8367C7] disabled:opacity-55"
          />
          <button
            type="submit"
            disabled={loading || !bggUsername.trim()}
            className="px-4 py-2 bg-[#8367C7] hover:bg-[#6f53b3] disabled:bg-[#3A3A3A]/15 text-[#F5F0E9] font-bold rounded-xl shadow-sm text-xs cursor-pointer transition-all disabled:cursor-not-allowed flex-shrink-0 flex items-center justify-center min-w-[100px]"
          >
            {loading ? (
              <span className="flex items-center gap-1.5">
                <svg className="animate-spin h-3.5 w-3.5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Sincronizando...</span>
              </span>
            ) : (
              'Sincronizar'
            )}
          </button>
        </div>
        <p className="text-[10px] text-[#3A3A3A]/75 leading-normal mt-0.5">
          * Tu colección de BGG debe ser pública y tener juegos marcados como propios (own=1). La primera sincronización puede tomar entre 10 y 15 segundos debido a las colas y límites de la API de BoardGameGeek.
        </p>
      </form>

      {message && (
        <div className={`p-3 rounded-lg text-[11px] leading-snug font-semibold border ${
          message.type === 'success'
            ? 'bg-green-50 text-green-800 border-green-200'
            : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          {message.text}
        </div>
      )}
    </div>
  )
}
