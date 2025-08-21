import { useEffect, useState } from 'react'
import { Navigation } from '@renderer/components/Navigation'
import { AnimalTypes } from '@renderer/components/AnimalTypes'
import { Animals } from '@renderer/components/Animals'
import { SummaryCards } from '@renderer/components/SummaryCards'

interface AppInfo {
  id: number
  name: string
  version: string
  description: string
}

function App(): React.JSX.Element {
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null)

  useEffect(() => {
    const loadAppInfo = async () => {
      try {
        const info = await window.api.getAppInfo()
        if (!info) {
          console.error('Renderer - No app info received')
          return
        }
        setAppInfo(info)
      } catch (error) {
        console.error('Renderer - Failed to load app info:', error)
      }
    }
    loadAppInfo()
  }, [])

  const [currentPath, setCurrentPath] = useState('/')

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
        return <Animals />
      case '/settings':
        return <AnimalTypes />
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
