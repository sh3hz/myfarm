import type { Animal } from '../../../../shared/types/models'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { AnimalAvatar } from './AnimalAvatar'
import { Button } from '../ui/button'
import { ClipboardPlus } from 'lucide-react'
import type { ReactElement } from 'react'

interface Props {
  animals: Animal[]
  imagePaths: Record<string, string>
  onView: (animal: Animal) => void
  onHealthRecord: (animal: Animal) => void
}

export function AnimalsTable({ animals, imagePaths, onView, onHealthRecord }: Props): ReactElement {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Image</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Tag</TableHead>
          <TableHead>Breed</TableHead>
          <TableHead>Gender</TableHead>
          <TableHead>Age</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>DOB</TableHead>
          <TableHead>Weight (kg)</TableHead>
          <TableHead>Health</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {animals.map((animal) => (
          <TableRow key={animal.id} className="hover:bg-muted/50 transition-colors">
            <TableCell 
              className="cursor-pointer"
              onClick={() => onView(animal)}
            >
              <AnimalAvatar src={animal.image ? imagePaths[animal.image] : undefined} alt={animal.name} size="sm" />
            </TableCell>
            <TableCell 
              className="font-medium cursor-pointer"
              onClick={() => onView(animal)}
            >
              {animal.name}
            </TableCell>
            <TableCell 
              className="font-mono text-xs cursor-pointer"
              onClick={() => onView(animal)}
            >
              {animal.tagNumber}
            </TableCell>
            <TableCell 
              className="cursor-pointer"
              onClick={() => onView(animal)}
            >
              {animal.breed || '-'}
            </TableCell>
            <TableCell 
              className="cursor-pointer"
              onClick={() => onView(animal)}
            >
              {animal.gender === 'MALE' ? '♂' :
                animal.gender === 'FEMALE' ? '♀' :
                  animal.gender === 'CASTRATED' ? '♂ (N)' : '?'}
            </TableCell>
            <TableCell 
              className="cursor-pointer"
              onClick={() => onView(animal)}
            >
              {animal.age && animal.age > 0 ? `${animal.age} yrs` : '-'}
            </TableCell>
            <TableCell 
              className="cursor-pointer"
              onClick={() => onView(animal)}
            >
              {animal.type?.name}
            </TableCell>
            <TableCell 
              className="cursor-pointer"
              onClick={() => onView(animal)}
            >
              {animal.dateOfBirth ? new Date(animal.dateOfBirth).toLocaleDateString() : '-'}
            </TableCell>
            <TableCell 
              className="cursor-pointer"
              onClick={() => onView(animal)}
            >
              {animal.weight ? `${animal.weight}kg` : '-'}
            </TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onHealthRecord(animal)
                }}
                className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-950/20"
                title="Health Records"
              >
                <ClipboardPlus className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
