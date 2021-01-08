const {ipcRenderer} = window.require('electron');


export async function getBooks() {
    return ipcRenderer.sendSync('books')
}

export async function getBook(book) {
    return ipcRenderer.sendSync('book', book)
}

export function addNewBook(book) {
    return ipcRenderer.send('add-book', book)
}

export function onNewBookAdded(onAdd) {
    const listener = (event, args) => onAdd(args)
    ipcRenderer.on('add-book', listener)
    return () => ipcRenderer.removeListener('add-book', listener)
}
