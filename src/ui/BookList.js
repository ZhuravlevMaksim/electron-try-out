import {useEffect, useState} from "react";
import {db} from "../db";

const {ipcRenderer} = window.require('electron');


export const BookList = ({onSelect}) => {

    const [selected, setSelected] = useState({})
    const [books, setBooks] = useState({})
    const [translateBookList, setTranslate] = useState({})

    const prepareNewBook = (book) => {
        const bookNoText = {...book, text: null}
        setBooks({...books, [book.book]: bookNoText})
        if (book.text) {
            db.addBook(book.book, book.text)
                .then(e => setBooks({...books, [book.book]: bookNoText}))
                .catch(e => console.log('e', e))
        }
    }

    useEffect(() => {
        db.getBooks()
            .then(books => setBooks(books))
            .catch(e => console.log(e))
    }, [])

    useEffect(() => {
        const toTranslate = Object.keys(translateBookList).filter(key => translateBookList[key]).map(key => books[key])
        if (toTranslate.length) {
            toTranslate.forEach(book => sendAsyncTranslate(book))
        }
    }, [books, translateBookList])

    useEffect(() => {
        console.log(books)
        return receiveTranslated(book => {
            console.log(book)
            setBooks({
                ...books, [book.book]: {...books[book.book], translateRow: book.row + 1}
            })
        })
    }, [books, translateBookList])

    useEffect(() => {
        return onDrop(newBook => addNewBook(newBook))
    }, [])

    useEffect(() => {
        return onNewBookAdded(prepareNewBook)
    }, [books])

    useEffect(() => {
        onSelect(selected)
    }, [selected])

    return books ? <div className="books-list">
        {
            Object.values(books).map((info) => {
                const {book, page, total, translate, state} = info
                const pending = state === 'pending'
                const isSelected = selected.book === book
                return <div>
                    <div onClick={() => setSelected(info)}
                         style={pending ? {backgroundColor: 'gray', opacity: 0.5} : null}
                         className={isSelected ? 'books-list-item selected' : 'books-list-item'}>
                        <div className="book">{book}</div>
                        <div className="progress" style={{width: total ? 100 / total * page : 0}}/>
                        <div className="translation" style={{width: total ? 100 / total * translate : 0}}/>
                    </div>
                    <div style={{marginTop: '1rem'}}>
                        {pending ? <button>pending...</button> : null}
                        <button style={{marginRight: 5}} onClick={e => {
                            const isTranslation = translateBookList[book] || false
                            setTranslate({...translateBookList, [book]: !isTranslation})
                        }}>
                            {translateBookList[book] ? 'translating...' : 'translate'}
                        </button>
                        <button style={{marginLeft: 'auto'}}>remove</button>
                    </div>
                </div>
            })
        }
    </div> : null
}

function onDrop(addBook) {

    const dragover = (e) => {
        e.preventDefault();
        e.stopPropagation();
    }

    const drop = (event) => {
        event.preventDefault();
        event.stopPropagation();
        for (const {name, path} of event.dataTransfer.files) {
            addBook({name, path})
        }
    }

    document.addEventListener('dragover', dragover);
    document.addEventListener('drop', drop);

    return () => {
        document.removeEventListener('dragover', dragover)
        document.removeEventListener('drop', drop)
    }
}

function addNewBook(book) {
    return ipcRenderer.send('add-book', book)
}

function onNewBookAdded(onAdd) {
    const listener = (event, args) => onAdd(args)
    ipcRenderer.on('add-book', listener)
    return () => ipcRenderer.removeListener('add-book', listener)
}

// {book, rows: bookText.length, row: 0, translateRow: -1}
function sendAsyncTranslate({book, translateRow}) {
    console.log("send " + translateRow)
    db.getBookRow(book, translateRow).then(row => ipcRenderer.send('translate', row)) // book row text
}

function receiveTranslated(onReceive) {
    const listener = (event, args) => onReceive(args)
    ipcRenderer.on('translate', listener)
    return () => ipcRenderer.removeListener('translate', listener)
}


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
