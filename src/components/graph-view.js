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
import {
  type IGraphViewProps,
  type SelectionT,
  type IPoint,
} from './graph-view-props';
import Background from './background';
import Defs from './defs';
import Edge, { type IEdge } from './edge';
import GraphControls from './graph-controls';
import HighlightArea from './highlight-area';
import GraphUtils, { type INodeMapNode } from '../utilities/graph-util';
import Node, { type INode } from './node';
import {
  parsePathToXY,
  getEdgePathElement,
  calculateOffset,
} from '../helpers/edge-helpers';

type IViewTransform = {
  k: number,
  x: number,
  y: number,
};

type IBBox = {
  x: number,
  y: number,
  width: number,
  height: number,
};

type IGraphViewState = {
  viewTransform?: IViewTransform,
  hoveredNode: boolean,
  nodesMap: any,
  edgesMap: any,
  nodes: any[],
  edges: any[],
  selectingNode: boolean,
  hoveredNodeData: INode | null,
  edgeEndNode: INode | null,
  draggingEdge: boolean,
  draggedEdge: any,
  componentUpToDate: boolean,
  selectedEdgeObj: any,
  selectedNodeObj: any,
  documentClicked: boolean,
  svgClicked: boolean,
  focused: boolean,
  selectionStart?: IPoint | null,
  selectionEnd?: IPoint | null,
  mousePosition?: IPoint | null,
};

class GraphView extends React.Component<IGraphViewProps, IGraphViewState> {
  static defaultProps = {
    canCreateEdge: (startNode?: INode, endNode?: INode) => true,
    canSwapEdge: () => true,
    canDeleteSelected: () => true,
    allowMultiselect: true,
    allowCopyEdges: false,
    edgeArrowSize: 8,
    gridSpacing: 36,
    layoutEngineType: 'None',
    maxZoom: 1.5,
    minZoom: 0.15,
    nodeSize: 154,
    nodeWidth: 154,
    nodeHeight: 154,
    readOnly: false,
    showGraphControls: true,
    zoomDelay: 1000,
    zoomDur: 750,
    rotateEdgeHandle: true,
    centerNodeOnMove: true,
  };

  static getDerivedStateFromProps(
    nextProps: IGraphViewProps,
    prevState: IGraphViewState
  ) {
    const { edges, nodeKey } = nextProps;
    let nodes = nextProps.nodes;
    const nodesMap = GraphUtils.getNodesMap(nodes, nodeKey);
    const edgesMap = GraphUtils.getEdgesMap(edges);

    GraphUtils.linkNodesAndEdges(nodesMap, edges);

    // Handle layoutEngine on initial render
    if (
      prevState.nodes.length === 0 &&
      nextProps.layoutEngineType &&
      LayoutEngines[nextProps.layoutEngineType]
    ) {
      const layoutEngine = new LayoutEngines[nextProps.layoutEngineType](
        nextProps
      );

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
      selectionChanged: false,
    };

    return nextState;
  }

  nodeTimeouts: any;
  edgeTimeouts: any;
  renderNodesTimeout: any;
  renderEdgesTimeout: any;
  zoom: any;
  viewWrapper: any;
  graphSvg: any;
  entities: any;
  graphControlsWrapper: any;
  highlightAreaRef: any;
  selectedView: any;
  view: any;
  layoutEngine: any;

