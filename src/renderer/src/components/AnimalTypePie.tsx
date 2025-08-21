import { useEffect, useMemo, useState } from 'react'
import type { ReactElement } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { ChartContainer, ChartDescription, ChartTitle } from './ui/chart'

interface TypeCount {
  name: string
  count: number
}

const COLORS = [
  '#3b82f6', // blue-500
  '#22c55e', // green-500
  '#ef4444', // red-500
  '#a855f7', // purple-500
  '#f59e0b', // amber-500
  '#06b6d4', // cyan-500
  '#84cc16', // lime-500
  '#f97316', // orange-500
  '#10b981', // emerald-500
  '#e11d48', // rose-600
]

export function AnimalTypePie(): ReactElement {
  const [data, setData] = useState<TypeCount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const rows = await window.api.getAnimalTypeCounts()
        setData(rows)
      } catch (e) {
        console.error('Failed to load animal type counts', e)
        setError('Failed to load chart data')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const total = useMemo(() => data.reduce((acc, d) => acc + d.count, 0), [data])

  if (loading) return <div className="text-center py-2">Loading chart...</div>
  if (error) return <div className="text-center text-red-500 py-2">{error}</div>
  if (!data.length) return <div className="text-sm text-muted-foreground">No data</div>

  return (
    <Card>
      <CardHeader className="p-6 pb-2">
        <CardTitle className="text-sm font-medium">Animals by Type</CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <ChartContainer>
          <ChartTitle>Distribution</ChartTitle>
          <ChartDescription>Total animals: {total}</ChartDescription>
          <div className="space-y-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data} dataKey="count" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any, _name: any, entry: any) => [`${value}`, entry.payload.name]} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2">
              {data.map((d, i) => {
                const pct = total ? Math.round((d.count / total) * 100) : 0
                return (
                  <div key={d.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span>{d.name}</span>
                    </div>
                    <div className="text-muted-foreground">
                      {d.count} ({pct}%)
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
