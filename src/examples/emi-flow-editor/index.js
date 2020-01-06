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

const defaultQuestionStr = 'generic_yes_no_v2';
const empathyDefaults = {
  phone: {
    lang: 'ES',
    country: 'AR',
  },
  best_match_no_retry: {
    lang: 'ES',
    prediction_data: {
      min_similarity: 90,
      options: {}, // keys will be added for the answer options
    },
  },
  best_match: {
    lang: 'ES',
    prediction_data: {
      min_similarity: 90,
      options: {}, // keys will be added for the answer options
    },
  },
  dates: {
    lang: 'ES',
    country: 'AR',
  },
  prepa: {
    lang: 'ES',
    prediction_data: {
      intent_responses: {
        'prepa-completa': 'Completa',
        'prepa-en-curso': 'En Curso',
        'prepa-sin-inicio': 'No la inicié',
        'prepa-trunca': 'Trunca',
      },
    },
  },
  salary: {
    lang: 'ES',
    country: 'AR',
    prediction_data: {},
  },
  secondary_v2: {
    lang: 'ES',
    prediction_data: {
      intent_responses: {
        secondary_abandoned: 'No lo terminé',
        secondary_finished: 'Terminado',
        secondary_in_progress: 'Lo estoy cursando',
      },
    },
  },
  nickname: {
    lang: 'ES',
    country: 'AR',
  },
  duration: {
    lang: 'ES',
    country: 'AR',
  },
  generic_yes_no_v2: {
    lang: 'ES',
    prediction_data: {
      intent_responses: {
        generic_yes_no_y: 'Si',
        generic_yes_no_n: 'No',
        generic_yes_no_maybe: 'No se',
      },
    },
  },
  welcome_idle: 'welcome_idle',
  interest_v2: {
    lang: 'ES',
    prediction_data: {
      intent_responses: {
        'interest-yes': 'Está OK',
        'interest-no': 'No me interesa',
        'interest-another-time': 'Otro día/fecha',
        'interest-ask-address': 'Está OK',
      },
    },
  },
  schedule_v2: {
    lang: 'ES',
  },
  sentiment: {
    lang: 'ES',
    country: 'AR',
  },
  time_interval: {
    lang: 'ES',
    country: 'AR',
  },
  datetime: {
    lang: 'ES',
    country: 'AR',
  },
};

function stringify(bwdlJson) {
  return JSON.stringify(bwdlJson, null, 2);
}

class BwdlEditable extends React.Component<{}, IBwdlState> {
  GraphView: GraphView | null;

  constructor(props: any) {
    super(props);

    const transformed = FlowV1Transformer.transform(bwdlExample);

    this.state = {
      bwdlJson: bwdlExample,
      bwdlText: stringify(bwdlExample),
      copiedNode: null,
      edges: transformed.edges,
      layoutEngineType: 'VerticalTree',
      nodes: transformed.nodes,
      selected: null,
      locked: true,
    };
  }

