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
          <Link href="/" className="flex items-center gap-2">
            <span className="text-3xl">🎲</span>
            <span className="text-2xl font-extrabold text-[#3A3A3A]">El Meeple</span>
          </Link>
          <h2 className="mt-2 text-xl font-extrabold text-[#3A3A3A]">Crea tu Cuenta</h2>
          <p className="text-xs text-[#3A3A3A]/60">Únete a la comunidad de juegos de mesa más grande de México.</p>
        </div>

        {error && (
          <div className="bg-[#FF9E8A]/10 border border-[#FF9E8A]/20 text-[#3A3A3A] p-3 rounded-xl text-xs font-bold">
            ⚠️ {error}
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
                className={`p-3 rounded-xl border text-center font-bold text-xs cursor-pointer transition-all ${
                  role === 'player'
                    ? 'bg-[#8367C7]/15 border-[#8367C7] text-[#8367C7]'
                    : 'bg-white border-[#3A3A3A]/15 text-[#3A3A3A]/70 hover:bg-[#3A3A3A]/5'
                }`}
              >
                <div className="text-lg mb-0.5">👤</div>
                <div>Jugador</div>
                <div className="text-[9px] font-medium opacity-70 mt-0.5">Buscar locales y ludotecas</div>
              </button>

              <button
                type="button"
                onClick={() => setRole('partner')}
                className={`p-3 rounded-xl border text-center font-bold text-xs cursor-pointer transition-all ${
                  role === 'partner'
                    ? 'bg-[#8367C7]/15 border-[#8367C7] text-[#8367C7]'
                    : 'bg-white border-[#3A3A3A]/15 text-[#3A3A3A]/70 hover:bg-[#3A3A3A]/5'
                }`}
              >
                <div className="text-lg mb-0.5">🏪</div>
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
