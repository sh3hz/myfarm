import { useEffect, useState } from 'react'
import { Navigation } from '@renderer/components/Navigation'
import { AnimalTypes } from '@renderer/components/AnimalTypes'
import { Animals } from '@renderer/components/Animals'

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
          <div className="flex flex-col items-center justify-center gap-4">
            <h1 className="text-2xl font-bold">{appInfo?.name}</h1>
            <p className="text-gray-500">Version: {appInfo?.version}</p>
            <p className="text-gray-400">{appInfo?.description}</p>
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
