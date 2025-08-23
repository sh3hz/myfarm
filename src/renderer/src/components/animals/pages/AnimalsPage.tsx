import { useState, useEffect, forwardRef } from 'react'
import * as React from 'react'
import type { Animal, Gender } from '../../../../../shared/types/models'
import { Button } from '../../ui/button'
import { Input } from '../../ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '../../ui/dialog'
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
import { PawPrint } from 'lucide-react'
import { AnimalsToolbar, AnimalViewDialog, AnimalsTable } from '..'

interface AnimalFormData extends Omit<Animal, 'id' | 'created_at' | 'updated_at' | 'type'> {
  type_id: number
  image?: string
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

export const AnimalsPage = forwardRef<AnimalsHandles, unknown>((_, ref): React.ReactElement => {
  const [animals, setAnimals] = useState<Animal[]>([])
  const [animalTypes, setAnimalTypes] = useState<{ id: number; name: string }[]>([])
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null)
  const [formData, setFormData] = useState<AnimalFormData>(defaultAnimal)
  const [imagePaths, setImagePaths] = useState<Record<string, string>>({})
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [viewAnimal, setViewAnimal] = useState<Animal | null>(null)

  React.useImperativeHandle(ref, () => ({
    openDialog: (): void => {
      setDrawerOpen(true)
    }
  }))

  const loadAnimals = async (): Promise<void> => {
    const fetchedAnimals = await window.api.getAnimals()
    setAnimals(fetchedAnimals)
  }

  const loadAnimalTypes = async (): Promise<void> => {
    const types = await window.api.getAnimalTypes()
    setAnimalTypes(types)
  }

  useEffect(() => {
    loadAnimals()
    loadAnimalTypes()
  }, [])

  useEffect(() => {
    const loadImages = async (): Promise<void> => {
      const paths: Record<string, string> = {}
      for (const animal of animals) {
        if (animal.image) {
          const path = await window.api.getImagePath(animal.image)
          paths[animal.image] = path || ''
        }
      }
      setImagePaths(paths)
    }
    loadImages()
  }, [animals])

  useEffect(() => {
    if (drawerOpen && !selectedAnimal) {
      setFormData(defaultAnimal)
    }
  }, [drawerOpen, selectedAnimal])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'age'
          ? value === ''
            ? undefined
            : Number(value)
          : name === 'type_id'
            ? Number(value)
            : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    try {
      if (selectedAnimal) {
        await window.api.updateAnimal(selectedAnimal.id, formData)
        toast.success('Animal updated successfully')
      } else {
        await window.api.createAnimal(formData)
        toast.success('Animal created successfully')
      }
      setSelectedAnimal(null)
      setFormData(defaultAnimal)
      setDrawerOpen(false)
      loadAnimals()
    } catch (error) {
      toast.error('Error saving animal')
      console.error('Error saving animal:', error)
    }
  }

  const handleDelete = async (id: number): Promise<void> => {
    try {
      await window.api.deleteAnimal(id)
      toast.success('Animal deleted successfully')
      setDrawerOpen(false)
      loadAnimals()
    } catch (error) {
      toast.error('Error deleting animal')
      console.error('Error deleting animal:', error)
    }
  }

  const handleEdit = (animal: Animal): void => {
    setSelectedAnimal(animal)
    setFormData({
      name: animal.name,
      breed: animal.breed || '',
      age: animal.age ?? undefined,
      type_id: animal.type_id,
      description: animal.description,
      image: animal.image,
      gender: animal.gender,
      tagNumber: animal.tagNumber || '',
      dateOfBirth: animal.dateOfBirth || '',
      weight: animal.weight,
      height: animal.height,
      acquisitionDate: animal.acquisitionDate || '',
      acquisitionLocation: animal.acquisitionLocation || '',
      exitDate: animal.exitDate || '',
      exitReason: animal.exitReason || ''
    })
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
                    <Label htmlFor="type_id">Animal Type</Label>
                    <select
                      id="type_id"
                      name="type_id"
                      value={formData.type_id}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-md border border-input bg-background px-3 py-2"
                    >
                      <option value="">Select a type</option>
                      {animalTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
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
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="CASTRATED">Castrated</option>
                      <option value="UNKNOWN">Unknown</option>
                    </select>
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
                      <select
                        id="exitReason"
                        name="exitReason"
                        value={formData.exitReason || ''}
                        onChange={handleInputChange}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">N/A</option>
                        <option value="ADOPTED">Adopted</option>
                        <option value="RELEASED">Released</option>
                        <option value="DECEASED">Deceased</option>
                        <option value="TRANSFERRED">Transferred</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image">Image</Label>
                  <div className="flex items-center space-x-2">
                    <div className="relative w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                      {formData.image && imagePaths[formData.image] ? (
                        <img
                          src={imagePaths[formData.image]}
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
                              setImagePaths((prev) => ({
                                ...prev,
                                [savedPath]: fullPath
                              }))
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
              </form>
            </div>
            <DrawerFooter className="flex flex-row gap-2 pt-4">
              <Button type="submit" form="animal-form" className="flex-1">
                {selectedAnimal ? 'Update' : 'Create'} Animal
              </Button>
              {selectedAnimal && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="destructive" type="button" className="flex-1">
                      Delete
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Are you sure you want to delete this animal?</DialogTitle>
                      <DialogDescription>
                        This action cannot be undone. This will permanently delete {formData.name}.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" type="button">
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        type="button"
                        onClick={() => handleDelete(selectedAnimal.id)}
                      >
                        Delete
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
              <DrawerClose asChild>
                <Button type="button" variant="outline" className="flex-1">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
        </div>
      </div>

      {/* Animal Profile Dialog */}
      <AnimalViewDialog
        open={viewOpen}
        onOpenChange={setViewOpen}
        animal={viewAnimal}
        imageSrc={viewAnimal?.image ? imagePaths[viewAnimal.image] : undefined}
      />

      <AnimalsTable
        animals={animals}
        imagePaths={imagePaths}
        onView={(animal) => {
          setViewAnimal(animal)
          setViewOpen(true)
        }}
        onEdit={(animal) => {
          handleEdit(animal)
          setDrawerOpen(true)
        }}
      />
    </div>
  )
})

AnimalsPage.displayName = 'AnimalsPage'
