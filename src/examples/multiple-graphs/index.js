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
import { GraphView } from '../../';
import GraphConfig, { NODE_KEY } from './graph-config'; // Configures node/edge types
import sample1 from './graph1-sample';
import sample2 from './graph2-sample';

type IGraphProps = {};
type IGraphState = {};

class Graph extends React.Component<IGraphProps, IGraphState> {
  GraphViewRef;

  constructor(props: IGraphProps) {
    super(props);
    this.GraphViewRef = React.createRef();
  }

  /*
   * Render
   */

  render() {
    const { nodes: graph1Nodes, edges: graph1Edges } = sample1;
    const { nodes: graph2Nodes, edges: graph2Edges } = sample2;
    const { NodeTypes, NodeSubtypes, EdgeTypes } = GraphConfig;

    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'auto auto',
          height: 'calc(100% - 25px)',
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
            selected={null}
            nodeTypes={NodeTypes}
            nodeSubtypes={NodeSubtypes}
            edgeTypes={EdgeTypes}
            readOnly={false}
            onSelectNode={() => {}}
            onCreateNode={() => {}}
            onUpdateNode={() => {}}
            onDeleteNode={() => {}}
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
            selected={null}
            nodeTypes={NodeTypes}
            nodeSubtypes={NodeSubtypes}
            edgeTypes={EdgeTypes}
            readOnly={false}
            onSelectNode={() => {}}
            onCreateNode={() => {}}
            onUpdateNode={() => {}}
            onDeleteNode={() => {}}
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

export default Graph;
