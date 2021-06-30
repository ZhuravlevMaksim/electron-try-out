const {app, ipcMain, BrowserWindow} = require('electron')
const path = require('path')

const entryUrl = app.isPackaged
    ? `file://${path.join(__dirname, 'index.html')}`
    : 'http://localhost:3000';

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
    !app.isPackaged && win.webContents.openDevTools()
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
    if (arg.name.endsWith(".epub")) {
        getEpubText(arg.path).then(text => event.reply('add-book', {book: arg.name, text}))
    }
})

const EpubReader = require("epub");

// require('child_process').spawn('clip').stdin.end(text)
function getEpubText(filename) {
    const epub = new EpubReader(filename)
    const promise = new Promise(resolve => {
        const result = []
        epub.on('end', function () {
            epub.spine.contents.forEach(({id}, index) => {
                result[index] = new Promise(res => {
                    epub.getChapter(id, (error, text) => {
                        const resp = []
                        for (let result of text.matchAll(/<p[^>]*>(.*?|[\s\S]*?)<\/p>/g)) {
                            const p = result[1].replaceAll(/\r?\n|\r/g, ' ').replaceAll(/<.+?>/g, '')
                            resp.push(p)
                        }
                        res(resp)
                    })
                })
            })
            Promise.all(result).then(result => {
                const text = []
                result.forEach(p => {
                    for (const line of p) {
                        if (line.length <= 2) continue
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

const translate = require("@vitalets/google-translate-api");

ipcMain.on('translate', async (event, {book, row, text}) => {
    try {
        const {text: translation} = await translate(text, {client: 'gtx', to: 'ru'})
        event.reply('translate', {book, row, translation})
    } catch (e) {
        event.reply('translate', {book, row, error: e.message})
    }
})

const clickWindow = {
    win: null
}

ipcMain.on('click-translate', async (event, text) => {
    if (clickWindow.win === null){
        clickWindow.win =  new BrowserWindow({
            center: true,
            resizable: true,
            webPreferences: {
                nodeIntegration: false,
                show: false
            }
        });

        clickWindow.win.setMenuBarVisibility(false)
        clickWindow.win.maximize();
        clickWindow.win.loadURL(`https://translate.google.com/?hl=ru&sl=en&tl=ru&text=${text}&op=translate`);
        clickWindow.win.once('ready-to-show', () => {
            clickWindow.win.show()
        });
        clickWindow.win.once('closed', () => {
            clickWindow.win = null
            console.log(clickWindow)
        });
    }else {
        clickWindow.win.loadURL(`https://translate.google.com/?hl=ru&sl=en&tl=ru&text=${text}&op=translate`);
    }


})
