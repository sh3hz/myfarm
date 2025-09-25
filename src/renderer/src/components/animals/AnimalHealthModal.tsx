import { useState, useEffect } from 'react'
import type { Animal, AnimalHealthRecord, HealthRecordType } from '../../../../shared/types/models'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Calendar } from '../ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { CalendarIcon, Plus, Trash2, X } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { cn } from '../../lib/utils'

interface Props {
  animal: Animal | null
  open: boolean
  onClose: () => void
}

interface HealthRecordForm {
  record_type: HealthRecordType
  date: Date | undefined
  expected_delivery_date?: Date | undefined
  notes?: string
}

export function AnimalHealthModal({ animal, open, onClose }: Props) {
  const [healthRecords, setHealthRecords] = useState<AnimalHealthRecord[]>([])
  const [inseminationForm, setInseminationForm] = useState<HealthRecordForm>({
    record_type: 'insemination',
    date: undefined,
    expected_delivery_date: undefined,
    notes: ''
  })
  const [dewormingForm, setDewormingForm] = useState<HealthRecordForm>({
    record_type: 'deworming',
    date: undefined,
    notes: ''
  })

  useEffect(() => {
    if (animal && open) {
      loadHealthRecords()
    }
  }, [animal, open])

  const loadHealthRecords = async () => {
    if (!animal) return
    
    try {
      const records = await window.api.getHealthRecords(animal.id)
      setHealthRecords(records)
    } catch (error) {
      console.error('Error loading health records:', error)
      toast.error('Failed to load health records')
    }
  }

  const handleAddInsemination = async () => {
    if (!animal || !inseminationForm.date) {
      toast.error('Please fill in the insemination date')
      return
    }

    try {
      await window.api.createHealthRecord({
        animal_id: animal.id,
        record_type: 'insemination',
        date: format(inseminationForm.date, 'yyyy-MM-dd'),
        expected_delivery_date: inseminationForm.expected_delivery_date 
          ? format(inseminationForm.expected_delivery_date, 'yyyy-MM-dd') 
          : undefined,
        notes: inseminationForm.notes || undefined
      })
      
      setInseminationForm({
        record_type: 'insemination',
        date: undefined,
        expected_delivery_date: undefined,
        notes: ''
      })
      
      await loadHealthRecords()
      toast.success('Insemination record added successfully')
    } catch (error) {
      console.error('Error adding insemination record:', error)
      toast.error('Failed to add insemination record')
    }
  }

  const handleAddDeworming = async () => {
    if (!animal || !dewormingForm.date) {
      toast.error('Please fill in the deworming date')
      return
    }

    try {
      await window.api.createHealthRecord({
        animal_id: animal.id,
        record_type: 'deworming',
        date: format(dewormingForm.date, 'yyyy-MM-dd'),
        notes: dewormingForm.notes || undefined
      })
      
      setDewormingForm({
        record_type: 'deworming',
        date: undefined,
        notes: ''
      })
      
      await loadHealthRecords()
      toast.success('Deworming record added successfully')
    } catch (error) {
      console.error('Error adding deworming record:', error)
      toast.error('Failed to add deworming record')
    }
  }

  const handleDeleteRecord = async (recordId: number) => {
    try {
      await window.api.deleteHealthRecord(recordId)
      await loadHealthRecords()
      toast.success('Health record deleted successfully')
    } catch (error) {
      console.error('Error deleting health record:', error)
      toast.error('Failed to delete health record')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const inseminationRecords = healthRecords.filter(r => r.record_type === 'insemination')
  const dewormingRecords = healthRecords.filter(r => r.record_type === 'deworming')

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[90vh] w-[98vw] sm:w-[95vw] lg:w-[85vw] xl:max-w-7xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Health Records - {animal?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Insemination Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Insemination Records</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add New Insemination Form */}
              <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                <h4 className="font-medium">Add New Record</h4>
                <div className="space-y-2">
                  <Label>Insemination Date</Label>
                  <div className="flex gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "flex-1 justify-start text-left font-normal",
                            !inseminationForm.date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {inseminationForm.date ? format(inseminationForm.date, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={inseminationForm.date}
                          onSelect={(date) => setInseminationForm(prev => ({ ...prev, date }))}
                          captionLayout="dropdown"
                          fromYear={1990}
                          toYear={new Date().getFullYear() + 1}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {inseminationForm.date && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setInseminationForm(prev => ({ ...prev, date: undefined }))}
                        className="h-10 w-10"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Expected Delivery Date</Label>
                  <div className="flex gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "flex-1 justify-start text-left font-normal",
                            !inseminationForm.expected_delivery_date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {inseminationForm.expected_delivery_date ? format(inseminationForm.expected_delivery_date, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={inseminationForm.expected_delivery_date}
                          onSelect={(date) => setInseminationForm(prev => ({ ...prev, expected_delivery_date: date }))}
                          captionLayout="dropdown"
                          fromYear={new Date().getFullYear()}
                          toYear={new Date().getFullYear() + 2}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {inseminationForm.expected_delivery_date && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setInseminationForm(prev => ({ ...prev, expected_delivery_date: undefined }))}
                        className="h-10 w-10"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="insemination-notes">Notes</Label>
                  <Input
                    id="insemination-notes"
                    placeholder="Optional notes..."
                    value={inseminationForm.notes}
                    onChange={(e) => setInseminationForm(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>
                <Button onClick={handleAddInsemination} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Insemination Record
                </Button>
              </div>

              {/* Existing Insemination Records */}
              <div className="space-y-2">
                <h4 className="font-medium">Previous Records</h4>
                {inseminationRecords.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No insemination records yet</p>
                ) : (
                  <div className="space-y-2">
                    {inseminationRecords.map((record) => (
                      <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">
                            Inseminated: {formatDate(record.date)}
                          </div>
                          {record.expected_delivery_date && (
                            <div className="text-sm text-muted-foreground">
                              Expected delivery: {formatDate(record.expected_delivery_date)}
                            </div>
                          )}
                          {record.notes && (
                            <div className="text-sm text-muted-foreground">
                              Notes: {record.notes}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRecord(record.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Deworming Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Deworming Records</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add New Deworming Form */}
              <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                <h4 className="font-medium">Add New Record</h4>
                <div className="space-y-2">
                  <Label>Deworming Date</Label>
                  <div className="flex gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "flex-1 justify-start text-left font-normal",
                            !dewormingForm.date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dewormingForm.date ? format(dewormingForm.date, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={dewormingForm.date}
                          onSelect={(date) => setDewormingForm(prev => ({ ...prev, date }))}
                          captionLayout="dropdown"
                          fromYear={1990}
                          toYear={new Date().getFullYear() + 1}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {dewormingForm.date && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setDewormingForm(prev => ({ ...prev, date: undefined }))}
                        className="h-10 w-10"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deworming-notes">Notes</Label>
                  <Input
                    id="deworming-notes"
                    placeholder="Optional notes..."
                    value={dewormingForm.notes}
                    onChange={(e) => setDewormingForm(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>
                <Button onClick={handleAddDeworming} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Deworming Record
                </Button>
              </div>

              {/* Existing Deworming Records */}
              <div className="space-y-2">
                <h4 className="font-medium">Previous Records</h4>
                {dewormingRecords.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No deworming records yet</p>
                ) : (
                  <div className="space-y-2">
                    {dewormingRecords.map((record) => (
                      <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">
                            Dewormed: {formatDate(record.date)}
                          </div>
                          {record.notes && (
                            <div className="text-sm text-muted-foreground">
                              Notes: {record.notes}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRecord(record.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}