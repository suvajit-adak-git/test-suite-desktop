const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    // File operations
    openFileDialog: (options) => ipcRenderer.invoke('open-file-dialog', options),
    saveFileDialog: (options) => ipcRenderer.invoke('save-file-dialog', options),

    // Backend
    getBackendUrl: () => ipcRenderer.invoke('get-backend-url'),

    // App info
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),

    // Store operations
    storeGet: (key) => ipcRenderer.invoke('store-get', key),
    storeSet: (key, value) => ipcRenderer.invoke('store-set', key, value),

    // Notifications
    showNotification: (options) => ipcRenderer.invoke('show-notification', options),

    // Event listeners
    onOpenFileDialog: (callback) => {
        ipcRenderer.on('open-file-dialog', (event, type) => callback(type));
    },
    onUpdateAvailable: (callback) => {
        ipcRenderer.on('update-available', () => callback());
    },

    // Platform info
    platform: process.platform,
    isElectron: true,
});
