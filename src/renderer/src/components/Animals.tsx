import { useState, useEffect } from 'react'
import type { Animal } from '../../../main/database'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet'
import { Label } from './ui/label'
import { toast } from 'sonner'
import animalPlaceholder from '../assets/animal-placeholder.svg'

interface AnimalFormData extends Omit<Animal, 'id' | 'created_at' | 'updated_at' | 'type'> {
  type_id: number
  image?: string
}

const defaultAnimal: AnimalFormData = {
  name: '',
  age: 0,
  type_id: 0,
  description: '',
  image: ''
}

export function Animals(): React.ReactElement {
  const [animals, setAnimals] = useState<Animal[]>([])
  const [animalTypes, setAnimalTypes] = useState<{ id: number; name: string }[]>([])
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null)
  const [formData, setFormData] = useState<AnimalFormData>(defaultAnimal)
  const [imagePaths, setImagePaths] = useState<Record<string, string>>({})

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
          paths[animal.image] = path || animalPlaceholder
        }
      }
      setImagePaths(paths)
    }
    loadImages()
  }, [animals])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'age' || name === 'type_id' ? Number(value) : value
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
      breed: animal.breed,
      age: animal.age,
      type_id: animal.type_id,
      description: animal.description,
      image: animal.image
    })
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Animals</h2>
        <Sheet>
          <SheetTrigger asChild>
            <Button onClick={() => {
              setSelectedAnimal(null)
              setFormData(defaultAnimal)
            }}>
              Add Animal
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>{selectedAnimal ? 'Edit Animal' : 'Add New Animal'}</SheetTitle>
              <SheetDescription>
                Fill in the details for the animal
              </SheetDescription>
            </SheetHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
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
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={handleInputChange}
                  required
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
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Image</Label>
                <div className="flex items-center space-x-2">
                  {formData.image && (
                    <div className="relative w-10 h-10 overflow-hidden rounded-full bg-muted">
                      <img
                        src={formData.image ? imagePaths[formData.image] || animalPlaceholder : animalPlaceholder}
                        alt="Preview"
                        className="object-cover w-full h-full"
                      />
                    </div>
                  )}
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
                              [savedPath]: fullPath || animalPlaceholder
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
              <Button type="submit" className="w-full">
                {selectedAnimal ? 'Update' : 'Create'} Animal
              </Button>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Breed</TableHead>
            <TableHead>Age</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {animals.map(animal => (
            <TableRow key={animal.id}>
              <TableCell>
                <div className="relative w-10 h-10 overflow-hidden rounded-full bg-muted">
                  <img
                    src={animal.image ? imagePaths[animal.image] || animalPlaceholder : animalPlaceholder}
                    alt={animal.name}
                    className="object-cover w-full h-full"
                  />
                </div>
              </TableCell>
              <TableCell>{animal.name}</TableCell>
              <TableCell>{animal.breed}</TableCell>
              <TableCell>{animal.age}</TableCell>
              <TableCell>{animal.type?.name}</TableCell>
              <TableCell>{animal.description}</TableCell>
              <TableCell>
                <div className="space-x-2">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(animal)}>
                        Edit
                      </Button>
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>Edit Animal</SheetTitle>
                        <SheetDescription>
                          Edit the details for {animal.name}
                        </SheetDescription>
                      </SheetHeader>
                      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                        {formData.image && (
                          <div className="flex justify-center mb-4">
                            <div className="relative w-32 h-32 overflow-hidden rounded-full bg-muted">
                              <img
                                src={imagePaths[formData.image] || animalPlaceholder}
                                alt="Current"
                                className="object-cover w-full h-full"
                              />
                            </div>
                          </div>
                        )}
                        <div className="space-y-2">
                          <Label htmlFor="edit-name">Name</Label>
                          <Input
                            id="edit-name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-breed">Breed</Label>
                          <Input
                            id="edit-breed"
                            name="breed"
                            value={formData.breed}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-age">Age</Label>
                          <Input
                            id="edit-age"
                            name="age"
                            type="number"
                            value={formData.age}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-type_id">Animal Type</Label>
                          <select
                            id="edit-type_id"
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
                        <div className="space-y-2">
                          <Label htmlFor="edit-description">Description</Label>
                          <Input
                            id="edit-description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-image">Replace Image</Label>
                          <Input
                            id="edit-image"
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
                                      [savedPath]: fullPath || animalPlaceholder
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
                        <div className="flex gap-4 mt-4">
                          <Button type="submit" className="flex-1">
                            Update Animal
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="destructive" type="button">
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
                                  onClick={() => handleDelete(animal.id)}
                                >
                                  Delete
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </form>
                    </SheetContent>
                  </Sheet>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
