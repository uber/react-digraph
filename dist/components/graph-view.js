'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; // Copyright (c) 2016 Uber Technologies, Inc.
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
  GraphView is a Generic D3 Graph view with no application specific
  code in it and no significant state except UI state (zoom, for example).
*/

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _d = require('d3');

var d3 = _interopRequireWildcard(_d);

var _radium = require('radium');

var _radium2 = _interopRequireDefault(_radium);

var _graphControls = require('./graph-controls.js');

var _graphControls2 = _interopRequireDefault(_graphControls);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function styleToString(style) {
  return Object.keys(style).map(function (k) {
    var key = k.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    return key + ':' + style[k];
  }).join(";");
}

function makeStyles() {
  var primary = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'dodgerblue';
  var light = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'white';
  var dark = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'black';
  var background = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '#F9F9F9';

  var styles = {
    wrapper: {
      base: {
        height: '100%',
        margin: 0,
        display: 'flex',
        boxShadow: 'none',
        opacity: 0.5,
        background: background,
        transition: "opacity 0.167s"
      },
      focused: {
        opacity: 1
      }
    },
    svg: {
      base: {
        alignContent: 'stretch',
        flex: 1
      }
    },
    node: {
      base: {
        color: primary,
        stroke: light,
        fill: light,
        filter: 'url(#dropshadow)',
        strokeWidth: '0.5px',
        cursor: 'pointer'
      },
      selected: {
        color: light,
        stroke: primary,
        fill: primary
      }
    },
    shape: {
      fill: 'inherit',
      stroke: dark,
      strokeWidth: '0.5px'
    },
    text: {
      base: {
        fill: dark,
        stroke: dark
      },
      selected: {
        fill: light,
        stroke: light
      }
    },
    edge: {
      base: {
        color: light,
        stroke: primary,
        strokeWidth: '2px',
        markerEnd: 'url(#end-arrow)',
        cursor: 'pointer'
      },
      selected: {
        color: primary,
        stroke: primary
      }
    },
    arrow: {
      fill: primary
    }

    // Styles need to be strings for D3 to apply them all at once
  };styles.node.baseString = styleToString(styles.node.base);
  styles.node.selectedString = styleToString(_extends({}, styles.node.base, styles.node.selected));
  styles.text.baseString = styleToString(styles.text.base);
  styles.text.selectedString = styleToString(_extends({}, styles.text.base, styles.text.selected));
  styles.edge.baseString = styleToString(styles.edge.base);
  styles.edge.selectedString = styleToString(_extends({}, styles.edge.base, styles.edge.selected));

  return styles;
}

// any objects with x & y properties
function getTheta(pt1, pt2) {
  var xComp = pt2.x - pt1.x;
  var yComp = pt2.y - pt1.y;
  var theta = Math.atan2(yComp, xComp);
  return theta;
}

function getMidpoint(pt1, pt2) {
  var x = (pt2.x + pt1.x) / 2;
  var y = (pt2.y + pt1.y) / 2;

  return { x: x, y: y };
}

function getDistance(pt1, pt2) {
  return Math.sqrt(Math.pow(pt2.x - pt1.x, 2) + Math.pow(pt2.y - pt1.y, 2));
}

