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
    if (arg.name.endsWith(".pdf")) {
        getPdfText(arg.path, text => event.reply('add-book', {book: arg.name, text}))
    } else if (arg.name.endsWith(".epub")) {
        getEpubText(arg.path).then(text => event.reply('add-book', {book: arg.name, text}))
    }
})

const EpubReader = require("epub");

function getEpubText(filename) {
    const epub = new EpubReader(filename)
    const promise = new Promise(resolve => {
        const result = []
        const p = /<p.*>(.*)<\/p>/g;
        epub.on('end', function () {
            epub.spine.contents.forEach(({id}, index) => {
                result[index] = new Promise(res => {
                    epub.getChapter(id, (error, text) => {
                        const resp = []
                        for (const match of text.matchAll(p)) {
                            const m = match[1].split('.')
                            if (m.length) {
                                m.forEach(e => resp.push(e))
                            }
                        }
                        console.log(resp)
                        res(resp)
                    })
                })
            })
            Promise.all(result).then(result => {
                const text = []
                result.forEach(p => {
                    for (const line of p) {
                        if (line === '') continue
                        if (line === '&nbsp;') continue
                        text.push(line)
                    }
                })
                resolve(text)
            })
        });
    })
    epub.parse();

    return promise
}

const PdfReader = require("pdfreader").PdfReader;

function getPdfText(filename, callback) {
    const text = []
    new PdfReader().parseFileItems(filename, function (err, item) {
        if (item === undefined) callback(text)
        else if (item.x) text.push(item.text);
    });
}

const translate = require("@vitalets/google-translate-api");

ipcMain.on('translate', async (event, {book, row, text}) => {
    try {
        const {text: translation} = await translate(text, {client: 'gtx', to: 'ru'})
        event.reply('translate', {book, row, translation})
    } catch (e) {
        event.reply('translate', {book, row, error: e.message})
    }
})
