import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '../ui/dialog'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import type { Animal } from '../../../../shared/types/models'
import { PawPrint, FileText } from 'lucide-react'
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-lg sm:text-xl truncate">{animal?.name}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 p-1">
            <div className="space-y-3">
              <div className="relative w-full aspect-square max-w-sm mx-auto lg:max-w-none rounded-lg bg-muted overflow-hidden flex items-center justify-center">
                {imageSrc ? (
                  <img
                    src={imageSrc}
                    alt={animal?.name || 'Animal'}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <PawPrint className="w-16 h-16 sm:w-20 sm:h-20 text-muted-foreground" />
                )}
              </div>
              <div className="text-sm text-muted-foreground break-words">
                {animal?.description || 'No description provided.'}
              </div>
            </div>

            <div className="space-y-3 text-sm min-w-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-medium">Tag:</span>
                  <span className="truncate ml-2">{animal?.tagNumber || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-medium">Breed:</span>
                  <span className="truncate ml-2">{animal?.breed || '-'}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-medium">Gender:</span>
                  <span className="ml-2">
                    {animal
                      ? animal.gender === 'MALE'
                        ? 'Male'
                        : animal.gender === 'FEMALE'
                          ? 'Female'
                          : animal.gender === 'CASTRATED'
                            ? 'Castrated'
                            : 'Unknown'
                      : '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-medium">Age:</span>
                  <span className="ml-2">{animal?.age && animal.age > 0 ? `${animal.age} yrs` : '-'}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-medium">Type:</span>
                  <span className="truncate ml-2">{animal?.type?.name || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-medium">DOB:</span>
                  <span className="ml-2">
                    {animal?.dateOfBirth ? new Date(animal.dateOfBirth).toLocaleDateString() : '-'}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-medium">Weight:</span>
                  <span className="ml-2">{animal?.weight ? `${animal.weight} kg` : '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-medium">Height:</span>
                  <span className="ml-2">{animal?.height ? `${animal.height} cm` : '-'}</span>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex flex-col sm:flex-row sm:justify-between">
                  <span className="text-muted-foreground font-medium">Acquired:</span>
                  <div className="sm:ml-2 sm:text-right">
                    <div>{animal?.acquisitionDate ? new Date(animal.acquisitionDate).toLocaleDateString() : '-'}</div>
                    {animal?.acquisitionLocation && (
                      <div className="text-xs text-muted-foreground truncate">({animal.acquisitionLocation})</div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex flex-col sm:flex-row sm:justify-between">
                  <span className="text-muted-foreground font-medium">Exit:</span>
                  <div className="sm:ml-2 sm:text-right">
                    <div>{animal?.exitDate ? new Date(animal.exitDate).toLocaleDateString() : '-'}</div>
                    {animal?.exitReason && (
                      <div className="text-xs text-muted-foreground">({animal.exitReason})</div>
                    )}
                  </div>
                </div>
              </div>
              
              {animal?.documents && animal.documents.length > 0 && (
                <div className="space-y-2">
                  <span className="text-muted-foreground font-medium">Documents:</span>
                  <div className="flex flex-wrap gap-1">
                    {animal.documents.map((doc, index) => {
                      const displayName = doc.replace(/_\d+(\.[^.]+)?$/, '$1')
                      const truncatedName = displayName.length > 20 
                        ? `${displayName.substring(0, 17)}...` 
                        : displayName
                      
                      return (
                        <Badge 
                          key={index} 
                          variant="secondary" 
                          className="text-xs cursor-pointer hover:bg-secondary/80 transition-colors max-w-full"
                          onClick={async () => {
                            try {
                              await window.api.openDocument(doc)
                            } catch (error) {
                              console.error('Error opening document:', error)
                            }
                          }}
                          title={`Click to open: ${displayName}`}
                        >
                          <FileText className="w-3 h-3 mr-1 flex-shrink-0" />
                          <span className="truncate">{truncatedName}</span>
                        </Badge>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2 flex-shrink-0 flex-col sm:flex-row">
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            {onDeleteClick && animal && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive" className="sm:mr-auto">
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
            <div className="flex flex-col sm:flex-row gap-2 sm:ml-auto">
              {onEditClick && animal && (
                <Button 
                  variant="outline"
                  onClick={() => onEditClick(animal)}
                  className="w-full sm:w-auto"
                >
                  Edit
                </Button>
              )}
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-auto"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
