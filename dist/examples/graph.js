'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Graph = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _graphView = require('../components/graph-view.js');

var _graphView2 = _interopRequireDefault(_graphView);

var _graphConfig = require('./graph-config.js');

var _graphConfig2 = _interopRequireDefault(_graphConfig);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // Copyright (c) 2016 Uber Technologies, Inc.
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

/*
  Example usage of GraphView component
*/

// Configures node/edge types

var styles = {
  graph: {
    height: '100%',
    width: '100%'
  }
};

var NODE_KEY = "id"; // Key used to identify nodes

// These keys are arbitrary (but must match the config)
// However, GraphView renders text differently for empty types
// so this has to be passed in if that behavior is desired.
var EMPTY_TYPE = "empty"; // Empty node type
var SPECIAL_TYPE = "special";
var SPECIAL_CHILD_SUBTYPE = "specialChild";
var EMPTY_EDGE_TYPE = "emptyEdge";
var SPECIAL_EDGE_TYPE = "specialEdge";

// NOTE: Edges must have 'source' & 'target' attributes
// In a more realistic use case, the graph would probably originate
// elsewhere in the App or be generated from some other state upstream of this component.
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

var Graph = exports.Graph = function (_Component) {
  _inherits(Graph, _Component);

  function Graph(props) {
    _classCallCheck(this, Graph);

    var _this = _possibleConstructorReturn(this, (Graph.__proto__ || Object.getPrototypeOf(Graph)).call(this, props));

    _this.getViewNode = function (nodeKey) {
      var searchNode = {};
      searchNode[NODE_KEY] = nodeKey;
      var i = _this.getNodeIndex(searchNode);
      return _this.state.graph.nodes[i];
    };

    _this.onUpdateNode = function (viewNode) {
      var graph = _this.state.graph;
      var i = _this.getNodeIndex(viewNode);

      graph.nodes[i] = viewNode;
      _this.setState({ graph: graph });
    };

    _this.onSelectNode = function (viewNode) {
      // Deselect events will send Null viewNode
      if (!!viewNode) {
        _this.setState({ selected: viewNode });
      } else {
        _this.setState({ selected: {} });
      }
    };

    _this.onSelectEdge = function (viewEdge) {
      _this.setState({ selected: viewEdge });
    };

    _this.onCreateNode = function (x, y) {
      var graph = _this.state.graph;

      // This is just an example - any sort of logic
      // could be used here to determine node type
      // There is also support for subtypes. (see 'sample' above)
      // The subtype geometry will underlay the 'type' geometry for a node
      var type = Math.random() < 0.25 ? SPECIAL_TYPE : EMPTY_TYPE;

      var viewNode = {
        id: _this.state.graph.nodes.length + 1,
        title: '',
        type: type,
        x: x,
        y: y
      };

      graph.nodes.push(viewNode);
      _this.setState({ graph: graph });
    };

    _this.onDeleteNode = function (viewNode) {
      var graph = _this.state.graph;
      var i = _this.getNodeIndex(viewNode);
      graph.nodes.splice(i, 1);

      // Delete any connected edges
      var newEdges = graph.edges.filter(function (edge, i) {
        return edge.source != viewNode[NODE_KEY] && edge.target != viewNode[NODE_KEY];
      });

      graph.edges = newEdges;

      _this.setState({ graph: graph, selected: {} });
    };

    _this.onCreateEdge = function (sourceViewNode, targetViewNode) {
      var graph = _this.state.graph;

      // This is just an example - any sort of logic
      // could be used here to determine edge type
      var type = sourceViewNode.type === SPECIAL_TYPE ? SPECIAL_EDGE_TYPE : EMPTY_EDGE_TYPE;

      var viewEdge = {
        source: sourceViewNode[NODE_KEY],
        target: targetViewNode[NODE_KEY],
        type: type

        // Only add the edge when the source node is not the same as the target
      };if (viewEdge.source !== viewEdge.target) {
        graph.edges.push(viewEdge);
        _this.setState({ graph: graph });
      }
    };

    _this.onSwapEdge = function (sourceViewNode, targetViewNode, viewEdge) {
      var graph = _this.state.graph;
      var i = _this.getEdgeIndex(viewEdge);
      var edge = JSON.parse(JSON.stringify(graph.edges[i]));

      edge.source = sourceViewNode[NODE_KEY];
      edge.target = targetViewNode[NODE_KEY];
      graph.edges[i] = edge;

      _this.setState({ graph: graph });
    };

    _this.onDeleteEdge = function (viewEdge) {
      var graph = _this.state.graph;
      var i = _this.getEdgeIndex(viewEdge);
      graph.edges.splice(i, 1);
      _this.setState({ graph: graph, selected: {} });
    };

    _this.state = {
      graph: sample,
      selected: {}
    };
    return _this;
  }

  // Helper to find the index of a given node


  _createClass(Graph, [{
    key: 'getNodeIndex',
    value: function getNodeIndex(searchNode) {
      return this.state.graph.nodes.findIndex(function (node) {
        return node[NODE_KEY] === searchNode[NODE_KEY];
      });
    }

    // Helper to find the index of a given edge

  }, {
    key: 'getEdgeIndex',
    value: function getEdgeIndex(searchEdge) {
      return this.state.graph.edges.findIndex(function (edge) {
        return edge.source === searchEdge.source && edge.target === searchEdge.target;
      });
    }

    // Given a nodeKey, return the corresponding node


    /*
     * Handlers/Interaction
     */

    // Called by 'drag' handler, etc..
    // to sync updates from D3 with the graph


    // Node 'mouseUp' handler


    // Edge 'mouseUp' handler


    // Updates the graph with a new node


    // Deletes a node from the graph


    // Creates a new node between two edges


    // Called when an edge is reattached to a different target.


    // Called when an edge is deleted

  }, {
    key: 'render',


    /*
     * Render
     */

    value: function render() {
      var _this2 = this;

      var nodes = this.state.graph.nodes;
      var edges = this.state.graph.edges;
      var selected = this.state.selected;

      var NodeTypes = _graphConfig2.default.NodeTypes;
      var NodeSubtypes = _graphConfig2.default.NodeSubtypes;
      var EdgeTypes = _graphConfig2.default.EdgeTypes;

      return _react2.default.createElement(
        'div',
        { id: 'graph', style: styles.graph },
        _react2.default.createElement(_graphView2.default, {
          ref: function ref(el) {
            return _this2.GraphView = el;
          },
          nodeKey: NODE_KEY,
          emptyType: EMPTY_TYPE,
          nodes: nodes,
          edges: edges,
          selected: selected,
          nodeTypes: NodeTypes,
          nodeSubtypes: NodeSubtypes,
          edgeTypes: EdgeTypes,
          enableFocus: true,
          getViewNode: this.getViewNode,
          onSelectNode: this.onSelectNode,
          onCreateNode: this.onCreateNode,
          onUpdateNode: this.onUpdateNode,
          onDeleteNode: this.onDeleteNode,
          onSelectEdge: this.onSelectEdge,
          onCreateEdge: this.onCreateEdge,
          onSwapEdge: this.onSwapEdge,
          onDeleteEdge: this.onDeleteEdge })
      );
    }
  }]);

  return Graph;
}(_react.Component);

// To bootstrap this example into the Document


var App = function (_Component2) {
  _inherits(App, _Component2);

  function App() {
    _classCallCheck(this, App);

    return _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).apply(this, arguments));
  }

  _createClass(App, [{
    key: 'render',
    value: function render() {
      return _react2.default.createElement(Graph, null);
    }
  }]);

  return App;
}(_react.Component);

if (typeof window !== 'undefined') {
  window.onload = function () {
    _reactDom2.default.render(_react2.default.createElement(App, null), document.getElementById('content'));
  };
}
//# sourceMappingURL=graph.js.map