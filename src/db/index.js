let instance = undefined

class Db {

    async addBook(book, bookText) {
        return Promise.all([
            putInfo({book, rows: bookText.length, row: 0, translateRow: 0}),
            addBookText(book, bookText)
        ])
    }

    async removeBook(book) {
        return remove(book)
    }

    async getBooks(book = undefined) {
        const objectStore = instance.transaction('book_info').objectStore('book_info');

        const request = objectStore.getAll(book)

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

    async getBookRow(book, row) {
        const objectStore = instance.transaction('book_text').objectStore('book_text');

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

    async addTranslation({book, row, translation}) {
        await putRow({book, row, translation})
        await putInfo({book, translateRow: row})
    }

}

async function getBookRow(book, row) {
    const transaction = instance.transaction(['book_text'], 'read');
    const objectStore = transaction.objectStore('book_text');
    return promise(objectStore.get([book, row]))
}

async function getInfo(book) {
    const transaction = instance.transaction(['book_info'], 'read');
    const objectStore = transaction.objectStore('book_info');
    return promise(objectStore.get(book))
}

async function remove(book) {
    const text = instance.transaction(['book_text'], 'readwrite');
    const info = instance.transaction(['book_info'], 'readwrite');
    const textStore = text.objectStore('book_text');
    const infoStore = info.objectStore('book_info');

    infoStore.delete(book)

    const request = textStore.openKeyCursor()

    request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
            if (cursor.primaryKey[0] === book) {
                textStore.delete(cursor.primaryKey)
            }
            cursor.continue();
        }
    }

    return new Promise((resolve, reject) => {
        text.oncomplete = function (e) {
            resolve('done')
        };
        text.onerror = function (e) {
            reject(e)
        };
    })
}

async function addBookText(book, bookText) {
    const transaction = instance.transaction(['book_text'], 'readwrite');
    const objectStore = transaction.objectStore('book_text');

    bookText.forEach((text, row) => {
        objectStore.add({book, row, text});
    })

    return promise(transaction)
}

async function putRow(row) {
    const transaction = instance.transaction(['book_text'], 'readwrite');
    const objectStore = transaction.objectStore('book_text');

    const bookRow = await getBookRow(row.book, row.row)

    console.log("bookRow", bookRow)

    objectStore.put({...bookRow, ...row})
    return promise(transaction)
}

async function putInfo(info) {
    const transaction = instance.transaction(['book_info'], 'readwrite');
    const objectStore = transaction.objectStore('book_info');

    const bookInfo = await getInfo(info.book)

    console.log("bookInfo", bookInfo)

    objectStore.put({...bookInfo, ...info})

    return promise(transaction)
}

async function init() {
    const request = window.indexedDB.open('books', 2);
    return new Promise((resolve, reject) => {
        request.onsuccess = function () {
            resolve('Database opened successfully');
            instance = request.result;
        }
        request.onupgradeneeded = function (e) {
            instance = e.target.result;

            instance.createObjectStore('book_text', {keyPath: ['book', 'row']});
            instance.createObjectStore('book_info', {keyPath: 'book'});

            resolve('Database setup complete');
        };
        request.onerror = function () {
            reject('Database failed to open');
        };
    })
}

const promise = request => {
    return new Promise((resolve, reject) => {
        request.oncomplete = function (e) {
            resolve(request.result)
        };
        request.onerror = function (e) {
            reject(request.error)
        };
    })
}

Object.getOwnPropertyNames(Db.prototype).forEach((name) => {
    const method = Db.prototype[name];
    Db.prototype[name] = async function () {
        if (instance === undefined) await init()
        return method(...arguments)
    };
});

export const db = new Db()