var GraphView = function (_Component) {
  _inherits(GraphView, _Component);

  function GraphView(props) {
    _classCallCheck(this, GraphView);

    var _this = _possibleConstructorReturn(this, (GraphView.__proto__ || Object.getPrototypeOf(GraphView)).call(this, props));

    _this.hideEdge = function (edgeDOMNode) {
      d3.select(edgeDOMNode).attr("opacity", 0);
    };

    _this.showEdge = function (edgeDOMNode) {
      d3.select(edgeDOMNode).attr("opacity", 1);
    };

    _this.canSwap = function (sourceNode, hoveredNode, swapEdge) {
      return swapEdge.source != sourceNode[_this.props.nodeKey] || swapEdge.target != hoveredNode[_this.props.nodeKey];
    };

    _this.lineFunction = function (data) {
      // Provides API for curved lines using .curve()
      // Example: https://bl.ocks.org/d3indepth/64be9fc39a92ef074034e9a8fb29dcce
      return d3.line().x(function (d) {
        return d.x;
      }).y(function (d) {
        return d.y;
      })(data);
    };

    _this.drawEdge = function (sourceNode, target, swapErrBack) {
      var self = _this;

      var dragEdge = d3.select(_this.entities).append('svg:path');

      dragEdge.attr('class', 'link dragline').attr("style", _this.state.styles.edge.selectedString).attr('d', _this.lineFunction([{ x: sourceNode.x, y: sourceNode.y }, { x: d3.event.x, y: d3.event.y }]));

      d3.event.on("drag", dragged).on("end", ended);

      function dragged(d) {
        dragEdge.attr('d', self.lineFunction([{ x: sourceNode.x, y: sourceNode.y }, { x: d3.event.x, y: d3.event.y }]));
      }

      function ended(d) {
        dragEdge.remove();

        var swapEdge = self.state.edgeSwapQueue.shift();
        var hoveredNode = self.state.hoveredNode;

        self.setState({
          edgeSwapQueue: self.state.edgeSwapQueue,
          drawingEdge: false
        });

        if (hoveredNode && self.props.canCreateEdge(sourceNode, hoveredNode)) {

          if (swapEdge) {
            if (self.props.canDeleteEdge(swapEdge) && self.canSwap(sourceNode, hoveredNode, swapEdge)) {
              self.props.onSwapEdge(sourceNode, hoveredNode, swapEdge);
              self.renderView();
            } else {
              swapErrBack();
            }
          } else {
            self.props.onCreateEdge(sourceNode, hoveredNode);
            self.renderView();
          }
        } else {
          if (swapErrBack) {
            swapErrBack();
          }
        }
      }
    };

    _this.dragNode = function () {
      var self = _this;

      var el = d3.select(d3.event.target.parentElement); // Enclosing 'g' element
      el.classed("dragging", true);
      d3.event.on("drag", dragged).on("end", ended);

      var oldSibling = null;
      function dragged(d) {
        if (self.props.readOnly) return;
        var selectedNode = d3.select(this);
        if (!oldSibling) {
          oldSibling = this.nextSibling;
        }
        // Moves child to the end of the element stack to re-arrange the z-index
        this.parentElement.appendChild(this);

        selectedNode.attr('transform', function (d) {
          d.x += d3.event.dx;
          d.y += d3.event.dy;
          return 'translate(' + d.x + ',' + d.y + ')';
        });
        self.render();
      }

      function ended() {
        el.classed("dragging", false);

        if (!self.props.readOnly) {
          var d = d3.select(this).datum();
          // Move the node back to the original z-index
          if (oldSibling) {
            oldSibling.parentElement.insertBefore(this, oldSibling);
          }
          self.props.onUpdateNode(d);
        }

        // For some reason, mouseup isn't firing
        // - manually firing it here
        d3.select(this).node().dispatchEvent(new Event("mouseup"));
      }
    };

    _this.handleNodeDrag = function () {
      if (_this.state.drawingEdge && !_this.props.readOnly) {
        var target = { x: d3.event.subject.x, y: d3.event.subject.y };
        _this.drawEdge(d3.event.subject, target);
      } else {
        _this.dragNode();
      }
    };

    _this.handleDelete = function () {
      if (_this.props.readOnly) return;
      if (_this.props.selected) {
        var selected = _this.props.selected;
        if (!selected.source && _this.props.canDeleteNode(selected)) {
          _this.props.onDeleteNode(selected);
          _this.props.onSelectNode(null);
        } else if (selected.source && _this.props.canDeleteEdge(selected)) {
          _this.props.onDeleteEdge(selected);
          _this.props.onSelectNode(null);
        }
      }
    };

    _this.handleWrapperKeydown = function (d, i) {
      // Conditionally ignore keypress events on the window
      // if the Graph isn't focused
      switch (d3.event.key) {
        case "Delete":
          _this.handleDelete();
          break;
        case "Backspace":
          _this.handleDelete();
          break;
        default:
          break;
      }
    };

    _this.handleSvgClicked = function (d, i) {
      if (_this.isPartOfEdge(d3.event.target)) return; // If any part of the edge is clicked, return

      if (_this.state.selectingNode) {
        _this.setState({
          selectingNode: false
        });
      } else {
        _this.props.onSelectNode(null);

        if (!_this.props.readOnly && d3.event.shiftKey) {
          var xycoords = d3.mouse(event.target);
          _this.props.onCreateNode(xycoords[0], xycoords[1]);
          _this.renderView();
        }
      }
    };

    _this.isPartOfEdge = function (element) {
      while (element != null && element != _this.viewWrapper) {
        if (element.classList.contains("edge")) {
          return true;
        }
        element = element.parentElement;
      }
      return false;
    };

    _this.handleNodeMouseDown = function (d) {
      if (d3.event.defaultPrevented) {
        return; // dragged
      }

      // Prevent d3's default as it changes the focus to the body
      d3.event.preventDefault();
      d3.event.stopPropagation();
      if (document.activeElement != _this.viewWrapper) {
        _this.viewWrapper.focus();
      }

      if (d3.event.shiftKey) {

        _this.setState({
          selectingNode: true,
          drawingEdge: true
        });
      } else {
        var previousSelection = _this.state.previousSelection;
        _this.setState({
          selectingNode: true,
          selectedNode: d,
          previousSelection: previousSelection
        });
      }
    };

    _this.handleNodeMouseUp = function (d) {
      if (_this.state.selectingNode) {
        _this.props.onSelectNode(d);
        _this.setState({
          selectingNode: false
        });
      }
    };

    _this.handleNodeMouseEnter = function (d) {
      if (_this.state.hoveredNode != d) {
        _this.setState({
          hoveredNode: d
        });
      }
    };

    _this.handleNodeMouseLeave = function (d) {

      // For whatever reason, mouseLeave is fired when edge dragging ends
      // (and mouseup is not fired). This clears the hoverNode state prematurely
      // resulting in swapEdge failing to fire.
      // Detecting & ignoring mouseLeave events that result from drag ending here
      var fromMouseup = event.which == 1;
      if (_this.state.hoveredNode === d && !fromMouseup) {
        _this.setState({
          hoveredNode: null
        });
      }
    };

    _this.arrowClicked = function (d) {

      if (event.target.tagName != 'path') return false; // If the handle is clicked

      var xycoords = d3.mouse(event.target);
      var target = _this.props.getViewNode(d.target);
      var dist = getDistance({ x: xycoords[0], y: xycoords[1] }, target);

      return dist < _this.props.nodeSize / 2 + _this.props.edgeArrowSize + 10; // or *2 or ^2?
    };

    _this.handleEdgeDrag = function (d) {
      if (!_this.props.readOnly && _this.state.drawingEdge) {
        var edgeDOMNode = event.target.parentElement;
        var sourceNode = _this.props.getViewNode(d.source);
        var xycoords = d3.mouse(event.target);
        var target = { x: xycoords[0], y: xycoords[1] };

        _this.hideEdge(edgeDOMNode);
        _this.drawEdge(sourceNode, target, _this.showEdge.bind(_this, edgeDOMNode));
      }
    };

    _this.handleEdgeMouseDown = function (d) {
      // Prevent d3's default as it changes the focus to the body
      d3.event.preventDefault();
      d3.event.stopPropagation();
      if (document.activeElement != _this.viewWrapper) {
        _this.viewWrapper.focus();
      }

      if (!_this.props.readOnly && _this.arrowClicked(d)) {
        _this.state.edgeSwapQueue.push(d); // Set this edge aside for redrawing
        _this.setState({
          drawingEdge: true,
          edgeSwapQueue: _this.state.edgeSwapQueue
        });
      } else {
        _this.props.onSelectEdge(d);
      }
    };

    _this.containZoom = function () {
      d3.event.preventDefault();
    };

    _this.handleZoom = function () {
      if (_this.state.focused) {
        _this.setState({
          viewTransform: d3.event.transform
        });
      }
    };

    _this.handleZoomToFit = function () {
      var parent = d3.select(_this.viewWrapper).node();
      var entities = d3.select(_this.entities).node();

      var viewBBox = entities.getBBox();

      var width = parent.clientWidth;
      var height = parent.clientHeight;

      var dx = void 0,
          dy = void 0,
          x = void 0,
          y = void 0,
          translate = [_this.state.viewTransform.x, _this.state.viewTransform.y],
          next = { x: translate[0], y: translate[1], k: _this.state.viewTransform.k };

      if (viewBBox.width > 0 && viewBBox.height > 0) {
        // There are entities
        dx = viewBBox.width, dy = viewBBox.height, x = viewBBox.x + viewBBox.width / 2, y = viewBBox.y + viewBBox.height / 2;

        next.k = .9 / Math.max(dx / width, dy / height);

        if (next.k < _this.props.minZoom) {
          next.k = _this.props.minZoom;
        } else if (next.k > _this.props.maxZoom) {
          next.k = _this.props.maxZoom;
        }

        next.x = width / 2 - next.k * x;
        next.y = height / 2 - next.k * y;
      } else {
        next.k = (_this.props.minZoom + _this.props.maxZoom) / 2;
        next.x = 0;
        next.y = 0;
      }

      _this.setZoom(next.k, next.x, next.y, _this.props.zoomDur);
    };

    _this.modifyZoom = function () {
      var modK = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      var modX = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      var modY = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
      var dur = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

      var parent = d3.select(_this.viewWrapper).node();
      var width = parent.clientWidth;
      var height = parent.clientHeight;

      var target_zoom = void 0,
          center = [width / 2, height / 2],
          extent = _this.zoom.scaleExtent(),
          translate = [_this.state.viewTransform.x, _this.state.viewTransform.y],
          translate0 = [],
          l = [],
          next = { x: translate[0], y: translate[1], k: _this.state.viewTransform.k };

      target_zoom = next.k * (1 + modK);

      if (target_zoom < extent[0] || target_zoom > extent[1]) {
        return false;
      }

      translate0 = [(center[0] - next.x) / next.k, (center[1] - next.y) / next.k];
      next.k = target_zoom;
      l = [translate0[0] * next.k + next.x, translate0[1] * next.k + next.y];

      next.x += center[0] - l[0] + modX;
      next.y += center[1] - l[1] + modY;

      _this.setZoom(next.k, next.x, next.y, dur);
    };

    _this.setZoom = function () {
      var k = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
      var x = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      var y = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
      var dur = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;


      var t = d3.zoomIdentity.translate(x, y).scale(k);

      d3.select(_this.viewWrapper).select('svg').transition().duration(dur).call(_this.zoom.transform, t);
    };

    _this.getPathDescriptionStr = function (sourceX, sourceY, targetX, targetY) {
      return 'M' + sourceX + ',' + sourceY + 'L' + targetX + ',' + targetY;
    };

    _this.getPathDescription = function (edge) {
      var src = _this.props.getViewNode(edge.source);
      var trg = _this.props.getViewNode(edge.target);

      if (src && trg) {
        var off = _this.props.nodeSize / 2; // from the center of the node to the perimeter

        var theta = getTheta(src, trg);

        var xOff = off * Math.cos(theta);
        var yOff = off * Math.sin(theta);

        return _this.lineFunction([{ x: src.x + xOff, y: src.y + yOff }, { x: trg.x - xOff, y: trg.y - yOff }]);
      }
      console.warn("Unable to get source or target for ", edge);
      return "";
    };

    _this.getEdgeHandleTransformation = function (edge) {
      var src = _this.props.getViewNode(edge.source);
      var trg = _this.props.getViewNode(edge.target);

      var origin = getMidpoint(src, trg);
      var x = origin.x;
      var y = origin.y;
      var theta = getTheta(src, trg) * 180 / Math.PI;
      var offset = -_this.props.edgeHandleSize / 2;

      return 'translate(' + x + ', ' + y + ') rotate(' + theta + ') translate(' + offset + ', ' + offset + ')';
    };

    _this.getNodeTransformation = function (node) {
      return 'translate(' + node.x + ',' + node.y + ')';
    };

    _this.getNodeStyle = function (d, selected) {
      return d === selected ? _this.state.styles.node.selectedString : _this.state.styles.node.baseString;
    };

    _this.getEdgeStyle = function (d, selected) {
      return d === selected ? _this.state.styles.edge.selectedString : _this.state.styles.edge.baseString;
    };

    _this.getTextStyle = function (d, selected) {
      return d === selected ? _this.state.styles.text.selectedString : _this.state.styles.text.baseString;
    };

    _this.renderNodeText = function (d, domNode) {
      var d3Node = d3.select(domNode);
      var title = d.title ? d.title : ' ';

      var titleText = title.length <= _this.props.maxTitleChars ? title : title.substring(0, _this.props.maxTitleChars) + '...';

      var lineOffset = 18;
      var textOffset = d.type === _this.props.emptyType ? -9 : 18;

      d3Node.selectAll("text").remove();

      var typeText = _this.props.nodeTypes[d.type].typeText;
      var style = _this.getTextStyle(d, _this.props.selected);

      var el = d3Node.append('text').attr('text-anchor', 'middle').attr('style', style).attr('dy', textOffset);

      el.append('tspan').attr('opacity', 0.5).text(typeText);

      if (title) {
        // User defined/secondary text
        el.append('tspan').text(titleText).attr('x', 0).attr('dy', lineOffset);

        el.append('title').text(title);
      }
    };

    _this.renderEdges = function (entities, edges) {
      var self = _this;

      // Join Data
      var edges = entities.selectAll("g.edge").data(edges, function (d) {
        // IMPORTANT: this snippet allows D3 to detect updated vs. new data
        return d.source + ':' + d.target;
      });

      // Remove Old
      edges.exit().remove();

      // Add New
      var newEdges = edges.enter().append("g").classed("edge", true);

      newEdges.on("mousedown", _this.handleEdgeMouseDown).call(d3.drag().on("start", _this.handleEdgeDrag));

      newEdges.attr("opacity", 0).transition().duration(self.props.transitionTime).attr("opacity", 1);

      // Merge
      edges.enter().merge(edges);

      function updateEdge(d, i, els) {
        var _this2 = this;

        // setTimeout is used to unblock the browser
        // clearing the previous render's timeout prevents the browser from being overworked
        var key = 'edgeKey-' + d.source + '_' + d.target;
        if (self.edgeTimeouts[key]) {
          clearTimeout(self.edgeTimeouts[key]);
        }
        self.edgeTimeouts[key] = setTimeout(function () {
          self.props.renderEdge(self, _this2, d, i, els);
        });
      }

      // Update All
      edges.each(updateEdge);
    };

    _this.renderNodes = function (entities, nodes) {
      var self = _this;
      var nodeKey = _this.props.nodeKey;
      var parent = _this.viewWrapper;
      var viewTransform = _this.state.viewTransform;
      var overlap = 300 / viewTransform.k;

      // Join Data
      var nodeKeyWarned = false;
      var nodesSelection = entities.selectAll("g.node").data(nodes, function (d) {
        // IMPORTANT: this snippet allows D3 to detect updated vs. new data
        if (d[nodeKey] === undefined && !nodeKeyWarned) {
          console.warn('Warning: The specified nodeKey \'' + nodeKey + '\' cannot be found on a node.           Make sure the nodeKey is accurate and that all nodes contain a property called \'' + nodeKey + '\'.           Performance will degrade when there are nodes with an undefined nodeKey or with duplicate keys.');
          nodeKeyWarned = true;
        }
        return d[nodeKey];
      });

      // Animate/Remove Old
      var removedNodes = nodesSelection.exit().transition().duration(self.props.transitionTime).attr("opacity", 0).remove();

      // Add New
      var newNodes = nodesSelection.enter().append("g").classed("node", true);

      newNodes.on("mousedown", _this.handleNodeMouseDown).on("mouseup", _this.handleNodeMouseUp).on("click", function (d) {
        // Force blocking propagation on node click.
        // It was found that large graphs would handle clicks on the canvas even
        // though the mouseDown event blocked propagation.
        d3.event.stopPropagation();
        d3.event.preventDefault();
      }).on("mouseenter", _this.handleNodeMouseEnter).on("mouseleave", _this.handleNodeMouseLeave).call(d3.drag().on("start", _this.handleNodeDrag));

      newNodes.attr("opacity", 0).transition().duration(self.props.transitionTime).attr("opacity", 1);

      // Merge
      nodesSelection.enter().merge(nodesSelection);

      function updateNode(d, i, els) {
        var _this3 = this;

        var key = 'nodeKey-' + d[nodeKey];
        // setTimeout is used to unblock the browser
        // clearing the previous render's timeout prevents the browser from being overworked
        if (self.nodeTimeouts[key]) {
          clearTimeout(self.nodeTimeouts[key]);
        }
        self.nodeTimeouts[key] = setTimeout(function () {
          self.props.renderNode(self, _this3, d, i, els);
        });
      }

      // Update Selected and Unselected
      // New or Removed
      var selected = nodesSelection.filter(function (d) {
        return d === _this.props.selected || d === _this.state.previousSelection;
      });

      /*
        The commented code below would prevent nodes from rendering
        until they are within the viewport. The problem is that this causes a zoom-to-fit
        regression. The benefit from the code is that even a gigantic graph is very responsive at first,
        however as a person zooms out or moves the graph around it would add more nodes.
        After many nodes are added to the graph the zoom behavior will degrade, and there's no way to
        remove the existing nodes from the DOM which are outside of the viewport. This degraded performance already
        exists in the zoom-to-fit scenario for large graphs, since all nodes are rendered and never removed.
        TODO: figure out if it's possible/worthwhile to remove nodes from the graph that are outside of the viewport
        TODO: figure out the zoom-to-fit if this is added
      */
      // function viewableFilter(d) {
      // const xPosition = (d.x + viewTransform.x) * viewTransform.k;
      // const yPosition = (d.y + viewTransform.y) * viewTransform.k;
      // return xPosition < parent.offsetWidth + overlap &&
      //   xPosition > 0 - overlap &&
      //   yPosition < parent.offsetHeight + overlap &&
      //   yPosition > 0 - overlap;
      // }
      // selected.filter(viewableFilter).each(updateNode);
      // removedNodes.filter(viewableFilter).each(updateNode);
      // newNodes.filter(viewableFilter).each(updateNode);

      selected.each(updateNode);
      removedNodes.each(updateNode);
      newNodes.each(updateNode);

      var newState = {};

      // Update all others
      // Normally we would want to only render all others on a zoom change,
      // however sometimes other nodes must be updated on a selection
      nodesSelection.filter(function (d) {
        var isInSelected = selected.filter(function (sd) {
          return sd === d;
        }).size();
        var isInNewNodes = newNodes.filter(function (nd) {
          return nd === d;
        }).size();
        var isInRemovedNodes = removedNodes.filter(function (rd) {
          return rd === d;
        }).size();

        return (
          // viewableFilter(d) && // see comment above
          !isInSelected && !isInNewNodes && !isInRemovedNodes
        );
      }).each(updateNode);
    };

    _this.renderView = function () {
      var nodes = _this.props.nodes;
      var edges = _this.props.edges;

      // Update the view w/ new zoom/pan
      var view = d3.select(_this.view).attr("transform", _this.state.viewTransform);

      var entities = d3.select(_this.entities);

      _this.renderNodes(entities, nodes);
      _this.renderEdges(entities, edges);
    };

    _this.state = {
      viewTransform: d3.zoomIdentity,
      selectionChanged: false,
      focused: true,
      enableFocus: props.enableFocus || false, // Enables focus/unfocus
      edgeSwapQueue: [], // Stores nodes to be swapped
      styles: makeStyles(props.primary, props.light, props.dark, props.background)
    };

    _this.zoom = d3.zoom().scaleExtent([props.minZoom, props.maxZoom]).on("zoom", _this.handleZoom);

    _this.nodeTimeouts = {};
    _this.edgeTimeouts = {};
    return _this;
  }

  _createClass(GraphView, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this4 = this;

      // Window event listeners for keypresses
      // and to control blur/focus of graph
      d3.select(this.viewWrapper).on('keydown', this.handleWrapperKeydown);

      var svg = d3.select(this.viewWrapper).on("touchstart", this.containZoom).on("touchmove", this.containZoom).on("click", this.handleSvgClicked).select("svg").call(this.zoom);

      // On the initial load, the 'view' <g> doesn't exist
      // until componentDidMount. Manually render the first view.
      this.renderView();

      // It seems Electron/JSDom's mocking of the SVG API is incomplete
      // and causes D3 to error out when zooming to fit in tests.
      if (process.env.NODE_ENV !== "test") {
        setTimeout(function () {
          if (_this4.viewWrapper != null) {
            _this4.handleZoomToFit();
          }
        }, this.props.zoomDelay);
      }
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      // Remove window event listeners
      d3.select(this.viewWrapper).on('keydown', null);
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      var selectionChanged = false;
      var selected = this.props.selected;
      var newState = {};

      if (nextProps.selected !== selected) {
        newState.selected = nextProps.selected;
        newState.previousSelection = selected;
        newState.selectionChanged = true;

        var selectionType = null;
        if (nextProps.selected && nextProps.selected.source) {
          newState.selectionType = 'edge';
        } else if (nextProps.selected && nextProps.selected[this.props.nodeKey]) {
          newState.selectionType = 'node';
        }

        this.setState(newState);
      }
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps, prevState) {
      if (this.state.selectionChanged) {
        this.setState({
          selectionChanged: false
        });
      }
    }

    /*
     * Handlers/Interaction
     */

    // Node 'drag' handler


    // One can't attach handlers to 'markers' or obtain them from the event.target
    // If the click occurs within a certain radius of edge target,
    // assume the click occurred on the arrow


    // Keeps 'zoom' contained


    // View 'zoom' handler


    // Zooms to contents of this.refs.entities


    // Updates current viewTransform with some delta


    // Programmatically resets zoom


    /*
     * Render
     */

    // Returns the svg's path.d' (geometry description) string from edge data
    // edge.source and edge.target are node ids
    // @deprecated - not removed due to potential third party integrations


    // Returns a d3 transformation string from node data


    // Renders 'node.title' into node element


    // Renders 'edges' into entities element


    // Renders 'nodes' into entities element


    // Renders 'graph' into view element
    // All DOM updates within 'view' are managed by D3

  }, {
    key: 'render',
    value: function render() {
      var _this5 = this;

      this.renderView();
      var _state = this.state,
          styles = _state.styles,
          focused = _state.focused;

      return _react2.default.createElement(
        'div',
        {
          className: 'viewWrapper',
          tabIndex: 0,
          onFocus: function onFocus() {
            _this5.setState({
              focused: true
            });
          },
          onBlur: function onBlur() {
            if (_this5.props.enableFocus) {
              _this5.setState({
                focused: false
              });
            }
          },
          ref: function ref(el) {
            return _this5.viewWrapper = el;
          },
          style: [styles.wrapper.base, !!focused && styles.wrapper.focused, this.props.style] },
        _react2.default.createElement(
          'svg',
          { style: styles.svg.base },
          this.props.renderDefs(this),
          _react2.default.createElement(
            'g',
            { className: 'view', ref: function ref(el) {
                return _this5.view = el;
              } },
            this.props.renderBackground(this),
            _react2.default.createElement('g', { className: 'entities', ref: function ref(el) {
                return _this5.entities = el;
              } })
          )
        ),
        this.props.graphControls && _react2.default.createElement(_graphControls2.default, { primary: this.props.primary,
          minZoom: this.props.minZoom,
          maxZoom: this.props.maxZoom,
          zoomLevel: this.state.viewTransform.k,
          zoomToFit: this.handleZoomToFit,
          modifyZoom: this.modifyZoom })
      );
    }
  }]);

  return GraphView;
}(_react.Component);

