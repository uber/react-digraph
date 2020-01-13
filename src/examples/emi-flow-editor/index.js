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
import NodeEditor from './components';
import GraphConfig, { CHOICE_TYPE, NODE_KEY } from './bwdl-config'; // Configures node/edge types
import bwdlExample from './bwdl-example-data';
import getServerHandlers from './handlers/server-handlers';
import getAiHandlers from './handlers/ai-handlers';
import getEdgeHandlers from './handlers/edge-handlers';
import getQuestionHandlers from './handlers/question-handlers';

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
const nodeStartLineRegex = /^ {2}"((?!faqs).)*": {/;
const nodeEndLineRegex = /^ {2}}/;

const connsStartLineRegex = /^ {6}"connections": \[/;
const connsEndLineRegex = /^ {6}]/;

const connStartLineRegex = /^ {8}{/;
const connEndLineRegex = /^ {8}}/;
const gotoIndexRegex = /"goto": "(.*)",/;

const makeid = function(length) {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
};

class BwdlEditable extends React.Component<{}, IBwdlState> {
  GraphView: GraphView | null;

  constructor(props: any) {
    super(props);

    const transformed = FlowV1Transformer.transform(bwdlExample);

    this.state = {
      bwdlJson: bwdlExample,
      bwdlText: this.stringify(bwdlExample),
      copiedNode: null,
      edges: transformed.edges,
      layoutEngineType: 'VerticalTree',
      nodes: transformed.nodes,
      selected: null,
      locked: true,
    };
  }

  stringify = bwdlJson => JSON.stringify(bwdlJson, null, 2);

  linkEdge(sourceNode: INode, targetNode: INode, edge?: IEdge) {
    if (
      targetNode.first &&
      !this.getAncestorIndexes(sourceNode.title).includes(targetNode.title)
    ) {
      // cannot link to first node, unless it's a loop.
      return;
    }

    const newBwdlJson = {
      ...this.state.bwdlJson,
    };
    const sourceNodeBwdl = newBwdlJson[sourceNode.title];
    const isDefault = sourceNodeBwdl.question.connections.every(
      conn => !conn.isDefault
    );

    if (sourceNodeBwdl.Type === 'Choice') {
      const newConnection = {
        goto: targetNode.title,
        isString: '',
        isDefault: isDefault,
        answers: {},
        containsAny: [],
        context: {},
        greaterThan: '',
        inArray: [],
        isNotString: '',
        lessThan: '',
        notInArray: [],
        setContext: {},
        nlp: {},
      };

      const connections = sourceNodeBwdl.question.connections;

      if (connections) {
        // check if swapping edge
        let swapped = false;

        if (edge) {
          connections.forEach(connection => {
            if (edge && connection.goto === edge.target) {
              connection.goto = targetNode.title;
              swapped = true;
            }
          });
        }

        if (!swapped) {
          connections.push(newConnection);
        }
      } else {
        sourceNodeBwdl.question.connections = [newConnection];
      }
    } else {
      sourceNodeBwdl.goto = targetNode.title;
    }

    this.setState({
      bwdlJson: newBwdlJson,
      bwdlText: this.stringify(newBwdlJson),
    });
    this.updateBwdl();
  }

  scrollToLine = node => {
    const nodeIndex = this.state.bwdlText.indexOf(`"index": "${node.title}"`);
    const lineNumber = this.state.bwdlText.substring(0, nodeIndex).split('\n')
      .length;

    this.state.editor.gotoLine(lineNumber);
  };

  scrollToLineEdge = edge => {
    const nodeIndex = this.state.bwdlText.indexOf(`  "${edge.source}"`);

    const gotoIndex = this.state.bwdlText
      .substr(nodeIndex)
      .indexOf(`"goto": "${edge.target}"`);
    const lineNumber = this.state.bwdlText
      .substring(0, nodeIndex + gotoIndex)
      .split('\n').length;

    this.state.editor.gotoLine(lineNumber);
  };

  onSelectNode = (node: INode | null) => {
    this.setState({
      selected: node,
    });

    if (node !== null && this.state.locked) {
      this.scrollToLine(node);
    }
  };

