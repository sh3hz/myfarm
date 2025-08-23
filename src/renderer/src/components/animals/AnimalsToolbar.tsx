import { Button } from '../ui/button'
import { Download, PlusCircle } from 'lucide-react'
import type { ReactElement } from 'react'

interface Props {
  onAdd: () => void
  onExport: () => Promise<void> | void
}

export function AnimalsToolbar({ onAdd, onExport }: Props): ReactElement {
  const handleAddAnimalType = (): void => {
    window.dispatchEvent(new CustomEvent('open-animal-type-dialog'))
  }
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" onClick={onExport}>
        <Download className="mr-2 h-4 w-4" /> Export to Excel
      </Button>
      <Button onClick={handleAddAnimalType} variant="outline" className="gap-2">
        <PlusCircle className="h-4 w-4" />
        Add Animal Type
      </Button>
      <Button onClick={onAdd}>Add Animal</Button>
    </div>
  )
}