GraphView.propTypes = {
  nodeKey: _propTypes2.default.string.isRequired,
  emptyType: _propTypes2.default.string.isRequired,
  nodes: _propTypes2.default.array.isRequired,
  edges: _propTypes2.default.array.isRequired,
  selected: _propTypes2.default.object.isRequired,
  nodeTypes: _propTypes2.default.object.isRequired,
  nodeSubtypes: _propTypes2.default.object.isRequired,
  edgeTypes: _propTypes2.default.object.isRequired,
  getViewNode: _propTypes2.default.func.isRequired,
  onSelectNode: _propTypes2.default.func.isRequired,
  onCreateNode: _propTypes2.default.func.isRequired,
  onUpdateNode: _propTypes2.default.func.isRequired,
  onDeleteNode: _propTypes2.default.func.isRequired,
  onSelectEdge: _propTypes2.default.func.isRequired,
  onCreateEdge: _propTypes2.default.func.isRequired,
  onSwapEdge: _propTypes2.default.func.isRequired,
  onDeleteEdge: _propTypes2.default.func.isRequired,
  canDeleteNode: _propTypes2.default.func,
  canCreateEdge: _propTypes2.default.func,
  canDeleteEdge: _propTypes2.default.func,
  renderEdge: _propTypes2.default.func,
  renderNode: _propTypes2.default.func,
  renderDefs: _propTypes2.default.func,
  renderBackground: _propTypes2.default.func,
  readOnly: _propTypes2.default.bool,
  enableFocus: _propTypes2.default.bool,
  maxTitleChars: _propTypes2.default.number, // Per line.
  transitionTime: _propTypes2.default.number, // D3 Enter/Exit duration
  primary: _propTypes2.default.string,
  light: _propTypes2.default.string,
  dark: _propTypes2.default.string,
  background: _propTypes2.default.string,
  style: _propTypes2.default.object,
  gridSize: _propTypes2.default.number, // The point grid is fixed
  gridSpacing: _propTypes2.default.number,
  gridDot: _propTypes2.default.number,
  minZoom: _propTypes2.default.number,
  maxZoom: _propTypes2.default.number,
  nodeSize: _propTypes2.default.number,
  edgeHandleSize: _propTypes2.default.number,
  edgeArrowSize: _propTypes2.default.number,
  zoomDelay: _propTypes2.default.number, // ms
  zoomDur: _propTypes2.default.number, // ms
  graphControls: _propTypes2.default.bool
};

