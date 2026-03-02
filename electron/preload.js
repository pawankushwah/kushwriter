const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('electronAPI', {
  // Example API points for offline data saving if we switch to filesystem saving or other things
  saveData: (key, data) => ipcRenderer.invoke('save-data', key, data),
  loadData: (key) => ipcRenderer.invoke('load-data', key),
  
  // Window controls
  minimize: () => ipcRenderer.send('window-minimize'),
  toggleMaximize: () => ipcRenderer.send('window-toggle-maximize'),
  close: () => ipcRenderer.send('window-close'),
  // Auto-Updater API
  onUpdaterEvent: (callback) => {
    ipcRenderer.on('updater-event', (event, message, data) => callback(message, data));
  },
  checkForUpdates: () => ipcRenderer.invoke('updater-check-now'),
  quitAndInstall: () => ipcRenderer.send('updater-quit-and-install'),
});