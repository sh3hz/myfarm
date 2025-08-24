import { useState, useRef, useEffect } from 'react'
import { Navigation } from '@renderer/components/layout'
import { Animals } from '@renderer/components/animals'
import { SummaryCards } from '@renderer/components/dashboard'
import { AnimalTypePie } from '@renderer/components/dashboard/charts'
import { CashflowPage } from '@renderer/components/cashflow'
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
          <div className="space-y-6">
            
            <SummaryCards />
            
            <AnimalTypePie />
          </div>
        )
      case '/animals':
        return <Animals ref={animalsRef} />
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
