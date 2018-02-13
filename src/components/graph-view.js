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

/*
  GraphView is a Generic D3 Graph view with no application specific
  code in it and no significant state except UI state (zoom, for example).
*/

import React, {
  Component
} from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import Radium from 'radium';
import GraphControls from './graph-controls.js'


function styleToString(style){
  return Object.keys(style)
    .map(function(k) {
      let key = k.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
      return `${key}:${style[k]}`;
    }).join(";")
}


function makeStyles(primary='dodgerblue', light='white', dark='black', background='#F9F9F9'){
 let styles = {
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
      base:{
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
  }

  // Styles need to be strings for D3 to apply them all at once
  styles.node.baseString = styleToString(styles.node.base);
  styles.node.selectedString = styleToString({...styles.node.base, ...styles.node.selected});
  styles.text.baseString= styleToString(styles.text.base);
  styles.text.selectedString = styleToString({...styles.text.base, ...styles.text.selected});
  styles.edge.baseString = styleToString(styles.edge.base);
  styles.edge.selectedString = styleToString({...styles.edge.base, ...styles.edge.selected});

  return styles
}

// any objects with x & y properties
function getTheta(pt1, pt2) {
  const xComp = pt2.x - pt1.x;
  const yComp = pt2.y - pt1.y;
  const theta = Math.atan2(yComp, xComp);
  return theta
}

function getMidpoint(pt1, pt2) {
  const x = (pt2.x + pt1.x)/2;
  const y = (pt2.y + pt1.y)/2;

  return {x: x, y: y};
}

function getDistance(pt1, pt2) {
  return  Math.sqrt(Math.pow(pt2.x - pt1.x, 2) + Math.pow(pt2.y - pt1.y, 2))
}



class GraphView extends Component {

  constructor(props) {
    super(props);

    this.state = {
      viewTransform: d3.zoomIdentity,
      selectionChanged: false,
      focused: true,
      readOnly: props.readOnly || false,
      enableFocus: props.enableFocus || false, // Enables focus/unfocus
      edgeSwapQueue: [],    // Stores nodes to be swapped
      styles: makeStyles(props.primary, props.light, props.dark, props.background)
    };

    this.zoom = d3.zoom()
                  .scaleExtent([props.minZoom, props.maxZoom])
                  .on("zoom", this.handleZoom);
  }

  componentDidMount() {
    // Window event listeners for keypresses
    // and to control blur/focus of graph
    d3.select(this.viewWrapper)
      .on('keydown', this.handleWrapperKeydown);

    var svg = d3.select(this.viewWrapper)
      .on("touchstart", this.containZoom)
      .on("touchmove", this.containZoom)
      .on("click", this.handleSvgClicked)
      .select("svg")
      .call(this.zoom);

    // On the initial load, the 'view' <g> doesn't exist
    // until componentDidMount. Manually render the first view.
    this.renderView();

    // It seems Electron/JSDom's mocking of the SVG API is incomplete
    // and causes D3 to error out when zooming to fit in tests.
    if(process.env.NODE_ENV !== "test"){
      setTimeout(function(){
        this.handleZoomToFit();
      }.bind(this), this.props.zoomDelay)
    }
  }

  componentWillUnmount() {
    // Remove window event listeners
    d3.select(this.viewWrapper)
      .on('keydown', null);
  }

  componentWillReceiveProps(nextProps) {
    let selectionChanged = false;
    let selected = this.props.selected;

    if (selected != nextProps.selected) {
      selectionChanged = true
    }

    let selectionType = null;
    if (nextProps.selected && nextProps.selected.source){
      selectionType = 'edge'
    } else if (nextProps.selected && nextProps.selected[this.props.nodeKey]) {
      selectionType = 'node'
    }

    this.setState({
      selectionChanged: selectionChanged,
      selectionType: selectionType,
      readOnly: nextProps.readOnly || false
    });
  }

  componentDidUpdate() {
    if (this.state.selectionChanged) {
      this.setState({
        selectionChanged: false
      });
    }
  }

  /*
   * Handlers/Interaction
   */

  hideEdge = (edgeDOMNode) => {
    d3.select(edgeDOMNode)
      .attr("opacity", 0)
  }

  showEdge = (edgeDOMNode) => {
    d3.select(edgeDOMNode)
      .attr("opacity", 1)
  }

  canSwap = (sourceNode, hoveredNode, swapEdge) => {
    return swapEdge.source != sourceNode[this.props.nodeKey] ||
          swapEdge.target != hoveredNode[this.props.nodeKey]
  }

  drawEdge = (sourceNode, target, swapErrBack) => {
    const self = this;

    const dragEdge = d3.select(this.entities).append('svg:path')

    dragEdge.attr('class', 'link dragline')
      .attr("style", this.state.styles.edge.selectedString)
      .attr('d', self.getPathDescriptionStr(sourceNode.x, sourceNode.y, target.x, target.y));

    d3.event.on("drag", dragged).on("end", ended);

    function dragged(d) {
      dragEdge.attr( 'd', self.getPathDescriptionStr(sourceNode.x, sourceNode.y, d3.event.x, d3.event.y ) )
    }

    function ended(d) {
      dragEdge.remove();

      let swapEdge = self.state.edgeSwapQueue.shift();
      let hoveredNode = self.state.hoveredNode;

      self.setState({
        edgeSwapQueue: self.state.edgeSwapQueue,
        drawingEdge: false
      });

      if(hoveredNode && self.props.canCreateEdge(sourceNode, hoveredNode)){

        if( swapEdge ){
          if(self.props.canDeleteEdge(swapEdge) && self.canSwap(sourceNode,hoveredNode,swapEdge)){
            self.props.onSwapEdge(sourceNode, hoveredNode, swapEdge)
            self.renderView()
          } else {
            swapErrBack()
          }
        } else {
          self.props.onCreateEdge(sourceNode, hoveredNode)
          self.renderView()
        }
      } else {
        if (swapErrBack){
          swapErrBack()
        }
      }
    }
  }

  dragNode = () => {
    const self = this;

    const el = d3.select(d3.event.target.parentElement); // Enclosing 'g' element
    el.classed("dragging", true);
    d3.event.on("drag", dragged).on("end", ended);

    function dragged(d) {
      if (self.state.readOnly) return;
      d3.select(this).attr('transform', function(d) {
        d.x += d3.event.dx;
        d.y += d3.event.dy;
        return 'translate(' + d.x + ',' + d.y + ')';
      });
      self.render();
    }

    function ended() {
      el.classed("dragging", false);

      if(!self.state.readOnly){
        var d = d3.select(this).datum();
        self.props.onUpdateNode(d);
      }

      // For some reason, mouseup isn't firing
      // - manually firing it here
      d3.select(this).node().dispatchEvent(new Event("mouseup"))
    }
  }

  // Node 'drag' handler
  handleNodeDrag = () => {
    if(this.state.drawingEdge && !this.state.readOnly){
      const target = {x: d3.event.subject.x, y: d3.event.subject.y }
      this.drawEdge(d3.event.subject, target )
    } else {
      this.dragNode()
    }
  }

  handleDelete = () => {
    if (this.state.readOnly) return;
    if (this.props.selected) {
      const selected = this.props.selected;
      if (this.state.selectionType === 'node' && this.props.canDeleteNode(selected)) {
          this.props.onDeleteNode(selected);
          this.props.onSelectNode(null);
      } else if (this.state.selectionType === 'edge' && this.props.canDeleteEdge(selected)) {
          this.props.onDeleteEdge(selected);
          this.props.onSelectNode(null);
      }
    }
  }

  handleWrapperKeydown = (d, i) => {
    // Conditionally ignore keypress events on the window
    // if the Graph isn't focused
    switch (d3.event.key) {
      case "Delete":
        this.handleDelete();
        break;
      case "Backspace":
        this.handleDelete();
        break;
      default:
        break;
    }
  }

  handleSvgClicked = (d, i) => {
    if (this.isPartOfEdge(d3.event.target)) return; // If any part of the edge is clicked, return

    if (this.state.selectingNode) {
      this.setState({
        selectingNode: false
      })
    } else {

      this.props.onSelectNode(null);

      if (!this.state.readOnly && d3.event.shiftKey) {
        var xycoords = d3.mouse(event.target);
        this.props.onCreateNode(xycoords[0],xycoords[1]);
        this.renderView()
      }

    }
  }

  isPartOfEdge = (element) => {
    while (element != null && element != this.viewWrapper) {
      if (element.classList.contains("edge")) {
        return true;
      }
      element = element.parentElement;
    }
    return false;
  }

  handleNodeMouseDown = (d) => {
    if (d3.event.defaultPrevented) {
      return; // dragged
    }

    // Prevent d3's default as it changes the focus to the body
    d3.event.preventDefault();
    d3.event.stopPropagation();
    if (document.activeElement != this.viewWrapper) {
      this.viewWrapper.focus();
    }

    if (d3.event.shiftKey) {

      this.setState({
        selectingNode: true,
        drawingEdge: true
      })

    } else {
      this.setState({
        selectingNode: true
      })
    }
  }

  handleNodeMouseUp = (d) => {

    if(this.state.selectingNode){
      this.props.onSelectNode(d);
      this.setState({selectingNode: false});
    }
  }

  handleNodeMouseEnter = (d) => {

    if (this.state.hoveredNode != d){
      this.setState({
        hoveredNode: d
      })
    }
  }

  handleNodeMouseLeave = (d) => {

    // For whatever reason, mouseLeave is fired when edge dragging ends
    // (and mouseup is not fired). This clears the hoverNode state prematurely
    // resulting in swapEdge failing to fire.
    // Detecting & ignoring mouseLeave events that result from drag ending here
    const fromMouseup = event.which == 1;
    if (this.state.hoveredNode === d && !fromMouseup){
      this.setState({
        hoveredNode: null
      })
    }
  }

  // One can't attach handlers to 'markers' or obtain them from the event.target
  // If the click occurs within a certain radius of edge target,
  // assume the click occurred on the arrow
  arrowClicked = (d)=> {

    if(event.target.tagName != 'path') return false; // If the handle is clicked

    const xycoords = d3.mouse(event.target);
    const target = this.props.getViewNode(d.target);
    const dist = getDistance({x: xycoords[0], y: xycoords[1]}, target);

    return dist < this.props.nodeSize/2 + this.props.edgeArrowSize + 10 // or *2 or ^2?
  }

  handleEdgeDrag = (d) => {
    if(!this.state.readOnly && this.state.drawingEdge ){
      const edgeDOMNode = event.target.parentElement;
      const sourceNode = this.props.getViewNode(d.source);
      const xycoords = d3.mouse(event.target)
      const target = {x: xycoords[0], y: xycoords[1]}

      this.hideEdge(edgeDOMNode);
      this.drawEdge(sourceNode, target, this.showEdge.bind(this, edgeDOMNode))
    }
  }


  handleEdgeMouseDown = (d) => {
    // Prevent d3's default as it changes the focus to the body
    d3.event.preventDefault();
    d3.event.stopPropagation();
    if (document.activeElement != this.viewWrapper) {
      this.viewWrapper.focus();
    }

    if (!this.state.readOnly && this.arrowClicked(d)) {
      this.state.edgeSwapQueue.push(d)  // Set this edge aside for redrawing
      this.setState({
        drawingEdge: true,
        edgeSwapQueue: this.state.edgeSwapQueue
      })
    } else{
      this.props.onSelectEdge(d);
    }
  }

  // Keeps 'zoom' contained
  containZoom = () => {
    d3.event.preventDefault();
  }

  // View 'zoom' handler
  handleZoom = () => {
    if (this.state.focused) {
      this.setState({
        viewTransform: d3.event.transform
      });
    }
  }

  // Zooms to contents of this.refs.entities
  handleZoomToFit = () => {
    const parent = d3.select(this.viewWrapper).node();
    const entities = d3.select(this.entities).node();

    const viewBBox = entities.getBBox();

    const width = parent.clientWidth;
    const height = parent.clientHeight;

    let dx,
        dy,
        x,
        y,
        translate = [this.state.viewTransform.x, this.state.viewTransform.y],
        next = {x: translate[0], y: translate[1], k:  this.state.viewTransform.k}

    if (viewBBox.width > 0 && viewBBox.height > 0){
      // There are entities
      dx = viewBBox.width,
      dy = viewBBox.height,
      x = viewBBox.x + viewBBox.width / 2,
      y = viewBBox.y + viewBBox.height / 2;

      next.k = .9 / Math.max(dx / width, dy / height);

      if (next.k < this.props.minZoom){
        next.k = this.props.minZoom
      } else if (next.k > this.props.maxZoom){
        next.k = this.props.maxZoom
      }

      next.x = width / 2 - next.k * x;
      next.y = height / 2 - next.k * y;
    }
    else{
      next.k = (this.props.minZoom + this.props.maxZoom) / 2;
      next.x = 0
      next.y = 0;
    }

    this.setZoom(next.k, next.x, next.y, this.props.zoomDur)
  }

  // Updates current viewTransform with some delta
  modifyZoom = (modK=0, modX=0, modY=0, dur=0) => {
    const parent = d3.select(this.viewWrapper).node();
    const width = parent.clientWidth;
    const height = parent.clientHeight;

    let target_zoom,
        center = [width/2, height/2],
        extent = this.zoom.scaleExtent(),
        translate = [this.state.viewTransform.x, this.state.viewTransform.y],
        translate0 = [],
        l = [],
        next = {x: translate[0], y: translate[1], k:  this.state.viewTransform.k};

    target_zoom = next.k * (1 + modK);

    if (target_zoom < extent[0] || target_zoom > extent[1]) { return false; }

    translate0 = [(center[0] - next.x) / next.k, (center[1] - next.y) / next.k];
    next.k = target_zoom;
    l = [translate0[0] * next.k + next.x, translate0[1] * next.k + next.y];

    next.x += center[0] - l[0] + modX;
    next.y += center[1] - l[1] + modY;

    this.setZoom(next.k, next.x, next.y, dur)
  }

  // Programmatically resets zoom
  setZoom = (k=1, x=0, y=0, dur=0) => {

    var t = d3.zoomIdentity.translate(x, y).scale(k);

    d3.select(this.viewWrapper).select('svg')
      .transition()
      .duration(dur)
      .call(this.zoom.transform, t);
  }

  /*
   * Render
   */
  // Returns the svg's path.d' (geometry description) string from edge data
  // edge.source and edge.target are node ids
  getPathDescriptionStr = (sourceX, sourceY, targetX, targetY) => {
    return `M${sourceX},${sourceY}L${targetX},${targetY}`
  }

  getPathDescription = (edge) => {
    let src = this.props.getViewNode(edge.source);
    let trg = this.props.getViewNode(edge.target);

    if(src && trg){
      const off = this.props.nodeSize/2; // from the center of the node to the perimeter

      const theta = getTheta(src, trg);

      const xOff = off * Math.cos(theta);
      const yOff = off * Math.sin(theta);

      return this.getPathDescriptionStr(src.x + xOff, src.y + yOff, trg.x - xOff, trg.y - yOff )
    }
    console.warn("Unable to get source or target for ", edge);
    return ""
  }

  getEdgeHandleTransformation = (edge) => {
    let src = this.props.getViewNode(edge.source);
    let trg = this.props.getViewNode(edge.target);

    let origin = getMidpoint(src, trg);
    let x = origin.x;
    let y = origin.y;
    let theta = getTheta(src, trg)*180/Math.PI;
    let offset = -this.props.edgeHandleSize/2;

    return `translate(${x}, ${y}) rotate(${theta}) translate(${offset}, ${offset})`
  }

  // Returns a d3 transformation string from node data
  getNodeTransformation = (node) => {
    return 'translate(' + node.x + ',' + node.y + ')';
  }

  getNodeStyle = (d, selected) => {
    return d === selected ?
      this.state.styles.node.selectedString :
      this.state.styles.node.baseString
  }

  getEdgeStyle = (d, selected) => {
    return d === selected ?
      this.state.styles.edge.selectedString :
      this.state.styles.edge.baseString
  }

  getTextStyle = (d, selected) => {
    return d === selected ?
      this.state.styles.text.selectedString :
      this.state.styles.text.baseString
  }

  // Renders 'node.title' into node element
  renderNodeText = (d, domNode) => {
    let d3Node = d3.select(domNode);
    let title = d.title ? d.title : ' ';

    let titleText = title.length <= this.props.maxTitleChars ? title :
      `${title.substring(0, this.props.maxTitleChars)}...`;

    let lineOffset = 18;
    let textOffset = d.type === this.props.emptyType ? -9 : 18;

    d3Node.selectAll("text").remove();

    let typeText = this.props.nodeTypes[d.type].typeText;
    let style = this.getTextStyle(d, this.props.selected);

    let el = d3Node.append('text')
      .attr('text-anchor', 'middle')
      .attr('style', style)
      .attr('dy', textOffset);

    el.append('tspan')
      .attr('opacity', 0.5)
      .text(typeText);

    if (title) {
      // User defined/secondary text
      el.append('tspan').text(titleText).attr('x', 0).attr('dy', lineOffset)

      el.append('title').text(title);
    }
  }

  // Renders 'edges' into entities element
  renderEdges = (entities, edges) => {
    var self = this;

    // Join Data
    var edges = entities.selectAll("g.edge")
      .data(edges, function(d) {
        // IMPORTANT: this snippet allows D3 to detect updated vs. new data
        return `${d.source}:${d.target}`;
      });

    // Remove Old
    edges.exit()
        .remove();

    // Add New
    var newEdges = edges.enter().append("g").classed("edge", true);

    newEdges
      .on("mousedown", this.handleEdgeMouseDown)
      .call(d3.drag().on("start", this.handleEdgeDrag));

    newEdges.attr("opacity", 0)
      .transition()
      .duration(self.props.transitionTime)
      .attr("opacity", 1);

    // Merge
    edges.enter().merge(edges);

    // Update All
    edges.each(function(d, i, els) {
      self.props.renderEdge(self, this, d, i, els)
    })
  }

  // Renders 'nodes' into entities element
  renderNodes = (entities, nodes) => {
    var self = this;
    const nodeKey = this.props.nodeKey;

    // Join Data
    var nodes = entities.selectAll("g.node").data(nodes, function(d) {
      // IMPORTANT: this snippet allows D3 to detect updated vs. new data
      return d[nodeKey]
    });

    // Animate/Remove Old
    nodes.exit()
      .transition()
      .duration(self.props.transitionTime)
      .attr("opacity", 0)
      .remove();

    // Add New
    var newNodes = nodes.enter().append("g").classed("node", true);

    newNodes.on("mousedown", this.handleNodeMouseDown)
      .on("mouseup", this.handleNodeMouseUp)
      .on("mouseenter", this.handleNodeMouseEnter)
      .on("mouseleave", this.handleNodeMouseLeave)
      .call(d3.drag().on("start", this.handleNodeDrag));

    newNodes
      .attr("opacity", 0)
      .transition()
      .duration(self.props.transitionTime)
      .attr("opacity", 1);

    // Merge
    nodes.enter().merge(nodes);

    // Update All
    nodes
      .each(function(d, i, els) {
        self.props.renderNode(self, this, d, i, els)
      })

  }

  // Renders 'graph' into view element
  // All DOM updates within 'view' are managed by D3
  renderView = () => {
    var nodes = this.props.nodes;
    var edges = this.props.edges;

    // Update the view w/ new zoom/pan
    const view = d3.select(this.view)
      .attr("transform", this.state.viewTransform);

    const entities = d3.select(this.entities);

    this.renderNodes(entities, nodes);
    this.renderEdges(entities, edges);
  }


  render() {
    this.renderView();
    const { styles, focused } = this.state;

    return (
      <div
          className='viewWrapper'
          tabIndex={0}
          onFocus={() => {
            this.setState({
              focused: true
            });
          }}
          onBlur={() => {
            if (this.props.enableFocus) {
              this.setState({
                focused: false
              });
            }
          }}
          ref={(el) => this.viewWrapper = el}
          style={[
            styles.wrapper.base,
            !!focused && styles.wrapper.focused,
            this.props.style
          ]}>
        <svg style={styles.svg.base}>
          { this.props.renderDefs(this) }
          <g className='view' ref={(el) => this.view = el}>
            { this.props.renderBackground(this) }
            <g className='entities' ref={(el) => this.entities = el}></g>
          </g>
        </svg>
        {this.props.graphControls && (
        <GraphControls  primary={this.props.primary}
                        minZoom={this.props.minZoom}
                        maxZoom={this.props.maxZoom}
                        zoomLevel={this.state.viewTransform.k}
                        zoomToFit={this.handleZoomToFit}
                        modifyZoom={this.modifyZoom}>
        </GraphControls>
        )}
      </div>
    );
  }

}

GraphView.propTypes = {
  nodeKey: PropTypes.string.isRequired,
  emptyType: PropTypes.string.isRequired,
  nodes: PropTypes.array.isRequired,
  edges: PropTypes.array.isRequired,
  selected: PropTypes.object.isRequired,
  nodeTypes: PropTypes.object.isRequired,
  nodeSubtypes: PropTypes.object.isRequired,
  edgeTypes: PropTypes.object.isRequired,
  getViewNode: PropTypes.func.isRequired,
  onSelectNode: PropTypes.func.isRequired,
  onCreateNode: PropTypes.func.isRequired,
  onUpdateNode: PropTypes.func.isRequired,
  onDeleteNode: PropTypes.func.isRequired,
  onSelectEdge: PropTypes.func.isRequired,
  onCreateEdge: PropTypes.func.isRequired,
  onSwapEdge: PropTypes.func.isRequired,
  onDeleteEdge: PropTypes.func.isRequired,
  canDeleteNode: PropTypes.func,
  canCreateEdge: PropTypes.func,
  canDeleteEdge: PropTypes.func,
  renderEdge: PropTypes.func,
  renderNode: PropTypes.func,
  renderDefs: PropTypes.func,
  renderBackground: PropTypes.func,
  readOnly: PropTypes.bool,
  enableFocus: PropTypes.bool,
  maxTitleChars: PropTypes.number, // Per line.
  transitionTime: PropTypes.number, // D3 Enter/Exit duration
  primary: PropTypes.string,
  light: PropTypes.string,
  dark: PropTypes.string,
  background: PropTypes.string,
  style: PropTypes.object,
  gridSize: PropTypes.number, // The point grid is fixed
  gridSpacing: PropTypes.number,
  gridDot: PropTypes.number,
  minZoom: PropTypes.number,
  maxZoom: PropTypes.number,
  nodeSize: PropTypes.number,
  edgeHandleSize: PropTypes.number,
  edgeArrowSize: PropTypes.number,
  zoomDelay: PropTypes.number, // ms
  zoomDur: PropTypes.number, // ms
  graphControls: PropTypes.bool,
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
  renderEdge: (graphView, domNode, datum, index, elements ) => {

    // For new edges, add necessary child domNodes
    if (!domNode.hasChildNodes()){
      d3.select(domNode).append("path");
      d3.select(domNode).append("use");
    }

    let style = graphView.getEdgeStyle(datum, graphView.props.selected);
    let trans = graphView.getEdgeHandleTransformation(datum)
    d3.select(domNode)
      .attr("style", style)
      .select("use")
        .attr("xlink:href", function(d){ return graphView.props.edgeTypes[d.type].shapeId })
        .attr("width", graphView.props.edgeHandleSize)
        .attr("height", graphView.props.edgeHandleSize)
        .attr("transform", trans);

    d3.select(domNode)
      .select('path')
        .attr('d', graphView.getPathDescription);
  },
  renderNode: (graphView, domNode,  datum, index, elements) => {

    // For new nodes, add necessary child domNodes
    if (!domNode.hasChildNodes()){
      d3.select(domNode).append("use").classed("subtypeShape", true)
        .attr("x", -graphView.props.nodeSize/2)
        .attr("y",  -graphView.props.nodeSize/2)
        .attr("width", graphView.props.nodeSize)
        .attr("height", graphView.props.nodeSize);
      d3.select(domNode).append("use").classed("shape", true)
        .attr("x", -graphView.props.nodeSize/2)
        .attr("y",  -graphView.props.nodeSize/2)
        .attr("width", graphView.props.nodeSize)
        .attr("height", graphView.props.nodeSize);
    }

    let style = graphView.getNodeStyle(datum, graphView.props.selected);

    d3.select(domNode)
      .attr("style", style);

    if(datum.subtype){
      d3.select(domNode).select("use.subtypeShape")
        .attr("xlink:href", function(d){ return graphView.props.nodeSubtypes[d.subtype].shapeId });
    } else {
      d3.select(domNode).select("use.subtypeShape")
        .attr("xlink:href", function(d){ return null });
    }

    d3.select(domNode).select("use.shape")
        .attr("xlink:href", function(d){ return graphView.props.nodeTypes[d.type].shapeId });

    graphView.renderNodeText(datum, domNode);

    d3.select(domNode).attr('transform', graphView.getNodeTransformation);
  },
  renderDefs: (graphView) => {
    const { styles } = graphView.state;
    const {
      edgeArrowSize,
      gridSpacing,
      gridDot,
      nodeTypes,
      nodeSubtypes,
      edgeTypes
    } = graphView.props;

    let defIndex = 0;
    let graphConfigDefs = [];

    Object.keys(nodeTypes).forEach(function(type){
      defIndex += 1;
      graphConfigDefs.push(React.cloneElement(nodeTypes[type].shape, {key: defIndex}))
    })

    Object.keys(nodeSubtypes).forEach(function(type){
      defIndex += 1;
      graphConfigDefs.push(React.cloneElement(nodeSubtypes[type].shape, {key: defIndex}))
    })

    Object.keys(edgeTypes).forEach(function(type){
      defIndex += 1;
      graphConfigDefs.push(React.cloneElement(edgeTypes[type].shape, {key: defIndex}))
    })

    return (
      <defs>
        {graphConfigDefs}

        <marker id="end-arrow"
                key="end-arrow"
                viewBox={`0 -${edgeArrowSize/2} ${edgeArrowSize} ${edgeArrowSize}`}
                refX={`${edgeArrowSize/2}`}
                markerWidth={`${edgeArrowSize}`}
                markerHeight={`${edgeArrowSize}`}
                orient="auto">
          <path style={ styles.arrow }
                d={`M0,-${edgeArrowSize/2}L${edgeArrowSize},0L0,${edgeArrowSize/2}`}>
          </path>
        </marker>

        <pattern  id="grid"
                  key="grid"
                  width={gridSpacing}
                  height={gridSpacing}
                  patternUnits="userSpaceOnUse">
          <circle cx={gridSpacing/2}
                  cy={gridSpacing/2}
                  r={gridDot}
                  fill="lightgray">
          </circle>
        </pattern>

        <filter id="dropshadow" key="dropshadow" height="130%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
          <feOffset dx="2" dy="2" result="offsetblur"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.1"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>

      </defs>
    )
  },
  renderBackground: (graphView) => {
    return (
      <rect className='background'
        x={-graphView.props.gridSize/4}
        y={-graphView.props.gridSize/4}
        width={ graphView.props.gridSize }
        height={ graphView.props.gridSize }
        fill="url(#grid)">
      </rect>
    )
  },
  canDeleteNode: () => true,
  canCreateEdge: () => true,
  canDeleteEdge: () => true,
};

export default Radium(GraphView)
