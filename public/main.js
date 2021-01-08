const {app, ipcMain, BrowserWindow} = require('electron')
const path = require('path')
const fs = require("fs");

// if (process.env.NODE_ENV !== 'production'){
//     require('electron-reload')(__dirname, {ignored: [/content|[/\\]\./] });
// }

const entryUrl = process.env.NODE_ENV !== 'production'
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, 'index.html')}`;

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 900,
        frame: true,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true

            // nodeIntegration: true, // <--- flag
            // webSecurity: false,
            // nodeIntegrationInWorker: true, // <---  for web workers
            // preload: path.join(__dirname, 'preload.js')
        }
    })

    win.loadURL(entryUrl);
    // mainWindow.loadFile('index.html')
    win.webContents.openDevTools()
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})

require('../src/main/file.js');