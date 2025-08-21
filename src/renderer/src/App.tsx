import { useEffect, useState, useRef } from 'react'
import { Navigation } from '@renderer/components/Navigation'
import { AnimalTypes } from '@renderer/components/AnimalTypes'
import { Animals } from '@renderer/components/Animals'
import { SummaryCards } from '@renderer/components/SummaryCards'

function App(): React.JSX.Element {
  

  const [currentPath, setCurrentPath] = useState('/')
  const animalsRef = useRef<{ openDialog: () => void }>(null)
  const animalTypesRef = useRef<{ openDialog: () => void }>(null)

  useEffect(() => {
    const handleOpenAnimalDialog = () => {
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

    const handleOpenAnimalTypeDialog = () => {
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

  const renderContent = () => {
    switch (currentPath) {
      case '/':
        return (
          <div className="space-y-6">
            
            <SummaryCards />
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Add more dashboard widgets here in the future */}
            </div>
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
      <Navigation onNavigate={setCurrentPath} currentPath={currentPath} />
      <div className="container py-8">
        {renderContent()}
      </div>
    </>
  )
}

export default App
