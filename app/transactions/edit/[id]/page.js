'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'

const categories = [
  'Comida',
  'Supermercado',
  'Transporte',
  'Combustible',
  'Vivienda',
  'Servicios',
  'Salud',
  'Educación',
  'Entretenimiento',
  'Ropa',
  'Tecnología',
  'Viajes',
  'Trabajo',
  'Ahorro',
  'Otros',
]

export default function EditTransactionPage() {
  const router = useRouter()
  const params = useParams()

  const [type, setType] = useState('expense')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [date, setDate] = useState('')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadTransaction() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('Transactions')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) {
        console.error(error)
        setError('No se pudo cargar el movimiento.')
        setLoading(false)
        return
      }

      setType(data.type)
      setAmount(data.amount)
      setDescription(data.description || '')
      setCategory(data.category || '')
      setDate(data.date)

      setLoading(false)
    }

    if (params?.id) {
      loadTransaction()
    }
  }, [params, router])

  async function handleSubmit(event) {
    event.preventDefault()

    setSaving(true)
    setError('')

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const { error } = await supabase
      .from('Transactions')
      .update({
        type,
        amount: Number(amount),
        description,
        category,
        date,
      })
      .eq('id', params.id)
      .eq('user_id', user.id)

    if (error) {
      console.error(error)
      setError(error.message)
      setSaving(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-700 p-3 font-bold sm:p-6">
        <p className="text-white">
          Cargando movimiento...
        </p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-700 p-3 font-bold sm:p-6">
      <div className="mx-auto max-w-xl">

        {/* VOLVER */}
        <button
          onClick={() => router.push('/')}
          className="mb-5 text-sm text-gray-400 hover:text-white sm:mb-6"
        >
          ← Volver
        </button>

        {/* TARJETA */}
        <div className="rounded-2xl border border-gray-800 bg-white p-5 shadow-sm sm:p-8">

          <h1 className="text-2xl font-bold text-black sm:text-3xl">
            Editar movimiento
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Modificá los datos del movimiento
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5 sm:mt-8">

            {/* TIPO */}
            <div>
              <label className="mb-2 block text-black">
                Tipo
              </label>

              <div className="grid grid-cols-2 gap-3">

                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`min-h-12 rounded-lg border p-3 ${
                    type === 'expense'
                      ? 'border-red-600 bg-red-600 text-white'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Gasto
                </button>

                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`min-h-12 rounded-lg border p-3 ${
                    type === 'income'
                      ? 'border-green-600 bg-green-600 text-white'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Ingreso
                </button>

              </div>
            </div>

            {/* MONTO */}
            <div>
              <label className="mb-2 block text-black">
                Monto
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-700 bg-white p-3 text-gray-700 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-gray-600"
              />
            </div>

            {/* DESCRIPCIÓN */}
            <div>
              <label className="mb-2 block text-black">
                Descripción
              </label>

              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ej: Compra supermercado, combustible"
                className="w-full rounded-lg border border-gray-700 bg-white p-3 text-gray-700 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-gray-600"
              />
            </div>

            {/* CATEGORÍA */}
            <div>
              <label className="mb-2 block text-black">
                Categoría
              </label>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-700 bg-white p-3 text-gray-700 outline-none focus:ring-2 focus:ring-gray-600"
              >
                <option value="" className="font-bold">
                  Seleccioná una categoría
                </option>

                {categories.map((item) => (
                  <option
                    key={item}
                    value={item}
                    className="font-bold"
                  >
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {/* FECHA */}
            <div>
              <label className="mb-2 block text-black">
                Fecha
              </label>

              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-700 bg-white p-3 text-gray-700 outline-none focus:ring-2 focus:ring-gray-600"
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
              disabled={saving}
              className="min-h-12 w-full rounded-lg bg-gray-700 p-3 text-white hover:bg-gray-600 disabled:opacity-50"
            >
              {saving
                ? 'Guardando...'
                : 'Guardar cambios'}
            </button>

          </form>

        </div>
      </div>
    </main>
  )
}