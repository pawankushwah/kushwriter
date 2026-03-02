"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    // Example API points for offline data saving if we switch to filesystem saving or other things
    saveData: (key, data) => electron_1.ipcRenderer.invoke('save-data', key, data),
    loadData: (key) => electron_1.ipcRenderer.invoke('load-data', key),
});
