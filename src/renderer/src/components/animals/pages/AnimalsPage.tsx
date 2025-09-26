import { useState, useEffect, forwardRef, useCallback } from 'react'
import * as React from 'react'
import type { Animal, Gender } from '../../../../../shared/types/models'
import { Button } from '../../ui/button'
import { Input } from '../../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { DatePicker } from '../../ui/date-picker'

import { Label } from '../../ui/label'
import { Textarea } from '../../ui/textarea'
import { toast } from 'sonner'
import { PawPrint, Plus, FileText, X, Upload, Calendar, Weight, Ruler, MapPin, Heart, User, Tag, Info } from 'lucide-react'
import { AnimalsToolbar, AnimalViewDialog, AnimalsTable, AnimalHealthModal } from '..'
import { AnimalTypesModal } from '../AnimalTypesModal'

interface AnimalFormData extends Omit<Animal, 'id' | 'created_at' | 'updated_at' | 'type' | 'dateOfBirth' | 'acquisitionDate' | 'exitDate'> {
  type_id: number
  image?: string
  documents?: string[]
  tagNumber?: string
  gender: Gender
  dateOfBirth?: Date
  weight?: number
  height?: number
  acquisitionDate?: Date
  acquisitionLocation?: string
  exitDate?: Date
  exitReason?: string
}

const defaultAnimal: AnimalFormData = {
  name: '',
  age: undefined,
  type_id: 0,
  description: '',
  image: '',
  documents: [],
  gender: 'UNKNOWN',
  tagNumber: '',
  dateOfBirth: undefined,
  weight: undefined,
  height: undefined,
  acquisitionDate: undefined,
  acquisitionLocation: '',
  exitDate: undefined,
  exitReason: '',
  fatherBreed: '',
  motherBreed: ''
}

interface AnimalsHandles {
  openDialog: () => void
}

// Global image cache to persist across page navigations
const globalImageCache = new Map<string, string>()

// Helper function to get image URL (cache-first)
const getImageUrl = (imagePath: string): string | undefined => {
  return globalImageCache.get(imagePath)
}

