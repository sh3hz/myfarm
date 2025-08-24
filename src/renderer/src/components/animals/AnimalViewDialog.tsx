import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '../ui/dialog'
import { Button } from '../ui/button'
import type { Animal } from '../../../../shared/types/models'
import { PawPrint } from 'lucide-react'
import type { ReactElement } from 'react'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  animal: Animal | null
  imageSrc?: string
  onEditClick?: (animal: Animal) => void
  onDeleteClick?: (id: number) => Promise<void> | void
}

export function AnimalViewDialog({ 
  open, 
  onOpenChange, 
  animal, 
  imageSrc, 
  onEditClick, 
  onDeleteClick 
}: Props): ReactElement {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{animal?.name}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-3">
            <div className="relative w-full aspect-square rounded-lg bg-muted overflow-hidden flex items-center justify-center">
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt={animal?.name || 'Animal'}
                  className="object-cover w-full h-full"
                />
              ) : (
                <PawPrint className="w-20 h-20 text-muted-foreground" />
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              {animal?.description || 'No description provided.'}
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">Tag:</span> {animal?.tagNumber || '-'}
            </div>
            <div>
              <span className="text-muted-foreground">Breed:</span> {animal?.breed || '-'}
            </div>
            <div>
              <span className="text-muted-foreground">Gender:</span>{' '}
              {animal
                ? animal.gender === 'MALE'
                  ? 'Male'
                  : animal.gender === 'FEMALE'
                    ? 'Female'
                    : animal.gender === 'CASTRATED'
                      ? 'Castrated'
                      : 'Unknown'
                : '-'}
            </div>
            <div>
              <span className="text-muted-foreground">Age:</span>{' '}
              {animal?.age && animal.age > 0 ? `${animal.age} yrs` : '-'}
            </div>
            <div>
              <span className="text-muted-foreground">Type:</span> {animal?.type?.name || '-'}
            </div>
            <div>
              <span className="text-muted-foreground">DOB:</span>{' '}
              {animal?.dateOfBirth ? new Date(animal.dateOfBirth).toLocaleDateString() : '-'}
            </div>
            <div>
              <span className="text-muted-foreground">Weight:</span>{' '}
              {animal?.weight ? `${animal.weight} kg` : '-'}
            </div>
            <div>
              <span className="text-muted-foreground">Height:</span>{' '}
              {animal?.height ? `${animal.height} cm` : '-'}
            </div>
            <div>
              <span className="text-muted-foreground">Acquired:</span>{' '}
              {animal?.acquisitionDate
                ? new Date(animal.acquisitionDate).toLocaleDateString()
                : '-'}{' '}
              {animal?.acquisitionLocation ? `(${animal.acquisitionLocation})` : ''}
            </div>
            <div>
              <span className="text-muted-foreground">Exit:</span>{' '}
              {animal?.exitDate ? new Date(animal.exitDate).toLocaleDateString() : '-'}{' '}
              {animal?.exitReason ? `(${animal.exitReason})` : ''}
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          {onDeleteClick && animal && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive" className="mr-auto">
                  Delete
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Are you sure you want to delete this animal?</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete {animal.name}.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    type="button"
                    onClick={() => onDeleteClick(animal.id)}
                  >
                    Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          {onEditClick && animal && (
            <Button 
              variant="outline"
              onClick={() => onEditClick(animal)}
            >
              Edit
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
