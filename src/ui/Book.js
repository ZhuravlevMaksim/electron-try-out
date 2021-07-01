import {useEffect, useState} from "react";
import {db} from "../db";
import {useRouteMatch} from "react-router-dom";
import {Button} from "./Button";

const {ipcRenderer} = window.require('electron');

export const Book = () => {

    const [info, setInfo] = useState(undefined)
    const [i, setIndex] = useState(undefined)
    const [row, setRow] = useState(null)

    const {params: {name}} = useRouteMatch()

    useEffect(() => {
        if (i !== undefined) {
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

    useEffect(() => {
        row && row.text && ipcRenderer.send('next-translate', row.text)
    }, [row])

    useEffect(() => {
        const fun = function (e) {
            if (e.key === 'ArrowRight') {
                setIndex(i + 1)
            }
            if (e.key === 'ArrowLeft') {
                setIndex(i - 1)
            }
        }
        document.addEventListener('keydown', fun)
        return () => document.removeEventListener('keydown', fun)
    }, [i])

    return <div className="book">
        <h3>{name}</h3>
        {
            row ?
                <div className="book__text">
                    <div>{row.translation}</div>
                    <br/>
                    <br/>
                    <div onClick={e => ipcRenderer.send('click-translate', e.target.outerText)}>{row.text}</div>
                </div>
                : null
        }
        <div className='book-row-navigation'>
            <Button hide={i <= 0} onClick={() => setIndex(i - 1)}>prev</Button>
            <div style={{display: 'flex'}}>
                <Button hide={i <= 0 || i < 100} onClick={() => setIndex(i - 100)}>-100</Button>
                <div style={{width: 10}}/>
                <Button hide={i + 100 > info ? info.rows : 0} onClick={() => setIndex(i + 100)}>+100</Button>
            </div>
            <Button onClick={() => setIndex(i + 1)}>next</Button>
        </div>
    </div>
}