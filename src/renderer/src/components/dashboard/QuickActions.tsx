import { Button } from '../ui/button'
import { PlusCircle } from 'lucide-react'
import type { ReactElement } from 'react'

export function QuickActions(): ReactElement {
  const handleAddAnimal = (): void => {
    window.dispatchEvent(new CustomEvent('open-animal-dialog'))
  }

  return (
    <div className="flex flex-wrap gap-4 p-6">
      <Button onClick={handleAddAnimal} variant="outline" className="gap-2">
        <PlusCircle className="h-4 w-4" />
        Add Animal
      </Button>
    </div>
  )
}

export default QuickActions