  onCreateNode = (x: number, y: number) => {
    const newBwdlJson = {
      ...this.state.bwdlJson,
    };

    const index = `node-${makeid(4)}`;

    newBwdlJson[index] = {
      // id: index,
      Type: CHOICE_TYPE,
      question: {
        errorMessageNotMatch: '',
        exactMatch: false,
        index: index,
        connections: [],
        text: '',
        immediateNext: false,
        isAudio: false,
        audioErrorMessage: '',
        quickReplies: [],
      },
      x,
      y,
    };

    if (!('current' in newBwdlJson)) {
      newBwdlJson['current'] = index;
    }

    this.setState({
      bwdlJson: newBwdlJson,
      bwdlText: this.stringify(newBwdlJson),
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

    if (selected.first) {
      if (this.state.nodes.length > 1) {
        // cannot delete first node without picking a new first one
        return;
      }

      delete newBwdlJson['current'];
    }

    delete newBwdlJson[selected.title];
    this.setState({
      bwdlJson: newBwdlJson,
      bwdlText: this.stringify(newBwdlJson),
    });
    this.updateBwdl();
  };

  onSelectEdge = (edge: IEdge) => {
    edge.targetNode = this.state.nodes.find(node => node.title === edge.target);
    this.setState({
      selected: edge,
    });

    if (edge !== null && this.state.locked) {
      this.scrollToLineEdge(edge);
    }
  };

  onCreateEdge = (sourceNode: INode, targetNode: INode) => {
    this.linkEdge(sourceNode, targetNode);
  };

  onSwapEdge = (sourceNode: INode, targetNode: INode, edge: IEdge) => {
    this.linkEdge(sourceNode, targetNode, edge);
  };

  onDeleteEdge = (selectedEdge: IEdge, edges: IEdge[]) => {
    this.setState(prevState => {
      const newBwdlJson = {
        ...prevState.bwdlJson,
      };

      const sourceNodeBwdl = newBwdlJson[selectedEdge.source];

      const connections = sourceNodeBwdl.question.connections;

      // if (connections) {
      sourceNodeBwdl.question.connections = connections.filter(connection => {
        return connection.goto !== selectedEdge.target;
      });
      // } else {
      //   delete sourceNodeBwdl.Next;
      // }

      return this.updateNodesFromBwdl({
        bwdlJson: newBwdlJson,
        bwdlText: this.stringify(newBwdlJson),
        selected: null,
      });
    });
  };

  onUndo = () => this.state.editor.undo();

  onRedo = () => this.state.editor.redo();

  onCopySelected = () => {
    const { selected, bwdlJson } = this.state;

    if (!selected) {
      return;
    }

    const original = bwdlJson[selected.title];
    const newItem = JSON.parse(JSON.stringify(original));

    this.setState({
      copiedNode: newItem,
    });
  };

  onPasteSelected = () => {
    const { copiedNode, bwdlJson } = this.state;

    bwdlJson[`new-node${Date.now()}`] = copiedNode;

    const newBwdlJson = {
      ...bwdlJson,
    };

    this.setState({
      bwdlJson: newBwdlJson,
      bwdlText: this.stringify(newBwdlJson),
    });
    this.updateBwdl();
  };

  getNewStateWithUpdatedSelected = (newState, transformed) => {
    if (this.state.selected && this.state.selected.gnode) {
      const selected = transformed.nodes.find(
        node =>
          node.gnode.question.index === this.state.selected.gnode.question.index
      );

      newState = Object.assign({}, newState, { selected });
    }

    return newState;
  };

  updateBwdl = () => {
    const transformed = FlowV1Transformer.transform(this.state.bwdlJson);
    const newState = this.getNewStateWithUpdatedSelected({}, transformed);

    this.setState(
      Object.assign({}, newState, {
        edges: transformed.edges,
        nodes: transformed.nodes,
      })
    );
  };

  updateNodesFromBwdl = newState => {
    const transformed = FlowV1Transformer.transform(newState.bwdlJson);

    newState = this.getNewStateWithUpdatedSelected(newState, transformed);

    return Object.assign({}, newState, {
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

  extractTextFromBlock = (
    row,
    blockStartRegex,
    blockEndRegex,
    lineIncludes,
    lineExtractRegex
  ) => {
    const lines = this.state.bwdlText.split('\n');
    const findStartIndex = lines
      .slice(0, row + 1)
      .reverse()
      .findIndex(line => blockStartRegex.test(line));

    if (findStartIndex === -1) {
      return -1;
    }

    const nodeStartRow = row - findStartIndex;
    const findEndIndex = lines
      .slice(row)
      .findIndex(line => blockEndRegex.test(line));

    if (findEndIndex === -1) {
      return -1;
    }

    const nodeEndRow = row + findEndIndex;
    const indexLine = lines
      .slice(nodeStartRow, nodeEndRow)
      .find(l => l.includes(lineIncludes));

    const match = lineExtractRegex.exec(indexLine);

    return match[1];
  };

  nodeIndexForRow = row => {
    return this.extractTextFromBlock(
      row,
      nodeStartLineRegex,
      nodeEndLineRegex,
      `"index": "`,
      indexNameRegex
    );
  };

  gotoIndexForRow = row => {
    const lines = this.state.bwdlText.split('\n');
    const prevLines = lines.slice(0, row).reverse();
    const findStartIndex = prevLines.findIndex(line =>
      connsStartLineRegex.test(line)
    );

    if (findStartIndex === -1) {
      return -1;
    }

    const findEndIndex = prevLines.findIndex(line =>
      connsEndLineRegex.test(line)
    );

    if (findEndIndex != -1 && findEndIndex < findStartIndex) {
      return -1;
    }

    // inside connections block
    return this.extractTextFromBlock(
      row,
      connStartLineRegex,
      connEndLineRegex,
      `"goto": "`,
      gotoIndexRegex
    );
  };

  updateSelectedFromBwdl = () => {
    if (!this.state.selected) {
      return;
    }

    const selected = this.state.nodes.find(
      node => node.index === this.state.selected.index
    );

    this.setState({
      selected,
    });
  };

  handleCursorChanged = selection => {
    if (this.state.locked && this.GraphView) {
      const nodeIndex = this.nodeIndexForRow(selection.getCursor().row);

      if (nodeIndex !== -1) {
        let selected = null;
        const gotoIndex = this.gotoIndexForRow(selection.getCursor().row);

        if (gotoIndex !== -1) {
          this.GraphView.panToEdge(nodeIndex, gotoIndex);
          selected = this.state.edges.find(
            edge => edge.source == nodeIndex && edge.target == gotoIndex
          );
          selected.targetNode = this.state.nodes.find(
            node => node.title === gotoIndex
          );
        } else {
          this.GraphView.panToNode(nodeIndex);
          selected = this.state.nodes.find(node => node.title === nodeIndex);
        }

        this.setState({
          selected: selected,
        });
      }
    }
  };

  onload = editor => {
    editor.setAutoScrollEditorIntoView(true);
    this.setState({ editor: editor });
  };

  changeSelectedNode = f => {
    const index = this.state.selected.gnode.question.index;

    this.setState(prevState => {
      const newBwdlJson = {
        ...prevState.bwdlJson,
      };

      f(newBwdlJson, index);

      return this.updateNodesFromBwdl({
        bwdlJson: newBwdlJson,
        bwdlText: this.stringify(newBwdlJson),
      });
    });
  };

  getAncestorIndexes = function(index, edgeCallback) {
    const ancestorIndexes = new Set();

    let prevSize = -1;

    while (ancestorIndexes.size > prevSize) {
      prevSize = ancestorIndexes.size;
      this.state.edges.forEach(edge => {
        if (ancestorIndexes.has(edge.target) || edge.target === index) {
          ancestorIndexes.add(edge.source);

          if (edgeCallback) {
            edgeCallback(edge);
          }
        }
      });
    }

    return Array.from(ancestorIndexes);
  };

  renderTextEditor() {
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
            editorProps={{ $blockScrolling: Infinity }}
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
          onRedo={this.onRedo}
          onCopySelected={this.onCopySelected}
          onPasteSelected={this.onPasteSelected}
          layoutEngineType={this.state.layoutEngineType}
        />
      </div>
    );
  }

  render() {
    const questionHandlers = getQuestionHandlers(this);

    return (
      <div id="bwdl-editable-graph">
        {this.renderTextEditor()}
        <div className="graph-container">{this.renderGraph()}</div>
        <div id="rightBar">
          <NodeEditor
            onChangeIndex={questionHandlers.onChangeIndex}
            onChangeImmediateNext={questionHandlers.onChangeImmediateNext}
            onMakeFirst={questionHandlers.onMakeFirst}
            onChangeQuestion={questionHandlers.onChangeQuestion}
            onChangeQuickReplies={questionHandlers.onChangeQuickReplies}
            aiHandlers={getAiHandlers(this)}
            serverHandlers={getServerHandlers(this)}
            edgeHandlers={getEdgeHandlers(this)}
          >
            {this.state.selected}
          </NodeEditor>
        </div>
      </div>
    );
  }
}

export default BwdlEditable;
