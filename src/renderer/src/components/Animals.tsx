import { useState, useEffect } from 'react'
import type { Animal, Gender } from '../../../main/database'
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
import { PawPrint } from 'lucide-react'

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
  age: 0,
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
          paths[animal.image] = path || ''
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
      breed: animal.breed || '',
      age: animal.age,
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
        <Sheet>
          <SheetTrigger asChild>
            <Button onClick={() => {
              setSelectedAnimal(null)
              setFormData(defaultAnimal)
            }}>
              Add Animal
            </Button>
          </SheetTrigger>
          <SheetContent className="max-h-[100dvh] overflow-y-auto w-full sm:max-w-lg">
            <SheetHeader>
              <SheetTitle>{selectedAnimal ? 'Edit Animal' : 'Add New Animal'}</SheetTitle>
              <SheetDescription>
                Fill in the details for the animal
              </SheetDescription>
            </SheetHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
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
                  <div className="relative w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    {formData.image && imagePaths[formData.image] ? (
                      <img
                        src={imagePaths[formData.image]}
                        alt="Preview"
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <PawPrint className="w-5 h-5 text-muted-foreground" />
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
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
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
              <TableCell className="font-mono text-xs">{animal.tagNumber || `#${animal.id}`}</TableCell>
              <TableCell className="font-medium">{animal.name}</TableCell>
              <TableCell>{animal.breed || '-'}</TableCell>
              <TableCell>
                {animal.gender === 'MALE' ? '♂' : 
                 animal.gender === 'FEMALE' ? '♀' :
                 animal.gender === 'CASTRATED' ? '♂ (N)' : '?'}
              </TableCell>
              <TableCell>{animal.age} yrs</TableCell>
              <TableCell>{animal.type?.name}</TableCell>
              <TableCell>{animal.dateOfBirth ? new Date(animal.dateOfBirth).toLocaleDateString() : '-'}</TableCell>
              <TableCell>{animal.weight ? `${animal.weight}kg` : '-'}</TableCell>
              <TableCell>
                <div className="space-x-2">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(animal)}>
                        Edit
                      </Button>
                    </SheetTrigger>
                    <SheetContent className="max-h-[100dvh] overflow-y-auto w-full sm:max-w-lg">
                      <SheetHeader>
                        <SheetTitle>Edit Animal</SheetTitle>
                        <SheetDescription>
                          Edit the details for {animal.name}
                        </SheetDescription>
                      </SheetHeader>
                      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                        {formData.image && (
                          <div className="flex justify-center mb-4">
                            <div className="relative w-32 h-32 rounded-full bg-muted flex items-center justify-center">
                              {formData.image && imagePaths[formData.image] ? (
                                <img
                                  src={imagePaths[formData.image]}
                                  alt="Current"
                                  className="object-cover w-full h-full"
                                />
                              ) : (
                                <PawPrint className="w-16 h-16 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                          />
                        </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-tagNumber">Tag Number</Label>
                            <Input
                              id="edit-tagNumber"
                              name="tagNumber"
                              value={formData.tagNumber}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-gender">Gender</Label>
                            <select
                              id="edit-gender"
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
                            <Label htmlFor="edit-dateOfBirth">Date of Birth</Label>
                            <Input
                              id="edit-dateOfBirth"
                              name="dateOfBirth"
                              type="date"
                              value={formData.dateOfBirth}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-weight">Weight (kg)</Label>
                            <Input
                              id="edit-weight"
                              name="weight"
                              type="number"
                              step="0.1"
                              value={formData.weight || ''}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-height">Height (cm)</Label>
                            <Input
                              id="edit-height"
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
                              <Label htmlFor="edit-acquisitionDate">Date</Label>
                              <Input
                                id="edit-acquisitionDate"
                                name="acquisitionDate"
                                type="date"
                                value={formData.acquisitionDate}
                                onChange={handleInputChange}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-acquisitionLocation">Location</Label>
                              <Input
                                id="edit-acquisitionLocation"
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
                              <Label htmlFor="edit-exitDate">Exit Date</Label>
                              <Input
                                id="edit-exitDate"
                                name="exitDate"
                                type="date"
                                value={formData.exitDate}
                                onChange={handleInputChange}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-exitReason">Reason</Label>
                              <select
                                id="edit-exitReason"
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
