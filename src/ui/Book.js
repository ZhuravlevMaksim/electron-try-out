import {useEffect, useState} from "react";
import {db} from "../db";
import {useRouteMatch} from "react-router-dom";
import {Button} from "./Button";

export const Book = () => {

    const [info, setInfo] = useState(undefined)
    const [i, setIndex] = useState(undefined)
    const [row, setRow] = useState(null)

    const {params: {name}} = useRouteMatch()

    useEffect(() => {
        if (i !== undefined){
            db.getBookRow(name, i).then((row) => setRow(row))
            db.updateCurrentPage(name, i)
        }
    }, [i])

    useEffect(() => {
        db.boonInfo(name).then(setInfo)
    }, [])

    useEffect(() => {
        info && setIndex(info.row)
    }, [info])

    return row ? <div className="book">
        <h3>{name}</h3>
        <div className="book__text">
            <div>{row.translation}</div>
            <br/>
            <br/>
            <div >{row.text}</div>
        </div>
        <div className='book-row-navigation'>
            <Button hide={i === 0} onClick={() => setIndex(i - 1)}>prev</Button>
            <div style={{display: 'flex'}}>
                <Button hide={i <= 0 || i < 100} onClick={() => setIndex(i - 100)}>-100</Button>
                <div style={{width: 10}}/>
                <Button hide={i + 100 > info.rows} onClick={() => setIndex(i  + 100)}>+100</Button>
            </div>
            <Button onClick={() => setIndex(i + 1)}>next</Button>
        </div>
    </div> : null

}