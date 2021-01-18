import {useEffect, useState} from "react";
import {db} from "../db";

const {ipcRenderer} = window.require('electron');

export const useOnBookAdd = () => {

    const [added, setAdded] = useState({})

    useEffect(() => {
        return onDrop(newBook => ipcRenderer.send('add-book', newBook))
    }, [])

    useEffect(() => {
        const listener = (event, {book, state, text}) => {
            setAdded({book, state})
            if (text) {
                db.addBook(book, text)
                    .then(() => setAdded({book, rows: text.length, row: 0, translateRow: 0}))
                    .catch(e => console.log('e', e))
            }
        }
        ipcRenderer.on('add-book', listener)
        return () => ipcRenderer.removeListener('add-book', listener)
    }, [])

    return added
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