export const AnimalsPage = forwardRef<AnimalsHandles, unknown>((_, ref): React.ReactElement => {
  const [animals, setAnimals] = useState<Animal[]>([])
  const [animalTypes, setAnimalTypes] = useState<{ id: number; name: string }[]>([])
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [isTypesModalOpen, setIsTypesModalOpen] = useState(false)
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false)
  const [healthModalAnimal, setHealthModalAnimal] = useState<Animal | null>(null)
  const [formData, setFormData] = useState<AnimalFormData>({ ...defaultAnimal })
  const [, forceUpdate] = useState({})

  React.useImperativeHandle(ref, () => ({
    openDialog: (): void => {
      setFormDialogOpen(true)
    }
  }))

  const loadAnimals = useCallback(async (): Promise<void> => {
    try {
      const fetchedAnimals = await window.api.getAnimals()
      setAnimals(fetchedAnimals)

      // Get image paths that need loading (not in cache)
      const imagePaths = fetchedAnimals
        .filter(animal => animal.image && !globalImageCache.has(animal.image))
        .map(animal => animal.image!)

      if (imagePaths.length > 0) {
        try {
          // Batch load all image paths at once
          const imageMap = await window.api.getImagePaths(imagePaths)

          // Update global cache
          Object.entries(imageMap).forEach(([path, url]) => {
            globalImageCache.set(path, url as string)
          })

          // Force re-render to show loaded images
          forceUpdate({})
        } catch (error) {
          console.error('Failed to load image paths:', error)
        }
      }
    } catch (error) {
      console.error('Failed to load animals:', error)
      toast.error('Failed to load animals')
    }
  }, [])

  const loadAnimalTypes = useCallback(async (): Promise<void> => {
    try {
      const types = await window.api.getAnimalTypes()
      setAnimalTypes(types)
    } catch (error) {
      console.error('Failed to load animal types:', error)
      toast.error('Failed to load animal types')
    }
  }, [])

  useEffect(() => {
    loadAnimals()
    loadAnimalTypes()
  }, [loadAnimals, loadAnimalTypes])

  const handleEdit = useCallback(async (animal: Animal): Promise<void> => {
    setSelectedAnimal(animal)
    setFormData({
      ...animal,
      type_id: animal.type?.id || 0, // Add null check for type
      image: animal.image || '',
      documents: animal.documents || [],
      dateOfBirth: animal.dateOfBirth ? new Date(animal.dateOfBirth) : undefined,
      acquisitionDate: animal.acquisitionDate ? new Date(animal.acquisitionDate) : undefined,
      exitDate: animal.exitDate ? new Date(animal.exitDate) : undefined,
    } as AnimalFormData)

    // Load image path if animal has an image and it's not in cache
    if (animal.image && !globalImageCache.has(animal.image)) {
      try {
        const fullPath = await window.api.getImagePath(animal.image)
        globalImageCache.set(animal.image, fullPath)
        forceUpdate({})
      } catch (error) {
        console.error('Failed to load image for editing:', error)
      }
    }

    setFormDialogOpen(true)
  }, [])

  const handleTypeSelect = (typeId: number): void => {
    setFormData((prev) => ({
      ...prev,
      type_id: typeId
    }))
    setIsTypesModalOpen(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'age' || name === 'weight' || name === 'height' ? Number(value) : value
    }))
  }

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
      e.preventDefault()

      // Validate required fields
      if (!formData.type_id || formData.type_id === 0) {
        toast.error('Please select an animal type')
        return
      }

      try {
        const typeName = animalTypes.find((type) => type.id === formData.type_id)?.name || ''
        const animalData = {
          ...formData,
          type: typeName,
          dateOfBirth: formData.dateOfBirth ? formData.dateOfBirth.toISOString().split('T')[0] : '',
          acquisitionDate: formData.acquisitionDate ? formData.acquisitionDate.toISOString().split('T')[0] : '',
          exitDate: formData.exitDate ? formData.exitDate.toISOString().split('T')[0] : '',
        }

        if (selectedAnimal) {
          const updatedAnimal = await window.api.updateAnimal(selectedAnimal.id, animalData)
          if (updatedAnimal) {
            toast.success('Animal updated successfully')
            // Update the selected animal state to refresh the profile view
            setSelectedAnimal(updatedAnimal)
          } else {
            toast.error('Failed to update animal')
            return // Don't close drawer if update failed
          }
        } else {
          await window.api.createAnimal(animalData)
          toast.success('Animal created successfully')
        }

        await loadAnimals()
        setFormDialogOpen(false)
        setSelectedAnimal(null)
        setFormData(defaultAnimal)
      } catch (error) {
        console.error('Error saving animal:', error)
        toast.error('Failed to save animal')
      }
    },
    [formData, selectedAnimal, animalTypes, loadAnimals]
  )

  const handleDelete = useCallback(
    async (id: number): Promise<void> => {
      try {
        const animalToDelete = animals.find(animal => animal.id === id)
        await window.api.deleteAnimal(id)

        if (animalToDelete?.image) {
          globalImageCache.delete(animalToDelete.image)
        }

        await loadAnimals()
        toast.success('Animal deleted successfully')
        if (selectedAnimal?.id === id) {
          setSelectedAnimal(null)
          setIsDialogOpen(false)
        }
        setFormDialogOpen(false)
      } catch (error) {
        console.error('Error deleting animal:', error)
        toast.error('Failed to delete animal')
      }
    },
    [loadAnimals, selectedAnimal, animals]
  )

  const removeDocument = (index: number): void => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents?.filter((_, i) => i !== index) || []
    }))
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Animals</h2>
        <div className="flex items-center gap-2">
          <AnimalsToolbar
            onAdd={() => {
              setSelectedAnimal(null)
              setFormData(defaultAnimal)
              setFormDialogOpen(true)
            }}
            onExport={async () => {
              const res = await window.api.exportAnimalsToExcel()
              if (res?.success) {
                toast.success('Exported to Excel', { description: res.filePath })
              } else {
                toast.error(res?.message || 'Export failed')
              }
            }}
            onManageTypes={() => setIsTypesModalOpen(true)}
          />
        </div>
      </div>

      <AnimalTypesModal
        open={isTypesModalOpen}
        onOpenChange={setIsTypesModalOpen}
        onTypeSelect={handleTypeSelect}
      />

      {/* Desktop-Optimized Animal Form Dialog */}
      <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
        <DialogContent className="max-w-[95vw] max-h-[90vh] w-[98vw] sm:w-[95vw] lg:w-[85vw] xl:max-w-7xl overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0 pb-4">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              {selectedAnimal ? (
                <>
                  <User className="h-6 w-6 text-blue-500" />
                  Edit Animal: {selectedAnimal.name}
                </>
              ) : (
                <>
                  <Plus className="h-6 w-6 text-green-500" />
                  Add New Animal
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-base">
              {selectedAnimal
                ? 'Update the animal information below'
                : 'Fill in the details to add a new animal to your farm'}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-6" id="animal-form">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column - Image and Quick Info */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Image Upload Card */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Animal Photo
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="relative w-32 h-32 rounded-lg bg-muted flex items-center justify-center overflow-hidden border-2 border-dashed border-muted-foreground/25">
                          {formData.image && getImageUrl(formData.image) ? (
                            <img
                              src={getImageUrl(formData.image)}
                              alt="Animal preview"
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <PawPrint className="w-12 h-12 text-muted-foreground" />
                          )}
                        </div>
                        <Input
                          type="file"
                          accept="image/*"
                          className="w-full"
                          onChange={async (e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              try {
                                const reader = new FileReader()
                                reader.onload = async (e) => {
                                  const imageData = e.target?.result as string
                                  const savedPath = await window.api.saveImage(imageData)
                                  const fullPath = await window.api.getImagePath(savedPath)
                                  globalImageCache.set(savedPath, fullPath)
                                  forceUpdate({})
                                  setFormData((prev) => ({ ...prev, image: savedPath }))
                                }
                                reader.readAsDataURL(file)
                              } catch (error) {
                                toast.error('Error uploading image')
                                console.error('Error uploading image:', error)
                              }
                            }
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Documents Card */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Documents
                      </CardTitle>
                      <CardDescription>Upload certificates, health records, etc.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Input
                        type="file"
                        multiple
                        accept="*/*"
                        className="w-full"
                        onChange={async (e) => {
                          const files = Array.from(e.target.files || [])
                          if (files.length > 0) {
                            try {
                              const uploadPromises = files.map(file => {
                                return new Promise<string>((resolve, reject) => {
                                  const reader = new FileReader()
                                  reader.onload = async (e) => {
                                    try {
                                      const fileData = e.target?.result as string
                                      const savedFilename = await window.api.saveDocument(fileData, file.name)
                                      resolve(savedFilename)
                                    } catch (error) {
                                      reject(error)
                                    }
                                  }
                                  reader.onerror = reject
                                  reader.readAsDataURL(file)
                                })
                              })

                              const savedFilenames = await Promise.all(uploadPromises)
                              setFormData((prev) => ({
                                ...prev,
                                documents: [...(prev.documents || []), ...savedFilenames]
                              }))
                              toast.success(`${files.length} document(s) added`)
                            } catch (error) {
                              toast.error('Error uploading documents')
                              console.error('Error uploading documents:', error)
                            }
                          }
                        }}
                      />

                      {formData.documents && formData.documents.length > 0 && (
                        <div className="space-y-2">
                          {formData.documents.map((doc, index) => {
                            const displayName = doc.replace(/_\d+(\.[^.]+)?$/, '$1')
                            return (
                              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                  <span className="text-sm truncate" title={displayName}>
                                    {displayName}
                                  </span>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeDocument(index)}
                                  className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column - Form Fields */}
                <div className="lg:col-span-8 space-y-6">
                  {/* Basic Information */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Info className="h-4 w-4 text-blue-500" />
                        Basic Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="tagNumber" className="flex items-center gap-2">
                            <Tag className="h-3 w-3" />
                            Tag Number
                          </Label>
                          <Input
                            id="tagNumber"
                            name="tagNumber"
                            value={formData.tagNumber}
                            onChange={handleInputChange}
                            placeholder="e.g., A001"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="name">Name *</Label>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            placeholder="Animal name"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="breed">Breed</Label>
                          <Input
                            id="breed"
                            name="breed"
                            value={formData.breed}
                            onChange={handleInputChange}
                            placeholder="e.g., Holstein"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="type_id">Animal Type *</Label>
                          <div className="flex gap-2">
                            <Select
                              value={formData.type_id ? formData.type_id.toString() : ''}
                              onValueChange={(value) => {
                                setFormData((prev) => ({
                                  ...prev,
                                  type_id: value ? parseInt(value) : 0
                                }))
                              }}
                            >
                              <SelectTrigger className="flex-1">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                {animalTypes.map((type) => (
                                  <SelectItem key={type.id} value={type.id.toString()}>
                                    {type.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setIsTypesModalOpen(true)}
                              className="px-3"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="gender">Gender</Label>
                          <Select
                            value={formData.gender}
                            onValueChange={(value) =>
                              setFormData((prev) => ({
                                ...prev,
                                gender: value as Gender
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="MALE">♂ Male</SelectItem>
                              <SelectItem value="FEMALE">♀ Female</SelectItem>
                              <SelectItem value="CASTRATED">♂ Castrated</SelectItem>
                              <SelectItem value="UNKNOWN">? Unknown</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="age">Age (years)</Label>
                          <Input
                            id="age"
                            name="age"
                            type="number"
                            min="0"
                            step="0.1"
                            value={formData.age ?? ''}
                            onChange={handleInputChange}
                            placeholder="0"
                          />
                        </div>
                      </div>

                      <div className="mt-4">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          placeholder="Additional notes about the animal..."
                          className="mt-2"
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Breeding Information */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Heart className="h-4 w-4 text-pink-500" />
                        Breeding Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fatherBreed">Father's Breed</Label>
                          <Input
                            id="fatherBreed"
                            name="fatherBreed"
                            value={formData.fatherBreed || ''}
                            onChange={handleInputChange}
                            placeholder="Sire breed"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="motherBreed">Mother's Breed</Label>
                          <Input
                            id="motherBreed"
                            name="motherBreed"
                            value={formData.motherBreed || ''}
                            onChange={handleInputChange}
                            placeholder="Dam breed"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Physical Attributes */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Ruler className="h-4 w-4 text-purple-500" />
                        Physical Attributes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="dateOfBirth" className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            Date of Birth
                          </Label>
                          <DatePicker
                            date={formData.dateOfBirth}
                            onDateChange={(date) => setFormData(prev => ({ ...prev, dateOfBirth: date }))}
                            placeholder="Select birth date"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="weight" className="flex items-center gap-2">
                            <Weight className="h-3 w-3" />
                            Weight (kg)
                          </Label>
                          <Input
                            id="weight"
                            name="weight"
                            type="number"
                            step="0.1"
                            min="0"
                            value={formData.weight || ''}
                            onChange={handleInputChange}
                            placeholder="0.0"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="height" className="flex items-center gap-2">
                            <Ruler className="h-3 w-3" />
                            Height (cm)
                          </Label>
                          <Input
                            id="height"
                            name="height"
                            type="number"
                            step="0.1"
                            min="0"
                            value={formData.height || ''}
                            onChange={handleInputChange}
                            placeholder="0.0"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Acquisition & Exit Information */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-green-500" />
                          Acquisition
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="acquisitionDate">Date</Label>
                          <DatePicker
                            date={formData.acquisitionDate}
                            onDateChange={(date) => setFormData(prev => ({ ...prev, acquisitionDate: date }))}
                            placeholder="Select acquisition date"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="acquisitionLocation">Location</Label>
                          <Input
                            id="acquisitionLocation"
                            name="acquisitionLocation"
                            value={formData.acquisitionLocation}
                            onChange={handleInputChange}
                            placeholder="Where was the animal acquired?"
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-orange-500" />
                          Exit Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="exitDate">Exit Date</Label>
                          <DatePicker
                            date={formData.exitDate}
                            onDateChange={(date) => setFormData(prev => ({ ...prev, exitDate: date }))}
                            placeholder="Select exit date"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="exitReason">Reason</Label>
                          <Select
                            value={formData.exitReason || ""}
                            onValueChange={(value) =>
                              setFormData((prev) => ({
                                ...prev,
                                exitReason: value === "CLEAR" ? "" : value
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a reason" />
                            </SelectTrigger>
                            <SelectContent>
                              {formData.exitReason && (
                                <>
                                  <SelectItem value="CLEAR" className="text-muted-foreground italic">
                                    Clear selection
                                  </SelectItem>
                                  <div className="h-px bg-border my-1" />
                                </>
                              )}
                              <SelectItem value="SOLD">Sold</SelectItem>
                              <SelectItem value="DIED">Died</SelectItem>
                              <SelectItem value="STOLEN">Stolen</SelectItem>
                              <SelectItem value="OTHER">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </form>
          </div>

          <div className="border-t mt-6 pt-4">
            <DialogFooter className="flex-shrink-0">
              <div className="flex justify-between w-full">
                <div className="flex gap-2">
                  {selectedAnimal && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => handleDelete(selectedAnimal.id)}
                    >
                      Delete Animal
                    </Button>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setFormDialogOpen(false)
                      setSelectedAnimal(null)
                      setFormData(defaultAnimal)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" form="animal-form">
                    {selectedAnimal ? 'Update Animal' : 'Create Animal'}
                  </Button>
                </div>
              </div>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Animal Profile Dialog */}
      {selectedAnimal && (
        <AnimalViewDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          animal={selectedAnimal}
          imageSrc={selectedAnimal.image ? getImageUrl(selectedAnimal.image) : undefined}
          onDeleteClick={handleDelete}
          onEditClick={(animal) => handleEdit(animal)}
        />
      )}

      <AnimalTypesModal
        open={isTypesModalOpen}
        onOpenChange={setIsTypesModalOpen}
        onTypeSelect={handleTypeSelect}
        onTypeAdded={loadAnimalTypes}
      />
      {/* Animal Health Modal */}
      <AnimalHealthModal
        animal={healthModalAnimal}
        open={isHealthModalOpen}
        onClose={() => {
          setIsHealthModalOpen(false)
          setHealthModalAnimal(null)
        }}
      />

      <div className="mt-6">
        <AnimalsTable
          animals={animals}
          imagePaths={Object.fromEntries(globalImageCache.entries())}
          onView={(animal) => {
            setSelectedAnimal(animal)
            setIsDialogOpen(true)
          }}
          onHealthRecord={(animal) => {
            setHealthModalAnimal(animal)
            setIsHealthModalOpen(true)
          }}
        />
      </div>
    </div>
  )
})

AnimalsPage.displayName = 'AnimalsPage'
