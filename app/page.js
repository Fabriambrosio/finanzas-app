
'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase/client'
import ExpensesByCategoryChart from '../components/ExpensesByCategoryChart'

const currency = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})

const monthFormatter = new Intl.DateTimeFormat('es-AR', {
  month: 'long',
  year: 'numeric',
})

export default function Home() {
  const router = useRouter()

  const [user, setUser] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [partnerId, setPartnerId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Arrancamos en el mes actual
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date()

    return new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    )
  })

  const [transactionFilter, setTransactionFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [graphView, setGraphView] = useState('mine')
  const isUser1 = user?.id === 'b545935b-17ae-4b00-8bc3-70c5227f913e'

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    setLoading(true)
    setError('')

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    setUser(user)

const { data: coupleData, error: coupleError } = await supabase
  .from('Couples')
  .select('user_id_1, user_id_2')
  .maybeSingle()

if (coupleError) {
  setError(coupleError.message)
  setLoading(false)
  return
}

const detectedPartnerId = coupleData
  ? coupleData.user_id_1 === user.id
    ? coupleData.user_id_2
    : coupleData.user_id_1
  : null

setPartnerId(detectedPartnerId)
console.log('MI ID:', user.id)
console.log('ID DE ELLA:', detectedPartnerId)

const userIds = detectedPartnerId
  ? [user.id, detectedPartnerId]
  : [user.id]

const { data, error } = await supabase
  .from('Transactions')
  .select('*')
  .in('user_id', userIds)
  .order('date', { ascending: false })
  .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
console.log('TRANSACCIONES:', data)
    setTransactions(data || [])
    setLoading(false)
  }

  function changeMonth(amount) {
    setSelectedMonth(
      new Date(
        selectedMonth.getFullYear(),
        selectedMonth.getMonth() + amount,
        1
      )
    )
  }
const monthlyTransactions = useMemo(() => {
  const year = selectedMonth.getFullYear()
  const month = selectedMonth.getMonth()

  return transactions.filter((transaction) => {
    const transactionDate = new Date(`${transaction.date}T00:00:00`)

    return (
      transaction.user_id === user.id &&
      transactionDate.getFullYear() === year &&
      transactionDate.getMonth() === month
    )
  })
}, [transactions, selectedMonth, user])

const monthlyAllTransactions = useMemo(() => {
  const year = selectedMonth.getFullYear()
  const month = selectedMonth.getMonth()

  return transactions.filter((transaction) => {
    const transactionDate = new Date(`${transaction.date}T00:00:00`)

    return (
      transactionDate.getFullYear() === year &&
      transactionDate.getMonth() === month
    )
  })
}, [transactions, selectedMonth])

const graphTransactions = monthlyAllTransactions.filter((transaction) => {
  console.log('GRAPH VIEW:', graphView)
console.log('GRAPH TRANSACTIONS:', monthlyAllTransactions)
  if (graphView === 'mine') {
    return transaction.user_id === user.id
  }

  if (graphView === 'partner') {
    return transaction.user_id === partnerId
  }

  return true
})

