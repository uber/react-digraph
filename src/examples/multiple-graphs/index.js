// @flow

/*
  Example usage of GraphView component
*/

import * as React from 'react';
import { GraphView } from '../../';
import GraphConfig, { NODE_KEY } from './graph-config'; // Configures node/edge types
import sample1 from './graph1-sample';
import sample2 from './graph2-sample';

type IGraphProps = {};
type IGraphState = {
  selectedNode: any,
  selectedNode2: any,
  sample1: any,
  sample2: any,
};

class MultipleGraphs extends React.Component<IGraphProps, IGraphState> {
  GraphViewRef;

  constructor(props: IGraphProps) {
    super(props);
    this.GraphViewRef = React.createRef();
    this.state = {
      selectedNode: null,
      selectedNode2: null,
      sample1: sample1,
      sample2: sample2,
    };
  }

  onDeleteNode = (
    viewNode: INode,
    nodeId: string,
    nodeArr: INode[],
    configVar: any,
    stateKey: string
  ) => {
    // Delete any connected edges
    const newEdges = configVar.edges.filter((edge, i) => {
      return (
        edge.source !== viewNode[NODE_KEY] && edge.target !== viewNode[NODE_KEY]
      );
    });

    configVar.nodes = nodeArr;
    configVar.edges = newEdges;
    this.setState({
      [stateKey]: configVar,
    });
  };

  /*
   * Render
   */

  render() {
    const { sample1, sample2 } = this.state;
    const { nodes: graph1Nodes, edges: graph1Edges } = sample1;
    const { nodes: graph2Nodes, edges: graph2Edges } = sample2;
    const { NodeTypes, NodeSubtypes, EdgeTypes } = GraphConfig;

    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'auto auto',
          height: 'calc(100% - 36px)',
          gridColumnGap: '2px',
          backgroundColor: '#000',
        }}
      >
        <div id="graph1">
          <GraphView
            ref={el => (this.GraphViewRef = el)}
            nodeKey={NODE_KEY}
            nodes={graph1Nodes}
            edges={graph1Edges}
            selected={this.state.selectedNode}
            nodeTypes={NodeTypes}
            nodeSubtypes={NodeSubtypes}
            edgeTypes={EdgeTypes}
            readOnly={false}
            onSelectNode={node => {
              this.setState({ selectedNode: node });
            }}
            onCreateNode={() => {}}
            onUpdateNode={() => {}}
            onDeleteNode={(selected, nodeId, nodeArr) => {
              this.onDeleteNode(selected, nodeId, nodeArr, sample1, 'sample1');
            }}
            onSelectEdge={() => {}}
            onCreateEdge={() => {}}
            onSwapEdge={() => {}}
            onDeleteEdge={() => {}}
          />
        </div>
        <div id="graph2">
          <GraphView
            ref={el => (this.GraphViewRef = el)}
            nodeKey={NODE_KEY}
            nodes={graph2Nodes}
            edges={graph2Edges}
            selected={this.state.selectedNode2}
            nodeTypes={NodeTypes}
            nodeSubtypes={NodeSubtypes}
            edgeTypes={EdgeTypes}
            readOnly={false}
            onSelectNode={node => {
              this.setState({ selectedNode2: node });
            }}
            onCreateNode={() => {}}
            onUpdateNode={() => {}}
            onDeleteNode={(selected, nodeId, nodeArr) => {
              this.onDeleteNode(selected, nodeId, nodeArr, sample2, 'sample2');
            }}
            onSelectEdge={() => {}}
            onCreateEdge={() => {}}
            onSwapEdge={() => {}}
            onDeleteEdge={() => {}}
          />
        </div>
      </div>
    );
  }
}

export default MultipleGraphs;
