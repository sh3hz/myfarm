import { ipcMain, app, nativeImage } from 'electron'
import path from 'path'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'

const UPLOADS_DIR = path.join(app.getPath('userData'), 'uploads')

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true })
}

export function registerFileHandlers() {
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

  ipcMain.handle('get-image-path', (_, relativePath: string) => {
    try {
      if (!relativePath) return ''
      const fullPath = path.join(app.getPath('userData'), relativePath)

      // Verify the file exists
      if (!fs.existsSync(fullPath)) {
        console.error('Image file not found:', fullPath)
        return ''
      }

      // Read the image file and convert to base64
      const img = nativeImage.createFromPath(fullPath)
      const dataURL = img.toDataURL()
      return dataURL
    } catch (error) {
      console.error('Error getting image path:', error)
      return ''
    }
  })
}
