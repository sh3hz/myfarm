interface AppInfo {
  id: number
  name: string
  version: string
  description: string
}

declare global {
  interface Window {
    api: {
      getAppInfo: () => Promise<AppInfo>
    }
  }
}
