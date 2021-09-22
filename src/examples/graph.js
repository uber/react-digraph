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

/*
  Example usage of GraphView component
*/

import * as React from 'react';

import {
  GraphView,
  type IEdgeType as IEdge,
  type INodeType as INode,
  type LayoutEngineType,
  type SelectionT,
  type IPoint,
} from '../';
import GraphConfig, {
  edgeTypes,
  EMPTY_EDGE_TYPE,
  EMPTY_TYPE,
  NODE_KEY,
  nodeTypes,
  COMPLEX_CIRCLE_TYPE,
  POLY_TYPE,
  SPECIAL_CHILD_SUBTYPE,
  SPECIAL_EDGE_TYPE,
  SPECIAL_TYPE,
  SKINNY_TYPE,
} from './graph-config'; // Configures node/edge types

type IGraph = {
  nodes: INode[],
  edges: IEdge[],
};

// NOTE: Edges must have 'source' & 'target' attributes
// In a more realistic use case, the graph would probably originate
// elsewhere in the App or be generated from some other state upstream of this component.
const sample: IGraph = {
  edges: [
    {
      handleText: '5',
      handleTooltipText: '5',
      source: 'start1',
      target: 'a1',
      type: SPECIAL_EDGE_TYPE,
    },
    {
      handleText: '5',
      handleTooltipText: 'This edge connects Node A and Node B',
      source: 'a1',
      target: 'a2',
      type: SPECIAL_EDGE_TYPE,
    },
    {
      handleText: '54',
      source: 'a2',
      target: 'a4',
      type: EMPTY_EDGE_TYPE,
    },
    {
      handleText: '54',
      source: 'a1',
      target: 'a3',
      type: EMPTY_EDGE_TYPE,
    },
    {
      handleText: '54',
      source: 'a3',
      target: 'a4',
      type: EMPTY_EDGE_TYPE,
    },
    {
      handleText: '54',
      source: 'a1',
      target: 'a5',
      type: EMPTY_EDGE_TYPE,
    },
    {
      handleText: '54',
      source: 'a4',
      target: 'a1',
      type: EMPTY_EDGE_TYPE,
    },
    {
      handleText: '54',
      source: 'a1',
      target: 'a6',
      type: EMPTY_EDGE_TYPE,
    },
    {
      handleText: '24',
      source: 'a1',
      target: 'a7',
      type: EMPTY_EDGE_TYPE,
    },
  ],
  nodes: [
    {
      id: 'start1',
      title: 'Start (0)',
      type: SPECIAL_TYPE,
    },
    {
      id: 'a1',
      title: 'Node A (1)',
      type: SPECIAL_TYPE,
      x: 258.3976135253906,
      y: 331.9783248901367,
    },
    {
      id: 'a2',
      subtype: SPECIAL_CHILD_SUBTYPE,
      title: 'Node B (2)',
      type: EMPTY_TYPE,
      x: 593.9393920898438,
      y: 260.6060791015625,
    },
    {
      id: 'a3',
      title: 'Node C (3)',
      type: EMPTY_TYPE,
      x: 237.5757598876953,
      y: 61.81818389892578,
    },
    {
      id: 'a4',
      title: 'Node D (4)',
      type: EMPTY_TYPE,
      x: 600.5757598876953,
      y: 600.81818389892578,
    },
    {
      id: 'a5',
      title: 'Node E (5)',
      type: null,
      x: 50.5757598876953,
      y: 500.81818389892578,
    },
    {
      id: 'a6',
      title: 'Node E (6)',
      type: SKINNY_TYPE,
      x: 300,
      y: 600,
    },
    {
      id: 'a7',
      title: 'Node F (7)',
      type: POLY_TYPE,
      x: 0,
      y: 300,
    },
    {
      id: 'a8',
      title: 'Node G (8)',
      type: COMPLEX_CIRCLE_TYPE,
      x: -200,
      y: 400,
    },
  ],
};

