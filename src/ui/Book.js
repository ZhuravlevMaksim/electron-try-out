import {useEffect, useState} from "react";
import {db} from "../db";
import {useHistory, useRouteMatch} from "react-router-dom";

export const Book = () => {

    const [row, setRow] = useState(500)
    const [text, setText] = useState('')

    const {params: {name}} = useRouteMatch()

    useEffect(() => {
        db.getBookRow(name, row).then(({text}) => setText(text))
    }, [row])

    return <div className="book">
        <h1>{name}</h1>
        <div>{text}</div>
        <div>
            <button onClick={() => setRow(row - 1)}>prev</button>
            <button onClick={() => setRow(row + 1)}>next</button>
        </div>
    </div>

}
