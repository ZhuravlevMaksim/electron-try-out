import {useEffect, useState} from "react";
import {db} from "../db";
import {useRouteMatch} from "react-router-dom";
import {Button} from "./Button";

export const Book = () => {

    const [i, setIndex] = useState(500)
    const [row, setRow] = useState(null)

    const {params: {name}} = useRouteMatch()

    useEffect(() => {
        db.getBookRow(name, i).then((row) => setRow(row))
    }, [i])

    return row ? <div className="book">
        <h3>{name}</h3>
        <div>{row.text}</div>
        <div>{row.translation}</div>
        <div className='book-row-navigation'>
            <Button onClick={() => setIndex(i - 1)}>prev</Button>
            <Button onClick={() => setIndex(i + 1)}>next</Button>
        </div>
    </div> : null

}
