import {log} from "../util";

let instance: IDBDatabase

export interface Info {
    book: string
    rows: number
    row: number
    translateRow?: number
}

export interface Row {
    book: string
    row: number
    text: string
    translation?: string
}

class Db {

    async addBook(book, bookText) {
        return Promise.all([
            putInfo({book, rows: bookText.length - 1, row: 0, translateRow: 0}),
            commonTransaction('book_text', store => {
                bookText.forEach((text, row) => {
                    store.add({book, row, text});
                })
            })
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

        const info: Info = await commonRequest('book_info', store => {
            return store.get(book)
        })
        await putInfo({...info, book, translateRow: row})

        const bRow: Row = await commonRequest('book_text', store => {
            return store.get([book, row])
        })
        await commonTransaction('book_text', store => {
            return store.put({...bRow, translation})
        })

    }

    updateCurrentPage(book, page) {
        commonRequest('book_info', store => {
            return store.get(book)
        }).then((info: Info) => {
            commonTransaction('book_info', store => {
                store.put({...info, row: page})
            }).then(() => log('Update book_info', book, page))
        })
    }

    async currentPage(book) {
        const info: Info = await commonRequest('book_info', store => {
            return store.get(book)
        })
        return info.row
    }

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

async function putInfo(info: Info) {
    return commonTransaction('book_info', (store) => {
        store.put(info)
    })
}

async function commonRequest(store, fun: (IDBObjectStore) => IDBRequest): Promise<any> {
    const transaction = instance.transaction([store], 'readonly');

    const request = fun(transaction.objectStore(store))

    return new Promise((resolve, reject) => {
        request.onsuccess = function (e) {
            resolve(request.result)
        };
        request.onerror = function (e) {
            reject(transaction.error)
        };
    })

}

async function commonTransaction(store, fun) {
    const transaction = instance.transaction([store], 'readwrite');

    fun(transaction.objectStore(store))

    return new Promise((resolve, reject) => {
        transaction.oncomplete = function (e) {
            resolve('Done')
        };
        transaction.onerror = function (e) {
            reject(transaction.error)
        };
    })

}

async function init() {
    const request = window.indexedDB.open('books', 2);
    return new Promise((resolve, reject) => {
        request.onsuccess = function () {
            resolve('Database opened successfully');
            instance = request.result;
        }
        request.onupgradeneeded = function (e: any) {
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

Object.getOwnPropertyNames(Db.prototype).forEach((name) => {
    const method = Db.prototype[name];
    Db.prototype[name] = async function () {
        if (instance === undefined) await init()
        // @ts-ignore
        return method(...arguments)
    };
});

export const db = new Db()
