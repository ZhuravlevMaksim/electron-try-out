import {useEffect, useState} from "react";
import {db} from "../db";
import {useTranslate} from "../hook/useTranslate";
import {useOnBookAdd} from "../hook/useOnBookAdd";
import {useHistory} from "react-router-dom";


export const BookList = () => {

    const history = useHistory()
    const [books, setBooks] = useState({})
    const [translateBookList, setTranslate] = useState({})
    const newBook = useOnBookAdd()

    useEffect(() => {
        db.getBooks()
            .then(books => setBooks(books))
            .catch(e => console.log(e))
    }, [])

    useEffect(() => {
        newBook && console.log("newBook", newBook)
        newBook && setBooks({...books, [newBook.book]: newBook})
    }, [newBook])

    return books ? <div className="books-list">
        {
            Object.values(books).map((info) => {
                const {book, rows, row, translateRow, state} = info
                const pending = state === 'pending'
                return <div>
                    <div onClick={() => history.push(`/book/${book}`)}
                         className='books-list-item'
                         key={book}
                         style={pending ? {backgroundColor: 'gray', opacity: 0.5} : null}>
                        <div className="book">{book}</div>
                        {
                            pending ?
                                <div className='books-list-item__info'>pending...</div> :
                                <div className='books-list-item__info'>{`${rows} / ${row} / ${translateRow}`}</div>
                        }
                    </div>
                    <div style={{marginTop: '1rem'}}>
                        <TranslateBtn book={book} translateBookList={translateBookList} setTranslate={setTranslate}/>
                        <button style={{marginLeft: 'auto'}} onClick={() => db.removeBook(book)}>remove</button>
                    </div>
                </div>
            })
        }
    </div> : null
}

const BookRow = (book) => {

}

const TranslateBtn = ({book, translateBookList, setTranslate}) => {
    return <button style={{marginRight: 5}} onClick={e => {
        const isTranslation = translateBookList[book] || false
        setTranslate({...translateBookList, [book]: !isTranslation})
    }}>
        {translateBookList[book] ? 'translating...' : 'translate'}
    </button>
}

const BookTranslate = ({book, needTranslate}) => {

    const [sendAsyncTranslate, onReceive] = useTranslate()
    const [translate, setTranslate] = useState(0)

    useEffect(() => {
        onReceive(e => {
            console.log("in translate", e)
        })
    }, [])

    useEffect(() => {
        if (needTranslate) sendAsyncTranslate(book)
    }, [needTranslate])

    return <div className="translation" style={{width: book.rows ? 100 / book.rows * translate : 0}}/>

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

}
