'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _graph = require('./graph');

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

// These keys are arbitrary (but must match the config)
// However, GraphView renders text differently for empty types
// so this has to be passed in if that behavior is desired.
var EMPTY_TYPE = "empty"; // Empty node type
var SPECIAL_TYPE = "special";
var SPECIAL_CHILD_SUBTYPE = "specialChild";
var EMPTY_EDGE_TYPE = "emptyEdge";
var SPECIAL_EDGE_TYPE = "specialEdge";

function generateLargeSample() {
  console.log("generateLargeSample");
  var sample = {
    nodes: [],
    edges: []
  };
  var y = 0;
  var x = 0;
  for (var i = 1; i <= 5000; i++) {
    if (i % 20 === 0) {
      y++;
      x = 0;
    } else {
      x++;
    }
    sample.nodes.push({
      id: i,
      title: 'Node ' + i,
      x: 0 + 200 * x,
      y: 0 + 200 * y,
      type: SPECIAL_TYPE
    });
  }
  return sample;
}

var GraphLarge = function (_Graph) {
  _inherits(GraphLarge, _Graph);

  function GraphLarge(props) {
    _classCallCheck(this, GraphLarge);

    var _this = _possibleConstructorReturn(this, (GraphLarge.__proto__ || Object.getPrototypeOf(GraphLarge)).call(this, props));

    _this.state = {
      graph: generateLargeSample(),
      selected: {}
    };
    return _this;
  }

  return GraphLarge;
}(_graph.Graph);

// To bootstrap this example into the Document


var App = function (_Component) {
  _inherits(App, _Component);

  function App() {
    _classCallCheck(this, App);

    return _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).apply(this, arguments));
  }

  _createClass(App, [{
    key: 'render',
    value: function render() {
      return _react2.default.createElement(GraphLarge, null);
    }
  }]);

  return App;
}(_react.Component);

if (typeof window !== 'undefined') {
  window.onload = function () {
    _reactDom2.default.render(_react2.default.createElement(App, null), document.getElementById('content'));
  };
}
//# sourceMappingURL=graph-large.js.map