function generateSample(totalNodes) {
  const generatedSample: IGraph = {
    edges: [],
    nodes: [],
  };
  let y = 0;
  let x = 0;

  const numNodes = totalNodes ? totalNodes : 0;

  // generate large array of nodes
  // These loops are fast enough. 1000 nodes = .45ms + .34ms
  // 2000 nodes = .86ms + .68ms
  // implying a linear relationship with number of nodes.
  for (let i = 1; i <= numNodes; i++) {
    if (i % 20 === 0) {
      y++;
      x = 0;
    } else {
      x++;
    }

    generatedSample.nodes.push({
      id: `a${i}`,
      title: `Node ${i}`,
      type: nodeTypes[Math.floor(nodeTypes.length * Math.random())],
      x: 0 + 200 * x,
      y: 0 + 200 * y,
    });
  }
  // link each node to another node
  for (let i = 1; i < numNodes; i++) {
    generatedSample.edges.push({
      source: `a${i}`,
      target: `a${i + 1}`,
      type: edgeTypes[Math.floor(edgeTypes.length * Math.random())],
    });
  }

  return generatedSample;
}

type IGraphProps = {};

type IGraphState = {
  graph: any,
  selected: any,
  selected: SelectionT | null,
  totalNodes: number,
  copiedNode: null | INode,
  copiedNodes: null | INode[],
  copiedEdges: null | IEdge[],
  layoutEngineType?: LayoutEngineType,
  allowMultiselect: boolean,
  locationOverrides?: Object,
};

class Graph extends React.Component<IGraphProps, IGraphState> {
  GraphView: any;

  constructor(props: IGraphProps) {
    super(props);

    this.state = {
      copiedNode: null,
      copiedNodes: null,
      copiedEdges: null,
      graph: sample,
      layoutEngineType: undefined,
      selected: null,
      selectedNodes: null,
      selectedEdges: null,
      totalNodes: sample.nodes.length,
      allowMultiselect: true,
      locationOverrides: {},
    };

    this.GraphView = React.createRef();
  }

  // Helper to find the index of a given node
  getNodeIndex(searchNode: INode | any) {
    return this.state.graph.nodes.findIndex(node => {
      return node[NODE_KEY] === searchNode[NODE_KEY];
    });
  }

  // Helper to find the index of a given edge
  getEdgeIndex(searchEdge: IEdge) {
    return this.state.graph.edges.findIndex(edge => {
      return (
        edge.source === searchEdge.source && edge.target === searchEdge.target
      );
    });
  }

  // Given a nodeKey, return the corresponding node
  getViewNode(nodeKey: string) {
    const searchNode = {};

    searchNode[NODE_KEY] = nodeKey;
    const i = this.getNodeIndex(searchNode);

    return this.state.graph.nodes[i];
  }

  makeItLarge = () => {
    const graph = this.state.graph;
    const generatedSample = generateSample(this.state.totalNodes);

    graph.nodes = generatedSample.nodes;
    graph.edges = generatedSample.edges;
    this.setState(this.state);
  };

  addStartNode = () => {
    const graph = this.state.graph;

    // using a new array like this creates a new memory reference
    // this will force a re-render
    graph.nodes = [
      {
        id: Date.now(),
        title: 'Node A',
        type: SPECIAL_TYPE,
        x: 0,
        y: 0,
      },
      ...this.state.graph.nodes,
    ];
    this.setState({
      graph,
    });
  };
  deleteStartNode = () => {
    const graph = this.state.graph;

    graph.nodes.splice(0, 1);
    // using a new array like this creates a new memory reference
    // this will force a re-render
    graph.nodes = [...this.state.graph.nodes];
    this.setState({
      graph,
    });
  };

  handleChange = (event: any) => {
    this.setState(
      {
        totalNodes: parseInt(event.target.value || '0', 10),
      },
      this.makeItLarge
    );
  };

  /*
   * Handlers/Interaction
   */

  // Called by 'drag' handler, etc..
  // to sync updates from D3 with the graph
  onUpdateNode = (
    viewNode: INode,
    selectedNodes: Map<string, INode>,
    position?: Object
  ) => {
    const graph = this.state.graph;
    const i = this.getNodeIndex(viewNode);
    const overrides = {
      ...this.state.locationOverrides,
      [viewNode.id]: position,
    };

    graph.nodes[i] = viewNode;
    this.setState({ graph, locationOverrides: overrides });
  };

  onSelect = (selected: SelectionT) => {
    this.setState({
      selected,
    });
  };

