import {useEffect, useState} from "react";
import {getBooks, onNewBookAdded} from "./utils";

export const BookList = ({onSelect}) => {

    const [selected, setSelected] = useState({})
    const [books, setBooks] = useState({})

    const prepareNewBook = (book) => {
        setBooks({...books, [book.book]: book})
    }

    useEffect(() => {
        getBooks().then(books => {
            setBooks(books.reduce((acc, book) => {
                acc[book.book] = book
                return acc
            }, {}))
        })
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