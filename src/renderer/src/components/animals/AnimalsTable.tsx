import type { Animal } from '../../../../shared/types/models'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { AnimalAvatar } from './AnimalAvatar'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { ClipboardPlus, Eye, Edit, Calendar, Weight, Ruler } from 'lucide-react'
import type { ReactElement } from 'react'

interface Props {
  animals: Animal[]
  imagePaths: Record<string, string>
  onView: (animal: Animal) => void
  onHealthRecord: (animal: Animal) => void
  onEdit?: (animal: Animal) => void
}

export function AnimalsTable({ animals, imagePaths, onView, onHealthRecord, onEdit }: Props): ReactElement {
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getGenderDisplay = (gender: string) => {
    switch (gender) {
      case 'MALE':
        return { symbol: '♂', text: 'Male', color: 'text-blue-600 dark:text-blue-400' }
      case 'FEMALE':
        return { symbol: '♀', text: 'Female', color: 'text-pink-600 dark:text-pink-400' }
      case 'CASTRATED':
        return { symbol: '♂', text: 'Castrated', color: 'text-gray-600 dark:text-gray-400' }
      default:
        return { symbol: '?', text: 'Unknown', color: 'text-gray-500' }
    }
  }

  const getAgeDisplay = (age: number | null | undefined, dateOfBirth: string | null | undefined) => {
    if (age && age > 0) {
      return `${age} ${age === 1 ? 'yr' : 'yrs'}`
    }
    if (dateOfBirth) {
      const birthDate = new Date(dateOfBirth)
      const today = new Date()
      const ageInYears = Math.floor((today.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      return ageInYears > 0 ? `${ageInYears} ${ageInYears === 1 ? 'yr' : 'yrs'}` : '< 1 yr'
    }
    return '-'
  }

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-16">Image</TableHead>
            <TableHead className="w-20">Tag</TableHead>
            <TableHead className="min-w-32">Name</TableHead>
            <TableHead className="min-w-24">Type</TableHead>
            <TableHead className="min-w-32">Breed</TableHead>
            <TableHead className="w-20">Gender</TableHead>
            <TableHead className="w-16">Age</TableHead>
            <TableHead className="w-24">DOB</TableHead>
            <TableHead className="w-20">Weight</TableHead>
            <TableHead className="w-20">Height</TableHead>
            <TableHead className="min-w-28">Acquisition</TableHead>
            <TableHead className="w-32 text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {animals.map((animal) => {
            const genderInfo = getGenderDisplay(animal.gender)
            return (
              <TableRow
                key={animal.id}
                className="hover:bg-muted/30 transition-colors cursor-pointer group"
                onClick={() => onView(animal)}
              >
                <TableCell className="py-3">
                  <AnimalAvatar
                    src={animal.image ? imagePaths[animal.image] : undefined}
                    alt={animal.name}
                    size="sm"
                  />
                </TableCell>

                <TableCell className="py-3">
                  <Badge variant="outline" className="font-mono text-xs">
                    {animal.tagNumber || 'N/A'}
                  </Badge>
                </TableCell>

                <TableCell className="py-3">
                  <div className="space-y-1">
                    <div className="font-medium text-sm">{animal.name}</div>
                    {animal.description && (
                      <div className="text-xs text-muted-foreground truncate max-w-48" title={animal.description}>
                        {animal.description}
                      </div>
                    )}
                  </div>
                </TableCell>

                <TableCell className="py-3">
                  {animal.type?.name ? (
                    <Badge variant="secondary" className="text-xs">
                      {animal.type.name}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                </TableCell>

                <TableCell className="py-3">
                  <div className="space-y-1">
                    <div className="text-sm font-medium">{animal.breed || '-'}</div>
                    {(animal.fatherBreed || animal.motherBreed) && (
                      <div className="text-xs text-muted-foreground">
                        {animal.fatherBreed && `♂ ${animal.fatherBreed}`}
                        {animal.fatherBreed && animal.motherBreed && ' • '}
                        {animal.motherBreed && `♀ ${animal.motherBreed}`}
                      </div>
                    )}
                  </div>
                </TableCell>

                <TableCell className="py-3">
                  <div className={`flex items-center gap-1 ${genderInfo.color}`}>
                    <span className="text-lg">{genderInfo.symbol}</span>
                    <span className="text-xs font-medium">{genderInfo.text}</span>
                  </div>
                </TableCell>

                <TableCell className="py-3">
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="w-3 h-3 text-muted-foreground" />
                    <span>{getAgeDisplay(animal.age, animal.dateOfBirth)}</span>
                  </div>
                </TableCell>

                <TableCell className="py-3">
                  <span className="text-sm text-muted-foreground">
                    {formatDate(animal.dateOfBirth)}
                  </span>
                </TableCell>

                <TableCell className="py-3">
                  {animal.weight ? (
                    <div className="flex items-center gap-1 text-sm">
                      <Weight className="w-3 h-3 text-muted-foreground" />
                      <span>{animal.weight}kg</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                </TableCell>

                <TableCell className="py-3">
                  {animal.height ? (
                    <div className="flex items-center gap-1 text-sm">
                      <Ruler className="w-3 h-3 text-muted-foreground" />
                      <span>{animal.height}cm</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                </TableCell>

                <TableCell className="py-3">
                  <div className="space-y-1">
                    <div className="text-sm">
                      {formatDate(animal.acquisitionDate)}
                    </div>
                    {animal.acquisitionLocation && (
                      <div className="text-xs text-muted-foreground truncate max-w-24" title={animal.acquisitionLocation}>
                        {animal.acquisitionLocation}
                      </div>
                    )}
                  </div>
                </TableCell>

                <TableCell className="py-3">
                  <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onView(animal)
                      }}
                      className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-950/20"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>

                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          onEdit(animal)
                        }}
                        className="h-8 w-8 p-0 text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:text-orange-400 dark:hover:text-orange-300 dark:hover:bg-orange-950/20"
                        title="Edit Animal"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}

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
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      {animals.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Calendar className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No animals found</h3>
          <p className="text-muted-foreground text-sm max-w-sm">
            Get started by adding your first animal to the farm management system.
          </p>
        </div>
      )}
    </div>
  )
}
