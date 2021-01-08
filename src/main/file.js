const {ipcMain} = require('electron')
const fs = require("fs");
const readline = require('readline');
const os = require("os");
const worker = require('worker_threads');

const content = './content'
const infoFolder = './content/info'
const booksFolder = './content/books'
const translationFolder = './content/translation'

if (!fs.existsSync(content)) fs.mkdirSync(content);
[infoFolder, booksFolder, translationFolder].forEach(path => {
    if (!fs.existsSync(path)) fs.mkdirSync(path)
})

ipcMain.on('books', (event, arg) => {
    getBooks().then(books => {
        event.returnValue = books
    })
})

ipcMain.on('book', (event, arg) => {
    readBook(arg).then(book => {
        event.returnValue = book
    })
})

ipcMain.on('add-book', (event, arg) => {
    event.reply('add-book', {book: arg.name, state: 'pending'})
    prepareAndSaveBook(arg, info => {
        updateInfo(info)
        event.reply('add-book', info)
    })
})


async function readBook(file) {
    const [book, translation] = await Promise.all([
        readFile(`${booksFolder}/${file}`),
        readFile(`${translationFolder}/${file}`)
    ])

    return {
        book,
        translation
    }
}

async function getBooks() {
    const files = fs.readdirSync(booksFolder)
    const filesInfo = []
    for (let file of files) {
        const info = await getInfo(file)
        const book = info[0]
        const page = parseInt(info[1], 10)
        const total = parseInt(info[2], 10)
        const translate = parseInt(info[3], 10)
        filesInfo.push({book, page, total, translate})
    }
    return filesInfo
}

async function getInfo(file) {
    const info = await readFile(`${infoFolder}/${file}`)
    if (info.length === 0) {
        info.push(file, 0, 0, 0)
        fs.writeFileSync(`${info}/${file}`, info.join("\r\n"))
    }
    return info
}

async function readFile(file) {
    if (!fs.existsSync(file)) return [];

    const data = []
    const fileStream = fs.createReadStream(file)
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });
    for await (const line of rl) {
        if (line.length) {
            data.push(line)
        }
    }
    return data
}

function updateInfo({book, page, total, translate}) {
    fs.writeFile(`${infoFolder}/${book}`, [book, page, total, translate].join('\r\n'), err => {
    })
}

async function appendTranslation(file, info, translation) {
    fs.appendFile(`${translationFolder}/${file}`, translation + '\r\n', err => {
    })
}

function prepareAndSaveBook(file, onWriteDone) {

    fs.readFile(file.path, 'utf-8', (err, data) => {
        if (err) throw err;

        let book = []
        let line = []
        let pages = 0

        for (const char of data) {
            if ('\r\n'.includes(char)) {
                if (line.length > 10) {
                    let write = []
                    for (const char of line) {
                        write.push(char)
                        if (".".includes(char)) {
                            if (write[0] === " ") write.shift()
                            book.push(write.join("") + os.EOL);
                            pages++
                            write = []
                        }
                    }
                }
                line = []
            } else {
                line.push(char)
            }
        }

        fs.writeFile(`${booksFolder}/${file.name}`, book.join(""), err => onWriteDone({
            book: file.name, page: 0, total: pages, translate: 0, err
        }))
    })
}