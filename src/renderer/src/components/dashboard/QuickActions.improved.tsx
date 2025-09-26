import { Button } from '../ui/button'
import { PlusCircle, Milk, TrendingUp, Calendar } from 'lucide-react'
import type { ReactElement } from 'react'

interface QuickActionsProps {
  onNavigate?: (path: string) => void
}

export function QuickActions({ onNavigate }: QuickActionsProps): ReactElement {
  const handleAddAnimal = (): void => {
    window.dispatchEvent(new CustomEvent('open-animal-dialog'))
  }

  const handleAddMilkProduction = (): void => {
    if (onNavigate) {
      onNavigate('/milk-production')
    }
  }

  const handleViewCashflow = (): void => {
    if (onNavigate) {
      onNavigate('/cashflow')
    }
  }

  const handleViewAnimals = (): void => {
    if (onNavigate) {
      onNavigate('/animals')
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Button onClick={handleAddAnimal} className="gap-2">
        <PlusCircle className="h-4 w-4" />
        Add Animal
      </Button>
      <Button onClick={handleAddMilkProduction} variant="outline" className="gap-2">
        <Milk className="h-4 w-4" />
        Add Milk Production
      </Button>
      <Button onClick={handleViewCashflow} variant="outline" className="gap-2">
        <TrendingUp className="h-4 w-4" />
        View Cashflow
      </Button>
      <Button onClick={handleViewAnimals} variant="outline" className="gap-2">
        <Calendar className="h-4 w-4" />
        Manage Animals
      </Button>
    </div>
  )
}

export default QuickActions