  linkEdge(sourceNode: INode, targetNode: INode, edge?: IEdge) {
    if (targetNode.first) {
      // cannot link to first node.
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
      bwdlText: stringify(newBwdlJson),
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

    const index = `node-${Date.now()}`;

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
      bwdlText: stringify(newBwdlJson),
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
      bwdlText: stringify(newBwdlJson),
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
        bwdlText: stringify(newBwdlJson),
        selected: null,
      });
    });
  };

  onUndo() {
    alert('Undo is not supported yet.');
  }

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
      bwdlText: stringify(newBwdlJson),
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

  handleIndexChanged = e => {
    const newIndex = e.target.value;

    const alreadyExists = this.state.nodes.find(
      node => node.gnode.question.index === newIndex
    );

    if (alreadyExists || ['name', 'current', 'faqs'].includes(newIndex)) {
      return;
    }

    this.setState(prevState => {
      const newBwdlJson = {
        ...prevState.bwdlJson,
      };
      const selected = { ...prevState.selected };
      const prevIndex = selected.gnode.question.index;
      const nodeJson = newBwdlJson[prevIndex];

      delete newBwdlJson[prevIndex];

      nodeJson.question.index = newIndex;

      newBwdlJson[newIndex] = nodeJson;

      if (newBwdlJson.current === prevIndex) {
        newBwdlJson.current = newIndex;
      }

      const nodeNames = Object.keys(newBwdlJson);

      nodeNames.forEach(name => {
        const currentNode = newBwdlJson[name];

        if (!currentNode || ['name', 'current', 'faqs'].includes(name)) {
          return;
        }

        const q = currentNode.question;

        // create edges
        q.connections.forEach(connection => {
          if (connection.goto === prevIndex) {
            connection.goto = newIndex;
          }
        });
      });

      // selected.title = newIndex;
      // selected.gnode.question.index = newIndex;

      return this.updateNodesFromBwdl({
        bwdlJson: newBwdlJson,
        bwdlText: stringify(newBwdlJson),
        // selected,
      });
    });
  };

  handleQuestionChange = (property, newValue) => {
    this.changeSelectedNode(
      (newBwdlJson, index) => (newBwdlJson[index].question[property] = newValue)
    );
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
        bwdlText: stringify(newBwdlJson),
      });
    });
  };

  handleQuickRepliesChange = newValue => {
    this.changeSelectedNode((newBwdlJson, index) => {
      newBwdlJson[index].question.quickReplies = newValue;

      if (newValue.length == 0) {
        newBwdlJson[index].question.exactMatch = false;
      }
    });
  };

  setAiDefaults = (nodeJson, newQuestionStr) => {
    nodeJson.ai = Object.assign(
      { question_str: newQuestionStr },
      JSON.parse(JSON.stringify(empathyDefaults[newQuestionStr]))
    );

    const prediction_data = nodeJson.ai.prediction_data;

    if (prediction_data && 'options' in prediction_data) {
      nodeJson.question.quickReplies.forEach(function(quickReply) {
        prediction_data.options[quickReply] = [];
      });
    }
  };

  handleAIChange = aiEnabled => {
    this.changeSelectedNode((newBwdlJson, index) => {
      if (aiEnabled) {
        this.setAiDefaults(newBwdlJson[index], defaultQuestionStr);
      } else {
        delete newBwdlJson[index].ai;
      }
    });
  };

  handleAiQuestionStrChange = item => {
    this.changeSelectedNode((newBwdlJson, index) =>
      this.setAiDefaults(newBwdlJson[index], item.value)
    );
  };

  handlePredictionDataOptionsChange = (key, newValue) => {
    this.changeSelectedNode(
      (newBwdlJson, index) =>
        (newBwdlJson[index].ai.prediction_data.options[key] = newValue)
    );
  };

  handleLangChange = item => {
    this.changeSelectedNode(
      (newBwdlJson, index) => (newBwdlJson[index].ai.lang = item.value)
    );
  };

  handleMinSimilarityChange = newValue => {
    if (newValue !== '' && (newValue > 100 || newValue < 1)) {
      return;
    }

    this.changeSelectedNode(
      (newBwdlJson, index) =>
        (newBwdlJson[index].ai.prediction_data.min_similarity = newValue)
    );
  };

  handleIntentResponseChange = (key, newValue) => {
    this.changeSelectedNode(
      (newBwdlJson, index) =>
        (newBwdlJson[index].ai.prediction_data.intent_responses[key] = newValue)
    );
  };

  handleImmediateNextChange = newValue => {
    this.changeSelectedNode((newBwdlJson, index) => {
      if (newValue) {
        newBwdlJson[index].question.options = [];
        newBwdlJson[index].question.exactMatch = false;
        newBwdlJson[index].question.errorMessageNotMatch = '';

        if ('ai' in newBwdlJson[index]) {
          delete newBwdlJson[index].ai;
        }
      }

      newBwdlJson[index].question.immediateNext = newValue;
    });
  };

  handleCountryChange = item => {
    this.changeSelectedNode(
      (newBwdlJson, index) => (newBwdlJson[index].ai.country = item.value)
    );
  };

  handleMakeFirst = () => {
    const index = this.state.selected.gnode.question.index;

    // make sure that selected node is a root node
    const nodeNames = Object.keys(this.state.bwdlJson);
    const firstable = nodeNames.every(name => {
      const currentNode = this.state.bwdlJson[name];

      if (!currentNode || ['name', 'current', 'faqs'].includes(name)) {
        return true;
      }

      const q = currentNode.question;

      return q.connections.every(connection => connection.goto !== index);
    });

    if (!firstable) {
      return;
    }

    this.changeSelectedNode(
      (newBwdlJson, index) => (newBwdlJson['current'] = index)
    );
  };

  changeSelectedConn = f => {
    const index = this.state.selected.sourceNode.gnode.question.index;
    const targetIndex = this.state.selected.targetNode.gnode.question.index;

    this.setState(prevState => {
      const newBwdlJson = {
        ...prevState.bwdlJson,
      };
      const conns = newBwdlJson[index].question.connections;
      const conn = conns.find(conn => conn.goto === targetIndex);

      f(conn, conns, newBwdlJson, index, targetIndex);

      return this.updateNodesFromBwdl({
        bwdlJson: newBwdlJson,
        bwdlText: stringify(newBwdlJson),
      });
    });
  };

  handleConnChange = (connProperty, newValue) => {
    this.changeSelectedConn(conn => (conn[connProperty] = newValue));
  };

  handleConnMakeDefault = enabling => {
    this.changeSelectedConn((conn, conns) => {
      if (enabling) {
        const defaultConn = conns.find(conn => conn.isDefault);

        if (defaultConn) {
          defaultConn.isDefault = false;
        }
      }

      conn['isDefault'] = enabling;
    });
  };

  getAncestorIndexes = (index, edgeCallback) => {
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

  getPrevIndexes = () => this.getAncestorIndexes(this.state.selected.source);

  getPrevContextVars = () => {
    const vars = new Set();

    this.getAncestorIndexes(this.state.selected.source, edge => {
      Object.keys(edge.conn.setContext).forEach(vars.add, vars);
    });

    return Array.from(vars);
  };

  handleChangeArrayFilterValue = (connProperty, key, op, value) => {
    this.changeSelectedConn(conn => {
      key = `${key}_${op}`;
      conn[connProperty][key] = value;
    });
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
        {this.renderTextEditor()}
        <div className="graph-container">{this.renderGraph()}</div>
        <div id="rightBar">
          <NodeEditor
            onChangeIndex={this.handleIndexChanged}
            onChangeQuestion={this.handleQuestionChange}
            onChangeQuickReplies={this.handleQuickRepliesChange}
            onChangeAI={this.handleAIChange}
            onChangeAiQuestionStr={this.handleAiQuestionStrChange}
            onChangePredictionDataOptions={
              this.handlePredictionDataOptionsChange
            }
            onChangeLang={this.handleLangChange}
            onChangeMinSimilarity={this.handleMinSimilarityChange}
            onChangeIntentResponse={this.handleIntentResponseChange}
            onChangeImmediateNext={this.handleImmediateNextChange}
            onChangeCountry={this.handleCountryChange}
            onMakeFirst={this.handleMakeFirst}
            onChangeConn={this.handleConnChange}
            onMakeDefaultConn={this.handleConnMakeDefault}
            getPrevIndexes={this.getPrevIndexes}
            getPrevContextVars={this.getPrevContextVars}
            onChangeArrayFilterValue={this.handleChangeArrayFilterValue}
          >
            {this.state.selected}
          </NodeEditor>
        </div>
      </div>
    );
  }
}

export default BwdlEditable;
