import {useEffect, useState} from "react";
import {getBook} from "./utils";

export const Book = ({selected}) => {

    const [book, setBook] = useState(null)
    const [row, setRow] = useState(0)

    useEffect(() => {
        selected && getBook(selected.book).then(e => {
            setBook(e)
            setRow(selected.page)
        })
    }, [selected])

    useEffect(() => {

    }, [book])

    return selected && book ? <div className="book">
        <h1>{selected.book}</h1>
        <div>{book.book[row]}</div>
        <div>
            <button onClick={() => setRow(row - 1)}>next</button>
            <button onClick={() => setRow(row + 1)}>prev</button>
        </div>
    </div> : null

}
