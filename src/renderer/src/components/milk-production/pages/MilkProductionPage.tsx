import { useState, useEffect } from 'react'
import { Button } from '@renderer/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { Input } from '@renderer/components/ui/input'
import { Label } from '@renderer/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@renderer/components/ui/select'
import { Calendar } from '@renderer/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@renderer/components/ui/popover'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@renderer/components/ui/table'
import { Badge } from '@renderer/components/ui/badge'
import { CalendarIcon, Plus, Trash2, Edit, TrendingUp, Milk, BarChart3, Search, Filter } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@renderer/lib/utils'
import { toast } from 'sonner'
import type { Animal, MilkProduction } from '@renderer/types/models'
import { MilkProductionChart } from '../components/MilkProductionChart'

interface MilkProductionStats {
  totalToday: number
  totalWeek: number
  totalMonth: number
  averageDaily: number
  topProducer: string
  recordCount: number
}

export function MilkProductionPage(): React.JSX.Element {
  const [animals, setAnimals] = useState<Animal[]>([])
  const [milkRecords, setMilkRecords] = useState<MilkProduction[]>([])
  const [filteredRecords, setFilteredRecords] = useState<MilkProduction[]>([])
  const [stats, setStats] = useState<MilkProductionStats>({
    totalToday: 0,
    totalWeek: 0,
    totalMonth: 0,
    averageDaily: 0,
    topProducer: '',
    recordCount: 0
  })
  
  // Form states
  const [selectedAnimal, setSelectedAnimal] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [morningAmount, setMorningAmount] = useState<string>('')
  const [eveningAmount, setEveningAmount] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [editingRecord, setEditingRecord] = useState<MilkProduction | null>(null)
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [filterAnimal, setFilterAnimal] = useState<string>('all')
  const [filterPeriod, setFilterPeriod] = useState<string>('30')

  useEffect(() => {
    loadAnimals()
    loadMilkRecords()
  }, [])

  useEffect(() => {
    filterRecords()
    calculateStats()
  }, [milkRecords, searchTerm, filterAnimal, filterPeriod])

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

  const filterRecords = (): void => {
    let filtered = [...milkRecords]
    
    // Filter by animal
    if (filterAnimal !== 'all') {
      filtered = filtered.filter(record => record.animal_id.toString() === filterAnimal)
    }
    
    // Filter by period
    const days = parseInt(filterPeriod)
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    filtered = filtered.filter(record => new Date(record.date) >= cutoffDate)
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(record => {
        const animalName = getAnimalName(record.animal_id).toLowerCase()
        const notes = (record.notes || '').toLowerCase()
        return animalName.includes(term) || notes.includes(term)
      })
    }
    
    setFilteredRecords(filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
  }

  const calculateStats = (): void => {
    const today = new Date()
    const todayStr = format(today, 'yyyy-MM-dd')
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

    const todayRecords = milkRecords.filter(r => r.date === todayStr)
    const weekRecords = milkRecords.filter(r => new Date(r.date) >= weekAgo)
    const monthRecords = milkRecords.filter(r => new Date(r.date) >= monthAgo)

    const totalToday = todayRecords.reduce((sum, r) => sum + r.total_amount, 0)
    const totalWeek = weekRecords.reduce((sum, r) => sum + r.total_amount, 0)
    const totalMonth = monthRecords.reduce((sum, r) => sum + r.total_amount, 0)
    const averageDaily = monthRecords.length > 0 ? totalMonth / 30 : 0

    // Find top producer
    const animalTotals = new Map<number, number>()
    monthRecords.forEach(record => {
      const current = animalTotals.get(record.animal_id) || 0
      animalTotals.set(record.animal_id, current + record.total_amount)
    })
    
    let topProducerId = 0
    let maxProduction = 0
    animalTotals.forEach((total, animalId) => {
      if (total > maxProduction) {
        maxProduction = total
        topProducerId = animalId
      }
    })

    setStats({
      totalToday,
      totalWeek,
      totalMonth,
      averageDaily,
      topProducer: topProducerId ? getAnimalName(topProducerId) : 'N/A',
      recordCount: milkRecords.length
    })
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

  const getAnimalType = (animalId: number): string => {
    const animal = animals.find(a => a.id === animalId)
    return animal?.type?.name || 'Unknown'
  }

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-[1600px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Milk Production</h1>
          <p className="text-muted-foreground">Track and analyze daily milk production across your farm</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Milk className="h-4 w-4 text-blue-500" />
              Today's Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalToday.toFixed(1)}L</div>
            <p className="text-xs text-muted-foreground">Current day production</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-green-500" />
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalWeek.toFixed(1)}L</div>
            <p className="text-xs text-muted-foreground">Last 7 days total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-500" />
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMonth.toFixed(1)}L</div>
            <p className="text-xs text-muted-foreground">Last 30 days total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageDaily.toFixed(1)}L</div>
            <p className="text-xs text-muted-foreground">30-day average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top Producer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate" title={stats.topProducer}>
              {stats.topProducer}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recordCount}</div>
            <p className="text-xs text-muted-foreground">All time entries</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Column - Form and Chart */}
        <div className="xl:col-span-5 space-y-6">
          {/* Form Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                {editingRecord ? 'Edit' : 'Add'} Production Record
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
                    <Label htmlFor="morning">Morning (L)</Label>
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
                    <Label htmlFor="evening">Evening (L)</Label>
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
              <CardTitle>Production Trends</CardTitle>
              <CardDescription>Visual analysis of milk production over time</CardDescription>
            </CardHeader>
            <CardContent>
              <MilkProductionChart />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Records Table */}
        <div className="xl:col-span-7">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Production Records</CardTitle>
                  <CardDescription>Manage and review milk production entries</CardDescription>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {filteredRecords.length} records
                </Badge>
              </div>
              
              {/* Filters */}
              <div className="flex flex-wrap gap-4 pt-4">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search animals or notes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-48"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={filterAnimal} onValueChange={setFilterAnimal}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Animals</SelectItem>
                      {animals.map((animal) => (
                        <SelectItem key={animal.id} value={animal.id.toString()}>
                          {animal.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="14">Last 14 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="60">Last 60 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                    <SelectItem value="365">All records</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-24">Date</TableHead>
                      <TableHead className="min-w-32">Animal</TableHead>
                      <TableHead className="w-20">Morning</TableHead>
                      <TableHead className="w-20">Evening</TableHead>
                      <TableHead className="w-20">Total</TableHead>
                      <TableHead className="min-w-48">Notes</TableHead>
                      <TableHead className="w-24 text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.slice(0, 20).map((record) => (
                      <TableRow key={record.id} className="hover:bg-muted/30">
                        <TableCell className="py-3">
                          <div className="text-sm">
                            {format(new Date(record.date), 'MMM dd')}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(record.date), 'yyyy')}
                          </div>
                        </TableCell>
                        
                        <TableCell className="py-3">
                          <div className="space-y-1">
                            <div className="font-medium text-sm">{getAnimalName(record.animal_id)}</div>
                            <Badge variant="outline" className="text-xs">
                              {getAnimalType(record.animal_id)}
                            </Badge>
                          </div>
                        </TableCell>
                        
                        <TableCell className="py-3">
                          <div className="text-sm font-medium">
                            {record.morning_amount.toFixed(1)}L
                          </div>
                        </TableCell>
                        
                        <TableCell className="py-3">
                          <div className="text-sm font-medium">
                            {record.evening_amount.toFixed(1)}L
                          </div>
                        </TableCell>
                        
                        <TableCell className="py-3">
                          <div className="text-sm font-bold text-primary">
                            {record.total_amount.toFixed(1)}L
                          </div>
                        </TableCell>
                        
                        <TableCell className="py-3">
                          <div className="text-sm text-muted-foreground truncate max-w-48" title={record.notes || ''}>
                            {record.notes || '-'}
                          </div>
                        </TableCell>
                        
                        <TableCell className="py-3">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(record)}
                              className="h-8 w-8 p-0 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                              title="Edit Record"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(record.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Delete Record"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {filteredRecords.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                      <Milk className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No records found</h3>
                    <p className="text-muted-foreground text-sm max-w-sm">
                      {searchTerm || filterAnimal !== 'all' 
                        ? 'Try adjusting your filters or search terms.'
                        : 'Start by adding your first milk production record.'}
                    </p>
                  </div>
                )}
                
                {filteredRecords.length > 20 && (
                  <div className="p-4 text-center text-sm text-muted-foreground border-t">
                    Showing 20 of {filteredRecords.length} records. Use filters to narrow down results.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}