import {db} from "../db";
import {useEffect, useState} from "react";

const {ipcRenderer} = window.require('electron');

const translator = new class {
    private state = {}
    private ouid = 0
    private observers: any = {}

    constructor() {
        ipcRenderer.removeAllListeners('translate')
        ipcRenderer.on('translate', (event, args) => {
            translator.receive(args)
        })
    }

    onReceive(onChangeTranslation: (value: (((prevState: {}) => {}) | {})) => void) {
        const uid = this.ouid++
        this.observers[uid] = onChangeTranslation
        return () => {
            delete this.observers[uid]
        }
    }

    setTranslate({book, translating}) {
        this.state = {...this.state, [book]: {...this.state[book], translating}}
        if (translating) {
            db.getBooks(book).then((info) => {
                const {rows, translateRow} = info[book]
                this.state[book] = {...this.state[book], rows, translateRow}
                this.translate(book)
            })
        }
    }

    private receive({book, row, text}) {

        this.state[book] = {...this.state[book], translateRow: row + 1}

        // console.log('receive', this.state[book])

        Object.values(this.observers).forEach((setter: any) => setter(this.translation))

        this.translate(book)
    }

    get translation() {
        return {...this.state}
    }

    private translate(book) {
        if (this.state[book]) {
            const {translating, rows, translateRow} = this.state[book]
            if (translating && rows && translateRow < rows) {
                db.getBookRow(book, translateRow).then(row => {
                    ipcRenderer.send('translate', row)
                })
            } else {

            }
        }
    }

    private sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export const useTranslate = () => {

    const [translation, onChangeTranslation] = useState(translator.translation)

    const setTranslate = ({book, translating}: { book: string, translating: boolean }) => {
        translator.setTranslate({book, translating})
        onChangeTranslation(translator.translation)
    }

    useEffect(() => {
        return translator.onReceive(onChangeTranslation)
    }, [])

    return [translation, setTranslate]
}