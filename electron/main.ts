import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';

const isDev = process.env.ELECTRON === 'true'; // Set by concurrently script

let mainWindow: any | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: false, // Don't show until ready
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const url = isDev
    ? 'http://localhost:5173'
    : `file://${path.join(__dirname, '../dist/index.html')}`;

  mainWindow?.loadURL(url);

  mainWindow?.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow?.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

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
ipcMain.handle('save-data', async (event: any, key: string, data: any) => {
  console.log(`Saving ${key}:`, data);
  // Real implementation would save to file system
  return true;
});

ipcMain.handle('load-data', async (event: any, key: string) => {
  console.log(`Loading ${key}`);
  return null;
});
