'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _enzymeAdapterReact = require('enzyme-adapter-react-16');

var _enzymeAdapterReact2 = _interopRequireDefault(_enzymeAdapterReact);

var _enzyme = require('enzyme');

var _jsdom = require('jsdom');

var _jsdom2 = _interopRequireDefault(_jsdom);

var _tape = require('tape');

var _tape2 = _interopRequireDefault(_tape);

var _sinon = require('sinon');

var _sinon2 = _interopRequireDefault(_sinon);

var _graphView = require('../../components/graph-view');

var _graphView2 = _interopRequireDefault(_graphView);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//https://stackoverflow.com/questions/46896639/ensure-a-dom-environment-is-loaded-for-enzyme
function setUpDomEnvironment() {
  var JSDOM = _jsdom2.default.JSDOM;

  var dom = new JSDOM('<!doctype html><html><body></body></html>');
  var window = dom.window;


  global.window = window;
  global.document = window.document;
  global.navigator = {
    userAgent: 'node.js'
  };
  copyProps(window, global);
} // Copyright (c) 2016 Uber Technologies, Inc.
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


function copyProps(src, target) {
  var props = Object.getOwnPropertyNames(src).filter(function (prop) {
    return typeof target[prop] === 'undefined';
  }).map(function (prop) {
    return Object.getOwnPropertyDescriptor(src, prop);
  });
  Object.defineProperties(target, props);
}

setUpDomEnvironment();

(0, _enzyme.configure)({ adapter: new _enzymeAdapterReact2.default() });

var EmptyShape = _react2.default.createElement(
  'symbol',
  { viewBox: '0 0 100 100', id: 'empty', key: '0' },
  _react2.default.createElement('circle', { cx: '50', cy: '50', r: '45' })
);

var SpecialShape = _react2.default.createElement(
  'symbol',
  { viewBox: '0 0 100 100', id: 'special', key: '1' },
  _react2.default.createElement('rect', { transform: 'translate(50) rotate(45)', width: '70', height: '70' })
);

var SpecialChildShape = _react2.default.createElement(
  'symbol',
  { viewBox: '0 0 100 100', id: 'specialChild', key: '0' },
  _react2.default.createElement('rect', { x: '2.5', y: '0', width: '95', height: '97.5', fill: 'rgba(30, 144, 255, 0.12)' })
);

var EmptyEdgeShape = _react2.default.createElement(
  'symbol',
  { viewBox: '0 0 50 50', id: 'emptyEdge', key: '0' },
  _react2.default.createElement(
    'circle',
    { cx: '25', cy: '25', r: '8', fill: 'currentColor' },
    ' '
  )
);

var SpecialEdgeShape = _react2.default.createElement(
  'symbol',
  { viewBox: '0 0 50 50', id: 'specialEdge', key: '1' },
  _react2.default.createElement('rect', { transform: 'rotate(45)', x: '25', y: '-4.5', width: '15', height: '15', fill: 'currentColor' })
);

var config = {
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
};

var EMPTY_TYPE = "empty"; // Empty node type
var SPECIAL_TYPE = "special";
var SPECIAL_CHILD_SUBTYPE = "specialChild";
var EMPTY_EDGE_TYPE = "emptyEdge";
var SPECIAL_EDGE_TYPE = "specialEdge";

var sample = {
  "nodes": [{
    "id": 1,
    "title": "Node A",
    "x": 258.3976135253906,
    "y": 331.9783248901367,
    "type": SPECIAL_TYPE
  }, {
    "id": 2,
    "title": "Node B",
    "x": 593.9393920898438,
    "y": 260.6060791015625,
    "type": EMPTY_TYPE,
    "subtype": SPECIAL_CHILD_SUBTYPE
  }, {
    "id": 3,
    "title": "Node C",
    "x": 237.5757598876953,
    "y": 61.81818389892578,
    "type": EMPTY_TYPE
  }, {
    "id": 4,
    "title": "Node C",
    "x": 600.5757598876953,
    "y": 600.81818389892578,
    "type": EMPTY_TYPE
  }],
  "edges": [{
    "source": 1,
    "target": 2,
    "type": SPECIAL_EDGE_TYPE
  }, {
    "source": 2,
    "target": 4,
    "type": EMPTY_EDGE_TYPE
  }]
};

var getViewNode = function getViewNode(id) {
  return sample.nodes.filter(function (node) {
    return node.id === id;
  })[0];
};

var mockProps = {
  nodeKey: "id",
  emptyType: EMPTY_TYPE,
  nodes: sample.nodes,
  edges: sample.edges,
  selected: {},
  nodeTypes: config.NodeTypes,
  nodeSubtypes: config.NodeSubtypes,
  edgeTypes: config.EdgeTypes,
  getViewNode: getViewNode,
  onSelectNode: function onSelectNode() {
    return null;
  },
  onCreateNode: function onCreateNode() {
    return null;
  },
  onUpdateNode: function onUpdateNode() {
    return null;
  },
  onDeleteNode: function onDeleteNode() {
    return null;
  },
  onSelectEdge: function onSelectEdge() {
    return null;
  },
  onCreateEdge: function onCreateEdge() {
    return null;
  },
  onSwapEdge: function onSwapEdge() {
    return null;
  },
  onDeleteEdge: function onDeleteEdge() {
    return null;
  }
};

var tests = function tests() {

  (0, _tape2.default)('GraphView', function (t) {
    var wrapper = (0, _enzyme.mount)(_react2.default.createElement(_graphView2.default, mockProps));
    t.equal(wrapper.find('.viewWrapper').length, 1, 'Renders wrapper');

    var view = wrapper.find('.view').render();
    t.equal(view.find('.node').length, 4, 'Renders nodes');
    t.equal(view.find('.edge').length, 2, 'Renders edges');

    var controls = wrapper.find('.graphControls');
    t.equal(controls.length, 1, 'Renders controls');

    t.end();
  });
};

module.exports = tests;
//# sourceMappingURL=graph-view.js.map