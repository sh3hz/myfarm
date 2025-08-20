import { useState, useEffect } from 'react'
import { Button } from '@renderer/components/ui/button'
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
  const [isAdding, setIsAdding] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const loadAnimalTypes = async () => {
    const types = await window.api.getAnimalTypes()
    setAnimalTypes(types)
  }

  useEffect(() => {
    loadAnimalTypes()
  }, [])

  const handleSubmit = async () => {
    if (selectedType) {
      await window.api.updateAnimalType(selectedType.id, name, description)
    } else {
      await window.api.createAnimalType(name, description)
    }
    setSelectedType(null)
    setName('')
    setDescription('')
    loadAnimalTypes()
  }

  const handleDelete = async (id: number) => {
    await window.api.deleteAnimalType(id)
    loadAnimalTypes()
  }

  const handleEdit = (type: AnimalType) => {
    setSelectedType(type)
    setName(type.name)
    setDescription(type.description)
  }

  const handleAdd = () => {
    setSelectedType(null)
    setName('')
    setDescription('')
    setIsAdding(true)
  }

  return (
    <div className="p-4">
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
            <TableHead>Created At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {animalTypes.map((type) => (
            <TableRow key={type.id}>
              <TableCell>{type.name}</TableCell>
              <TableCell>{type.description}</TableCell>
              <TableCell>{new Date(type.created_at).toLocaleDateString()}</TableCell>
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
                    <SheetFooter>
                      <SheetClose asChild>
                        <Button onClick={handleSubmit} type="submit">Save changes</Button>
                      </SheetClose>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
                <Button variant="destructive" onClick={() => handleDelete(type.id)}>
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
