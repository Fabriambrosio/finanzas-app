'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const currency = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})

export default function ExpensesByCategoryChart({ transactions }) {
  const expensesByCategory = transactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((accumulator, transaction) => {
      const category = transaction.category || 'Otros'
      const amount = Number(transaction.amount)

      accumulator[category] =
        (accumulator[category] || 0) + amount

      return accumulator
    }, {})

  const data = Object.entries(expensesByCategory)
    .map(([name, value]) => ({
      name,
      value,
    }))
    .sort((a, b) => b.value - a.value)

  const totalExpenses = data.reduce(
    (total, item) => total + item.value,
    0
  )

  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-800 bg-gray-950 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-white">
          Gastos del mes
        </h2>

        <p className="mt-8 text-center font-bold text-sm text-gray-400">
          No hay gastos registrados en este mes.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-950 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">
  Gastos del mes
</h2>

        <div className="text-right">
          <p className="text-xs font-bold text-gray-400">
  Total gastado
</p>

          <p className="text-lg font-bold text-red-600">
            {currency.format(totalExpenses)}
          </p>
        </div>
      </div>

      <div className="mt-4 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={105}
              label={({ name, percent }) =>
                `${name} ${Math.round(percent * 100)}%`
              }
            >
             {data.map((entry, index) => (
  <Cell
    key={`cell-${index}`}
    fill={[
      '#3b82f6',
      '#22c55e',
      '#ef4444',
      '#a855f7',
      '#f59e0b',
      '#06b6d4',
      '#ec4899',
      '#84cc16',
      '#f97316',
      '#6366f1',
    ][index % 10]}
  />
))}
            </Pie>

            <Tooltip
              formatter={(value) =>
                currency.format(value)
              }
            />

            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}