console.log('MES:', selectedMonth)
console.log('TODAS DEL MES:', monthlyAllTransactions)
console.log('GRAFICO FINAL:', graphTransactions)
console.log('PARTNER ID:', partnerId)

  const filteredTransactions = monthlyTransactions.filter((transaction) => {
    const matchesFilter =
      transactionFilter === 'all' ||
      transaction.type === transactionFilter

    const search = searchTerm.toLowerCase().trim()

    const matchesSearch =
      !search ||
      (transaction.description || '')
        .toLowerCase()
        .includes(search) ||
      (transaction.category || '')
        .toLowerCase()
        .includes(search)

    return matchesFilter && matchesSearch
  })

  const income = useMemo(() => {
    return monthlyTransactions
      .filter((transaction) => transaction.type === 'income')
      .reduce(
        (total, transaction) =>
          total + Number(transaction.amount),
        0
      )
  }, [monthlyTransactions])

  const expenses = useMemo(() => {
    return monthlyTransactions
      .filter((transaction) => transaction.type === 'expense')
      .reduce(
        (total, transaction) =>
          total + Number(transaction.amount),
        0
      )
  }, [monthlyTransactions])

  const accumulatedBalance = transactions
    .filter((transaction) => {
      const transactionDate = new Date(
        `${transaction.date}T00:00:00`
      )

      return (
  transaction.user_id === user.id &&
  transactionDate <= new Date(
    selectedMonth.getFullYear(),
    selectedMonth.getMonth() + 1,
    0
  )
)
    })
    .reduce((total, transaction) => {
      const amount = Number(transaction.amount)

      return transaction.type === 'income'
        ? total + amount
        : total - amount
    }, 0)

  const monthlySavings = income - expenses

  const savingsPercentage =
    income > 0
      ? Math.round((monthlySavings / income) * 100)
      : 0

  async function deleteTransaction(id) {
    const confirmed = window.confirm(
      '¿Seguro que querés eliminar este movimiento?'
    )

    if (!confirmed) return

    const { error } = await supabase
      .from('Transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      alert('No se pudo eliminar el movimiento.')
      return
    }

    setTransactions((current) =>
      current.filter((transaction) => transaction.id !== id)
    )
  }

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-700 p-6">
        <p className="font-bold text-white">
          Cargando...
        </p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black p-3 sm:p-6">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}
        <div className="mb-5 rounded-2xl border border-gray-800 bg-gray-950 p-4 text-white shadow-sm sm:mb-8 sm:p-6">

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">
                Finanzas App
              </h1>

              <p className="mt-1 text-sm text-gray-400 sm:text-base">
                Tus finanzas personales
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex">

              <button
                onClick={() => router.push('/transactions/new')}
                className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-blue-900 hover:bg-blue-50 sm:px-4 sm:text-base"
              >
                + Agregar movimiento
              </button>

              <button
                onClick={logout}
                className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 sm:px-4 sm:text-base"
              >
                Salir
              </button>

            </div>

          </div>
        </div>

        {/* SELECTOR DE MES */}
        <div className="mb-5 flex items-center justify-between rounded-xl border border-gray-800 bg-gray-950 p-3 shadow-sm sm:mb-6 sm:p-4">

          <button
            onClick={() => changeMonth(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-700 bg-gray-900 text-xl text-white hover:bg-gray-800 sm:h-auto sm:w-auto sm:px-4 sm:py-2"
          >
            ←
          </button>

          <div className="min-w-0 px-2 text-center">
            <p className="text-xs font-bold text-gray-400 sm:text-sm">
              Resumen
            </p>

            <h2 className="truncate text-base font-bold capitalize text-white sm:text-xl">
              {monthFormatter.format(selectedMonth)}
            </h2>
          </div>

          <button
            onClick={() => changeMonth(1)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-700 bg-gray-900 text-xl text-white hover:bg-gray-800 sm:h-auto sm:w-auto sm:px-4 sm:py-2"
          >
            →
          </button>

        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-5 rounded-lg bg-red-100 p-4 text-sm text-red-700 sm:mb-6">
            {error}
          </div>
        )}

        {/* RESUMEN */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">

          {/* SALDO */}
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 shadow-sm sm:p-5">
            <p className="text-xs font-bold text-blue-900 sm:text-sm">
              Saldo Acumulado
            </p>

            <p className="mt-2 break-words text-xl font-bold text-blue-900 sm:text-2xl">
              {currency.format(accumulatedBalance)}
            </p>
          </div>

          {/* INGRESOS */}
          <div className="rounded-xl border border-green-200 bg-green-50 p-4 shadow-sm sm:p-5">
            <p className="text-xs font-bold text-green-900 sm:text-sm">
              Ingresos
            </p>

            <p className="mt-2 break-words text-xl font-bold text-green-900 sm:text-2xl">
              {currency.format(income)}
            </p>
          </div>

          {/* GASTOS */}
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm sm:p-5">
            <p className="text-xs font-bold text-red-900 sm:text-sm">
              Gastos
            </p>

            <p className="mt-2 break-words text-xl font-bold text-red-900 sm:text-2xl">
              {currency.format(expenses)}
            </p>
          </div>

          {/* AHORRO */}
          <div className="rounded-xl border border-purple-200 bg-purple-50 p-4 shadow-sm sm:p-5">
            <p className="text-xs font-bold text-purple-900 sm:text-sm">
              Ahorro del mes
            </p>

            <p className="mt-2 break-words text-xl font-bold text-purple-900 sm:text-2xl">
              {currency.format(monthlySavings)}
            </p>

            <p className="mt-1 text-xs font-bold text-purple-700 sm:text-sm">
              {savingsPercentage}% de tus ingresos
            </p>
          </div>

        </div>

        {/* GRÁFICO */}
<div className="mt-6">

  <div className="mb-3 grid grid-cols-3 gap-2">
    <button
      onClick={() => setGraphView('mine')}
      className={`rounded-lg px-3 py-2 text-sm font-bold ${
        graphView === 'mine'
          ? 'bg-white text-black'
          : 'border border-gray-700 bg-gray-900 text-gray-300 hover:bg-gray-800'
      }`}
    >
      👤 Solo yo
    </button>

    <button
      onClick={() => setGraphView('partner')}
      className={`rounded-lg px-3 py-2 text-sm font-bold ${
        graphView === 'partner'
          ? 'bg-white text-black'
          : 'border border-gray-700 bg-gray-900 text-gray-300 hover:bg-gray-800'
      }`}
    >
      {isUser1 ? '👩 Solo ella' : '👨 Solo él'}
    </button>

    <button
      onClick={() => setGraphView('both')}
      className={`rounded-lg px-3 py-2 text-sm font-bold ${
        graphView === 'both'
          ? 'bg-white text-black'
          : 'border border-gray-700 bg-gray-900 text-gray-300 hover:bg-gray-800'
      }`}
    >
      👥 Ambos
    </button>
  </div>

  <ExpensesByCategoryChart
    transactions={graphTransactions}
  />

</div>
        {/* MOVIMIENTOS */}
        <div className="mt-6 rounded-xl border border-gray-800 bg-gray-950 shadow-sm">

          <div className="border-b border-gray-800 p-4 sm:p-5">

            <h2 className="text-xl font-bold text-white">
              Movimientos
            </h2>

            <p className="mt-1 text-sm text-gray-400">
              {monthlyTransactions.length} movimiento
              {monthlyTransactions.length !== 1 ? 's' : ''} en este mes
            </p>

            {/* BUSCADOR */}
            <div className="mt-4">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar movimiento..."
                className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-gray-600"
              />
            </div>

            {/* FILTROS */}
            <div className="mt-4 grid grid-cols-3 gap-2 sm:flex">

              <button
                onClick={() => setTransactionFilter('all')}
                className={`rounded-lg px-3 py-2 text-sm font-medium sm:px-4 ${
                  transactionFilter === 'all'
                    ? 'bg-white text-black'
                    : 'border border-gray-700 bg-gray-900 text-gray-300 hover:bg-gray-800'
                }`}
              >
                Todos
              </button>

              <button
                onClick={() => setTransactionFilter('income')}
                className={`rounded-lg px-3 py-2 text-sm font-medium sm:px-4 ${
                  transactionFilter === 'income'
                    ? 'bg-green-600 text-white'
                    : 'border border-gray-700 bg-gray-900 text-gray-300 hover:bg-gray-800'
                }`}
              >
                Ingresos
              </button>

              <button
                onClick={() => setTransactionFilter('expense')}
                className={`rounded-lg px-3 py-2 text-sm font-medium sm:px-4 ${
                  transactionFilter === 'expense'
                    ? 'bg-red-600 text-white'
                    : 'border border-gray-700 bg-gray-900 text-gray-300 hover:bg-gray-800'
                }`}
              >
                Gastos
              </button>

            </div>
          </div>

          {/* LISTA */}
          {filteredTransactions.length === 0 ? (

            <div className="p-8 text-center text-gray-500">
              {searchTerm
                ? 'No encontramos movimientos con esa búsqueda.'
                : 'No hay movimientos registrados en este mes.'}
            </div>

          ) : (

            <div className="divide-y divide-gray-800">

              {filteredTransactions.map((transaction) => (

                <div
                  key={transaction.id}
                  className="flex flex-col gap-4 p-4 sm:p-5 md:flex-row md:items-center md:justify-between"
                >

                  {/* INFORMACIÓN */}
                  <div className="min-w-0">
                    <p className="break-words font-semibold text-white">
                      {transaction.description || 'Sin descripción'}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {transaction.category || 'Sin categoría'} · {transaction.date}
                    </p>
                  </div>

                  {/* MONTO + BOTONES */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4">

                    <p
                      className={`mr-auto font-bold sm:mr-0 ${
                        transaction.type === 'income'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {transaction.type === 'income' ? '+' : '-'}
                      {currency.format(Number(transaction.amount))}
                    </p>

                    <button
                      onClick={() =>
                        router.push(
                          `/transactions/edit/${transaction.id}`
                        )
                      }
                      className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 hover:bg-gray-800"
                    >
                      ✏️ Editar
                    </button>

                    <button
                      onClick={() =>
                        deleteTransaction(transaction.id)
                      }
                      className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 hover:bg-gray-800"
                    >
                      🗑️ Eliminar
                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </div>
    </main>
  )
}


