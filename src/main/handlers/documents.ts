import { ipcMain, app } from 'electron'
import * as documentsRepo from '../db/repositories/documentsRepo'
import * as fs from 'fs'
import * as path from 'path'

// Register IPC handlers for documents
export function registerDocumentHandlers(): void {
  // Get documents for an animal
  ipcMain.handle('get-animal-documents', async (_: unknown, animalId: number): Promise<string[]> => {
    return documentsRepo.getDocumentsByAnimalId(animalId)
  })

  // Add a document to an animal
  ipcMain.handle(
    'add-animal-document',
    async (_: unknown, animalId: number, filename: string, originalName: string): Promise<void> => {
      await documentsRepo.addDocument(animalId, filename, originalName)
    }
  )

  // Remove a document from an animal
  ipcMain.handle(
    'remove-animal-document',
    async (_: unknown, animalId: number, filename: string): Promise<void> => {
      await documentsRepo.removeDocument(animalId, filename)
    }
  )

  // Save document file (similar to saveImage)
  ipcMain.handle('save-document', async (_: unknown, fileData: string, originalName: string): Promise<string> => {
    try {
      // Create documents directory if it doesn't exist
      const documentsDir = path.join(app.getPath('userData'), 'documents')
      if (!fs.existsSync(documentsDir)) {
        fs.mkdirSync(documentsDir, { recursive: true })
      }

      // Generate unique filename
      const timestamp = Date.now()
      const ext = path.extname(originalName)
      const baseName = path.basename(originalName, ext)
      const filename = `${baseName}_${timestamp}${ext}`
      const filePath = path.join(documentsDir, filename)

      // Convert base64 to buffer and save
      const base64Data = fileData.replace(/^data:[^;]+;base64,/, '')
      const buffer = Buffer.from(base64Data, 'base64')
      fs.writeFileSync(filePath, buffer)

      return filename
    } catch (error) {
      console.error('Error saving document:', error)
      throw new Error('Failed to save document')
    }
  })

  // Get document file path (similar to getImagePath)
  ipcMain.handle('get-document-path', async (_: unknown, filename: string): Promise<string> => {
    const documentsDir = path.join(app.getPath('userData'), 'documents')
    const filePath = path.join(documentsDir, filename)
    
    if (fs.existsSync(filePath)) {
      return `file://${filePath}`
    }
    
    throw new Error('Document not found')
  })

  // Open document with system default application
  ipcMain.handle('open-document', async (_: unknown, filename: string): Promise<void> => {
    const documentsDir = path.join(app.getPath('userData'), 'documents')
    const filePath = path.join(documentsDir, filename)
    
    if (fs.existsSync(filePath)) {
      const { shell } = require('electron')
      await shell.openPath(filePath)
    } else {
      throw new Error('Document not found')
    }
  })
}