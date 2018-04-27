// Copyright (c) 2016 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import React, {Component} from 'react';
import ReactDOM from 'react-dom';

import { Graph } from './graph';

// These keys are arbitrary (but must match the config)
// However, GraphView renders text differently for empty types
// so this has to be passed in if that behavior is desired.
const EMPTY_TYPE = "empty"; // Empty node type
const SPECIAL_TYPE = "special";
const SPECIAL_CHILD_SUBTYPE = "specialChild";
const EMPTY_EDGE_TYPE = "emptyEdge";
const SPECIAL_EDGE_TYPE = "specialEdge";

function generateLargeSample() {
  console.log("generateLargeSample");
  const sample = {
    nodes: [],
    edges: [],
  };
  let y = 0;
  let x = 0;
  for (let i = 1; i <= 5000; i++) {
    if (i % 20 === 0) {
      y++;
      x = 0;
    } else {
      x++;
    }
    sample.nodes.push({
      id: i,
      title: `Node ${i}`,
      x: 0 + 200 * x,
      y: 0 + 200 * y,
      type: SPECIAL_TYPE,
    });
  }
  return sample;
}

class GraphLarge extends Graph {

  constructor(props) {
    super(props);

    this.state = {
      graph: generateLargeSample(),
      selected: {}
    }
  }

}

// To bootstrap this example into the Document
class App extends Component {
  render() {
    return <GraphLarge/>
  }
}
if (typeof window !== 'undefined') {
  window.onload = function() {
    ReactDOM.render(<App/>, document.getElementById('content'))
  }
}
