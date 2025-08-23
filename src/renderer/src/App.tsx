import { useEffect, useState, useRef } from 'react'
import { Navigation } from '@renderer/components/layout'
import { AnimalTypes } from '@renderer/components/animal-types'
import { Animals } from '@renderer/components/animals'
import { SummaryCards } from '@renderer/components/dashboard'
import { AnimalTypePie } from '@renderer/components/dashboard/charts'
import { Toaster } from '@renderer/components/ui/sonner'

function App(): React.JSX.Element {
  

  const [currentPath, setCurrentPath] = useState('/')
  const animalsRef = useRef<{ openDialog: () => void }>(null)
  const animalTypesRef = useRef<{ openDialog: () => void }>(null)

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

    const handleOpenAnimalTypeDialog = (): void => {
      if (currentPath !== '/settings') {
        setCurrentPath('/settings')
        // Small timeout to ensure the AnimalTypes component is mounted
        setTimeout(() => {
          animalTypesRef.current?.openDialog()
        }, 100)
      } else {
        animalTypesRef.current?.openDialog()
      }
    }

    window.addEventListener('open-animal-dialog', handleOpenAnimalDialog)
    window.addEventListener('open-animal-type-dialog', handleOpenAnimalTypeDialog)

    return () => {
      window.removeEventListener('open-animal-dialog', handleOpenAnimalDialog)
      window.removeEventListener('open-animal-type-dialog', handleOpenAnimalTypeDialog)
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
      case '/settings':
        return <AnimalTypes ref={animalTypesRef} />
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
