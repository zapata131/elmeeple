'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { registerUser } from '@/app/actions/register'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'player' | 'partner'>('player')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // 1. Call the register user Server Action
      const res = await registerUser({ name, email, password, role })

      if (!res.success) {
        setError(res.error || 'Ocurrió un error al crear tu cuenta.')
        setLoading(false)
        return
      }

      // 2. Automatically sign in the user after successful registration
      const loginRes = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (loginRes?.error) {
        // If auto-login fails, redirect to login page with a registered flag
        router.push('/login?registered=true')
      } else {
        // Redirect to homepage or onboarding depending on role
        if (role === 'partner') {
          router.push('/onboarding')
        } else {
          router.push('/')
        }
      }
    } catch (err) {
      console.error(err)
      setError('Ocurrió un error inesperado al intentar registrarte.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F0E9] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      
      {/* Back link */}
      <div className="absolute top-6 left-6 z-20">
        <Link href="/" className="flex items-center gap-1.5 text-sm font-extrabold text-[#8367C7] hover:underline cursor-pointer">
          ← Volver al Mapa
        </Link>
      </div>

      <div className="max-w-md w-full flex flex-col gap-8 bg-[#F5F0E9] border border-[#3A3A3A]/10 shadow-2xl rounded-2xl p-8 backdrop-blur-md bg-opacity-95">
        
        {/* Header */}
        <div className="text-center flex flex-col items-center gap-2">
          <Link href="/" className="flex items-center gap-2 group">
            <svg className="w-8 h-8 text-[#8367C7] fill-current transition-transform group-hover:scale-105" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
              <path d="M256 54.99c-27 0-46.418 14.287-57.633 32.23-10.03 16.047-14.203 34.66-15.017 50.962-30.608 15.135-64.515 30.394-91.815 45.994-14.32 8.183-26.805 16.414-36.203 25.26C45.934 218.28 39 228.24 39 239.99c0 5 2.44 9.075 5.19 12.065 2.754 2.99 6.054 5.312 9.812 7.48 7.515 4.336 16.99 7.95 27.412 11.076 15.483 4.646 32.823 8.1 47.9 9.577-14.996 25.84-34.953 49.574-52.447 72.315C56.65 378.785 39 403.99 39 431.99c0 4-.044 7.123.31 10.26.355 3.137 1.256 7.053 4.41 10.156 3.155 3.104 7.017 3.938 10.163 4.28 3.146.345 6.315.304 10.38.304h111.542c8.097 0 14.026.492 20.125-3.43 6.1-3.92 8.324-9.275 12.67-17.275l.088-.16.08-.166s9.723-19.77 21.324-39.388c5.8-9.808 12.097-19.576 17.574-26.498 2.74-3.46 5.304-6.204 7.15-7.754.564-.472.82-.56 1.184-.76.363.2.62.288 1.184.76 1.846 1.55 4.41 4.294 7.15 7.754 5.477 6.922 11.774 16.69 17.574 26.498 11.6 19.618 21.324 39.387 21.324 39.387l.08.165.088.16c4.346 8 6.55 13.323 12.61 17.254 6.058 3.93 11.974 3.45 19.957 3.45H448c4 0 7.12.043 10.244-.304 3.123-.347 6.998-1.21 10.12-4.332 3.12-3.122 3.984-6.997 4.33-10.12.348-3.122.306-6.244.306-10.244 0-28-17.65-53.205-37.867-79.488-17.493-22.74-37.45-46.474-52.447-72.315 15.077-1.478 32.417-4.93 47.9-9.576 10.422-3.125 19.897-6.74 27.412-11.075 3.758-2.168 7.058-4.49 9.81-7.48 2.753-2.99 5.192-7.065 5.192-12.065 0-11.75-6.934-21.71-16.332-30.554-9.398-8.846-21.883-17.077-36.203-25.26-27.3-15.6-61.207-30.86-91.815-45.994-.814-16.3-4.988-34.915-15.017-50.96C302.418 69.276 283 54.99 256 54.99z" />
            </svg>
            <span className="text-2xl font-extrabold text-[#3A3A3A]">El Meeple</span>
          </Link>
          <h2 className="mt-2 text-xl font-extrabold text-[#3A3A3A]">Crea tu Cuenta</h2>
          <p className="text-xs text-[#3A3A3A]/60">Únete a la comunidad de juegos de mesa más grande de México.</p>
        </div>

        {error && (
          <div className="bg-[#FF9E8A]/10 border border-[#FF9E8A]/20 text-[#3A3A3A] p-3 rounded-xl text-xs font-bold flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[#FF9E8A] flex-shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
            <span>{error}</span>
          </div>
        )}

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          
          {/* Name Input */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-xs font-bold text-[#3A3A3A]/85">Nombre Completo</label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. José Zapata"
              className="w-full p-3 border border-[#3A3A3A]/20 bg-[#F5F0E9] rounded-xl text-sm text-[#3A3A3A] focus:outline-none focus:border-[#8367C7] transition-colors"
            />
          </div>

          {/* Email Input */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-xs font-bold text-[#3A3A3A]/85">Correo Electrónico</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ej. jose@elmeeple.com"
              className="w-full p-3 border border-[#3A3A3A]/20 bg-[#F5F0E9] rounded-xl text-sm text-[#3A3A3A] focus:outline-none focus:border-[#8367C7] transition-colors"
            />
          </div>

          {/* Password Input */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-xs font-bold text-[#3A3A3A]/85">Contraseña (Mín. 6 caracteres)</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-3 border border-[#3A3A3A]/20 bg-[#F5F0E9] rounded-xl text-sm text-[#3A3A3A] focus:outline-none focus:border-[#8367C7] transition-colors"
            />
          </div>

          {/* Role Selector */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-[#3A3A3A]/85">¿Cómo vas a usar El Meeple?</span>
            <div className="grid grid-cols-2 gap-3 mt-1">
              <button
                type="button"
                onClick={() => setRole('player')}
                className={`p-3 rounded-xl border text-center font-bold text-xs cursor-pointer transition-all flex flex-col items-center justify-center ${
                  role === 'player'
                    ? 'bg-[#8367C7]/15 border-[#8367C7] text-[#8367C7]'
                    : 'bg-white border-[#3A3A3A]/15 text-[#3A3A3A]/70 hover:bg-[#3A3A3A]/5'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mb-1 text-current"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0zM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                <div>Jugador</div>
                <div className="text-[9px] font-medium opacity-70 mt-0.5">Buscar locales y ludotecas</div>
              </button>

              <button
                type="button"
                onClick={() => setRole('partner')}
                className={`p-3 rounded-xl border text-center font-bold text-xs cursor-pointer transition-all flex flex-col items-center justify-center ${
                  role === 'partner'
                    ? 'bg-[#8367C7]/15 border-[#8367C7] text-[#8367C7]'
                    : 'bg-white border-[#3A3A3A]/15 text-[#3A3A3A]/70 hover:bg-[#3A3A3A]/5'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mb-1 text-current"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 0-.75-.75h-1.5a.75.75 0 0 0-.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 0V21m.75-12h13.5m-12.75 0V5.25A2.25 2.25 0 0 1 4.75 3h10.5a2.25 2.25 0 0 1 2.25 2.25V9" /></svg>
                <div>Socio (Negocio)</div>
                <div className="text-[9px] font-medium opacity-70 mt-0.5">Registrar y gestionar local</div>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#8367C7] hover:bg-[#6f53b3] disabled:opacity-50 text-[#F5F0E9] font-bold rounded-xl shadow-md transition-all duration-200 cursor-pointer text-center text-sm mt-2"
          >
            {loading ? 'Registrando...' : 'Crear Cuenta'}
          </button>
        </form>

        <div className="text-center text-xs text-[#3A3A3A]/60">
          ¿Ya tienes una cuenta?{' '}
          <Link href="/login" className="font-extrabold text-[#8367C7] hover:underline">
            Inicia Sesión
          </Link>
        </div>

      </div>
    </div>
  )
}
