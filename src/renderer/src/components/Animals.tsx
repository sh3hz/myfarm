import { useState, useEffect, forwardRef } from 'react'
import * as React from 'react'
import type { Animal, Gender } from '../../../shared/types/models'
import { Button } from './ui/button'
import { Input } from './ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from './ui/drawer'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table'
import { Label } from './ui/label'
import { toast } from 'sonner'
import { PawPrint, Download } from 'lucide-react'

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

export const Animals = forwardRef<AnimalsHandles>((_, ref) => {
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
    const loadImages = async () => {
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
    setFormData(prev => ({
      ...prev,
      [name]: name === 'age'
        ? (value === '' ? undefined : Number(value))
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
          <Button
            variant="outline"
            onClick={async () => {
              const res = await window.api.exportAnimalsToExcel()
              if (res?.success) {
                toast.success('Exported to Excel', { description: res.filePath })
              } else {
                toast.error(res?.message || 'Export failed')
              }
            }}
          >
            <Download className="mr-2 h-4 w-4" /> Export to Excel
          </Button>
        
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerTrigger asChild>
            <Button onClick={() => {
              setSelectedAnimal(null)
              setFormData(defaultAnimal)
              setDrawerOpen(true)
            }}>
              Add Animal
            </Button>
          </DrawerTrigger>
          <DrawerContent className="flex flex-col h-[100dvh] w-full">
            <DrawerHeader>
              <DrawerTitle>{selectedAnimal ? 'Edit Animal' : 'Add New Animal'}</DrawerTitle>
              <DrawerDescription>
                Fill in the details for the animal
              </DrawerDescription>
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
                      {animalTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
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
                              setImagePaths(prev => ({
                                ...prev,
                                [savedPath]: fullPath
                              }))
                              setFormData(prev => ({
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
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{viewAnimal?.name}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Left: Large Image + Description */}
            <div className="space-y-3">
              <div className="relative w-full aspect-square rounded-lg bg-muted overflow-hidden flex items-center justify-center">
                {viewAnimal?.image && imagePaths[viewAnimal.image] ? (
                  <img
                    src={imagePaths[viewAnimal.image]}
                    alt={viewAnimal.name}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <PawPrint className="w-20 h-20 text-muted-foreground" />
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {viewAnimal?.description || 'No description provided.'}
              </div>
            </div>

            {/* Right: Details */}
            <div className="space-y-2 text-sm">
              <div><span className="text-muted-foreground">Tag:</span> {viewAnimal?.tagNumber || '-'}</div>
              <div><span className="text-muted-foreground">Breed:</span> {viewAnimal?.breed || '-'}</div>
              <div>
                <span className="text-muted-foreground">Gender:</span>{' '}
                {viewAnimal
                  ? viewAnimal.gender === 'MALE'
                    ? 'Male'
                    : viewAnimal.gender === 'FEMALE'
                      ? 'Female'
                      : viewAnimal.gender === 'CASTRATED'
                        ? 'Castrated'
                        : 'Unknown'
                  : '-'}
              </div>
              <div>
                <span className="text-muted-foreground">Age:</span>{' '}
                {viewAnimal?.age && viewAnimal.age > 0 ? `${viewAnimal.age} yrs` : '-'}
              </div>
              <div><span className="text-muted-foreground">Type:</span> {viewAnimal?.type?.name || '-'}</div>
              <div>
                <span className="text-muted-foreground">DOB:</span>{' '}
                {viewAnimal?.dateOfBirth ? new Date(viewAnimal.dateOfBirth).toLocaleDateString() : '-'}
              </div>
              <div>
                <span className="text-muted-foreground">Weight:</span>{' '}
                {viewAnimal?.weight ? `${viewAnimal.weight} kg` : '-'}
              </div>
              <div>
                <span className="text-muted-foreground">Height:</span>{' '}
                {viewAnimal?.height ? `${viewAnimal.height} cm` : '-'}
              </div>
              <div>
                <span className="text-muted-foreground">Acquired:</span>{' '}
                {viewAnimal?.acquisitionDate ? new Date(viewAnimal.acquisitionDate).toLocaleDateString() : '-'}{' '}
                {viewAnimal?.acquisitionLocation ? `(${viewAnimal.acquisitionLocation})` : ''}
              </div>
              <div>
                <span className="text-muted-foreground">Exit:</span>{' '}
                {viewAnimal?.exitDate ? new Date(viewAnimal.exitDate).toLocaleDateString() : '-'}{' '}
                {viewAnimal?.exitReason ? `(${viewAnimal.exitReason})` : ''}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setViewOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>ID</TableHead>
            <TableHead>Breed</TableHead>
            <TableHead>Gender</TableHead>
            <TableHead>Age</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>DOB</TableHead>
            <TableHead>Weight (kg)</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {animals.map(animal => (
            <TableRow key={animal.id}>
              <TableCell>
                <div className="relative w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  {animal.image && imagePaths[animal.image] ? (
                    <img
                      src={imagePaths[animal.image]}
                      alt={animal.name}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <PawPrint className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </TableCell>
              <TableCell className="font-medium">{animal.name}</TableCell>
              <TableCell className="font-mono text-xs">{animal.tagNumber}</TableCell>
              <TableCell>{animal.breed || '-'}</TableCell>
              <TableCell>
                {animal.gender === 'MALE' ? '♂' : 
                 animal.gender === 'FEMALE' ? '♀' :
                 animal.gender === 'CASTRATED' ? '♂ (N)' : '?'}
              </TableCell>
              <TableCell>{animal.age && animal.age > 0 ? `${animal.age} yrs` : '-'}</TableCell>
              <TableCell>{animal.type?.name}</TableCell>
              <TableCell>{animal.dateOfBirth ? new Date(animal.dateOfBirth).toLocaleDateString() : '-'}</TableCell>
              <TableCell>{animal.weight ? `${animal.weight}kg` : '-'}</TableCell>
              <TableCell>
                <Button
                  variant="secondary"
                  size="sm"
                  className="mr-2"
                  onClick={() => {
                    setViewAnimal(animal)
                    setViewOpen(true)
                  }}
                >
                  View
                </Button>
                <Button variant="outline" size="sm" onClick={() => {
                  handleEdit(animal)
                  setDrawerOpen(true)
                }}>
                  Edit
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
})

Animals.displayName = 'Animals'
