import { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { Button } from '@renderer/components/ui/button'
import { toast } from 'sonner'
import { Input } from '@renderer/components/ui/input'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@renderer/components/ui/table'
import { Trash2, Save, X, Plus } from 'lucide-react'

interface AnimalType {
  id: number | 'new'
  name: string
  description: string
  created_at?: string
  updated_at?: string
  isEditing?: boolean
}

interface AnimalTypesHandles {
  openDialog: () => void
}

export const AnimalTypesPage = forwardRef<AnimalTypesHandles>((_, ref) => {
  const [animalTypes, setAnimalTypes] = useState<AnimalType[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [newType, setNewType] = useState<Omit<AnimalType, 'id'>>({ 
    name: '', 
    description: '',
    isEditing: true 
  })

  useImperativeHandle(ref, () => ({
    openDialog: () => {
      setIsAdding(true)
      setNewType({ name: '', description: '', isEditing: true })
    }
  }))

  const loadAnimalTypes = async (): Promise<void> => {
    try {
      const types = await window.api.getAnimalTypes()
      setAnimalTypes(types.map(type => ({ ...type, isEditing: false })))
    } catch (error) {
      toast.error('Failed to load animal types')
    }
  }

  useEffect(() => {
    loadAnimalTypes()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'name' | 'description', id: number | 'new') => {
    if (id === 'new') {
      setNewType(prev => ({ ...prev, [field]: e.target.value }))
    } else {
      setAnimalTypes(prev => 
        prev.map(type => 
          type.id === id ? { ...type, [field]: e.target.value } : type
        )
      )
    }
  }

  const handleSave = async (type: AnimalType): Promise<void> => {
    try {
      if (type.id === 'new') {
        await window.api.createAnimalType(type.name, type.description)
        toast.success('Animal type created successfully')
        setIsAdding(false)
        setNewType({ name: '', description: '', isEditing: true })
      } else {
        await window.api.updateAnimalType(type.id, type.name, type.description)
        toast.success('Animal type updated successfully')
      }
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

  const startEditing = (id: number): void => {
    setAnimalTypes(prev => 
      prev.map(type => ({
        ...type,
        isEditing: type.id === id
      }))
    )
  }

  const cancelEditing = (id: number | 'new'): void => {
    if (id === 'new') {
      setIsAdding(false)
      setNewType({ name: '', description: '', isEditing: true })
    } else {
      setAnimalTypes(prev => 
        prev.map(type => ({
          ...type,
          isEditing: false
        }))
      )
      loadAnimalTypes()
    }
  }

  const handleAddNew = (): void => {
    if (isAdding) return
    setIsAdding(true)
    setNewType({ name: '', description: '', isEditing: true })
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Animal Types</h2>
        <Button onClick={handleAddNew} disabled={isAdding}>
          <Plus className="mr-2 h-4 w-4" /> Add Animal Type
        </Button>
      </div>

      <Table>
        <TableCaption>A list of animal types.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="w-48">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* New animal type row */}
          {isAdding && (
            <TableRow className="bg-muted/50">
              <TableCell>
                <Input
                  value={newType.name}
                  onChange={(e) => handleInputChange(e, 'name', 'new')}
                  placeholder="Enter name"
                  className="w-full"
                />
              </TableCell>
              <TableCell>
                <Input
                  value={newType.description}
                  onChange={(e) => handleInputChange(e, 'description', 'new')}
                  placeholder="Enter description"
                  className="w-full"
                />
              </TableCell>
              <TableCell className="space-x-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => cancelEditing('new')}
                >
                  <X className="h-4 w-4 mr-1" /> Cancel
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => handleSave({...newType, id: 'new'})}
                  disabled={!newType.name.trim()}
                >
                  <Save className="h-4 w-4 mr-1" /> Save
                </Button>
              </TableCell>
            </TableRow>
          )}

          {/* Existing animal types */}
          {animalTypes.map((type) => (
            <TableRow key={type.id}>
              <TableCell>
                {type.isEditing ? (
                  <Input
                    value={type.name}
                    onChange={(e) => handleInputChange(e, 'name', type.id)}
                    className="w-full"
                  />
                ) : (
                  type.name
                )}
              </TableCell>
              <TableCell>
                {type.isEditing ? (
                  <Input
                    value={type.description}
                    onChange={(e) => handleInputChange(e, 'description', type.id)}
                    className="w-full"
                  />
                ) : (
                  type.description
                )}
              </TableCell>
              <TableCell className="space-x-2">
                {type.isEditing ? (
                  <>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => cancelEditing(type.id)}
                      className="h-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => handleSave(type)}
                      disabled={!type.name.trim()}
                      className="h-8"
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => handleDelete(type.id as number)}
                      className="h-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => startEditing(type.id as number)}
                      className="h-8"
                    >
                      Edit
                    </Button>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
})

AnimalTypesPage.displayName = 'AnimalTypesPage'
