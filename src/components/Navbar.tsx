'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Navbar() {
  const { data: session } = useSession()
  const router = useRouter()

  const [dropdownOpen, setDropdownOpen] = useState(false)
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
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6 text-[#8367C7] flex-shrink-0"
          >
            <circle cx="12" cy="4.5" r="2.75" />
            <path d="M12,8.5 c-2.5,0 -4.5,1.2 -5.5,3.5 L4.3,16.8 c-0.4,0.8 0.2,1.7 1.1,1.7 h2.1 v4.3 c0,0.7 0.6,1.2 1.3,1.2 h1.7 l1.5,-4.5 1.5,4.5 h1.7 c0.7,0,1.3,-0.5 1.3,-1.2 v-4.3 h2.1 c0.9,0 1.5,-0.9 1.1,-1.7 l-2.2,-4.8 c-1,-2.3 -3,-3.5 -5.5,-3.5 z" />
          </svg>
          <span className="text-lg md:text-xl font-black text-[#3A3A3A] tracking-tight">El Meeple</span>
        </Link>

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
                    Mi Perfil
                  </Link>

                  {/* Partner Dashboard link */}
                  {userRole === 'partner' && (
                    <Link
                      href="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-[#8367C7] hover:bg-[#8367C7]/5 transition-colors"
                    >
                      Mi Panel de Socio
                    </Link>
                  )}

                  {/* Admin Dashboard link */}
                  {userRole === 'admin' && (
                    <Link
                      href="/admin"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-[#FF9E8A] hover:bg-[#FF9E8A]/5 transition-colors"
                    >
                      Administración
                    </Link>
                  )}

                  <div className="border-t border-[#3A3A3A]/10 my-1"></div>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-500/5 transition-colors cursor-pointer"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>
    </>
  )
}
