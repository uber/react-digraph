// @flow
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

import * as d3 from 'd3';
import * as React from 'react';
import ReactDOM from 'react-dom';
import '../styles/main.scss';

import { LayoutEngines } from '../utilities/layout-engine/layout-engine-config';
import { type LayoutEngineType } from '../utilities/layout-engine/layout-engine-types';
import { type IGraphViewProps } from './graph-view-props';
import Background from './background';
import Defs from './defs';
import Edge, { type IEdge, type ITargetPosition } from './edge';
import GraphControls from './graph-controls';
import GraphUtils, { type INodeMapNode } from './graph-util';
import Node, { type INode, type IPoint } from './node';
import { Transform } from 'stream';

type IViewTransform = {
  k: number,
  x: number,
  y: number
}

type IGraphViewState = {
  viewTransform?: IViewTransform;
  hoveredNode: boolean;
  nodesMap: any;
  edgesMap: any;
  nodes: any[];
  edges: any[];
  selectingNode: boolean;
  hoveredNodeData: INode | null;
  edgeEndNode: INode | null;
  draggingEdge: boolean;
  draggedEdge: any;
  componentUpToDate: boolean;
  selectedEdgeObj: any;
  selectedNodeObj: any;
  documentClicked: boolean;
  svgClicked: boolean;
  focused: boolean;
};

class GraphView extends React.Component<IGraphViewProps, IGraphViewState> {
  static defaultProps = {
    canCreateEdge: (startNode?:INode, endNode?:INode) => true,
    canDeleteEdge: () => true,
    canDeleteNode: () => true,
    edgeArrowSize: 8,
    gridSpacing: 36,
    layoutEngineType: 'None',
    maxTitleChars: 9,
    maxZoom: 1.5,
    minZoom: 0.15,
    nodeSize: 154,
    readOnly: false,
    showGraphControls: true,
    zoomDelay: 1000,
    zoomDur: 750
  };

  static getDerivedStateFromProps(nextProps: IGraphViewProps, prevState: IGraphViewState) {
    const { edges, nodeKey } = nextProps;
    let nodes = nextProps.nodes;
    const nodesMap = GraphUtils.getNodesMap(nodes, nodeKey);
    const edgesMap = GraphUtils.getEdgesMap(edges);
    GraphUtils.linkNodesAndEdges(nodesMap, edges);

    const selectedNodeMap =
      nextProps.selected && nodesMap[`key-${nextProps.selected[nodeKey]}`]
        ? nodesMap[`key-${nextProps.selected[nodeKey]}`]
        : null;
    const selectedEdgeMap =
      nextProps.selected && edgesMap[`${nextProps.selected.source}_${nextProps.selected.target}`]
        ? edgesMap[`${nextProps.selected.source}_${nextProps.selected.target}`]
        : null;

    // Handle layoutEngine on initial render
    if (prevState.nodes.length === 0 && nextProps.layoutEngineType && LayoutEngines[nextProps.layoutEngineType]) {
      const layoutEngine = new LayoutEngines[nextProps.layoutEngineType](nextProps);
      const newNodes = layoutEngine.adjustNodes(nodes, nodesMap);
      nodes = newNodes;
    }

    const nextState = {
      componentUpToDate: true,
      edges,
      edgesMap,
      nodes,
      nodesMap,
      readOnly: nextProps.readOnly,
      selectedEdgeObj: {
        edge: selectedEdgeMap ? selectedEdgeMap.edge : null
      },
      selectedNodeObj: {
        nodeId: selectedNodeMap ? nextProps.selected[nodeKey] : null,
        node: selectedNodeMap ? selectedNodeMap.node : null
      },
      selectionChanged: false
    };

    return nextState;
  }

  nodeTimeouts: any;
  edgeTimeouts: any;
  renderNodesTimeout: any;
  renderEdgesTimeout: any;
  zoom: any;
  viewWrapper: React.RefObject<HTMLDivElement>;
  graphSvg: React.RefObject<SVGElement>;
  entities: any;
  selectedView: any;
  view: any;
  graphControls: any;
  layoutEngine: any;

  constructor(props: IGraphViewProps) {
    super(props);

    this.nodeTimeouts = {};
    this.edgeTimeouts = {};
    this.renderNodesTimeout = null;
    this.renderEdgesTimeout = null;
    this.viewWrapper = React.createRef();
    this.graphControls = React.createRef();
    this.graphSvg = React.createRef();

    if (props.layoutEngineType) {
      this.layoutEngine = new LayoutEngines[props.layoutEngineType](props);
    }

    this.state = {
      componentUpToDate: false,
      draggedEdge: null,
      draggingEdge: false,
      edgeEndNode: null,
      edges: [],
      edgesMap: {},
      hoveredNode: false,
      hoveredNodeData: null,
      nodes: [],
      nodesMap: {},
      selectedEdgeObj: null,
      selectedNodeObj: null,
      selectingNode: false,
      documentClicked: false,
      svgClicked: false,
      focused: true
    };
  }

