import { Button } from '../ui/button'
import { Download, PlusCircle, List } from 'lucide-react'
import type { ReactElement } from 'react'

interface Props {
  onAdd: () => void
  onExport: () => Promise<void> | void
  onManageTypes: () => void
}

export function AnimalsToolbar({ onAdd, onExport, onManageTypes }: Props): ReactElement {
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" onClick={onExport}>
        <Download className="mr-2 h-4 w-4" /> Export to Excel
      </Button>
      <Button variant="outline" onClick={onManageTypes} className="gap-2">
        <List className="h-4 w-4" />
        Manage Animal Types
      </Button>
      <Button onClick={onAdd} className="gap-2">
        <PlusCircle className="h-4 w-4" />
        Add Animal
      </Button>
    </div>
  )
}
