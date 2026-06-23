'use client'

import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { createVenue, OnboardingData } from '@/app/actions/venue'
import { StructuredSchedule, formatSchedule } from '@/components/QuickViewCard'

const OnboardingMap = dynamic(() => import('@/components/OnboardingMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#F5F0E9] border border-[#3A3A3A]/10 rounded-xl">
      <span className="text-sm font-semibold text-[#8367C7] animate-pulse">Cargando mapa</span>
    </div>
  ),
})

const PREDEFINED_TAGS = [
  'Eurogames', 
  'TCGs', 
  'Wargames', 
  'Rol (RPGs)', 
  'Juegos de Miniaturas', 
  'Juegos Familiares / Party', 
  'Magic', 
  'Yu-Gi-Oh', 
  'Pokémon', 
  'Lorcana', 
  'One Piece', 
  'Venta de Juegos', 
  'Alquiler de Mesas', 
  'Café de Especialidad', 
  'Comida y Bebida', 
  'Torneos Oficiales'
]

const DAYS_OF_WEEK = [
  { key: 'mon', label: 'Lunes' },
  { key: 'tue', label: 'Martes' },
  { key: 'wed', label: 'Miércoles' },
  { key: 'thu', label: 'Jueves' },
  { key: 'fri', label: 'Viernes' },
  { key: 'sat', label: 'Sábado' },
  { key: 'sun', label: 'Domingo' }
] as const

