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

import * as React from 'react';
import AceEditor from 'react-ace';
import 'brace/mode/json';
import 'brace/theme/monokai';
import { type IEdge } from '../../components/edge';
import GraphView from '../../components/graph-view';
import { type INode } from '../../components/node';
import { type LayoutEngineType } from '../../utilities/layout-engine/layout-engine-types';
import BwdlTransformer from '../../utilities/transformers/bwdl-transformer';
import Sidebar from '../sidebar';
import GraphConfig, { NODE_KEY } from './bwdl-config'; // Configures node/edge types
import bwdlExample from './bwdl-example-data';
import BwdlNodeForm from './bwdl-node-form';

type IBwdlState = {
  nodes: INode[],
  edges: IEdge[],
  selected: INode | IEdge | null,
  layoutEngineType: LayoutEngineType,
  bwdlText: string,
  bwdlJson: any,
  copiedNode: any,
  selectedBwdlNode: any,
};

class Bwdl extends React.Component<{}, IBwdlState> {
  GraphView: GraphView | null;

  constructor(props: any) {
    super(props);

    const transformed = BwdlTransformer.transform(bwdlExample);

    this.state = {
      bwdlJson: bwdlExample,
      bwdlText: JSON.stringify(bwdlExample, null, 2),
      copiedNode: null,
      edges: transformed.edges,
      layoutEngineType: 'VerticalTree',
      nodes: transformed.nodes,
      selected: null,
      selectedBwdlNode: null,
    };
  }

  updateBwdl = () => {
    const transformed = BwdlTransformer.transform(this.state.bwdlJson);

    this.setState({
      edges: transformed.edges,
      nodes: transformed.nodes,
    });
  };

  handleTextAreaChange = (value: string, event: any) => {
    let input = null;
    const bwdlText = value;

    this.setState({
      bwdlText,
    });

    try {
      input = JSON.parse(bwdlText);
    } catch (e) {
      return;
    }

    this.setState({
      bwdlJson: input,
    });

    this.updateBwdl();
  };

  onSelectNode = (node: INode | null) => {
    this.setState({
      selected: node,
      selectedBwdlNode: node ? this.state.bwdlJson.States[node.title] : null,
    });
  };

  onCreateNode = () => {
    return;
  };
  onUpdateNode = () => {
    return;
  };
  onDeleteNode = () => {
    return;
  };
  onSelectEdge = () => {
    return;
  };
  onCreateEdge = () => {
    return;
  };
  onSwapEdge = () => {
    return;
  };
  onDeleteEdge = () => {
    return;
  };

  renderLeftSidebar() {
    return (
      <Sidebar direction="left" size={'100%'}>
        <div>
          <AceEditor
            mode="json"
            theme="monokai"
            onChange={this.handleTextAreaChange}
            name="bwdl-editor"
            width="100%"
            height="100%"
            fontSize={14}
            editorProps={{ $blockScrolling: true }}
            highlightActiveLine={true}
            showPrintMargin={true}
            showGutter={true}
            setOptions={{
              showLineNumbers: true,
              tabSize: 2,
            }}
            value={this.state.bwdlText}
          />
        </div>
      </Sidebar>
    );
  }

  renderRightSidebar() {
    if (!this.state.selected) {
      return null;
    }

    return (
      <Sidebar direction="right" size="100%">
        <div className="selected-node-container">
          <BwdlNodeForm
            bwdlNode={this.state.selectedBwdlNode}
            bwdlNodeKey={this.state.selected.title}
            nextChoices={Object.keys(this.state.bwdlJson.States)}
          />
        </div>
      </Sidebar>
    );
  }

  renderGraph() {
    const { nodes, edges, selected } = this.state;
    const { NodeTypes, NodeSubtypes, EdgeTypes } = GraphConfig;

    return (
      <GraphView
        ref={el => (this.GraphView = el)}
        nodeKey={NODE_KEY}
        readOnly={false}
        nodes={nodes}
        edges={edges}
        selected={selected}
        nodeTypes={NodeTypes}
        nodeSubtypes={NodeSubtypes}
        edgeTypes={EdgeTypes}
        onSelectNode={this.onSelectNode}
        onCreateNode={this.onCreateNode}
        onUpdateNode={this.onUpdateNode}
        onDeleteNode={this.onDeleteNode}
        onSelectEdge={this.onSelectEdge}
        onCreateEdge={this.onCreateEdge}
        onSwapEdge={this.onSwapEdge}
        onDeleteEdge={this.onDeleteEdge}
        layoutEngineType={this.state.layoutEngineType}
      />
    );
  }

  render() {
    return (
      <div id="bwdl-graph">
        {this.renderLeftSidebar()}
        <div className="graph-container">{this.renderGraph()}</div>
        {this.state.selected && this.renderRightSidebar()}
      </div>
    );
  }
}

export default Bwdl;
