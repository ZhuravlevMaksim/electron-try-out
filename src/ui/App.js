import {useState} from "react";
import '../index.scss';
import {Book} from "./Book";
import {BookList} from "./BookList";


function App() {

    const [selected, setSelected] = useState(null)

    return <div className="App">
        <BookList onSelect={info => setSelected(info)}/>
        <Book selected={selected}/>
    </div>
}

export default App;