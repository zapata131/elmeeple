'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Navbar() {
  const { data: session } = useSession()
  const router = useRouter()

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleRegisterLocalClick = () => {
    if (!session) {
      setShowModal(true)
    } else {
      router.push('/onboarding')
    }
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' })
  }

  // Helper to get initials
  const getInitials = () => {
    if (!session?.user?.name) return 'U'
    return session.user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
  }

  const userRole = (session?.user as unknown as { role?: string })?.role || 'player'

  return (
    <>
      {/* Navbar container */}
      <header className="sticky top-0 z-50 w-full bg-[#F5F0E9]/80 backdrop-blur-md border-b border-[#3A3A3A]/10 shadow-sm px-4 md:px-8 py-3 flex items-center justify-between">
        
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <span className="text-2xl" role="img" aria-label="die">🎲</span>
          <span className="text-lg md:text-xl font-black text-[#3A3A3A] tracking-tight">El Meeple</span>
        </Link>

        {/* Center: Register Local CTA */}
        <div>
          <button
            onClick={handleRegisterLocalClick}
            className="px-4 py-2 bg-[#8367C7] hover:bg-[#6f53b3] text-[#F5F0E9] font-extrabold rounded-xl transition-all duration-200 cursor-pointer shadow-md text-xs md:text-sm flex items-center gap-1.5"
          >
            <span>🏪</span> Registrar mi Local
          </button>
        </div>

        {/* Right: Auth states */}
        <div className="flex items-center gap-4">
          {!session ? (
            <Link
              href="/login"
              className="px-4 py-2 bg-white hover:bg-[#3A3A3A]/5 border border-[#3A3A3A]/15 text-[#3A3A3A]/80 font-bold rounded-xl transition-all duration-200 text-xs md:text-sm cursor-pointer shadow-sm"
            >
              Iniciar Sesión / Registrarse
            </Link>
          ) : (
            <div className="relative" ref={dropdownRef}>
              {/* User Avatar Trigger */}
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-10 h-10 rounded-full bg-[#8367C7] hover:bg-[#6f53b3] text-[#F5F0E9] font-black text-sm flex items-center justify-center cursor-pointer shadow-md border-2 border-white transition-all"
                aria-label="User Menu"
              >
                {getInitials()}
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[#F5F0E9] border border-[#3A3A3A]/15 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2.5 border-b border-[#3A3A3A]/10">
                    <p className="text-xs font-bold text-[#3A3A3A] truncate">{session.user?.name}</p>
                    <p className="text-[10px] text-[#3A3A3A]/60 truncate mt-0.5">{session.user?.email}</p>
                    <span className="inline-block px-1.5 py-0.5 text-[8px] font-extrabold bg-[#8367C7]/15 text-[#8367C7] rounded mt-1 uppercase">
                      {userRole}
                    </span>
                  </div>

                  <Link
                    href="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-[#3A3A3A]/80 hover:bg-[#3A3A3A]/5 transition-colors"
                  >
                    <span>👤</span> Mi Perfil
                  </Link>

                  {/* Partner Dashboard link */}
                  {userRole === 'partner' && (
                    <Link
                      href="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-[#8367C7] hover:bg-[#8367C7]/5 transition-colors"
                    >
                      <span>🏪</span> Mi Panel de Socio
                    </Link>
                  )}

                  {/* Admin Dashboard link */}
                  {userRole === 'admin' && (
                    <Link
                      href="/admin"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-[#FF9E8A] hover:bg-[#FF9E8A]/5 transition-colors"
                    >
                      <span>🛡️</span> Administración
                    </Link>
                  )}

                  <div className="border-t border-[#3A3A3A]/10 my-1"></div>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-500/5 transition-colors cursor-pointer"
                  >
                    <span>🚪</span> Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Guest registration prompt modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setShowModal(false)}
          />

          {/* Modal Content */}
          <div
            data-testid="registration-modal"
            className="relative bg-[#F5F0E9] border border-[#3A3A3A]/15 rounded-3xl shadow-2xl p-6 md:p-8 max-w-sm w-full z-10 flex flex-col gap-6 text-center transform transition-all duration-300 animate-in zoom-in-95"
          >
            <div className="text-4xl">🎲</div>
            <div>
              <h3 className="text-xl font-black text-[#3A3A3A] tracking-tight">¡Únete a El Meeple!</h3>
              <p className="text-xs text-[#3A3A3A]/75 leading-relaxed mt-2">
                Para registrar tu negocio y aparecer en el mapa, primero debes crear una cuenta. Es rápido y 100% gratis.
              </p>
            </div>

            <div className="flex flex-col gap-2.5">
              <Link
                href="/register"
                onClick={() => setShowModal(false)}
                className="w-full py-3 bg-[#8367C7] hover:bg-[#6f53b3] text-[#F5F0E9] font-extrabold rounded-xl shadow-md text-xs transition-all text-center"
              >
                Crear Cuenta
              </Link>
              <Link
                href="/login"
                onClick={() => setShowModal(false)}
                className="w-full py-3 bg-white hover:bg-[#3A3A3A]/5 border border-[#3A3A3A]/15 text-[#3A3A3A] font-bold rounded-xl shadow-sm text-xs transition-all text-center"
              >
                Iniciar Sesión
              </Link>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-[#3A3A3A]/40 hover:text-[#3A3A3A]/80 cursor-pointer p-1 rounded-full hover:bg-[#3A3A3A]/5 transition-all"
              aria-label="Cerrar modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
