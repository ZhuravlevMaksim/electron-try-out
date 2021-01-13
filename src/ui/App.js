import {useState} from "react";
import '../index.scss';
import {BookList} from "./BookList";
import {Book} from "../Book";


function App() {

    const [selected, setSelected] = useState(null)

    return <div className="App">
        <BookList onSelect={info => setSelected(info)}/>
        <Book selected={selected}/>
    </div>
}

export default App;