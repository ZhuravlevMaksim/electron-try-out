import {useEffect, useState} from "react";
import {db} from "../db";

export const Book = ({selected}) => {

    const [row, setRow] = useState(500)
    const [text, setText] = useState('')

    useEffect(() => {
        if (selected && selected.book) {
            selected.row !== undefined && setRow(selected.row)
        }
    }, [selected])

    useEffect(() => {
        selected && selected.book && db.getBookRow(selected.book, row)
            .then(({text}) => setText(text))
    }, [selected, row])

    return selected ? <div className="book">
        <h1>{selected.book}</h1>
        <div>{text}</div>
        <div>
            <button onClick={() => setRow(row - 1)}>prev</button>
            <button onClick={() => setRow(row + 1)}>next</button>
        </div>
    </div> : null

}