  componentDidMount() {
    // TODO: can we target the element rather than the document?
    document.addEventListener('keydown', this.handleWrapperKeydown);
    document.addEventListener('click', this.handleDocumentClick);

    this.zoom = d3
      .zoom()
      .filter(this.zoomFilter)
      .scaleExtent([this.props.minZoom || 0, this.props.maxZoom || 0])
      .on('start', this.handleZoomStart)
      .on('zoom', this.handleZoom)
      .on('end', this.handleZoomEnd);

    d3
      .select(this.viewWrapper.current)
      .on('touchstart', this.containZoom)
      .on('touchmove', this.containZoom)
      .on('click', this.handleSvgClicked) // handle element click in the element components
      .select('svg')
      .call(this.zoom);

    this.selectedView = d3.select(this.view);

    // On the initial load, the 'view' <g> doesn't exist until componentDidMount.
    // Manually render the first view.
    this.renderView();

    setTimeout(() => {
      if (this.viewWrapper != null) {
        this.handleZoomToFit();
      }
    }, this.props.zoomDelay);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleWrapperKeydown);
    document.removeEventListener('click', this.handleDocumentClick);
  }

  shouldComponentUpdate(nextProps: IGraphViewProps, nextState: IGraphViewState) {
    if (
      nextProps.nodes !== this.props.nodes ||
      nextProps.edges !== this.props.edges ||
      !nextState.componentUpToDate ||
      nextProps.selected !== this.props.selected ||
      nextProps.readOnly !== this.props.readOnly ||
      nextProps.layoutEngineType !== this.props.layoutEngineType
    ) {
      return true;
    }
    return false;
  }

  componentDidUpdate(prevProps: IGraphViewProps, prevState: IGraphViewState) {
    const { nodesMap, edgesMap, nodes, selectedNodeObj, selectedEdgeObj } = this.state;
    const { layoutEngineType } = this.props;

    if (layoutEngineType && LayoutEngines[layoutEngineType]) {
      this.layoutEngine = new LayoutEngines[this.props.layoutEngineType](this.props);
      const newNodes = this.layoutEngine.adjustNodes(nodes, nodesMap);
      this.setState({
        nodes: newNodes
      });
    }

    const forceReRender = this.props.nodes !== prevProps.nodes || this.props.edges !== prevProps.edges

    // Note: the order is intentional
    // remove old edges
    this.removeOldEdges(prevState.edges, edgesMap);

    // remove old nodes
    this.removeOldNodes(prevState.nodes, prevState.nodesMap, nodesMap);

    // add new nodes
    this.addNewNodes(this.state.nodes, prevState.nodesMap, selectedNodeObj, prevState.selectedNodeObj, forceReRender);

    // add new edges
    this.addNewEdges(this.state.edges, prevState.edgesMap, selectedEdgeObj, prevState.selectedEdgeObj, forceReRender);

    this.setState({
      componentUpToDate: true
    });
  }

  getNodeById(id: string | null, nodesMap: any | null): INodeMapNode | null {
    const nodesMapVar = nodesMap || this.state.nodesMap
    return nodesMapVar ? nodesMapVar[`key-${id || ''}`] : null;
  }

  getEdgeBySourceTarget(source: string, target: string): IEdge | null {
    return this.state.edgesMap ? this.state.edgesMap[`${source}_${target}`] : null;
  }

  deleteEdgeBySourceTarget(source: string, target: string) {
    if (this.state.edgesMap && this.state.edgesMap[`${source}_${target}`]) {
      delete this.state.edgesMap[`${source}_${target}`];
    }
  }

  addNewNodes(nodes: INode[], oldNodesMap: any, selectedNode: any, prevSelectedNode: any, forceRender: boolean = false) {
    if (this.state.draggingEdge) {
      return;
    }
    const nodeKey = this.props.nodeKey;
    let node = null;
    let prevNode = null;

    GraphUtils.yieldingLoop(nodes.length, 50, (i) => {
      node = nodes[i];
      prevNode = this.getNodeById(node[nodeKey], oldNodesMap);
      // if there was a previous node and it changed
      if (prevNode != null && (
        prevNode.node !== node ||
        // GraphUtils.hasNodeShallowChanged(prevNode.node, node) ||
        ( // selection change
          selectedNode.node !== prevSelectedNode.node &&
          (
            (selectedNode.node && node[nodeKey] === selectedNode.node[nodeKey]) ||
            (prevSelectedNode.node && node[nodeKey] === prevSelectedNode.node[nodeKey])
          )
        )
      )) {
        // Updated node
        this.asyncRenderNode(node);
      } else if (forceRender || !prevNode) {
        // New node
        this.asyncRenderNode(node);
      }
    });
  }

  removeOldNodes(prevNodes: any, prevNodesMap: any, nodesMap: any) {
    const nodeKey = this.props.nodeKey;
    // remove old nodes
    // const prevNodeMapKeys = Object.keys(prevNodeMap);
    for (let i = 0; i < prevNodes.length; i++){
      const prevNode = prevNodes[i];
      const nodeId = prevNode[nodeKey];

      // Check for deletions
      if (this.getNodeById(nodeId, nodesMap)) {
        continue;
      }

      const prevNodeMapNode = this.getNodeById(nodeId, prevNodesMap)
      // remove all outgoing edges
      prevNodeMapNode.outgoingEdges.forEach((edge) => {
        this.removeEdgeElement(edge.source, edge.target);
      });

      // remove all incoming edges
      prevNodeMapNode.incomingEdges.forEach((edge) => {
        this.removeEdgeElement(edge.source, edge.target);
      });

      // remove node
      // The timeout avoids a race condition
      setTimeout(() => {
        GraphUtils.removeElementFromDom(`node-${nodeId}-container`);
      });
    }
  }

  addNewEdges(edges: IEdge[], oldEdgesMap: any, selectedEdge: any, prevSelectedEdge: any, forceRender: boolean = false) {
    if (!this.state.draggingEdge) {
      let edge = null;
      for (let i = 0; i < edges.length; i++){
        edge = edges[i];
        if (!edge.source || !edge.target) {
          continue;
        }
        const prevEdge = oldEdgesMap[`${edge.source}_${edge.target}`];
        if (forceRender ||
          !prevEdge ||
          ( // selection change
            selectedEdge !== prevSelectedEdge &&
            (
              (selectedEdge.edge && edge === selectedEdge.edge) ||
              (prevSelectedEdge.edge && prevSelectedEdge.edge)
            )
          )
        ) {
          // new edge
          this.asyncRenderEdge(edge);
        }
      }
    }
  }

  removeOldEdges = (prevEdges: IEdge[], edgesMap: any) => {
    // remove old edges
    let edge = null;
    for (let i = 0; i < prevEdges.length; i++){
      edge = prevEdges[i];
      // Check for deletions
      if (!edge.source ||
        !edge.target ||
        !edgesMap[`${edge.source}_${edge.target}`]) {
        // remove edge
        this.removeEdgeElement(edge.source, edge.target);
        continue;
      }
    }
  }

  removeEdgeElement(source: string, target: string) {
    const id = `${source}-${target}`;
    GraphUtils.removeElementFromDom(`edge-${id}-container`);
  }

  canSwap(sourceNode: INode, hoveredNode: INode | null, swapEdge: any) {
    return (
      hoveredNode &&
      sourceNode !== hoveredNode &&
      (swapEdge.source !== sourceNode[this.props.nodeKey] ||
        swapEdge.target !== hoveredNode[this.props.nodeKey])
    );
  }

  deleteNode(selectedNode: INode) {
    const { nodeKey } = this.props;
    const { nodes } = this.state;
    const nodeId = selectedNode[nodeKey];

    // delete from local state
    const newNodesArr = nodes.filter(node => node[nodeKey] !== nodeId);
    this.setState({
      componentUpToDate: false,
      hoveredNode: false
    });

    // remove from UI
    GraphUtils.removeElementFromDom(`node-${nodeId}-container`);

    // inform consumer
    this.props.onSelectNode(null);
    this.props.onDeleteNode(selectedNode, nodeId, newNodesArr);
  }

  deleteEdge(selectedEdge: IEdge) {
    const { edges } = this.state;
    if (!selectedEdge.source || !selectedEdge.target) {
      return;
    }
    let newEdgesArr = edges.filter(edge => {
      return !(edge.source === selectedEdge.source && edge.target === selectedEdge.target);
    });
    if (selectedEdge.source && selectedEdge.target) {
      this.deleteEdgeBySourceTarget(selectedEdge.source, selectedEdge.target);
    }

    this.setState({
      componentUpToDate: false,
      edges: newEdgesArr
    });

    // remove from UI
    if (selectedEdge.source && selectedEdge.target) {
      // remove extra custom containers just in case.
      GraphUtils.removeElementFromDom(`edge-${selectedEdge.source}-${selectedEdge.target}-custom-container`);
      GraphUtils.removeElementFromDom(`edge-${selectedEdge.source}-${selectedEdge.target}-container`);
    }

    // inform consumer
    this.props.onDeleteEdge(selectedEdge, newEdgesArr);
  }

  handleDelete = (selected: IEdge | INode) => {
    const { canDeleteNode, canDeleteEdge, readOnly } = this.props;
    if (readOnly || !selected) { return; }
    if (!selected.source && canDeleteNode && canDeleteNode(selected)) {
      // node
      // $FlowFixMe
      this.deleteNode(selected);
    } else if (selected.source && canDeleteEdge && canDeleteEdge(selected)) {
      // edge
      // $FlowFixMe
      this.deleteEdge(selected);
    }
  }

  handleWrapperKeydown: KeyboardEventListener = (d) => {
    const { selected, onUndo, onCopySelected, onPasteSelected } = this.props;
    const { focused, selectedNodeObj } = this.state;
    // Conditionally ignore keypress events on the window
    if (!focused) {
      return;
    }
    switch (d.key) {
      case 'Delete':
      case 'Backspace':
        if (selectedNodeObj) {
          this.handleDelete(selectedNodeObj.node || selected);
        }
        break;
      case 'z':
        if ((d.metaKey || d.ctrlKey) && onUndo) {
          onUndo();
        }
        break;
      case 'c':
        if ((d.metaKey || d.ctrlKey) && selectedNodeObj.node && onCopySelected) {
          onCopySelected();
        }
        break;
      case 'v':
        if ((d.metaKey || d.ctrlKey) && selectedNodeObj.node && onPasteSelected) {
          onPasteSelected();
        }
        break;
      default:
        break;
    }
  }

  handleEdgeSelected = (e) => {
    const { source, target } = e.target.dataset;
    let newState = {
      svgClicked: true,
      focused: true
    };
    if (source && target) {
      const edge: IEdge | null = this.getEdgeBySourceTarget(source, target);

      if (!edge) {
        return;
      }
      const originalArrIndex = (this.getEdgeBySourceTarget(source, target): any).originalArrIndex;
      const previousSelection = (this.state.selectedEdgeObj && this.state.selectedEdgeObj.edge) || null;
      newState = {
        ...newState,
        selectedEdgeObj: {
          componentUpToDate: false,
          edge: this.state.edges[originalArrIndex]
        }
      }
      this.setState(newState);
      this.props.onSelectEdge(this.state.edges[originalArrIndex]);
    } else {
      this.setState(newState);
    }
  }

  handleSvgClicked = (d: any, i: any) => {
    if (this.isPartOfEdge(d3.event.target)) {
      this.handleEdgeSelected(d3.event);
      return; // If any part of the edge is clicked, return
    }

    if (this.state.selectingNode) {
      this.setState({
        focused: true,
        selectingNode: false,
        svgClicked: true
      });
    } else {
      const previousSelection = (this.state.selectedNodeObj && this.state.selectedNodeObj.node) || null;
      const previousSelectionIndex = (this.state.selectedNodeObj && this.state.selectedNodeObj.index) || -1;

      // de-select the current selection
      this.setState({
        selectedNodeObj: null,
        focused: true,
        svgClicked: true
      });
      this.props.onSelectNode(null);
      if (previousSelection) {
        this.syncRenderNode(previousSelection);
      }

      if (!this.props.readOnly && d3.event.shiftKey) {
        const xycoords = d3.mouse(d3.event.target);
        this.props.onCreateNode(xycoords[0], xycoords[1], d3.event);
      }
    }
  }

  handleDocumentClick = (event: MouseEvent) => {
    // Ignore document click if it's in the SVGElement
    if (event &&
      event.target &&
      event.target.ownerSVGElement != null &&
      event.target.ownerSVGElement === this.graphSvg.current
    ) {
      return;
    }
    this.setState({
      documentClicked: true,
      focused: false,
      svgClicked: false
    });
  }

  isPartOfEdge(element) {
    return !!GraphUtils.findParent(element, '.edge-container');
  }

  handleNodeMove = (position: IPoint, nodeId: string, shiftKey: boolean) => {
    const { nodeKey, canCreateEdge, readOnly } = this.props;
    const nodeMapNode: INodeMapNode | null = this.getNodeById(nodeId);
    if (!nodeMapNode) {
      return;
    }
    const node = nodeMapNode.node;

    if (readOnly) {
      return;
    }
    if (!shiftKey && !this.state.draggingEdge) {
      // node moved
      node.x = position.x;
      node.y = position.y;

      // Update edges for node
      this.renderConnectedEdgesFromNode(nodeMapNode, true);
      this.asyncRenderNode(node);
    } else if ((canCreateEdge && canCreateEdge(nodeId)) || this.state.draggingEdge) {
      // render new edge
      this.syncRenderEdge({ source: nodeId, targetPosition: position });
      this.setState({ draggingEdge: true });
    }
  }

  createNewEdge() {
    const { canCreateEdge, nodeKey, onCreateEdge } = this.props;
    const { edgesMap, edgeEndNode, hoveredNodeData } = this.state;
    if (!hoveredNodeData) {
      return;
    }
    GraphUtils.removeElementFromDom('edge-custom-container');
    if (edgeEndNode) {
      const mapId1 = `${hoveredNodeData[nodeKey]}_${edgeEndNode[nodeKey]}`;
      const mapId2 = `${edgeEndNode[nodeKey]}_${hoveredNodeData[nodeKey]}`;
      if (
        edgesMap &&
        hoveredNodeData !== edgeEndNode &&
        canCreateEdge &&
        canCreateEdge(hoveredNodeData, edgeEndNode) &&
        !edgesMap[mapId1] &&
        !edgesMap[mapId2]
      ) {
        this.setState({
          componentUpToDate: false,
          draggedEdge: null,
          draggingEdge: false,
        });

        // we expect the parent website to set the selected property to the new edge when it's created
        onCreateEdge(hoveredNodeData, edgeEndNode);
      } else {
        // make the system understand that the edge creation process is done even though it didn't work.
        this.setState({
          edgeEndNode: null,
          draggingEdge: false,
        });
      }
    }
  }

  handleNodeUpdate = (position: any, nodeId: string, shiftKey: boolean) => {
    const { onUpdateNode, readOnly } = this.props;

    if (readOnly) {
      return;
    }

    // Detect if edge is being drawn and link to hovered node
    // This will handle a new edge
    if (shiftKey) {
      this.createNewEdge();
    } else {
      const nodeMap = this.getNodeById(nodeId);
      if (nodeMap) {
        Object.assign(nodeMap.node, position);
        onUpdateNode(nodeMap.node);
      }
    }
    // force a re-render
    this.setState({
      componentUpToDate: false,
      focused: true,
      // Setting hoveredNode to false here because the layout engine doesn't
      // fire the mouseLeave event when nodes are moved.
      hoveredNode: false,
      svgClicked: true,
    });
  }

  handleNodeMouseEnter = (event: any, data: any, hovered: boolean) => {
    // hovered is false when creating edges
    if (hovered && !this.state.hoveredNode) {
      this.setState({
        hoveredNode: true,
        hoveredNodeData: data
      });
    } else if (!hovered && this.state.hoveredNode && this.state.draggingEdge) {
      this.setState({
        edgeEndNode: data
      });
    } else {
      this.setState({
        hoveredNode: true,
        hoveredNodeData: data
      });
    }
  }

  handleNodeMouseLeave = (event: any, data: any) => {
    if (
      (d3.event && d3.event.toElement && GraphUtils.findParent(d3.event.toElement, '.node')) ||
      (event && event.relatedTarget && GraphUtils.findParent(event.relatedTarget, '.node')) ||
      (d3.event && d3.event.buttons === 1) ||
      (event && event.buttons === 1)
    ) {
      // still within a node
      return;
    }
    if (event && event.relatedTarget) {
      if (event.relatedTarget.classList.contains('edge-overlay-path')) {
        return;
      }
      this.setState({ hoveredNode: false, edgeEndNode: null });
    }
  }

  handleNodeSelected = (node: INode, nodeId: string, creatingEdge: boolean) => {
    // if creatingEdge then de-select nodes and select new edge instead
    const previousSelection = (this.state.selectedNodeObj && this.state.selectedNodeObj.node) || null;
    const previousSelectionIndex = previousSelection ? this.state.selectedNodeObj.index : -1;
    const newState = {
      componentUpToDate: false,
      selectedNodeObj: {
        nodeId,
        node
      }
    };
    this.setState(newState);

    if (!creatingEdge) {
      this.props.onSelectNode(node);
    }
  }

  // One can't attach handlers to 'markers' or obtain them from the event.target
  // If the click occurs within a certain radius of edge target, assume the click
  // occurred on the arrow
  isArrowClicked(edge: IEdge | null) {
    const { nodeSize, edgeArrowSize } = this.props;
    const eventTarget = d3.event.sourceEvent.target;
    const arrowSize = edgeArrowSize || 0;
    if (!edge || eventTarget.tagName !== 'path') {
      return false; // If the handle is clicked
    }

    const xycoords = d3.mouse(eventTarget);
    if (!edge.target) {
      return false;
    }
    const targetNodeMapNode = this.getNodeById(edge.target);
    const source = {
      x: xycoords[0],
      y: xycoords[1]
    };
    const edgeCoords = Edge.parsePathToXY(Edge.getEdgePathElement(edge, this.viewWrapper.current));

    // the arrow is clicked if the xycoords are within edgeArrowSize of edgeCoords.target[x,y]
    return (
      source.x < edgeCoords.target.x + arrowSize &&
      source.x > edgeCoords.target.x - arrowSize &&
      source.y < edgeCoords.target.y + arrowSize &&
      source.y > edgeCoords.target.y - arrowSize
    );
  }

  zoomFilter() {
    if (d3.event.button || d3.event.ctrlKey) {
      return false;
    }
    return true;
  }

  // Keeps 'zoom' contained
  containZoom() {
    const stop = d3.event.button || d3.event.ctrlKey;
    if (stop) {
      d3.event.stopImmediatePropagation(); // stop zoom
    }
  }

  handleZoomStart = () => {
    // Zoom start events also handle edge clicks. We need to determine if an edge
    // was clicked and deal with that scenario.
    const sourceEvent = d3.event.sourceEvent;

    if (
      // graph can't be modified
      this.props.readOnly ||
      // no sourceEvent, not an action on an element
      !sourceEvent ||
      // not a click event
      (sourceEvent && !sourceEvent.buttons) ||
      // not an edge click area
      (sourceEvent && !sourceEvent.target.classList.contains('edge-overlay-path'))
    ) {
      return false;
    }

    // Clicked on the edge.
    const { target } = sourceEvent;
    const edgeId = target.id;
    const edge = this.state.edgesMap && this.state.edgesMap[edgeId] ? this.state.edgesMap[edgeId].edge : null;

    // Only move edges if the arrow is dragged
    if (!this.isArrowClicked(edge) || !edge) {
      return false;
    }
    this.removeEdgeElement(edge.source, edge.target);
    this.setState({ draggingEdge: true, draggedEdge: edge });
    this.dragEdge(edge);
  }

  getMouseCoordinates() {
    let mouseCoordinates = [0, 0];
    if (this.selectedView) {
      mouseCoordinates = d3.mouse(this.selectedView.node());
    }
    return mouseCoordinates;
  }

  dragEdge(draggedEdge?: IEdge) {
    const { nodeSize, nodeKey } = this.props;
    draggedEdge = draggedEdge || this.state.draggedEdge;
    if (!draggedEdge) {
      return;
    }

    const mouseCoordinates = this.getMouseCoordinates();
    const targetPosition = {
      x: mouseCoordinates[0],
      y: mouseCoordinates[1]
    };
    const off = Edge.calculateOffset(nodeSize, (this.getNodeById(draggedEdge.source): any).node, targetPosition, nodeKey);
    targetPosition.x += off.xOff;
    targetPosition.y += off.yOff;
    this.syncRenderEdge({ source: draggedEdge.source, targetPosition });
    this.setState({
      draggedEdge,
      draggingEdge: true
    });
  }

  // View 'zoom' handler
  handleZoom = () => {
    const { draggingEdge, draggedEdge, hoveredNode } = this.state;
    const transform: IViewTransform = d3.event.transform;

    if (!draggingEdge) {
      d3.select(this.view).attr('transform', transform);

      // prevent re-rendering on zoom
      if (this.state.viewTransform !== transform) {
        this.setState({
          viewTransform: transform,
          draggedEdge: null,
          draggingEdge: false
        }, () => {
          // force the child components which are related to zoom level to update
          this.renderGraphControls();
        });
      }
    } else if (draggingEdge) {
      this.dragEdge();
      return false;
    }
  }

  handleZoomEnd = () => {
    const { draggingEdge, draggedEdge, edgeEndNode, edgesMap } = this.state;

    const { nodeKey } = this.props;
    if (!draggingEdge || !draggedEdge) {
      if (draggingEdge && !draggedEdge) {
        // This is a bad case, sometimes when the graph loses focus while an edge
        // is being created it doesn't set draggingEdge to false. This fixes that case.
        this.setState({
          draggingEdge: false
        });
      }
      return;
    }

    // Zoom start events also handle edge clicks. We need to determine if an edge
    // was clicked and deal with that scenario.
    const draggedEdgeCopy = { ...this.state.draggedEdge };

    // remove custom edge
    GraphUtils.removeElementFromDom('edge-custom-container');
    this.setState(
      {
        draggedEdge: null,
        draggingEdge: false,
        hoveredNode: false
      },
      () => {
        // handle creating or swapping edges
        const sourceNodeById = this.getNodeById(draggedEdge.source);
        const targetNodeById = this.getNodeById(draggedEdge.target);


        if (!sourceNodeById || !targetNodeById) {
          return;
        }
        const sourceNode = sourceNodeById.node;
        const { canSwapEdge, onSwapEdge } = this.props;
        if (
          edgeEndNode &&
          !this.getEdgeBySourceTarget(draggedEdge.source, edgeEndNode[nodeKey]) &&
            this.canSwap(sourceNode, edgeEndNode, draggedEdge)
            && (!canSwapEdge || canSwapEdge(sourceNode, edgeEndNode, draggedEdge))
        ) {
          // determine the target node and update the edge
          draggedEdgeCopy.target = edgeEndNode[nodeKey];
          this.syncRenderEdge(draggedEdgeCopy);
          onSwapEdge(
            sourceNodeById.node,
            edgeEndNode,
            draggedEdge
          );
        } else {
          // this resets the dragged edge back to its original position.
          this.syncRenderEdge(draggedEdge);
        }
      }
    );
  }

  // Zooms to contents of this.refs.entities
  handleZoomToFit = () => {
    const parent = d3.select(this.viewWrapper.current).node();
    const entities = d3.select(this.entities).node();
    const viewBBox = entities.getBBox ? entities.getBBox() : null;
    if (!viewBBox) { return; }

    const width = parent.clientWidth;
    const height = parent.clientHeight;
    const minZoom = this.props.minZoom || 0;
    const maxZoom = this.props.maxZoom || 2;

    const next = {
      k: (minZoom + maxZoom) / 2,
      x: 0,
      y: 0,
    };

    if (viewBBox.width > 0 && viewBBox.height > 0) {
      // There are entities
      const dx = viewBBox.width;
      const dy = viewBBox.height;
      const x = viewBBox.x + viewBBox.width / 2;
      const y = viewBBox.y + viewBBox.height / 2;
      next.k = 0.9 / Math.max(dx / width, dy / height);

      if (next.k < minZoom) {
        next.k = minZoom;
      } else if (next.k > maxZoom) {
        next.k = maxZoom;
      }

      next.x = width / 2 - next.k * x;
      next.y = height / 2 - next.k * y;
    }

    this.setZoom(next.k, next.x, next.y, this.props.zoomDur);
  }

  // Updates current viewTransform with some delta
  modifyZoom = (modK: number = 0, modX: number = 0, modY: number = 0, dur: number = 0) => {
    const parent = d3.select(this.viewWrapper.current).node();
    const center = {
      x: parent.clientWidth / 2,
      y: parent.clientHeight / 2
    };
    const extent = this.zoom.scaleExtent();
    const viewTransform: any = this.state.viewTransform;

    const next = {
      k: viewTransform.k,
      x: viewTransform.x,
      y: viewTransform.y
    };

    const targetZoom = next.k * (1 + modK);
    next.k = targetZoom;

    if (targetZoom < extent[0] || targetZoom > extent[1]) {
      return false;
    }

    const translate0 = {
      x: (center.x - next.x) / next.k,
      y: (center.y - next.y) / next.k
    };

    const l = {
      x: translate0.x * next.k + next.x,
      y: translate0.y * next.k + next.y
    };

    next.x += center.x - l.x + modX;
    next.y += center.y - l.y + modY;
    this.setZoom(next.k, next.x, next.y, dur);
    return true;
  }

  // Programmatically resets zoom
  setZoom(k: number = 1, x: number = 0, y: number = 0, dur: number = 0) {
    const t = d3.zoomIdentity.translate(x, y).scale(k);

    d3
      .select(this.viewWrapper.current)
      .select('svg')
      .transition()
      .duration(dur)
      .call(this.zoom.transform, t);
  }

  // Renders 'graph' into view element
  renderView() {
    // Update the view w/ new zoom/pan
    this.selectedView.attr('transform', this.state.viewTransform);

    clearTimeout(this.renderNodesTimeout);
    this.renderNodesTimeout = setTimeout(this.renderNodes);
  }

  renderBackground = () => {
    const { gridSize, backgroundFillId, renderBackground } = this.props;
    if (renderBackground) {
      return renderBackground(gridSize);
    } else {
      return <Background gridSize={gridSize} backgroundFillId={backgroundFillId} />;
    }
  }

  getNodeComponent = (id: string, node: INode) => {
    const { nodeTypes, nodeSubtypes, nodeSize, renderNode, renderNodeText, nodeKey } = this.props;
    return (
      <Node
        key={id}
        id={id}
        data={node}
        nodeTypes={nodeTypes}
        nodeSize={nodeSize}
        nodeKey={nodeKey}
        nodeSubtypes={nodeSubtypes}
        onNodeMouseEnter={this.handleNodeMouseEnter}
        onNodeMouseLeave={this.handleNodeMouseLeave}
        onNodeMove={this.handleNodeMove}
        onNodeUpdate={this.handleNodeUpdate}
        onNodeSelected={this.handleNodeSelected}
        renderNode={renderNode}
        renderNodeText={renderNodeText}
        isSelected={this.state.selectedNodeObj.node === node}
        layoutEngine={this.layoutEngine}
        viewWrapperElem={this.viewWrapper.current}
      />
    );
  }

  renderNode(id: string, element: Element) {
    if (!this.entities) {
      return null;
    }
    const containerId = `${id}-container`;
    let nodeContainer: HTMLElement | Element | null = document.getElementById(containerId);

    if (!nodeContainer) {
      nodeContainer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      nodeContainer.id = containerId;
      this.entities.appendChild(nodeContainer);
    }

    // ReactDOM.render replaces the insides of an element This renders the element
    // into the nodeContainer
    const anyElement: any = element;
    ReactDOM.render(anyElement, nodeContainer);
  }

  renderConnectedEdgesFromNode(node: INodeMapNode, nodeMoving: boolean = false) {
    if (this.state.draggingEdge) {
      return;
    }

    node.incomingEdges.forEach((edge) => {
      this.asyncRenderEdge(edge, nodeMoving);
    });
    node.outgoingEdges.forEach((edge) => {
      this.asyncRenderEdge(edge, nodeMoving);
    });
  }

  asyncRenderNode(node: INode) {
    const nodeKey = this.props.nodeKey;
    const timeoutId = `nodes-${node[nodeKey]}`;
    cancelAnimationFrame(this.nodeTimeouts[timeoutId]);
    this.nodeTimeouts[timeoutId] = requestAnimationFrame(() => {
      this.syncRenderNode(node);
    });
  }

  syncRenderNode(node: INode) {
    const nodeKey = this.props.nodeKey;
    const id = `node-${node[nodeKey]}`;
    const element: any = this.getNodeComponent(id, node);
    const nodesMapNode = this.getNodeById(node[nodeKey]);
    this.renderNode(id, element);
    if (nodesMapNode) {
      this.renderConnectedEdgesFromNode(nodesMapNode);
    }
  }

  renderNodes = () => {
    if (!this.entities) {
      return;
    }

    this.state.nodes.forEach((node, i) => {
      this.asyncRenderNode(node);
    });
  }

  isEdgeSelected = (edge: IEdge) => {
    return !!this.state.selectedEdgeObj &&
      !!this.state.selectedEdgeObj.edge &&
      this.state.selectedEdgeObj.edge.source === edge.source &&
      this.state.selectedEdgeObj.edge.target === edge.target;
  }

  getEdgeComponent = (edge: IEdge | any) => {
    const sourceNodeMapNode = this.getNodeById(edge.source);
    const sourceNode = sourceNodeMapNode ? sourceNodeMapNode.node : null;
    const targetNodeMapNode = this.getNodeById(edge.target);
    const targetNode = targetNodeMapNode ? targetNodeMapNode.node : null;
    const targetPosition = edge.targetPosition;
    const { edgeTypes, edgeHandleSize, nodeSize, nodeKey} = this.props;

    return (
      <Edge
        data={edge}
        edgeTypes={edgeTypes}
        edgeHandleSize={edgeHandleSize}
        nodeSize={nodeSize}
        sourceNode={sourceNode}
        targetNode={targetNode || targetPosition}
        nodeKey={nodeKey}
        viewWrapperElem={this.viewWrapper.current}
        isSelected={this.isEdgeSelected(edge)}
        edgeType={edge.edgeType}
      />
    );
  }


  renderEdge = (id: string, element: any, edge: IEdge, nodeMoving: boolean = false) => {
    if (!this.entities) {
      return null;
    }
    let containerId = `${id}-container`;
    const customContainerId = `${id}-custom-container`;
    const { draggedEdge } = this.state;
    const { afterRenderEdge } = this.props;
    let edgeContainer = document.getElementById(containerId);
    if (nodeMoving && edgeContainer) {
      edgeContainer.style.display = 'none';
      containerId = `${id}-custom-container`;
      edgeContainer = document.getElementById(containerId);
    } else if (edgeContainer) {
      const customContainer = document.getElementById(customContainerId);
      edgeContainer.style.display = '';
      if (customContainer) {
        customContainer.remove();
      }
    }
    if (!edgeContainer && edge !== draggedEdge) {
      const newSvgEdgeContainer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      newSvgEdgeContainer.id = containerId;
      this.entities.appendChild(newSvgEdgeContainer);
      edgeContainer = newSvgEdgeContainer;
    }
    // ReactDOM.render replaces the insides of an element This renders the element
    // into the edgeContainer
    if (edgeContainer) {
      ReactDOM.render(element, edgeContainer);
      if (afterRenderEdge) {
        return afterRenderEdge(id, element, edge, edgeContainer, this.isEdgeSelected(edge));
      }
    }
  }

  asyncRenderEdge = (edge: IEdge, nodeMoving: boolean = false) => {
    if (!edge.source || !edge.target) {
      return;
    }
    const timeoutId = `edges-${edge.source}-${edge.target}`;
    cancelAnimationFrame(this.edgeTimeouts[timeoutId]);
    this.edgeTimeouts[timeoutId] = requestAnimationFrame(() => {
      this.syncRenderEdge(edge, nodeMoving);
    });
  }


  syncRenderEdge(edge: IEdge | any, nodeMoving: boolean = false) {
    if (!edge.source) {
      return;
    }

    // We have to use the 'custom' id when we're drawing a new node
    const idVar = edge.target ? `${edge.source}-${edge.target}` : 'custom';
    const id = `edge-${idVar}`;
    const element = this.getEdgeComponent(edge);
    this.renderEdge(id, element, edge, nodeMoving);
  }


  renderEdges = () => {
    const { edges, draggingEdge } = this.state;
    if (!this.entities || draggingEdge) {
      return;
    }
    for (let i = 0; i < edges.length; i++){
      this.asyncRenderEdge(edges[i]);
    }
  }

  /*
   * GraphControls is a special child component. To maximize responsiveness we disable
   * rendering on zoom level changes, but this component still needs to update.
   * This function ensures that it updates into the container quickly upon zoom changes
   * without causing a full GraphView render.
   */
  renderGraphControls() {
    if (!this.props.showGraphControls || !this.viewWrapper) {
      return;
    }

    const graphControlsWrapper = this.viewWrapper.current.querySelector('.graph-controls-wrapper')
    if (graphControlsWrapper) {
      ReactDOM.render(
        <GraphControls
          ref={this.graphControls}
          minZoom={this.props.minZoom}
          maxZoom={this.props.maxZoom}
          zoomLevel={this.state.viewTransform ? this.state.viewTransform.k : 1}
          zoomToFit={this.handleZoomToFit}
          modifyZoom={this.modifyZoom}
        />,
        graphControlsWrapper
      );
    }
  }

  render() {
    const { edgeArrowSize, gridSpacing, gridDotSize, nodeTypes, nodeSubtypes, edgeTypes, renderDefs } = this.props;
    return (
      <div
        className="view-wrapper"
        ref={this.viewWrapper}
      >
        <svg className="graph" ref={this.graphSvg}>
          <Defs
            edgeArrowSize={edgeArrowSize}
            gridSpacing={gridSpacing}
            gridDotSize={gridDotSize}
            nodeTypes={nodeTypes}
            nodeSubtypes={nodeSubtypes}
            edgeTypes={edgeTypes}
            renderDefs={renderDefs}
          />
          <g className="view" ref={(el) => (this.view = el)}>
            {this.renderBackground()}

            <g className="entities" ref={(el) => (this.entities = el)} />
          </g>
        </svg>
        <div className="graph-controls-wrapper" />
      </div>
    );
  }
}

export default GraphView;
