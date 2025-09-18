import { app, shell, BrowserWindow, ipcMain, protocol, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { autoUpdater } from 'electron-updater'
import icon from '../../resources/icon.png?asset'
import { databaseService } from './database'
import { registerAnimalTypeHandlers } from './handlers/animalTypes'
import { registerAnimalHandlers } from './handlers/animals'
import { registerFileHandlers } from './handlers/files'
import { registerDocumentHandlers } from './handlers/documents'
import { registerCashflowHandlers } from './handlers/cashflow'

// Register protocol schemes before app is ready
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app-image',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true
    }
  }
])

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,  // Initial width (will be overridden by maximize())
    height: 800,  // Initial height (will be overridden by maximize())
    show: false,
    autoHideMenuBar: true,
    title: 'MyFarm',
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.maximize() // Maximize the window to fill the screen
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// Configure auto-updater
function setupAutoUpdater(): void {
  // Configure auto-updater settings
  autoUpdater.autoDownload = false // Don't auto-download updates
  autoUpdater.autoInstallOnAppQuit = false // Don't auto-install on quit
  
  console.log('Current app version:', app.getVersion())
  console.log('Auto-updater feed URL:', autoUpdater.getFeedURL())
  
  // Check for updates after a delay to avoid immediate restart loops
  setTimeout(() => {
    console.log('Checking for updates...')
    autoUpdater.checkForUpdatesAndNotify()
  }, 5000) // Wait 5 seconds after app start

  // Handle update events
  autoUpdater.on('checking-for-update', () => {
    console.log('Checking for update...')
  })

  autoUpdater.on('update-available', (info) => {
    console.log('Update available:', info)
    console.log('Current version:', app.getVersion())
    console.log('Available version:', info.version)
    
    // Check if the available version is actually newer
    const currentVersion = app.getVersion()
    if (info.version === currentVersion) {
      console.log('Available version is same as current version, skipping update dialog')
      return
    }
    
    // Show native dialog asking user if they want to download the update
    const windows = BrowserWindow.getAllWindows()
    if (windows.length > 0) {
      dialog.showMessageBox(windows[0], {
        type: 'info',
        title: 'Update Available',
        message: `A new version (${info.version}) is available. Current version: ${currentVersion}. Would you like to download it now?`,
        buttons: ['Download Now', 'Later'],
        defaultId: 0,
        cancelId: 1
      }).then((result) => {
        if (result.response === 0) {
          // User clicked "Download Now"
          autoUpdater.downloadUpdate()
        }
      })
    }
  })

  autoUpdater.on('update-not-available', (info) => {
    console.log('Update not available:', info)
    console.log('Current version is up to date:', app.getVersion())
  })

  autoUpdater.on('error', (err) => {
    console.log('Error in auto-updater:', err)
  })

  autoUpdater.on('download-progress', (progressObj) => {
    let log_message = "Download speed: " + progressObj.bytesPerSecond
    log_message = log_message + ' - Downloaded ' + progressObj.percent + '%'
    log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')'
    console.log(log_message)
  })

  autoUpdater.on('update-downloaded', (info) => {
    console.log('Update downloaded:', info)
    
    // Show native dialog asking user if they want to install now
    const windows = BrowserWindow.getAllWindows()
    if (windows.length > 0) {
      dialog.showMessageBox(windows[0], {
        type: 'info',
        title: 'Update Ready',
        message: `Update has been downloaded. The application will restart to apply the update.`,
        buttons: ['Restart Now', 'Later'],
        defaultId: 0,
        cancelId: 1
      }).then((result) => {
        if (result.response === 0) {
          // User clicked "Restart Now"
          setTimeout(() => {
            autoUpdater.quitAndInstall(false, true)
          }, 1000)
        }
      })
    }
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.myfarm')

  // Setup auto-updater (only in production)
  if (!is.dev) {
    setupAutoUpdater()
  }

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Set up IPC handlers for database operations
  registerAnimalTypeHandlers()
  registerAnimalHandlers()
  registerFileHandlers()
  registerDocumentHandlers()
  registerCashflowHandlers()

  ipcMain.handle('get-app-info', async () => {
    try {
      const appInfo = databaseService.getAppInfo()
      return appInfo
    } catch (error) {
      console.error('Main process - Error getting app info:', error)
      throw error
    }
  })

  // Auto-updater IPC handlers
  ipcMain.handle('check-for-updates', async () => {
    if (!is.dev) {
      return await autoUpdater.checkForUpdates()
    }
    return null
  })

  ipcMain.handle('download-update', async () => {
    if (!is.dev) {
      return await autoUpdater.downloadUpdate()
    }
    return null
  })

  ipcMain.handle('install-update', () => {
    if (!is.dev) {
      // Give a small delay before installing
      setTimeout(() => {
        autoUpdater.quitAndInstall(false, true)
      }, 1000)
    }
  })

  ipcMain.handle('get-update-info', () => {
    return {
      version: app.getVersion(),
      isUpdateAvailable: false // This would be set by update events
    }
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
