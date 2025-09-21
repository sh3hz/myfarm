import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '../ui/dialog'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import type { Animal, AnimalHealthRecord } from '../../../../shared/types/models'
import { PawPrint, FileText, Heart, Pill } from 'lucide-react'
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
  const [healthRecords, setHealthRecords] = useState<AnimalHealthRecord[]>([])

  useEffect(() => {
    if (animal && open) {
      loadHealthRecords()
    }
  }, [animal, open])

  const loadHealthRecords = async () => {
    if (!animal) return

    try {
      const records = await window.api.getHealthRecords(animal.id)
      setHealthRecords(records)
    } catch (error) {
      console.error('Error loading health records:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const inseminationRecords = healthRecords.filter(r => r.record_type === 'insemination')
  const dewormingRecords = healthRecords.filter(r => r.record_type === 'deworming')
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] w-[95vw] sm:w-[90vw] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-lg sm:text-xl truncate">{animal?.name}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-4 p-2">
            {/* Image Section */}
            <div className="flex justify-center">
              <div className="relative w-full aspect-square max-w-48 sm:max-w-56 rounded-lg bg-muted overflow-hidden flex items-center justify-center">
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
            </div>

            {/* Description */}
            <div className="text-sm text-muted-foreground break-words text-center">
              {animal?.description || 'No description provided.'}
            </div>

            {/* Animal Details */}
            <div className="space-y-4 text-sm">
              {/* Basic Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                <div className="flex flex-col space-y-1">
                  <span className="text-muted-foreground font-medium">Tag:</span>
                  <span className="break-words">{animal?.tagNumber || '-'}</span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-muted-foreground font-medium">Breed:</span>
                  <span className="break-words">{animal?.breed || '-'}</span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-muted-foreground font-medium">Father's Breed:</span>
                  <span className="break-words">{animal?.fatherBreed || '-'}</span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-muted-foreground font-medium">Mother's Breed:</span>
                  <span className="break-words">{animal?.motherBreed || '-'}</span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-muted-foreground font-medium">Gender:</span>
                  <span className="break-words">
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
                <div className="flex flex-col space-y-1">
                  <span className="text-muted-foreground font-medium">Age:</span>
                  <span className="break-words">{animal?.age && animal.age > 0 ? `${animal.age} yrs` : '-'}</span>
                </div>
              </div>

              {/* Secondary Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                <div className="flex flex-col space-y-1">
                  <span className="text-muted-foreground font-medium">Type:</span>
                  <span className="break-words">{animal?.type?.name || '-'}</span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-muted-foreground font-medium">Date of Birth:</span>
                  <span className="break-words">
                    {animal?.dateOfBirth ? new Date(animal.dateOfBirth).toLocaleDateString() : '-'}
                  </span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-muted-foreground font-medium">Weight:</span>
                  <span className="break-words">{animal?.weight ? `${animal.weight} kg` : '-'}</span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-muted-foreground font-medium">Height:</span>
                  <span className="break-words">{animal?.height ? `${animal.height} cm` : '-'}</span>
                </div>
              </div>

              {/* Acquisition & Exit Info */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="flex flex-col space-y-1">
                  <span className="text-muted-foreground font-medium">Acquisition Date:</span>
                  <span className="break-words">{animal?.acquisitionDate ? new Date(animal.acquisitionDate).toLocaleDateString() : '-'}</span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-muted-foreground font-medium">Exit Date:</span>
                  <span className="break-words">{animal?.exitDate ? new Date(animal.exitDate).toLocaleDateString() : '-'}</span>
                </div>
                {animal?.acquisitionLocation && (
                  <div className="flex flex-col space-y-1">
                    <span className="text-muted-foreground font-medium">Acquisition Location:</span>
                    <span className="break-words">{animal.acquisitionLocation}</span>
                  </div>
                )}
                {animal?.exitReason && (
                  <div className="flex flex-col space-y-1">
                    <span className="text-muted-foreground font-medium">Exit Reason:</span>
                    <span className="break-words">{animal.exitReason}</span>
                  </div>
                )}
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

              {/* Health Records Section */}
              {(inseminationRecords.length > 0 || dewormingRecords.length > 0) && (
                <div className="space-y-3">
                  <span className="text-muted-foreground font-medium">Health Records:</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Insemination Records */}
                    {inseminationRecords.length > 0 && (
                      <Card className="border-pink-200 dark:border-pink-800">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Heart className="h-4 w-4 text-pink-500" />
                            Insemination Records
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {inseminationRecords.slice(0, 3).map((record) => (
                            <div key={record.id} className="text-xs space-y-1 p-2 bg-muted/50 rounded">
                              <div className="font-medium">
                                Date: {formatDate(record.date)}
                              </div>
                              {record.expected_delivery_date && (
                                <div className="text-muted-foreground">
                                  Expected delivery: {formatDate(record.expected_delivery_date)}
                                </div>
                              )}
                              {record.notes && (
                                <div className="text-muted-foreground">
                                  Notes: {record.notes}
                                </div>
                              )}
                            </div>
                          ))}
                          {inseminationRecords.length > 3 && (
                            <div className="text-xs text-muted-foreground text-center">
                              +{inseminationRecords.length - 3} more records
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {/* Deworming Records */}
                    {dewormingRecords.length > 0 && (
                      <Card className="border-green-200 dark:border-green-800">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Pill className="h-4 w-4 text-green-500" />
                            Deworming Records
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {dewormingRecords.slice(0, 3).map((record) => (
                            <div key={record.id} className="text-xs space-y-1 p-2 bg-muted/50 rounded">
                              <div className="font-medium">
                                Date: {formatDate(record.date)}
                              </div>
                              {record.notes && (
                                <div className="text-muted-foreground">
                                  Notes: {record.notes}
                                </div>
                              )}
                            </div>
                          ))}
                          {dewormingRecords.length > 3 && (
                            <div className="text-xs text-muted-foreground text-center">
                              +{dewormingRecords.length - 3} more records
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}
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