  // Updates the graph with a new node
  onCreateNode = (x: number, y: number) => {
    const graph = this.state.graph;

    // This is just an example - any sort of logic
    // could be used here to determine node type
    // There is also support for subtypes. (see 'sample' above)
    // The subtype geometry will underlay the 'type' geometry for a node
    const type = Math.random() < 0.25 ? SPECIAL_TYPE : EMPTY_TYPE;

    const viewNode = {
      id: Date.now(),
      title: '',
      type,
      x,
      y,
    };

    graph.nodes = [...graph.nodes, viewNode];
    this.setState({ graph });
  };

  // Deletes a node from the graph
  onDeleteNode = (viewNode: INode, nodeId: string, nodeArr: INode[]) => {
    // Note: onDeleteEdge is also called from react-digraph for connected nodes
    const graph = this.state.graph;

    graph.nodes = nodeArr;

    this.deleteEdgesForNode(nodeId);

    this.setState({ graph, selected: null });
  };

  // Whenever a node is deleted the consumer must delete any connected edges.
  // react-digraph won't call deleteEdge for multi-selected edges, only single edge selections.
  deleteEdgesForNode(nodeID: string) {
    const { graph } = this.state;
    const edgesToDelete = graph.edges.filter(
      edge => edge.source === nodeID || edge.target === nodeID
    );

    const newEdges = graph.edges.filter(
      edge => edge.source !== nodeID && edge.target !== nodeID
    );

    edgesToDelete.forEach(edge => {
      this.onDeleteEdge(edge, newEdges);
    });
  }

  // Creates a new node between two edges
  onCreateEdge = (sourceViewNode: INode, targetViewNode: INode) => {
    const graph = this.state.graph;
    // This is just an example - any sort of logic
    // could be used here to determine edge type
    const type =
      sourceViewNode.type === SPECIAL_TYPE
        ? SPECIAL_EDGE_TYPE
        : EMPTY_EDGE_TYPE;

    const viewEdge = {
      source: sourceViewNode[NODE_KEY],
      target: targetViewNode[NODE_KEY],
      type,
    };

    // Only add the edge when the source node is not the same as the target
    if (viewEdge.source !== viewEdge.target) {
      graph.edges = [...graph.edges, viewEdge];
      this.setState({
        graph,
        selected: {
          nodes: null,
          edges: new Map([[`${viewEdge.source}_${viewEdge.target}`, viewEdge]]),
        },
      });
    }
  };

  // Called when an edge is reattached to a different target.
  onSwapEdge = (
    sourceViewNode: INode,
    targetViewNode: INode,
    viewEdge: IEdge
  ) => {
    const graph = this.state.graph;
    const i = this.getEdgeIndex(viewEdge);
    const edge = JSON.parse(JSON.stringify(graph.edges[i]));

    edge.source = sourceViewNode[NODE_KEY];
    edge.target = targetViewNode[NODE_KEY];
    graph.edges[i] = edge;
    // reassign the array reference if you want the graph to re-render a swapped edge
    graph.edges = [...graph.edges];

    this.setState({
      graph,
      selected: edge,
    });
  };

  // Called when an edge is deleted
  onDeleteEdge = (viewEdge: IEdge, edges: IEdge[]) => {
    const graph = this.state.graph;

    graph.edges = edges;
    this.setState({
      graph,
      selected: null,
    });
  };

  onUndo = () => {
    // Not implemented
    console.warn('Undo is not currently implemented in the example.');
    // Normally any add, remove, or update would record the action in an array.
    // In order to undo it one would simply call the inverse of the action performed. For instance, if someone
    // called onDeleteEdge with (viewEdge, i, edges) then an undelete would be a splicing the original viewEdge
    // into the edges array at position i.
  };

  onCopySelected = () => {
    // This is a no-op. Maybe log something if you want.
    // Pasting uses the state.selected property within the onPasteSelected function.
  };

