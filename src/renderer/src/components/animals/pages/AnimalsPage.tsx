import { useState, useEffect, forwardRef, useCallback } from 'react'
import * as React from 'react'
import type { Animal, Gender } from '../../../../../shared/types/models'
import { Button } from '../../ui/button'
import { Input } from '../../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerClose
} from '../../ui/drawer'
import { Label } from '../../ui/label'
import { toast } from 'sonner'
import { PawPrint, Plus, FileText } from 'lucide-react'
import { AnimalsToolbar, AnimalViewDialog, AnimalsTable } from '..'
import { AnimalTypesModal } from '../AnimalTypesModal'

interface AnimalFormData extends Omit<Animal, 'id' | 'created_at' | 'updated_at' | 'type'> {
  type_id: number
  image?: string
  documents?: string[]
  tagNumber?: string
  gender: Gender
  dateOfBirth?: string
  weight?: number
  height?: number
  acquisitionDate?: string
  acquisitionLocation?: string
  exitDate?: string
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
  dateOfBirth: '',
  weight: undefined,
  height: undefined,
  acquisitionDate: '',
  acquisitionLocation: '',
  exitDate: '',
  exitReason: ''
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
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [isTypesModalOpen, setIsTypesModalOpen] = useState(false)
  const [formData, setFormData] = useState<AnimalFormData>({ ...defaultAnimal })
  const [, forceUpdate] = useState({})

  React.useImperativeHandle(ref, () => ({
    openDialog: (): void => {
      setDrawerOpen(true)
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
      documents: animal.documents || []
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

    setDrawerOpen(true)
  }, [])

  const handleTypeSelect = (typeId: number): void => {
    setFormData((prev) => ({
      ...prev,
      type_id: typeId
    }))
    setIsTypesModalOpen(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
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
          type: typeName
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
        setDrawerOpen(false)
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
        await window.api.deleteAnimal(id)
        await loadAnimals()
        toast.success('Animal deleted successfully')
        if (selectedAnimal?.id === id) {
          setSelectedAnimal(null)
          setIsDialogOpen(false)
        }
        setDrawerOpen(false)
      } catch (error) {
        console.error('Error deleting animal:', error)
        toast.error('Failed to delete animal')
      }
    },
    [loadAnimals, selectedAnimal]
  )

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Animals</h2>
        <div className="flex items-center gap-2">
          <AnimalsToolbar
            onAdd={() => {
              setSelectedAnimal(null)
              setFormData(defaultAnimal)
              setDrawerOpen(true)
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

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="flex flex-col h-[100dvh] w-full">
          <DrawerHeader>
            <DrawerTitle>{selectedAnimal ? 'Edit Animal' : 'Add New Animal'}</DrawerTitle>
            <DrawerDescription>Fill in the details for the animal</DrawerDescription>
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto px-4">
            <form onSubmit={handleSubmit} className="space-y-4 mt-4" id="animal-form">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="breed">Breed</Label>
                  <Input
                    id="breed"
                    name="breed"
                    value={formData.breed}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    value={formData.age ?? ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type_id">Animal Type *</Label>
                  <div className="flex space-x-2">
                    {/* Hidden input for HTML5 validation */}
                    <input
                      type="hidden"
                      name="type_id"
                      value={formData.type_id || ''}
                      required
                      onChange={() => { }} // Controlled by Select component
                    />
                    <Select
                      value={formData.type_id ? formData.type_id.toString() : ''}
                      onValueChange={(value) => {
                        setFormData((prev) => ({
                          ...prev,
                          type_id: value ? parseInt(value) : 0
                        }))
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a type" />
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
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tagNumber">Tag Number</Label>
                  <Input
                    id="tagNumber"
                    name="tagNumber"
                    value={formData.tagNumber}
                    onChange={handleInputChange}
                  />
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
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="CASTRATED">Castrated</SelectItem>
                      <SelectItem value="UNKNOWN">Unknown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    name="weight"
                    type="number"
                    step="0.1"
                    value={formData.weight || ''}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    name="height"
                    type="number"
                    step="0.1"
                    value={formData.height || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Acquisition</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="acquisitionDate">Date</Label>
                    <Input
                      id="acquisitionDate"
                      name="acquisitionDate"
                      type="date"
                      value={formData.acquisitionDate}
                      onChange={handleInputChange}
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
                </div>
              </div>

              <div className="space-y-2">
                <Label>Exit Information</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="exitDate">Exit Date</Label>
                    <Input
                      id="exitDate"
                      name="exitDate"
                      type="date"
                      value={formData.exitDate}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="exitReason">Reason</Label>
                    <Select
                      value={formData.exitReason}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          exitReason: value
                        }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a reason" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SOLD">Sold</SelectItem>
                        <SelectItem value="DIED">Died</SelectItem>
                        <SelectItem value="STOLEN">Stolen</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Image</Label>
                <div className="flex items-center space-x-2">
                  <div className="relative w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    {formData.image && getImageUrl(formData.image) ? (
                      <img
                        src={getImageUrl(formData.image)}
                        alt="Preview"
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <PawPrint className="w-7 h-7 text-muted-foreground" />
                    )}
                  </div>
                  <Input
                    id="image"
                    name="image"
                    type="file"
                    accept="image/*"
                    className="flex-1"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        try {
                          const reader = new FileReader()
                          reader.onload = async (e) => {
                            const imageData = e.target?.result as string
                            const savedPath = await window.api.saveImage(imageData)
                            const fullPath = await window.api.getImagePath(savedPath)

                            // Update global cache
                            globalImageCache.set(savedPath, fullPath)
                            forceUpdate({})
                            setFormData((prev) => ({
                              ...prev,
                              image: savedPath
                            }))
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="documents">Documents</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="relative w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                      <FileText className="w-7 h-7 text-muted-foreground" />
                    </div>
                    <Input
                      id="documents"
                      name="documents"
                      type="file"
                      multiple
                      accept="*/*"
                      className="flex-1"
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
                  </div>
                  {formData.documents && formData.documents.length > 0 && (
                    <div className="flex flex-wrap gap-1 max-w-full">
                      {formData.documents.map((doc, index) => {
                        const displayName = doc.replace(/_\d+(\.[^.]+)?$/, '$1')
                        const truncatedName = displayName.length > 25
                          ? `${displayName.substring(0, 22)}...`
                          : displayName

                        return (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded-md max-w-full"
                            title={displayName}
                          >
                            <FileText className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{truncatedName}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  documents: prev.documents?.filter((_, i) => i !== index) || []
                                }))
                              }}
                              className="ml-1 text-muted-foreground hover:text-foreground flex-shrink-0"
                              title="Remove document"
                            >
                              ×
                            </button>
                          </span>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>
          <DrawerFooter className="flex flex-row gap-2 pt-4">
            <Button type="submit" form="animal-form" className="flex-1">
              {selectedAnimal ? 'Update' : 'Create'} Animal
            </Button>
            <DrawerClose asChild>
              <Button type="button" variant="outline" className="flex-1">
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

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
      <div className="mt-6">
        <AnimalsTable
          animals={animals}
          imagePaths={Object.fromEntries(globalImageCache.entries())}
          onView={(animal) => {
            setSelectedAnimal(animal)
            setIsDialogOpen(true)
          }}
        />
      </div>
    </div>
  )
})

AnimalsPage.displayName = 'AnimalsPage'
