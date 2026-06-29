'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { getEvents, createEvent, deleteEvent } from '@/app/actions/events'

export interface Event {
  id: string
  venue_id: string | null
  organizer_venue_id: string
  title: string
  game: string
  description: string | null
  date: string
  entry_fee: number
  max_participants: number | null
  registration_url?: string | null
  created_at: string
}

interface EventManagerProps {
  venueId: string
}

export default function EventManager({ venueId }: EventManagerProps) {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  // Form states
  const [title, setTitle] = useState('')
  const [game, setGame] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [entryFee, setEntryFee] = useState('0')
  const [maxParticipants, setMaxParticipants] = useState('')
  const [selectedHostVenueId, setSelectedHostVenueId] = useState<string>('')
  const [registrationUrl, setRegistrationUrl] = useState('')
  const [venuesList, setVenuesList] = useState<{ id: string, name: string }[]>([])
  
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const loadEvents = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getEvents(venueId)
      if (res.success && res.data) {
        setEvents(res.data)
      }
    } catch (err) {
      console.error('Error loading events:', err)
    } finally {
      setLoading(false)
    }
  }, [venueId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadEvents()
  }, [loadEvents])

  useEffect(() => {
    async function loadHostVenues() {
      try {
        const { createClient } = await import('@/utils/supabase/client')
        const supabase = createClient()
        const { data } = await supabase
          .from('venues')
          .select('id, name, type')
          .eq('verification_status', 'approved')
        
        if (data) {
          const physicalVenues = data.filter((v: any) => {
            const types = v.type ? v.type.split(',') : []
            return types.includes('cafe') || types.includes('tienda')
          })
          setVenuesList(physicalVenues)
        }
      } catch (err) {
        console.error('Error loading host venues:', err)
      }
    }
    loadHostVenues()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !game.trim() || !date) return

    setSubmitting(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const fee = parseFloat(entryFee) || 0
      const maxParts = parseInt(maxParticipants, 10) || null
      const hostId = selectedHostVenueId || null
      const regUrl = registrationUrl.trim() || null

      const res = await createEvent(
        venueId,
        title,
        game,
        description,
        new Date(date).toISOString(),
        fee,
        maxParts === null ? undefined : maxParts,
        hostId,
        regUrl
      )

      if (res.success) {
        setSuccessMessage('¡Evento creado con éxito!')
        setTitle('')
        setGame('')
        setDescription('')
        setDate('')
        setEntryFee('0')
        setMaxParticipants('')
        setSelectedHostVenueId('')
        setRegistrationUrl('')
        setShowForm(false)
        await loadEvents()
      } else {
        setError(res.error || 'No se pudo crear el evento.')
      }
    } catch {
      setError('Error de conexión al crear el evento.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (eventId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este evento?')) return

    try {
      const res = await deleteEvent(eventId, venueId)
      if (res.success) {
        await loadEvents()
      } else {
        alert(res.error || 'No se pudo eliminar el evento.')
      }
    } catch {
      alert('Error de conexión al eliminar el evento.')
    }
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-[#3A3A3A]/10 shadow-sm w-full flex flex-col gap-4">
      <div className="flex justify-between items-center border-b border-[#3A3A3A]/5 pb-3">
        <div>
          <h3 className="text-sm font-extrabold text-[#3A3A3A] uppercase tracking-wider flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[#3A3A3A]"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>
            Gestión de Eventos
          </h3>
          <p className="text-[10px] text-[#3A3A3A]/60 mt-0.5">Organiza torneos y noches de juegos en tu local.</p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm)
            setError(null)
            setSuccessMessage(null)
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            showForm
              ? 'bg-[#3A3A3A]/10 text-[#3A3A3A]'
              : 'bg-[#8367C7] text-white hover:bg-[#6f53b3]'
          }`}
        >
          {showForm ? 'Cancelar' : '+ Nuevo'}
        </button>
      </div>

      {error && (
        <div className="p-2.5 bg-[#FF9E8A]/10 text-[#3A3A3A] border border-[#FF9E8A]/20 rounded-xl text-xs font-bold">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="p-2.5 bg-green-100 text-green-700 border border-green-200 rounded-xl text-xs font-bold">
          {successMessage}
        </div>
      )}

      {showForm ? (
        <form onSubmit={handleCreate} className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1">
            <label htmlFor="event-title" className="text-xs font-bold text-[#3A3A3A]/85">Título del Evento</label>
            <input
              id="event-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Torneo de Lanzamiento Lorcana"
              className="w-full p-2.5 border border-[#3A3A3A]/20 bg-[#F5F0E9] rounded-xl text-xs text-[#3A3A3A] focus:outline-none focus:border-[#8367C7]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="event-game" className="text-xs font-bold text-[#3A3A3A]/85">Juego / Categoría</label>
              <input
                id="event-game"
                type="text"
                required
                value={game}
                onChange={(e) => setGame(e.target.value)}
                placeholder="Ej. Magic, Catan, Rol"
                className="w-full p-2.5 border border-[#3A3A3A]/20 bg-[#F5F0E9] rounded-xl text-xs text-[#3A3A3A] focus:outline-none focus:border-[#8367C7]"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="event-date" className="text-xs font-bold text-[#3A3A3A]/85">Fecha y Hora</label>
              <input
                id="event-date"
                type="datetime-local"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2.5 border border-[#3A3A3A]/20 bg-[#F5F0E9] rounded-xl text-xs text-[#3A3A3A] focus:outline-none focus:border-[#8367C7]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="event-fee" className="text-xs font-bold text-[#3A3A3A]/85">Costo de Inscripción ($)</label>
              <input
                id="event-fee"
                type="number"
                min="0"
                step="0.01"
                required
                value={entryFee}
                onChange={(e) => setEntryFee(e.target.value)}
                className="w-full p-2.5 border border-[#3A3A3A]/20 bg-[#F5F0E9] rounded-xl text-xs text-[#3A3A3A] focus:outline-none focus:border-[#8367C7]"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="event-limit" className="text-xs font-bold text-[#3A3A3A]/85">Límite de Jugadores (Opcional)</label>
              <input
                id="event-limit"
                type="number"
                min="2"
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(e.target.value)}
                placeholder="Sin límite"
                className="w-full p-2.5 border border-[#3A3A3A]/20 bg-[#F5F0E9] rounded-xl text-xs text-[#3A3A3A] focus:outline-none focus:border-[#8367C7]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="event-host" className="text-xs font-bold text-[#3A3A3A]/85">Sede Física (Opcional)</label>
              <select
                id="event-host"
                value={selectedHostVenueId}
                onChange={(e) => setSelectedHostVenueId(e.target.value)}
                className="w-full p-2.5 border border-[#3A3A3A]/20 bg-[#F5F0E9] rounded-xl text-xs text-[#3A3A3A] focus:outline-none focus:border-[#8367C7] cursor-pointer"
              >
                <option value="">Sin sede física (Online / Variable)</option>
                {venuesList.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="event-reg-url" className="text-xs font-bold text-[#3A3A3A]/85">URL de Registro (Opcional)</label>
              <input
                id="event-reg-url"
                type="url"
                value={registrationUrl}
                onChange={(e) => setRegistrationUrl(e.target.value)}
                placeholder="https://ejemplo.com/registro"
                className="w-full p-2.5 border border-[#3A3A3A]/20 bg-[#F5F0E9] rounded-xl text-xs text-[#3A3A3A] focus:outline-none focus:border-[#8367C7]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="event-desc" className="text-xs font-bold text-[#3A3A3A]/85">Descripción</label>
            <textarea
              id="event-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Premios, formato del torneo, requisitos..."
              className="w-full p-2.5 border border-[#3A3A3A]/20 bg-[#F5F0E9] rounded-xl text-xs text-[#3A3A3A] focus:outline-none focus:border-[#8367C7] resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="py-2.5 bg-[#8367C7] hover:bg-[#6f53b3] disabled:opacity-50 text-[#F5F0E9] font-bold rounded-xl shadow-md transition-all text-xs cursor-pointer mt-1"
          >
            {submitting ? 'Creando...' : 'Crear Evento'}
          </button>
        </form>
      ) : (
        <div className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-1">
          {loading ? (
            <p className="text-xs text-[#3A3A3A]/50 italic text-center py-4">Cargando eventos...</p>
          ) : events.length === 0 ? (
            <p className="text-xs text-[#3A3A3A]/50 italic text-center py-4">No tienes eventos programados.</p>
          ) : (
            events.map((event) => {
              const eventDate = new Date(event.date)
              return (
                <div
                  key={event.id}
                  className="flex items-center justify-between gap-3 bg-[#3A3A3A]/5 p-3 rounded-xl border border-[#3A3A3A]/5 hover:border-[#8367C7]/20 transition-all text-xs"
                >
                  <div className="min-w-0">
                    <span className="px-1.5 py-0.5 text-[9px] font-bold bg-[#8367C7]/10 text-[#8367C7] rounded">
                      {event.game}
                    </span>
                    <h4 className="font-bold text-[#3A3A3A] mt-1 truncate">{event.title}</h4>
                    <p className="text-[10px] text-[#3A3A3A]/50 font-semibold mt-0.5">
                      {eventDate.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })} - {eventDate.toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit' })}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="p-2 hover:bg-red-50 text-[#3A3A3A]/40 hover:text-red-500 rounded-lg transition-all cursor-pointer flex-shrink-0"
                    title="Eliminar evento"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                  </button>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
