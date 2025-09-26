import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '../ui/dialog'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import type { Animal, AnimalHealthRecord } from '../../../../shared/types/models'
import { PawPrint, FileText, Heart, Pill, Calendar, Weight, Ruler, MapPin } from 'lucide-react'
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
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, '0')
    const month = date.toLocaleDateString('en-US', { month: 'short' })
    const year = date.getFullYear()
    return `${day} ${month} ${year}`
  }

  const inseminationRecords = healthRecords.filter(r => r.record_type === 'insemination')
  const dewormingRecords = healthRecords.filter(r => r.record_type === 'deworming')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[90vh] w-[98vw] sm:w-[95vw] lg:w-[85vw] xl:max-w-7xl overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-4">
          <DialogTitle className="text-2xl font-bold">{animal?.name}</DialogTitle>
          {animal?.description && (
            <p className="text-muted-foreground text-base mt-2">{animal.description}</p>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-12 gap-6 h-full">
            {/* Left Column - Image and Quick Info */}
            <div className="col-span-4 space-y-4">
              {/* Animal Image */}
              <div className="aspect-square rounded-lg bg-muted overflow-hidden flex items-center justify-center">
                {imageSrc ? (
                  <img
                    src={imageSrc}
                    alt={animal?.name || 'Animal'}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <PawPrint className="w-24 h-24 text-muted-foreground" />
                )}
              </div>

              {/* Quick Stats Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Age</p>
                      <p className="text-sm text-muted-foreground">
                        {animal?.age && animal.age > 0 ? `${animal.age} years` : 'Unknown'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Weight className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Weight</p>
                      <p className="text-sm text-muted-foreground">
                        {animal?.weight ? `${animal.weight} kg` : 'Not recorded'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Ruler className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Height</p>
                      <p className="text-sm text-muted-foreground">
                        {animal?.height ? `${animal.height} cm` : 'Not recorded'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Documents */}
              {animal?.documents && animal.documents.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Documents
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {animal.documents.map((doc, index) => {
                        const displayName = doc.replace(/_\d+(\.[^.]+)?$/, '$1')
                        return (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="w-full justify-start cursor-pointer hover:bg-secondary/80 transition-colors p-2"
                            onClick={async () => {
                              try {
                                await window.api.openDocument(doc)
                              } catch (error) {
                                console.error('Error opening document:', error)
                              }
                            }}
                            title={`Click to open: ${displayName}`}
                          >
                            <FileText className="w-3 h-3 mr-2" />
                            <span className="truncate text-xs">{displayName}</span>
                          </Badge>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Detailed Information */}
            <div className="col-span-8 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Basic Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Tag Number</p>
                        <p className="text-sm mt-1">{animal?.tagNumber || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Gender</p>
                        <p className="text-sm mt-1">
                          {animal
                            ? animal.gender === 'MALE'
                              ? 'Male'
                              : animal.gender === 'FEMALE'
                                ? 'Female'
                                : animal.gender === 'CASTRATED'
                                  ? 'Castrated'
                                  : 'Unknown'
                            : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Type</p>
                        <p className="text-sm mt-1">{animal?.type?.name || '-'}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Breed</p>
                        <p className="text-sm mt-1">{animal?.breed || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Father's Breed</p>
                        <p className="text-sm mt-1">{animal?.fatherBreed || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Mother's Breed</p>
                        <p className="text-sm mt-1">{animal?.motherBreed || '-'}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                        <p className="text-sm mt-1">
                          {animal?.dateOfBirth ? formatDate(animal.dateOfBirth) : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Acquisition Date</p>
                        <p className="text-sm mt-1">
                          {animal?.acquisitionDate ? formatDate(animal.acquisitionDate) : '-'}
                        </p>
                      </div>
                      {animal?.acquisitionLocation && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Acquisition Location</p>
                          <p className="text-sm mt-1">{animal.acquisitionLocation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Exit Information (if applicable) */}
              {(animal?.exitDate || animal?.exitReason) && (
                <Card className="border-orange-200 dark:border-orange-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-orange-500" />
                      Exit Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-6">
                      {animal?.exitDate && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Exit Date</p>
                          <p className="text-sm mt-1">{formatDate(animal.exitDate)}</p>
                        </div>
                      )}
                      {animal?.exitReason && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Exit Reason</p>
                          <p className="text-sm mt-1">{animal.exitReason}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Health Records */}
              {(inseminationRecords.length > 0 || dewormingRecords.length > 0) && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Health Records</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Insemination Records */}
                      {inseminationRecords.length > 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-pink-600 dark:text-pink-400">
                            <Heart className="h-4 w-4" />
                            <h4 className="font-medium">Insemination Records</h4>
                          </div>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {inseminationRecords.map((record) => (
                              <div key={record.id} className="p-3 bg-muted/50 rounded-lg space-y-1">
                                <div className="text-sm font-medium">
                                  {formatDate(record.date)}
                                </div>
                                {record.expected_delivery_date && (
                                  <div className="text-xs text-muted-foreground">
                                    Expected delivery: {formatDate(record.expected_delivery_date)}
                                  </div>
                                )}
                                {record.notes && (
                                  <div className="text-xs text-muted-foreground">
                                    {record.notes}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Deworming Records */}
                      {dewormingRecords.length > 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                            <Pill className="h-4 w-4" />
                            <h4 className="font-medium">Deworming Records</h4>
                          </div>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {dewormingRecords.map((record) => (
                              <div key={record.id} className="p-3 bg-muted/50 rounded-lg space-y-1">
                                <div className="text-sm font-medium">
                                  {formatDate(record.date)}
                                </div>
                                {record.notes && (
                                  <div className="text-xs text-muted-foreground">
                                    {record.notes}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        <div className="border-t my-4" />

        <DialogFooter className="flex-shrink-0">
          <div className="flex justify-between w-full">
            {onDeleteClick && animal && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    Delete Animal
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
            <div className="flex gap-3">
              {onEditClick && animal && (
                <Button
                  variant="outline"
                  onClick={() => onEditClick(animal)}
                >
                  Edit Animal
                </Button>
              )}
              <Button
                onClick={() => onOpenChange(false)}
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