export default function Onboarding() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  
  // Geocoding and GPS states
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [gpsError, setGpsError] = useState('')

  const [formData, setFormData] = useState<OnboardingData>({
    ownerName: '',
    ownerEmail: '',
    name: '',
    description: '',
    type: 'cafe',
    instagram: '',
    discord: '',
    logoUrl: '',
    schedule: {
      mon: null,
      tue: null,
      wed: null,
      thu: null,
      fri: null,
      sat: null,
      sun: null
    },
    lat: undefined as unknown as number,
    lng: undefined as unknown as number,
    tags: [],
    businessTaxId: '',
    verificationProof: '',
    contactEmail: '',
    contactPhone: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCoordinateChange = (lat: number, lng: number) => {
    setFormData((prev) => ({
      ...prev,
      lat: parseFloat(lat.toFixed(6)),
      lng: parseFloat(lng.toFixed(6))
    }))
  }

  // GPS Geolocation trigger
  const handleGeolocation = () => {
    setGpsError('')
    if (!navigator.geolocation) {
      setGpsError('La geolocalización no es compatible con tu navegador.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        handleCoordinateChange(position.coords.latitude, position.coords.longitude)
      },
      (error) => {
        console.error(error)
        setGpsError('No se pudo obtener tu ubicación. Por favor, selecciona tu local en el mapa.')
      }
    );
  }

  // Address Geocoding trigger (Nominatim API)
  const handleAddressSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setSearching(true)
    setSearchError('')
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
      )
      if (!response.ok) throw new Error('Network error')
      const results = await response.json()

      if (results && results.length > 0) {
        const { lat, lon } = results[0]
        handleCoordinateChange(parseFloat(lat), parseFloat(lon))
      } else {
        setSearchError('No se encontraron resultados para la dirección ingresada.')
      }
    } catch (err) {
      console.error(err)
      setSearchError('Ocurrió un error al buscar la dirección. Por favor, inténtalo de nuevo.')
    } finally {
      setSearching(false)
    }
  }

  // Local file upload & canvas auto-crop logic
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Crop and resize to 150x150 square
        const size = 150
        canvas.width = size
        canvas.height = size

        const minDim = Math.min(img.width, img.height)
        const sx = (img.width - minDim) / 2
        const sy = (img.height - minDim) / 2

        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size)

        // Compress as medium quality JPEG Base64
        const base64 = canvas.toDataURL('image/jpeg', 0.7)
        
        setFormData((prev) => ({
          ...prev,
          logoUrl: base64
        }))
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  // Client-side canvas compressor for permit file upload (max width 400px, height 300px, 15 KB)
  const handlePermitUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        let width = img.width
        let height = img.height
        const maxWidth = 400
        const maxHeight = 300

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height)
          height = maxHeight
        }

        canvas.width = width
        canvas.height = height

        ctx.drawImage(img, 0, 0, width, height)

        // Compress as low/medium quality JPEG to keep file size under 15 KB
        const base64 = canvas.toDataURL('image/jpeg', 0.5)
        
        setFormData((prev) => ({
          ...prev,
          verificationProof: base64
        }))
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  // Structured schedule handlers
  const handleDayToggle = (day: keyof StructuredSchedule) => {
    setFormData((prev) => {
      const current = prev.schedule[day]
      const updatedSchedule = {
        ...prev.schedule,
        [day]: current ? null : { open: '09:00', close: '21:00' }
      }
      return { ...prev, schedule: updatedSchedule }
    })
  }

  const handleTimeChange = (day: keyof StructuredSchedule, type: 'open' | 'close', value: string) => {
    setFormData((prev) => {
      const current = prev.schedule[day]
      if (!current) return prev
      const updatedDay = { ...current, [type]: value }
      const updatedSchedule = {
        ...prev.schedule,
        [day]: updatedDay
      }
      return { ...prev, schedule: updatedSchedule }
    })
  }

  const handleTagToggle = (tag: string) => {
    setFormData((prev) => {
      const isSelected = prev.tags.includes(tag)
      const newTags = isSelected 
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag]
      return { ...prev, tags: newTags }
    })
  }

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault()
    setStep((prev) => prev + 1)
  }

  const handleBack = () => {
    setStep((prev) => prev - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Omit empty contact fields to maintain backward compatibility with tests
      const { contactEmail, contactPhone, ...rest } = formData
      const payload = {
        ...rest,
        ...(contactEmail ? { contactEmail } : {}),
        ...(contactPhone ? { contactPhone } : {})
      }

      const result = await createVenue(payload)
      if (result.success) {
        setSuccess(true)
      } else {
        alert(result.error || 'Ocurrió un error al registrar el local.')
      }
    } catch (err) {
      console.error(err)
      alert('Error de conexión con el servidor.')
    } finally {
      setLoading(false)
    }
  }

  const formattedWeeklySchedule = formatSchedule(formData.schedule)

  if (success) {
    return (
      <div className="min-h-screen bg-[#F5F0E9] flex items-center justify-center p-4 relative">
        <div className="bg-[#F5F0E9] text-[#3A3A3A] p-8 rounded-2xl shadow-2xl border border-[#3A3A3A]/10 max-w-md w-full text-center flex flex-col gap-6 backdrop-blur-md bg-opacity-95 animate-in fade-in duration-300">
          <div className="w-20 h-20 bg-[#8367C7]/20 text-[#8367C7] rounded-full flex items-center justify-center mx-auto shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-10 h-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[#3A3A3A] tracking-tight">¡Registro Completado con Éxito!</h1>
            <p className="text-sm font-semibold text-[#8367C7] mt-1">El Meeple - Portal de Tiendas</p>
          </div>
          
          <div className="bg-[#3A3A3A]/5 p-5 rounded-xl text-left border border-[#3A3A3A]/5 flex flex-col gap-2.5">
            <div className="flex items-center gap-3 border-b border-[#3A3A3A]/10 pb-2">
              {formData.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={formData.logoUrl} alt="Logo Preview" className="w-10 h-10 rounded-lg object-cover border border-[#3A3A3A]/10 bg-white" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-[#8367C7]/15 text-[#8367C7] flex items-center justify-center font-bold">
                  <svg className="w-5 h-5 text-[#8367C7] fill-current" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                    <path d="M256 54.99c-27 0-46.418 14.287-57.633 32.23-10.03 16.047-14.203 34.66-15.017 50.962-30.608 15.135-64.515 30.394-91.815 45.994-14.32 8.183-26.805 16.414-36.203 25.26C45.934 218.28 39 228.24 39 239.99c0 5 2.44 9.075 5.19 12.065 2.754 2.99 6.054 5.312 9.812 7.48 7.515 4.336 16.99 7.95 27.412 11.076 15.483 4.646 32.823 8.1 47.9 9.577-14.996 25.84-34.953 49.574-52.447 72.315C56.65 378.785 39 403.99 39 431.99c0 4-.044 7.123.31 10.26.355 3.137 1.256 7.053 4.41 10.156 3.155 3.104 7.017 3.938 10.163 4.28 3.146.345 6.315.304 10.38.304h111.542c8.097 0 14.026.492 20.125-3.43 6.1-3.92 8.324-9.275 12.67-17.275l.088-.16.08-.166s9.723-19.77 21.324-39.388c5.8-9.808 12.097-19.576 17.574-26.498 2.74-3.46 5.304-6.204 7.15-7.754.564-.472.82-.56 1.184-.76.363.2.62.288 1.184.76 1.846 1.55 4.41 4.294 7.15 7.754 5.477 6.922 11.774 16.69 17.574 26.498 11.6 19.618 21.324 39.387 21.324 39.387l.08.165.088.16c4.346 8 6.55 13.323 12.61 17.254 6.058 3.93 11.974 3.45 19.957 3.45H448c4 0 7.12.043 10.244-.304 3.123-.347 6.998-1.21 10.12-4.332 3.12-3.122 3.984-6.997 4.33-10.12.348-3.122.306-6.244.306-10.244 0-28-17.65-53.205-37.867-79.488-17.493-22.74-37.45-46.474-52.447-72.315 15.077-1.478 32.417-4.93 47.9-9.576 10.422-3.125 19.897-6.74 27.412-11.075 3.758-2.168 7.058-4.49 9.81-7.48 2.753-2.99 5.192-7.065 5.192-12.065 0-11.75-6.934-21.71-16.332-30.554-9.398-8.846-21.883-17.077-36.203-25.26-27.3-15.6-61.207-30.86-91.815-45.994-.814-16.3-4.988-34.915-15.017-50.96C302.418 69.276 283 54.99 256 54.99z" />
                  </svg>
                </div>
              )}
              <div>
                <p className="text-sm font-extrabold text-[#3A3A3A]">{formData.name}</p>
                <p className="text-xs text-[#8367C7] font-semibold">{formData.type === 'cafe' ? 'Café de juegos' : formData.type === 'tienda' ? 'Tienda de juegos y TCG' : formData.type === 'hibrido' ? 'Híbrido (café y tienda)' : 'Club y comunidad'}</p>
              </div>
            </div>
            <p className="text-xs text-[#3A3A3A]/85"><span className="font-bold">Propietario:</span> {formData.ownerName}</p>
            <p className="text-xs text-[#3A3A3A]/85"><span className="font-bold">Coordenadas:</span> {formData.lat}, {formData.lng}</p>
            <p className="text-xs text-[#3A3A3A]/85"><span className="font-bold">Horario:</span> {formattedWeeklySchedule}</p>
            <p className="text-xs text-[#3A3A3A]/85"><span className="font-bold">Especialidades:</span> {formData.tags.join(', ')}</p>
          </div>

          <p className="text-sm text-[#3A3A3A]/70 leading-relaxed">
            Tu local está en espera de aprobación por parte de los administradores. Te notificaremos a tu correo <span className="font-bold">{formData.ownerEmail}</span> una vez esté verificado.
          </p>

          <Link href="/" className="w-full py-3 bg-[#8367C7] hover:bg-[#6f53b3] text-[#F5F0E9] font-bold rounded-xl shadow-md transition-all duration-200 text-center text-sm cursor-pointer">
            Volver al Mapa Principal
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F0E9] py-12 px-4 flex flex-col items-center justify-center relative">
      
      {/* Floating Back to Map Button (Always Visible) */}
      <div className="absolute top-6 left-6 z-20">
        <Link href="/" className="flex items-center gap-1.5 text-sm font-extrabold text-[#8367C7] hover:underline cursor-pointer transition-all duration-200">
          ← Volver al Mapa
        </Link>
      </div>

      {/* Brand Header */}
      <div className="text-center mb-8 flex flex-col items-center gap-2 animate-in fade-in duration-300">
        <Link href="/" className="flex items-center gap-2.5 cursor-pointer">
          <svg className="w-8 h-8 text-[#8367C7] fill-current" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
            <path d="M256 54.99c-27 0-46.418 14.287-57.633 32.23-10.03 16.047-14.203 34.66-15.017 50.962-30.608 15.135-64.515 30.394-91.815 45.994-14.32 8.183-26.805 16.414-36.203 25.26C45.934 218.28 39 228.24 39 239.99c0 5 2.44 9.075 5.19 12.065 2.754 2.99 6.054 5.312 9.812 7.48 7.515 4.336 16.99 7.95 27.412 11.076 15.483 4.646 32.823 8.1 47.9 9.577-14.996 25.84-34.953 49.574-52.447 72.315C56.65 378.785 39 403.99 39 431.99c0 4-.044 7.123.31 10.26.355 3.137 1.256 7.053 4.41 10.156 3.155 3.104 7.017 3.938 10.163 4.28 3.146.345 6.315.304 10.38.304h111.542c8.097 0 14.026.492 20.125-3.43 6.1-3.92 8.324-9.275 12.67-17.275l.088-.16.08-.166s9.723-19.77 21.324-39.388c5.8-9.808 12.097-19.576 17.574-26.498 2.74-3.46 5.304-6.204 7.15-7.754.564-.472.82-.56 1.184-.76.363.2.62.288 1.184.76 1.846 1.55 4.41 4.294 7.15 7.754 5.477 6.922 11.774 16.69 17.574 26.498 11.6 19.618 21.324 39.387 21.324 39.387l.08.165.088.16c4.346 8 6.55 13.323 12.61 17.254 6.058 3.93 11.974 3.45 19.957 3.45H448c4 0 7.12.043 10.244-.304 3.123-.347 6.998-1.21 10.12-4.332 3.12-3.122 3.984-6.997 4.33-10.12.348-3.122.306-6.244.306-10.244 0-28-17.65-53.205-37.867-79.488-17.493-22.74-37.45-46.474-52.447-72.315 15.077-1.478 32.417-4.93 47.9-9.576 10.422-3.125 19.897-6.74 27.412-11.075 3.758-2.168 7.058-4.49 9.81-7.48 2.753-2.99 5.192-7.065 5.192-12.065 0-11.75-6.934-21.71-16.332-30.554-9.398-8.846-21.883-17.077-36.203-25.26-27.3-15.6-61.207-30.86-91.815-45.994-.814-16.3-4.988-34.915-15.017-50.96C302.418 69.276 283 54.99 256 54.99z" />
          </svg>
          <span className="text-2xl font-extrabold text-[#3A3A3A]">El Meeple</span>
        </Link>
        <p className="text-xs text-[#8367C7] font-bold tracking-wide">Portal de socios</p>
      </div>

      {/* Stepper Progress */}
      <div className="max-w-lg w-full mb-8 flex justify-between items-center px-2 animate-in fade-in duration-300">
        {[1, 2, 3, 4, 5, 6].map((s) => (
          <React.Fragment key={s}>
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                  step >= s
                    ? 'bg-[#8367C7] text-[#F5F0E9] shadow-md shadow-[#8367C7]/20'
                    : 'bg-[#3A3A3A]/10 text-[#3A3A3A]/40'
                }`}
              >
                {s}
              </div>
            </div>
            {s < 6 && (
              <div
                className={`flex-1 h-0.5 mx-2 rounded transition-all duration-300 ${
                  step > s ? 'bg-[#8367C7]' : 'bg-[#3A3A3A]/10'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Form Wizard Card */}
      <div className="bg-[#F5F0E9] border border-[#3A3A3A]/10 shadow-2xl rounded-2xl p-6 md:p-8 max-w-lg w-full backdrop-blur-md bg-opacity-95">
        
        {/* STEP 1: Owner Details */}
        {step === 1 && (
          <form onSubmit={handleNext} className="flex flex-col gap-5">
            <div>
              <h2 className="text-xl font-extrabold text-[#3A3A3A]">Paso 1: tu cuenta</h2>
              <p className="text-xs text-[#3A3A3A]/60 mt-1">Ingresa tus datos personales de contacto.</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="ownerName" className="text-xs font-bold text-[#3A3A3A]/85">Nombre del propietario</label>
              <input
                id="ownerName"
                name="ownerName"
                type="text"
                required
                value={formData.ownerName}
                onChange={handleChange}
                placeholder="Ej. Jose Zapata"
                className="w-full p-3 border border-[#3A3A3A]/20 bg-[#F5F0E9] rounded-xl text-sm text-[#3A3A3A] focus:outline-none focus:border-[#8367C7] transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="ownerEmail" className="text-xs font-bold text-[#3A3A3A]/85">Correo electrónico</label>
              <input
                id="ownerEmail"
                name="ownerEmail"
                type="email"
                required
                value={formData.ownerEmail}
                onChange={handleChange}
                placeholder="Ej. jose@elmeeple.com"
                className="w-full p-3 border border-[#3A3A3A]/20 bg-[#F5F0E9] rounded-xl text-sm text-[#3A3A3A] focus:outline-none focus:border-[#8367C7] transition-colors"
              />
            </div>

            <button type="submit" className="w-full py-3 bg-[#8367C7] hover:bg-[#6f53b3] text-[#F5F0E9] font-bold rounded-xl shadow-md transition-all duration-200 mt-2 cursor-pointer text-center text-sm">
              Siguiente
            </button>
          </form>
        )}

        {/* STEP 2: Venue Details & Structured Schedule */}
        {step === 2 && (
          <form onSubmit={handleNext} className="flex flex-col gap-5">
            <div>
              <h2 className="text-xl font-extrabold text-[#3A3A3A]">Paso 2: datos del local</h2>
              <p className="text-xs text-[#3A3A3A]/60 mt-1">Comparte los detalles y horarios de tu establecimiento.</p>
            </div>

            {/* Basic Info */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-xs font-bold text-[#3A3A3A]/85">Nombre del local</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Ej. Meeple Oasis CDMX"
                className="w-full p-3 border border-[#3A3A3A]/20 bg-[#F5F0E9] rounded-xl text-sm text-[#3A3A3A] focus:outline-none focus:border-[#8367C7] transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="type" className="text-xs font-bold text-[#3A3A3A]/85">Tipo de local</label>
              <select
                id="type"
                name="type"
                required
                value={formData.type}
                onChange={handleChange}
                className="w-full p-3 border border-[#3A3A3A]/20 bg-[#F5F0E9] rounded-xl text-sm text-[#3A3A3A] focus:outline-none focus:border-[#8367C7] transition-colors cursor-pointer"
              >
                <option value="cafe">Café de juegos</option>
                <option value="tienda">Tienda de juegos y TCG</option>
                <option value="hibrido">Híbrido (café y tienda)</option>
                <option value="comunidad">Club y comunidad</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="description" className="text-xs font-bold text-[#3A3A3A]/85">Descripción</label>
              <textarea
                id="description"
                name="description"
                required
                rows={2}
                value={formData.description}
                onChange={handleChange}
                placeholder="Cuéntanos sobre tu local, el ambiente, eventos y comunidad..."
                className="w-full p-3 border border-[#3A3A3A]/20 bg-[#F5F0E9] rounded-xl text-sm text-[#3A3A3A] focus:outline-none focus:border-[#8367C7] transition-colors resize-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="contactEmail" className="text-xs font-bold text-[#3A3A3A]/85">Correo de contacto público</label>
              <input
                id="contactEmail"
                name="contactEmail"
                type="email"
                value={formData.contactEmail || ''}
                onChange={handleChange}
                placeholder="Ej. contacto@meepletcg.com"
                className="w-full p-3 border border-[#3A3A3A]/20 bg-[#F5F0E9] rounded-xl text-sm text-[#3A3A3A] focus:outline-none focus:border-[#8367C7] transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="contactPhone" className="text-xs font-bold text-[#3A3A3A]/85">Teléfono de contacto</label>
              <input
                id="contactPhone"
                name="contactPhone"
                type="text"
                value={formData.contactPhone || ''}
                onChange={handleChange}
                placeholder="Ej. +525512345678"
                className="w-full p-3 border border-[#3A3A3A]/20 bg-[#F5F0E9] rounded-xl text-sm text-[#3A3A3A] focus:outline-none focus:border-[#8367C7] transition-colors"
              />
            </div>


            {/* Social profiles */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="instagram" className="text-xs font-bold text-[#3A3A3A]/85">Usuario de Instagram</label>
                <input
                  id="instagram"
                  name="instagram"
                  type="text"
                  value={formData.instagram}
                  onChange={handleChange}
                  placeholder="Ej. meeple_oasis"
                  className="w-full p-2.5 border border-[#3A3A3A]/20 bg-[#F5F0E9] rounded-xl text-xs text-[#3A3A3A] focus:outline-none focus:border-[#8367C7]"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="discord" className="text-xs font-bold text-[#3A3A3A]/85">Enlace de Discord</label>
                <input
                  id="discord"
                  name="discord"
                  type="url"
                  value={formData.discord}
                  onChange={handleChange}
                  placeholder="Ej. https://discord.gg/..."
                  className="w-full p-2.5 border border-[#3A3A3A]/20 bg-[#F5F0E9] rounded-xl text-xs text-[#3A3A3A] focus:outline-none focus:border-[#8367C7]"
                />
              </div>
            </div>

            {/* Premium File Upload & Auto-Crop Logo Area */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-[#3A3A3A]/85">Logo del local</span>
              {formData.logoUrl ? (
                <div className="flex items-center gap-4 p-3.5 border border-[#3A3A3A]/10 bg-[#3A3A3A]/5 rounded-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={formData.logoUrl}
                    alt="Logo Preview"
                    className="w-14 h-14 rounded-xl object-cover border border-[#3A3A3A]/10 bg-white"
                  />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-extrabold text-[#3A3A3A]">Logo cargado y recortado</span>
                    <span className="text-[10px] text-[#3A3A3A]/50">Dimensiones optimizadas a 150x150px</span>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, logoUrl: '' }))}
                      className="text-[11px] font-extrabold text-[#FF9E8A] hover:underline text-left cursor-pointer mt-0.5"
                    >
                      Quitar logo
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <label 
                    htmlFor="logo-upload" 
                    className="flex flex-col items-center justify-center border-2 border-dashed border-[#3A3A3A]/20 hover:border-[#8367C7] bg-[#3A3A3A]/5 p-6 rounded-xl cursor-pointer transition-all duration-200 text-center select-none"
                  >
                    <svg className="w-6 h-6 text-[#3A3A3A]/40 fill-current mb-1" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                      <path d="M256 54.99c-27 0-46.418 14.287-57.633 32.23-10.03 16.047-14.203 34.66-15.017 50.962-30.608 15.135-64.515 30.394-91.815 45.994-14.32 8.183-26.805 16.414-36.203 25.26C45.934 218.28 39 228.24 39 239.99c0 5 2.44 9.075 5.19 12.065 2.754 2.99 6.054 5.312 9.812 7.48 7.515 4.336 16.99 7.95 27.412 11.076 15.483 4.646 32.823 8.1 47.9 9.577-14.996 25.84-34.953 49.574-52.447 72.315C56.65 378.785 39 403.99 39 431.99c0 4-.044 7.123.31 10.26.355 3.137 1.256 7.053 4.41 10.156 3.155 3.104 7.017 3.938 10.163 4.28 3.146.345 6.315.304 10.38.304h111.542c8.097 0 14.026.492 20.125-3.43 6.1-3.92 8.324-9.275 12.67-17.275l.088-.16.08-.166s9.723-19.77 21.324-39.388c5.8-9.808 12.097-19.576 17.574-26.498 2.74-3.46 5.304-6.204 7.15-7.754.564-.472.82-.56 1.184-.76.363.2.62.288 1.184.76 1.846 1.55 4.41 4.294 7.15 7.754 5.477 6.922 11.774 16.69 17.574 26.498 11.6 19.618 21.324 39.387 21.324 39.387l.08.165.088.16c4.346 8 6.55 13.323 12.61 17.254 6.058 3.93 11.974 3.45 19.957 3.45H448c4 0 7.12.043 10.244-.304 3.123-.347 6.998-1.21 10.12-4.332 3.12-3.122 3.984-6.997 4.33-10.12.348-3.122.306-6.244.306-10.244 0-28-17.65-53.205-37.867-79.488-17.493-22.74-37.45-46.474-52.447-72.315 15.077-1.478 32.417-4.93 47.9-9.576 10.422-3.125 19.897-6.74 27.412-11.075 3.758-2.168 7.058-4.49 9.81-7.48 2.753-2.99 5.192-7.065 5.192-12.065 0-11.75-6.934-21.71-16.332-30.554-9.398-8.846-21.883-17.077-36.203-25.26-27.3-15.6-61.207-30.86-91.815-45.994-.814-16.3-4.988-34.915-15.017-50.96C302.418 69.276 283 54.99 256 54.99z" />
                    </svg>
                    <span className="text-xs font-extrabold text-[#3A3A3A]">Subir imagen de logo</span>
                    <span className="text-[10px] text-[#3A3A3A]/50 mt-0.5">Se recortará a un cuadrado de 150x150px</span>
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Structured Schedule Selector */}
            <div className="flex flex-col gap-2 border-t border-[#3A3A3A]/10 pt-4">
              <span className="text-xs font-bold text-[#3A3A3A]/85">Horarios de operación</span>
              <p className="text-[10px] text-[#3A3A3A]/60 -mt-1 mb-2">Define qué días abres y en qué horarios.</p>
              
              <div className="flex flex-col gap-2.5 max-h-60 overflow-y-auto pr-1">
                {DAYS_OF_WEEK.map(({ key, label }) => {
                  const isOpen = formData.schedule[key] !== null
                  return (
                    <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 border border-[#3A3A3A]/5 bg-[#3A3A3A]/5 rounded-xl">
                      <label htmlFor={`day-checkbox-${key}`} className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          id={`day-checkbox-${key}`}
                          type="checkbox"
                          checked={isOpen}
                          onChange={() => handleDayToggle(key)}
                          className="w-4 h-4 text-[#8367C7] bg-[#F5F0E9] border-[#3A3A3A]/20 rounded focus:ring-[#8367C7]"
                        />
                        <span className="text-xs font-bold text-[#3A3A3A]">{label}</span>
                      </label>

                      {isOpen && (
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-[#3A3A3A]/50 font-bold uppercase">De:</span>
                            <input
                              aria-label={`${key}-open`}
                              type="time"
                              required
                              value={formData.schedule[key]?.open || '09:00'}
                              onChange={(e) => handleTimeChange(key, 'open', e.target.value)}
                              className="p-1 text-xs border border-[#3A3A3A]/25 rounded bg-[#F5F0E9] focus:outline-none font-semibold text-[#3A3A3A]"
                            />
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-[#3A3A3A]/50 font-bold uppercase">A:</span>
                            <input
                              aria-label={`${key}-close`}
                              type="time"
                              required
                              value={formData.schedule[key]?.close || '21:00'}
                              onChange={(e) => handleTimeChange(key, 'close', e.target.value)}
                              className="p-1 text-xs border border-[#3A3A3A]/25 rounded bg-[#F5F0E9] focus:outline-none font-semibold text-[#3A3A3A]"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Stepper Buttons */}
            <div className="flex gap-3 mt-2">
              <button type="button" onClick={handleBack} className="w-1/2 py-3 bg-[#F5F0E9] border border-[#3A3A3A]/20 hover:bg-[#EAE2D5] text-[#3A3A3A] font-semibold rounded-xl transition-all duration-200 cursor-pointer text-center text-sm">
                Atrás
              </button>
              <button type="submit" className="w-1/2 py-3 bg-[#8367C7] hover:bg-[#6f53b3] text-[#F5F0E9] font-bold rounded-xl shadow-md transition-all duration-200 cursor-pointer text-center text-sm">
                Siguiente
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Map Location with Address Search & GPS Geolocation */}
        {step === 3 && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-xl font-extrabold text-[#3A3A3A]">Paso 3: ubicar en el mapa</h2>
              <p className="text-xs text-[#3A3A3A]/60 mt-1">Busca tu dirección o haz clic en el mapa para ubicar tu local.</p>
            </div>

            {/* Address Search Bar */}
            <form onSubmit={handleAddressSearch} className="flex gap-2">
              <input
                type="text"
                placeholder="Escribe una dirección (ej. Chihuahua 142, Roma Nte)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 p-3 border border-[#3A3A3A]/20 bg-[#F5F0E9] rounded-xl text-xs text-[#3A3A3A] focus:outline-none focus:border-[#8367C7]"
              />
              <button
                type="submit"
                disabled={searching || !searchQuery.trim()}
                className="px-4 bg-[#8367C7] hover:bg-[#6f53b3] disabled:opacity-50 text-[#F5F0E9] font-bold text-xs rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-1"
              >
                {searching ? 'Buscando...' : 'Buscar'}
              </button>
            </form>

            {searchError && (
              <p className="text-[11px] font-bold text-[#FF9E8A] bg-[#FF9E8A]/10 p-2.5 rounded-xl border border-[#FF9E8A]/20">{searchError}</p>
            )}

            {/* GPS Geolocation Trigger Button */}
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={handleGeolocation}
                className="w-full py-2.5 bg-[#F5F0E9] hover:bg-[#EAE2D5] border border-[#8367C7]/40 text-[#8367C7] font-bold text-xs rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5"
              >
                Usar mi ubicación actual
              </button>
              {gpsError && (
                <p className="text-[10px] font-bold text-[#FF9E8A] mt-1 text-center">{gpsError}</p>
              )}
            </div>

            {/* Interactive Map Box */}
            <div className="w-full h-64 rounded-xl overflow-hidden shadow-inner border border-[#3A3A3A]/10">
              <OnboardingMap 
                lat={formData.lat}
                lng={formData.lng}
                onChangeCoordinates={handleCoordinateChange}
              />
            </div>

            {/* Coords Form */}
            <form onSubmit={handleNext} className="flex flex-col gap-4">
              <div className="flex gap-4">
                <div className="flex flex-col gap-1 flex-1">
                  <label htmlFor="lat" className="text-xs font-bold text-[#3A3A3A]/85">Latitud</label>
                  <input
                    id="lat"
                    name="lat"
                    type="text"
                    readOnly
                    required
                    value={formData.lat || ''}
                    placeholder="Hacer clic en mapa"
                    className="w-full p-2.5 border border-[#3A3A3A]/20 bg-[#3A3A3A]/5 rounded-xl text-xs font-semibold text-[#3A3A3A] focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  <label htmlFor="lng" className="text-xs font-bold text-[#3A3A3A]/85">Longitud</label>
                  <input
                    id="lng"
                    name="lng"
                    type="text"
                    readOnly
                    required
                    value={formData.lng || ''}
                    placeholder="Hacer clic en mapa"
                    className="w-full p-2.5 border border-[#3A3A3A]/20 bg-[#3A3A3A]/5 rounded-xl text-xs font-semibold text-[#3A3A3A] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-1">
                <button type="button" onClick={handleBack} className="w-1/2 py-3 bg-[#F5F0E9] border border-[#3A3A3A]/20 hover:bg-[#EAE2D5] text-[#3A3A3A] font-semibold rounded-xl transition-all duration-200 cursor-pointer text-center text-sm">
                  Atrás
                </button>
                <button type="submit" disabled={!formData.lat || !formData.lng} className="w-1/2 py-3 bg-[#8367C7] hover:bg-[#6f53b3] disabled:bg-[#3A3A3A]/10 disabled:text-[#3A3A3A]/30 disabled:cursor-not-allowed text-[#F5F0E9] font-bold rounded-xl shadow-md transition-all duration-200 cursor-pointer text-center text-sm">
                  Siguiente
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 4: Specialties / Extended Tags */}
        {step === 4 && (
          <form onSubmit={handleNext} className="flex flex-col gap-5">
            <div>
              <h2 className="text-xl font-extrabold text-[#3A3A3A]">Paso 4: especialidades</h2>
              <p className="text-xs text-[#3A3A3A]/60 mt-1">Selecciona las categorías principales que ofrece tu local.</p>
            </div>

            <div className="flex flex-col gap-2 my-1 max-h-80 overflow-y-auto pr-1">
              {PREDEFINED_TAGS.map((tag) => {
                const isSelected = formData.tags.includes(tag)
                return (
                  <label
                    key={tag}
                    htmlFor={`tag-${tag}`}
                    className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'border-[#8367C7] bg-[#8367C7]/5 text-[#8367C7]'
                        : 'border-[#3A3A3A]/10 bg-[#F5F0E9] hover:bg-[#3A3A3A]/5 text-[#3A3A3A]/80'
                    }`}
                  >
                    <input
                      id={`tag-${tag}`}
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleTagToggle(tag)}
                      className="w-4 h-4 text-[#8367C7] bg-[#F5F0E9] border-[#3A3A3A]/20 rounded focus:ring-[#8367C7]"
                    />
                    <span className="text-xs font-bold">{tag}</span>
                  </label>
                )
              })}
            </div>

            <div className="flex gap-3 mt-2">
              <button type="button" onClick={handleBack} className="w-1/2 py-3 bg-[#F5F0E9] border border-[#3A3A3A]/20 hover:bg-[#EAE2D5] text-[#3A3A3A] font-semibold rounded-xl transition-all duration-200 cursor-pointer text-center text-sm">
                Atrás
              </button>
              <button type="submit" className="w-1/2 py-3 bg-[#8367C7] hover:bg-[#6f53b3] text-[#F5F0E9] font-bold rounded-xl shadow-md transition-all duration-200 cursor-pointer text-center text-sm">
                Siguiente
              </button>
            </div>
          </form>
        )}

        {/* STEP 5: Summary & Next */}
        {step === 5 && (
          <form onSubmit={handleNext} className="flex flex-col gap-5">
            <div>
              <h2 className="text-xl font-extrabold text-[#3A3A3A]">Paso 5: confirmar datos</h2>
              <p className="text-xs text-[#3A3A3A]/60 mt-1">Revisa que toda tu información sea correcta antes de enviar.</p>
            </div>

            <div className="flex flex-col gap-4 bg-[#3A3A3A]/5 border border-[#3A3A3A]/10 p-5 rounded-2xl text-xs max-h-96 overflow-y-auto">
              <div className="flex flex-col gap-1 border-b border-[#3A3A3A]/10 pb-2.5">
                <span className="text-[10px] font-bold text-[#8367C7] tracking-wider">Propietario</span>
                <span className="font-semibold text-[#3A3A3A]">{formData.ownerName}</span>
                <span className="text-[11px] text-[#3A3A3A]/70">{formData.ownerEmail}</span>
              </div>
              
              <div className="flex flex-col gap-1.5 border-b border-[#3A3A3A]/10 pb-2.5">
                <span className="text-[10px] font-bold text-[#8367C7] tracking-wider">Datos del local</span>
                <div className="flex items-center gap-2.5">
                  {formData.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={formData.logoUrl} alt="Logo Preview" className="w-8 h-8 rounded-lg object-cover border border-[#3A3A3A]/10 bg-white" />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-[#8367C7]/15 text-[#8367C7] flex items-center justify-center font-bold">
                      <svg className="w-4 h-4 text-[#8367C7] fill-current" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                        <path d="M256 54.99c-27 0-46.418 14.287-57.633 32.23-10.03 16.047-14.203 34.66-15.017 50.962-30.608 15.135-64.515 30.394-91.815 45.994-14.32 8.183-26.805 16.414-36.203 25.26C45.934 218.28 39 228.24 39 239.99c0 5 2.44 9.075 5.19 12.065 2.754 2.99 6.054 5.312 9.812 7.48 7.515 4.336 16.99 7.95 27.412 11.076 15.483 4.646 32.823 8.1 47.9 9.577-14.996 25.84-34.953 49.574-52.447 72.315C56.65 378.785 39 403.99 39 431.99c0 4-.044 7.123.31 10.26.355 3.137 1.256 7.053 4.41 10.156 3.155 3.104 7.017 3.938 10.163 4.28 3.146.345 6.315.304 10.38.304h111.542c8.097 0 14.026.492 20.125-3.43 6.1-3.92 8.324-9.275 12.67-17.275l.088-.16.08-.166s9.723-19.77 21.324-39.388c5.8-9.808 12.097-19.576 17.574-26.498 2.74-3.46 5.304-6.204 7.15-7.754.564-.472.82-.56 1.184-.76.363.2.62.288 1.184.76 1.846 1.55 4.41 4.294 7.15 7.754 5.477 6.922 11.774 16.69 17.574 26.498 11.6 19.618 21.324 39.387 21.324 39.387l.08.165.088.16c4.346 8 6.55 13.323 12.61 17.254 6.058 3.93 11.974 3.45 19.957 3.45H448c4 0 7.12.043 10.244-.304 3.123-.347 6.998-1.21 10.12-4.332 3.12-3.122 3.984-6.997 4.33-10.12.348-3.122.306-6.244.306-10.244 0-28-17.65-53.205-37.867-79.488-17.493-22.74-37.45-46.474-52.447-72.315 15.077-1.478 32.417-4.93 47.9-9.576 10.422-3.125 19.897-6.74 27.412-11.075 3.758-2.168 7.058-4.49 9.81-7.48 2.753-2.99 5.192-7.065 5.192-12.065 0-11.75-6.934-21.71-16.332-30.554-9.398-8.846-21.883-17.077-36.203-25.26-27.3-15.6-61.207-30.86-91.815-45.994-.814-16.3-4.988-34.915-15.017-50.96C302.418 69.276 283 54.99 256 54.99z" />
                      </svg>
                    </div>
                  )}
                  <div>
                    <span className="font-extrabold text-[#3A3A3A] text-sm">{formData.name}</span>
                    <span className="text-[10px] font-extrabold text-[#8367C7] bg-[#8367C7]/10 px-1.5 py-0.5 rounded ml-2">
                      {formData.type === 'cafe' && 'Café de juegos'}
                      {formData.type === 'tienda' && 'Tienda de juegos y TCG'}
                      {formData.type === 'hibrido' && 'Híbrido (café y tienda)'}
                      {formData.type === 'comunidad' && 'Club y comunidad'}
                    </span>
                  </div>
                </div>
                <span className="text-[11px] text-[#3A3A3A]/85 leading-relaxed mt-1">{formData.description}</span>
                
                {/* Social Profiles */}
                {(formData.instagram || formData.discord) && (
                  <div className="flex gap-3 mt-1.5 text-[11px] font-semibold text-[#3A3A3A]/70">
                    {formData.instagram && <span>📸 @{formData.instagram}</span>}
                    {formData.discord && <span className="truncate">👾 {formData.discord}</span>}
                  </div>
                )}

                {/* Public contact info in summary */}
                {(formData.contactEmail || formData.contactPhone) && (
                  <div className="flex flex-col gap-1 mt-2 border-t border-[#3A3A3A]/5 pt-2 text-[11px] text-[#3A3A3A]/85 font-semibold">
                    {formData.contactEmail && <div><span>Contacto:</span> {formData.contactEmail}</div>}
                    {formData.contactPhone && <div><span>Teléfono:</span> {formData.contactPhone}</div>}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1 border-b border-[#3A3A3A]/10 pb-2.5">
                <span className="text-[10px] font-bold text-[#8367C7] tracking-wider">Ubicación en el mapa</span>
                <span className="font-semibold text-[#3A3A3A]">{formData.lat}, {formData.lng}</span>
              </div>

              <div className="flex flex-col gap-1 border-b border-[#3A3A3A]/10 pb-2.5">
                <span className="text-[10px] font-bold text-[#8367C7] tracking-wider">Horarios de operación</span>
                <span className="font-semibold text-[#3A3A3A] leading-snug">{formattedWeeklySchedule}</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-[#8367C7] tracking-wider">Especialidades</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {formData.tags.length > 0 ? (
                    formData.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 text-[10px] font-bold bg-[#8367C7]/10 text-[#8367C7] rounded-md">
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-[11px] text-[#3A3A3A]/50 italic">Ninguna especialidad seleccionada</span>
                  )}
                </div>
              </div>
            </div>

            {/* Form Action Buttons */}
            <div className="flex gap-3 mt-2">
              <button type="button" disabled={loading} onClick={handleBack} className="w-1/2 py-3 bg-[#F5F0E9] border border-[#3A3A3A]/20 hover:bg-[#EAE2D5] text-[#3A3A3A] font-semibold rounded-xl transition-all duration-200 cursor-pointer text-center text-sm disabled:opacity-50">
                Atrás
              </button>
              <button type="submit" className="w-1/2 py-3 bg-[#8367C7] hover:bg-[#6f53b3] text-[#F5F0E9] font-bold rounded-xl shadow-md transition-all duration-200 cursor-pointer text-center text-sm">
                Siguiente
              </button>
            </div>
          </form>
        )}

        {/* STEP 6: Ownership Verification */}
        {step === 6 && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <h2 className="text-xl font-extrabold text-[#3A3A3A]">Paso 6: verificación de propiedad</h2>
              <p className="text-xs text-[#3A3A3A]/60 mt-1">Sube la documentación requerida para verificar la propiedad del establecimiento.</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="businessTaxId" className="text-xs font-bold text-[#3A3A3A]/85">Identificación fiscal (RFC o Tax ID)</label>
              <input
                id="businessTaxId"
                name="businessTaxId"
                type="text"
                required
                value={formData.businessTaxId || ''}
                onChange={handleChange}
                placeholder="Ej. RFC-ZAPJ900101-1A1"
                className="w-full p-3 border border-[#3A3A3A]/20 bg-[#F5F0E9] rounded-xl text-sm text-[#3A3A3A] focus:outline-none focus:border-[#8367C7] transition-colors"
              />
            </div>

            {/* Operating Permit File Upload & Canvas Compressor */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-[#3A3A3A]/85">Permiso de operación (comprobante)</span>
              {formData.verificationProof ? (
                <div className="flex items-center gap-4 p-3.5 border border-[#3A3A3A]/10 bg-[#3A3A3A]/5 rounded-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={formData.verificationProof}
                    alt="Permit Preview"
                    className="w-20 h-15 rounded-lg object-cover border border-[#3A3A3A]/10 bg-white"
                  />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-extrabold text-[#3A3A3A] text-success">Documento cargado y comprimido</span>
                    <span className="text-[10px] text-[#3A3A3A]/50">Optimizado para auditoría (máx 400x300px, &lt; 15 KB)</span>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, verificationProof: '' }))}
                      className="text-[11px] font-extrabold text-[#FF9E8A] hover:underline text-left cursor-pointer mt-0.5"
                    >
                      Quitar documento
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <label 
                    htmlFor="permit-upload" 
                    className="flex flex-col items-center justify-center border-2 border-dashed border-[#3A3A3A]/20 hover:border-[#8367C7] bg-[#3A3A3A]/5 p-6 rounded-xl cursor-pointer transition-all duration-200 text-center select-none"
                  >
                    <svg className="w-6 h-6 text-[#3A3A3A]/40 fill-current mb-1" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                      <path d="M428 224H288V84c0-11-9-20-20-20s-20 9-20 20v140H108c-11 0-20 9-20 20s9 20 20 20h140v140c0 11 9 20 20 20s20-9 20-20V264h140c11 0 20-9 20-20s-9-20-20-20z" />
                    </svg>
                    <span className="text-xs font-extrabold text-[#3A3A3A]">Subir permiso de operación</span>
                    <span className="text-[10px] text-[#3A3A3A]/50 mt-0.5">Se comprimirá a JPEG (máx 400x300px)</span>
                    <input
                      id="permit-upload"
                      type="file"
                      accept="image/*"
                      onChange={handlePermitUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-2">
              <button type="button" disabled={loading} onClick={handleBack} className="w-1/2 py-3 bg-[#F5F0E9] border border-[#3A3A3A]/20 hover:bg-[#EAE2D5] text-[#3A3A3A] font-semibold rounded-xl transition-all duration-200 cursor-pointer text-center text-sm disabled:opacity-50">
                Atrás
              </button>
              <button type="submit" disabled={loading || !formData.verificationProof || !formData.businessTaxId} className="w-1/2 py-3 bg-[#8367C7] hover:bg-[#6f53b3] disabled:bg-[#3A3A3A]/10 disabled:text-[#3A3A3A]/30 disabled:cursor-not-allowed text-[#F5F0E9] font-bold rounded-xl shadow-md transition-all duration-200 cursor-pointer text-center text-sm">
                {loading ? 'Registrando...' : 'Confirmar y Registrar'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  )
}
