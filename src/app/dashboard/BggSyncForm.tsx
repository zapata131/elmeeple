'use client'

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { syncBggCollection } from '@/app/actions/bgg'

interface BggSyncFormProps {
  venueId: string
  initialUsername?: string
  initialLastSyncedAt?: string | null
}

export default function BggSyncForm({
  venueId,
  initialUsername = '',
  initialLastSyncedAt = null
}: BggSyncFormProps) {
  const [bggUsername, setBggUsername] = useState(initialUsername)
  const [lastSynced, setLastSynced] = useState<string | null>(initialLastSyncedAt)
  const [loading, setLoading] = useState(false)
  const [retryCountdown, setRetryCountdown] = useState<number | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null)
  const router = useRouter()
  const retryCountRef = useRef(0)

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return null
    try {
      const d = new Date(dateStr)
      return d.toLocaleString('es-MX', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    } catch {
      return null
    }
  }

  const runSync = async (username: string) => {
    try {
      const result = await syncBggCollection(venueId, username)
      
      if (result.success) {
        const now = new Date().toISOString()
        setLastSynced(now)
        setMessage({
          type: 'success',
          text: `¡Sincronización exitosa! Se importaron/actualizaron ${result.count} juegos.`
        })
        setLoading(false)
        setRetryCountdown(null)
        retryCountRef.current = 0
        router.refresh()
      } else if (result.isQueued) {
        if (retryCountRef.current < 3) {
          retryCountRef.current += 1
          const waitTime = result.retryAfter || 5
          setMessage({
            type: 'info',
            text: `BoardGameGeek está preparando tu colección (Intento ${retryCountRef.current}/3). Esperando ${waitTime} segundos para reintentar...`
          })
          
          setRetryCountdown(waitTime)
          let remaining = waitTime
          
          const intervalId = setInterval(() => {
            remaining -= 1
            if (remaining <= 0) {
              clearInterval(intervalId)
              runSync(username)
            } else {
              setRetryCountdown(remaining)
            }
          }, 1000)
        } else {
          setMessage({
            type: 'error',
            text: 'BoardGameGeek está tardando demasiado en procesar tu colección. Por favor, haz clic en Sincronizar en unos momentos para intentarlo de nuevo.'
          })
          setLoading(false)
          setRetryCountdown(null)
          retryCountRef.current = 0
        }
      } else {
        setMessage({
          type: 'error',
          text: result.error || 'Ocurrió un error inesperado al sincronizar.'
        })
        setLoading(false)
        setRetryCountdown(null)
        retryCountRef.current = 0
      }
    } catch {
      setMessage({
        type: 'error',
        text: 'Error de red o de servidor al conectar con BGG.'
      })
      setLoading(false)
      setRetryCountdown(null)
      retryCountRef.current = 0
    }
  }

  const handleSync = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bggUsername.trim() || loading) return

    setLoading(true)
    setMessage(null)
    retryCountRef.current = 0
    await runSync(bggUsername.trim())
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
        {lastSynced && (
          <p className="text-[10px] text-[#8367C7] font-bold mt-1.5 flex items-center gap-1" data-testid="bgg-last-synced">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
            Última sincronización: {formatDate(lastSynced)}
          </p>
        )}
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
            className="px-4 py-2 bg-[#8367C7] hover:bg-[#6f53b3] disabled:bg-[#3A3A3A]/15 text-[#F5F0E9] font-bold rounded-xl shadow-sm text-xs cursor-pointer transition-all disabled:cursor-not-allowed flex-shrink-0 flex items-center justify-center min-w-[120px]"
          >
            {loading ? (
              <span className="flex items-center gap-1.5">
                <svg className="animate-spin h-3.5 w-3.5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{retryCountdown !== null ? `Reintentando (${retryCountdown}s)` : 'Sincronizando...'}</span>
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
            : message.type === 'info'
              ? 'bg-[#8367C7]/5 text-[#8367C7] border-[#8367C7]/15'
              : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          {message.text}
        </div>
      )}
    </div>
  )
}

