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
import GraphConfig, { EMPTY_TYPE, NODE_KEY } from './bwdl-config'; // Configures node/edge types
import bwdlExample from './bwdl-example-data';

type IBwdlState = {
  nodes: INode[],
  edges: IEdge[],
  selected: INode | IEdge | null,
  layoutEngineType: LayoutEngineType,
  bwdlText: string,
  bwdlJson: any,
  copiedNode: any,
};

class BwdlEditable extends React.Component<{}, IBwdlState> {
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
    };
  }

  linkEdge(sourceNode: INode, targetNode: INode, edge?: IEdge) {
    const newBwdlJson = {
      ...this.state.bwdlJson,
    };
    const sourceNodeBwdl = newBwdlJson.States[sourceNode.title];

    if (sourceNodeBwdl.Type === 'Choice') {
      const newChoice = {
        Next: targetNode.title,
      };

      if (sourceNodeBwdl.Choices) {
        // check if swapping edge
        let swapped = false;

        if (edge) {
          sourceNodeBwdl.Choices.forEach(choice => {
            if (edge && choice.Next === edge.target) {
              choice.Next = targetNode.title;
              swapped = true;
            }
          });
        }

        if (!swapped) {
          sourceNodeBwdl.Choices.push(newChoice);
        }
      } else {
        sourceNodeBwdl.Choices = [newChoice];
      }
    } else {
      sourceNodeBwdl.Next = targetNode.title;
    }

    this.setState({
      bwdlJson: newBwdlJson,
      bwdlText: JSON.stringify(newBwdlJson, null, 2),
    });
    this.updateBwdl();
  }

  onSelectNode = (node: INode | null) => {
    this.setState({
      selected: node,
    });
  };

  onCreateNode = (x: number, y: number) => {
    const newBwdlJson = {
      ...this.state.bwdlJson,
    };

    newBwdlJson.States[`New Item ${Date.now()}`] = {
      Type: EMPTY_TYPE,
      x,
      y,
    };
    this.setState({
      bwdlJson: newBwdlJson,
      bwdlText: JSON.stringify(newBwdlJson, null, 2),
    });
    this.updateBwdl();
  };
  onUpdateNode = (node: INode) => {
    return;
  };

  onDeleteNode = (selected: INode, nodeId: string, nodes: any[]) => {
    const newBwdlJson = {
      ...this.state.bwdlJson,
    };

    delete newBwdlJson.States[selected.title];
    this.setState({
      bwdlJson: newBwdlJson,
      bwdlText: JSON.stringify(newBwdlJson, null, 2),
    });
    this.updateBwdl();
  };

  onSelectEdge = (edge: IEdge) => {
    this.setState({
      selected: edge,
    });
  };

  onCreateEdge = (sourceNode: INode, targetNode: INode) => {
    this.linkEdge(sourceNode, targetNode);
  };

  onSwapEdge = (sourceNode: INode, targetNode: INode, edge: IEdge) => {
    this.linkEdge(sourceNode, targetNode, edge);
  };

  onDeleteEdge = (selectedEdge: IEdge, edges: IEdge[]) => {
    const newBwdlJson = {
      ...this.state.bwdlJson,
    };
    const sourceNodeBwdl = newBwdlJson.States[selectedEdge.source];

    if (sourceNodeBwdl.Choices) {
      sourceNodeBwdl.Choices = sourceNodeBwdl.Choices.filter(choice => {
        return choice.Next !== selectedEdge.target;
      });
    } else {
      delete sourceNodeBwdl.Next;
    }

    this.setState({
      bwdlJson: newBwdlJson,
      bwdlText: JSON.stringify(newBwdlJson, null, 2),
    });
    this.updateBwdl();
  };

  onUndo() {
    alert('Undo is not supported yet.');
  }

  onCopySelected = () => {
    const { selected, bwdlJson } = this.state;

    if (!selected) {
      return;
    }

    const original = bwdlJson.States[selected.title];
    const newItem = JSON.parse(JSON.stringify(original));

    this.setState({
      copiedNode: newItem,
    });
  };

  onPasteSelected = () => {
    const { copiedNode, bwdlJson } = this.state;

    bwdlJson.States[`New Item ${Date.now()}`] = copiedNode;

    const newBwdlJson = {
      ...bwdlJson,
    };

    this.setState({
      bwdlJson: newBwdlJson,
      bwdlText: JSON.stringify(newBwdlJson, null, 2),
    });
    this.updateBwdl();
  };

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

  renderSidebar() {
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

  renderGraph() {
    const { nodes, edges, selected } = this.state;
    const { NodeTypes, NodeSubtypes, EdgeTypes } = GraphConfig;

    return (
      <GraphView
        ref={el => (this.GraphView = el)}
        nodeKey={NODE_KEY}
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
        onUndo={this.onUndo}
        onCopySelected={this.onCopySelected}
        onPasteSelected={this.onPasteSelected}
        layoutEngineType={this.state.layoutEngineType}
      />
    );
  }

  render() {
    return (
      <div id="bwdl-editable-graph">
        {this.renderSidebar()}
        <div className="graph-container">{this.renderGraph()}</div>
      </div>
    );
  }
}

export default BwdlEditable;
