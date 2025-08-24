import type { Animal } from '../../../../shared/types/models'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { AnimalAvatar } from './AnimalAvatar'
import type { ReactElement } from 'react'

interface Props {
  animals: Animal[]
  imagePaths: Record<string, string>
  onView: (animal: Animal) => void
}

export function AnimalsTable({ animals, imagePaths, onView }: Props): ReactElement {
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
        </TableRow>
      </TableHeader>
      <TableBody>
        {animals.map((animal) => (
          <TableRow
            key={animal.id}
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => onView(animal)}
          >
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
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
