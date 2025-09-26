import { useEffect, useMemo, useState } from 'react'
import type { ReactElement } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LabelList } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card'
import { ChartContainer, ChartDescription, ChartTitle } from '../../ui/chart'
import { TrendingUp, PieChart as PieChartIcon } from 'lucide-react'

interface TypeCount {
  name: string
  count: number
}

// Shades of green to mimic shadcn chart palette
const COLORS = [
  '#14532d', // green-900
  '#166534', // green-800
  '#15803d', // green-700
  '#16a34a', // green-600
  '#22c55e', // green-500
  '#4ade80', // green-400
  '#86efac', // green-300
  '#bbf7d0' // green-200
]

export function AnimalTypePie(): ReactElement {
  const [data, setData] = useState<TypeCount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async (): Promise<void> => {
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

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5" />
            Animals by Type
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5" />
            Animals by Type
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-destructive py-8">{error}</div>
        </CardContent>
      </Card>
    )
  }

  if (!data.length) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5" />
            Animals by Type
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground font-medium">No data available</p>
            <p className="text-sm text-muted-foreground">
              Add some animals to see the distribution
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChartIcon className="h-5 w-5" />
          Animals by Type
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer>
          <ChartTitle>Distribution</ChartTitle>
          <ChartDescription>Total animals: {total}</ChartDescription>
          <div className="space-y-4">
            <div className="h-48 mx-auto aspect-square max-h-[200px] w-full [&_.recharts-text]:fill-background">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data} dataKey="count" nameKey="name" paddingAngle={2}>
                    <LabelList dataKey="name" className="fill-background" stroke="none" fontSize={10} />
                    {data.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number | string, _name: string, entry: unknown): [string, string] => {
                      const payload = (entry as { payload?: Partial<TypeCount> | undefined })?.payload
                      const name = typeof payload?.name === 'string' ? payload.name : ''
                      return [String(value), name]
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 max-h-32 overflow-y-auto">
              {data.map((d, i) => {
                const pct = total ? Math.round((d.count / total) * 100) : 0
                return (
                  <div key={d.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-3 w-3 rounded-sm flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="break-words text-xs">{d.name}</span>
                    </div>
                    <div className="text-muted-foreground text-xs flex-shrink-0">
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

export default AnimalTypePie