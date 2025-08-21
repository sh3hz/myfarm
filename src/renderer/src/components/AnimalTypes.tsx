import { useState, useEffect } from 'react'
import { Button } from '@renderer/components/ui/button'
import { Toaster } from '@renderer/components/ui/sonner'
import { toast } from 'sonner'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@renderer/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@renderer/components/ui/dialog'
import { Input } from '@renderer/components/ui/input'
import { Label } from '@renderer/components/ui/label'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@renderer/components/ui/table'

interface AnimalType {
  id: number
  name: string
  description: string
  created_at: string
  updated_at: string
}

export function AnimalTypes() {
  const [animalTypes, setAnimalTypes] = useState<AnimalType[]>([])
  const [selectedType, setSelectedType] = useState<AnimalType | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const loadAnimalTypes = async () => {
    const types = await window.api.getAnimalTypes()
    setAnimalTypes(types)
  }

  useEffect(() => {
    loadAnimalTypes()
  }, [])

  const handleSubmit = async (): Promise<void> => {
    try {
      if (selectedType) {
        await window.api.updateAnimalType(selectedType.id, name, description)
        toast.success('Animal type updated successfully')
      } else {
        await window.api.createAnimalType(name, description)
        toast.success('Animal type created successfully')
      }
      setSelectedType(null)
      setName('')
      setDescription('')
      loadAnimalTypes()
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
        toast.error('An animal type with this name already exists')
      } else {
        toast.error('An error occurred while saving the animal type')
      }
    }
  }

  const handleDelete = async (id: number): Promise<void> => {
    try {
      await window.api.deleteAnimalType(id)
      toast.success('Animal type deleted successfully')
      loadAnimalTypes()
    } catch (error) {
      toast.error('An error occurred while deleting the animal type')
    }
  }

  const handleEdit = (type: AnimalType): void => {
    setSelectedType(type)
    setName(type.name)
    setDescription(type.description)
  }

  const handleAdd = (): void => {
    setSelectedType(null)
    setName('')
    setDescription('')
  }

  return (
    <div className="p-4">
      <Toaster />
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Animal Types</h2>
        <Sheet>
          <SheetTrigger asChild>
            <Button onClick={handleAdd}>Add Animal Type</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>{selectedType ? 'Edit' : 'Add'} Animal Type</SheetTitle>
              <SheetDescription>
                {selectedType ? 'Update' : 'Add a new'} animal type in your database.
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <SheetFooter>
              <SheetClose asChild>
                <Button onClick={handleSubmit} type="submit">Save changes</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      <Table>
        <TableCaption>A list of animal types.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {animalTypes.map((type) => (
            <TableRow key={type.id}>
              <TableCell>{type.name}</TableCell>
              <TableCell>{type.description}</TableCell>
              <TableCell>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="mr-2" onClick={() => handleEdit(type)}>
                      Edit
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Edit Animal Type</SheetTitle>
                      <SheetDescription>
                        Make changes to the animal type.
                      </SheetDescription>
                    </SheetHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                          Name
                        </Label>
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">
                          Description
                        </Label>
                        <Input
                          id="description"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    <SheetFooter className="flex gap-4">
                      <SheetClose asChild>
                        <Button onClick={handleSubmit} type="submit" className="flex-1">Save changes</Button>
                      </SheetClose>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="destructive" type="button">Delete</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete Animal Type</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete &quot;{type.name}&quot;? This action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button variant="outline" type="button">Cancel</Button>
                            <Button
                              variant="destructive"
                              type="button"
                              onClick={() => handleDelete(type.id)}
                            >
                              Delete
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
