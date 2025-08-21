import { contextBridge, ipcRenderer } from 'electron'

// Custom APIs for renderer
const api = {
  getAppInfo: () => ipcRenderer.invoke('get-app-info'),
  // Animal Types API
  getAnimalTypes: () => ipcRenderer.invoke('get-animal-types'),
  getAnimalType: (id: number) => ipcRenderer.invoke('get-animal-type', id),
  createAnimalType: (name: string, description: string) =>
    ipcRenderer.invoke('create-animal-type', name, description),
  updateAnimalType: (id: number, name: string, description: string) =>
    ipcRenderer.invoke('update-animal-type', id, name, description),
  deleteAnimalType: (id: number) => ipcRenderer.invoke('delete-animal-type', id),

  // Animals API
  getAnimals: () => ipcRenderer.invoke('get-animals'),
  getAnimal: (id: number) => ipcRenderer.invoke('get-animal', id),
  createAnimal: (data) => ipcRenderer.invoke('create-animal', data),
  updateAnimal: (id: number, data) => ipcRenderer.invoke('update-animal', id, data),
  deleteAnimal: (id: number) => ipcRenderer.invoke('delete-animal', id),

  // File handling API
  saveImage: (imageData: string) => ipcRenderer.invoke('save-image', imageData),
  getImagePath: (relativePath: string) => ipcRenderer.invoke('get-image-path', relativePath),
  
  // Statistics API
  getAnimalStats: () => ipcRenderer.invoke('get-animal-stats')
}

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('api', api)
