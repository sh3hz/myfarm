import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'
import { Trash2, Save, X, Plus } from 'lucide-react'

interface AnimalType {
  id: number | 'new'
  name: string
  description: string
  created_at?: string
  updated_at?: string
  isEditing?: boolean
}

interface AnimalTypesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onTypeSelect?: (typeId: number) => void
  onTypeAdded?: () => Promise<void>
}

export function AnimalTypesModal({ 
  open, 
  onOpenChange, 
  onTypeSelect, 
  onTypeAdded 
}: AnimalTypesModalProps): React.JSX.Element {
  const [animalTypes, setAnimalTypes] = useState<AnimalType[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [newType, setNewType] = useState<Omit<AnimalType, 'id'>>({ 
    name: '', 
    description: '',
    isEditing: true 
  })

  const loadAnimalTypes = async (): Promise<void> => {
    try {
      const types = await window.api.getAnimalTypes()
      setAnimalTypes(types.map(type => ({ ...type, isEditing: false })))
    } catch (error) {
      toast.error('Failed to load animal types')
    }
  }

  useEffect(() => {
    if (open) {
      loadAnimalTypes()
    }
  }, [open])

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
        if (onTypeAdded) {
          await onTypeAdded()
        }
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
      await loadAnimalTypes()
      if (onTypeAdded) {
        await onTypeAdded()
      }
    } catch (error) {
      console.error('Error deleting animal type:', error)
      toast.error('An error occurred while deleting the animal type')
    }
  }

  const cancelEditing = (id: number | 'new'): void => {
    if (id === 'new') {
      setIsAdding(false)
      setNewType({ name: '', description: '', isEditing: true })
    } else {
      setAnimalTypes(prev =>
        prev.map(type =>
          type.id === id ? { ...type, isEditing: false } : type
        )
      )
    }
  }

  const handleAddNew = (): void => {
    setIsAdding(true)
    setNewType({ name: '', description: '', isEditing: true })
  }

  const handleTypeSelect = (type: AnimalType): void => {
    if (onTypeSelect && typeof type.id === 'number') {
      onTypeSelect(type.id)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Animal Types</DialogTitle>
          <DialogDescription>
            Add, edit, or remove animal types from the system.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Animal Types</h3>
            <Button size="sm" onClick={handleAddNew}>
              <Plus className="mr-2 h-4 w-4" /> Add Type
            </Button>
          </div>

          <div className="rounded-md border
">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isAdding && (
                  <TableRow>
                    <TableCell>
                      <Input
                        value={newType.name}
                        onChange={(e) => handleInputChange(e, 'name', 'new')}
                        placeholder="Type name"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={newType.description}
                        onChange={(e) => handleInputChange(e, 'description', 'new')}
                        placeholder="Type description"
                      />
                    </TableCell>
                    <TableCell className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleSave({ ...newType, id: 'new' })}
                        disabled={!newType.name.trim()}
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => cancelEditing('new')}>
                        <X className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
                {animalTypes.map((type) => (
                  <TableRow key={type.id} onClick={() => onTypeSelect && handleTypeSelect(type)} className={onTypeSelect ? 'cursor-pointer hover:bg-muted/50' : ''}>
                    <TableCell>
                      {type.isEditing ? (
                        <Input
                          value={type.name}
                          onChange={(e) => handleInputChange(e, 'name', type.id)}
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
                        />
                      ) : (
                        type.description || 'No description'
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {type.isEditing ? (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleSave(type)
                              }}
                              disabled={!type.name.trim()}
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation()
                                cancelEditing(type.id)
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation()
                                setAnimalTypes(prev =>
                                  prev.map(t =>
                                    t.id === type.id ? { ...t, isEditing: true } : t
                                  )
                                )
                              }}
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation()
                                if (typeof type.id === 'number') {
                                  handleDelete(type.id)
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {animalTypes.length === 0 && !isAdding && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No animal types found. Add one to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
