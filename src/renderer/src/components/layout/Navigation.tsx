import { useState } from 'react'
import { Button } from '@renderer/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@renderer/components/ui/sheet'
import { PawPrint, ScrollText, Menu, Home, DollarSign, Milk } from 'lucide-react'
import { cn } from '@renderer/lib/utils'

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
          <div className="hidden font-semibold sm:block">
            <span className="text-lg">MyFarm</span>
            <p className="text-xs text-muted-foreground">The Animal Manager</p>
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