  constructor(props: IGraphViewProps) {
    super(props);

    this.nodeTimeouts = {};
    this.edgeTimeouts = {};
    this.renderNodesTimeout = null;
    this.renderEdgesTimeout = null;
    this.viewWrapper = React.createRef();
    this.graphSvg = React.createRef();
    this.highlightAreaRef = React.createRef();

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
      focused: true,
    };
  }

  componentDidMount() {
    const { initialBBox, zoomDelay, minZoom, maxZoom } = this.props;

    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('mousedown', this.handleDocumentClick, {
      capture: true,
      passive: true,
    });

    this.zoom = d3
      .zoom()
      .filter(this.zoomFilter.bind(this))
      .scaleExtent([minZoom || 0, maxZoom || 0])
      .on('start', () => {
        this.handleZoomStart(d3.event);
      })
      .on('zoom', () => {
        this.handleZoom(d3.event);
      })
      .on('end', this.handleZoomEnd);

    d3.select(this.viewWrapper.current)
      .on('touchstart', this.containZoom)
      .on('touchmove', this.containZoom)
      .on('click', this.handleSvgClicked) // handle element click in the element components
      .on('contextmenu', this.handleContextmenu)
      .select('svg')
      .call(this.zoom);

    d3.select(this.graphSvg.current)
      .on('mousedown', this.handleDocumentMouseDown)
      .on('mousemove', this.handleDocumentMouseMove);

    this.selectedView = d3.select(this.view);

    if (initialBBox) {
      // If initialBBox is set, we don't compute the zoom and don't do any transition.
      this.handleZoomToFitImpl(initialBBox, 0);
      this.renderView();

      return;
    }

    // On the initial load, the 'view' <g> doesn't exist until componentDidMount.
    // Manually render the first view.
    this.renderView();
    setTimeout(() => {
      if (this.viewWrapper.current != null) {
        this.handleZoomToFit();
      }
    }, zoomDelay);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('click', this.handleDocumentClick);
  }

  shouldComponentUpdate(
    nextProps: IGraphViewProps,
    nextState: IGraphViewState
  ) {
    const {
      nodes,
      edges,
      selected,
      readOnly,
      layoutEngineType,
      allowMultiselect,
    } = this.props;
    const { selectionEnd } = this.state;

    return (
      nextProps.nodes !== nodes ||
      nextProps.edges !== edges ||
      !nextState.componentUpToDate ||
      nextProps.selected !== selected ||
      nextProps.readOnly !== readOnly ||
      nextProps.layoutEngineType !== layoutEngineType ||
      nextProps.allowMultiselect !== allowMultiselect ||
      !GraphUtils.isEqual(nextState.selectionEnd, selectionEnd) // multi-selection active
    );
  }

  componentDidUpdate(prevProps: IGraphViewProps, prevState: IGraphViewState) {
    const { nodesMap, edgesMap } = this.state;
    const { allowMultiselect, selected } = this.props;

    this.layoutEngineAdjustNodes();

    const forceReRender = this.hasLayoutEngine();

    // Note: the order is intentional
    // remove old edges
    this.removeOldEdges(prevState.edges, edgesMap);

    // remove old nodes
    this.removeOldNodes(prevState.nodes, prevState.nodesMap, nodesMap);

    // add new nodes
    this.addNewNodes(
      this.state.nodes,
      prevState.nodesMap,
      selected,
      prevProps.selected,
      forceReRender
    );

    // add new edges
    this.addNewEdges(
      this.state.edges,
      prevState.edgesMap,
      selected,
      prevProps.selected,
      forceReRender
    );

    if (prevProps.allowMultiselect !== allowMultiselect) {
      this.renderGraphControls();
    }

    this.setState({
      componentUpToDate: true,
    });
  }

  // returns true if Ctrl or Cmd is pressed
  isControlKeyPressed(event: any) {
    return event.metaKey || event.ctrlKey;
  }

  hasLayoutEngine() {
    const { layoutEngineType } = this.props;

    return !!(layoutEngineType && LayoutEngines[layoutEngineType]);
  }

  layoutEngineAdjustNodes() {
    const { layoutEngineType } = this.props;
    const { nodes, nodesMap } = this.state;

    if (nodes && layoutEngineType && this.hasLayoutEngine()) {
      this.layoutEngine = new LayoutEngines[layoutEngineType](this.props);
      const newNodes = this.layoutEngine.adjustNodes(nodes, nodesMap);

      this.setState({
        nodes: newNodes,
      });
    }
  }

  getNodeById(id: string | null, nodesMap: any | null): INodeMapNode | null {
    const nodesMapVar = nodesMap || this.state.nodesMap;

    return nodesMapVar ? nodesMapVar[`key-${id != null ? id : ''}`] : null;
  }

  getEdgeBySourceTarget(source: string, target: string): IEdge | null {
    return this.state.edgesMap
      ? this.state.edgesMap[`${source}_${target}`]
      : null;
  }

  addNewNodes(
    nodes: INode[],
    oldNodesMap: any,
    selected?: SelectionT | null,
    prevSelected?: SelectionT | null,
    forceRender: boolean = false
  ) {
    if (this.state.draggingEdge) {
      return;
    }

    const nodeKey = this.props.nodeKey;
    let node = null;
    let prevNode = null;
    let selectedNode = null;
    let prevSelectedNode = null;

    GraphUtils.yieldingLoop(nodes.length, 50, i => {
      node = nodes[i];
      prevNode = this.getNodeById(node[nodeKey], oldNodesMap);
      selectedNode = selected?.nodes?.get(node[nodeKey]);
      prevSelectedNode = selected?.nodes?.get(node[nodeKey]);

      // if there was a previous node and it changed
      if (
        prevNode != null &&
        (!GraphUtils.isEqual(prevNode.node, node) ||
          (selectedNode !== prevSelectedNode &&
            selectedNode &&
            node[nodeKey] === selectedNode[nodeKey]) ||
          (prevSelectedNode && node[nodeKey] === prevSelectedNode[nodeKey]))
      ) {
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
    for (let i = 0; i < prevNodes.length; i++) {
      const prevNode = prevNodes[i];
      const nodeId = prevNode[nodeKey];

      // Check for deletions
      if (this.getNodeById(nodeId, nodesMap)) {
        continue;
      }

      const prevNodeMapNode = this.getNodeById(nodeId, prevNodesMap);

      if (prevNodeMapNode) {
        // remove all outgoing edges
        prevNodeMapNode.outgoingEdges.forEach(edge => {
          this.removeEdgeElement(edge.source, edge.target);
        });

        // remove all incoming edges
        prevNodeMapNode.incomingEdges.forEach(edge => {
          this.removeEdgeElement(edge.source, edge.target);
        });
      }

      // remove node
      const timeoutId = `nodes-${nodeId}`;

      // cancel an asyncRenderNode animation
      cancelAnimationFrame(this.nodeTimeouts[timeoutId]);

      GraphUtils.removeElementFromDom(
        `node-${nodeId}-container`,
        this.viewWrapper.current
      );
    }
  }

  addNewEdges(
    edges: IEdge[],
    oldEdgesMap: any,
    selected?: SelectionT | null,
    prevSelected?: SelectionT | null,
    forceRender: boolean = false
  ) {
    if (!this.state.draggingEdge) {
      let edge = null;
      let edgeID = null;
      let prevEdge = null;
      const selectedEdge = null;
      const prevSelectedEdge = null;

      GraphUtils.yieldingLoop(edges.length, 50, i => {
        edge = edges[i];

        if (edge.source == null || !edge.target == null) {
          return;
        }

        edgeID = `${edge.source}_${edge.target}`;
        prevEdge = oldEdgesMap[edgeID];

        if (
          forceRender ||
          !prevEdge || // selection change
          !GraphUtils.isEqual(prevEdge.edge, edge) ||
          edge === selectedEdge ||
          (prevSelectedEdge && edge === prevSelectedEdge)
        ) {
          // new edge
          this.asyncRenderEdge(edge);
        }
      });
    }
  }

  removeOldEdges = (prevEdges: IEdge[], edgesMap: any) => {
    // remove old edges
    let edge = null;

    for (let i = 0; i < prevEdges.length; i++) {
      edge = prevEdges[i];

      // Check for deletions
      if (
        edge.source == null ||
        edge.target == null ||
        !edgesMap[`${edge.source}_${edge.target}`]
      ) {
        // remove edge
        this.removeEdgeElement(edge.source, edge.target);
        continue;
      }
    }
  };

  removeEdgeElement(source: string, target: string) {
    const id = `${source}-${target}`;

    GraphUtils.removeElementFromDom(
      `edge-${id}-container`,
      this.viewWrapper.current
    );
  }

  canSwap(sourceNode: INode, hoveredNode: INode | null, swapEdge: any) {
    const { canSwapEdge } = this.props;

    return (
      hoveredNode &&
      sourceNode !== hoveredNode &&
      (swapEdge.source !== sourceNode[this.props.nodeKey] ||
        swapEdge.target !== hoveredNode[this.props.nodeKey]) &&
      canSwapEdge &&
      canSwapEdge(sourceNode, hoveredNode, swapEdge)
    );
  }

  deleteNode(selectedNode: INode) {
    const { nodeKey } = this.props;
    const nodeID = selectedNode[nodeKey];

    this.setState({
      componentUpToDate: false,
      hoveredNode: false,
    });

    // remove from UI
    GraphUtils.removeElementFromDom(
      `node-${nodeID}-container`,
      this.viewWrapper.current
    );
  }

  deleteEdge(selectedEdge: IEdge) {
    const { source, target } = selectedEdge;

    if (source == null || target == null) {
      return;
    }

    this.setState({
      componentUpToDate: false,
    });

    // remove from UI
    if (selectedEdge.source != null && selectedEdge.target != null) {
      // remove extra custom containers just in case.
      GraphUtils.removeElementFromDom(
        `edge-${selectedEdge.source}-${selectedEdge.target}-custom-container`,
        this.viewWrapper.current
      );
      GraphUtils.removeElementFromDom(
        `edge-${selectedEdge.source}-${selectedEdge.target}-container`,
        this.viewWrapper.current
      );
    }
  }

  handleDelete = (selected: SelectionT) => {
    const {
      canDeleteSelected,
      readOnly,
      onDeleteSelected,
      onSelect,
    } = this.props;

    if (readOnly || (!selected?.nodes?.size && !selected?.edges?.size)) {
      return;
    }

    if (canDeleteSelected && canDeleteSelected(selected)) {
      selected.nodes?.forEach(node => {
        // node
        this.deleteNode(node);
      });
      selected.edges?.forEach(edge => {
        // edge
        this.deleteEdge(edge);
      });

      onDeleteSelected && onDeleteSelected(selected);
      onSelect && onSelect({ nodes: null, edges: null });
    }
  };

  handleKeyDown: KeyboardEventListener = d => {
    const {
      selected,
      disableBackspace,
      allowCopyEdges,
      onUndo,
      onCopySelected,
      onPasteSelected,
    } = this.props;
    const { focused, mousePosition } = this.state;

    // Conditionally ignore keypress events on the window
    if (!focused) {
      return;
    }

    switch (d.key) {
      case 'Delete':
      case 'Backspace':
        if (d.key === 'Backspace' && disableBackspace) {
          break;
        }

        if (selected && (selected.nodes?.size || selected.edges?.size)) {
          this.handleDelete(selected);
        }

        break;
      case 'z':
        if (this.isControlKeyPressed(d) && onUndo) {
          onUndo();
        }

        break;
      case 'c':
        if (
          this.isControlKeyPressed(d) &&
          (selected?.nodes?.size || (allowCopyEdges && selected?.edges?.size))
        ) {
          onCopySelected && onCopySelected();
        }

        break;
      case 'v':
        if (this.isControlKeyPressed(d) && selected) {
          const { x, y } = mousePosition || { x: 0, y: 0 };

          onPasteSelected && onPasteSelected(selected, { x, y });
        }

        break;
      default:
        break;
    }
  };

  handleEdgeSelected = (e: any) => {
    const { source, target } = e.target.dataset;
    const { onSelect } = this.props;
    let newState = {
      svgClicked: true,
      focused: true,
    };

    if (source != null && target != null) {
      const edge: IEdge | null = this.getEdgeBySourceTarget(source, target);

      if (edge == null) {
        return;
      }

      const originalArrIndex = (this.getEdgeBySourceTarget(source, target): any)
        .originalArrIndex;

      newState = {
        ...newState,
        selectedEdgeObj: {
          componentUpToDate: false,
          edge: this.state.edges[originalArrIndex],
        },
      };
      this.setState(newState);

      const selectedEdge = this.state.edges[originalArrIndex];
      const selectedEdgeID = `${selectedEdge.source}_${selectedEdge.target}`;

      onSelect &&
        onSelect({
          nodes: null,
          edges: new Map([[selectedEdgeID, selectedEdge]]),
        });
    } else {
      this.setState(newState);
    }
  };

  handleMultipleSelected = (selectionStart: IPoint, selectionEnd: IPoint) => {
    const { nodes, nodeKey, onSelect } = this.props;
    const { edgesMap } = this.state;

    // Get nodes within selection area
    const selectedNodesMap = GraphUtils.findNodesWithinArea(
      selectionStart,
      selectionEnd,
      nodes,
      nodeKey
    );
    const selectedEdgesMap = GraphUtils.findConnectedEdgesForNodes(
      selectedNodesMap,
      edgesMap,
      nodeKey
    );

    onSelect &&
      onSelect({
        nodes: selectedNodesMap,
        edges: selectedEdgesMap,
      });
  };

  handleSvgClicked = (d: any, i: any) => {
    const {
      onBackgroundClick,
      onSelect,
      readOnly,
      onCreateNode,
      onPasteSelected,
      selected,
    } = this.props;
    const { selectingNode, selectionStart, selectionEnd } = this.state;
    const { event } = d3;

    if (this.isPartOfEdge(event.target)) {
      this.handleEdgeSelected(event);

      return; // If any part of the edge is clicked, return
    }

    // Check if selecting multiple nodes
    if (
      event.shiftKey &&
      this.isControlKeyPressed(event) &&
      selectionStart &&
      selectionEnd
    ) {
      this.handleMultipleSelected(selectionStart, selectionEnd);

      this.setState({
        selectionStart: null,
        selectionEnd: null,
      });

      return;
    }

    // Check if selecting a node
    if (selectingNode) {
      this.setState({
        focused: true,
        selectingNode: false,
        svgClicked: true,
      });

      return;
    }

    if (
      !d3.event.shiftKey &&
      onBackgroundClick &&
      d3.event.target.classList.contains('background')
    ) {
      const xycoords = d3.mouse(d3.event.target);

      onBackgroundClick(xycoords[0], xycoords[1], d3.event);
    }

    // Clicking with ctrl will paste
    if (
      onPasteSelected &&
      !readOnly &&
      this.isControlKeyPressed(d3.event) &&
      selected?.nodes?.size
    ) {
      const xycoords = d3.mouse(d3.event.target);

      onPasteSelected(selected, { x: xycoords[0], y: xycoords[1] });

      return;
    }

    if (!readOnly && d3.event.shiftKey && onCreateNode) {
      const xycoords = d3.mouse(d3.event.target);

      onCreateNode(xycoords[0], xycoords[1], d3.event);

      return;
    }

    // de-select the current selection
    this.setState({
      selectedNodeObj: null,
      focused: true,
      svgClicked: true,
    });

    onSelect && onSelect({ nodes: null, edges: null });
  };

  handleContextmenu = () => {
    const { onContextMenu } = this.props;

    if (typeof onContextMenu === 'function') {
      const xycoords = d3.mouse(d3.event.target);

      onContextMenu(xycoords[0], xycoords[1], d3.event);
    }
  };

  handleDocumentClick = (event: any) => {
    // Ignore document click if it's in the SVGElement
    if (
      event &&
      event.target &&
      event.target.ownerSVGElement != null &&
      event.target.ownerSVGElement === this.graphSvg.current
    ) {
      return;
    }

    this.setState({
      documentClicked: true,
      focused: false,
      svgClicked: false,
    });
  };

  handleDocumentMouseDown = () => {
    const { selectionStart } = this.state;
    const { allowMultiselect } = this.props;
    const { event } = d3;

    // Check if selecting multiple nodes
    if (allowMultiselect && event.shiftKey && this.isControlKeyPressed(event)) {
      const [x, y] = d3.mouse(this.highlightAreaRef.current || event.target);

      if (!selectionStart) {
        this.setState({
          selectionStart: { x, y },
        });
      }

      return;
    }
  };

  handleDocumentMouseMove = () => {
    const { allowMultiselect } = this.props;
    const { event } = d3;
    const [x, y] = d3.mouse(this.highlightAreaRef.current || event.target);
    let newState = {
      mousePosition: { x, y },
    };

    // Check if selecting multiple nodes
    if (allowMultiselect) {
      if (event.shiftKey && this.isControlKeyPressed(event)) {
        newState = {
          ...newState,
          selectionEnd: { x, y },
        };
      } else {
        // This can happen if the mouse is released outside of the
        // graph area. We should clear the selection because the
        // keys are no longer depressed
        newState = {
          ...newState,
          selectionStart: null,
          selectionEnd: null,
        };
      }
    }

    this.setState(newState);
  };

  isPartOfEdge(element: any) {
    return !!GraphUtils.findParent(element, '.edge-container', 'svg.graph');
  }

  handleNodeMove = (position: IPoint, nodeId: string, shiftKey: boolean) => {
    const { canCreateEdge, readOnly, selected, nodeKey, onSelect } = this.props;
    const { draggingEdge, nodesMap } = this.state;
    const nodeMapNode: INodeMapNode | null = this.getNodeById(nodeId);

    if (!nodeMapNode || readOnly) {
      return;
    }

    const node = nodeMapNode.node;

    if (!shiftKey && !draggingEdge) {
      const originalX = node.x || 0;
      const originalY = node.y || 0;

      node.x = position.x;
      node.y = position.y;

      // Single node moved
      // Update edges for node
      this.asyncRenderNode(node);

      if (selected?.nodes?.size) {
        const foundNodeInSelectedNodes = selected?.nodes?.has(node[nodeKey]);

        if (!foundNodeInSelectedNodes) {
          this.setState({
            selectedNodeObj: null,
          });
          onSelect && onSelect({ nodes: null, edges: null });
        } else {
          // Position of moved node is at mouse location,
          // all other nodes are relative to the moved node.
          selected?.nodes?.forEach((current, key) => {
            const selectedNodeID = key;

            // skip the moved node
            if (selectedNodeID === node[nodeKey]) {
              return;
            }

            const selectedNodeMapNode = this.getNodeById(selectedNodeID);

            if (!selectedNodeMapNode) {
              // this should never happen
              return;
            }

            const selectedNode = selectedNodeMapNode.node;

            const newX = position.x + ((selectedNode.x || 0) - originalX);
            const newY = position.y + ((selectedNode.y || 0) - originalY);

            selectedNode.x = newX;
            selectedNode.y = newY;

            this.asyncRenderNode(selectedNode);
          });
        }
      }

      // force the state to update with the new node information
      this.setState({
        nodesMap: {
          ...nodesMap,
        },
        componentUpToDate: false,
      });
    } else if ((canCreateEdge && canCreateEdge(node)) || shiftKey) {
      // render new edge
      this.syncRenderEdge({ source: nodeId, targetPosition: position });
      this.setState({ draggingEdge: true });
    }
  };

  removeCustomEdge = () => {
    GraphUtils.removeElementFromDom(
      'edge-custom-container',
      this.viewWrapper.current
    );
  };

  endDragEdge = (extraState: any = {}, callback: () => void = () => {}) => {
    this.setState(
      {
        ...extraState,
        componentUpToDate: false,
        draggedEdge: null,
        draggingEdge: false,
      },
      callback
    );
  };

  createNewEdge() {
    const { canCreateEdge, nodeKey, onCreateEdge } = this.props;
    const { edgesMap, edgeEndNode, hoveredNodeData } = this.state;

    if (!hoveredNodeData) {
      return;
    }

    this.removeCustomEdge();

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
        this.endDragEdge();

        // we expect the parent website to set the selected property to the new edge when it's created
        if (onCreateEdge) {
          onCreateEdge(hoveredNodeData, edgeEndNode);
        }
      } else {
        // make the system understand that the edge creation process is done even though it didn't work.
        this.endDragEdge({ edgeEndNode: null });
      }
    }
  }

  handleNodeUpdate = (
    position: IPoint,
    nodeId: string,
    shiftKey: boolean
  ): Promise<any> => {
    const { onUpdateNode, readOnly, selected, nodeKey } = this.props;
    const { draggingEdge, hoveredNode, edgeEndNode } = this.state;

    if (readOnly) {
      return Promise.resolve();
    }

    // Detect if edge is being drawn and link to hovered node
    // This will handle a new edge
    let onUpdateNodePromise = Promise.resolve();

    if (shiftKey && hoveredNode && edgeEndNode) {
      this.createNewEdge();
    } else {
      if (draggingEdge) {
        this.removeCustomEdge();
        this.endDragEdge();
      }

      const nodeMap = this.getNodeById(nodeId);

      if (nodeMap) {
        if (this.hasLayoutEngine()) {
          this.layoutEngineAdjustNodes();
        } else {
          Object.assign(nodeMap.node, position);
          this.renderConnectedEdgesFromNode(nodeMap, true);
        }

        if (onUpdateNode) {
          let updatedNodes = new Map();

          if (selected?.nodes?.size) {
            selected?.nodes?.forEach((selectedNode, key) => {
              const node = this.getNodeById(key)?.node;

              if (node) {
                updatedNodes.set(selectedNode[nodeKey], node);
              }
            });
          } else if (selected?.nodes?.size) {
            updatedNodes = selected?.nodes || new Map();
          }

          onUpdateNodePromise =
            onUpdateNode(nodeMap.node, updatedNodes, position) ||
            Promise.resolve();
        }
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

    return onUpdateNodePromise;
  };

  handleNodeMouseEnter = (event: any, data: any) => {
    const { draggingEdge, hoveredNodeData } = this.state;

    // hovered is false when creating edges
    if (hoveredNodeData && data !== hoveredNodeData && draggingEdge) {
      this.setState({
        edgeEndNode: data,
      });
    } else {
      this.setState({
        hoveredNode: true,
        hoveredNodeData: data,
      });
    }
  };

  handleNodeMouseLeave = (event: any, data: any) => {
    this.setState({
      edgeEndNode: null,
    });
  };

  handleNodeSelected = (
    node: INode,
    nodeId: string,
    creatingEdge: boolean,
    event?: any
  ) => {
    const { selected, onSelect, nodeKey, allowMultiselect } = this.props;
    const newState = {
      componentUpToDate: false,
      selectedNodeObj: {
        nodeId,
        node,
      },
    };

    this.setState(newState);

    if (!creatingEdge) {
      let foundSelectedNode = false;

      if (allowMultiselect) {
        // If a group of nodes are selected, then clicking
        // one of the nodes in the group shouldn't deselect it,
        // instead the user must click something else.
        foundSelectedNode = selected?.nodes?.has(node[nodeKey]);
      }

      if (!foundSelectedNode) {
        onSelect &&
          onSelect(
            {
              nodes: new Map([[node[nodeKey], node]]),
              edges: null,
            },
            event
          );
      }
    }
  };

  // One can't attach handlers to 'markers' or obtain them from the event.target
  // If the click occurs within a certain radius of edge target, assume the click
  // occurred on the arrow
  isArrowClicked(edge: IEdge | null) {
    const { edgeArrowSize, onArrowClicked } = this.props;
    const eventTarget = d3.event.sourceEvent.target;
    const arrowSize = edgeArrowSize || 0;

    if (!edge || eventTarget.tagName !== 'path') {
      return false; // If the handle is clicked
    }

    const xycoords = d3.mouse(eventTarget);

    if (edge.target == null) {
      return false;
    }

    const source = {
      x: xycoords[0],
      y: xycoords[1],
    };
    const edgeCoords = parsePathToXY(
      getEdgePathElement(edge, this.viewWrapper.current)
    );

    // the arrow is clicked if the xycoords are within edgeArrowSize of edgeCoords.target[x,y]

    if (onArrowClicked) {
      if (
        source.x < edgeCoords.target.x + arrowSize &&
        source.x > edgeCoords.target.x - arrowSize &&
        source.y < edgeCoords.target.y + arrowSize &&
        source.y > edgeCoords.target.y - arrowSize
      ) {
        onArrowClicked(edge);
      }
    }

    return (
      source.x < edgeCoords.target.x + arrowSize &&
      source.x > edgeCoords.target.x - arrowSize &&
      source.y < edgeCoords.target.y + arrowSize &&
      source.y > edgeCoords.target.y - arrowSize
    );
  }

  zoomFilter() {
    if (d3.event.button || this.isControlKeyPressed(d3.event)) {
      return false;
    }

    return true;
  }

  // Keeps 'zoom' contained
  containZoom() {
    const stop = d3.event.button || this.isControlKeyPressed(d3.event);

    if (stop) {
      d3.event.stopImmediatePropagation(); // stop zoom
    }
  }

  handleZoomStart = (event: any) => {
    // Zoom start events also handle edge clicks. We need to determine if an edge
    // was clicked and deal with that scenario.
    const { sourceEvent } = event;

    if (
      // graph can't be modified
      this.props.readOnly ||
      // no sourceEvent, not an action on an element
      !sourceEvent ||
      // not a click event
      (sourceEvent && !sourceEvent.buttons)
    ) {
      return false;
    }

    // Test for edge click events
    if (sourceEvent && !sourceEvent.target.matches('.edge-overlay-path')) {
      // not an edge click area
      return false;
    }

    // Clicked on the edge.
    const { target } = sourceEvent;
    const edgeId = target.id;
    const edge =
      this.state.edgesMap && this.state.edgesMap[edgeId]
        ? this.state.edgesMap[edgeId].edge
        : null;

    // Only move edges if the arrow is dragged
    if (!this.isArrowClicked(edge) || !edge) {
      return false;
    }

    this.removeEdgeElement(edge.source, edge.target);
    this.setState({ draggingEdge: true, draggedEdge: edge });
    this.dragEdge(edge, d3.mouse);
  };

  getMouseCoordinates(mouse: typeof d3.mouse) {
    let mouseCoordinates = [0, 0];

    if (this.selectedView && mouse) {
      mouseCoordinates = mouse(this.selectedView.node());
    }

    return mouseCoordinates;
  }

  dragEdge(draggedEdge?: IEdge, mouse: typeof d3.mouse) {
    const { nodeSize, nodeKey } = this.props;

    draggedEdge = draggedEdge || this.state.draggedEdge;

    if (!draggedEdge) {
      return;
    }

    const mouseCoordinates = this.getMouseCoordinates(mouse);
    const targetPosition = {
      x: mouseCoordinates[0],
      y: mouseCoordinates[1],
    };

    const off = calculateOffset(
      nodeSize,
      (this.getNodeById(draggedEdge.source): any).node,
      targetPosition,
      nodeKey
    );

    targetPosition.x += off.xOff;
    targetPosition.y += off.yOff;
    this.syncRenderEdge({ source: draggedEdge.source, targetPosition });
    this.setState({
      draggedEdge,
      draggingEdge: true,
    });
  }

  // View 'zoom' handler
  handleZoom = (event: any) => {
    const { draggingEdge } = this.state;
    const transform: IViewTransform = event.transform;

    if (!draggingEdge) {
      d3.select(this.view).attr('transform', transform);

      // prevent re-rendering on zoom
      if (this.state.viewTransform !== transform) {
        this.setState(
          {
            viewTransform: transform,
            draggedEdge: null,
            draggingEdge: false,
          },
          () => {
            // force the child components which are related to zoom level to update
            this.renderGraphControls();
          }
        );
      }
    } else if (draggingEdge) {
      this.dragEdge(undefined, d3.mouse);

      return false;
    }
  };

  handleZoomEnd = () => {
    const { draggingEdge, draggedEdge, edgeEndNode } = this.state;

    const { nodeKey, onSwapEdge } = this.props;

    if (!draggingEdge || !draggedEdge) {
      if (draggingEdge && !draggedEdge) {
        // This is a bad case, sometimes when the graph loses focus while an edge
        // is being created it doesn't set draggingEdge to false. This fixes that case.
        this.endDragEdge();
      }

      return;
    }

    // Zoom start events also handle edge clicks. We need to determine if an edge
    // was clicked and deal with that scenario.
    const draggedEdgeCopy = { ...this.state.draggedEdge };

    // remove custom edge
    this.removeCustomEdge();
    this.endDragEdge(undefined, () => {
      // handle creating or swapping edges
      const sourceNodeById = this.getNodeById(draggedEdge.source);
      const targetNodeById = this.getNodeById(draggedEdge.target);

      if (!sourceNodeById || !targetNodeById) {
        return;
      }

      const sourceNode = sourceNodeById.node;

      if (
        edgeEndNode &&
        !this.getEdgeBySourceTarget(draggedEdge.source, edgeEndNode[nodeKey]) &&
        this.canSwap(sourceNode, edgeEndNode, draggedEdge)
      ) {
        // determine the target node and update the edge
        draggedEdgeCopy.target = edgeEndNode[nodeKey];
        this.syncRenderEdge(draggedEdgeCopy);

        if (onSwapEdge) {
          onSwapEdge(sourceNodeById.node, edgeEndNode, draggedEdge);
        }
      } else {
        // this resets the dragged edge back to its original position.
        this.syncRenderEdge(draggedEdge);
      }
    });
  };

  // Zooms to contents of this.refs.entities
  handleZoomToFit = () => {
    const entities = d3.select(this.entities).node();

    if (!entities) {
      return;
    }

    const viewBBox = entities.getBBox ? entities.getBBox() : null;

    if (!viewBBox) {
      return;
    }

    this.handleZoomToFitImpl(viewBBox, this.props.zoomDur);
  };

  handleZoomToFitImpl = (viewBBox: IBBox, zoomDur: number = 0) => {
    if (!this.viewWrapper.current) {
      return;
    }

    const parent = d3.select(this.viewWrapper.current).node();
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

    this.setZoom(next.k, next.x, next.y, zoomDur);
  };

  // Updates current viewTransform with some delta
  modifyZoom = (
    modK: number = 0,
    modX: number = 0,
    modY: number = 0,
    dur: number = 0
  ) => {
    const parent = d3.select(this.viewWrapper.current).node();
    const center = {
      x: parent.clientWidth / 2,
      y: parent.clientHeight / 2,
    };
    const extent = this.zoom.scaleExtent();
    const viewTransform: any = this.state.viewTransform;

    const next = {
      k: viewTransform.k,
      x: viewTransform.x,
      y: viewTransform.y,
    };

    const targetZoom = next.k * (1 + modK);

    next.k = targetZoom;

    if (targetZoom < extent[0] || targetZoom > extent[1]) {
      return false;
    }

    const translate0 = {
      x: (center.x - next.x) / next.k,
      y: (center.y - next.y) / next.k,
    };

    const l = {
      x: translate0.x * next.k + next.x,
      y: translate0.y * next.k + next.y,
    };

    next.x += center.x - l.x + modX;
    next.y += center.y - l.y + modY;
    this.setZoom(next.k, next.x, next.y, dur);

    return true;
  };

  // Programmatically resets zoom
  setZoom(k: number = 1, x: number = 0, y: number = 0, dur: number = 0) {
    const t = d3.zoomIdentity.translate(x, y).scale(k);

    d3.select(this.viewWrapper.current)
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

  isNodeSelected = (node: INode) => {
    const { nodeKey, selected } = this.props;

    return !!selected?.nodes?.has(node[nodeKey]);
  };

  isEdgeSelected = (edge: IEdge) => {
    const { selected } = this.props;
    const edgeID = `${edge.source}_${edge.target}`;

    return !!selected?.edges?.has(edgeID);
  };

  getNodeComponent = (id: string, node: INode) => {
    const {
      nodeTypes,
      nodeSubtypes,
      nodeSize,
      nodeHeight,
      nodeWidth,
      renderNode,
      renderNodeText,
      nodeKey,
      maxTitleChars,
      centerNodeOnMove,
    } = this.props;

    return (
      <Node
        key={id}
        id={id}
        data={node}
        nodeTypes={nodeTypes}
        nodeSize={nodeSize}
        nodeWidth={nodeWidth}
        nodeHeight={nodeHeight}
        nodeKey={nodeKey}
        nodeSubtypes={nodeSubtypes}
        onNodeMouseEnter={this.handleNodeMouseEnter}
        onNodeMouseLeave={this.handleNodeMouseLeave}
        onNodeMove={this.handleNodeMove}
        onNodeUpdate={this.handleNodeUpdate}
        onNodeSelected={this.handleNodeSelected}
        renderNode={renderNode}
        renderNodeText={renderNodeText}
        isSelected={this.isNodeSelected(node)}
        layoutEngine={this.layoutEngine}
        viewWrapperElem={this.viewWrapper.current}
        centerNodeOnMove={centerNodeOnMove}
        maxTitleChars={maxTitleChars}
      />
    );
  };

  renderNodes = () => {
    if (!this.entities) {
      return;
    }

    this.state.nodes.forEach((node, i) => {
      this.asyncRenderNode(node);
    });
  };

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

  renderNode(id: string, element: Element) {
    if (!this.entities) {
      return null;
    }

    const containerId = `${id}-container`;

    let nodeContainer:
      | HTMLElement
      | Element
      | null = this.viewWrapper.current.querySelector(`[id='${containerId}']`);

    if (!nodeContainer) {
      nodeContainer = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'g'
      );
      nodeContainer.id = containerId;
      this.entities.appendChild(nodeContainer);
    }

    // ReactDOM.render replaces the insides of an element This renders the element
    // into the nodeContainer
    const anyElement: any = element;

    ReactDOM.render(anyElement, nodeContainer);
  }

  renderConnectedEdgesFromNode(
    node: INodeMapNode,
    nodeMoving: boolean = false
  ) {
    if (this.state.draggingEdge) {
      return;
    }

    node.incomingEdges.forEach(edge => {
      this.asyncRenderEdge(edge, nodeMoving);
    });
    node.outgoingEdges.forEach(edge => {
      this.asyncRenderEdge(edge, nodeMoving);
    });
  }

  getEdgeComponent = (edge: IEdge | any) => {
    const { rotateEdgeHandle } = this.props;
    const sourceNodeMapNode = this.getNodeById(edge.source);
    const sourceNode = sourceNodeMapNode?.node;
    const targetNodeMapNode = this.getNodeById(edge.target);
    const targetNode = targetNodeMapNode?.node;
    const targetPosition = edge.targetPosition;
    const { edgeTypes, edgeHandleSize, nodeSize, nodeKey } = this.props;

    if (!sourceNode || (!targetNode && !edge.targetPosition)) {
      return null;
    }

    return (
      <Edge
        data={edge}
        edgeTypes={edgeTypes}
        edgeHandleSize={edgeHandleSize}
        nodeSize={nodeSize}
        // $FlowFixMe - This is handled in the above return
        sourceNode={sourceNode}
        // $FlowFixMe - This is handled in the above return
        targetNode={targetNode || targetPosition}
        nodeKey={nodeKey}
        viewWrapperElem={this.viewWrapper.current}
        isSelected={this.isEdgeSelected(edge)}
        rotateEdgeHandle={rotateEdgeHandle}
        isBeingDragged={!!targetPosition}
      />
    );
  };

  renderEdge = (
    id: string,
    element: any,
    edge: IEdge,
    nodeMoving: boolean = false
  ) => {
    if (!this.entities) {
      return null;
    }

    let containerId = `${id}-container`;
    const customContainerId = `${id}-custom-container`;
    const { draggedEdge } = this.state;
    const { afterRenderEdge } = this.props;
    let edgeContainer = this.viewWrapper.current.querySelector(
      `[id='${containerId}']`
    );

    if (nodeMoving && edgeContainer) {
      edgeContainer.style.display = 'none';
      containerId = `${id}-custom-container`;
      edgeContainer = this.viewWrapper.current.querySelector(
        `[id='${containerId}']`
      );
    } else if (edgeContainer) {
      const customContainer = this.viewWrapper.current.querySelector(
        `[id='${customContainerId}']`
      );

      edgeContainer.style.display = '';

      if (customContainer) {
        customContainer.remove();
      }
    }

    if (!edgeContainer && edge !== draggedEdge) {
      const newSvgEdgeContainer = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'g'
      );

      newSvgEdgeContainer.id = containerId;
      this.entities.appendChild(newSvgEdgeContainer);
      edgeContainer = newSvgEdgeContainer;
    }

    // ReactDOM.render replaces the insides of an element This renders the element
    // into the edgeContainer
    if (edgeContainer) {
      ReactDOM.render(element, edgeContainer);

      if (afterRenderEdge) {
        return afterRenderEdge(
          id,
          element,
          edge,
          edgeContainer,
          this.isEdgeSelected(edge)
        );
      }
    }
  };

  asyncRenderEdge = (edge: IEdge, nodeMoving: boolean = false) => {
    if (edge.source == null || edge.target == null) {
      return;
    }

    const timeoutId = `edges-${edge.source}-${edge.target}`;

    cancelAnimationFrame(this.edgeTimeouts[timeoutId]);
    this.edgeTimeouts[timeoutId] = requestAnimationFrame(() => {
      this.syncRenderEdge(edge, nodeMoving);
    });
  };

  syncRenderEdge(edge: IEdge | any, nodeMoving: boolean = false) {
    if (edge.source == null) {
      return;
    }

    // We have to use the 'custom' id when we're drawing a new node
    const idVar =
      edge.target != null ? `${edge.source}-${edge.target}` : 'custom';
    const id = `edge-${idVar}`;
    const element = this.getEdgeComponent(edge);

    this.renderEdge(id, element, edge, nodeMoving);
  }

  renderEdges = () => {
    const { edges, draggingEdge } = this.state;

    if (!this.entities || draggingEdge) {
      return;
    }

    for (let i = 0; i < edges.length; i++) {
      this.asyncRenderEdge(edges[i]);
    }
  };

  /*
   * GraphControls is a special child component. To maximize responsiveness we disable
   * rendering on zoom level changes, but this component still needs to update.
   * This function ensures that it updates into the container quickly upon zoom changes
   * without causing a full GraphView render.
   */
  renderGraphControls() {
    const {
      showGraphControls,
      minZoom,
      maxZoom,
      allowMultiselect,
    } = this.props;
    const { viewTransform } = this.state;

    if (!showGraphControls || !this.graphControlsWrapper) {
      return;
    }

    ReactDOM.render(
      <GraphControls
        minZoom={minZoom}
        maxZoom={maxZoom}
        zoomLevel={viewTransform ? viewTransform.k : 1}
        zoomToFit={this.handleZoomToFit}
        modifyZoom={this.modifyZoom}
        allowMultiselect={allowMultiselect}
      />,
      this.graphControlsWrapper
    );
  }

  render() {
    const {
      edgeArrowSize,
      gridSpacing,
      gridDotSize,
      nodeTypes,
      nodeSubtypes,
      edgeTypes,
      showGraphControls,
      renderDefs,
      gridSize,
      backgroundFillId,
      renderBackground,
    } = this.props;

    const { selectionStart, selectionEnd } = this.state;

    return (
      <div className="view-wrapper" ref={this.viewWrapper}>
        <svg
          className="graph"
          ref={this.graphSvg}
          xmlns="http://www.w3.org/2000/svg"
        >
          <Defs
            edgeArrowSize={edgeArrowSize}
            gridSpacing={gridSpacing}
            gridDotSize={gridDotSize}
            nodeTypes={nodeTypes}
            nodeSubtypes={nodeSubtypes}
            edgeTypes={edgeTypes}
            renderDefs={renderDefs}
          />
          <g className="view" ref={el => (this.view = el)}>
            <Background
              gridSize={gridSize}
              backgroundFillId={backgroundFillId}
              renderBackground={renderBackground}
            />

            <g className="entities" ref={el => (this.entities = el)} />
            {selectionStart && (
              <HighlightArea
                ref={this.highlightAreaRef}
                startPoint={selectionStart}
                endPoint={selectionEnd}
              />
            )}
          </g>
        </svg>
        {showGraphControls && (
          <div
            id="react-digraph-graph-controls-wrapper"
            ref={el => (this.graphControlsWrapper = el)}
            className="graph-controls-wrapper"
          />
        )}
      </div>
    );
  }

  /* Imperative API */
  panToEntity(entity: IEdge | INode, zoom: boolean) {
    const { viewTransform } = this.state;
    const parent = this.viewWrapper.current;
    const entityBBox = entity ? entity.getBBox() : null;
    const maxZoom = this.props.maxZoom || 2;

    if (!parent || !entityBBox) {
      return;
    }

    const width = parent.clientWidth;
    const height = parent.clientHeight;

    const next = {
      k: viewTransform ? viewTransform.k : 0,
      x: 0,
      y: 0,
    };

    const x = entityBBox.x + entityBBox.width / 2;
    const y = entityBBox.y + entityBBox.height / 2;

    if (zoom) {
      next.k =
        0.9 / Math.max(entityBBox.width / width, entityBBox.height / height);

      if (next.k > maxZoom) {
        next.k = maxZoom;
      }
    }

    next.x = width / 2 - next.k * x;
    next.y = height / 2 - next.k * y;

    this.setZoom(next.k, next.x, next.y, this.props.zoomDur);
  }

  panToNode(id: string, zoom?: boolean = false) {
    if (!this.entities) {
      return;
    }

    const node = this.entities.querySelector(`[id='node-${id}-container']`);

    this.panToEntity(node, zoom);
  }

  panToEdge(source: string, target: string, zoom?: boolean = false) {
    if (!this.entities) {
      return;
    }

    const edge = this.entities.querySelector(
      `[id='edge-${source}-${target}-container']`
    );

    this.panToEntity(edge, zoom);
  }
}

export default GraphView;
