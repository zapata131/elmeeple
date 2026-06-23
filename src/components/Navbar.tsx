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
            viewBox="0 0 512 512"
            fill="currentColor"
            className="w-6 h-6 text-[#8367C7] flex-shrink-0"
          >
            <path d="M256 54.99c-27 0-46.418 14.287-57.633 32.23-10.03 16.047-14.203 34.66-15.017 50.962-30.608 15.135-64.515 30.394-91.815 45.994-14.32 8.183-26.805 16.414-36.203 25.26C45.934 218.28 39 228.24 39 239.99c0 5 2.44 9.075 5.19 12.065 2.754 2.99 6.054 5.312 9.812 7.48 7.515 4.336 16.99 7.95 27.412 11.076 15.483 4.646 32.823 8.1 47.9 9.577-14.996 25.84-34.953 49.574-52.447 72.315C56.65 378.785 39 403.99 39 431.99c0 4-.044 7.123.31 10.26.355 3.137 1.256 7.053 4.41 10.156 3.155 3.104 7.017 3.938 10.163 4.28 3.146.345 6.315.304 10.38.304h111.542c8.097 0 14.026.492 20.125-3.43 6.1-3.92 8.324-9.275 12.67-17.275l.088-.16.08-.166s9.723-19.77 21.324-39.388c5.8-9.808 12.097-19.576 17.574-26.498 2.74-3.46 5.304-6.204 7.15-7.754.564-.472.82-.56 1.184-.76.363.2.62.288 1.184.76 1.846 1.55 4.41 4.294 7.15 7.754 5.477 6.922 11.774 16.69 17.574 26.498 11.6 19.618 21.324 39.387 21.324 39.387l.08.165.088.16c4.346 8 6.55 13.323 12.61 17.254 6.058 3.93 11.974 3.45 19.957 3.45H448c4 0 7.12.043 10.244-.304 3.123-.347 6.998-1.21 10.12-4.332 3.12-3.122 3.984-6.997 4.33-10.12.348-3.122.306-6.244.306-10.244 0-28-17.65-53.205-37.867-79.488-17.493-22.74-37.45-46.474-52.447-72.315 15.077-1.478 32.417-4.93 47.9-9.576 10.422-3.125 19.897-6.74 27.412-11.075 3.758-2.168 7.058-4.49 9.81-7.48 2.753-2.99 5.192-7.065 5.192-12.065 0-11.75-6.934-21.71-16.332-30.554-9.398-8.846-21.883-17.077-36.203-25.26-27.3-15.6-61.207-30.86-91.815-45.994-.814-16.3-4.988-34.915-15.017-50.96C302.418 69.276 283 54.99 256 54.99z" />
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
              Iniciar sesión o registrarse
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
                    <span className="inline-block px-1.5 py-0.5 text-[8px] font-extrabold bg-[#8367C7]/15 text-[#8367C7] rounded mt-1">
                      {userRole === 'admin' ? 'Administrador' : userRole === 'partner' ? 'Socio' : 'Jugador'}
                    </span>
                  </div>

                  <Link
                    href="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-[#3A3A3A]/80 hover:bg-[#3A3A3A]/5 transition-colors"
                  >
                    Mi perfil
                  </Link>

                  {/* Partner Dashboard link */}
                  {userRole === 'partner' && (
                    <Link
                      href="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-[#8367C7] hover:bg-[#8367C7]/5 transition-colors"
                    >
                      Mi panel de socio
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
                    Cerrar sesión
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
