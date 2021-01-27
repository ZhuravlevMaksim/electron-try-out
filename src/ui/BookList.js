import {useEffect, useState} from "react";
import {db} from "../db";
import {useTranslate} from "../hook/useTranslate";
import {useOnBookAdd} from "../hook/useOnBookAdd";
import {useHistory} from "react-router-dom";
import {Button} from "./Button";


export const BookList = () => {

    const history = useHistory()
    const [books, setBooks] = useState({})
    const newBook = useOnBookAdd()
    const [translate, setTranslate] = useTranslate()

    const getBooks = () => {
        db.getBooks()
            .then(books => setBooks(books))
            .catch(e => console.log(e))
    }

    const removeBook = (book) => {
        setBooks({...books, [book]: {...books[book], state: 'deleting'}})
        db.removeBook(book).then(() => {
            getBooks()
        })
    }

    useEffect(() => {
        getBooks()
    }, [])

    useEffect(() => {
        newBook && setBooks({...books, [newBook.book]: newBook})
    }, [newBook])

    return books ? <div className="books-list">
        {
            Object.values(books).filter(info => info.book !== undefined).map((info) => {
                const {book, rows, row, translateRow, state} = info
                const pending = state === 'pending' || state === 'deleting'
                return <div key={book} className='books-list__row'>
                    <div className='books-list__row__book'
                         style={pending ? {backgroundColor: 'gray', opacity: 0.5} : null}>
                        <div onClick={() => history.push(`/book/${book}`)} className='books-list__row__book__name'>{book}</div>
                        {
                            pending ?
                                <div className='books-list__row__book__info'>pending...</div> :
                                <div className='books-list__row__book__info'>
                                    <TranslateBtn book={book}
                                                  translateBookList={translate}
                                                  setTranslate={setTranslate}/>
                                    <Button red onClick={() => removeBook(book)}>
                                        remove
                                    </Button>
                                    <div>
                                        {`${rows} / ${row} / ${translate[book] && translate[book].translateRow || translateRow}`}
                                    </div>
                                </div>
                        }
                    </div>

                </div>
            })
        }
    </div> : null
}

const TranslateBtn = ({book, translateBookList, setTranslate}) => {
    const {translating = false, rows, translateRow} = translateBookList[book] || {}
    return rows === undefined || rows !== translateRow ? <Button onClick={() => {
        setTranslate({book, translating: !translating})
    }}>
        {translating ? 'translating...' : 'translate'}
    </Button> : null
}