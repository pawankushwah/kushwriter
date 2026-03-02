const electron = require('electron');
const { app, BrowserWindow, ipcMain } = electron;
const path = require('path');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

// Configure logging
log.transports.file.level = "debug";
autoUpdater.logger = log;

const isDev = process.env.IS_ELECTRON === 'true'; // Set by concurrently script

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: false, // Don't show until ready
    frame: false, // Remove default OS title bar
    titleBarStyle: 'hidden', // Optionally keeps some native styling, but hays default
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const url = isDev
    ? 'http://localhost:5173'
    : `file://${path.join(__dirname, '../dist/index.html')}`;

  if (mainWindow) {
    mainWindow.loadURL(url);

    mainWindow.once('ready-to-show', () => {
      mainWindow.show();
    });

    mainWindow.on('closed', () => {
      mainWindow = null;
    });
  }
}

// Update functions
function handleUpdates() {
  if (isDev) return; // Don't auto-update in dev

  autoUpdater.on('checking-for-update', () => {
    log.info('Checking for update...');
    if (mainWindow) mainWindow.webContents.send('updater-event', 'checking-for-update');
  });

  autoUpdater.on('update-available', (info) => {
    log.info('Update available.');
    if (mainWindow) mainWindow.webContents.send('updater-event', 'update-available', info);
  });

  autoUpdater.on('update-not-available', (info) => {
    log.info('Update not available.');
    if (mainWindow) mainWindow.webContents.send('updater-event', 'update-not-available', info);
  });

  autoUpdater.on('error', (err) => {
    log.error('Error in auto-updater. ' + err);
    if (mainWindow) mainWindow.webContents.send('updater-event', 'error', err.message);
  });

  autoUpdater.on('download-progress', (progressObj) => {
    let log_message = "Download speed: " + progressObj.bytesPerSecond;
    log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
    log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
    log.info(log_message);
    if (mainWindow) mainWindow.webContents.send('updater-event', 'download-progress', progressObj);
  });

  autoUpdater.on('update-downloaded', (info) => {
    log.info('Update downloaded');
    if (mainWindow) mainWindow.webContents.send('updater-event', 'update-downloaded', info);
  });
}

app.whenReady().then(() => {
  createWindow();
  
  // Check for updates 5 seconds after startup
  setTimeout(() => {
     handleUpdates();
     autoUpdater.checkForUpdatesAndNotify();
  }, 5000);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Example
ipcMain.handle('save-data', async (event, key, data) => {
  console.log(`Saving ${key}:`, data);
  // Real implementation would save to file system
  return true;
});

ipcMain.handle('load-data', async (event, key) => {
  console.log(`Loading ${key}`);
  return null;
});

// Window Control Handlers
ipcMain.on('window-minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window-toggle-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('window-close', () => {
  if (mainWindow) mainWindow.close();
});

// Auto-Updater API
ipcMain.handle('updater-check-now', () => {
  if (!isDev) autoUpdater.checkForUpdatesAndNotify();
});

ipcMain.on('updater-quit-and-install', () => {
  if (!isDev) autoUpdater.quitAndInstall();
});
