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
import 'brace';
import 'brace/ext/searchbox';
import 'brace/mode/json';
import 'brace/theme/monokai';
import { type IEdge } from '../../components/edge';
import GraphView from '../../components/graph-view';
import { type INode } from '../../components/node';
import { type LayoutEngineType } from '../../utilities/layout-engine/layout-engine-types';

import FlowV1Transformer from '../../utilities/transformers/flow-v1-transformer';
import Sidebar from '../sidebar';
import GraphConfig, { CHOICE_TYPE, NODE_KEY } from './bwdl-config'; // Configures node/edge types
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

const indexNameRegex = /"index": "(.*)",/;
const nodeStartLineRegex = /^ {8}"question": {/;
const nodeEndLineRegex = /^ {4}}/;

class BwdlEditable extends React.Component<{}, IBwdlState> {
  GraphView: GraphView | null;

  constructor(props: any) {
    super(props);

    const transformed = FlowV1Transformer.transform(bwdlExample);

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
        isString: null,
        isDefault: true,
        answers: {},
        containsAny: [],
        context: {},
        greaterThan: null,
        inArray: [],
        isNotString: null,
        lessThan: null,
        notInArray: [],
        setContext: {},
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

  scrollToLine = node => {
    const nodeIndex = this.state.bwdlText.indexOf(`"index": "${node.title}"`);
    const lineNumber = this.state.bwdlText.substring(0, nodeIndex).split('\n')
      .length;

    this.state.editor.gotoLine(lineNumber);
  };

  onSelectNode = (node: INode | null) => {
    this.setState({
      selected: node,
    });

    if (this.state.locked) {
      this.scrollToLine(node);
    }
  };

  onCreateNode = (x: number, y: number) => {
    const newBwdlJson = {
      ...this.state.bwdlJson,
    };

    newBwdlJson.States[`New Item ${Date.now()}`] = {
      Type: CHOICE_TYPE,
      Choices: [],
      text: '',
      immediateNext: false,
      options: [],
      start: false,
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
    const transformed = FlowV1Transformer.transform(this.state.bwdlJson);

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

  handleChangeLayoutEngineType = (event: any) => {
    this.setState({
      layoutEngineType: (event.target.value: LayoutEngineType | 'None'),
    });
  };

  handleToggleLock = e => {
    this.setState({ locked: !this.state.locked });
  };

  nodeIndexForRow = row => {
    const lines = this.state.bwdlText.split('\n');
    const findStartIndex = lines
      .slice(0, row)
      .reverse()
      .findIndex(line => nodeStartLineRegex.test(line));

    if (findStartIndex === -1) {
      return -1;
    }

    const nodeStartRow = row - findStartIndex;
    const findEndIndex = lines
      .slice(row)
      .findIndex(line => nodeEndLineRegex.test(line));

    if (findEndIndex === -1) {
      return -1;
    }

    const nodeEndRow = row + findEndIndex;
    const indexLine = lines
      .slice(nodeStartRow, nodeEndRow)
      .find(l => l.includes(`"index": "`));

    const match = indexNameRegex.exec(indexLine);

    return match[1];
  };

  handleCursorChanged = selection => {
    if (this.state.locked) {
      const nodeIndex = this.nodeIndexForRow(selection.getCursor().row);

      if (nodeIndex !== -1) {
        this.GraphView.panToNode(nodeIndex);

        const node = this.state.nodes.find(node => node.title === nodeIndex);

        this.setState({
          selected: node,
        });
      }
    }
  };

  onload = editor => this.setState({ editor: editor });

  renderSidebar() {
    return (
      <Sidebar
        direction="left"
        size={'100%'}
        locked={this.state.locked}
        onLockChanged={this.handleToggleLock}
      >
        <div>
          <AceEditor
            mode="json"
            theme="monokai"
            onChange={this.handleTextAreaChange}
            name="bwdl-editor"
            width="100%"
            height="100%"
            fontSize={10}
            editorProps={{ $blockScrolling: true }}
            highlightActiveLine={true}
            onLoad={this.onload}
            onCursorChange={this.handleCursorChanged}
            showPrintMargin={true}
            showGutter={true}
            setOptions={{
              showLineNumbers: true,
              tabSize: 2,
            }}
            value={this.state.bwdlText}
            wrapEnabled={true}
          />
        </div>
      </Sidebar>
    );
  }

  renderGraph() {
    const { nodes, edges, selected } = this.state;
    const { NodeTypes, NodeSubtypes, EdgeTypes } = GraphConfig;

    return (
      <div>
        <div className="layout-engine">
          <span>Layout Engine:</span>
          <select
            name="layout-engine-type"
            onChange={this.handleChangeLayoutEngineType}
            value={this.state.layoutEngineType}
          >
            <option value={undefined}>None</option>
            <option value={'SnapToGrid'}>Snap to Grid</option>
            <option value={'VerticalTree'}>Vertical Tree</option>
            <option value={'HorizontalTree'}>Horizontal Tree</option>
          </select>
        </div>
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
      </div>
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
