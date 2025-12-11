const { app, BrowserWindow, Menu, Tray, dialog, ipcMain, shell } = require('electron');
const path = require('path');
const log = require('electron-log');
const { autoUpdater } = require('electron-updater');
const Store = require('electron-store');
const BackendManager = require('./backend-manager');

// Configure logging
log.transports.file.level = 'info';
autoUpdater.logger = log;

// Initialize store for app settings
const store = new Store();

let mainWindow = null;
let tray = null;
let backendManager = null;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
const BACKEND_PORT = 8000;

// Auto-updater configuration
function setupAutoUpdater() {
  autoUpdater.checkForUpdatesAndNotify();

  autoUpdater.on('update-available', () => {
    log.info('Update available');
    if (mainWindow) {
      mainWindow.webContents.send('update-available');
    }
  });

  autoUpdater.on('update-downloaded', () => {
    log.info('Update downloaded');
    const dialogOpts = {
      type: 'info',
      buttons: ['Restart', 'Later'],
      title: 'Application Update',
      message: 'A new version has been downloaded. Restart the application to apply the updates.',
    };

    dialog.showMessageBox(dialogOpts).then((returnValue) => {
      if (returnValue.response === 0) autoUpdater.quitAndInstall();
    });
  });

  autoUpdater.on('error', (err) => {
    log.error('Error in auto-updater:', err);
  });
}

// Create system tray
function createTray() {
  const trayIconPath = path.join(__dirname, '../build/tray-icon.png');
  tray = new Tray(trayIconPath);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show App',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      },
    },
    {
      label: 'Check for Updates',
      click: () => {
        autoUpdater.checkForUpdates();
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setToolTip('Test Suite');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });
}

// Create application menu
function createMenu() {
  const isMac = process.platform === 'darwin';

  const template = [
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: 'about' },
              { type: 'separator' },
              {
                label: 'Check for Updates',
                click: () => autoUpdater.checkForUpdates(),
              },
              { type: 'separator' },
              { role: 'services' },
              { type: 'separator' },
              { role: 'hide' },
              { role: 'hideOthers' },
              { role: 'unhide' },
              { type: 'separator' },
              { role: 'quit' },
            ],
          },
        ]
      : []),
    {
      label: 'File',
      submenu: [
        {
          label: 'Open SVN Report',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('open-file-dialog', 'svn');
            }
          },
        },
        {
          label: 'Open Checklist',
          accelerator: 'CmdOrCtrl+Shift+O',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('open-file-dialog', 'checklist');
            }
          },
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        ...(isMac
          ? [
              { role: 'pasteAndMatchStyle' },
              { role: 'delete' },
              { role: 'selectAll' },
            ]
          : [{ role: 'delete' }, { type: 'separator' }, { role: 'selectAll' }]),
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac
          ? [{ type: 'separator' }, { role: 'front' }, { type: 'separator' }, { role: 'window' }]
          : [{ role: 'close' }]),
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Documentation',
          click: async () => {
            await shell.openExternal('https://github.com/yourusername/test-suite');
          },
        },
        {
          label: 'Report Issue',
          click: async () => {
            await shell.openExternal('https://github.com/yourusername/test-suite/issues');
          },
        },
        { type: 'separator' },
        {
          label: 'About',
          click: () => {
            dialog.showMessageBox({
              type: 'info',
              title: 'About Test Suite',
              message: 'Test Suite Desktop',
              detail: `Version: ${app.getVersion()}\nElectron: ${process.versions.electron}\nChrome: ${process.versions.chrome}\nNode: ${process.versions.node}`,
            });
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Create main window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    icon: path.join(__dirname, '../build/icon.png'),
    show: false, // Don't show until ready
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../frontend/dist/index.html'));
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  // Handle window close
  mainWindow.on('close', (event) => {
    if (!app.isQuitting && process.platform === 'darwin') {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// IPC Handlers
function setupIpcHandlers() {
  // File dialog for opening files
  ipcMain.handle('open-file-dialog', async (event, options) => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: options.filters || [
        { name: 'Excel Files', extensions: ['xlsx', 'xls', 'xlsm'] },
        { name: 'CSV Files', extensions: ['csv'] },
        { name: 'All Files', extensions: ['*'] },
      ],
    });
    return result;
  });

  // Save dialog
  ipcMain.handle('save-file-dialog', async (event, options) => {
    const result = await dialog.showSaveDialog(mainWindow, options);
    return result;
  });

  // Get backend URL
  ipcMain.handle('get-backend-url', () => {
    return `http://localhost:${BACKEND_PORT}`;
  });

  // Get app version
  ipcMain.handle('get-app-version', () => {
    return app.getVersion();
  });

  // Store operations
  ipcMain.handle('store-get', (event, key) => {
    return store.get(key);
  });

  ipcMain.handle('store-set', (event, key, value) => {
    store.set(key, value);
  });

  // Show notification
  ipcMain.handle('show-notification', (event, options) => {
    const { Notification } = require('electron');
    if (Notification.isSupported()) {
      new Notification(options).show();
    }
  });
}

// App lifecycle
app.whenReady().then(async () => {
  log.info('App starting...');

  // Start backend
  backendManager = new BackendManager(BACKEND_PORT, isDev);
  try {
    await backendManager.start();
    log.info('Backend started successfully');
  } catch (error) {
    log.error('Failed to start backend:', error);
    dialog.showErrorBox('Backend Error', 'Failed to start the backend server. The application may not function correctly.');
  }

  // Create window and UI
  createWindow();
  createMenu();
  createTray();
  setupIpcHandlers();

  // Setup auto-updater (only in production)
  if (!isDev) {
    setupAutoUpdater();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else if (mainWindow) {
      mainWindow.show();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', async () => {
  log.info('App quitting...');
  if (backendManager) {
    await backendManager.stop();
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  log.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (error) => {
  log.error('Unhandled rejection:', error);
});
