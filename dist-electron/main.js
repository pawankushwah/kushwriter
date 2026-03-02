"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = require("path");
const isDev = process.env.ELECTRON === 'true'; // Set by concurrently script
let mainWindow = null;
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
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
electron_1.app.whenReady().then(() => {
    createWindow();
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
// IPC Example
electron_1.ipcMain.handle('save-data', async (event, key, data) => {
    console.log(`Saving ${key}:`, data);
    // Real implementation would save to file system
    return true;
});
electron_1.ipcMain.handle('load-data', async (event, key) => {
    console.log(`Loading ${key}`);
    return null;
});
