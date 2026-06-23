'use client'

import React, { useState } from 'react'
import { createAnnouncement } from '@/app/actions/announcement'

interface AnnouncementFormProps {
  venueId: string
}

export default function AnnouncementForm({ venueId }: AnnouncementFormProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    setLoading(true)
    setMessage('')
    try {
      const res = await createAnnouncement({ venueId, title, content })
      if (res.success) {
        setMessage('¡Anuncio publicado con éxito!')
        setTitle('')
        setContent('')
      } else {
        setMessage(`Error: ${res.error}`)
      }
    } catch {
      setMessage('Error de conexión al publicar el anuncio.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-white p-6 rounded-2xl border border-[#3A3A3A]/10 shadow-sm w-full">
      <div>
        <h3 className="text-sm font-extrabold text-[#3A3A3A] uppercase tracking-wider">📢 Publicar Anuncio</h3>
        <p className="text-[10px] text-[#3A3A3A]/60 mt-0.5">Publica novedades directamente en el Quick View Card de tu local.</p>
      </div>

      {message && (
        <div className={`p-2.5 rounded-xl text-xs font-bold ${
          message.startsWith('¡') ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-[#FF9E8A]/10 text-[#3A3A3A] border border-[#FF9E8A]/20'
        }`}>
          {message}
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label htmlFor="announcement-title" className="text-xs font-bold text-[#3A3A3A]/85">Título del Anuncio</label>
        <input
          id="announcement-title"
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ej. Torneo Especial Lorcana"
          className="w-full p-3 border border-[#3A3A3A]/20 bg-[#F5F0E9] rounded-xl text-xs text-[#3A3A3A] focus:outline-none focus:border-[#8367C7]"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="announcement-content" className="text-xs font-bold text-[#3A3A3A]/85">Contenido del Anuncio</label>
        <textarea
          id="announcement-content"
          required
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Describe los detalles, horarios y premios..."
          className="w-full p-3 border border-[#3A3A3A]/20 bg-[#F5F0E9] rounded-xl text-xs text-[#3A3A3A] focus:outline-none focus:border-[#8367C7] resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading || !title.trim() || !content.trim()}
        className="py-3 bg-[#8367C7] hover:bg-[#6f53b3] disabled:opacity-50 text-[#F5F0E9] font-bold rounded-xl shadow-md transition-all text-xs cursor-pointer"
      >
        {loading ? 'Publicando...' : 'Publicar'}
      </button>
    </form>
  )
}
