'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const currency = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})

export default function IncomeVsExpensesChart({ transactions }) {
  const monthlyData = {}

  transactions.forEach((transaction) => {
    const date = new Date(`${transaction.date}T00:00:00`)

    const month = date.toLocaleDateString('es-AR', {
      month: 'short',
      year: 'numeric',
    })

    if (!monthlyData[month]) {
      monthlyData[month] = {
        month,
        ingresos: 0,
        gastos: 0,
      }
    }

    const amount = Number(transaction.amount)

    if (transaction.type === 'income') {
      monthlyData[month].ingresos += amount
    } else {
      monthlyData[month].gastos += amount
    }
  })

  const data = Object.values(monthlyData)

  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Ingresos vs. gastos
        </h2>

        <p className="mt-8 text-center text-sm text-gray-500">
          No hay movimientos registrados.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">
        Ingresos vs. gastos
      </h2>

      <div className="mt-4 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="month" />

            <YAxis />

            <Tooltip
              formatter={(value) => currency.format(value)}
            />

            <Legend />

            <Bar
              dataKey="ingresos"
              name="Ingresos"
              radius={[6, 6, 0, 0]}
            />

            <Bar
              dataKey="gastos"
              name="Gastos"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}