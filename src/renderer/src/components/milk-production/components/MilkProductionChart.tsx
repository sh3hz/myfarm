import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@renderer/components/ui/select'
import { Label } from '@renderer/components/ui/label'
import { ChartContainer } from '@renderer/components/ui/chart'
import type { Animal } from '@renderer/types/models'

interface ChartData {
  date: string
  total: number
  morning: number
  evening: number
}

export function MilkProductionChart(): React.JSX.Element {
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [animals, setAnimals] = useState<Animal[]>([])
  const [selectedAnimal, setSelectedAnimal] = useState<string>('all')
  const [days, setDays] = useState<number>(30)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadAnimals()
  }, [])

  useEffect(() => {
    loadChartData()
  }, [selectedAnimal, days])

  const loadAnimals = async (): Promise<void> => {
    try {
      const data = await window.api.getAnimals()
      setAnimals(data)
    } catch (error) {
      console.error('Error loading animals:', error)
    }
  }

  const loadChartData = async (): Promise<void> => {
    setLoading(true)
    try {
      const animalId = selectedAnimal === 'all' ? undefined : parseInt(selectedAnimal)
      const data = await window.api.getMilkProductionChartData(animalId, days)
      
      // Format data for the chart
      const formattedData = data.map(item => ({
        ...item,
        date: new Date(item.date).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        })
      }))
      
      setChartData(formattedData)
    } catch (error) {
      console.error('Error loading chart data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="space-y-2">
          <Label>Animal</Label>
          <Select value={selectedAnimal} onValueChange={setSelectedAnimal}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Animals</SelectItem>
              {animals.map((animal) => (
                <SelectItem key={animal.id} value={animal.id.toString()}>
                  {animal.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Period</Label>
          <Select value={days.toString()} onValueChange={(value) => setDays(parseInt(value))}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 days</SelectItem>
              <SelectItem value="14">14 days</SelectItem>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="60">60 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <ChartContainer className="h-[300px]">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-muted-foreground">Loading chart data...</div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-muted-foreground">No data available for the selected period</div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
                className="text-muted-foreground"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                label={{ value: 'Liters', angle: -90, position: 'insideLeft' }}
                className="text-muted-foreground"
              />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  `${value.toFixed(1)}L`, 
                  name === 'total' ? 'Total' : name === 'morning' ? 'Morning' : 'Evening'
                ]}
                labelFormatter={(label) => `Date: ${label}`}
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="total" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                name="Total"
                dot={{ r: 4, fill: "hsl(var(--primary))" }}
              />
              <Line 
                type="monotone" 
                dataKey="morning" 
                stroke="#16a34a" 
                strokeWidth={1}
                strokeDasharray="5 5"
                name="Morning"
                dot={{ r: 3, fill: "#16a34a" }}
              />
              <Line 
                type="monotone" 
                dataKey="evening" 
                stroke="#dc2626" 
                strokeWidth={1}
                strokeDasharray="5 5"
                name="Evening"
                dot={{ r: 3, fill: "#dc2626" }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </ChartContainer>
    </div>
  )
}