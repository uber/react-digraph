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
import * as ReactDOM from 'react-dom';
import {
  BrowserRouter as Router,
  // NavLink,
  Redirect,
  Route,
  Switch,
} from 'react-router-dom';

import EmiFlowEditor from './emi-flow-editor';
import Bwdl from './bwdl';
import BwdlEditable from './bwdl-editable';
// import Graph from './graph';
import GraphFast from './fast';

import './app.scss';

class App extends React.Component {
  render() {
    return (
      <Router>
        <div>
          <header className="app-header">
            <div
              style={{
                flex: 1,
                flexShrink: 0,
                paddingLeft: '10px',
                textAlign: 'left',
              }}
            >
              <img
                src="data:image/svg+xml,%3C?xml version='1.0' encoding='utf-8'?%3E %3C!-- Generator: Adobe Illustrator 16.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0) --%3E %3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.0//EN' 'http://www.w3.org/TR/2001/REC-SVG-20010904/DTD/svg10.dtd'%3E %3Csvg version='1.0' id='Layer_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='110px' height='50px' viewBox='0 0 110 50' style='enable-background:new 0 0 110 50;' xml:space='preserve'%3E %3Cstyle type='text/css'%3E %3C!%5BCDATA%5B .st0%7Bfill:%23FF5947;%7D .st1%7Bfill:%233179FF;%7D .st2%7Bfill:%2373A4FF;%7D %5D%5D%3E %3C/style%3E %3Cg%3E %3Cg%3E %3Cpath class='st1' d='M100.533,1.844c0.984-1.005,2.223-1.509,3.711-1.509s2.736,0.503,3.742,1.509 c1.006,1.006,1.51,2.233,1.51,3.682c0,1.489-0.504,2.726-1.51,3.712c-1.006,0.986-2.254,1.479-3.742,1.479 s-2.727-0.492-3.711-1.479c-0.986-0.986-1.479-2.223-1.479-3.712C99.055,4.077,99.547,2.85,100.533,1.844z'/%3E %3Cpath class='st0' d='M66.551,41.913c-0.518,1.238-1.74,2.11-3.164,2.11s-2.648-0.872-3.166-2.11h-5.799 c0.642,4.377,4.412,7.752,8.965,7.752s8.322-3.375,8.963-7.752H66.551z'/%3E %3Cpolygon class='st1' points='80.91,16.103 73.785,16.103 65.232,39.151 73.35,39.151 77.348,27.861 81.346,39.151 89.463,39.151 '/%3E %3Cpolygon class='st2' points='92.607,47.623 89.463,39.151 81.346,39.151 84.344,47.623 '/%3E %3Cg%3E %3Cpolygon class='st1' points='52.987,16.103 45.863,16.103 37.309,39.151 45.428,39.151 49.425,27.861 53.422,39.151 61.541,39.151 '/%3E %3C/g%3E %3Cpolygon class='st2' points='34.165,47.623 42.429,47.623 45.428,39.151 37.309,39.151 '/%3E %3Cg%3E %3Cpath class='st1' d='M15.205,21.775c1.611,0,2.905,0.573,3.882,1.719c0.976,1.146,1.484,2.651,1.527,4.519h7.9 c-0.354-3.581-1.501-6.467-3.446-8.655c-2.376-2.673-5.6-4.009-9.673-4.009c-4.455,0-8.05,1.527-10.787,4.582 c-1.949,2.176-3.2,4.872-3.761,8.083h8.121C9.773,23.855,11.853,21.775,15.205,21.775z'/%3E %3Cpath class='st1' d='M0.559,33.74c0.283,4.298,1.737,7.735,4.368,10.31c2.948,2.885,6.969,4.327,12.06,4.327 c4.583,0,8.592-1.124,12.028-3.373l-1.655-6.427c-2.758,1.994-5.876,2.99-9.355,2.99c-2.716,0-4.858-0.668-6.428-2.004 c-1.57-1.337-2.504-3.256-2.8-5.76V33.74H0.559z'/%3E %3C/g%3E %3Cpath class='st2' d='M28.441,33.74c0.128-1.019,0.191-2.101,0.191-3.246c0-0.862-0.041-1.688-0.118-2.481h-7.9H8.968H0.847 c-0.226,1.295-0.343,2.672-0.343,4.137c0,0.543,0.021,1.072,0.055,1.591h8.218H28.441z'/%3E %3Cg%3E %3Crect x='100.559' y='22.497' class='st1' width='7.82' height='25.126'/%3E %3Cpolygon class='st2' points='97.914,16.103 97.914,22.497 100.559,22.497 108.379,22.497 108.379,16.103 '/%3E %3C/g%3E %3C/g%3E %3C/g%3E %3C/svg%3E"
                style={{
                  verticalAlign: 'middle',
                  height: '90%',
                }}
              />
            </div>
            <span style={{ flex: 1 }}>__̴ı̴̴̡̡̡ ̡͌l̡̡̡ ̡͌l̡*̡̡ ̴̡ı̴̴̡ ̡̡͡|̲̲̲͡͡͡ ̲▫̲͡ ̲̲̲͡͡π̲̲͡͡ ̲̲͡▫̲̲͡͡ ̲|̡̡̡ ̡ ̴̡ı̴̡̡ ̡͌l̡̡̡̡.___</span>
            <span style={{ flex: 1 }}>
              ¯¯̿̿¯̿̿&apos;̿̿̿̿̿̿̿&apos;̿̿&apos;̿̿̿̿̿&apos;̿̿̿)͇̿̿)̿̿̿̿ &apos;̿̿̿̿̿̿\̵͇̿̿\=(•̪̀●́)=o/̵͇̿̿/&apos;̿̿ ̿ ̿̿
            </span>
            {/*<nav>
              <NavLink to="/bwdl" activeClassName="active">
                BWDL
              </NavLink>
            </nav>*/}
          </header>

          {/* <Route exact={true} path="/" component={Graph} /> */}
          <Route path="/" component={EmiFlowEditor} />
          <Switch>
            <Route path="/bwdl" component={Bwdl} />
            {/* The following is for typos */}
            <Redirect from="/bwld" to="/bwdl" />
            <Route path="/bwdl-editable" component={BwdlEditable} />
            <Route path="/fast" component={GraphFast} />
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
