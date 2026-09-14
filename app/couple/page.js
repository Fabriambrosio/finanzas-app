'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function CouplePage() {
  const router = useRouter()

  const [code, setCode] = useState('')
  const [generatedCode, setGeneratedCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function generateCode() {
    setLoading(true)
    setError('')
    setSuccess('')

    const { data: sessionData } = await supabase.auth.getSession()

    console.log('SESION:', sessionData.session)

    const { data, error } = await supabase.rpc(
      'create_couple_invitation'
    )

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setGeneratedCode(data)
    setSuccess('Código generado correctamente.')
    setLoading(false)
  }

  async function acceptCode() {
    setLoading(true)
    setError('')
    setSuccess('')

    const { error } = await supabase.rpc(
      'accept_couple_invitation',
      {
        invitation_code: code,
      }
    )

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess('¡Vinculación realizada correctamente!')

    setTimeout(() => {
      router.push('/')
    }, 1500)

    setLoading(false)
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-700 p-3 sm:p-6">

      <div className="w-full max-w-md space-y-5">

        <div className="rounded-2xl border border-gray-800 bg-white p-5 shadow-sm sm:p-8">

          <h1 className="text-center text-2xl font-bold text-black sm:text-3xl">
            Vincular con mi pareja
          </h1>

          <p className="mt-2 text-center text-sm text-gray-500">
            Podés generar un código para compartir o ingresar uno que te hayan enviado.
          </p>

          <div className="mt-8">

            <h2 className="text-lg font-bold text-black">
              ✨ Generar un código
            </h2>

            <button
              type="button"
              onClick={generateCode}
              disabled={loading}
              className="mt-3 min-h-12 w-full rounded-lg bg-gray-700 p-3 text-white hover:bg-gray-600 disabled:opacity-50"
            >
              {loading ? 'Generando...' : 'Generar código'}
            </button>

            {generatedCode && (
              <div className="mt-4 rounded-xl bg-gray-100 p-4 text-center">
                <p className="text-sm text-gray-500">
                  Compartí este código con tu pareja:
                </p>

                <p className="mt-2 text-2xl font-bold tracking-wider text-black">
                  {generatedCode}
                </p>
              </div>
            )}

          </div>

          <div className="my-8 border-t border-gray-200" />

          <div>

            <h2 className="text-lg font-bold text-black">
              🔗 Tengo un código
            </h2>

            <input
              type="text"
              value={code}
              onChange={(e) =>
                setCode(e.target.value.toUpperCase())
              }
              placeholder="Ej: FBR-7K29X"
              className="mt-3 w-full rounded-lg border border-gray-700 bg-white p-3 text-gray-700 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-gray-600"
            />

            <button
              type="button"
              onClick={acceptCode}
              disabled={loading || !code.trim()}
              className="mt-3 min-h-12 w-full rounded-lg bg-gray-700 p-3 text-white hover:bg-gray-600 disabled:opacity-50"
            >
              {loading ? 'Vinculando...' : 'Vincular cuenta'}
            </button>

          </div>

          {error && (
            <div className="mt-5 rounded-lg bg-red-100 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-5 rounded-lg bg-green-100 p-3 text-sm text-green-700">
              {success}
            </div>
          )}

          <button
            type="button"
            onClick={() => router.push('/')}
            className="mt-6 w-full p-2 text-sm text-gray-600 hover:text-black"
          >
            Volver a Finanzas App
          </button>

        </div>

      </div>

    </main>
  )
}