'use client'

import React, { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (res?.error) {
        setError('Credenciales inválidas. Inténtalo de nuevo.')
      } else {
        router.push(callbackUrl)
      }
    } catch (err) {
      console.error(err)
      setError('Ocurrió un error al intentar iniciar sesión.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError('')
    try {
      await signIn('google', { callbackUrl })
    } catch (err) {
      console.error(err)
      setError('Error al conectar con Google.')
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
          <h2 className="mt-2 text-xl font-extrabold text-[#3A3A3A]">Inicia Sesión en tu Cuenta</h2>
          <p className="text-xs text-[#3A3A3A]/60">Accede a tus locales favoritos, perfil y dashboard.</p>
        </div>

        {error && (
          <div className="bg-[#FF9E8A]/10 border border-[#FF9E8A]/20 text-[#3A3A3A] p-3 rounded-xl text-xs font-bold">
            ⚠️ {error}
          </div>
        )}

        <form className="flex flex-col gap-4" onSubmit={handleCredentialsSubmit}>
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

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-xs font-bold text-[#3A3A3A]/85">Contraseña</label>
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#8367C7] hover:bg-[#6f53b3] disabled:opacity-50 text-[#F5F0E9] font-bold rounded-xl shadow-md transition-all duration-200 cursor-pointer text-center text-sm"
          >
            {loading ? 'Iniciando Sesión...' : 'Entrar'}
          </button>
        </form>

        <div className="relative flex items-center justify-center my-1">
          <div className="border-t border-[#3A3A3A]/10 w-full"></div>
          <span className="absolute bg-[#F5F0E9] px-3 text-[10px] font-bold text-[#3A3A3A]/40 uppercase">O continuar con</span>
        </div>

        {/* Google Sign-In Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full py-3 bg-white hover:bg-[#3A3A3A]/5 border border-[#3A3A3A]/15 text-[#3A3A3A] font-extrabold rounded-xl shadow-sm transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 text-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69a5.74 5.74 0 0 1-2.49 3.77v3.12h4.02c2.34-2.16 3.69-5.32 3.69-8.74z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-4.02-3.12c-1.12.75-2.55 1.19-3.91 1.19-3.01 0-5.56-2.03-6.47-4.76H1.4v3.22A12 12 0 0 0 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.53 14.4c-.24-.72-.38-1.48-.38-2.4s.14-1.68.38-2.4V6.38H1.4A11.94 11.94 0 0 0 0 12c0 1.92.45 3.74 1.4 5.62l4.13-3.22z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.37 2.62 1.4 6.38l4.13 3.22c.91-2.73 3.46-4.85 6.47-4.85z"
            />
          </svg>
          Iniciar sesión con Google
        </button>

      </div>
    </div>
  )
}
