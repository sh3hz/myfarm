import type { Animal } from '../../../../shared/types/models'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Button } from '../ui/button'
import { AnimalAvatar } from './AnimalAvatar'
import type { ReactElement } from 'react'

interface Props {
  animals: Animal[]
  imagePaths: Record<string, string>
  onView: (animal: Animal) => void
  onEdit: (animal: Animal) => void
}

export function AnimalsTable({ animals, imagePaths, onView, onEdit }: Props): ReactElement {
  return (
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
        {animals.map((animal) => (
          <TableRow key={animal.id}>
            <TableCell>
              <AnimalAvatar src={animal.image ? imagePaths[animal.image] : undefined} alt={animal.name} size="sm" />
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
                onClick={() => onView(animal)}
              >
                View
              </Button>
              <Button variant="outline" size="sm" onClick={() => onEdit(animal)}>
                Edit
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
