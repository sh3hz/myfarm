import { useEffect, useState } from 'react'
import { Navigation } from '@renderer/components/Navigation'

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

  return (
    <>
      <Navigation />
      <div className="container py-8">
        <div className="flex flex-col items-center justify-center gap-4">
          <h1 className="text-2xl font-bold">{appInfo?.name}</h1>
          <p className="text-gray-500">Version: {appInfo?.version}</p>
          <p className="text-gray-400">{appInfo?.description}</p>
        </div>
      </div>
    </>
  )
}

export default App
