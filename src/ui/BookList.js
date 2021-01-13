import {useEffect, useState} from "react";
import Db from "../db";

const {ipcRenderer} = window.require('electron');


export const BookList = ({onSelect}) => {

    const [selected, setSelected] = useState({})
    const [books, setBooks] = useState({})

    const prepareNewBook = (book) => {
        const bookNoText = {...book, text: null}
        setBooks({...books, [book.book]: bookNoText})
        if (book.text) {
            Db.addBook(book.book, book.text)
                .then(e => setBooks({...books, [book.book]: bookNoText}))
                .catch(e => console.log('e', e))
        }
    }

    useEffect(() => {
        Db.getBooks()
            .then(books => setBooks(books))
            .catch(e => console.log(e))
    }, [])

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
            Object.values(books).map(info => <ListRow key={info.book}
                                                      selected={selected.book}
                                                      info={info}
                                                      onCLick={() => setSelected(info)}/>)
        }
    </div> : null
}

const ListRow = ({
                     selected,
                     info: {book, page, total, translate, state},
                     onCLick
                 }) => {
    const pending = state === 'pending'
    return <div onClick={onCLick} style={pending ? {backgroundColor: 'gray', opacity: 0.5} : null}
                className={selected === book ? 'books-list-item selected' : 'books-list-item'}>
        <div className="book">{book}</div>
        <div className="progress" style={{width: total ? 100 / total * page : 0}}/>
        <div className="translation" style={{width: total ? 100 / total * translate : 0}}/>
        {pending ? <div>pending...</div> : null}
        <div>remove</div>
        <div>translate</div>
    </div>
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