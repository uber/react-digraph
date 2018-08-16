"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var EmptyShape = _react2.default.createElement(
  "symbol",
  { viewBox: "0 0 100 100", id: "empty" },
  _react2.default.createElement("circle", { cx: "50", cy: "50", r: "45" })
); // Copyright (c) 2016 Uber Technologies, Inc.
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
  Example config for GraphView component
*/


var SpecialShape = _react2.default.createElement(
  "symbol",
  { viewBox: "0 0 100 100", id: "special" },
  _react2.default.createElement("rect", { transform: "translate(50) rotate(45)", width: "70", height: "70" })
);

var SpecialChildShape = _react2.default.createElement(
  "symbol",
  { viewBox: "0 0 100 100", id: "specialChild" },
  _react2.default.createElement("rect", { x: "2.5", y: "0", width: "95", height: "97.5", fill: "rgba(30, 144, 255, 0.12)" })
);

var EmptyEdgeShape = _react2.default.createElement(
  "symbol",
  { viewBox: "0 0 50 50", id: "emptyEdge" },
  _react2.default.createElement(
    "circle",
    { cx: "25", cy: "25", r: "8", fill: "currentColor" },
    " "
  )
);

var SpecialEdgeShape = _react2.default.createElement(
  "symbol",
  { viewBox: "0 0 50 50", id: "specialEdge" },
  _react2.default.createElement("rect", { transform: "rotate(45)", x: "25", y: "-4.5", width: "15", height: "15", fill: "currentColor" })
);

exports.default = {
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
//# sourceMappingURL=graph-config.js.map