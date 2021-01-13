const {app, ipcMain, BrowserWindow} = require('electron')
const path = require('path')

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

ipcMain.on('add-book', (event, arg) => {
    event.reply('add-book', {book: arg.name, state: 'pending'})
    getPdfText(arg.path, text => event.reply('add-book', {book: arg.name, text}))
})

const PdfReader = require("pdfreader").PdfReader;

function getPdfText(filename, callback) {
    const text = []
    new PdfReader().parseFileItems(filename, function (err, item) {
        if (item === undefined) callback(text)
        else if (item.x) text.push(item.text);
    });
}

const translate = require("@vitalets/google-translate-api");

ipcMain.on('translate', async (event, arg) => {
    const {text} = await translate(arg, {client: 'gtx', to: 'ru'})
    event.reply('translate', text)
})


