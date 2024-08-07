import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import HomePage from './components/HomePage';
import CryptoDetailPage from './components/CryptoDetailPage';

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={HomePage} />
        <Route path="/crypto/:id" component={CryptoDetailPage} />
      </Switch>
    </Router>
  );
}

export default App;