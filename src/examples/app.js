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
import { transitions, positions, Provider as AlertProvider } from 'react-alert';
import AlertTemplate from 'react-alert-template-basic';

import EmiFlowEditor from './emi-flow-editor';
import Bwdl from './bwdl';
import BwdlEditable from './bwdl-editable';
// import Graph from './graph';
import GraphFast from './fast';

import './app.scss';
import { GoogleLogin } from 'react-google-login';

import { connect, GOOGLE_CLIENT_ID } from './emi-flow-editor/cognito';

// import S3Context from './emi-flow-editor/s3-context';
import FlowManagement from './emi-flow-editor/components/flow-management';
import { getFlowManagementHandlers } from './emi-flow-editor/handlers/flow-management-handlers';

const ALERT_OPTIONS = {
  // you can also just use 'bottom center'
  position: positions.MIDDLE,
  timeout: 5000,
  offset: '30px',
  // you can also just use 'scale'
  transition: transitions.SCALE,
};

class App extends React.Component {
  constructor(props) {
    super(props);
    this.flowManagementHandlers = getFlowManagementHandlers(this);
    this.state = {
      s3: null,
      initialJsonText: '{}',
      jsonText: '{}',
      flowName: null,
      env: null,
      flowVersionId: null,
    };
    this.disableBackButton();
  }

  disableBackButton = () => {
    history.pushState(null, null, document.URL);
    window.addEventListener('popstate', () =>
      history.pushState(null, null, document.URL)
    );
  };

  onGoogleResponse = response => {
    connect(response).then(s3 => {
      this.setState({ s3 });
    });
  };

  setFlow = (flowName, jsonText, prodJsonText, env, flowVersionId) => {
    // obscure magic that alternates between null and undefined for
    // new flows, so the emifloweditor can detect that it changed.
    flowName = flowName || (flowName === null ? undefined : null);

    this.setState({
      flowName,
      initialJsonText: jsonText,
      jsonText,
      prodJsonText,
      env,
      flowVersionId,
    });
  };

  handleJsonTextChange = jsonText => this.setState({ jsonText });

  handleFlowNameChange = flowName => this.setState({ flowName });

  render() {
    const {
      initialJsonText,
      flowName,
      s3,
      jsonText,
      prodJsonText,
      env,
      flowVersionId,
    } = this.state;

    return (
      <Router>
        <AlertProvider template={AlertTemplate} {...ALERT_OPTIONS}>
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
              <FlowManagement
                style={{
                  flexGrow: 0.1,
                }}
                s3Available={s3}
                flowName={flowName}
                flowManagementHandlers={this.flowManagementHandlers}
                jsonText={jsonText}
                prodJsonText={prodJsonText}
                initialJsonText={initialJsonText}
                onFlowNameChanged={this.handleFlowNameChange}
                flowVersionId={flowVersionId}
              />
              {!s3 && (
                <GoogleLogin
                  clientId={GOOGLE_CLIENT_ID}
                  buttonText="Login"
                  onSuccess={this.onGoogleResponse}
                  onFailure={this.onGoogleResponse}
                  cookiePolicy={'single_host_origin'}
                />
              )}
              <svg
                version="1.0"
                xmlns="http://www.w3.org/2000/svg"
                width="39.74000000pt"
                height="14.72000000pt"
                viewBox="0 0 1987.000000 736.000000"
                preserveAspectRatio="xMidYMid meet"
                style={{ alignSelf: 'center' }}
              >
                <metadata>
                  Created by potrace 1.15, written by Peter Selinger 2001-2017
                </metadata>
                <g
                  transform="translate(0.000000,736.000000) scale(0.100000,-0.100000)"
                  fill="#000000"
                  stroke="none"
                >
                  <path
                    d="M241 7076 c2 -2 49 -22 104 -44 182 -72 427 -183 630 -284 724 -362
                  1253 -762 1630 -1233 151 -189 327 -500 409 -726 157 -430 185 -920 81 -1436
                  -14 -67 -25 -125 -25 -129 0 -4 44 -4 98 0 892 60 1756 57 2462 -10 1338 -126
                  2344 -474 3090 -1068 150 -120 415 -383 526 -522 290 -363 509 -769 651 -1206
                  21 -65 40 -117 43 -117 3 0 22 52 43 117 142 437 361 843 651 1206 111 139
                  376 402 526 522 746 594 1752 942 3090 1068 706 67 1570 70 2463 10 53 -4 97
                  -4 97 0 0 4 -11 62 -25 129 -104 516 -76 1006 81 1436 82 226 258 537 409 726
                  377 471 906 871 1630 1233 203 101 448 212 630 284 55 22 102 42 104 44 2 2
                  -1447 4 -3222 4 l-3226 0 -11 -57 c-61 -311 -149 -563 -264 -756 -59 -100
                  -102 -156 -189 -246 -174 -179 -381 -289 -662 -350 -125 -28 -494 -88 -650
                  -106 -374 -44 -650 -23 -718 53 -41 46 -72 260 -92 639 -8 158 -20 324 -25
                  368 -11 89 -34 183 -48 197 -5 5 -16 -25 -27 -73 -31 -144 -103 -426 -136
                  -534 -25 -83 -36 -104 -48 -101 -142 41 -620 41 -762 0 -12 -3 -23 18 -48 101
                  -33 108 -105 390 -136 534 -11 48 -22 78 -27 73 -14 -14 -37 -108 -48 -197 -5
                  -44 -17 -210 -25 -368 -20 -379 -51 -593 -92 -639 -68 -76 -344 -97 -718 -53
                  -156 18 -525 78 -650 106 -387 85 -664 279 -851 596 -115 193 -203 445 -264
                  756 l-11 57 -3226 0 c-1775 0 -3224 -2 -3222 -4z"
                  />
                </g>
              </svg>
              {/*<nav>
                <NavLink to="/bwdl" activeClassName="active">
                  BWDL
                </NavLink>
              </nav>*/}
            </header>

            {/* <Route exact={true} path="/" component={Graph} /> */}
            <Route
              path="/"
              render={props => (
                <EmiFlowEditor
                  {...props}
                  flowName={flowName}
                  initialJsonText={initialJsonText}
                  onJsonTextChange={this.handleJsonTextChange}
                  env={env}
                  flowVersionId={flowVersionId}
                />
              )}
            />
            <Switch>
              <Route path="/bwdl" component={Bwdl} />
              {/* The following is for typos */}
              <Redirect from="/bwld" to="/bwdl" />
              <Route path="/bwdl-editable" component={BwdlEditable} />
              <Route path="/fast" component={GraphFast} />
            </Switch>
          </div>
        </AlertProvider>
      </Router>
    );
  }
}

if (typeof window !== 'undefined') {
  window.onload = () => {
    ReactDOM.render(<App />, document.getElementById('content'));
  };
}
