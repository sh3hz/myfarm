import { ipcMain, app, protocol } from 'electron'
import path from 'path'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'

const UPLOADS_DIR = path.join(app.getPath('userData'), 'uploads')

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true })
}

export function registerFileHandlers() {
  // Register custom protocol for serving images
  protocol.registerFileProtocol('app-image', (request, callback) => {
    try {
      // Extract the relative path from the URL
      const relativePath = request.url.replace('app-image://', '')
      const fullPath = path.join(app.getPath('userData'), relativePath)
      
      // Verify file exists and is within uploads directory for security
      if (fs.existsSync(fullPath) && fullPath.startsWith(UPLOADS_DIR)) {
        callback({ path: fullPath })
      } else {
        console.error('Image file not found or access denied:', fullPath)
        callback({ error: -6 }) // FILE_NOT_FOUND
      }
    } catch (error) {
      console.error('Error serving image:', error)
      callback({ error: -2 }) // FAILED
    }
  })
  ipcMain.handle('save-image', async (_, imageData: string) => {
    try {
      // Extract base64 data
      const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '')
      const buffer = Buffer.from(base64Data, 'base64')

      // Generate unique filename
      const fileName = `${uuidv4()}.png`
      const filePath = path.join(UPLOADS_DIR, fileName)

      // Save the file
      fs.writeFileSync(filePath, buffer)

      // Return the relative path
      return `uploads/${fileName}`
    } catch (error) {
      console.error('Error saving image:', error)
      throw error
    }
  })

  // Batch load multiple image paths for better performance
  ipcMain.handle('get-image-paths', (_, relativePaths: string[]) => {
    try {
      const results: Record<string, string> = {}
      
      for (const relativePath of relativePaths) {
        if (!relativePath) continue
        
        const fullPath = path.join(app.getPath('userData'), relativePath)
        
        // Verify the file exists
        if (fs.existsSync(fullPath)) {
          results[relativePath] = `app-image://${relativePath}`
        } else {
          console.warn('Image file not found:', fullPath)
        }
      }
      
      return results
    } catch (error) {
      console.error('Error getting image paths:', error)
      return {}
    }
  })

  ipcMain.handle('get-image-path', (_, relativePath: string) => {
    try {
      if (!relativePath) return ''
      const fullPath = path.join(app.getPath('userData'), relativePath)

      // Verify the file exists
      if (!fs.existsSync(fullPath)) {
        console.error('Image file not found:', fullPath)
        return ''
      }

      // Return custom protocol URL for secure access
      return `app-image://${relativePath}`
    } catch (error) {
      console.error('Error getting image path:', error)
      return ''
    }
  })
}
