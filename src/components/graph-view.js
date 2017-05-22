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
import * as d3 from 'd3';

import Radium from 'radium';
import GraphControls from './graph-controls.js'


// The work area is infinite, but the point grid is fixed
const gridSize = 40960;
const gridSpacing = 36;
const gridDot = 2;

const minZoom = 0.15;
const maxZoom = 1.5;

const nodeSize = 150;
const edgeHandleSize = 50;
const edgeArrowSize = 8;

const zoomDelay = 500; // ms
const zoomDur = 750; // ms


function styleToString(style){
  return Object.keys(style)
    .map(function(k) {
      let key = k.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
      return `${key}:${style[k]}`;
    }).join(";")
}


function makeStyles(primary='dodgerblue', light='white', dark='black'){
 let styles = {
    wrapper: {
      base: {
        height: '100%',
        margin: 0,
        display: 'flex',
        boxShadow: 'none',
        opacity: 0.5,
        background: '#F9F9F9'
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

    // Bind methods
    this.hideEdge = this.hideEdge.bind(this);
    this.showEdge = this.showEdge.bind(this);
    this.canSwap = this.canSwap.bind(this);
    this.drawEdge = this.drawEdge.bind(this);
    this.dragNode = this.dragNode.bind(this);
    this.handleNodeDrag = this.handleNodeDrag.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleWindowKeydown = this.handleWindowKeydown.bind(this);
    this.handleWindowClicked = this.handleWindowClicked.bind(this);
    this.handleSvgClicked = this.handleSvgClicked.bind(this);
    this.handleNodeMouseDown = this.handleNodeMouseDown.bind(this);
    this.handleNodeMouseUp = this.handleNodeMouseUp.bind(this);
    this.handleNodeMouseEnter = this.handleNodeMouseEnter.bind(this);
    this.handleNodeMouseLeave = this.handleNodeMouseLeave.bind(this);
    this.arrowClicked = this.arrowClicked.bind(this);
    this.handleEdgeDrag = this.handleEdgeDrag.bind(this);
    this.handleEdgeMouseDown = this.handleEdgeMouseDown.bind(this);
    this.containZoom = this.containZoom.bind(this);
    this.handleZoom = this.handleZoom.bind(this);
    this.handleZoomToFit = this.handleZoomToFit.bind(this);
    this.modifyZoom = this.modifyZoom.bind(this);
    this.setZoom = this.setZoom.bind(this);
    this.getPathDescriptionStr = this.getPathDescriptionStr.bind(this);
    this.getPathDescription = this.getPathDescription.bind(this);
    this.getEdgeHandleTransformation = this.getEdgeHandleTransformation.bind(this);
    this.getNodeTransformation = this.getNodeTransformation.bind(this);
    this.getNodeStyle = this.getNodeStyle.bind(this);
    this.getEdgeStyle = this.getEdgeStyle.bind(this);
    this.getTextStyle = this.getTextStyle.bind(this);
    this.renderNodeText = this.renderNodeText.bind(this);
    this.renderEdges = this.renderEdges.bind(this);
    this.renderNodes = this.renderNodes.bind(this);
    this.renderView = this.renderView.bind(this);

    let defIndex = -1

    this.state = {
      viewTransform: d3.zoomIdentity,
      selectionChanged: false,
      focused: true,
      readOnly: props.readOnly || false,
      enableFocus: props.enableFocus || false, // Enables focus/unfocus
      edgeSwapQueue: [],    // Stores nodes to be swapped
      styles: makeStyles(props.primary, props.light, props.dark),
      nodeDefs: Object.keys(props.nodeTypes).map(function(type){
        defIndex += 1;
        return  React.cloneElement(props.nodeTypes[type].shape, {key: defIndex})
      }),                   // SVG definitions for nodes
      nodeSubtypeDefs: Object.keys(props.nodeSubtypes).map(function(type){
        defIndex += 1;
        return React.cloneElement(props.nodeSubtypes[type].shape, {key: defIndex})
      }),  
      edgeDefs: Object.keys(props.edgeTypes).map(function(type){
        defIndex += 1;
        return React.cloneElement(props.edgeTypes[type].shape, {key: defIndex})
      })                    // SVG definitions for edges
    };

    this.zoom = d3.zoom()
                  .scaleExtent([minZoom, maxZoom])
                  .on("zoom", this.handleZoom);
  }

  componentDidMount() {
    // Window event listeners for keypresses
    // and to control blur/focus of graph
    d3.select(window)
      .on('keydown', this.handleWindowKeydown)
      .on('click', this.handleWindowClicked);

    var svg = d3.select(this.refs.viewWrapper)
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
      }.bind(this), zoomDelay)
    }
  }

  componentWillUnmount() {
    // Remove window event listeners
    d3.select(window)
      .on('keydown', null)
      .on('click', null);
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

  hideEdge(edgeDOMNode){
    d3.select(edgeDOMNode)
      .attr("opacity", 0)
  }

  showEdge(edgeDOMNode){
    d3.select(edgeDOMNode)
      .attr("opacity", 1)
  }

  canSwap(sourceNode, hoveredNode, swapEdge){
    return swapEdge.source != sourceNode[this.props.nodeKey] ||
          swapEdge.target != hoveredNode[this.props.nodeKey]
  }

  drawEdge(sourceNode, target, swapErrBack){
    const self = this;
 
    const dragEdge = d3.select(this.refs.entities).append('svg:path')

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
          } else {
            swapErrBack()
          }
        } else {
          self.props.onCreateEdge(sourceNode, hoveredNode)
        }
      } else {
        if (swapErrBack){
          swapErrBack()
        }
      }
    }
  }

  dragNode(){
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
  handleNodeDrag() {
    if(this.state.drawingEdge && !this.state.readOnly){
      const target = {x: d3.event.subject.x, y: d3.event.subject.y }
      this.drawEdge(d3.event.subject, target )
    } else {
      this.dragNode()
    }
  }

  handleDelete(){
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

  handleWindowKeydown(d, i) {
    // Conditionally ignore keypress events on the window 
    // if the Graph isn't focused
    if (this.state.focused) {
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
  }

  handleWindowClicked(d, i) {
    if (this.state.focused && !event.target.ownerSVGElement){
      if (this.state.enableFocus){
        this.setState({
          focused: false
        });
      }
    }
  }

  handleSvgClicked(d, i) {
    if (!this.state.focused){
      this.setState({
        focused: true
      })
    }

    if (this.state.selectingNode) {
      this.setState({
        selectingNode: false
      })
    } else {

      this.props.onSelectNode(null);

      if (!this.state.readOnly && d3.event.shiftKey) {
        var xycoords = d3.mouse(event.target);
        this.props.onCreateNode(xycoords[0],xycoords[1]);
      }

    }
  }

  handleNodeMouseDown(d) {
    if (d3.event.defaultPrevented) return; // dragged

    if (d3.event.shiftKey) {

      this.setState({
        selectingNode: true,
        drawingEdge: true,
        focused: true
      })

    } else {
      this.setState({
        selectingNode: true,
        focused: true
      })
    }
  }

  handleNodeMouseUp(d) {

    if(this.state.selectingNode){
      this.props.onSelectNode(d);
      this.setState({selectingNode: false});
    }
  }

  handleNodeMouseEnter(d) {

    if (this.state.hoveredNode != d){
      this.setState({
        hoveredNode: d
      })
    }
  }

  handleNodeMouseLeave(d) {

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
  arrowClicked(d){

    if(event.target.tagName != 'path') return false; // If the handle is clicked

    const xycoords = d3.mouse(event.target);
    const target = this.props.getViewNode(d.target);
    const dist = getDistance({x: xycoords[0], y: xycoords[1]}, target);

    return dist < nodeSize/2 + edgeArrowSize + 10 // or *2 or ^2?
  }

  handleEdgeDrag(d) {
    if(!this.state.readOnly && this.state.drawingEdge ){
      const edgeDOMNode = event.target.parentElement;
      const sourceNode = this.props.getViewNode(d.source);
      const xycoords = d3.mouse(event.target)
      const target = {x: xycoords[0], y: xycoords[1]}

      this.hideEdge(edgeDOMNode);
      this.drawEdge(sourceNode, target, this.showEdge.bind(this, edgeDOMNode))      
    }
  }

  handleEdgeMouseDown(d) {

    if (!this.state.readOnly && this.arrowClicked(d)) {
      this.state.edgeSwapQueue.push(d)  // Set this edge aside for redrawing
      this.setState({
        drawingEdge: true,
        edgeSwapQueue: this.state.edgeSwapQueue,
        focused: true
      })
    } else{
      this.props.onSelectEdge(d);
      this.setState({
        focused: true
      })
    }
    
  }

  // Keeps 'zoom' contained
  containZoom() {
    d3.event.preventDefault();
  }

  // View 'zoom' handler
  handleZoom() {
    if (this.state.focused) {
      this.setState({
        viewTransform: d3.event.transform
      });
    }
  }

  // Zooms to contents of this.refs.entities
  handleZoomToFit() {
    const parent = d3.select(this.refs.viewWrapper).node();
    const entities = d3.select(this.refs.entities).node();
    
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

      if (next.k < minZoom){
        next.k = minZoom
      } else if (next.k > maxZoom){
        next.k = maxZoom
      }

      next.x = width / 2 - next.k * x;
      next.y = height / 2 - next.k * y;
    }
    else{
      next.k = (minZoom + maxZoom) / 2;
      next.x = 0
      next.y = 0;
    }

    this.setZoom(next.k, next.x, next.y, zoomDur)
  }

  // Updates current viewTransform with some delta
  modifyZoom(modK=0, modX=0, modY=0, dur=0){
    const parent = d3.select(this.refs.viewWrapper).node();
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
  setZoom(k=1, x=0, y=0, dur=0){

    var t = d3.zoomIdentity.translate(x, y).scale(k);

    d3.select(this.refs.viewWrapper).select('svg')
      .transition()
      .duration(dur)
      .call(this.zoom.transform, t);
  }

  /*
   * Render
   */
  // Returns the svg's path.d' (geometry description) string from edge data
  // edge.source and edge.target are node ids
  getPathDescriptionStr(sourceX, sourceY, targetX, targetY){
    return `M${sourceX},${sourceY}L${targetX},${targetY}`
  }

  getPathDescription(edge) {
    let src = this.props.getViewNode(edge.source);
    let trg = this.props.getViewNode(edge.target);

    if(src && trg){
      const off = nodeSize/2; // from the center of the node to the perimeter

      const theta = getTheta(src, trg);

      const xOff = off * Math.cos(theta);
      const yOff = off * Math.sin(theta);

      return this.getPathDescriptionStr(src.x + xOff, src.y + yOff, trg.x - xOff, trg.y - yOff )
    } 
    console.warn("Unable to get source or target for ", edge);
    return ""
  }

  getEdgeHandleTransformation(edge) {
    let src = this.props.getViewNode(edge.source);
    let trg = this.props.getViewNode(edge.target);

    let origin = getMidpoint(src, trg);
    let x = origin.x;
    let y = origin.y;
    let theta = getTheta(src, trg)*180/Math.PI;
    let offset = -edgeHandleSize/2;

    return `translate(${x}, ${y}) rotate(${theta}) translate(${offset}, ${offset})`
  }

  // Returns a d3 transformation string from node data
  getNodeTransformation(node) {
    return 'translate(' + node.x + ',' + node.y + ')';
  }

  getNodeStyle(d, selected){
    return d === selected ? 
      this.state.styles.node.selectedString : 
      this.state.styles.node.baseString
  }

  getEdgeStyle(d, selected){
    return d === selected ? 
      this.state.styles.edge.selectedString : 
      this.state.styles.edge.baseString
  }

  getTextStyle(d, selected){
    return d === selected ? 
      this.state.styles.text.selectedString : 
      this.state.styles.text.baseString
  }

  // Renders 'node.title' into node element
  renderNodeText(d, domNode) {
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
  renderEdges(entities, edges) {
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

    newEdges.append('path');
    newEdges.append("use");

    // Merge 
    edges.enter().merge(edges);

    // Update All
    edges
      .each(function(d, i, els) {

        let style = self.getEdgeStyle(d, self.props.selected);
        let trans = self.getEdgeHandleTransformation(d)
        d3.select(this)
          .attr("style", style)
          .select("use")
            .attr("xlink:href", function(d){ return self.props.edgeTypes[d.type].shapeId })
            .attr("width", edgeHandleSize)
            .attr("height", edgeHandleSize)
            .attr("transform", trans);
      })
      .select('path')
        .attr('d', this.getPathDescription);
  }

  // Renders 'nodes' into entities element
  renderNodes(entities, nodes) {
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
    
    newNodes.attr("style", this.state.styles.node.baseString)
      .on("mousedown", this.handleNodeMouseDown)
      .on("mouseup", this.handleNodeMouseUp)
      .on("mouseenter", this.handleNodeMouseEnter)
      .on("mouseleave", this.handleNodeMouseLeave)
      .call(d3.drag().on("start", this.handleNodeDrag));

    newNodes.append("use").classed("subtypeShape", true)
        .attr("x", -nodeSize/2).attr("y",  -nodeSize/2).attr("width", nodeSize).attr("height", nodeSize);

    newNodes.append("use").classed("shape", true)
        .attr("x", -nodeSize/2).attr("y",  -nodeSize/2).attr("width", nodeSize).attr("height", nodeSize);

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
        let style = self.getNodeStyle(d, self.props.selected);

        d3.select(this)
          .attr("style", style);

        if(d.subtype){
          d3.select(this).select("use.subtypeShape")
            .attr("xlink:href", function(d){ return self.props.nodeSubtypes[d.subtype].shapeId }); 
        } else {
          d3.select(this).select("use.subtypeShape")
            .attr("xlink:href", function(d){ return null }); 
        }

        d3.select(this).select("use.shape")
            .attr("xlink:href", function(d){ return self.props.nodeTypes[d.type].shapeId }); 

        self.renderNodeText(d, this);
      })
      .attr('transform', this.getNodeTransformation);
  }

  // Renders 'graph' into view element
  // All DOM updates within 'view' are managed by D3
  renderView() {
    var nodes = this.props.nodes;
    var edges = this.props.edges;

    // Update the view w/ new zoom/pan
    const view = d3.select(this.refs.view)
      .attr("transform", this.state.viewTransform);

    const entities = d3.select(this.refs.entities);

    this.renderNodes(entities, nodes);
    this.renderEdges(entities, edges);
  }

  render() {
    this.renderView();
    const styles = this.state.styles;

    return (
      <div  id='viewWrapper'
            ref='viewWrapper'
            style={[
              styles.wrapper.base,
              !!this.state.focused && styles.wrapper.focused,
              this.props.style
            ]}>
        <svg  id='svgRoot' 
              style={styles.svg.base}>
          <defs>

            {this.state.nodeDefs}
            {this.state.nodeSubtypeDefs}
            {this.state.edgeDefs}

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
          <g id='view' ref='view'>
            <rect className='background'
                  x={-gridSize/4}
                  y={-gridSize/4}
                  width={ gridSize }
                  height={ gridSize }
                  fill="url(#grid)">
            </rect>
            <g id='entities' ref='entities'></g>
          </g>

          }
        </svg>
        <GraphControls  primary={this.props.primary}
                        minZoom={minZoom} 
                        maxZoom={maxZoom} 
                        zoomLevel={this.state.viewTransform.k} 
                        zoomToFit={this.handleZoomToFit} 
                        modifyZoom={this.modifyZoom}>
        </GraphControls>
      </div>
    );
  }

}

GraphView.propTypes = {
  primary: React.PropTypes.string,
  light: React.PropTypes.string,
  dark: React.PropTypes.string,
  style: React.PropTypes.object,
  nodeKey: React.PropTypes.string.isRequired,
  emptyType: React.PropTypes.string.isRequired,
  nodes: React.PropTypes.array.isRequired,
  edges: React.PropTypes.array.isRequired,
  readOnly: React.PropTypes.bool,
  enableFocus: React.PropTypes.bool,
  selected: React.PropTypes.object.isRequired,
  nodeTypes: React.PropTypes.object.isRequired,
  nodeSubtypes: React.PropTypes.object.isRequired,
  edgeTypes: React.PropTypes.object.isRequired,
  getViewNode: React.PropTypes.func.isRequired,
  onSelectNode: React.PropTypes.func.isRequired,
  onCreateNode: React.PropTypes.func.isRequired,
  onUpdateNode: React.PropTypes.func.isRequired,
  canDeleteNode: React.PropTypes.func,
  onDeleteNode: React.PropTypes.func.isRequired,
  onSelectEdge: React.PropTypes.func.isRequired,
  canCreateEdge: React.PropTypes.func,
  onCreateEdge: React.PropTypes.func.isRequired,
  onSwapEdge: React.PropTypes.func.isRequired,
  canDeleteEdge: React.PropTypes.func,
  onDeleteEdge: React.PropTypes.func.isRequired,
  maxTitleChars: React.PropTypes.number, // Per line.
  transitionTime: React.PropTypes.number // D3 Enter/Exit duration
};

GraphView.defaultProps = {
  primary: 'dodgerblue',
  light: '#FFF',
  dark: '#000',
  readOnly: false,
  maxTitleChars: 9,
  transitionTime: 150,
  canDeleteNode: () => true,
  canCreateEdge: () => true,
  canDeleteEdge: () => true,
};

export default Radium(GraphView)
