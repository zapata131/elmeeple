'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

import Link from 'next/link'
import { approveVenue, rejectVenue } from '@/app/actions/admin'


interface Venue {
  id: string
  name: string
  owner_name: string
  owner_email: string
  business_tax_id: string
  verification_proof: string
  verification_status: string
  rejection_reason?: string
  verified: boolean
  contact_email?: string
  contact_phone?: string
}

interface AdminDashboardClientProps {
  initialVenues: Venue[]
}

export default function AdminDashboardClient({ initialVenues }: AdminDashboardClientProps) {
  const router = useRouter()
  const [venues, setVenues] = useState<Venue[]>(initialVenues)
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null)
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [loadingAction, setLoadingAction] = useState(false)
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending')

  // Recalculate stats on current state
  const total = venues.length
  const pending = venues.filter(v => v.verification_status === 'pending')
  const approvedCount = venues.filter(v => v.verification_status === 'approved').length
  const rejectedCount = venues.filter(v => v.verification_status === 'rejected').length

  const handleApprove = async (id: string) => {
    setLoadingAction(true)
    try {
      const res = await approveVenue(id)
      if (res.success) {
        setVenues(prev =>
          prev.map(v => (v.id === id ? { ...v, verification_status: 'approved', verified: true } : v))
        )
        setSelectedVenue(null)
        router.refresh()
      } else {
        alert(`Error al aprobar: ${res.error}`)
      }
    } catch (err) {
      console.error(err)
      alert('Error de conexión.')
    } finally {
      setLoadingAction(false)
    }
  }

  const handleReject = async (id: string) => {
    if (!rejectionReason.trim()) {
      alert('Por favor, ingresa un motivo para el rechazo.')
      return
    }
    setLoadingAction(true)
    try {
      const res = await rejectVenue(id, rejectionReason)
      if (res.success) {
        setVenues(prev =>
          prev.map(v =>
            v.id === id
              ? { ...v, verification_status: 'rejected', verified: false, rejection_reason: rejectionReason }
              : v
          )
        )
        setSelectedVenue(null)
        setShowRejectForm(false)
        setRejectionReason('')
        router.refresh()
      } else {
        alert(`Error al rechazar: ${res.error}`)
      }
    } catch (err) {
      console.error(err)
      alert('Error de conexión.')
    } finally {
      setLoadingAction(false)
    }
  }

  const closeModal = () => {
    setSelectedVenue(null)
    setShowRejectForm(false)
    setRejectionReason('')
  }

  const venuesToDisplay = activeTab === 'pending' ? pending : venues

  return (
    <div className="min-h-screen bg-[#F5F0E9] flex flex-col md:flex-row text-[#3A3A3A]">
      
      {/* Premium Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-[#3A3A3A]/10 p-6 flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <svg className="w-6 h-6 text-[#8367C7] fill-none stroke-current" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
          <span className="text-lg font-extrabold text-[#3A3A3A] tracking-tight">El Meeple Admin</span>
        </div>
        <nav className="flex flex-col gap-2">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
              activeTab === 'pending'
                ? 'bg-[#8367C7] text-[#F5F0E9] shadow-md shadow-[#8367C7]/20'
                : 'hover:bg-[#3A3A3A]/5 text-[#3A3A3A]/70'
            }`}
          >
            <svg className="w-4 h-4 text-current fill-none stroke-current" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 3.75H6.912a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H15M2.25 13.5h3.86a2.25 2.25 0 012.008 1.24l.885 1.77a2.25 2.25 0 002.007 1.24h1.98a2.25 2.25 0 002.007-1.24l.885-1.77a2.25 2.25 0 012.007-1.24h3.86m-18 0h19.5" />
            </svg>
            <span>Solicitudes pendientes</span>
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[#8367C7] text-[#F5F0E9] shadow-md shadow-[#8367C7]/20'
                : 'hover:bg-[#3A3A3A]/5 text-[#3A3A3A]/70'
            }`}
          >
            <svg className="w-4 h-4 text-current fill-none stroke-current" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12M8.25 17.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            <span>Todos los locales</span>
          </button>
          <Link
            href="/"
            className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold text-[#8367C7] hover:bg-[#8367C7]/10 transition-all text-left"
          >
            <svg className="w-4 h-4 text-current fill-none stroke-current" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0z" />
            </svg>
            <span>Volver al mapa</span>
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 md:p-10 flex flex-col gap-8">
        
        {/* Header */}
        <div className="border-b border-[#3A3A3A]/10 pb-6">
          <h1 className="text-2xl font-extrabold tracking-tight">Panel de Control</h1>
          <p className="text-xs text-[#3A3A3A]/65 mt-1.5">
            Auditoría de establecimientos registrados y solicitudes de verificación.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#3A3A3A]/10 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] font-bold text-[#3A3A3A]/50 uppercase tracking-wider">Total Locales</span>
            <p className="text-2xl font-black text-[#3A3A3A] mt-1.5">{total}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-[#3A3A3A]/10 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] font-bold text-[#8367C7] uppercase tracking-wider">Pendientes</span>
            <p className="text-2xl font-black text-[#8367C7] mt-1.5">{pending.length}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-[#3A3A3A]/10 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Aprobados</span>
            <p className="text-2xl font-black text-green-600 mt-1.5">{approvedCount}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-[#3A3A3A]/10 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] font-bold text-[#FF9E8A] uppercase tracking-wider">Rechazados</span>
            <p className="text-2xl font-black text-[#FF9E8A] mt-1.5">{rejectedCount}</p>
          </div>
        </div>

        {/* Audit Table Section */}
        <div className="bg-white rounded-2xl border border-[#3A3A3A]/10 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[#3A3A3A]/10 bg-[#3A3A3A]/5">
            <h2 className="text-sm font-bold text-[#3A3A3A]">
              {activeTab === 'pending' ? 'Solicitudes Pendientes' : 'Todos los Locales'}
            </h2>
            <p className="text-xs text-[#3A3A3A]/60 mt-0.5">Revisa y audita la información registrada.</p>
          </div>

          {venuesToDisplay.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-10 h-10 text-green-500 mb-2"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
              <p className="text-xs font-bold text-[#3A3A3A]/70">¡Al día! No hay locales para mostrar.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#3A3A3A]/5 text-[#3A3A3A]/80 text-[10px] font-bold uppercase tracking-wider border-b border-[#3A3A3A]/10">
                    <th className="p-4">Local</th>
                    <th className="p-4">Propietario</th>
                    <th className="p-4">Correo Propietario</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#3A3A3A]/10 text-xs text-[#3A3A3A]">
                  {venuesToDisplay.map((venue) => (
                    <tr key={venue.id} className="hover:bg-[#F5F0E9]/30 transition-colors">
                      <td className="p-4 font-bold">{venue.name}</td>
                      <td className="p-4">
                        {venue.owner_name}
                        {venue.business_tax_id && <span className="sr-only">{venue.business_tax_id}</span>}
                      </td>
                      <td className="p-4 font-mono text-[10px]">{venue.owner_email}</td>
                      <td className="p-4">
                        <span className={`inline-block px-2 py-0.5 font-bold rounded text-[9px] uppercase ${
                          venue.verification_status === 'approved' ? 'bg-green-100 text-green-700' :
                          venue.verification_status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {venue.verification_status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelectedVenue(venue)}
                          className="px-3.5 py-1.5 bg-[#8367C7] hover:bg-[#6f53b3] text-[#F5F0E9] font-bold rounded-lg text-[10px] shadow transition-all cursor-pointer"
                        >
                          Ver Detalles
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Verification Details Modal */}
        {selectedVenue && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-[#3A3A3A]/15 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
              
              <div className="p-6 border-b border-[#3A3A3A]/10 bg-[#3A3A3A]/5 flex justify-between items-center">
                <div>
                  <h3 className="font-extrabold text-base text-[#3A3A3A]">Detalles de Verificación</h3>
                  <p className="text-xs text-[#8367C7] font-semibold">{selectedVenue.name}</p>
                </div>
                <button
                  onClick={closeModal}
                  className="text-[#3A3A3A]/60 hover:text-[#3A3A3A] font-bold text-lg cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex flex-col gap-5">
                
                {/* Owner details */}
                <div className="grid grid-cols-2 gap-4 text-xs bg-[#3A3A3A]/5 p-4 rounded-xl border border-[#3A3A3A]/5">
                  <div>
                    <span className="font-bold text-[#3A3A3A]/50 block">PROPIETARIO</span>
                    <span className="font-semibold text-[#3A3A3A]">{selectedVenue.owner_name}</span>
                  </div>
                  <div>
                    <span className="font-bold text-[#3A3A3A]/50 block">ID FISCAL (RFC / TAX ID)</span>
                    <span className="font-mono font-bold text-[#3A3A3A]">{selectedVenue.business_tax_id}</span>
                  </div>
                </div>

                {/* Public Contact details */}
                <div className="grid grid-cols-2 gap-4 text-xs bg-[#3A3A3A]/5 p-4 rounded-xl border border-[#3A3A3A]/5">
                  <div>
                    <span className="font-bold text-[#3A3A3A]/50 block">CORREO DE CONTACTO</span>
                    <span className="font-semibold text-[#3A3A3A]">{selectedVenue.contact_email || 'No provisto'}</span>
                  </div>
                  <div>
                    <span className="font-bold text-[#3A3A3A]/50 block">TELÉFONO DE CONTACTO</span>
                    <span className="font-semibold text-[#3A3A3A]">{selectedVenue.contact_phone || 'No provisto'}</span>
                  </div>
                </div>

                {/* Quick messaging links */}
                {(selectedVenue.contact_email || selectedVenue.contact_phone) && (
                  <div className="flex gap-3 text-xs">
                    {selectedVenue.contact_email && (
                      <a
                        href={`mailto:${selectedVenue.contact_email}`}
                        className="flex-1 py-2.5 bg-[#8367C7]/10 hover:bg-[#8367C7]/15 text-[#8367C7] font-bold rounded-xl text-center border border-[#8367C7]/20 transition-all flex items-center justify-center gap-1.5"
                      >
                        <svg className="w-3.5 h-3.5 text-current fill-none stroke-current" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                        </svg>
                        <span>Enviar correo</span>
                      </a>
                    )}
                    {selectedVenue.contact_phone && (
                      <a
                        href={`https://wa.me/${selectedVenue.contact_phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2.5 bg-green-600/10 hover:bg-green-600/15 text-green-700 font-bold rounded-xl text-center border border-green-600/20 transition-all flex items-center justify-center gap-1.5"
                      >
                        <svg className="w-3.5 h-3.5 text-current fill-none stroke-current" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                        </svg>
                        <span>WhatsApp</span>
                      </a>
                    )}
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-[#3A3A3A]/80">Permiso de Operación</span>
                  {selectedVenue.verification_proof ? (
                    <div className="border border-[#3A3A3A]/10 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center h-48 relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={selectedVenue.verification_proof}
                        alt="Permiso de Operación"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="p-8 border border-dashed border-[#3A3A3A]/20 rounded-xl text-center text-xs text-[#3A3A3A]/50">
                      Sin comprobante de operación.
                    </div>
                  )}
                </div>

                {showRejectForm && (
                  <div className="flex flex-col gap-2 p-4 bg-[#FF9E8A]/10 border border-[#FF9E8A]/20 rounded-xl">
                    <label htmlFor="rejection-reason" className="text-xs font-bold text-[#3A3A3A]">Motivo de Rechazo</label>
                    <textarea
                      id="rejection-reason"
                      placeholder="Motivo del rechazo (ej. Documento borroso o vencido)"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={2}
                      className="w-full p-2.5 border border-[#3A3A3A]/20 rounded-lg text-xs text-[#3A3A3A] focus:outline-none focus:border-[#FF9E8A] bg-white resize-none"
                    />
                    <div className="flex gap-2 justify-end mt-1">
                      <button
                        onClick={() => setShowRejectForm(false)}
                        className="px-3 py-1.5 text-xs font-bold text-[#3A3A3A]/60 hover:text-[#3A3A3A] cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => handleReject(selectedVenue.id)}
                        disabled={loadingAction}
                        className="px-4 py-1.5 bg-[#FF9E8A] hover:bg-[#ff8973] disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow cursor-pointer"
                      >
                        Confirmar Rechazo
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {!showRejectForm && selectedVenue.verification_status === 'pending' && (
                <div className="p-6 border-t border-[#3A3A3A]/10 bg-[#3A3A3A]/5 flex gap-3">
                  <button
                    onClick={() => setShowRejectForm(true)}
                    disabled={loadingAction}
                    className="flex-1 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm shadow cursor-pointer transition-colors"
                  >
                    Rechazar
                  </button>
                  <button
                    onClick={() => handleApprove(selectedVenue.id)}
                    disabled={loadingAction}
                    className="flex-1 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm shadow cursor-pointer transition-colors"
                  >
                    Aprobar
                  </button>
                </div>
              )}

            </div>
          </div>
        )}

      </main>
    </div>
  )
}