  // Pastes the selection to mouse position
  onPasteSelected = (selection?: SelectionT | null, mousePosition?: IPoint) => {
    const { graph, selected } = this.state;
    const { x: mouseX, y: mouseY } = mousePosition || { x: 0, y: 0 };

    if (!selected?.nodes?.size) {
      // do nothing if there are no nodes selected
      return;
    }

    let cornerX;
    let cornerY;

    selected?.nodes?.forEach((copiedNode: INode) => {
      // find left-most node and record x position
      if (cornerX == null || (copiedNode.x || 0) < cornerX) {
        cornerX = copiedNode.x || 0;
      }

      // find top-most node and record y position
      if (cornerY == null || (copiedNode.y || 0) < cornerY) {
        cornerY = copiedNode.y || 0;
      }
    });

    // Keep track of the mapping of old IDs to new IDs
    // so we can recreate the edges
    const newIDs = {};

    // Every node position is relative to the top and left-most corner
    const newNodes = new Map(
      [...(selected?.nodes?.values() || [])].map((copiedNode: INode) => {
        const x = mouseX + ((copiedNode.x || 0) - cornerX);
        const y = mouseY + ((copiedNode.y || 0) - cornerY);

        // Here you would usually create a new node using an API
        // We don't have an API, so we'll mock out the node ID
        // and create a copied node.
        const id = `${copiedNode.id}_${Date.now()}`;

        newIDs[copiedNode.id] = id;

        return [
          id,
          {
            ...copiedNode,
            id,
            x,
            y,
          },
        ];
      })
    );

    const newEdges = new Map(
      [...(selected?.edges?.values() || [])].map(copiedEdge => {
        const source = newIDs[copiedEdge.source];
        const target = newIDs[copiedEdge.target];

        return [
          `${source}_${target}`,
          {
            ...copiedEdge,
            source,
            target,
          },
        ];
      })
    );

    graph.nodes = [...graph.nodes, ...Array.from(newNodes.values())];
    graph.edges = [...graph.edges, ...Array.from(newEdges.values())];

    // Select the new nodes and edges
    this.setState({
      selected: {
        nodes: newNodes,
        edges: newEdges,
      },
    });
  };

  handleChangeLayoutEngineType = (event: any) => {
    const value: any = event.target.value;
    const layoutEngineType: LayoutEngineType = value;

    this.setState({
      layoutEngineType,
    });
  };

  onSelectPanNode = (event: any) => {
    if (this.GraphView) {
      this.GraphView.panToNode(event.target.value, true);
    }
  };

  /*
   * Render
   */

  render() {
    const { nodes, edges } = this.state.graph;
    const { selected, allowMultiselect, layoutEngineType } = this.state;
    const { NodeTypes, NodeSubtypes, EdgeTypes } = GraphConfig;

    return (
      <>
        <div className="graph-header">
          <button onClick={this.addStartNode}>Add Node</button>
          <button onClick={this.deleteStartNode}>Delete Node</button>
          <input
            className="total-nodes"
            type="number"
            onBlur={this.handleChange}
            placeholder={this.state.totalNodes.toString()}
          />
          <div className="layout-engine">
            <span>Layout Engine:</span>
            <select
              name="layout-engine-type"
              onChange={this.handleChangeLayoutEngineType}
            >
              <option value={undefined}>None</option>
              <option value={'SnapToGrid'}>Snap to Grid</option>
              <option value={'VerticalTree'}>Vertical Tree</option>
              <option value={'HorizontalTree'}>Horizontal Tree</option>
            </select>
          </div>
          <div className="pan-list">
            <span>Pan To:</span>
            <select onChange={this.onSelectPanNode}>
              {nodes.map(node => (
                <option key={node[NODE_KEY]} value={node[NODE_KEY]}>
                  {node.title}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div id="graph" style={{ height: 'calc(100% - 87px)' }}>
          <GraphView
            ref={el => (this.GraphView = el)}
            allowMultiselect={allowMultiselect}
            nodeKey={NODE_KEY}
            nodes={nodes}
            edges={edges}
            selected={selected}
            nodeTypes={NodeTypes}
            nodeSubtypes={NodeSubtypes}
            edgeTypes={EdgeTypes}
            onSelect={this.onSelect}
            onCreateNode={this.onCreateNode}
            onUpdateNode={this.onUpdateNode}
            onDeleteNode={this.onDeleteNode}
            onCreateEdge={this.onCreateEdge}
            onSwapEdge={this.onSwapEdge}
            onDeleteEdge={this.onDeleteEdge}
            onUndo={this.onUndo}
            onCopySelected={this.onCopySelected}
            onPasteSelected={this.onPasteSelected}
            layoutEngineType={layoutEngineType}
            nodeLocationOverrides={this.state.locationOverrides}
          />
        </div>
      </>
    );
  }
}

export default Graph;
