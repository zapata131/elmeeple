'use client'

import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { createVenue, OnboardingData } from '@/app/actions/venue'

const OnboardingMap = dynamic(() => import('@/components/OnboardingMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#F5F0E9] border border-[#3A3A3A]/10 rounded-xl">
      <span className="text-sm font-semibold text-[#8367C7] animate-pulse">Cargando Mapa...</span>
    </div>
  ),
})

const PREDEFINED_TAGS = ['Eurogames', 'TCGs', 'Wargames', 'Rol', 'Café']

export default function Onboarding() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState<OnboardingData>({
    ownerName: '',
    ownerEmail: '',
    name: '',
    description: '',
    schedule: '',
    lat: undefined as unknown as number,
    lng: undefined as unknown as number,
    tags: []
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      const result = await createVenue(formData)
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

  if (success) {
    return (
      <div className="min-h-screen bg-[#F5F0E9] flex items-center justify-center p-4">
        <div className="bg-[#F5F0E9] text-[#3A3A3A] p-8 rounded-2xl shadow-2xl border border-[#3A3A3A]/10 max-w-md w-full text-center flex flex-col gap-6 backdrop-blur-md bg-opacity-95">
          <div className="w-20 h-20 bg-[#73D8D4]/20 text-[#73D8D4] rounded-full flex items-center justify-center mx-auto shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-10 h-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[#3A3A3A] tracking-tight">¡Registro Completado con Éxito!</h1>
            <p className="text-sm font-semibold text-[#8367C7] mt-1">El Meeple - Portal de Tiendas</p>
          </div>
          
          <div className="bg-[#3A3A3A]/5 p-5 rounded-xl text-left border border-[#3A3A3A]/5 flex flex-col gap-2">
            <p className="text-sm font-semibold text-[#3A3A3A]">Resumen del Registro:</p>
            <p className="text-xs text-[#3A3A3A]/85"><span className="font-bold">Local:</span> {formData.name}</p>
            <p className="text-xs text-[#3A3A3A]/85"><span className="font-bold">Propietario:</span> {formData.ownerName}</p>
            <p className="text-xs text-[#3A3A3A]/85"><span className="font-bold">Coordenadas:</span> {formData.lat}, {formData.lng}</p>
            <p className="text-xs text-[#3A3A3A]/85"><span className="font-bold">Especialidades:</span> {formData.tags.join(', ')}</p>
          </div>

          <p className="text-sm text-[#3A3A3A]/70 leading-relaxed">
            Tu local está en espera de aprobación por parte de los administradores. Te notificaremos a tu correo <span className="font-bold">{formData.ownerEmail}</span> una vez esté verificado.
          </p>

          <Link href="/" className="w-full py-3 bg-[#73D8D4] hover:bg-[#5ec4c0] text-[#3A3A3A] font-bold rounded-xl shadow-md transition-all duration-200 text-center text-sm">
            Volver al Mapa Principal
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F0E9] py-12 px-4 flex flex-col items-center justify-center">
      {/* Brand Header */}
      <div className="text-center mb-8 flex flex-col items-center gap-2">
        <Link href="/" className="flex items-center gap-2 cursor-pointer">
          <span className="text-3xl" role="img" aria-label="dice">🎲</span>
          <span className="text-2xl font-extrabold text-[#3A3A3A]">El Meeple</span>
        </Link>
        <p className="text-sm text-[#8367C7] font-bold tracking-wide uppercase">Portal de Socios</p>
      </div>

      {/* Stepper Progress */}
      <div className="max-w-lg w-full mb-8 flex justify-between items-center px-2">
        {[1, 2, 3, 4, 5].map((s) => (
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
            {s < 5 && (
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
              <h2 className="text-xl font-extrabold text-[#3A3A3A]">Paso 1: Tu Cuenta</h2>
              <p className="text-xs text-[#3A3A3A]/60 mt-1">Ingresa tus datos personales de contacto.</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="ownerName" className="text-xs font-bold text-[#3A3A3A]/85">Nombre del Propietario</label>
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
              <label htmlFor="ownerEmail" className="text-xs font-bold text-[#3A3A3A]/85">Correo Electrónico</label>
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

            <button type="submit" className="w-full py-3 bg-[#73D8D4] hover:bg-[#5ec4c0] text-[#3A3A3A] font-bold rounded-xl shadow-md transition-all duration-200 mt-2 cursor-pointer text-center text-sm">
              Siguiente
            </button>
          </form>
        )}

        {/* STEP 2: Venue Details */}
        {step === 2 && (
          <form onSubmit={handleNext} className="flex flex-col gap-5">
            <div>
              <h2 className="text-xl font-extrabold text-[#3A3A3A]">Paso 2: Datos del Local</h2>
              <p className="text-xs text-[#3A3A3A]/60 mt-1">Comparte los detalles de tu establecimiento.</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-xs font-bold text-[#3A3A3A]/85">Nombre del Local</label>
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
              <label htmlFor="description" className="text-xs font-bold text-[#3A3A3A]/85">Descripción</label>
              <textarea
                id="description"
                name="description"
                required
                rows={3}
                value={formData.description}
                onChange={handleChange}
                placeholder="Cuéntanos sobre la ludoteca, comunidad o eventos..."
                className="w-full p-3 border border-[#3A3A3A]/20 bg-[#F5F0E9] rounded-xl text-sm text-[#3A3A3A] focus:outline-none focus:border-[#8367C7] transition-colors resize-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="schedule" className="text-xs font-bold text-[#3A3A3A]/85">Horario de Servicio</label>
              <input
                id="schedule"
                name="schedule"
                type="text"
                required
                value={formData.schedule}
                onChange={handleChange}
                placeholder="Ej. Mar - Dom: 13:00 - 22:00"
                className="w-full p-3 border border-[#3A3A3A]/20 bg-[#F5F0E9] rounded-xl text-sm text-[#3A3A3A] focus:outline-none focus:border-[#8367C7] transition-colors"
              />
            </div>

            <div className="flex gap-3 mt-2">
              <button type="button" onClick={handleBack} className="w-1/2 py-3 bg-[#F5F0E9] border border-[#3A3A3A]/20 hover:bg-[#EAE2D5] text-[#3A3A3A] font-semibold rounded-xl transition-all duration-200 cursor-pointer text-center text-sm">
                Atrás
              </button>
              <button type="submit" className="w-1/2 py-3 bg-[#73D8D4] hover:bg-[#5ec4c0] text-[#3A3A3A] font-bold rounded-xl shadow-md transition-all duration-200 cursor-pointer text-center text-sm">
                Siguiente
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Map Location Pin */}
        {step === 3 && (
          <form onSubmit={handleNext} className="flex flex-col gap-5">
            <div>
              <h2 className="text-xl font-extrabold text-[#3A3A3A]">Paso 3: Ubicar en el Mapa</h2>
              <p className="text-xs text-[#3A3A3A]/60 mt-1">Haz clic en el mapa para ubicar el pin de tu local.</p>
            </div>

            <div className="w-full h-64 rounded-xl overflow-hidden shadow-inner border border-[#3A3A3A]/10">
              <OnboardingMap 
                lat={formData.lat}
                lng={formData.lng}
                onChangeCoordinates={handleCoordinateChange}
              />
            </div>

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
                  className="w-full p-2.5 border border-[#3A3A3A]/20 bg-[#3A3A3A]/5 rounded-xl text-sm text-[#3A3A3A] focus:outline-none"
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
                  className="w-full p-2.5 border border-[#3A3A3A]/20 bg-[#3A3A3A]/5 rounded-xl text-sm text-[#3A3A3A] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button type="button" onClick={handleBack} className="w-1/2 py-3 bg-[#F5F0E9] border border-[#3A3A3A]/20 hover:bg-[#EAE2D5] text-[#3A3A3A] font-semibold rounded-xl transition-all duration-200 cursor-pointer text-center text-sm">
                Atrás
              </button>
              <button type="submit" disabled={!formData.lat || !formData.lng} className="w-1/2 py-3 bg-[#73D8D4] hover:bg-[#5ec4c0] disabled:bg-[#3A3A3A]/10 disabled:text-[#3A3A3A]/30 disabled:cursor-not-allowed text-[#3A3A3A] font-bold rounded-xl shadow-md transition-all duration-200 cursor-pointer text-center text-sm">
                Siguiente
              </button>
            </div>
          </form>
        )}

        {/* STEP 4: Specialties / Tags */}
        {step === 4 && (
          <form onSubmit={handleNext} className="flex flex-col gap-5">
            <div>
              <h2 className="text-xl font-extrabold text-[#3A3A3A]">Paso 4: Especialidades</h2>
              <p className="text-xs text-[#3A3A3A]/60 mt-1">Selecciona las categorías principales que ofrece tu local.</p>
            </div>

            <div className="flex flex-col gap-2.5 my-2">
              {PREDEFINED_TAGS.map((tag) => {
                const isSelected = formData.tags.includes(tag)
                return (
                  <label
                    key={tag}
                    htmlFor={`tag-${tag}`}
                    className={`flex items-center gap-3 p-3.5 border rounded-xl cursor-pointer transition-all duration-200 ${
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
                    <span className="text-sm font-bold">{tag}</span>
                  </label>
                )
              })}
            </div>

            <div className="flex gap-3 mt-2">
              <button type="button" onClick={handleBack} className="w-1/2 py-3 bg-[#F5F0E9] border border-[#3A3A3A]/20 hover:bg-[#EAE2D5] text-[#3A3A3A] font-semibold rounded-xl transition-all duration-200 cursor-pointer text-center text-sm">
                Atrás
              </button>
              <button type="submit" className="w-1/2 py-3 bg-[#73D8D4] hover:bg-[#5ec4c0] text-[#3A3A3A] font-bold rounded-xl shadow-md transition-all duration-200 cursor-pointer text-center text-sm">
                Siguiente
              </button>
            </div>
          </form>
        )}

        {/* STEP 5: Summary & Submit */}
        {step === 5 && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <h2 className="text-xl font-extrabold text-[#3A3A3A]">Paso 5: Confirmar Datos</h2>
              <p className="text-xs text-[#3A3A3A]/60 mt-1">Revisa que toda tu información sea correcta antes de enviar.</p>
            </div>

            <div className="flex flex-col gap-4 bg-[#3A3A3A]/5 border border-[#3A3A3A]/10 p-5 rounded-2xl text-sm">
              <div className="flex flex-col gap-1 border-b border-[#3A3A3A]/10 pb-2.5">
                <span className="text-xs font-bold text-[#8367C7]">PROPIETARIO</span>
                <span className="font-semibold text-[#3A3A3A]">{formData.ownerName}</span>
                <span className="text-xs text-[#3A3A3A]/70">{formData.ownerEmail}</span>
              </div>
              <div className="flex flex-col gap-1 border-b border-[#3A3A3A]/10 pb-2.5">
                <span className="text-xs font-bold text-[#8367C7]">DATOS DEL LOCAL</span>
                <span className="font-extrabold text-[#3A3A3A]">{formData.name}</span>
                <span className="text-xs text-[#3A3A3A]/85 mt-0.5 leading-relaxed">{formData.description}</span>
                <span className="text-xs text-[#3A3A3A]/70 font-semibold mt-1.5 flex items-center gap-1">🕒 {formData.schedule}</span>
              </div>
              <div className="flex flex-col gap-1 border-b border-[#3A3A3A]/10 pb-2.5">
                <span className="text-xs font-bold text-[#8367C7]">UBICACIÓN EN MAPA</span>
                <span className="font-semibold text-[#3A3A3A]">{formData.lat}, {formData.lng}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-[#8367C7]">ESPECIALIDADES</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {formData.tags.length > 0 ? (
                    formData.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 text-xs font-bold bg-[#8367C7]/10 text-[#8367C7] rounded-md">
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-[#3A3A3A]/50 italic">Ninguna especialidad seleccionada</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button type="button" disabled={loading} onClick={handleBack} className="w-1/2 py-3 bg-[#F5F0E9] border border-[#3A3A3A]/20 hover:bg-[#EAE2D5] text-[#3A3A3A] font-semibold rounded-xl transition-all duration-200 cursor-pointer text-center text-sm disabled:opacity-50">
                Atrás
              </button>
              <button type="submit" disabled={loading} className="w-1/2 py-3 bg-[#8367C7] hover:bg-[#6f53b3] disabled:bg-[#3A3A3A]/10 disabled:text-[#3A3A3A]/30 disabled:cursor-not-allowed text-[#F5F0E9] font-bold rounded-xl shadow-md transition-all duration-200 cursor-pointer text-center text-sm">
                {loading ? 'Registrando...' : 'Confirmar y Registrar'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  )
}
