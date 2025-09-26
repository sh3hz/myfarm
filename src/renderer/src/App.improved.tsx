import { useState, useRef, useEffect } from 'react'
import { Navigation } from '@renderer/components/layout'
import { Animals } from '@renderer/components/animals'
import { SummaryCards, UpcomingEvents, QuickActions } from '@renderer/components/dashboard'
import { AnimalTypePie } from '@renderer/components/dashboard/charts'
import { CashflowPage } from '@renderer/components/cashflow'
import { MilkProductionPage } from '@renderer/components/milk-production'
import { Toaster } from '@renderer/components/ui/sonner'

function App(): React.JSX.Element {
  const [currentPath, setCurrentPath] = useState('/')
  const animalsRef = useRef<{ openDialog: () => void }>(null)

  useEffect(() => {
    const handleOpenAnimalDialog = (): void => {
      if (currentPath !== '/animals') {
        setCurrentPath('/animals')
        // Small timeout to ensure the Animals component is mounted
        setTimeout(() => {
          animalsRef.current?.openDialog()
        }, 100)
      } else {
        animalsRef.current?.openDialog()
      }
    }

    window.addEventListener('open-animal-dialog', handleOpenAnimalDialog)

    return () => {
      window.removeEventListener('open-animal-dialog', handleOpenAnimalDialog)
    }
  }, [currentPath])

  const renderContent = (): React.ReactNode => {
    switch (currentPath) {
      case '/':
        return (
          <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
            {/* Header Section with Quick Actions */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Farm Dashboard</h1>
                <p className="text-muted-foreground">
                  Welcome back! Here's what's happening on your farm today.
                </p>
              </div>
              <div className="flex-shrink-0">
                <QuickActions onNavigate={setCurrentPath} />
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              {/* Left Column - Summary Cards (takes more space) */}
              <div className="xl:col-span-8 space-y-6">
                {/* Summary Cards - Remove internal padding since we handle it here */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Farm Overview</h2>
                  <SummaryCards onNavigate={setCurrentPath} />
                </div>

                {/* Upcoming Events - Full width on desktop */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Upcoming Events</h2>
                  <UpcomingEvents />
                </div>
              </div>

              {/* Right Column - Charts and Analytics */}
              <div className="xl:col-span-4 space-y-6">
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Analytics</h2>
                  <AnimalTypePie />
                </div>

                {/* Future: Add more analytics widgets here */}
                {/* 
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Recent Activity</h2>
                  <RecentActivity />
                </div>
                */}
              </div>
            </div>
          </div>
        )
      case '/animals':
        return <Animals ref={animalsRef} />
      case '/milk-production':
        return <MilkProductionPage />
      case '/cashflow':
        return <CashflowPage />
      default:
        return null
    }
  }

  return (
    <>
      <Navigation currentPath={currentPath} onNavigate={setCurrentPath} />
      <div className="flex-1 overflow-auto">{renderContent()}</div>
      <Toaster position="top-right" />
    </>
  )
}

export default App