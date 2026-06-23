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
        <h4 className="text-sm font-extrabold text-[#3A3A3A] flex items-center gap-2">
          <span>📊</span> Sincronizar con BoardGameGeek
        </h4>
        <p className="text-xs text-[#3A3A3A]/60 mt-1">
          Importa automáticamente el catálogo de juegos de mesa de tu local ingresando tu usuario de BGG.
        </p>
      </div>

      <form onSubmit={handleSync} className="flex gap-2">
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
          className="px-4 py-2 bg-[#8367C7] hover:bg-[#6f53b3] disabled:bg-[#3A3A3A]/15 text-[#F5F0E9] font-bold rounded-xl shadow-sm text-xs cursor-pointer transition-all disabled:cursor-not-allowed flex-shrink-0"
        >
          {loading ? 'Sincronizando...' : 'Sincronizar'}
        </button>
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
