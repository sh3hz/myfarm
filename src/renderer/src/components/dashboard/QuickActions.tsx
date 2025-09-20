import { Button } from '../ui/button'
import { PlusCircle, Milk } from 'lucide-react'
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

  return (
    <div className="flex flex-wrap gap-4 p-6">
      <Button onClick={handleAddAnimal} variant="outline" className="gap-2">
        <PlusCircle className="h-4 w-4" />
        Add Animal
      </Button>
      <Button onClick={handleAddMilkProduction} variant="outline" className="gap-2">
        <Milk className="h-4 w-4" />
        Add Milk Production
      </Button>
    </div>
  )
}

export default QuickActions