GraphView.defaultProps = {
  readOnly: false,
  maxTitleChars: 9,
  transitionTime: 150,
  primary: 'dodgerblue',
  light: '#FFF',
  dark: '#000',
  background: '#F9F9F9',
  gridSize: 40960, // The point grid is fixed
  gridSpacing: 36,
  gridDot: 2,
  minZoom: 0.15,
  maxZoom: 1.5,
  nodeSize: 150,
  edgeHandleSize: 50,
  edgeArrowSize: 8,
  zoomDelay: 500,
  zoomDur: 750,
  graphControls: true,
  renderEdge: function renderEdge(graphView, domNode, datum, index, elements) {

    // For new edges, add necessary child domNodes
    if (!domNode.hasChildNodes()) {
      d3.select(domNode).append("path");
      d3.select(domNode).append("use");
    }

    var style = graphView.getEdgeStyle(datum, graphView.props.selected);
    var trans = graphView.getEdgeHandleTransformation(datum);
    d3.select(domNode).attr("style", style).select("use").attr("xlink:href", function (d) {
      return graphView.props.edgeTypes[d.type].shapeId;
    }).attr("width", graphView.props.edgeHandleSize).attr("height", graphView.props.edgeHandleSize).attr("transform", trans);

    d3.select(domNode).select('path').attr('d', graphView.getPathDescription);
  },
  renderNode: function renderNode(graphView, domNode, datum, index, elements) {
    // For new nodes, add necessary child domNodes
    var selection = d3.select(domNode);
    if (!domNode.hasChildNodes()) {
      selection.append("use").classed("subtypeShape", true).attr("x", -graphView.props.nodeSize / 2).attr("y", -graphView.props.nodeSize / 2).attr("width", graphView.props.nodeSize).attr("height", graphView.props.nodeSize);
      selection.append("use").classed("shape", true).attr("x", -graphView.props.nodeSize / 2).attr("y", -graphView.props.nodeSize / 2).attr("width", graphView.props.nodeSize).attr("height", graphView.props.nodeSize);
    }

    var style = graphView.getNodeStyle(datum, graphView.props.selected);

    selection.attr("style", style);

    if (datum.subtype) {
      selection.select("use.subtypeShape").attr("xlink:href", function (d) {
        return graphView.props.nodeSubtypes[d.subtype].shapeId;
      });
    } else {
      selection.select("use.subtypeShape").attr("xlink:href", function (d) {
        return null;
      });
    }

    selection.select("use.shape").attr("xlink:href", function (d) {
      return graphView.props.nodeTypes[d.type].shapeId;
    });

    selection.attr('id', 'node-' + datum[graphView.props.nodeKey]);

    graphView.renderNodeText(datum, domNode);

    selection.attr('transform', graphView.getNodeTransformation);
  },
  renderDefs: function renderDefs(graphView) {
    var styles = graphView.state.styles;
    var _graphView$props = graphView.props,
        edgeArrowSize = _graphView$props.edgeArrowSize,
        gridSpacing = _graphView$props.gridSpacing,
        gridDot = _graphView$props.gridDot,
        nodeTypes = _graphView$props.nodeTypes,
        nodeSubtypes = _graphView$props.nodeSubtypes,
        edgeTypes = _graphView$props.edgeTypes;


    var defIndex = 0;
    var graphConfigDefs = [];

    Object.keys(nodeTypes).forEach(function (type) {
      defIndex += 1;
      graphConfigDefs.push(_react2.default.cloneElement(nodeTypes[type].shape, { key: defIndex }));
    });

    Object.keys(nodeSubtypes).forEach(function (type) {
      defIndex += 1;
      graphConfigDefs.push(_react2.default.cloneElement(nodeSubtypes[type].shape, { key: defIndex }));
    });

    Object.keys(edgeTypes).forEach(function (type) {
      defIndex += 1;
      graphConfigDefs.push(_react2.default.cloneElement(edgeTypes[type].shape, { key: defIndex }));
    });

    return _react2.default.createElement(
      'defs',
      null,
      graphConfigDefs,
      _react2.default.createElement(
        'marker',
        { id: 'end-arrow',
          key: 'end-arrow',
          viewBox: '0 -' + edgeArrowSize / 2 + ' ' + edgeArrowSize + ' ' + edgeArrowSize,
          refX: '' + edgeArrowSize / 2,
          markerWidth: '' + edgeArrowSize,
          markerHeight: '' + edgeArrowSize,
          orient: 'auto' },
        _react2.default.createElement('path', { style: styles.arrow,
          d: 'M0,-' + edgeArrowSize / 2 + 'L' + edgeArrowSize + ',0L0,' + edgeArrowSize / 2 })
      ),
      _react2.default.createElement(
        'pattern',
        { id: 'grid',
          key: 'grid',
          width: gridSpacing,
          height: gridSpacing,
          patternUnits: 'userSpaceOnUse' },
        _react2.default.createElement('circle', { cx: gridSpacing / 2,
          cy: gridSpacing / 2,
          r: gridDot,
          fill: 'lightgray' })
      ),
      _react2.default.createElement(
        'filter',
        { id: 'dropshadow', key: 'dropshadow', height: '130%' },
        _react2.default.createElement('feGaussianBlur', { 'in': 'SourceAlpha', stdDeviation: '3' }),
        _react2.default.createElement('feOffset', { dx: '2', dy: '2', result: 'offsetblur' }),
        _react2.default.createElement(
          'feComponentTransfer',
          null,
          _react2.default.createElement('feFuncA', { type: 'linear', slope: '0.1' })
        ),
        _react2.default.createElement(
          'feMerge',
          null,
          _react2.default.createElement('feMergeNode', null),
          _react2.default.createElement('feMergeNode', { 'in': 'SourceGraphic' })
        )
      )
    );
  },
  renderBackground: function renderBackground(graphView) {
    return _react2.default.createElement('rect', { className: 'background',
      x: -graphView.props.gridSize / 4,
      y: -graphView.props.gridSize / 4,
      width: graphView.props.gridSize,
      height: graphView.props.gridSize,
      fill: 'url(#grid)' });
  },
  canDeleteNode: function canDeleteNode() {
    return true;
  },
  canCreateEdge: function canCreateEdge() {
    return true;
  },
  canDeleteEdge: function canDeleteEdge() {
    return true;
  }
};

exports.default = (0, _radium2.default)(GraphView);
//# sourceMappingURL=graph-view.js.map