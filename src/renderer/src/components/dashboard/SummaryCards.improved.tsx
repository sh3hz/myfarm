import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { useEffect, useState } from 'react'
import type { ReactElement } from 'react'
import { PawPrint, Users, TrendingUp, Award } from 'lucide-react'

interface AnimalStats {
  totalTypes: number
  totalAnimals: number
  mostCommonType: string
  mostCommonTypeCount: number
}

interface SummaryCardsProps {
  onNavigate?: (path: string) => void
}

export function SummaryCards({ onNavigate }: SummaryCardsProps): ReactElement {
  const [stats, setStats] = useState<AnimalStats | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadStats = async (): Promise<void> => {
      try {
        const data = await window.api.getAnimalStats()
        setStats(data)
        setError(null)
      } catch (err) {
        console.error('Failed to load animal stats:', err)
        setError('Failed to load statistics')
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return <div className="text-center text-destructive py-4">{error}</div>
  }

  const cards = [
    {
      title: 'Animal Types',
      value: stats?.totalTypes || 0,
      icon: PawPrint,
      description: 'Different types registered',
      color: 'text-blue-600'
    },
    {
      title: 'Total Animals',
      value: stats?.totalAnimals || 0,
      icon: Users,
      description: 'Animals in your farm',
      color: 'text-green-600'
    },
    {
      title: 'Most Common Type',
      value: stats?.mostCommonType || 'N/A',
      icon: Award,
      description: 'Primary animal type',
      color: 'text-purple-600'
    },
    {
      title: `Total ${stats?.mostCommonType || 'Animals'}`,
      value: stats?.mostCommonTypeCount || 0,
      icon: TrendingUp,
      description: 'Count of primary type',
      color: 'text-orange-600'
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onNavigate?.('/animals')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <Icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {card.description}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export default SummaryCards