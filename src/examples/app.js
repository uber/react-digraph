/*
  Copyright(c) 2018 Uber Technologies, Inc.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

          http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

import * as React from 'react';
import { createRoot } from 'react-dom/client';
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
        <div
          style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
        >
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
    createRoot(document.getElementById('content')).render(<App />);
  };
}
