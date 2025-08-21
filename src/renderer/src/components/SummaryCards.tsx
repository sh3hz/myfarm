import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { PlusCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { ReactElement } from 'react'

interface AnimalStats {
  totalTypes: number
  totalAnimals: number
  mostCommonType: string
  mostCommonTypeCount: number
}

export function SummaryCards(): ReactElement {
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
    return <div className="text-center py-4">Loading statistics...</div>
  }

  if (error) {
    return <div className="text-center text-red-500 py-4">{error}</div>
  }

  const handleAddAnimal = (): void => {
    window.dispatchEvent(new CustomEvent('open-animal-dialog'))
  }

  const handleAddAnimalType = (): void => {
    window.dispatchEvent(new CustomEvent('open-animal-type-dialog'))
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap gap-4">
        <Button onClick={handleAddAnimal} variant="outline" className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Add Animal
        </Button>
        <Button onClick={handleAddAnimalType} variant="outline" className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Add Animal Type
        </Button>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-6 pb-2">
            <CardTitle className="text-sm font-medium">Animal Types</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="text-2xl font-bold">{stats?.totalTypes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-6 pb-2">
            <CardTitle className="text-sm font-medium">Total Animals</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="text-2xl font-bold">{stats?.totalAnimals}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-6 pb-2">
            <CardTitle className="text-sm font-medium">Most Common Type</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="text-2xl font-bold">{stats?.mostCommonType}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-6 pb-2">
            <CardTitle className="text-sm font-medium">Total {stats?.mostCommonType}</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="text-2xl font-bold">{stats?.mostCommonTypeCount}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
