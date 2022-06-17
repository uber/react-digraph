import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {
  BrowserRouter as Router,
  NavLink,
  Redirect,
  Route,
  Switch,
} from 'react-router-dom';

import Bwdl from './bwdl';
import BwdlEditable from './bwdl-editable';
import Graph from './graph';
import MultipleGraphs from './multiple-graphs';

import './app.scss';

class App extends React.Component {
  render() {
    return (
      <Router>
        <div style={{ height: '100%' }}>
          <header className="app-header">
            <nav>
              <ul>
                <li>
                  <NavLink to="/" exact={true} activeClassName="active">
                    Home
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/bwdl" activeClassName="active">
                    Transformer Example
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/multiple" activeClassName="active">
                    Multiple Graphs
                  </NavLink>
                </li>
              </ul>
            </nav>
          </header>

          <Route exact={true} path="/" component={Graph} />
          <Switch>
            <Route path="/bwdl" component={Bwdl} />
            {/* The following is for typos */}
            <Redirect from="/bwld" to="/bwdl" />
            <Route path="/bwdl-editable" component={BwdlEditable} />
            <Route path="/multiple" component={MultipleGraphs} />
          </Switch>
        </div>
      </Router>
    );
  }
}

if (typeof window !== 'undefined') {
  window.onload = () => {
    ReactDOM.render(<App />, document.getElementById('content'));
  };
}
