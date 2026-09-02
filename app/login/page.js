'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(event) {
    event.preventDefault()

    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-700 p-3 font-bold sm:p-6">

      <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-white p-5 shadow-sm sm:p-8">

        <h1 className="text-center text-2xl font-bold text-black sm:text-3xl">
          Finanzas App
        </h1>

        <p className="mt-2 text-center text-sm text-gray-500 sm:text-base">
          Iniciá sesión
        </p>

        <form onSubmit={handleLogin} className="mt-6 space-y-5 sm:mt-8">

          {/* EMAIL */}
          <div>
            <label className="mb-2 block text-black">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              autoComplete="email"
              className="w-full rounded-lg border border-gray-700 bg-white p-3 text-gray-700 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-gray-600"
            />
          </div>

          {/* CONTRASEÑA */}
          <div>
            <label className="mb-2 block text-black">
              Contraseña
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-gray-700 bg-white p-3 text-gray-700 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-gray-600"
            />
          </div>

          {/* ERROR */}
          {error && (
            <div className="rounded-lg bg-red-100 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* BOTÓN */}
          <button
            type="submit"
            disabled={loading}
            className="min-h-12 w-full rounded-lg bg-gray-700 p-3 text-white hover:bg-gray-600 disabled:opacity-50"
          >
            {loading ? 'Ingresando...' : 'Iniciar sesión'}
          </button>

        </form>

      </div>

    </main>
  )
}