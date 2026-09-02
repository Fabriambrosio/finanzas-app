'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleRegister(event) {
    event.preventDefault()

    setError('')
    setSuccess('')

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(
      'Cuenta creada correctamente. Revisá tu email para confirmar la cuenta si es necesario.'
    )

    setLoading(false)
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-700 p-3 font-bold sm:p-6">

      <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-white p-5 shadow-sm sm:p-8">

        <h1 className="text-center text-2xl font-bold text-black sm:text-3xl">
          Finanzas App
        </h1>

        <p className="mt-2 text-center text-sm text-gray-500 sm:text-base">
          Crear una cuenta
        </p>

        <form onSubmit={handleRegister} className="mt-6 space-y-5 sm:mt-8">

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

          <div>
            <label className="mb-2 block text-black">
              Contraseña
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
              autoComplete="new-password"
              className="w-full rounded-lg border border-gray-700 bg-white p-3 text-gray-700 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-gray-600"
            />
          </div>

          <div>
            <label className="mb-2 block text-black">
              Repetir contraseña
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repetí tu contraseña"
              required
              autoComplete="new-password"
              className="w-full rounded-lg border border-gray-700 bg-white p-3 text-gray-700 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-gray-600"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-100 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-lg bg-green-100 p-3 text-sm text-green-700">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="min-h-12 w-full rounded-lg bg-gray-700 p-3 text-white hover:bg-gray-600 disabled:opacity-50"
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>

          <button
            type="button"
            onClick={() => router.push('/login')}
            className="w-full p-2 text-sm text-gray-600 hover:text-black"
          >
            Ya tengo una cuenta
          </button>

        </form>

      </div>

    </main>
  )
}