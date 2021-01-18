import React, {useEffect} from "react";
import '../index.scss';
import {Book} from "./Book";
import {BookList} from "./BookList";

import {Route, Switch, useHistory, useRouteMatch} from 'react-router-dom';

function App() {

    const history = useHistory()
    const route = useRouteMatch()

    useEffect(() => {
        if (route.path === '/') history.push('/books')
    }, [])

    return <div className="App">
        <Switch>
            <Route exec path="/books">
                <BookList/>
            </Route>
            <Route path="/book/:name">
                <button onClick={history.goBack}>back</button>
                <Book/>
            </Route>
        </Switch>
    </div>
}

export default App;