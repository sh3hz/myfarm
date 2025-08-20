import { Button } from '@renderer/components/ui/button'

function App(): React.JSX.Element {
  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-svh">
        <Button variant="default" size="lg">
          ShadCN Button
        </Button>
      </div>
    </>
  )
}

export default App
