let db = undefined

export default class Db {
    static async init() {

        console.log(new Date(), 'init db')

        const request = window.indexedDB.open('books', 2);

        return new Promise((resolve, reject) => {
            request.onsuccess = function () {
                resolve('Database opened successfully');
                db = request.result;
            }
            request.onupgradeneeded = function (e) {
                db = e.target.result;

                db.createObjectStore('book_text', {keyPath: ['book', 'row']});
                db.createObjectStore('book_info', {keyPath: 'book'});

                resolve('Database setup complete');
            };

            request.onerror = function () {
                reject('Database failed to open');
            };
        })
    }

    static async addBook(book, bookText) {
        if (db === undefined) await Db.init()

        return Promise.all([
            addBookInfo(book, bookText.length),
            addBookText(book, bookText)
        ])
    }

    static async getBooks() {

        if (db === undefined) await Db.init()

        const objectStore = db.transaction('book_info').objectStore('book_info');

        const request = objectStore.getAll()

        return new Promise((resolve, reject) => {
            request.onsuccess = function (e) {
                resolve((request.result).reduce((acc, book) => {
                    acc[book.book] = book
                    return acc
                }, {}))
            };
            request.onerror = function (e) {
                reject(request.error)
            };
        })
    }

    static async getBookRow(book, row){
        if (db === undefined) await Db.init()

        const objectStore = db.transaction('book_text').objectStore('book_text');

        const request = objectStore.get([book, row])

        return new Promise((resolve, reject) => {
            request.onsuccess = function (e) {
                resolve(request.result)
            };
            request.onerror = function (e) {
                reject(request.error)
            };
        })
    }
}

async function addBookText(book, bookText) {
    const transaction = db.transaction(['book_text'], 'readwrite');
    const objectStore = transaction.objectStore('book_text');

    bookText.forEach((text, row) => {
        objectStore.add({book, row, text});
    })

    return new Promise((resolve, reject) => {
        transaction.oncomplete = function () {
            resolve('done')
        };
        transaction.onerror = function (e) {
            reject(e)
        };
    })
}

async function addBookInfo(book, rows) {
    const transaction = db.transaction(['book_info'], 'readwrite');
    const objectStore = transaction.objectStore('book_info');

    objectStore.add({book, rows, row: 0, translateRows: 0, translateRow: 0})

    return new Promise((resolve, reject) => {
        transaction.oncomplete = function () {
            resolve('done')
        };
        transaction.onerror = function (e) {
            reject(e)
        };
    })

}