import { useState, useEffect } from 'react'
import { Button } from '@renderer/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { Input } from '@renderer/components/ui/input'
import { Label } from '@renderer/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@renderer/components/ui/select'
import { Calendar } from '@renderer/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@renderer/components/ui/popover'
import { CalendarIcon, Plus, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@renderer/lib/utils'
import { toast } from 'sonner'
import type { Animal, MilkProduction } from '@renderer/types/models'
import { MilkProductionChart } from '../components/MilkProductionChart'

export function MilkProductionPage(): React.JSX.Element {
  const [animals, setAnimals] = useState<Animal[]>([])
  const [milkRecords, setMilkRecords] = useState<MilkProduction[]>([])
  const [selectedAnimal, setSelectedAnimal] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [morningAmount, setMorningAmount] = useState<string>('')
  const [eveningAmount, setEveningAmount] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [editingRecord, setEditingRecord] = useState<MilkProduction | null>(null)

  useEffect(() => {
    loadAnimals()
    loadMilkRecords()
  }, [])

  const loadAnimals = async (): Promise<void> => {
    try {
      const data = await window.api.getAnimals()
      setAnimals(data)
    } catch (error) {
      console.error('Error loading animals:', error)
      toast.error('Failed to load animals')
    }
  }

  const loadMilkRecords = async (): Promise<void> => {
    try {
      const data = await window.api.getMilkProduction()
      setMilkRecords(data)
    } catch (error) {
      console.error('Error loading milk records:', error)
      toast.error('Failed to load milk production records')
    }
  }

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    
    if (!selectedAnimal || (!morningAmount && !eveningAmount)) {
      toast.error('Please select an animal and enter at least one amount')
      return
    }

    setLoading(true)
    try {
      const data = {
        animal_id: parseInt(selectedAnimal),
        date: format(selectedDate, 'yyyy-MM-dd'),
        morning_amount: parseFloat(morningAmount) || 0,
        evening_amount: parseFloat(eveningAmount) || 0,
        notes: notes.trim() || undefined
      }

      if (editingRecord) {
        await window.api.updateMilkProduction(editingRecord.id, data)
        toast.success('Milk production record updated successfully')
        setEditingRecord(null)
      } else {
        await window.api.createMilkProduction(data)
        toast.success('Milk production record added successfully')
      }

      // Reset form
      setSelectedAnimal('')
      setSelectedDate(new Date())
      setMorningAmount('')
      setEveningAmount('')
      setNotes('')
      
      // Reload records
      await loadMilkRecords()
    } catch (error) {
      console.error('Error saving milk production record:', error)
      toast.error('Failed to save milk production record')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (record: MilkProduction): void => {
    setEditingRecord(record)
    setSelectedAnimal(record.animal_id.toString())
    setSelectedDate(new Date(record.date))
    setMorningAmount(record.morning_amount.toString())
    setEveningAmount(record.evening_amount.toString())
    setNotes(record.notes || '')
  }

  const handleDelete = async (id: number): Promise<void> => {
    if (!confirm('Are you sure you want to delete this milk production record?')) {
      return
    }

    try {
      await window.api.deleteMilkProduction(id)
      toast.success('Milk production record deleted successfully')
      await loadMilkRecords()
    } catch (error) {
      console.error('Error deleting milk production record:', error)
      toast.error('Failed to delete milk production record')
    }
  }

  const cancelEdit = (): void => {
    setEditingRecord(null)
    setSelectedAnimal('')
    setSelectedDate(new Date())
    setMorningAmount('')
    setEveningAmount('')
    setNotes('')
  }

  const getAnimalName = (animalId: number): string => {
    const animal = animals.find(a => a.id === animalId)
    return animal ? animal.name : `Animal ${animalId}`
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Milk Production</h1>
          <p className="text-muted-foreground">Track daily milk production for your animals</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              {editingRecord ? 'Edit' : 'Add'} Milk Production Record
            </CardTitle>
            <CardDescription>
              {editingRecord ? 'Update the milk production record' : 'Record daily milk production data'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="animal">Animal</Label>
                <Select value={selectedAnimal} onValueChange={setSelectedAnimal}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an animal" />
                  </SelectTrigger>
                  <SelectContent>
                    {animals.map((animal) => (
                      <SelectItem key={animal.id} value={animal.id.toString()}>
                        {animal.name} ({animal.type?.name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !selectedDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="morning">Morning Amount (L)</Label>
                  <Input
                    id="morning"
                    type="number"
                    step="0.1"
                    min="0"
                    value={morningAmount}
                    onChange={(e) => setMorningAmount(e.target.value)}
                    placeholder="0.0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="evening">Evening Amount (L)</Label>
                  <Input
                    id="evening"
                    type="number"
                    step="0.1"
                    min="0"
                    value={eveningAmount}
                    onChange={(e) => setEveningAmount(e.target.value)}
                    placeholder="0.0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional notes..."
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Saving...' : editingRecord ? 'Update Record' : 'Add Record'}
                </Button>
                {editingRecord && (
                  <Button type="button" variant="outline" onClick={cancelEdit}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Chart Card */}
        <Card>
          <CardHeader>
            <CardTitle>Production Chart</CardTitle>
            <CardDescription>Last 30 days milk production</CardDescription>
          </CardHeader>
          <CardContent>
            <MilkProductionChart />
          </CardContent>
        </Card>
      </div>

      {/* Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Records</CardTitle>
          <CardDescription>Latest milk production entries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">Animal</th>
                  <th className="text-left p-2">Morning (L)</th>
                  <th className="text-left p-2">Evening (L)</th>
                  <th className="text-left p-2">Total (L)</th>
                  <th className="text-left p-2">Notes</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {milkRecords.slice(0, 10).map((record) => (
                  <tr key={record.id} className="border-b hover:bg-muted/50">
                    <td className="p-2">{format(new Date(record.date), 'MMM dd, yyyy')}</td>
                    <td className="p-2">{getAnimalName(record.animal_id)}</td>
                    <td className="p-2">{record.morning_amount.toFixed(1)}</td>
                    <td className="p-2">{record.evening_amount.toFixed(1)}</td>
                    <td className="p-2 font-medium">{record.total_amount.toFixed(1)}</td>
                    <td className="p-2 text-sm text-muted-foreground">
                      {record.notes || '-'}
                    </td>
                    <td className="p-2">
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(record)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(record.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {milkRecords.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No milk production records found. Add your first record above.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}