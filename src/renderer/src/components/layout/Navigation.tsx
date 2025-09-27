import { useState, useEffect } from 'react'
import { Button } from '@renderer/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@renderer/components/ui/sheet'
import { PawPrint, ScrollText, Menu, Home, DollarSign, Milk, Edit2 } from 'lucide-react'
import { cn } from '@renderer/lib/utils'
import type { AppInfo } from '@renderer/types/models'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@renderer/components/ui/dialog'
import { Input } from '@renderer/components/ui/input'
import { Label } from '@renderer/components/ui/label'
import { Textarea } from '@renderer/components/ui/textarea'

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Animals', href: '/animals', icon: ScrollText },
  { name: 'Milk', href: '/milk-production', icon: Milk },
  { name: 'Cashflow', href: '/cashflow', icon: DollarSign }
]

interface NavigationProps {
  currentPath: string
  onNavigate: (path: string) => void
}

export function Navigation({ currentPath, onNavigate }: NavigationProps): React.JSX.Element {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', description: '' })
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    const loadAppInfo = async (): Promise<void> => {
      try {
        const info = await window.api.getAppInfo()
        setAppInfo(info)
      } catch (error) {
        console.error('Failed to load app info:', error)
        // Fallback to default values
        setAppInfo({
          id: 1,
          name: 'MyFarm',
          version: '1.0.0',
          description: 'The Animal Manager'
        })
      }
    }

    loadAppInfo()
  }, [])

  const handleEditClick = (): void => {
    if (appInfo) {
      setEditForm({
        name: appInfo.name,
        description: appInfo.description
      })
      setEditDialogOpen(true)
    }
  }

  const handleSaveChanges = async (): Promise<void> => {
    try {
      const updatedAppInfo = await window.api.updateAppInfo({
        name: editForm.name,
        description: editForm.description
      })
      setAppInfo(updatedAppInfo)
      setEditDialogOpen(false)
      setIsHovered(false) // Reset hover state
    } catch (error) {
      console.error('Failed to update app info:', error)
    }
  }

  const handleDialogClose = (open: boolean): void => {
    setEditDialogOpen(open)
    if (!open) {
      setIsHovered(false) // Reset hover state when dialog closes
    }
  }

  const handleNavigation = (path: string): void => {
    onNavigate(path)
    setMobileMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo and App Name */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <PawPrint className="h-5 w-5" />
          </div>
          <div
            className="hidden font-semibold sm:block relative group cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="flex items-center gap-2">
              <div>
                <span className="text-lg">{appInfo?.name || 'MyFarm'}</span>
                <p className="text-xs text-muted-foreground">{appInfo?.description || 'The Animal Manager'}</p>
              </div>
              {isHovered && (
                <Dialog open={editDialogOpen} onOpenChange={handleDialogClose}>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-70 hover:opacity-100 transition-opacity"
                      onClick={handleEditClick}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Edit App Information</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">App Name</Label>
                        <Input
                          id="name"
                          value={editForm.name}
                          onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter app name"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={editForm.description}
                          onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Enter app description"
                          rows={3}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => handleDialogClose(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveChanges}>
                        Save Changes
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.name}
                onClick={() => handleNavigation(item.href)}
                className={cn(
                  'flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary',
                  currentPath === item.href ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </button>
            )
          })}
        </nav>

        <div className="flex items-center gap-4">
          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" className="md:hidden" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-4">
                {navigation.map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.name}
                      onClick={() => handleNavigation(item.href)}
                      className={cn(
                        'flex items-center gap-2 text-lg font-medium transition-colors hover:text-primary',
                        currentPath === item.href ? 'text-primary' : 'text-muted-foreground'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {item.name}
                    </button>
                  )
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

export default Navigation
