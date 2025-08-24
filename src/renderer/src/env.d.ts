/// <reference types="vite/client" />

declare module '*.svg' {
  const content: string
  export default content
}

interface Window {
  electron: {
    process: {
      versions: {
        electron: string;
        chrome: string;
        node: string;
      };
    };
  };
  api: {
    getAppInfo: () => Promise<any>
    getAnimalTypes: () => Promise<any[]>
    getAnimalType: (id: number) => Promise<any>
    createAnimalType: (name: string, description: string) => Promise<any>
    updateAnimalType: (id: number, name: string, description: string) => Promise<any>
    deleteAnimalType: (id: number) => Promise<void>
    getAnimals: () => Promise<any[]>
    getAnimal: (id: number) => Promise<any>
    createAnimal: (data: any) => Promise<any>
    updateAnimal: (id: number, data: any) => Promise<any>
    deleteAnimal: (id: number) => Promise<void>
    saveImage: (imageData: string) => Promise<string>
    getImagePath: (relativePath: string) => Promise<string>
    getImagePaths: (relativePaths: string[]) => Promise<Record<string, string>>
    getAnimalStats: () => Promise<any>
    exportAnimalsToExcel: () => Promise<{ success: boolean; filePath?: string; message?: string }>
    getAnimalTypeCounts: () => Promise<Array<{ name: string; count: number }>>
  }
}
