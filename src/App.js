import {useEffect, useState} from "react";
import './index.scss';
import {BookList} from "./BookList";
import {Book} from "./Book";
import {addNewBook} from "./utils";


function App() {

    const [selected, setSelected] = useState(null)

    useEffect(() => {
        onDrop(newBook => addNewBook(newBook))
    }, [])

    return <div className="App">
        <BookList onSelect={info => setSelected(info)}/>
        <Book selected={selected}/>
    </div>

}

export default App;

function onDrop(addBook) {
    document.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
    });
    document.addEventListener('drop', (event) => {
        event.preventDefault();
        event.stopPropagation();
        for (const {name, path} of event.dataTransfer.files) {
            addBook({name, path})
        }
    });
}