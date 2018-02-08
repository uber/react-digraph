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
import jsdom from 'jsdom'

const test = require('tape');
const sinon = require('sinon');
const React = require('react');
const mount = require('enzyme').mount;
const render = require('enzyme').render;

const GraphView = require('../../components/graph-view').default;

const doc = jsdom.jsdom('<!doctype html><html><body></body></html>')
global.document = doc
global.window = doc.defaultView

const EmptyShape = (
  <symbol viewBox="0 0 100 100" id="empty" key="0">
    <circle cx="50" cy="50" r="45"></circle>
  </symbol>
)

const SpecialShape = (
  <symbol viewBox="0 0 100 100" id="special" key="1">
    <rect transform="translate(50) rotate(45)" width="70" height="70"></rect>
  </symbol>
)

const SpecialChildShape = (
  <symbol viewBox="0 0 100 100" id="specialChild" key="0">
    <rect x="2.5" y="0" width="95" height="97.5" fill="rgba(30, 144, 255, 0.12)"></rect>
  </symbol>
)

const EmptyEdgeShape = (
  <symbol viewBox="0 0 50 50" id="emptyEdge" key="0">
    <circle cx="25" cy="25" r="8" fill="currentColor"> </circle>
  </symbol>
)

const SpecialEdgeShape = (
  <symbol viewBox="0 0 50 50" id="specialEdge" key="1">
    <rect transform="rotate(45)"  x="25" y="-4.5" width="15" height="15" fill="currentColor"></rect>
  </symbol>
)

const config = {
  NodeTypes: {
    empty: {
      typeText: "None",
      shapeId: "#empty",
      shape: EmptyShape
    },
    special: {
      typeText: "Special",
      shapeId: "#special",
      shape: SpecialShape
    }
  },
  NodeSubtypes: {
    specialChild: {
      shapeId: "#specialChild",
      shape: SpecialChildShape
    }
  },
  EdgeTypes: {
    emptyEdge: {
      shapeId: "#emptyEdge",
      shape: EmptyEdgeShape
    },
    specialEdge: {
      shapeId: "#specialEdge",
      shape: SpecialEdgeShape
    }
  }
}

const EMPTY_TYPE = "empty"; // Empty node type
const SPECIAL_TYPE = "special";
const SPECIAL_CHILD_SUBTYPE = "specialChild";
const EMPTY_EDGE_TYPE = "emptyEdge";
const SPECIAL_EDGE_TYPE = "specialEdge";

const sample = {
  "nodes": [
    {
      "id": 1,
      "title": "Node A",
      "x": 258.3976135253906,
      "y": 331.9783248901367,
      "type": SPECIAL_TYPE
    },
    {
      "id": 2,
      "title": "Node B",
      "x": 593.9393920898438,
      "y": 260.6060791015625,
      "type": EMPTY_TYPE,
      "subtype": SPECIAL_CHILD_SUBTYPE
    },
    {
      "id": 3,
      "title": "Node C",
      "x": 237.5757598876953,
      "y": 61.81818389892578,
      "type": EMPTY_TYPE
    },
    {
      "id": 4,
      "title": "Node C",
      "x": 600.5757598876953,
      "y": 600.81818389892578,
      "type": EMPTY_TYPE
    }
  ],
  "edges": [
    {
      "source": 1,
      "target": 2,
      "type": SPECIAL_EDGE_TYPE
    },
    {
      "source": 2,
      "target": 4,
      "type": EMPTY_EDGE_TYPE
    }
  ]
}

const getViewNode = function(id){
  return sample.nodes.filter(function(node){
    return node.id === id
  })[0]
}

const mockProps = {
  nodeKey: "id",
  emptyType: EMPTY_TYPE,
  nodes: sample.nodes,
  edges: sample.edges,
  selected: {},
  nodeTypes: config.NodeTypes,
  nodeSubtypes: config.NodeSubtypes,
  edgeTypes: config.EdgeTypes,
  getViewNode: getViewNode,
  onSelectNode:()=>null,
  onCreateNode: ()=>null,
  onUpdateNode: ()=>null,
  onDeleteNode: ()=>null,
  onSelectEdge: ()=>null,
  onCreateEdge: ()=>null,
  onSwapEdge: ()=>null,
  onDeleteEdge: ()=>null
}

const tests = function(){

  test('GraphView', t => {
    const wrapper = mount(<GraphView {...mockProps}/>);
    t.equal(wrapper.find('.viewWrapper').length, 1, 'Renders wrapper');

    const view = wrapper.find('.view').render()
    t.equal(view.find('.node').length, 4, 'Renders nodes');
    t.equal(view.find('.edge').length, 2, 'Renders edges');

    const controls = wrapper.find('.graphControls')
    t.equal(controls.length, 1, 'Renders controls');

    t.end();
  });

}


module.exports = tests